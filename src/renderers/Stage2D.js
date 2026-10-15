import { noop } from "../../common/utils/noop";
import { Buffer } from "../core/Buffer";
import { Utils } from "../core/Utils";
import { Container } from "../display/Container";
import { Image } from "../display/Image";
import { Item } from "../display/Item";
import { Light } from "../display/Light";
import { StageContainer } from "../display/StageContainer";
import "../math/PointType";
import { getCanvasPointerPosition } from "../utils/pointerUtils";
import { BatchRenderer } from "./BatchRenderer";
import { LightRenderer } from "./LightRenderer";

/**
 * @typedef {Object} Stage2DConfig
 * @extends {RendererConfig}
 */

// Mouse move event type.
const _INTERACTION_EVENT_TYPE_MOUSE_MOVE = "mousemove";
// Mouse down event type.
const _INTERACTION_EVENT_TYPE_MOUSE_DOWN = "mousedown";
// Mouse up event type.
const _INTERACTION_EVENT_TYPE_MOUSE_UP = "mouseup";
// Mouse click event type.
const _INTERACTION_EVENT_TYPE_CLICK = "click";
// Touch start event type.
const _INTERACTION_EVENT_TYPE_TOUCH_START = "touchstart";
// Touch move event type.
const _INTERACTION_EVENT_TYPE_TOUCH_MOVE = "touchmove";
// Touch end event type.
const _INTERACTION_EVENT_TYPE_TOUCH_END = "touchend";
// Mapped pointer move event type.
const _INTERACTION_EVENT_MAPPED_TYPE_POINTER_CLICK = "PointerClick";
// Mapped pointer move event type.
const _INTERACTION_EVENT_MAPPED_TYPE_POINTER_DOWN = "PointerDown";
// Mapped pointer move event type.
const _INTERACTION_EVENT_MAPPED_TYPE_POINTER_MOVE = "PointerMove";
// Mapped pointer move event type.
const _INTERACTION_EVENT_MAPPED_TYPE_POINTER_UP = "PointerUp";
// Mapped pointer move event type.
const _INTERACTION_EVENT_MAPPED_TYPE_POINTER_OUT = "PointerOut";
// Mapped pointer move event type.
const _INTERACTION_EVENT_MAPPED_TYPE_POINTER_OVER = "PointerOver";

// List of interaction event types.
const _INTERACTION_EVENT_TYPES = [
  _INTERACTION_EVENT_TYPE_MOUSE_MOVE,
  _INTERACTION_EVENT_TYPE_MOUSE_DOWN,
  _INTERACTION_EVENT_TYPE_MOUSE_UP,
  _INTERACTION_EVENT_TYPE_CLICK,
  _INTERACTION_EVENT_TYPE_TOUCH_START,
  _INTERACTION_EVENT_TYPE_TOUCH_MOVE,
  _INTERACTION_EVENT_TYPE_TOUCH_END,
];

// Mapping of interaction event types to pointer event types.
const _INTERACTION_EVENT_MAPPED_TYPES = {
  [_INTERACTION_EVENT_TYPE_CLICK]: _INTERACTION_EVENT_MAPPED_TYPE_POINTER_CLICK,
  [_INTERACTION_EVENT_TYPE_MOUSE_DOWN]: _INTERACTION_EVENT_MAPPED_TYPE_POINTER_DOWN,
  [_INTERACTION_EVENT_TYPE_TOUCH_START]: _INTERACTION_EVENT_MAPPED_TYPE_POINTER_DOWN,
  [_INTERACTION_EVENT_TYPE_MOUSE_MOVE]: _INTERACTION_EVENT_MAPPED_TYPE_POINTER_MOVE,
  [_INTERACTION_EVENT_TYPE_TOUCH_MOVE]: _INTERACTION_EVENT_MAPPED_TYPE_POINTER_MOVE,
  [_INTERACTION_EVENT_TYPE_MOUSE_UP]: _INTERACTION_EVENT_MAPPED_TYPE_POINTER_UP,
  [_INTERACTION_EVENT_TYPE_TOUCH_END]: _INTERACTION_EVENT_MAPPED_TYPE_POINTER_UP,
};

/**
 * <pre>
 *  Stage2D renderer
 *    - Renders multiple textures
 * </pre>
 * @extends {BatchRenderer}
 */
export class Stage2D extends BatchRenderer {
  /**
   * Creates an instance of Stage2D.
   * @constructor
   * @param {Stage2DConfig} config
   */
  constructor(config = {}) {
    config = Utils.initRendererConfig(config);
    config.useTint = config.useTint ?? true;
    config.useInteraction = config.useInteraction ?? true;
    const useDistortion = (config.useDistortion = config.useDistortion ?? true);

    // prettier-ignore
    Utils.setLocations(config, [
      "aD",
      ...(useDistortion ? ["aE"] : []),
      "uF",
    ]);

    super(config);

    const { $MAX_RENDER_COUNT } = this;

    this.container = new StageContainer(this);
    this.$renderingTypes = Object.create(null);
    this.setRenderingType(Item.RENDERING_TYPE, noop);
    this.setRenderingType(Light.RENDERING_TYPE, noop);
    this.setRenderingType(Image.RENDERING_TYPE, this.$drawImage);
    this.setRenderingType(Container.RENDERING_TYPE, this.$drawContainer);
    this.$batchDraw = this.$batchDraw.bind(this);
    this.$mousePosition = { x: 0, y: 0 };

    // prettier-ignore
    this.$dataBuffer = new Buffer(
      "aD", 
      $MAX_RENDER_COUNT,
      3,
      4
    );

    this.$checkMousePositionFv = this.$addDistortionDataFv = this.$uploadDistortionFv = this.$createDistortionFv = noop;

    if (useDistortion) {
      // prettier-ignore
      this.$distortionBuffer = new Buffer(
        "aE",
        $MAX_RENDER_COUNT,
        4,
        2
      );

      this.$addDistortionDataFv = this.$addDistortionData;
      this.$uploadDistortionFv = this.$uploadDistortion;
      this.$createDistortionFv = this.$createDistortion;
    }

    if (config.useInteraction) {
      this.$checkMousePositionFv = this.$checkMousePosition;
      const { canvas } = this.context;

      this.$onMouseEventHandler = this.$onMouseEventHandler.bind(this);
      _INTERACTION_EVENT_TYPES.forEach((type) => canvas.addEventListener(type, this.$onMouseEventHandler));
    }

    const { lightRenderer } = config;
    lightRenderer && this.attachLightRenderer(lightRenderer);
  }

  /**
   * Sets the draw function for a rendering type.
   * @param {string} type
   * @param {function} drawFunction
   * @param {*} scope
   */
  setRenderingType(type, drawFunction, scope = this) {
    this.$renderingTypes[type] = drawFunction.bind(scope);
  }

  /**
   * Attach LightRenderer
   * Recommended to set LightRenderer when using Light
   * @param {LightRenderer} v
   */
  attachLightRenderer(v) {
    this.setRenderingType(Light.RENDERING_TYPE, v.addLightForRender, v);
  }

  /**
   * Detach LightRenderer
   */
  detachLightRenderer() {
    this.setRenderingType(Light.RENDERING_TYPE, noop);
  }

  /**
   * Description placeholder
   */
  destruct() {
    const { canvas } = this.context;
    _INTERACTION_EVENT_TYPES.forEach((type) => canvas.removeEventListener(type, this.$onMouseEventHandler));
  }

  /**
   * @ignore
   */
  $handleMouseEvent() {
    const { $currentEvent, $eventTarget, $previousEventTarget } = this;

    if ($currentEvent) {
      if ($eventTarget !== $previousEventTarget) {
        const newEvent = { ...$currentEvent };

        $previousEventTarget &&
          $previousEventTarget.callEventHandler($previousEventTarget, {
            ...newEvent,
            type: _INTERACTION_EVENT_MAPPED_TYPE_POINTER_OUT,
          });

        $eventTarget &&
          $eventTarget.callEventHandler($eventTarget, {
            ...newEvent,
            type: _INTERACTION_EVENT_MAPPED_TYPE_POINTER_OVER,
          });
      }

      $eventTarget &&
        $eventTarget.callEventHandler($eventTarget, {
          ...$currentEvent,
          type: _INTERACTION_EVENT_MAPPED_TYPES[$currentEvent.type],
        });

      this.$previousEventTarget = $eventTarget;
    }

    this.$currentEvent = null;
  }

  /**
   * @param {*} x
   * @param {*} y
   * @ignore
   */
  $setMousePosition(x, y) {
    this.$isMousePositionSet = true;

    const { matrixCache } = this.container;
    const { $mousePosition } = this;

    $mousePosition.x = (x - this.widthHalf) * matrixCache[0];
    $mousePosition.y = (y - this.heightHalf) * matrixCache[3];
  }

  /**
   * Draws an item: callbackBeforeRender, then update and render, then callbackAfterRender.
   * A non-renderable item (and so its subtree) or one no longer under `parent` (removed or moved
   * in a callback) is neither updated nor rendered; its callbacks still run.
   * @param {Item} item
   * @param {Container} [parent]
   * @ignore
   */
  $drawItem(item, parent) {
    const { $renderTime } = this;

    item.callbackBeforeRender(item, $renderTime);

    if (item.parent === parent && item.renderable) {
      item.update($renderTime);
      this.$renderingTypes[item.RENDERING_TYPE](item);
    }

    item.callbackAfterRender(item, $renderTime);
  }

  /**
   * @param {Container} container
   * @ignore
   */
  $drawContainer(container) {
    const { children } = container;
    let i = -1;

    while (++i < children.length) {
      this.$drawItem(children[i], container);
    }
  }

  /**
   * @param {Image} image
   * @ignore
   */
  $drawImage(image) {
    const { context } = this;

    context.setBlendMode(image.blendMode, this.$batchDraw);

    // Resolved before the slot index: a texture that needs a unit while all are taken flushes the batch.
    const textureId = context.useTexture(image.texture, this.$renderTime, false, this.$batchDraw);
    const { $batchItems } = this;
    const matrixBufferId = $batchItems * 16;
    const matrixBufferData = this.$matrixBuffer.data;
    const { matrixCache, textureMatrixCache, textureCropCache } = image;

    // Fixed-index writes: cheaper than a generic copy loop on the per-image hot path.
    matrixBufferData[matrixBufferId] = matrixCache[0];
    matrixBufferData[matrixBufferId + 1] = matrixCache[1];
    matrixBufferData[matrixBufferId + 2] = matrixCache[2];
    matrixBufferData[matrixBufferId + 3] = matrixCache[3];
    matrixBufferData[matrixBufferId + 4] = matrixCache[4];
    matrixBufferData[matrixBufferId + 5] = matrixCache[5];
    matrixBufferData[matrixBufferId + 6] = textureMatrixCache[0];
    matrixBufferData[matrixBufferId + 7] = textureMatrixCache[1];
    matrixBufferData[matrixBufferId + 8] = textureMatrixCache[2];
    matrixBufferData[matrixBufferId + 9] = textureMatrixCache[3];
    matrixBufferData[matrixBufferId + 10] = textureMatrixCache[4];
    matrixBufferData[matrixBufferId + 11] = textureMatrixCache[5];
    matrixBufferData[matrixBufferId + 12] = textureCropCache[0];
    matrixBufferData[matrixBufferId + 13] = textureCropCache[1];
    matrixBufferData[matrixBufferId + 14] = textureCropCache[2];
    matrixBufferData[matrixBufferId + 15] = textureCropCache[3];
    this.$addImageData(image, $batchItems, textureId);

    ++this.$batchItems === this.$MAX_RENDER_COUNT && this.$batchDraw();
  }

  /**
   * @ignore
   */
  $batchDraw() {
    const { $gl, $locations, context, $batchItems } = this;

    if ($batchItems) {
      // Uniforms belong to the program; switching programs clears the textures and marks them changed.
      if (context.$texturesChanged) {
        context.$texturesChanged = false;
        const textureIdCount = context.textureIds.length;
        if (textureIdCount) {
          $gl.uniform1iv($locations.uB, context.$textureIdData, 0, textureIdCount);
          $gl.uniform2fv($locations.uF, context.$textureSizeData, 0, context.textureSizes.length);
        }
      }
      this.$uploadBuffers();
      this.$drawInstanced($batchItems);
      this.$batchItems = 0;
    }
  }

  /**
   * @ignore
   */
  $onMouseEventHandler(event) {
    this.$currentEvent = event;
    const { canvas } = this.context;
    const pointerPosition = getCanvasPointerPosition(canvas, event);

    this.$setMousePosition(pointerPosition.x, pointerPosition.y);
  }

  /**
   * @param {Image} image
   * @param {number} index
   * @param {number} [textureId] - The texture unit of the image, resolved by `$drawImage`
   * @ignore
   */
  $addImageData(image, index, textureId = this.context.useTexture(image.texture, this.$renderTime, false)) {
    const dataBufferId = index * 12;
    const itemParent = image.parent;
    const dataBufferData = this.$dataBuffer.data;

    this.$checkMousePositionFv(image);

    const { colorCache, textureRepeatRandomCache } = image;

    dataBufferData[dataBufferId] = colorCache[0];
    dataBufferData[dataBufferId + 1] = colorCache[1];
    dataBufferData[dataBufferId + 2] = colorCache[2];
    dataBufferData[dataBufferId + 3] = colorCache[3];
    dataBufferData[dataBufferId + 8] = textureRepeatRandomCache[0];
    dataBufferData[dataBufferId + 9] = textureRepeatRandomCache[1];
    dataBufferData[dataBufferId + 10] = textureRepeatRandomCache[2];
    dataBufferData[dataBufferId + 11] = textureRepeatRandomCache[3];
    dataBufferData[dataBufferId + 4] = image.alpha * itemParent.$premultipliedAlpha;
    dataBufferData[dataBufferId + 5] = image.tintType * itemParent.$premultipliedUseTint;
    dataBufferData[dataBufferId + 6] = textureId;

    this.$addDistortionDataFv(dataBufferData, dataBufferId + 7, image, index);
  }

  $addDistortionData(dataBufferData, id, image, index) {
    dataBufferData[id] = image.distortion.distortTexture;
    // Always written: batch slots are reused, so a skipped write would keep the previous image's distortion.
    const distortionBufferData = this.$distortionBuffer.data;
    const { distortionCache } = image;
    const distortionBufferId = index * 8;

    distortionBufferData[distortionBufferId] = distortionCache[0];
    distortionBufferData[distortionBufferId + 1] = distortionCache[1];
    distortionBufferData[distortionBufferId + 2] = distortionCache[2];
    distortionBufferData[distortionBufferId + 3] = distortionCache[3];
    distortionBufferData[distortionBufferId + 4] = distortionCache[4];
    distortionBufferData[distortionBufferId + 5] = distortionCache[5];
    distortionBufferData[distortionBufferId + 6] = distortionCache[6];
    distortionBufferData[distortionBufferId + 7] = distortionCache[7];
  }

  $checkMousePosition(image) {
    if (this.$isMousePositionSet && image.interactive && image.isContainsPoint(this.$mousePosition)) {
      this.$eventTarget = image;
    }
  }

  /**
   * @ignore
   */
  $render() {
    this.$eventTarget = null;
    this.$drawItem(this.container);
    this.$batchDraw();
    this.$isMousePositionSet = false;
    this.$handleMouseEvent();
  }

  /**
   * @ignore
   */
  $uploadBuffers() {
    const { $gl, $batchItems } = this;

    this.$dataBuffer.uploadElements($gl, $batchItems);
    this.$uploadDistortionFv($gl, $batchItems);
    super.$uploadBuffers();
  }

  $uploadDistortion($gl, $batchItems) {
    this.$distortionBuffer.uploadElements($gl, $batchItems);
  }

  /**
   * @ignore
   */
  $createBuffers() {
    const { $gl, $locations } = this;
    super.$createBuffers();
    this.$dataBuffer.create($gl, $locations);
    this.$createDistortionFv($gl, $locations);
  }

  $createDistortion($gl, $locations) {
    this.$distortionBuffer.create($gl, $locations);
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    const { useRepeatTextures, useDistortion } = this.$config;
    const { maxTextureImageUnits } = Utils.INFO;

    return `${Utils.GLSL.DEFINE.Z}` +

    `${Utils.GLSL.BASE_VERTEX_SHADER_ATTRIBUTES}` +
    `${useDistortion
      ? `in mat4x2 ` +
        `aE;`
      : ``}` +
    `in mat3x4 ` +
      `aD;` +
    `in mat4 ` +
      `aB;` +

    `${Utils.GLSL.BASE_VERTEX_SHADER_UNIFORMS}` +

    `uniform vec2 ` +
      `uF[${maxTextureImageUnits}];` +

    `out vec${useDistortion ? 3 : 2} ` +
      `v0;` +
    `flat out float ` +
      `v1;` +
    `flat out vec4 ` +
      `v2,` +
      `v3,` +
      `v4` +
    `${useRepeatTextures ? `,v5`: ``};` +

    `${useDistortion
      ? // Projective weight of corner p (o: the opposite corner): the diagonals split at c,
        // q=(|p-c|+|o-c|)/|o-c|. Parallelograms (also the undistorted quad) are exactly affine
        // with q=1; concave, self-intersecting or degenerate quads fall back to it.
        `float gQ(vec2 p,vec2 o){` +
          `vec2 ` +
            `d0=aE[2]-aE[0],` +
            `d1=aE[3]-aE[1],` +
            `e=aE[1]-aE[0];` +
          `float ` +
            `dn=d0.x*d1.y-d0.y*d1.x;` +
          `if(abs(dn)<1e-6||aE[0]+aE[2]==aE[1]+aE[3])return 1.;` +
          `vec2 ` +
            `tu=vec2(e.x*d1.y-e.y*d1.x,e.x*d0.y-e.y*d0.x)/dn;` +
          `if(any(lessThanEqual(tu,Z.xx))||any(greaterThanEqual(tu,Z.yy)))return 1.;` +
          `vec2 ` +
            `c=aE[0]+tu.x*d0;` +
          `float ` +
            `l=length(o-c);` +
          `return (length(p-c)+l)/l;` +
        `}`
      : ``}` +

    `void main(){` +
      // aA is a unit-quad corner: (0,0) TL, (1,0) TR, (1,1) BR, (0,1) BL are aE[0..3].
      `${useDistortion
        ? `int ` +
            `cI=int(aA.y*3.+aA.x*(1.-2.*aA.y));`
        : ``}` +
      `vec2 ` +
        `tPs=${useDistortion ? `aE[cI]` : `aA`};` +

      `gl_Position=vec4(` +
        `mat3(aB[0].xy,0,aB[0].zw,0,aB[1].xy,1)*` +
        `vec3(tPs,1.),` +
        `1` +
      `)*vec4(1.,uA,1.,1.);` +

      `${useDistortion ? `vec2 tUv` : `v0`}=(` +
          `mat3(aB[1].zw,0,aB[2].xy,0,aB[2].zw,1)*` +
          `vec3(` +
            `${useDistortion
              ? `mix(` +
                  `tPs,` +
                  `aA,` +
                  `aD[1].w` +
                `)`
              : `aA`},` +
            `1.` +
          `)` +
        `).xy;` +
      `${useDistortion
        ? `float ` +
            `q=mix(1.,gQ(tPs,aE[(cI+2)&3]),aD[1].w);` +
          `v0=vec3(tUv*q,q);`
        : ``}` +
      `v1=aD[1].x;` +
      `v2.xy=aD[1].yz;` +
      `v2.zw=v2.y>-1.?.5/uF[int(v2.y)]:Z.yy;` +
      `v3=aB[3];` +
      `v4=aD[0];` +
      `${useRepeatTextures ? `v5=aD[2];` : ``}` +
    `}`;
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    const { $config } = this;
    const { maxTextureImageUnits } = Utils.INFO;
    const { useRepeatTextures, useTint, useDistortion } = $config;
    // With distortion the varying is projective (uv*q,q), divided once in main into tC.
    const uvName = useDistortion ? "tC" : "v0";

    const getSimpleTexColor = (modCoordName) => `gTxC(v2.y,v3,${modCoordName})`;

    return `${Utils.GLSL.DEFINE.Z}` +
    `${Utils.GLSL.DEFINE.RADIANS_360}` +

    `in vec${useDistortion ? 3 : 2} ` +
      `v0;` +
    `flat in float ` +
      `v1;` +
    `flat in vec4 ` +
      `v2,` +
      `v3,` +
      `v4` +
      `${useRepeatTextures ? `,v5` : ``};` +

    `uniform sampler2D ` +
      `uB[${maxTextureImageUnits}];` +

    `out vec4 ` +
      `oCl;` +

    `${useDistortion
      ? `vec2 ` +
          `tC;`
      : ``}` +

    `vec4 gTxC(float i,vec4 s,vec2 m){` +
      `vec2 cp=${Utils.GLSL.CREATE_ATLAS_CROP({ crop: "s", uv: "m", bias: "v2.zw" })};` +
      `${Utils.GLSL.CREATE_TEXTURE_UNIT_LOOKUP({
        index: "i",
        uv: "cp",
        samplerArray: "uB",
        count: maxTextureImageUnits,
        miss: "Z.yyyy",
      })}` +
    `}` +

    `float cs(float a,float b,float v){` +
      `v=abs(v);` +
      `float ` + 
        `t=-2.*v+2.;` +
      `v=mix(2.*v*v,1.-t*t*.5,step(.5,v));` +
      `return a*(1.-v)+b*v;` +
    `}` +

    `${useRepeatTextures
      ? `${Utils.GLSL.RANDOM2}` +
        `vec4 gCB(vec2 c0){` +
          `vec2 ` +
            `uv=${uvName};` +

          `float ` +
            `rnd=rand2(c0/100.),` +
            `rndDg=rnd*RADIANS_360*v5.x;` +

          `if(rndDg>0.){` +
            `vec2 ` +
              `rt=vec2(sin(rndDg),cos(rndDg));` +
            `uv=vec2(uv.x*rt.y-uv.y*rt.x,uv.x*rt.x+uv.y*rt.y);` +
          `}` +

          `return ${getSimpleTexColor(`fract(uv)`)};` +
        `}` +

        `float gRCB(vec2 st,vec2 c0,vec2 uv){` +
          `float ` +
            `rnd=rand2((c0+st)/100.);` +
          `return (1.-(v5.w*rnd-v5.w*.5)*v5.y)*` +
            `cs(0.,1.,1.-st.x-uv.x)*cs(0.,1.,1.-st.y-uv.y);` +
        `}`
      : ``}` +

    `void main(){` +
      `if(v2.y>-1.){` +
        `${useDistortion ? `tC=v0.xy/v0.z;` : ``}` +
        `vec2 ` +
          `uv=fract(${uvName});` +

        `${useRepeatTextures
          ? `if(v5.x>0.||v5.y>0.){` +
              `vec2 ` +
                `c0=floor(${uvName});` +
              `vec4 ` +
                `rc=vec4(` + 
                  `gRCB(Z.xx,c0,uv),` +
                  `gRCB(Z.yx,c0,uv),` +
                  `gRCB(Z.xy,c0,uv),` +
                  `gRCB(Z.yy,c0,uv)` +
                `);` +
              `oCl=mix(` +
                `gCB(Z.xy+c0),` +
                `clamp(` +
                  `gCB(Z.xx+c0)*rc.x+` +
                  `gCB(Z.yx+c0)*rc.y+` +
                  `gCB(Z.xy+c0)*rc.z+` +
                  `gCB(Z.yy+c0)*rc.w` +
                `,0.,1.),` +
                `vec4(v5.z)` + 
              `);` +
              `oCl.a=mix(` + 
                `oCl.a,` + 
                `clamp(` +
                  `oCl.a*(` +
                    `rc.x+` +
                    `rc.y+` +
                    `rc.z+` +
                    `rc.w` +
                  `),0.,1.),` + 
                  `v5.y` +
                `);` +
            `}else `
          : ``}oCl=${getSimpleTexColor(`uv`)};` +
      `}else oCl=vec4(1.);` +

      `oCl.a*=v1;` +

      `if(oCl.a<=0.)discard;` +

      `${useTint
        ? Utils.GLSL.TINT_TYPE_SHADER(`v2.x`, `oCl`, `v4`)
        : ``}` +
    `}`;
  }
}
