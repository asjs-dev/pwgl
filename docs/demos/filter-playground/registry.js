// Every concrete PWGL filter with its parameter descriptors. The panel, the chain and the
// snippet are all driven by this list. `texture` names the shared procedural texture a
// texture filter gets (see textures.js).

import {
  BlurFilter,
  BrightnessFilter,
  ChromaticAberrationFilter,
  ContrastFilter,
  DisplacementFilter,
  EdgeDetectFilter,
  GammaFilter,
  GlowFilter,
  GrayscaleFilter,
  HueRotateFilter,
  InvertFilter,
  MaskFilter,
  PixelateFilter,
  PosterizeFilter,
  RainbowFilter,
  SaturateFilter,
  SepiaFilter,
  SharpenFilter,
  TintFilter,
  TintType,
} from "../../assets/pwgl.es.js";
import { TEXTURE_PARAMS, range, select } from "./registry-advanced.js";

const toOptions = (types, prefix) =>
  Object.entries(types).map(([key, value]) => ({
    label: key[0] + key.slice(1).toLowerCase(),
    value,
    code: `${prefix}.${key}`,
  }));

const intensity = (label, min, max, step, initial) => range("intensity", label, min, max, step, 1, initial);

// Blur and Glow sample on two axes, the others read only the X intensity.
const sampling = (initial) => [
  range("intensityX", "Radius X", 0, 20, 0.5, 1, initial),
  range("intensityY", "Radius Y", 0, 20, 0.5, 1, initial),
];

const filter = (Filter, name, label, params = [], extra = {}) => ({ Filter, name, label, params, ...extra });

export const FILTERS = [
  filter(BlurFilter, "BlurFilter", "Blur", sampling(4)),
  filter(BrightnessFilter, "BrightnessFilter", "Brightness", [intensity("Brightness", 0, 3, 0.01, 1.3)]),
  filter(ChromaticAberrationFilter, "ChromaticAberrationFilter", "Chromatic aberration", [
    intensity("Offset (px)", -30, 30, 0.5, 6),
  ]),
  filter(ContrastFilter, "ContrastFilter", "Contrast", [intensity("Contrast", 0, 3, 0.01, 1.5)]),
  filter(
    DisplacementFilter,
    "DisplacementFilter",
    "Displacement",
    [intensity("Strength (px)", 0, 80, 1, 20), ...TEXTURE_PARAMS],
    { texture: "displacement" },
  ),
  filter(EdgeDetectFilter, "EdgeDetectFilter", "Edge detect", [intensity("Strength", 0, 5, 0.05, 1)]),
  filter(GammaFilter, "GammaFilter", "Gamma", [intensity("Gamma", 0.1, 4, 0.01, 1.6)]),
  filter(GlowFilter, "GlowFilter", "Glow", [
    ...sampling(4),
    range("threshold", "Threshold", 0, 1, 0.01, 0.7, 0.5),
    range("knee", "Knee", 0, 1, 0.01, 1),
    range("bloom", "Bloom", 0, 0.5, 0.005, 0.01, 0.1),
  ]),
  filter(GrayscaleFilter, "GrayscaleFilter", "Grayscale"),
  filter(HueRotateFilter, "HueRotateFilter", "Hue rotate", [intensity("Angle (rad)", -3.14, 3.14, 0.01, 1.57)]),
  filter(InvertFilter, "InvertFilter", "Invert"),
  filter(
    MaskFilter,
    "MaskFilter",
    "Mask",
    [select("type", "Channel", toOptions(MaskFilter.Type, "MaskFilter.Type"), MaskFilter.Type.RED), ...TEXTURE_PARAMS],
    { texture: "mask" },
  ),
  filter(PixelateFilter, "PixelateFilter", "Pixelate", [intensity("Pixel size", 1, 64, 1, 8)]),
  filter(PosterizeFilter, "PosterizeFilter", "Posterize", [intensity("Levels", 1, 32, 1, 6)]),
  filter(RainbowFilter, "RainbowFilter", "Rainbow", [intensity("Strength", 0, 8, 0.05, 2)]),
  filter(SaturateFilter, "SaturateFilter", "Saturate", [intensity("Saturation", 0, 3, 0.01, 2)]),
  filter(SepiaFilter, "SepiaFilter", "Sepia"),
  filter(SharpenFilter, "SharpenFilter", "Sharpen", [intensity("Strength", 0, 3, 0.05, 1)]),
  filter(TintFilter, "TintFilter", "Tint", [
    range("r", "Red", 0, 3, 0.01, 1, 1.2),
    range("g", "Green", 0, 3, 0.01, 1, 0.8),
    range("b", "Blue", 0, 3, 0.01, 1, 0.5),
    range("a", "Alpha", 0, 3, 0.01, 1),
    select("type", "Type", toOptions(TintType, "TintType"), TintType.MULTIPLY),
  ]),
];

export const findFilter = (name) => FILTERS.find((entry) => entry.name === name);

// Values live in Float32Arrays (booleans as 0/1), so compare as numbers with a tolerance.
export const isDefault = (param, value) => Math.abs(Number(value) - Number(param.default)) < 1e-5;
