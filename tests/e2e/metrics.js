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
    times,
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

// ---------- benchmark score ----------

export const BASELINE_VERSION = 1;

const isPositive = (value) => Number.isFinite(value) && value > 0;
const isCount = (value) => Number.isInteger(value) && value > 0;
const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const geomean = (values) => Math.exp(values.reduce((total, value) => total + Math.log(value), 0) / values.length);

// Linear interpolation between the closest ranks of an ascending array.
export const quantile = (sorted, q) => {
  if (!sorted.length) return NaN;
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
};

// The slower (upper-quartile) run bounds the band from below, the faster one from above.
const quartiles = (times) => {
  const sorted = [...times].sort((a, b) => a - b);
  return { slow: quantile(sorted, 0.75), fast: quantile(sorted, 0.25) };
};

// Keeps the error-free results of a benchmark run as a baseline.
export const createBaseline = (results, { adapter = "", userAgent = "", savedAt = new Date().toISOString() } = {}) => ({
  version: BASELINE_VERSION,
  savedAt,
  adapter,
  userAgent,
  cases: Object.fromEntries(
    results
      .filter((result) => !result.error)
      .map(({ id, frames, runs, medianMs, times, hash }) => [id, { frames, runs, medianMs, times: [...times], hash }]),
  ),
});

// Accepts a baseline object or its JSON text; throws with the reason when it is not a valid baseline.
export const parseBaseline = (json) => {
  const data = typeof json === "string" ? JSON.parse(json) : json;
  if (!isObject(data)) throw new Error("baseline is not an object");
  if (data.version !== BASELINE_VERSION) throw new Error(`unsupported baseline version: ${data.version}`);
  if (!isObject(data.cases)) throw new Error("baseline cases are missing");

  const cases = {};
  Object.entries(data.cases).forEach(([id, item]) => {
    const valid =
      isObject(item) &&
      isCount(item.frames) &&
      isCount(item.runs) &&
      isPositive(item.medianMs) &&
      Array.isArray(item.times) &&
      item.times.length === item.runs &&
      item.times.every(isPositive) &&
      typeof item.hash === "string";
    if (!valid) throw new Error(`baseline case "${id}" is malformed`);
    const { frames, runs, medianMs, times, hash } = item;
    cases[id] = { frames, runs, medianMs, times: [...times], hash };
  });

  return {
    version: BASELINE_VERSION,
    savedAt: String(data.savedAt ?? ""),
    adapter: String(data.adapter ?? ""),
    userAgent: String(data.userAgent ?? ""),
    cases,
  };
};

// score = 1000 × geomean(baselineMedianMs / medianMs) over the cases both runs can compare.
export const scoreBenchmark = (results, baseline) => {
  const scored = {
    score: null,
    compared: 0,
    total: results.length,
    partial: false,
    missing: [],
    added: [],
    errored: [],
    reconfigured: [],
    hashChanged: [],
  };
  if (!baseline) return { ...scored, reason: "no baseline saved for this adapter" };

  const ratios = { score: [], low: [], high: [], baselineLow: [], baselineHigh: [] };
  const ids = new Set(results.map(({ id }) => id));
  scored.missing = Object.keys(baseline.cases).filter((id) => !ids.has(id));
  scored.total = new Set([...ids, ...Object.keys(baseline.cases)]).size;

  results.forEach((result) => {
    const reference = baseline.cases[result.id];
    if (result.error || !isPositive(result.medianMs) || !result.times?.every(isPositive)) return scored.errored.push(result.id);
    if (!reference) return scored.added.push(result.id);
    if (reference.frames !== result.frames || reference.runs !== result.runs) return scored.reconfigured.push(result.id);
    if (reference.hash !== result.hash) scored.hashChanged.push(result.id);

    const current = quartiles(result.times);
    const own = quartiles(reference.times);
    ratios.score.push(reference.medianMs / result.medianMs);
    ratios.low.push(reference.medianMs / current.slow);
    ratios.high.push(reference.medianMs / current.fast);
    ratios.baselineLow.push(reference.medianMs / own.slow);
    ratios.baselineHigh.push(reference.medianMs / own.fast);
  });

  scored.compared = ratios.score.length;
  scored.partial = scored.compared < scored.total;
  if (!scored.compared) return { ...scored, reason: "no case is comparable with the baseline" };

  const [score, low, high, baselineLow, baselineHigh] = Object.values(ratios).map((values) => 1000 * geomean(values));
  const verdict = low > baselineHigh ? "better" : high < baselineLow ? "worse" : "within noise";
  return { ...scored, score, low, high, baselineLow, baselineHigh, verdict };
};

export const formatScoreReport = (scored) => {
  const lines = ["", "Score (1000 = baseline; geomean of baselineMedianMs / medianMs, higher is faster)"];
  const count = `${scored.compared}/${scored.total} cases`;
  if (scored.score === null) lines.push(`Score: n/a — ${scored.reason}`);
  else {
    const round = (value) => Math.round(value);
    lines.push(
      `Score: ${round(scored.score)} [${round(scored.low)}–${round(scored.high)}]${scored.partial ? ` partial (${count})` : ""}`,
      `Verdict: ${scored.verdict} (baseline band [${round(scored.baselineLow)}–${round(scored.baselineHigh)}])`,
      `Compared: ${count}`,
    );
  }

  const list = (label, ids) => ids.length && lines.push(`${label}: ${ids.join(", ")}`);
  list("Missing (in baseline, not run now)", scored.missing);
  list("New (not in baseline)", scored.added);
  list("Errored", scored.errored);
  list("Reconfigured (frames or runs differ)", scored.reconfigured);
  list("Hash changed (rendered output differs; scored)", scored.hashChanged);
  return lines;
};
