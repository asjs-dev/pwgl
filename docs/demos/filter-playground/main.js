// Entry point: creates the context, the source scene and the FilterRenderer, wires the
// panel, the snippet, the Animate toggle and the magnifier, keeps the render size in step with the
// layout and runs the frame loop.

import { Context, FilterRenderer } from "../../assets/pwgl.es.js";
import { createTextures } from "./textures.js";
import { createScene } from "./scene.js";
import { createChain } from "./chain.js";
import { createPanel } from "./panel.js";
import { createSnippet } from "./snippet.js";
import { createMagnifier } from "./magnifier.js";

// Render size cap (px) and height / width ratio of the canvas (16:10).
const MAX_RENDER_WIDTH = 1280;
const ASPECT = 0.625;
// Longest frame time (s) fed to the scene clock, so a background tab does not jump.
const MAX_FRAME_TIME = 0.05;

const context = new Context();
const stage = document.getElementById("stage");
stage.appendChild(context.canvas);

const textures = createTextures();
const scene = createScene(context, textures);
const filterRenderer = new FilterRenderer({ context, sourceTexture: scene.framebuffer });
// Mask lowers the alpha, so clear instead of blending over the previous frame.
filterRenderer.clearBeforeRender = true;
filterRenderer.clearColor.set(0, 0, 0, 0);

const chain = createChain(filterRenderer, textures);
createPanel(document.getElementById("controls"), chain);
createSnippet(document.getElementById("snippet"), chain);

const animateToggle = document.getElementById("animate-toggle");
animateToggle.addEventListener("change", () => scene.setAnimated(animateToggle.checked));
scene.setAnimated(animateToggle.checked);

const magnifier = createMagnifier(stage, context.canvas, document.getElementById("magnifier-toggle"));

// Pixel-based filters (blur, pixelate) depend on the render size, so it follows the
// displayed size and the device pixel ratio.
const resize = () => {
  const width = Math.max(1, Math.min(MAX_RENDER_WIDTH, Math.round(stage.clientWidth * devicePixelRatio)));
  const height = Math.round(width * ASPECT);
  if (width === filterRenderer.width && height === filterRenderer.height) return;
  context.setCanvasSize(width, height);
  scene.setSize(width, height);
  filterRenderer.setSize(width, height);
};
new ResizeObserver(resize).observe(stage);
resize();

let last = performance.now();
const frame = (now) => {
  const dt = Math.min(MAX_FRAME_TIME, (now - last) / 1000);
  last = now;
  scene.render(dt);
  filterRenderer.render();
  magnifier.draw();
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);
