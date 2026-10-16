// Composes one frame from the game state: corridor first, then obstacles, gems and the
// ship sorted far to near (painter's algorithm, there is no depth buffer).

import { NEAR, PLAYER_SIZE, PLAYER_Z } from "./config.js";
import { game, playerBox } from "./game.js";

// Corner indices of the 6 cube faces, wound clockwise when facing the camera.
const CUBE_FACES = [
  [0, 1, 2, 3],
  [5, 4, 7, 6],
  [4, 0, 3, 7],
  [1, 5, 6, 2],
  [4, 5, 1, 0],
  [3, 2, 6, 7],
];
const cubeCorners = Array.from({ length: 8 }, () => [0, 0, 0]);
// Speed of the slow corridor scroll on the title screen.
const TITLE_SCROLL_SPEED = 6;

// Rotating cube for pickups: faces come from rotated corners, so the distortion has to
// handle arbitrary convex quads.
const drawSpinningCube = (scene, texture, gem, time) => {
  const s = gem.size / 2;
  const ay = time * 2.2 + gem.phase;
  const ax = time * 1.3 + gem.phase;
  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const bob = Math.sin(time * 3 + gem.phase) * 0.15;

  for (let i = 0; i < 8; i++) {
    const lx = (i & 1) ^ ((i >> 1) & 1) ? s : -s;
    const ly = i & 2 ? -s : s;
    const lz = i & 4 ? s : -s;
    // Rotate around x, then y.
    const y1 = ly * cx - lz * sx;
    const z1 = ly * sx + lz * cx;
    const x2 = lx * cy + z1 * sy;
    const z2 = -lx * sy + z1 * cy;
    const corner = cubeCorners[i];
    corner[0] = gem.x + x2;
    corner[1] = gem.y + bob + y1;
    corner[2] = gem.z + z2;
    if (corner[2] < NEAR) return;
  }

  const glow = 0.75 + Math.sin(time * 6 + gem.phase) * 0.25;
  for (const face of CUBE_FACES) {
    const points = face.map((index) => cubeCorners[index]);
    scene.drawQuad(points, texture, [0, 0, 1, 1], [glow, 1, glow], gem.z);
  }
};

// The ship turns red and pulses after a crash.
const drawShip = (scene, texture) => {
  const hurt = game.mode === "over" ? 0.4 + game.flash : 1;
  scene.drawBox(playerBox(), texture, [1 + (1 - hurt), hurt, hurt], PLAYER_SIZE.w);
};

// Clear color doubles as the screen flash: red after a crash, green on pickups.
const flashColor = () => [
  game.mode === "over" ? game.flash * 0.6 : 0,
  game.mode === "play" ? game.flash * 0.25 : 0,
];

export const drawGame = (scene, textures, time) => {
  scene.beginFrame();

  const distance = game.mode === "title" ? time * TITLE_SCROLL_SPEED : game.distance;
  scene.drawCorridor(distance);

  const drawables = [];
  for (const obstacle of game.obstacles) drawables.push({ z: obstacle.z, obstacle });
  for (const gem of game.gems) drawables.push({ z: gem.z, gem });
  if (game.mode !== "title") drawables.push({ z: PLAYER_Z, player: true });
  drawables.sort((a, b) => b.z - a.z);

  for (const item of drawables) {
    if (item.obstacle) {
      const { def } = item.obstacle;
      scene.drawBox(item.obstacle, textures[def.texture], def.color, def.uvScale);
    } else if (item.gem) {
      drawSpinningCube(scene, textures.gem, item.gem, time);
    } else {
      drawShip(scene, textures.ship);
    }
  }

  scene.endFrame(flashColor());
};
