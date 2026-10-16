// Entry point: creates the PWGL renderer, wires the HUD and overlay to the game and runs
// the frame loop.

import { Context, Stage2D } from "../../assets/pwgl.es.js";
import { HEIGHT, POOL_SIZE, WIDTH } from "./config.js";
import { camera } from "./projection.js";
import { createTextures } from "./textures.js";
import { createScene } from "./scene.js";
import { game, gameEvents, update } from "./game.js";
import { drawGame } from "./render.js";
import { bindInput } from "./input.js";

// Longest simulated step (s), so a background tab does not teleport the ship.
const MAX_FRAME_TIME = 0.05;

const context = new Context();
const stage2D = new Stage2D({ context, maxRenderCount: POOL_SIZE });
stage2D.clearBeforeRender = true;
stage2D.clearColor.set(0, 0, 0, 1);
context.setCanvasSize(WIDTH, HEIGHT);
stage2D.setSize(WIDTH, HEIGHT);
document.getElementById("stage").appendChild(context.canvas);

const textures = createTextures();
const scene = createScene(stage2D, textures);

const overlay = document.getElementById("overlay");
const titleLabel = overlay.querySelector("h1");
const promptLabel = document.getElementById("prompt");
const scoreLabel = document.getElementById("score");
const speedLabel = document.getElementById("speed");
const bestLabel = document.getElementById("best");

gameEvents.onStart = () => overlay.classList.add("hidden");
gameEvents.onGameOver = () => {
  titleLabel.textContent = "GAME OVER";
  promptLabel.innerHTML = `Score: ${game.score}<br /><br />Press Space or tap to restart`;
  overlay.classList.remove("hidden");
};

const updateHud = () => {
  scoreLabel.textContent = `SCORE ${game.score}`;
  speedLabel.textContent = game.mode === "play" ? `${Math.round(game.speed * 10)} km/h` : "";
  bestLabel.textContent = `BEST ${game.best}`;
};

bindInput();

let last = performance.now();
const frame = (now) => {
  const dt = Math.min(MAX_FRAME_TIME, (now - last) / 1000);
  last = now;
  update(dt);
  scene.applyCamera(camera);
  updateHud();
  drawGame(scene, textures, now / 1000);
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);
