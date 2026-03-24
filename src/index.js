import { Buffer } from "./core/Buffer";
import { Context } from "./core/Context";
import { Const, Utils } from "./core/Utils";

import { BlendMode } from "./rendering/BlendMode";
import { TintType } from "./rendering/TintType";

import { Framebuffer } from "./textures/Framebuffer";
import { Texture } from "./textures/Texture";

import { AnimatedImage } from "./display/AnimatedImage";
import { BaseDrawable } from "./display/BaseDrawable";
import { Container } from "./display/Container";
import { Image } from "./display/Image";
import { Item } from "./display/Item";
import { Light } from "./display/Light";
import { Text } from "./display/Text";

import { AmbientOcclusionMapRenderer } from "./renderers/AmbientOcclusionMapRenderer";
import { BaseRenderer } from "./renderers/BaseRenderer";
import { BatchRenderer } from "./renderers/BatchRenderer";
import { FilterRenderer } from "./renderers/FilterRenderer";
import { LightRenderer } from "./renderers/LightRenderer";
import { NormalMapRenderer } from "./renderers/NormalMapRenderer";
import { Stage2D } from "./renderers/Stage2D";

import { BaseFilter } from "./filters/BaseFilter";
import { BaseKernelFilter } from "./filters/BaseKernelFilter";
import { BaseTextureFilter } from "./filters/BaseTextureFilter";
import { BlurFilter } from "./filters/BlurFilter";
import { BrightnessFilter } from "./filters/BrightnessFilter";
import { ChromaticAberrationFilter } from "./filters/ChromaticAberrationFilter";
import { ContrastFilter } from "./filters/ContrastFilter";
import { DisplacementFilter } from "./filters/DisplacementFilter";
import { EdgeDetectFilter } from "./filters/EdgeDetectFilter";
import { GammaFilter } from "./filters/GammaFilter";
import { GlowFilter } from "./filters/GlowFilter";
import { GrayscaleFilter } from "./filters/GrayscaleFilter";
import { HueRotateFilter } from "./filters/HueRotateFilter";
import { InvertFilter } from "./filters/InvertFilter";
import { MaskFilter } from "./filters/MaskFilter";
import { PixelateFilter } from "./filters/PixelateFilter";
import { PosterizeFilter } from "./filters/PosterizeFilter";
import { RainbowFilter } from "./filters/RainbowFilter";
import { SaturateFilter } from "./filters/SaturateFilter";
import { SepiaFilter } from "./filters/SepiaFilter";
import { SharpenFilter } from "./filters/SharpenFilter";
import { TintFilter } from "./filters/TintFilter";

window.PWGL = window.AGL = {
  version: "{{appVersion}}",

  BlendMode,
  TintType,

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
  PosterizeFilter,
  RainbowFilter,
  BrightnessFilter,
  ContrastFilter,
  HueRotateFilter,
  GammaFilter,
  BlurFilter,
  GlowFilter,
  ChromaticAberrationFilter,
};

console.log(`%cPWGL v${AGL.version}\nhttps:\/\/github.com/asjs-dev/pwgl`, "background:#222;color:#0F0");
