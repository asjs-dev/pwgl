// Keyboard and pointer controls. A horizontal swipe changes lane; a tap jumps, or starts
// the game on the title and game over screens.

import { JUMP_VELOCITY, SWIPE_THRESHOLD } from "./config.js";
import { game, startGame } from "./game.js";

const moveLane = (direction) => {
  if (game.mode === "play") game.player.lane = Math.max(0, Math.min(2, game.player.lane + direction));
};

const jump = () => {
  if (game.mode !== "play") {
    startGame();
    return;
  }
  if (game.player.grounded) {
    game.player.vy = JUMP_VELOCITY;
    game.player.grounded = false;
  }
};

const onKeyDown = (event) => {
  if (event.repeat) return;
  switch (event.code) {
    case "ArrowLeft":
    case "KeyA":
      moveLane(-1);
      break;
    case "ArrowRight":
    case "KeyD":
      moveLane(1);
      break;
    case "Space":
    case "ArrowUp":
    case "KeyW":
      event.preventDefault();
      jump();
      break;
  }
};

export const bindInput = (target = window) => {
  target.addEventListener("keydown", onKeyDown);

  let pointerStart = null;
  target.addEventListener("pointerdown", (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  target.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    pointerStart = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) moveLane(Math.sign(dx));
    else jump();
  });
};
