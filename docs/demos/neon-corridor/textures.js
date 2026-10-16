// Procedural neon textures: each one is drawn on a small 2D canvas once at startup
// and uploaded as a PWGL Texture.

import { Texture } from "../../assets/pwgl.es.js";

const createCanvas = (size, draw) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  draw(canvas.getContext("2d"), size);
  return canvas;
};

// Strokes the path built by `draw` with a glow of the same color.
const glowLine = (ctx, color, width, draw) => {
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = width * 3;
  ctx.lineWidth = width;
  ctx.beginPath();
  draw();
  ctx.stroke();
  ctx.shadowBlur = 0;
};

const drawGrid = (bg, line) =>
  createCanvas(128, (ctx, s) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);
    glowLine(ctx, line, 4, () => {
      ctx.rect(2, 2, s - 4, s - 4);
    });
    glowLine(ctx, line + "55", 2, () => {
      ctx.moveTo(s / 2, 0);
      ctx.lineTo(s / 2, s);
      ctx.moveTo(0, s / 2);
      ctx.lineTo(s, s / 2);
    });
  });

const drawWall = () =>
  createCanvas(128, (ctx, s) => {
    ctx.fillStyle = "#0b0420";
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "#170a3a";
    ctx.fillRect(8, 8, s - 16, s * 0.55);
    glowLine(ctx, "#00e5ff", 3, () => {
      ctx.moveTo(0, s * 0.75);
      ctx.lineTo(s, s * 0.75);
    });
    glowLine(ctx, "#7a3cff", 2, () => {
      ctx.moveTo(4, 0);
      ctx.lineTo(4, s);
    });
  });

// Yellow-black diagonal stripes for the jumpable barriers.
const drawHazard = () =>
  createCanvas(128, (ctx, s) => {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "#ffd400";
    for (let i = -s; i < s * 2; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 16, 0);
      ctx.lineTo(i + 16 - s, s);
      ctx.lineTo(i - s, s);
      ctx.fill();
    }
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, s - 6, s - 6);
  });

const drawCrate = () =>
  createCanvas(128, (ctx, s) => {
    ctx.fillStyle = "#3a1206";
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "#5c2210";
    ctx.fillRect(14, 14, s - 28, s - 28);
    glowLine(ctx, "#ff6a00", 6, () => {
      ctx.rect(5, 5, s - 10, s - 10);
      ctx.moveTo(10, 10);
      ctx.lineTo(s - 10, s - 10);
      ctx.moveTo(s - 10, 10);
      ctx.lineTo(10, s - 10);
    });
  });

const drawGem = () =>
  createCanvas(64, (ctx, s) => {
    const gradient = ctx.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s * 0.7);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.4, "#7dffb0");
    gradient.addColorStop(1, "#00a850");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = "#eafff2";
    ctx.lineWidth = 5;
    ctx.strokeRect(2.5, 2.5, s - 5, s - 5);
  });

const drawShip = () =>
  createCanvas(64, (ctx, s) => {
    ctx.fillStyle = "#0a2a3a";
    ctx.fillRect(0, 0, s, s);
    glowLine(ctx, "#00ffff", 4, () => ctx.rect(4, 4, s - 8, s - 8));
    ctx.fillStyle = "#c8ffff";
    ctx.fillRect(s * 0.35, s * 0.35, s * 0.3, s * 0.3);
  });

// Needs a live WebGL context, so call it after the Context is created.
export const createTextures = () => ({
  floor: new Texture(drawGrid("#08021a", "#ff2bd6")),
  ceiling: new Texture(drawGrid("#020814", "#2b6bff")),
  wall: new Texture(drawWall()),
  hazard: new Texture(drawHazard()),
  crate: new Texture(drawCrate()),
  gem: new Texture(drawGem()),
  ship: new Texture(drawShip()),
});
