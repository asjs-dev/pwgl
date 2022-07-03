import { Context } from "./utils/Context.js";
import { Buffer } from "./utils/Buffer.js";
import { Utils, Const } from "./utils/Utils.js";
import { FPS } from "./utils/FPS.js";

import { BlendMode } from "./data/BlendMode.js";

import { BaseProps } from "./data/props/BaseProps.js";
import { BasePositioningProps } from "./data/props/BasePositioningProps.js";
import { ColorProps } from "./data/props/ColorProps.js";
import { ItemProps } from "./data/props/ItemProps.js";
import { LightProps } from "./data/props/LightProps.js";
import { TextureCrop } from "./data/props/TextureCrop.js";
import { TextureProps } from "./data/props/TextureProps.js";
import { DistortionProps } from "./data/props/DistortionProps.js";
import { FilterTextureProps } from "./data/props/FilterTextureProps.js";

import { TextureInfo } from "./data/texture/TextureInfo.js";
import { Texture } from "./data/texture/Texture.js";
import { Framebuffer } from "./data/texture/Framebuffer.js";

import { Matrix3 } from "./geom/Matrix3.js";
import { Point } from "./geom/Point.js";
import { Rect } from "./geom/Rect.js";

import { BaseItem } from "./display/BaseItem.js";
import { Item } from "./display/Item.js";
import { BaseDrawable } from "./display/BaseDrawable.js";
import { Light } from "./display/Light.js";
import { AnimatedImage } from "./display/AnimatedImage.js";
import { Container } from "./display/Container.js";
import { StageContainer } from "./display/StageContainer.js";
import { Image } from "./display/Image.js";

import { BaseRenderer } from "./renderer/BaseRenderer.js";
import { BatchRenderer } from "./renderer/BatchRenderer.js";
import { FilterRenderer } from "./renderer/FilterRenderer.js";
import { NormalMapRenderer } from "./renderer/NormalMapRenderer.js";
import { LightRenderer } from "./renderer/LightRenderer.js";
import { Stage2D } from "./renderer/Stage2D.js";

import { BaseFilter } from "./filters/BaseFilter.js";
import { DisplacementFilter } from "./filters/DisplacementFilter.js";
import { MaskFilter } from "./filters/MaskFilter.js";
import { PixelateFilter } from "./filters/PixelateFilter.js";
import { EdgeDetectFilter } from "./filters/EdgeDetectFilter.js";
import { SharpenFilter } from "./filters/SharpenFilter.js";
import { SaturateFilter } from "./filters/SaturateFilter.js";
import { GrayscaleFilter } from "./filters/GrayscaleFilter.js";
import { SepiaFilter } from "./filters/SepiaFilter.js";
import { InvertFilter } from "./filters/InvertFilter.js";
import { TintFilter } from "./filters/TintFilter.js";
import { ColorLimitFilter } from "./filters/ColorLimitFilter.js";
import { VignetteFilter } from "./filters/VignetteFilter.js";
import { RainbowFilter } from "./filters/RainbowFilter.js";
import { BrightnessContrastFilter } from "./filters/BrightnessContrastFilter.js";
import { GammaFilter } from "./filters/GammaFilter.js";
import { BlurFilter } from "./filters/BlurFilter.js";
import { GlowFilter } from "./filters/GlowFilter.js";

console.log("PWGL.JS (AGL) 3.0 {{date}}");

window.PWGL = window.AGL = {
  BlendMode,

  BaseProps,
  BasePositioningProps,
  ColorProps,
  ItemProps,
  LightProps,
  TextureCrop,
  TextureProps,
  DistortionProps,
  FilterTextureProps,

  TextureInfo,
  Texture,
  Framebuffer,

  Context,
  Buffer,
  Utils,
  Const,
  FPS,

  Matrix3,
  Point,
  Rect,

  BaseItem,
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
  LightRenderer,
  Stage2D,

  BaseFilter,
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
  GlowFilter
};
