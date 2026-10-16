// The fake-3D core. PWGL is a 2D renderer, but an Image's `distortion` can move its four
// corners anywhere on screen and maps the texture projectively between them. So a 3D quad
// is drawn by projecting its four world corners with a pinhole camera and handing the
// result to a full-screen Image as distortion corners.

import { CAMERA_HEIGHT, FAR, FOCAL, HEIGHT, HORIZON_Y, NEAR, WIDTH } from "./config.js";

// Roll and shake are applied to the whole world container, not to the projection.
export const camera = { x: 0, y: CAMERA_HEIGHT, roll: 0, shake: 0 };

// Projected corners of the last quad: TL, TR, BR, BL as (x, y) pairs in unit-quad space
// of a full-screen Image (0..1 covers the screen).
export const projected = new Float32Array(8);

// Projects 4 world points into `projected`. Clamping z to NEAR clips z-aligned edges.
export const projectQuad = (points) => {
  for (let i = 0; i < 4; i++) {
    const p = points[i];
    const z = Math.max(p[2], NEAR);
    projected[i * 2] = 0.5 + ((p[0] - camera.x) * FOCAL) / z / WIDTH;
    projected[i * 2 + 1] = HORIZON_Y - ((p[1] - camera.y) * FOCAL) / z / HEIGHT;
  }
};

// Signed screen-space area of `projected`; positive when the face points to the camera.
export const facingArea = () => {
  let area = 0;
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    area +=
      projected[i * 2] * WIDTH * projected[j * 2 + 1] * HEIGHT -
      projected[j * 2] * WIDTH * projected[i * 2 + 1] * HEIGHT;
  }
  return area;
};

// Camera follows the ship loosely and banks into lane changes.
export const followCamera = (player, dt) => {
  camera.x += (player.x * 0.65 - camera.x) * Math.min(1, dt * 6);
  camera.y = CAMERA_HEIGHT + player.y * 0.25;
  camera.roll += (-player.tilt * 0.004 - camera.roll) * Math.min(1, dt * 8);
  camera.shake = Math.max(0, camera.shake - dt * 1.5);
};

// Brightness multiplier by depth: 1 near the camera, fading to black towards FAR.
export const fog = (z) => Math.max(0, Math.min(1, 1.15 - z / FAR)) ** 1.6;
