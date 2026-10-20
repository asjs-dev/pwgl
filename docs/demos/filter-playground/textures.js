// Procedural textures: the source scene parts plus the displacement and mask maps, each
// drawn on a 2D canvas once at startup and uploaded as a PWGL Texture.

import { Texture } from "../../assets/pwgl.es.js";

const createCanvas = (width, height, draw) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  return canvas;
};

// Fills every pixel from `pixel(x, y)` → [r, g, b, a] (0-255).
const createPixelCanvas = (size, pixel) =>
  createCanvas(size, size, (ctx) => {
    const imageData = ctx.createImageData(size, size);
    const { data } = imageData;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) data.set(pixel(x / size, y / size), (y * size + x) * 4);
    }
    ctx.putImageData(imageData, 0, 0);
  });

// Sky gradient, sun, grid, hills and a label: smooth areas, hard edges and fine lines.
const drawBackdrop = () =>
  createCanvas(1024, 640, (ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#0b1a4a");
    sky.addColorStop(0.55, "#d94f8a");
    sky.addColorStop(1, "#ffcf6b");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#fff4c2";
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.42, h * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h * 0.25);
      ctx.stroke();
    }

    ctx.fillStyle = "#1b0f33";
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) ctx.lineTo(x, h * 0.72 + Math.sin(x * 0.012) * h * 0.06);
    ctx.lineTo(w, h);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px sans-serif";
    ctx.fillText("PWGL", 48, 120);
    ctx.font = "20px monospace";
    ctx.fillText("filter playground · 0123456789", 52, 156);
  });

// Color wheel with a hard outline.
const drawWheel = () =>
  createCanvas(256, 256, (ctx, s) => {
    const r = s / 2 - 8;
    for (let a = 0; a < 360; a += 2) {
      ctx.fillStyle = `hsl(${a}, 100%, 55%)`;
      ctx.beginPath();
      ctx.moveTo(s / 2, s / 2);
      ctx.arc(s / 2, s / 2, r, (a * Math.PI) / 180, ((a + 3) * Math.PI) / 180);
      ctx.fill();
    }
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  });

// Checkerboard card: high-frequency detail for blur, sharpen and edge detect.
const drawChecker = () =>
  createCanvas(256, 256, (ctx, s) => {
    const cell = s / 16;
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = (x + y) & 1 ? "#14e0a0" : "#0a2a40";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(4, 4, s - 8, s - 8);
  });

// R and G hold the X and Y offsets around 0.5, as DisplacementFilter expects.
const drawDisplacementMap = () =>
  createPixelCanvas(256, (u, v) => [
    128 + 127 * Math.sin(v * Math.PI * 6),
    128 + 127 * Math.cos(u * Math.PI * 6),
    128,
    255,
  ]);

// One shape per channel so each MaskFilter type shows something different:
// R radial spot, G horizontal stripes, B vertical gradient, A diagonal checker.
const drawMaskMap = () =>
  createPixelCanvas(256, (u, v) => {
    const spot = Math.max(0, 1 - Math.hypot(u - 0.5, v - 0.5) * 2.2);
    const stripes = Math.floor(v * 12) & 1;
    const checker = (Math.floor((u + v) * 8) + Math.floor((u - v + 1) * 8)) & 1;
    return [spot * 255, stripes * 255, v * 255, checker ? 255 : 64];
  });

// ColorLUTFilter strip: 16 slices of 16 x 16 side by side (256 x 16), red along a slice,
// green along the rows, blue selects the slice. `grade` maps an identity color (0-1) to the
// graded one; the identity grade reproduces the input. Opaque, as the filter requires.
const LUT_SIZE = 16;
const drawLut = (grade) =>
  createCanvas(LUT_SIZE * LUT_SIZE, LUT_SIZE, (ctx, w, h) => {
    const imageData = ctx.createImageData(w, h);
    const { data } = imageData;
    const max = LUT_SIZE - 1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const color = grade((x % LUT_SIZE) / max, y / max, Math.floor(x / LUT_SIZE) / max);
        data.set([...color.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255)), 255], (y * w + x) * 4);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  });

// Teal shadows, warm highlights and a gentle S-curve.
const tealOrange = (r, g, b) => {
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const s = (c) => c * c * (3 - 2 * c);
  return [s(r) + (l - 0.5) * 0.25, s(g) + 0.04, s(b) + (0.5 - l) * 0.3];
};

// Needs a live WebGL context, so call it after the Context is created.
export const createTextures = () => ({
  backdrop: new Texture(drawBackdrop()),
  wheel: new Texture(drawWheel()),
  checker: new Texture(drawChecker()),
  displacement: new Texture(drawDisplacementMap()),
  mask: new Texture(drawMaskMap()),
  lut: new Texture(drawLut(tealOrange)),
});
