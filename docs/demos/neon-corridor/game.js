// Game rules and the single shared state object. Pure simulation: no DOM and no drawing;
// the page reacts to start and game over through `gameEvents`.

import {
  BEST_SCORE_KEY,
  FAR,
  FIRST_SPAWN_DISTANCE,
  GEM_BONUS,
  GRAVITY,
  LANES,
  MAX_SPEED,
  OBSTACLE_TYPES,
  PLAYER_GROUND_Y,
  PLAYER_SIZE,
  PLAYER_Z,
  SPEED_GAIN,
  START_SPEED,
} from "./config.js";
import { camera, followCamera } from "./projection.js";

// mode: "title" (attract scroll), "play" or "over".
export const game = {
  mode: "title",
  time: 0,
  distance: 0,
  speed: 0,
  score: 0,
  bonus: 0,
  best: 0,
  nextSpawn: 0,
  obstacles: [],
  gems: [],
  // 0..1 screen flash: green on pickups, red on crashes.
  flash: 0,
  player: { lane: 1, x: 0, y: PLAYER_GROUND_Y, vy: 0, grounded: true, tilt: 0 },
};

export const gameEvents = { onStart: () => {}, onGameOver: () => {} };

try {
  game.best = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
} catch (e) {}

// Collision box of the ship at its current position.
export const playerBox = () => ({ x: game.player.x, y: game.player.y, z: PLAYER_Z, ...PLAYER_SIZE });

export const startGame = () => {
  Object.assign(game, { mode: "play", time: 0, distance: 0, speed: START_SPEED, bonus: 0 });
  game.nextSpawn = FIRST_SPAWN_DISTANCE;
  game.obstacles.length = 0;
  game.gems.length = 0;
  Object.assign(game.player, { lane: 1, x: 0, y: PLAYER_GROUND_Y, vy: 0, grounded: true });
  camera.shake = 0;
  gameEvents.onStart();
};

// Every row keeps at least one lane passable (empty or a jumpable barrier).
const spawnRow = (z) => {
  const types = LANES.map(() => {
    const r = Math.random();
    return r < 0.38 ? null : r < 0.62 ? "barrier" : r < 0.85 ? "crate" : "pillar";
  });
  if (types.every((type) => type === "crate" || type === "pillar")) {
    types[(Math.random() * 3) | 0] = Math.random() < 0.5 ? null : "barrier";
  }

  types.forEach((type, lane) => {
    if (type) {
      const def = OBSTACLE_TYPES[type];
      game.obstacles.push({ type, def, x: LANES[lane], y: 0, z, w: def.w, h: def.h, d: def.d });
    } else if (Math.random() < 0.55) {
      game.gems.push({ x: LANES[lane], y: 1.1, z, size: 0.55, phase: Math.random() * 6 });
    }
  });
};

// Axis-aligned box overlap; x/z are centers, y is the bottom.
const hits = (a, b) =>
  Math.abs(a.x - b.x) * 2 < a.w + b.w &&
  Math.abs(a.z - b.z) * 2 < a.d + b.d &&
  a.y < b.y + b.h &&
  b.y < a.y + a.h;

const gameOver = () => {
  game.mode = "over";
  game.flash = 1;
  camera.shake = 1;
  if (game.score > game.best) {
    game.best = game.score;
    try {
      localStorage.setItem(BEST_SCORE_KEY, String(game.best));
    } catch (e) {}
  }
  gameEvents.onGameOver();
};

// Scrolls the world towards the camera; obstacles and gems move, the corridor only
// scrolls its texture by `distance`.
const advanceWorld = (dt) => {
  game.time += dt;
  game.speed = Math.min(MAX_SPEED, START_SPEED + game.time * SPEED_GAIN);
  const step = game.speed * dt;
  game.distance += step;

  for (const obstacle of game.obstacles) obstacle.z -= step;
  for (const gem of game.gems) gem.z -= step;
  game.obstacles = game.obstacles.filter((obstacle) => obstacle.z + obstacle.d > 0);
  game.gems = game.gems.filter((gem) => gem.z > 0.5 && !gem.taken);

  game.nextSpawn -= step;
  if (game.nextSpawn <= 0) {
    spawnRow(FAR);
    game.nextSpawn = 13 + Math.random() * 9 - Math.min(5, game.time * 0.06);
  }
};

// Eases the ship to its lane and applies jump physics.
const movePlayer = (dt) => {
  const { player } = game;
  const previousX = player.x;
  player.x += (LANES[player.lane] - player.x) * Math.min(1, dt * 14);
  player.tilt = (player.x - previousX) / Math.max(dt, 0.001);
  player.vy -= GRAVITY * dt;
  player.y += player.vy * dt;
  if (player.y <= PLAYER_GROUND_Y) {
    player.y = PLAYER_GROUND_Y;
    player.vy = 0;
    player.grounded = true;
  }
};

const checkCollisions = () => {
  const { player } = game;
  const body = playerBox();
  if (game.obstacles.some((obstacle) => hits(body, obstacle))) gameOver();

  for (const gem of game.gems) {
    if (Math.abs(gem.x - player.x) < 1 && Math.abs(gem.z - PLAYER_Z) < 1 && Math.abs(gem.y - player.y) < 1.4) {
      gem.taken = true;
      game.bonus += GEM_BONUS;
      game.flash = Math.max(game.flash, 0.35);
    }
  }
};

export const update = (dt) => {
  if (game.mode === "play") {
    advanceWorld(dt);
    movePlayer(dt);
    checkCollisions();
    game.score = Math.floor(game.distance) + game.bonus;
  }
  followCamera(game.player, dt);
  game.flash = Math.max(0, game.flash - dt * 2);
};
