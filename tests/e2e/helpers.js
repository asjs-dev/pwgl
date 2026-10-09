import { Context, Image, Stage2D, Texture } from "../../src/exports";
import { instrumentContext } from "./metrics";

export const WIDTH = 640;
export const HEIGHT = 360;

// Pixel-checked cases use a small canvas so their coordinates stay readable.
export const SMALL_WIDTH = 256;
export const SMALL_HEIGHT = 144;
export const BACKGROUND = [13, 13, 20, 255];

export const createContext = (width = WIDTH, height = HEIGHT) => {
  const canvas = document.createElement("canvas");
  const context = new Context({ canvas, contextAttributes: { preserveDrawingBuffer: true, antialias: false } });
  context.setCanvasSize(width, height);
  instrumentContext(context);
  return context;
};

export const createSmallContext = () => createContext(SMALL_WIDTH, SMALL_HEIGHT);

export const createAtlasSource = (colors = ["#ff5c5c", "#57d985", "#58a6ff", "#ffd166"]) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");

  colors.forEach((color, index) => {
    const x = (index & 1) * 64;
    const y = (index >> 1) * 64;
    context.fillStyle = color;
    context.fillRect(x, y, 64, 64);
    context.fillStyle = "#ffffffbb";
    context.beginPath();
    context.arc(x + 32, y + 32, 18, 0, Math.PI * 2);
    context.fill();
  });

  return canvas;
};

export const createAtlas = () => new Texture(createAtlasSource());

export const createImage = (texture, x, y, colorIndex = 0, size = 88) => {
  const image = new Image(texture);
  const cropX = (colorIndex & 1) * 0.5;
  const cropY = (colorIndex >> 1) * 0.5;
  image.transform.x = x;
  image.transform.y = y;
  image.transform.width = size;
  image.transform.height = size;
  image.textureCrop.setRect({
    x: cropX,
    y: cropY,
    width: cropX + 0.5,
    height: cropY + 0.5,
  });
  return image;
};

export const setRendererSize = (renderer) => renderer.setSize(WIDTH, HEIGHT);

// ---------- canvas textures with exactly known colors ----------

export const createCanvas = (width, height, draw) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  return canvas;
};

export const solid = (color) =>
  createCanvas(8, 8, (context, width, height) => {
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);
  });

export const quadrants = (colors) =>
  createCanvas(64, 64, (context) =>
    colors.forEach((color, index) => {
      context.fillStyle = color;
      context.fillRect((index & 1) * 32, (index >> 1) * 32, 32, 32);
    }),
  );

export const checker = (a, b) =>
  createCanvas(16, 16, (context) => {
    context.fillStyle = a;
    context.fillRect(0, 0, 16, 16);
    context.fillStyle = b;
    context.fillRect(8, 0, 8, 8);
    context.fillRect(0, 8, 8, 8);
  });

// Red, green, blue and yellow bars, then a black-to-white ramp.
export const testCard = () =>
  createCanvas(128, 72, (context) => {
    ["#ff0000", "#00ff00", "#0000ff", "#ffff00"].forEach((color, index) => {
      context.fillStyle = color;
      context.fillRect(index * 16, 0, 16, 72);
    });
    const gradient = context.createLinearGradient(64, 0, 128, 0);
    gradient.addColorStop(0, "#000");
    gradient.addColorStop(1, "#fff");
    context.fillStyle = gradient;
    context.fillRect(64, 0, 64, 72);
  });

export const rgba = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
  255,
];

export const createSprite = (texture, x, y, width, height) => {
  const image = new Image(texture);
  image.transform.x = x;
  image.transform.y = y;
  image.transform.width = width;
  image.transform.height = height;
  return image;
};

export const createSmallStage = (context, config = {}) => {
  const stage = new Stage2D({ context, ...config });
  stage.setSize(SMALL_WIDTH, SMALL_HEIGHT);
  stage.clearBeforeRender = true;
  stage.clearColor.set(0.05, 0.05, 0.08, 1);
  return stage;
};
