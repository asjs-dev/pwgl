// Automatic checks: every case builds a fresh instance, renders it and checks pixels, GL errors,
// console errors and context state. Pixel checks use a tolerance, so small GPU differences pass.
// A case may return `check(t)` from `create()`; without one it is checked for a non-blank,
// stable frame.

const logs = [];
["error", "warn"].forEach((level) => {
  const original = console[level].bind(console);
  console[level] = (...args) => {
    logs.push(`${level}: ${args.map((arg) => arg?.stack || String(arg)).join(" ")}`);
    original(...args);
  };
});
window.addEventListener("error", (event) => logs.push(`uncaught: ${event.message}`));
window.addEventListener("unhandledrejection", (event) => logs.push(`rejection: ${event.reason?.stack || event.reason}`));

export const luminance = (pixel) => 0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2];
export const formatPixel = (pixel) => `(${Array.from(pixel).join(",")})`;
export const near = (a, b, tolerance = 34) => a.every((value, index) => Math.abs(value - b[index]) <= tolerance);
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readFrame = (context) => {
  const { gl, canvas } = context;
  const { width, height } = canvas;
  const data = new Uint8Array(width * height * 4);
  const framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  return { width, height, data };
};

// Pixel coordinates are top-down, like the canvas.
const pixelOf = (frame, x, y) => {
  const i = ((frame.height - 1 - (y | 0)) * frame.width + (x | 0)) * 4;
  return [frame.data[i], frame.data[i + 1], frame.data[i + 2], frame.data[i + 3]];
};

const defaultCheck = async (t) => {
  await t.renders(2);
  const { maxLuminance } = t.region(0, 0, t.width, t.height, 4);
  t.check("frame is not blank", maxLuminance > 10, `max luminance ${maxLuminance.toFixed(0)}`);
  await t.expectStable();
};

/**
 * Runs the checks of one case on a new instance whose canvas is placed in `host`.
 * `watch` paces the run frame by frame and reports every step, check and probed pixel.
 */
export const runChecks = async (testCase, host, watch = null) => {
  const results = [];
  const logStart = logs.length;
  const startedAt = performance.now();
  let instance;
  let lostEvents = 0;
  let glErrors = 0;
  let frame = 0;

  const report = (status, name, detail = "") => {
    results.push({ status, name, detail });
    watch?.onCheck(status, name, detail);
  };

  try {
    instance = testCase.create();
    const { context } = instance;
    const { canvas } = context;
    canvas.addEventListener("webglcontextlost", () => lostEvents++);
    host.replaceChildren(canvas);

    const collectGlErrors = () => {
      if (context.isLost()) return;
      let error;
      while ((error = context.gl.getError())) {
        if (++glErrors <= 3) report("fail", `GL error 0x${error.toString(16)}`);
      }
    };

    const t = {
      context,
      get width() {
        return context.canvas.width;
      },
      get height() {
        return context.canvas.height;
      },
      luminance,
      formatPixel,
      near,
      async renders(count = 1, render = instance.render) {
        for (let i = 0; i < count; i++) {
          render();
          if (watch) {
            watch.onStep(`frame ${++frame}`);
            await watch.pace();
          }
        }
        collectGlErrors();
      },
      finish: () => context.gl.finish(),
      px: (x, y) => pixelOf(readFrame(context), x, y),
      snapshot() {
        const frame = readFrame(context);
        return { frame, px: (x, y) => pixelOf(frame, x, y) };
      },
      diffCount(reference) {
        const a = reference.frame;
        const b = readFrame(context);
        if (a.width !== b.width || a.height !== b.height) return a.width * a.height;
        let count = 0;
        for (let i = 0; i < a.data.length; i += 4) {
          const delta =
            Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
          if (delta > 6) count++;
        }
        return count;
      },
      region(x, y, width, height, step = 2) {
        const frame = readFrame(context);
        let maxLuminance = 0;
        let sum = 0;
        let count = 0;
        for (let j = y; j < y + height; j += step) {
          for (let i = x; i < x + width; i += step) {
            const value = luminance(pixelOf(frame, i, j));
            maxLuminance = Math.max(maxLuminance, value);
            sum += value;
            count++;
          }
        }
        return { maxLuminance, averageLuminance: sum / count };
      },
      check(name, ok, detail = "", warnOnly = false) {
        report(ok ? "ok" : warnOnly ? "warn" : "fail", name, detail);
      },
      expectPx(name, x, y, expected, tolerance) {
        const pixel = t.px(x, y);
        const ok = near(pixel, expected, tolerance);
        watch?.onMark(x, y, ok);
        t.check(name, ok, `got ${formatPixel(pixel)} want ${formatPixel(expected)}`);
        return ok;
      },
      // Many similar pixel checks summarised as one line.
      expectPxAll(label, probes, tolerance) {
        const bad = [];
        probes.forEach(([name, x, y, expected]) => {
          const pixel = t.px(x, y);
          const ok = near(pixel, expected, tolerance);
          watch?.onMark(x, y, ok);
          if (!ok) bad.push(`${name} ${formatPixel(pixel)}`);
        });
        t.check(`${probes.length - bad.length}/${probes.length} ${label} correct`, !bad.length, bad.slice(0, 4).join("; "));
      },
      async expectStable(name = "identical on repeated frames", count = 1, render = instance.render) {
        const reference = t.snapshot();
        await t.renders(count, render);
        const changed = t.diffCount(reference);
        t.check(name, changed < 8, `${changed} px differ`);
      },
      note(text) {
        report("note", text);
      },
    };

    await (instance.check || defaultCheck)(t);
    collectGlErrors();
  } catch (error) {
    report("fail", "exception", error?.stack || String(error));
  }

  const caseLogs = logs.slice(logStart);
  if (caseLogs.length) report("fail", `console errors (${caseLogs.length})`, "see log");
  if (lostEvents && !testCase.losesContext) report("fail", "webglcontextlost fired", `${lostEvents}×`);

  // Keep a still image, then free the GPU context: browsers allow only a few at a time.
  const still = document.createElement("canvas");
  if (instance) {
    const { canvas } = instance.context;
    still.width = canvas.width;
    still.height = canvas.height;
    try {
      still.getContext("2d").drawImage(canvas, 0, 0);
    } catch {}
    try {
      instance.context.destruct();
    } catch {}
  }
  host.replaceChildren(still);

  const status = results.some((r) => r.status === "fail") ? "fail" : results.some((r) => r.status === "warn") ? "warn" : "ok";
  return { status, results, ms: performance.now() - startedAt, logs: caseLogs };
};
