import { areTwoRectsCollided } from "../utils/collisionDetection";
import type { AtlasJson, AtlasJsonAsset, AtlasJsonOffset, AtlasJsonRect } from "./parser";
import type { Rect } from "../utils/types";

type AtlasSource = Blob & { name: string };
type AtlasImage = HTMLImageElement | HTMLCanvasElement;
type AtlasJsonAssetRectKey = "exact" | "e" | "percent" | "p";
type AtlasJsonAssetFlagKey = "rotated" | "r";
type AtlasJsonAssetOffsetKey = "offset" | "o";
type PlacementScore = {
  side: number;
  area: number;
  y: number;
  x: number;
};
type Placement = Rect & {
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
  placedWidth: number;
  placedHeight: number;
  extrude: number;
  rotated: boolean;
};
type PlacementCandidate = Rect & {
  placedWidth: number;
  placedHeight: number;
  rotated: boolean;
  score: PlacementScore;
};
type PlacementContext = {
  positions: Rect[];
  width: number;
  height: number;
  xValues: number[];
  yValues: number[];
};
export type AtlasOptions = {
  images: AtlasSource[];
  useExactValues?: boolean;
  usePercentValues?: boolean;
  trim?: boolean;
  addBase64?: boolean;
  addGaps?: boolean;
  extrude?: number;
  allowRotation?: boolean;
  powerOfTwo?: boolean;
  shortKeys?: boolean;
  maxTextureSize?: number;
};
export type AtlasResult = {
  canvas: HTMLCanvasElement;
  json: AtlasJson;
  warnings: string[];
};

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d") as CanvasRenderingContext2D;
context.imageSmoothingEnabled = false;

let canvasWidth = 0;
let canvasHeight = 0;
let sourceList: AtlasSource[] = [];
let imageList: AtlasImage[] = [];
let json: AtlasJson;
let percent = 0;
let useExactValues = true;
let usePercentValues = true;
let trim = false;
let addBase64 = false;
let addGaps = false;
let extrude = 0;
let allowRotation = false;
let powerOfTwo = false;
let shortKeys = false;
let maxTextureSize = 4096;

const log = (...args: unknown[]): void => {
  console.log(...args);
};

const getNextPowerOfTwo = (value: number): number => 2 ** Math.ceil(Math.log2(value));
const getJsonKey = (longKey: string, shortKey: string): string => (shortKeys ? shortKey : longKey);
const getOffsetJsonKey = (asset: AtlasJsonAsset): AtlasJsonAssetOffsetKey =>
  shortKeys && !("o" in asset) ? "o" : "offset";
const getImageSize = (image: AtlasImage): { width: number; height: number } => ({
  width: image instanceof HTMLImageElement ? image.naturalWidth : image.width,
  height: image instanceof HTMLImageElement ? image.naturalHeight : image.height,
});
const createRect = (x: number, y: number, width: number, height: number): AtlasJsonRect => ({
  x,
  y,
  [getJsonKey("width", "w")]: width,
  [getJsonKey("height", "h")]: height,
});

const parseFileName = (fileName: string): { name: string; offset: AtlasJsonOffset | null } => {
  const result = fileName.match(/^(.*)_offset_(-?\d+(?:\.\d+)?)_(-?\d+(?:\.\d+)?)(.*)$/);

  if (!result) {
    return {
      name: fileName,
      offset: null,
    };
  }

  const [, name, x, y, suffix = ""] = result;

  return {
    name: `${name}${suffix}`,
    offset: {
      x: Number(x),
      y: Number(y),
    },
  };
};

const copyImageMetadata = (from: AtlasImage, to: AtlasImage): void => {
  to.setAttribute("file-name", from.getAttribute("file-name") ?? "");

  const offsetX = from.getAttribute("offset-x");
  const offsetY = from.getAttribute("offset-y");

  if (offsetX !== null && offsetY !== null) {
    to.setAttribute("offset-x", offsetX);
    to.setAttribute("offset-y", offsetY);
  }
};

const getImageOffset = (image: AtlasImage): AtlasJsonOffset | null => {
  const offsetX = image.getAttribute("offset-x");
  const offsetY = image.getAttribute("offset-y");

  if (offsetX === null || offsetY === null) {
    return null;
  }

  const x = Number(offsetX);
  const y = Number(offsetY);

  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
};

const trimImage = (image: AtlasImage): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.imageSmoothingEnabled = false;

  let { width, height } = getImageSize(image);

  canvas.width = width;
  canvas.height = height;
  context.imageSmoothingEnabled = false;

  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let minX = width;
  let minY = height;

  let maxX = -1;
  let maxY = -1;

  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] === 0) {
      continue;
    }

    const position = i / 4;
    const x = position % width;
    const y = Math.floor(position / width);

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (maxX === -1) {
    return canvas;
  }

  width = maxX - minX + 1;
  height = maxY - minY + 1;

  canvas.width = width;
  canvas.height = height;
  context.imageSmoothingEnabled = false;

  context.drawImage(image, minX, minY, width, height, 0, 0, width, height);

  return canvas;
};

const drawExtrudedImage = (
  image: AtlasImage,
  x: number,
  y: number,
  width: number,
  height: number,
  amount: number,
): void => {
  const imageX = x + amount;
  const imageY = y + amount;

  context.drawImage(image, imageX, imageY);

  if (amount === 0) {
    return;
  }

  context.drawImage(image, 0, 0, 1, height, x, imageY, amount, height);
  context.drawImage(image, width - 1, 0, 1, height, imageX + width, imageY, amount, height);
  context.drawImage(image, 0, 0, width, 1, imageX, y, width, amount);
  context.drawImage(image, 0, height - 1, width, 1, imageX, imageY + height, width, amount);

  context.drawImage(image, 0, 0, 1, 1, x, y, amount, amount);
  context.drawImage(image, width - 1, 0, 1, 1, imageX + width, y, amount, amount);
  context.drawImage(image, 0, height - 1, 1, 1, x, imageY + height, amount, amount);
  context.drawImage(image, width - 1, height - 1, 1, 1, imageX + width, imageY + height, amount, amount);
};

const createRotatedImage = (image: AtlasImage, width: number, height: number): HTMLCanvasElement => {
  const rotatedCanvas = document.createElement("canvas");
  const rotatedContext = rotatedCanvas.getContext("2d") as CanvasRenderingContext2D;

  rotatedCanvas.width = height;
  rotatedCanvas.height = width;
  rotatedContext.imageSmoothingEnabled = false;
  rotatedContext.translate(height, 0);
  rotatedContext.rotate(Math.PI / 2);
  rotatedContext.drawImage(image, 0, 0);

  return rotatedCanvas;
};

const getJsonImage = (): Record<string, string | number> => json[getJsonKey("image", "i") as "image" | "i"]!;
const getJsonAssets = (): Record<string, AtlasJsonAsset> => json[getJsonKey("assets", "a") as "assets" | "a"]!;

const imageLoaded = (
  resolve: (value: AtlasResult) => void,
  reject: (reason?: unknown) => void,
  image: AtlasImage,
): void => {
  if (trim) {
    const result = trimImage(image);
    copyImageMetadata(image, result);
    addImageToList(resolve, reject, result);
  } else {
    addImageToList(resolve, reject, image);
  }
};

const addImageToList = (
  resolve: (value: AtlasResult) => void,
  reject: (reason?: unknown) => void,
  image: AtlasImage,
): void => {
  imageList.push(image);
  setPercent(percent + (1 / sourceList.length) * 0.3);

  if (imageList.length === sourceList.length) {
    sortImages(resolve, reject);
  }
};

const imageLoadFail = (reject: (reason?: unknown) => void, reason: unknown): void => {
  reject(reason);
  log(`Atlas creation failed`);
};

const createImage = (from: AtlasSource): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(from);
    const revokeUrl = () => URL.revokeObjectURL(url);
    const fileName = parseFileName(from.name);

    image.setAttribute("file-name", fileName.name);
    if (fileName.offset) {
      image.setAttribute("offset-x", fileName.offset.x.toString());
      image.setAttribute("offset-y", fileName.offset.y.toString());
    }
    image.addEventListener(
      "load",
      () => {
        revokeUrl();
        resolve(image);
      },
      { once: true },
    );
    image.addEventListener(
      "error",
      (event) => {
        revokeUrl();
        reject(event);
      },
      { once: true },
    );
    image.src = url;
  });

const sortImages = (resolve: (value: AtlasResult) => void, reject: (reason?: unknown) => void): void => {
  imageList.sort((a, b) => {
    const { width: aWidth, height: aHeight } = getImageSize(a);
    const { width: bWidth, height: bHeight } = getImageSize(b);

    const aSize = aWidth * aHeight;
    const bSize = bWidth * bHeight;

    return aSize === bSize ? 0 : bSize - aSize;
  });

  setPercent(percent + 0.1);
  createAtlasAndJson(resolve, reject);
};

const isScoreBetter = (score: PlacementScore, bestScore: PlacementScore | null): boolean =>
  !bestScore ||
  score.side < bestScore.side ||
  (score.side === bestScore.side && score.area < bestScore.area) ||
  (score.side === bestScore.side && score.area === bestScore.area && score.y < bestScore.y) ||
  (score.side === bestScore.side && score.area === bestScore.area && score.y === bestScore.y && score.x < bestScore.x);

const createPlacementContext = (positions: Rect[]): PlacementContext => {
  const xValues = new Set([0]);
  const yValues = new Set([0]);
  let width = 0;
  let height = 0;

  for (let position of positions) {
    xValues.add(position.x);
    xValues.add(position.x + position.width);
    yValues.add(position.y);
    yValues.add(position.y + position.height);
    width = Math.max(width, position.x + position.width);
    height = Math.max(height, position.y + position.height);
  }

  return {
    positions,
    width,
    height,
    xValues: [...xValues].sort((a, b) => a - b),
    yValues: [...yValues].sort((a, b) => a - b),
  };
};

const findGap = (
  placementContext: PlacementContext,
  width: number,
  height: number,
): { x: number; y: number; score: PlacementScore } | null => {
  let bestGap = null;
  let bestScore = null;

  for (let y of placementContext.yValues) {
    for (let x of placementContext.xValues) {
      const rect = {
        x,
        y,
        width,
        height,
      };

      let found = true;

      for (let position of placementContext.positions) {
        if (areTwoRectsCollided(rect, position)) {
          found = false;
          break;
        }
      }

      if (found) {
        const maxX = Math.max(placementContext.width, rect.x + rect.width);
        const maxY = Math.max(placementContext.height, rect.y + rect.height);

        const score = {
          side: Math.max(maxX, maxY),
          area: maxX * maxY,
          y,
          x,
        };

        if (isScoreBetter(score, bestScore)) {
          bestGap = { x, y, score };
          bestScore = score;
        }
      }
    }
  }

  return bestGap;
};

const findPlacement = (
  positions: Rect[],
  imageWidth: number,
  imageHeight: number,
  extrudeSize: number,
  additiveGap: number,
): PlacementCandidate | null => {
  const placementContext = createPlacementContext(positions);
  const variants = [
    {
      rotated: false,
      placedWidth: imageWidth,
      placedHeight: imageHeight,
    },
  ];

  if (allowRotation && imageWidth !== imageHeight) {
    variants.push({
      rotated: true,
      placedWidth: imageHeight,
      placedHeight: imageWidth,
    });
  }

  let bestPlacement: PlacementCandidate | null = null;

  for (let variant of variants) {
    const allocatedWidth = variant.placedWidth + extrudeSize * 2 + additiveGap;
    const allocatedHeight = variant.placedHeight + extrudeSize * 2 + additiveGap;
    const gap = findGap(placementContext, allocatedWidth, allocatedHeight);

    if (!gap) {
      continue;
    }

    const placement = {
      ...variant,
      x: gap.x,
      y: gap.y,
      width: allocatedWidth,
      height: allocatedHeight,
      score: gap.score,
    };

    if (!bestPlacement || isScoreBetter(placement.score, bestPlacement.score)) {
      bestPlacement = placement;
    }
  }

  return bestPlacement;
};

const createAtlasAndJson = (resolve: (value: AtlasResult) => void, reject: (reason?: unknown) => void): void => {
  const positions: Placement[] = [];
  const positionsByName: Record<string, Placement> = Object.create(null);

  const additiveGap = addGaps ? 1 : 0;
  const extrudeSize = Math.max(0, Number.isFinite(extrude) ? extrude : 0);

  imageList.forEach((image) => {
    const fileName = image.getAttribute("file-name") ?? "";
    const { width: imageWidth, height: imageHeight } = getImageSize(image);
    const placement = findPlacement(positions, imageWidth, imageHeight, extrudeSize, additiveGap);

    if (!placement) {
      reject(["placement value is null:", fileName, placement, canvasWidth, canvasHeight]);
      throw new Error("Atlas placement failed");
    }

    setPercent(percent + (0.5 / imageList.length) * 0.5);

    const position: Placement = {
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
      imageX: placement.x + extrudeSize,
      imageY: placement.y + extrudeSize,
      imageWidth,
      imageHeight,
      placedWidth: placement.placedWidth,
      placedHeight: placement.placedHeight,
      extrude: extrudeSize,
      rotated: placement.rotated,
    };

    positions.push(position);
    positionsByName[fileName] = position;

    const object: AtlasJsonAsset = {};
    if (useExactValues) {
      object[getJsonKey("exact", "e") as AtlasJsonAssetRectKey] = createRect(
        position.imageX,
        position.imageY,
        position.placedWidth,
        position.placedHeight,
      );
    }
    if (position.rotated) {
      object[getJsonKey("rotated", "r") as AtlasJsonAssetFlagKey] = 1;
    }
    const offset = getImageOffset(image);
    if (offset) {
      object[getOffsetJsonKey(object)] = offset;
    }

    getJsonAssets()[fileName] = object;

    setPercent(percent + (0.25 / imageList.length) * 0.25);
  });

  canvasWidth = canvasHeight = 0;

  imageList.forEach((image) => {
    const fileName = image.getAttribute("file-name") ?? "";
    const position = positionsByName[fileName];
    const maxX = position.imageX + position.placedWidth + position.extrude;
    const maxY = position.imageY + position.placedHeight + position.extrude;
    if (canvasWidth < maxX) canvasWidth = maxX;
    if (canvasHeight < maxY) canvasHeight = maxY;
  });

  if (powerOfTwo) {
    canvasWidth = getNextPowerOfTwo(canvasWidth);
    canvasHeight = getNextPowerOfTwo(canvasHeight);
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  context.imageSmoothingEnabled = false;

  imageList.forEach((image) => {
    const fileName = image.getAttribute("file-name") ?? "";
    const position = positionsByName[fileName];
    const sourceImage = position.rotated ? createRotatedImage(image, position.imageWidth, position.imageHeight) : image;

    drawExtrudedImage(
      sourceImage,
      position.x,
      position.y,
      position.placedWidth,
      position.placedHeight,
      position.extrude,
    );

    if (usePercentValues) {
      getJsonAssets()[fileName][getJsonKey("percent", "p") as "percent" | "p"] = createRect(
        position.imageX / canvasWidth,
        position.imageY / canvasHeight,
        (position.imageX + position.placedWidth) / canvasWidth,
        (position.imageY + position.placedHeight) / canvasHeight,
      );
    }

    setPercent(percent + (0.25 / imageList.length) * 0.25);
  });

  const warnings = [];

  if (
    Number.isFinite(maxTextureSize) &&
    maxTextureSize > 0 &&
    (canvasWidth > maxTextureSize || canvasHeight > maxTextureSize)
  ) {
    warnings.push(`Atlas size ${canvasWidth}x${canvasHeight} exceeds max texture size ${maxTextureSize}.`);
  }

  warnings.forEach((warning) => log(warning));

  if (addBase64) {
    getJsonImage()[getJsonKey("base64", "b")] = canvas.toDataURL("image/png");
  }

  getJsonImage()[getJsonKey("width", "w")] = canvasWidth;
  getJsonImage()[getJsonKey("height", "h")] = canvasHeight;

  resolve({
    canvas,
    json,
    warnings,
  });

  setPercent(1);

  log(` - Width: ${canvasWidth}`);
  log(` - Height: ${canvasHeight}`);
  log(`Atlas created`);
};

const setPercent = (value: number): void => {
  percent = value;
  log(`Progress: ${Math.round(percent * 100)}%`);
};

export const create = ({
  images,
  useExactValues: useExactValuesParam = true,
  usePercentValues: usePercentValuesParam = true,
  trim: trimParam = false,
  addBase64: addBase64Param = false,
  addGaps: addGapsParam = false,
  extrude: extrudeParam = 0,
  allowRotation: allowRotationParam = false,
  powerOfTwo: powerOfTwoParam = false,
  shortKeys: shortKeysParam = false,
  maxTextureSize: maxTextureSizeParam = 4096,
}: AtlasOptions): Promise<AtlasResult> =>
  new Promise((resolve, reject) => {
    log(`Create texture atlas from images`);
    log(` - Images: ${images.length}`);
    log(` - Use exact values: ${useExactValuesParam}`);
    log(` - Use percent values: ${usePercentValuesParam}`);
    log(` - Trim images: ${trimParam}`);
    log(` - Add Base64 image into json file: ${addBase64Param}`);
    log(` - Add gaps between tiles: ${addGapsParam}`);
    log(` - Extrude pixels: ${extrudeParam}`);
    log(` - Allow rotation: ${allowRotationParam}`);
    log(` - Power of two size: ${powerOfTwoParam}`);
    log(` - Short json keys: ${shortKeysParam}`);
    log(` - Max texture size: ${maxTextureSizeParam}`);

    canvasWidth = 0;
    canvasHeight = 0;
    sourceList = images;
    imageList = [];
    useExactValues = useExactValuesParam;
    usePercentValues = usePercentValuesParam;
    trim = trimParam;
    addBase64 = addBase64Param;
    addGaps = addGapsParam;
    extrude = extrudeParam;
    allowRotation = allowRotationParam;
    powerOfTwo = powerOfTwoParam;
    shortKeys = shortKeysParam;
    maxTextureSize = maxTextureSizeParam;
    setPercent(0);

    json = {
      [getJsonKey("image", "i")]: {},
      [getJsonKey("assets", "a")]: {},
    };

    images.forEach((source) =>
      createImage(source)
        .then((image) => imageLoaded(resolve, reject, image))
        .catch((reason) => imageLoadFail(reject, reason)),
    );
  });
