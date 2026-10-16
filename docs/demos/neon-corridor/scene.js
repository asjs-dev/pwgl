// Turns 3D quads into PWGL Images. A fixed pool of full-screen Images is reused every
// frame: each visible face takes the next one, gets its corners from the projection and
// its texture repeat from `uv`. Drawing order is the painter's algorithm (far first).

import { Container, Image } from "../../assets/pwgl.es.js";
import {
  CORRIDOR_HALF_WIDTH,
  CORRIDOR_HEIGHT,
  CORRIDOR_TILE,
  FAR,
  HEIGHT,
  NEAR,
  POOL_SIZE,
  SEGMENTS,
  WIDTH,
} from "./config.js";
import { facingArea, fog, projectQuad, projected } from "./projection.js";

// Brightness per box face, a cheap fixed light from above-front.
const FACE_SHADE = { front: 0.85, top: 1, side: 0.6, back: 0.5, bottom: 0.4 };
// Max screen offset (px) of the camera shake at full strength.
const SHAKE_PIXELS = 24;

// Corridor slice depths, denser near the camera where the fog changes fastest on screen.
const segmentEdges = Array.from(
  { length: SEGMENTS + 1 },
  (_, i) => NEAR + (FAR - NEAR) * (i / SEGMENTS) ** 1.5,
);

export const createScene = (stage2D, textures) => {
  // The world container sits in the screen center so it can roll and shake.
  const world = new Container();
  world.transform.x = WIDTH / 2;
  world.transform.y = HEIGHT / 2;
  stage2D.container.addChild(world);

  const pool = [];
  for (let i = 0; i < POOL_SIZE; i++) {
    const image = new Image(textures.floor);
    image.transform.x = -WIDTH / 2;
    image.transform.y = -HEIGHT / 2;
    image.transform.width = WIDTH;
    image.transform.height = HEIGHT;
    image.renderable = false;
    world.addChild(image);
    pool.push(image);
  }
  let poolIndex = 0;

  // Draws one textured quad. uv = [u0, v0, u1, v1] for the TL and BR corners.
  // `cull` skips faces turned away from the camera.
  const drawQuad = (points, texture, uv, color, depth, cull = true) => {
    if (poolIndex >= POOL_SIZE) return;
    projectQuad(points);
    if (cull && facingArea() <= 0) return;

    const image = pool[poolIndex++];
    image.renderable = true;
    image.texture = texture;
    image.distortion.cache.set(projected);

    const textureTransform = image.textureTransform;
    textureTransform.x = uv[0];
    textureTransform.y = uv[1];
    textureTransform.repeatX = uv[2] - uv[0];
    textureTransform.repeatY = uv[3] - uv[1];

    const light = fog(depth);
    image.color.set(color[0] * light, color[1] * light, color[2] * light, 1);
  };

  // Floor, ceiling and both walls, slice by slice from far to near. `distance` scrolls
  // the texture coordinates, so the corridor geometry itself never moves.
  const drawCorridor = (distance) => {
    const w = CORRIDOR_HALF_WIDTH;
    const h = CORRIDOR_HEIGHT;
    const scroll = distance / CORRIDOR_TILE;
    const across = (w * 2) / CORRIDOR_TILE;
    const up = h / CORRIDOR_TILE;

    for (let i = SEGMENTS - 1; i >= 0; i--) {
      const zNear = segmentEdges[i];
      const zFar = segmentEdges[i + 1];
      const vNear = -(zNear / CORRIDOR_TILE + scroll);
      const vFar = -(zFar / CORRIDOR_TILE + scroll);
      const depth = (zNear + zFar) / 2;

      // Floor: TL far-left, BR near-right.
      const floor = [[-w, 0, zFar], [w, 0, zFar], [w, 0, zNear], [-w, 0, zNear]];
      drawQuad(floor, textures.floor, [0, vFar, across, vNear], [1, 1, 1], depth, false);
      // Ceiling: TL near-left, BR far-right.
      const ceiling = [[-w, h, zNear], [w, h, zNear], [w, h, zFar], [-w, h, zFar]];
      drawQuad(ceiling, textures.ceiling, [0, vNear, across, vFar], [0.8, 0.8, 1], depth, false);
      // Left wall: TL far-top, BR near-bottom.
      const left = [[-w, h, zFar], [-w, h, zNear], [-w, 0, zNear], [-w, 0, zFar]];
      drawQuad(left, textures.wall, [vFar, 0, vNear, up], [0.85, 0.85, 1], depth, false);
      // Right wall: TL near-top, BR far-bottom.
      const right = [[w, h, zNear], [w, h, zFar], [w, 0, zFar], [w, 0, zNear]];
      drawQuad(right, textures.wall, [-vNear, 0, -vFar, up], [0.85, 0.85, 1], depth, false);
    }
  };

  // Axis-aligned box: x/z center, y bottom. Faces are wound clockwise on screen when they
  // point to the camera, so back faces get culled. The back face is never visible.
  const drawBox = (box, texture, color, uvScale = 1) => {
    const x0 = box.x - box.w / 2;
    const x1 = box.x + box.w / 2;
    const y0 = box.y;
    const y1 = box.y + box.h;
    const z0 = box.z - box.d / 2;
    const z1 = box.z + box.d / 2;
    if (z1 < NEAR) return;

    const depth = Math.max(z0, NEAR);
    const shade = (k) => [color[0] * k, color[1] * k, color[2] * k];
    const repeats = (size) => (size / uvScale) | 0 || 1;
    const uw = repeats(box.w);
    const uh = repeats(box.h);
    const ud = repeats(box.d);
    const side = shade(FACE_SHADE.side);

    // Side and top faces run along z, so clamping z to NEAR clips them exactly.
    drawQuad([[x0, y1, z1], [x0, y1, z0], [x0, y0, z0], [x0, y0, z1]], texture, [0, 0, ud, uh], side, depth);
    drawQuad([[x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [x1, y0, z0]], texture, [0, 0, ud, uh], side, depth);
    drawQuad([[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], texture, [0, 0, uw, ud], shade(FACE_SHADE.top), depth);
    drawQuad([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], texture, [0, 0, uw, ud], shade(FACE_SHADE.bottom), depth);
    if (z0 >= NEAR) {
      drawQuad([[x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [x0, y0, z0]], texture, [0, 0, uw, uh], shade(FACE_SHADE.front), depth);
    }
  };

  // Rolls and shakes the whole world; shake is 0..1.
  const applyCamera = (camera) => {
    world.transform.rotation = camera.roll;
    world.transform.x = WIDTH / 2 + (Math.random() - 0.5) * SHAKE_PIXELS * camera.shake;
    world.transform.y = HEIGHT / 2 + (Math.random() - 0.5) * SHAKE_PIXELS * camera.shake;
  };

  const beginFrame = () => {
    poolIndex = 0;
  };

  // Hides the Images left over from the previous frame, then renders over a clear color.
  const endFrame = ([red, green]) => {
    for (let i = poolIndex; i < POOL_SIZE && pool[i].renderable; i++) pool[i].renderable = false;
    stage2D.clearColor.set(red, green, 0, 1);
    stage2D.render();
  };

  return { drawQuad, drawCorridor, drawBox, applyCamera, beginFrame, endFrame };
};
