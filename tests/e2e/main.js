import { cases } from "./cases";

const viewport = document.querySelector("#viewport");
const title = document.querySelector("#title");
const expectation = document.querySelector("#expectation");
const status = document.querySelector("#status");
const glError = document.querySelector("#gl-error");
const caseNavigation = document.querySelector("#cases");
let activeCase;

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

const render = (count = 1) => {
  const startedAt = performance.now();
  for (let i = 0; i < count; i++) activeCase.render();
  status.textContent = `${count} render(s) in ${(performance.now() - startedAt).toFixed(2)} ms`;
  updateGlStatus();
};

const selectCase = (testCase) => {
  viewport.replaceChildren();
  activeCase = testCase.create();
  viewport.appendChild(activeCase.context.canvas);
  title.textContent = testCase.title;
  expectation.textContent = testCase.expectation;
  [...caseNavigation.children].forEach((button) => button.classList.toggle("active", button.dataset.id === testCase.id));
  render();
};

cases.forEach((testCase) => {
  const button = document.createElement("button");
  button.textContent = testCase.title;
  button.dataset.id = testCase.id;
  button.addEventListener("click", () => selectCase(testCase));
  caseNavigation.appendChild(button);
});

document.querySelector("#render-once").addEventListener("click", () => render());
document.querySelector("#stress-render").addEventListener("click", () => render(120));
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
      status.textContent = "Context restored";
      requestAnimationFrame(() => render());
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
