import { Context } from "./core/Context";
import { Buffer } from "./core/Buffer";
import { Utils, Const } from "./core/Utils";

import { BlendMode } from "./rendering/BlendMode";

import { Texture } from "./textures/Texture";
import { Framebuffer } from "./textures/Framebuffer";

import { Item } from "./display/Item";
import { BaseDrawable } from "./display/BaseDrawable";
import { Light } from "./display/Light";
import { AnimatedImage } from "./display/AnimatedImage";
import { Container } from "./display/Container";
import { Image } from "./display/Image";
import { Text } from "./display/Text";

import { BaseRenderer } from "./renderers/BaseRenderer";
import { BatchRenderer } from "./renderers/BatchRenderer";
import { FilterRenderer } from "./renderers/FilterRenderer";
import { NormalMapRenderer } from "./renderers/NormalMapRenderer";
import { AmbientOcclusionMapRenderer } from "./renderers/AmbientOcclusionMapRenderer";
import { LightRenderer } from "./renderers/LightRenderer";
import { Stage2D } from "./renderers/Stage2D";

import { BaseFilter } from "./filters/BaseFilter";
import { BaseKernelFilter } from "./filters/BaseKernelFilter";
import { BaseSamplingFilter } from "./filters/BaseSamplingFilter";
import { BaseTextureFilter } from "./filters/BaseTextureFilter";
import { DisplacementFilter } from "./filters/DisplacementFilter";
import { MaskFilter } from "./filters/MaskFilter";
import { PixelateFilter } from "./filters/PixelateFilter";
import { EdgeDetectFilter } from "./filters/EdgeDetectFilter";
import { SharpenFilter } from "./filters/SharpenFilter";
import { SaturateFilter } from "./filters/SaturateFilter";
import { GrayscaleFilter } from "./filters/GrayscaleFilter";
import { SepiaFilter } from "./filters/SepiaFilter";
import { InvertFilter } from "./filters/InvertFilter";
import { TintFilter } from "./filters/TintFilter";
import { ColorLimitFilter } from "./filters/ColorLimitFilter";
import { VignetteFilter } from "./filters/VignetteFilter";
import { RainbowFilter } from "./filters/RainbowFilter";
import { BrightnessContrastFilter } from "./filters/BrightnessContrastFilter";
import { GammaFilter } from "./filters/GammaFilter";
import { BlurFilter } from "./filters/BlurFilter";
import { GlowFilter } from "./filters/GlowFilter";
import { ChromaticAberrationFilter } from "./filters/ChromaticAberrationFilter";

window.PWGL = window.AGL = {
  version: "{{appVersion}}",

  BlendMode,

  Texture,
  Framebuffer,

  Context,
  Buffer,
  Utils,
  Const,

  Item,
  BaseDrawable,
  Light,
  AnimatedImage,
  Container,
  Image,
  Text,

  BaseRenderer,
  BatchRenderer,
  FilterRenderer,
  NormalMapRenderer,
  AmbientOcclusionMapRenderer,
  LightRenderer,
  Stage2D,

  BaseFilter,
  BaseKernelFilter,
  BaseSamplingFilter,
  BaseTextureFilter,
  DisplacementFilter,
  MaskFilter,
  PixelateFilter,
  EdgeDetectFilter,
  SharpenFilter,
  SaturateFilter,
  GrayscaleFilter,
  SepiaFilter,
  InvertFilter,
  TintFilter,
  ColorLimitFilter,
  VignetteFilter,
  RainbowFilter,
  BrightnessContrastFilter,
  GammaFilter,
  BlurFilter,
  GlowFilter,
  ChromaticAberrationFilter,
};

console.log(
  `%cPWGL v${AGL.version}\nhttps:\/\/github.com/asjs-dev/pwgl`,
  "background:#222;color:#0F0"
);
