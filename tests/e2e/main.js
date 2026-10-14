import { cases } from "./cases";
import { destroyInstance, READY_TIMEOUT, runChecks, sleep, withTimeout } from "./checks";
import {
  benchmarkRenders,
  captureFrame,
  compareFrames,
  createBaseline,
  formatBytes,
  formatScoreReport,
  getContextMetrics,
  instrumentContext,
  parseBaseline,
  scoreBenchmark,
} from "./metrics";

const $ = (selector) => document.querySelector(selector);
const viewport = $("#viewport");
const group = $("#group");
const title = $("#title");
const expectation = $("#expectation");
const status = $("#status");
const glError = $("#gl-error");
const caseNavigation = $("#cases");
const metricsBody = $("#metrics-body");
const instrumentationStatus = $("#instrumentation-status");
const report = $("#report");
const checkStage = $("#check-stage");
const checkTitle = $("#check-title");
const checkStatus = $("#check-status");
const checkStep = $("#check-step");
const checkList = $("#checks");
const checkLog = $("#check-log");
const marks = $("#marks");
const watchSpeed = $("#watch-speed");
const failuresOnly = $("#failures-only");
const runAllButton = $("#run-all");
const runBenchmarkButton = $("#run-benchmark");
const runChecksButton = $("#run-checks");
const scorePanel = $("#score");
const saveBaselineButton = $("#save-baseline");
const compareBaselineButton = $("#compare-baseline");
const importBaselineButton = $("#import-baseline");
const baselineFile = $("#baseline-file");
let activeCase;
let activeTestCase;
let baseline;
let measurements = [];
let checking = false;
let summary = "";
const checkResults = {};
let benchmarkResults = [];
let scored;
const navButtons = {};

// ---------- checks ----------

const SYMBOLS = { ok: "✓", fail: "✗", warn: "!", note: "·" };

const addCheckLine = ({ status: lineStatus, name, detail }) => {
  const item = document.createElement("li");
  item.className = lineStatus;
  const symbol = document.createElement("span");
  symbol.textContent = SYMBOLS[lineStatus];
  const text = document.createElement("span");
  text.textContent = detail ? `${name} — ${detail}` : name;
  item.append(symbol, text);
  checkList.appendChild(item);
  return item;
};

const addMark = ({ x, y, ok }, width, height) => {
  const mark = document.createElement("i");
  mark.className = ok ? "mark" : "mark fail";
  mark.style.left = `${(x / width) * 100}%`;
  mark.style.top = `${(y / height) * 100}%`;
  marks.appendChild(mark);
};

const setPill = (pill, value) => {
  pill.className = `pill ${value}`;
  pill.textContent = value === "idle" ? "NOT RUN" : value.toUpperCase();
};

// Shows the stored result of a case in the checks panel.
const showCheckResult = (testCase) => {
  const result = checkResults[testCase.id];
  checkTitle.textContent = "";
  checkList.replaceChildren();
  marks.replaceChildren();
  checkStep.textContent = result ? `${result.results.filter((r) => r.status === "ok").length} checks passed in ${result.ms.toFixed(0)} ms` : "";
  setPill(checkStatus, result ? result.status : "idle");
  checkStage.replaceChildren(...(result ? [result.still] : []));
  checkLog.hidden = !result?.logs.length;
  checkLog.textContent = result?.logs.join("\n").slice(0, 6000) || "";
  if (!result) return;
  result.results.forEach(addCheckLine);
  result.marks.forEach((mark) => addMark(mark, result.still.width, result.still.height));
};

const updateNavigation = () => {
  cases.forEach((testCase) => {
    const result = checkResults[testCase.id];
    const button = navButtons[testCase.id];
    button.dataset.status = result ? result.status : "idle";
    button.hidden = failuresOnly.checked && result?.status !== "fail";
  });
  const values = Object.values(checkResults);
  const count = (value) => values.filter((result) => result.status === value).length;
  summary = `${count("ok")} pass, ${count("fail")} fail, ${count("warn")} warn, ${cases.length - values.length} not run`;
  $("#counts").innerHTML =
    `<span class="ok"><b>${count("ok")}</b> pass</span><span class="fail"><b>${count("fail")}</b> fail</span>` +
    `<span class="warn"><b>${count("warn")}</b> warn</span><span><b>${cases.length - values.length}</b> not run</span>`;
  report.textContent = createReport();
};

const runCaseChecks = async (testCase) => {
  const delay = Number(watchSpeed.value);
  checkTitle.textContent = `· ${testCase.title}`;
  checkList.replaceChildren();
  marks.replaceChildren();
  checkLog.hidden = true;
  setPill(checkStatus, "run");
  checkStep.textContent = "building scene…";
  const probed = [];
  const watch = {
    pace: () => (delay ? sleep(delay) : Promise.resolve()),
    onStep: (text) => delay && (checkStep.textContent = text),
    onCheck: (lineStatus, name, detail) => delay && addCheckLine({ status: lineStatus, name, detail }).scrollIntoView({ block: "nearest" }),
    onMark(x, y, ok) {
      probed.push({ x, y, ok });
      const { width, height } = checkStage.firstChild || { width: 1, height: 1 };
      delay && addMark({ x, y, ok }, width, height);
    },
  };
  const result = await runChecks(testCase, checkStage, watch);
  if (delay) await sleep(delay * 3);
  checkResults[testCase.id] = { ...result, marks: probed, still: checkStage.firstChild };
  updateNavigation();
  return result;
};

const runSelectedChecks = async () => {
  if (checking) return;
  checking = true;
  updateScore();
  await runCaseChecks(activeTestCase);
  checking = false;
  updateScore();
  showCheckResult(activeTestCase);
};

const runAllChecks = async () => {
  if (checking) return;
  checking = true;
  runAllButton.disabled = runChecksButton.disabled = true;
  updateScore();
  for (const testCase of cases) {
    status.textContent = `Checking ${testCase.title}…`;
    await runCaseChecks(testCase);
    await sleep(16);
  }
  const failed = Object.values(checkResults).filter((result) => result.status === "fail").length;
  status.textContent = `All checks finished: ${failed} failing case(s)`;
  runAllButton.disabled = runChecksButton.disabled = false;
  checking = false;
  updateScore();
  showCheckResult(activeTestCase);
};

// ---------- benchmark ----------

const BENCHMARK_CALLS = [
  "texImage2D",
  "texSubImage2D",
  "generateMipmap",
  "texParameteri",
  "bindTexture",
  "activeTexture",
  "uniform1iv",
  "uniform2fv",
  "bufferSubData",
  "useProgram",
];

const createBenchmarkReport = () => {
  if (!benchmarkResults.length) return [];
  const format = (value) => (Number.isInteger(value) ? value : value.toFixed(2));
  return [
    "",
    "Benchmark (per frame; median of runs, Date.now() advances 1 ms per render)",
    ["case", "frames×runs", "medianMs", "meanMs", "hash", "draws", ...BENCHMARK_CALLS].join("\t"),
    ...benchmarkResults.map(({ id, error, frames, runs, medianMs, meanMs, hash, drawCalls, counts }) =>
      error
        ? `${id}\terror: ${error}`
        : [id, `${frames}×${runs}`, medianMs.toFixed(3), meanMs.toFixed(3), hash, format(drawCalls), ...BENCHMARK_CALLS.map((name) => format(counts[name]))].join(
            "\t",
          ),
    ),
    ...(scored ? formatScoreReport(scored) : []),
  ];
};

// ---------- benchmark baseline ----------

const getAdapter = () => $("#adapter").textContent;
const getBaselineKey = () => `pwgl-e2e-benchmark-baseline:${getAdapter()}`;

// Storage can be unavailable (private mode, blocked site data); every access reports instead of throwing.
// Returns null without a stored baseline and false when it cannot be read.
const loadBaseline = () => {
  try {
    const stored = localStorage.getItem(getBaselineKey());
    return stored ? parseBaseline(stored) : null;
  } catch (error) {
    status.textContent = `Baseline unavailable: ${error?.message || error}`;
    return false;
  }
};

const storeBaseline = (benchmarkBaseline) => {
  try {
    localStorage.setItem(getBaselineKey(), JSON.stringify(benchmarkBaseline));
    return true;
  } catch (error) {
    status.textContent = `Baseline not saved: ${error?.message || error}`;
    return false;
  }
};

// Scores the last results; an unreadable stored baseline is reported as such, not as a missing one.
const scoreAgainstBaseline = () => {
  const benchmarkBaseline = loadBaseline();
  const result = scoreBenchmark(benchmarkResults, benchmarkBaseline);
  return benchmarkBaseline === false ? { ...result, reason: "stored baseline unreadable" } : result;
};

const updateScore = () => {
  const round = (value) => Math.round(value);
  scorePanel.dataset.verdict = scored?.verdict || "";
  if (!scored) scorePanel.textContent = "Score: run the benchmark";
  else if (scored.score === null) scorePanel.textContent = `Score: n/a — ${scored.reason}`;
  else
    scorePanel.textContent =
      `Score ${round(scored.score)} [${round(scored.low)}–${round(scored.high)}] · ${scored.verdict}` +
      (scored.partial ? ` · partial (${scored.compared}/${scored.total})` : "");
  saveBaselineButton.disabled = compareBaselineButton.disabled = checking || !benchmarkResults.length;
  importBaselineButton.disabled = checking;
};

// Baseline actions would score or save partial results while checks or benchmarks run.
const isBusy = () => {
  if (checking) status.textContent = "Wait until the running checks or benchmarks finish";
  return checking;
};

// Scores the last benchmark results against the baseline stored for this adapter.
const compareToBaseline = () => {
  if (isBusy()) return "";
  if (!benchmarkResults.length) {
    status.textContent = "Run the benchmark first";
    return "";
  }
  scored = scoreAgainstBaseline();
  updateScore();
  report.textContent = createReport();
  return formatScoreReport(scored).join("\n");
};

const saveBaseline = () => {
  if (isBusy()) return null;
  if (!benchmarkResults.length) {
    status.textContent = "Run the benchmark first";
    return null;
  }
  const benchmarkBaseline = createBaseline(benchmarkResults, { adapter: getAdapter(), userAgent: navigator.userAgent });
  if (!Object.keys(benchmarkBaseline.cases).length) {
    status.textContent = "No error-free benchmark case to save";
    return null;
  }
  if (!storeBaseline(benchmarkBaseline)) return null;
  compareToBaseline();
  status.textContent = `Baseline saved (${Object.keys(benchmarkBaseline.cases).length} cases)`;
  return benchmarkBaseline;
};

const exportBaseline = () => {
  const benchmarkBaseline = loadBaseline();
  if (!benchmarkBaseline) {
    if (benchmarkBaseline === null) status.textContent = "No baseline saved for this adapter";
    return;
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([JSON.stringify(benchmarkBaseline, null, 2)], { type: "application/json" }));
  link.download = "pwgl-benchmark-baseline.json";
  link.click();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(link.href));
  status.textContent = "Baseline exported";
};

const importBaseline = async (file) => {
  if (isBusy()) return;
  try {
    const benchmarkBaseline = parseBaseline(await file.text());
    if (!storeBaseline(benchmarkBaseline)) return;
    const mismatches = [
      benchmarkBaseline.adapter !== getAdapter() && "adapter",
      benchmarkBaseline.userAgent !== navigator.userAgent && "user agent",
    ].filter(Boolean);
    if (benchmarkResults.length) compareToBaseline();
    status.textContent = `Baseline imported${mismatches.length ? `; warning: ${mismatches.join(" and ")} differ` : ""}`;
  } catch (error) {
    status.textContent = `Baseline not imported: ${error?.message || error}`;
  }
};

// Runs every benchmark case on its own context and stores the results for the report.
const runBenchmarks = async (options) => {
  if (checking) return;
  checking = true;
  runAllButton.disabled = runChecksButton.disabled = runBenchmarkButton.disabled = true;
  benchmarkResults = [];
  scored = null;
  updateScore();
  for (const testCase of cases.filter((item) => item.benchmark)) {
    status.textContent = `Benchmarking ${testCase.title}…`;
    await sleep(16);
    let instance;
    try {
      instance = testCase.create();
      await withTimeout(instance.ready, READY_TIMEOUT, "ready");
      const result = benchmarkRenders(instance.context, instance.render, { ...testCase.benchmark, ...options });
      const { hash } = compareFrames(null, captureFrame(instance.context));
      benchmarkResults.push({ id: testCase.id, ...result, hash });
    } catch (error) {
      benchmarkResults.push({ id: testCase.id, error: error?.message || String(error) });
    }
    destroyInstance(instance);
  }
  status.textContent = "Benchmark finished";
  runAllButton.disabled = runChecksButton.disabled = runBenchmarkButton.disabled = false;
  checking = false;
  // Without a baseline this records the n/a score, so the report always ends with the score block.
  scored = scoreAgainstBaseline();
  updateScore();
  report.textContent = createReport();
  return createBenchmarkReport().join("\n");
};

// ---------- metrics ----------

const createChecksReport = () => {
  const lines = [];
  cases.forEach((testCase) => {
    const result = checkResults[testCase.id];
    if (!result) return lines.push(`[----] ${testCase.group} / ${testCase.title}`);
    lines.push(`[${result.status.toUpperCase().padEnd(4)}] ${testCase.group} / ${testCase.title}  (${result.ms.toFixed(0)} ms)`);
    result.results
      .filter((line) => line.status !== "ok")
      .forEach((line) => lines.push(`    ${line.status}: ${line.name}${line.detail ? ` — ${line.detail}` : ""}`));
    result.logs.forEach((log) => lines.push(`    log: ${log.slice(0, 1500)}`));
  });
  return lines;
};

const createReport = () => {
  const lines = [
    `Adapter: ${$("#adapter").textContent}`,
    `Checks: ${summary}`,
    ...createChecksReport(),
    ...createBenchmarkReport(),
    "",
    `Metrics case: ${activeTestCase ? `${activeTestCase.id} — ${activeTestCase.title}` : "-"}`,
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
  // Browsers only allow a few live contexts, so the previous case gives its own back.
  destroyInstance(activeCase);
  viewport.replaceChildren();
  activeTestCase = testCase;
  activeCase = testCase.create();
  baseline = null;
  measurements = [];
  viewport.appendChild(activeCase.context.canvas);
  group.textContent = testCase.group;
  title.textContent = testCase.title;
  expectation.textContent = testCase.expectation;
  Object.values(navButtons).forEach((button) => button.classList.toggle("active", button.dataset.id === testCase.id));
  render(1, "First");
  if (checking) return;
  showCheckResult(testCase);
  if (!checkResults[testCase.id]) runSelectedChecks();
};

let lastGroup;
cases.forEach((testCase) => {
  if (testCase.group !== lastGroup) {
    lastGroup = testCase.group;
    const heading = document.createElement("h4");
    heading.textContent = testCase.group;
    caseNavigation.appendChild(heading);
  }
  const button = document.createElement("button");
  button.textContent = testCase.title;
  button.dataset.id = testCase.id;
  button.dataset.status = "idle";
  button.addEventListener("click", () => selectCase(testCase));
  caseNavigation.appendChild(button);
  navButtons[testCase.id] = button;
});

runAllButton.addEventListener("click", runAllChecks);
runChecksButton.addEventListener("click", runSelectedChecks);
runBenchmarkButton.addEventListener("click", () => runBenchmarks());
failuresOnly.addEventListener("change", updateNavigation);
saveBaselineButton.addEventListener("click", saveBaseline);
compareBaselineButton.addEventListener("click", compareToBaseline);
$("#export-baseline").addEventListener("click", exportBaseline);
importBaselineButton.addEventListener("click", () => baselineFile.click());
baselineFile.addEventListener("change", () => {
  const [file] = baselineFile.files;
  baselineFile.value = "";
  if (file) importBaseline(file);
});
$("#render-once").addEventListener("click", () => render(1, "Repeat"));
$("#stress-render").addEventListener("click", () => render(120, "Stress"));
$("#copy-report").addEventListener("click", async () => {
  await navigator.clipboard.writeText(createReport());
  status.textContent = "Report copied";
});
$("#context-loss").addEventListener("click", () => {
  const { canvas, gl } = activeCase.context;
  const extension = gl.getExtension("WEBGL_lose_context");
  if (!extension) {
    status.textContent = "WEBGL_lose_context is unavailable";
    return;
  }
  canvas.addEventListener(
    "webglcontextrestored",
    () => {
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
$("#adapter").textContent = debugInfo
  ? probe.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
  : "WebGL2 renderer information unavailable";
probe?.getExtension("WEBGL_lose_context")?.loseContext();

// Lets a browser automation run the suite and read the report.
window.pwglE2E = { runAllChecks, runBenchmarks, createReport, saveBaseline, compareToBaseline };

// Every check runs on load; `?manual` leaves them to the buttons, `?benchmark` runs the benchmark.
const parameters = new URLSearchParams(location.search);
updateNavigation();
updateScore();
checking = true;
selectCase(cases[0]);
checking = false;
if (parameters.has("benchmark")) runBenchmarks();
else if (!parameters.has("manual")) runAllChecks();
