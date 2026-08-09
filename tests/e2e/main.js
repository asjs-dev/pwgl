import { cases } from "./cases";
import { captureFrame, compareFrames, formatBytes, getContextMetrics, instrumentContext } from "./metrics";

const viewport = document.querySelector("#viewport");
const title = document.querySelector("#title");
const expectation = document.querySelector("#expectation");
const status = document.querySelector("#status");
const glError = document.querySelector("#gl-error");
const caseNavigation = document.querySelector("#cases");
const metricsBody = document.querySelector("#metrics-body");
const instrumentationStatus = document.querySelector("#instrumentation-status");
const report = document.querySelector("#report");
let activeCase;
let activeTestCase;
let baseline;
let measurements = [];

const createReport = () => {
  const lines = [
    `Adapter: ${document.querySelector("#adapter").textContent}`,
    `Case: ${activeTestCase ? `${activeTestCase.id} — ${activeTestCase.title}` : "-"}`,
    "phase\trenders\ttimeMs\tpixels\tcreateBuffer\tdeleteBuffer\tbindBuffer\tbufferDataCalls\tbufferDataBytes\tbufferSubDataCalls\tbufferSubDataBytes\tenableAttrib\tattribPointer\tattribDivisor\tcreateProgram\tlinkProgram\tuseProgram\tcreateVAO\tbindVAO\tdraws",
  ];

  measurements.forEach(({ label, count, elapsed, pixelStatus, calls }) => {
    const { counts } = calls;
    lines.push(
      [
        label,
        count,
        elapsed.toFixed(2),
        pixelStatus,
        counts.createBuffer,
        counts.deleteBuffer,
        counts.bindBuffer,
        counts.bufferData,
        calls.bufferDataBytes,
        counts.bufferSubData,
        calls.bufferSubDataBytes,
        counts.enableVertexAttribArray,
        counts.vertexAttribPointer,
        counts.vertexAttribDivisor,
        counts.createProgram,
        counts.linkProgram,
        counts.useProgram,
        counts.createVertexArray,
        counts.bindVertexArray,
        calls.drawCalls,
      ].join("\t"),
    );
  });

  return lines.join("\n");
};

const updateMetrics = () => {
  metricsBody.replaceChildren();

  measurements.forEach(({ label, count, elapsed, pixelStatus, pixelMatch, calls }) => {
    const { counts } = calls;
    const row = document.createElement("tr");
    const cells = [
      label,
      count,
      `${elapsed.toFixed(2)} ms`,
      pixelStatus,
      `${counts.createBuffer}/${counts.deleteBuffer}`,
      counts.bindBuffer,
      `${counts.bufferData} / ${formatBytes(calls.bufferDataBytes)}`,
      `${counts.bufferSubData} / ${formatBytes(calls.bufferSubDataBytes)}`,
      `${counts.enableVertexAttribArray}/${counts.vertexAttribPointer}/${counts.vertexAttribDivisor}`,
      `${counts.createProgram}/${counts.linkProgram}/${counts.useProgram}`,
      `${counts.createVertexArray}/${counts.bindVertexArray}`,
      calls.drawCalls,
    ];

    cells.forEach((value, index) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      if (index === 3) cell.className = pixelMatch ? "match" : "diff";
      row.appendChild(cell);
    });
    metricsBody.appendChild(row);
  });

  const { unavailable } = getContextMetrics(activeCase.context);
  instrumentationStatus.textContent = unavailable.length
    ? `Unavailable counters: ${[...new Set(unavailable)].join(", ")}`
    : "All counters active";
  report.textContent = createReport();
};

const updateGlStatus = () => {
  if (activeCase.context.isLost()) {
    glError.textContent = "WebGL context lost";
    glError.classList.add("error");
    return;
  }
  const error = activeCase.context.gl.getError();
  glError.textContent = error ? `WebGL error: ${error}` : "WebGL: NO_ERROR";
  glError.classList.toggle("error", !!error);
};

const render = (count = 1, label = count === 1 ? "Repeat" : "Stress") => {
  const metrics = getContextMetrics(activeCase.context);
  const metricsBefore = metrics.snapshot();
  const startedAt = performance.now();
  for (let i = 0; i < count; i++) activeCase.render();
  const elapsed = performance.now() - startedAt;
  const pixels = captureFrame(activeCase.context);
  const comparison = compareFrames(baseline, pixels);
  const pixelStatus = baseline
    ? comparison.match
      ? `MATCH #${comparison.hash}`
      : `DIFF ${comparison.differentPixels}px #${comparison.hash}`
    : `BASELINE #${comparison.hash}`;

  measurements.push({
    label,
    count,
    elapsed,
    pixelStatus,
    pixelMatch: comparison.match,
    calls: metrics.difference(metricsBefore),
  });
  baseline ||= pixels;
  status.textContent = `${count} render(s) in ${elapsed.toFixed(2)} ms`;
  updateMetrics();
  updateGlStatus();
};

const selectCase = (testCase) => {
  viewport.replaceChildren();
  activeTestCase = testCase;
  activeCase = testCase.create();
  baseline = null;
  measurements = [];
  viewport.appendChild(activeCase.context.canvas);
  title.textContent = testCase.title;
  expectation.textContent = testCase.expectation;
  [...caseNavigation.children].forEach((button) =>
    button.classList.toggle("active", button.dataset.id === testCase.id),
  );
  render(1, "First");
};

cases.forEach((testCase) => {
  const button = document.createElement("button");
  button.textContent = testCase.title;
  button.dataset.id = testCase.id;
  button.addEventListener("click", () => selectCase(testCase));
  caseNavigation.appendChild(button);
});

document.querySelector("#render-once").addEventListener("click", () => render(1, "Repeat"));
document.querySelector("#stress-render").addEventListener("click", () => render(120, "Stress"));
document.querySelector("#copy-report").addEventListener("click", async () => {
  await navigator.clipboard.writeText(createReport());
  status.textContent = "Metrics report copied";
});
document.querySelector("#context-loss").addEventListener("click", () => {
  const { canvas, gl } = activeCase.context;
  const extension = gl.getExtension("WEBGL_lose_context");
  if (!extension) {
    status.textContent = "WEBGL_lose_context is unavailable";
    return;
  }
  const { width, height } = canvas;
  canvas.addEventListener(
    "webglcontextrestored",
    () => {
      activeCase.context.setCanvasSize(width, height);
      instrumentContext(activeCase.context);
      status.textContent = "Context restored";
      requestAnimationFrame(() => render(1, "Restore"));
    },
    { once: true },
  );
  extension.loseContext();
  status.textContent = "Context lost; PWGL is restoring it…";
});

const probe = document.createElement("canvas").getContext("webgl2");
const debugInfo = probe?.getExtension("WEBGL_debug_renderer_info");
document.querySelector("#adapter").textContent = debugInfo
  ? probe.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
  : "WebGL2 renderer information unavailable";

selectCase(cases[0]);
