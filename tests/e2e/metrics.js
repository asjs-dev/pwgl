const TRACKED_CALLS = [
  "createBuffer",
  "deleteBuffer",
  "bindBuffer",
  "bufferData",
  "bufferSubData",
  "createShader",
  "compileShader",
  "createProgram",
  "linkProgram",
  "useProgram",
  "createVertexArray",
  "deleteVertexArray",
  "bindVertexArray",
  "enableVertexAttribArray",
  "vertexAttribPointer",
  "vertexAttribDivisor",
  "drawArrays",
  "drawArraysInstanced",
  "drawElements",
  "drawElementsInstanced",
  "createTexture",
  "activeTexture",
  "bindTexture",
  "texImage2D",
  "texSubImage2D",
  "texParameteri",
  "generateMipmap",
  "uniform1i",
  "uniform1iv",
  "uniform2fv",
];

const DRAW_CALLS = ["drawArrays", "drawArraysInstanced", "drawElements", "drawElementsInstanced"];
const metricsByContext = new WeakMap();
const instrumentedContexts = new WeakSet();

const createCounts = () => Object.fromEntries(TRACKED_CALLS.map((name) => [name, 0]));

const getUploadByteLength = (name, args) => {
  const data = args[name === "bufferData" ? 1 : 2];
  if (typeof data === "number") return data;
  if (!ArrayBuffer.isView(data)) return data?.byteLength || 0;

  const offsetIndex = name === "bufferData" ? 3 : 3;
  const lengthIndex = name === "bufferData" ? 4 : 4;
  const bytesPerElement = data.BYTES_PER_ELEMENT || 1;
  const offset = args[offsetIndex] || 0;
  const length = args[lengthIndex];
  return (length === undefined ? data.length - offset : length) * bytesPerElement;
};

const createMetrics = () => ({
  counts: createCounts(),
  bufferDataBytes: 0,
  bufferSubDataBytes: 0,
  unavailable: [],
  snapshot() {
    return {
      counts: { ...this.counts },
      bufferDataBytes: this.bufferDataBytes,
      bufferSubDataBytes: this.bufferSubDataBytes,
    };
  },
  difference(snapshot) {
    const counts = createCounts();
    TRACKED_CALLS.forEach((name) => (counts[name] = this.counts[name] - snapshot.counts[name]));
    return {
      counts,
      bufferDataBytes: this.bufferDataBytes - snapshot.bufferDataBytes,
      bufferSubDataBytes: this.bufferSubDataBytes - snapshot.bufferSubDataBytes,
      drawCalls: DRAW_CALLS.reduce((total, name) => total + counts[name], 0),
    };
  },
});

export const instrumentContext = (context) => {
  let metrics = metricsByContext.get(context);
  if (!metrics) {
    metrics = createMetrics();
    metricsByContext.set(context, metrics);
  }

  const { gl } = context;
  if (instrumentedContexts.has(gl)) return metrics;
  instrumentedContexts.add(gl);

  TRACKED_CALLS.forEach((name) => {
    const original = gl[name];
    if (typeof original !== "function") {
      metrics.unavailable.push(name);
      return;
    }

    try {
      Object.defineProperty(gl, name, {
        configurable: true,
        value(...args) {
          metrics.counts[name]++;
          if (name === "bufferData") metrics.bufferDataBytes += getUploadByteLength(name, args);
          else if (name === "bufferSubData") metrics.bufferSubDataBytes += getUploadByteLength(name, args);
          return Reflect.apply(original, gl, args);
        },
      });
    } catch {
      metrics.unavailable.push(name);
    }
  });

  return metrics;
};

export const getContextMetrics = (context) => metricsByContext.get(context) || instrumentContext(context);

export const captureFrame = (context) => {
  const { gl, canvas } = context;
  const framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  return pixels;
};

export const compareFrames = (baseline, pixels) => {
  let hash = 2166136261;
  let differentPixels = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    let different = false;
    for (let channel = 0; channel < 4; channel++) {
      const value = pixels[i + channel];
      hash = Math.imul(hash ^ value, 16777619);
      different ||= !!baseline && value !== baseline[i + channel];
    }
    differentPixels += different;
  }

  return {
    differentPixels,
    hash: (hash >>> 0).toString(16).padStart(8, "0"),
    match: !baseline || differentPixels === 0,
  };
};

// Renders `frames` times per run with a frame-indexed `Date.now()`, so every render is a new
// render pass (as with requestAnimationFrame) and per-render-time uploads stay deterministic.
// Only CPU-side time is measured; the GPU queue is drained between runs, outside the timing.
export const benchmarkRenders = (context, render, { frames = 100, runs = 5, warmup = 10 } = {}) => {
  const metrics = getContextMetrics(context);
  const originalNow = Date.now;
  let clock = originalNow();
  Date.now = () => clock;

  const renderFrames = (count) => {
    for (let i = 0; i < count; i++) {
      clock++;
      render();
    }
  };

  const times = [];
  let calls;
  try {
    renderFrames(warmup);
    context.gl.finish();
    for (let run = 0; run < runs; run++) {
      const before = metrics.snapshot();
      const startedAt = performance.now();
      renderFrames(frames);
      times.push((performance.now() - startedAt) / frames);
      calls = metrics.difference(before);
      context.gl.finish();
    }
  } finally {
    Date.now = originalNow;
  }

  const sorted = [...times].sort((a, b) => a - b);
  const perFrame = (value) => value / frames;
  return {
    frames,
    runs,
    medianMs: sorted[sorted.length >> 1],
    meanMs: times.reduce((total, value) => total + value, 0) / runs,
    counts: Object.fromEntries(TRACKED_CALLS.map((name) => [name, perFrame(calls.counts[name])])),
    drawCalls: perFrame(calls.drawCalls),
    bufferSubDataBytes: perFrame(calls.bufferSubDataBytes),
  };
};

export const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
};
