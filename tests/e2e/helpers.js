import { Context, Image, Texture } from "../../src/exports";
import { instrumentContext } from "./metrics";

export const WIDTH = 640;
export const HEIGHT = 360;

export const createContext = () => {
  const canvas = document.createElement("canvas");
  const context = new Context({ canvas, contextAttributes: { preserveDrawingBuffer: true } });
  context.setCanvasSize(WIDTH, HEIGHT);
  instrumentContext(context);
  return context;
};

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
