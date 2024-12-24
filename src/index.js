import { Context } from "./utils/Context";
import { Buffer } from "./utils/Buffer";
import { Utils, Const } from "./utils/Utils";

import { BlendMode } from "./data/BlendMode";

import { ColorProps } from "./data/props/ColorProps";
import { ItemTransformProps } from "./data/props/ItemTransformProps";
import { LightTransformProps } from "./data/props/LightTransformProps";
import { TextureCrop } from "./data/props/TextureCrop";
import { TextureTransformProps } from "./data/props/TextureTransformProps";
import { DistortionProps } from "./data/props/DistortionProps";
import { FilterTextureTransformProps } from "./data/props/FilterTextureTransformProps";

import { TextureInfo } from "./data/texture/TextureInfo";
import { Texture } from "./data/texture/Texture";
import { Framebuffer } from "./data/texture/Framebuffer";

import { Matrix3Utilities } from "./geom/Matrix3Utilities";

import { Item } from "./display/Item";
import { BaseDrawable } from "./display/BaseDrawable";
import { Light } from "./display/Light";
import { AnimatedImage } from "./display/AnimatedImage";
import { Container } from "./display/Container";
import { StageContainer } from "./display/StageContainer";
import { Image } from "./display/Image";

import { BaseRenderer } from "./renderer/BaseRenderer";
import { BatchRenderer } from "./renderer/BatchRenderer";
import { FilterRenderer } from "./renderer/FilterRenderer";
import { NormalMapRenderer } from "./renderer/NormalMapRenderer";
import { AmbientOcclusionMapRenderer } from "./renderer/AmbientOcclusionMapRenderer";
import { LightRenderer } from "./renderer/LightRenderer";
import { Stage2D } from "./renderer/Stage2D";

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

  ColorProps,
  ItemTransformProps,
  LightTransformProps,
  TextureCrop,
  TextureTransformProps,
  DistortionProps,
  FilterTextureTransformProps,

  TextureInfo,
  Texture,
  Framebuffer,

  Context,
  Buffer,
  Utils,
  Const,

  Matrix3Utilities,

  Item,
  BaseDrawable,
  Light,
  AnimatedImage,
  Container,
  StageContainer,
  Image,

  BaseRenderer,
  BatchRenderer,
  FilterRenderer,
  NormalMapRenderer,
  AmbientOcclusionMapRenderer,
  LightRenderer,
  Stage2D,

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
  `%cPWGL v${PWGL.version}\nhttps:\/\/github.com/asjs-dev/pwgl`,
  "background:#222;color:#00FF00"
);
