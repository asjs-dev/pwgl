// Tuning constants shared by every Neon Corridor module. World units are metres-ish:
// x runs right, y runs up, z runs away from the camera.

// Render target size; the canvas is scaled to the window with CSS.
export const WIDTH = 960;
export const HEIGHT = 540;

// Pinhole camera: screen offset = world offset * FOCAL / z.
export const FOCAL = 520;
// Points closer than NEAR are clamped to it, which clips z-aligned edges.
export const NEAR = 0.4;
export const FAR = 90;
// Vertical screen position of the horizon, as a fraction of the height.
export const HORIZON_Y = 0.42;
export const CAMERA_HEIGHT = 1.55;

export const CORRIDOR_HALF_WIDTH = 3;
export const CORRIDOR_HEIGHT = 3.4;
// World size of one texture repeat on the corridor surfaces.
export const CORRIDOR_TILE = 2;
// Number of depth slices the corridor is cut into.
export const SEGMENTS = 28;

export const LANES = [-2, 0, 2];
export const PLAYER_Z = 4.2;
export const PLAYER_SIZE = { w: 0.9, h: 0.45, d: 1.3 };
export const PLAYER_GROUND_Y = 0.25;
export const GRAVITY = 26;
export const JUMP_VELOCITY = 9.5;

export const START_SPEED = 14;
export const MAX_SPEED = 42;
// Speed gained per second of play.
export const SPEED_GAIN = 0.45;
// Distance travelled before the first obstacle row appears.
export const FIRST_SPAWN_DISTANCE = 30;
export const GEM_BONUS = 100;

// Upper bound of quads drawn per frame; one PWGL Image each.
export const POOL_SIZE = 900;

// Horizontal pointer travel (px) that counts as a swipe instead of a tap.
export const SWIPE_THRESHOLD = 30;

export const BEST_SCORE_KEY = "pwgl-neon-corridor-best";

// Obstacle kinds: box size, texture name, tint and texture repeat size.
export const OBSTACLE_TYPES = {
  barrier: { w: 1.7, h: 0.75, d: 0.5, texture: "hazard", color: [1, 1, 1], uvScale: 0.75 },
  crate: { w: 1.7, h: 2.1, d: 1.7, texture: "crate", color: [1, 0.9, 0.85], uvScale: 1.05 },
  pillar: {
    w: 1.7,
    h: CORRIDOR_HEIGHT,
    d: 1.1,
    texture: "crate",
    color: [0.7, 0.75, 1],
    uvScale: 1.1,
  },
};
