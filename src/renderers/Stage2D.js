import { BatchRenderer } from "./BatchRenderer";
import { LightRenderer } from "./LightRenderer";
import { Buffer } from "../core/Buffer";
import { Utils } from "../core/Utils";
import { Item } from "../display/Item";
import { Image } from "../display/Image";
import { Light } from "../display/Light";
import { Container } from "../display/Container";
import { StageContainer } from "../display/StageContainer";
import "../math/PointType";
import {
  BASE_VERTEX_SHADER_ATTRIBUTES,
  BASE_VERTEX_SHADER_UNIFORMS,
} from "../utils/baseVertexShaderUtils";
import { noop } from "../../extensions/utils/noop";
import { arraySet } from "../../extensions/utils/arraySet";

/**
 * @typedef {Object} Stage2DConfig
 * @extends {RendererConfig}
 */

// Prefix for rendering functions.
const _RENDERING_TYPE_PREFIX = "_draw",
  // Mouse move event type.
  _INTERACTION_EVENT_TYPE_MOUSE_MOVE = "mousemove",
  // Mouse down event type.
  _INTERACTION_EVENT_TYPE_MOUSE_DOWN = "mousedown",
  // Mouse up event type.
  _INTERACTION_EVENT_TYPE_MOUSE_UP = "mouseup",
  // Mouse click event type.
  _INTERACTION_EVENT_TYPE_CLICK = "click",
  // Touch start event type.
  _INTERACTION_EVENT_TYPE_TOUCH_START = "touchstart",
  // Touch move event type.
  _INTERACTION_EVENT_TYPE_TOUCH_MOVE = "touchmove",
  // Touch end event type.
  _INTERACTION_EVENT_TYPE_TOUCH_END = "touchend",
  // Mapped pointer move event type.
  _INTERACTION_EVENT_MAPPED_TYPE_POINTER_CLICK = "PointerClick",
  // Mapped pointer move event type.
  _INTERACTION_EVENT_MAPPED_TYPE_POINTER_DOWN = "PointerDown",
  // Mapped pointer move event type.
  _INTERACTION_EVENT_MAPPED_TYPE_POINTER_MOVE = "PointerMove",
  // Mapped pointer move event type.
  _INTERACTION_EVENT_MAPPED_TYPE_POINTER_UP = "PointerUp",
  // Mapped pointer move event type.
  _INTERACTION_EVENT_MAPPED_TYPE_POINTER_OUT = "PointerOut",
  // Mapped pointer move event type.
  _INTERACTION_EVENT_MAPPED_TYPE_POINTER_OVER = "PointerOver",
  // List of interaction event types.
  _INTERACTION_EVENT_TYPES = [
    _INTERACTION_EVENT_TYPE_MOUSE_MOVE,
    _INTERACTION_EVENT_TYPE_MOUSE_DOWN,
    _INTERACTION_EVENT_TYPE_MOUSE_UP,
    _INTERACTION_EVENT_TYPE_CLICK,
    _INTERACTION_EVENT_TYPE_TOUCH_START,
    _INTERACTION_EVENT_TYPE_TOUCH_MOVE,
    _INTERACTION_EVENT_TYPE_TOUCH_END,
  ],
  // Mapping of interaction event types to pointer event types.
  _INTERACTION_EVENT_MAPPED_TYPES = {
    [_INTERACTION_EVENT_TYPE_CLICK]:
      _INTERACTION_EVENT_MAPPED_TYPE_POINTER_CLICK,
    [_INTERACTION_EVENT_TYPE_MOUSE_DOWN]:
      _INTERACTION_EVENT_MAPPED_TYPE_POINTER_DOWN,
    [_INTERACTION_EVENT_TYPE_TOUCH_START]:
      _INTERACTION_EVENT_MAPPED_TYPE_POINTER_DOWN,
    [_INTERACTION_EVENT_TYPE_MOUSE_MOVE]:
      _INTERACTION_EVENT_MAPPED_TYPE_POINTER_MOVE,
    [_INTERACTION_EVENT_TYPE_TOUCH_MOVE]:
      _INTERACTION_EVENT_MAPPED_TYPE_POINTER_MOVE,
    [_INTERACTION_EVENT_TYPE_MOUSE_UP]:
      _INTERACTION_EVENT_MAPPED_TYPE_POINTER_UP,
    [_INTERACTION_EVENT_TYPE_TOUCH_END]:
      _INTERACTION_EVENT_MAPPED_TYPE_POINTER_UP,
  };

/**
 * <pre>
 *  Stage2D renderer
 *    - Renders multiple textures
 * </pre>
 * @extends {BatchRenderer}
 * @property {StageContainer} container
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

    // prettier-ignore
    Utils.setLocations(config, [
      "aD",
      "aE",
      "uF",
    ]);

    super(config);

    const maxRenderCount = this.$MAX_RENDER_COUNT;

    this.container = new StageContainer(this);

    this._batchItems = 0;

    this[_RENDERING_TYPE_PREFIX + Item.RENDERING_TYPE] = this[
      _RENDERING_TYPE_PREFIX + Light.RENDERING_TYPE
    ] = noop;
    this[_RENDERING_TYPE_PREFIX + Image.RENDERING_TYPE] = this._drawImage;
    this[_RENDERING_TYPE_PREFIX + Container.RENDERING_TYPE] =
      this._drawContainer;
    this._batchDraw = this._batchDraw.bind(this);

    this._mousePosition = { x: 0, y: 0 };

    // prettier-ignore
    this._dataBuffer = new Buffer(
      "aD", 
      maxRenderCount,
      3,
      4
    );

    // prettier-ignore
    this._distortionBuffer = new Buffer(
      "aE",
      maxRenderCount,
      4,
      2
    );

    this._onMouseEventHandler = this._onMouseEventHandler.bind(this);
    const canvas = this.context.canvas,
      lightRenderer = config.lightRenderer;

    _INTERACTION_EVENT_TYPES.forEach((type) =>
      canvas.addEventListener(type, this._onMouseEventHandler),
    );

    lightRenderer && this.attachLightRenderer(lightRenderer);
  }

  /**
   * Attach LightRenderer
   * Recommended to set LightRenderer when using Light
   * @param {LightRenderer} v
   */
  attachLightRenderer(v) {
    this[_RENDERING_TYPE_PREFIX + Light.RENDERING_TYPE] =
      v.addLightForRender.bind(v);
  }

  /**
   * Detach LightRenderer
   */
  detachLightRenderer() {
    this[_RENDERING_TYPE_PREFIX + Light.RENDERING_TYPE] = noop;
  }

  /**
   * Description placeholder
   */
  destruct() {
    const canvas = this.context.canvas;
    _INTERACTION_EVENT_TYPES.forEach((type) =>
      canvas.removeEventListener(type, this._onMouseEventHandler),
    );
  }

  /**
   * @ignore
   */
  _handleMouseEvent() {
    const latestEvent = this._latestEvent,
      eventTarget = this._eventTarget,
      previousEventTarget = this._previousEventTarget;

    if (latestEvent) {
      if (eventTarget !== previousEventTarget) {
        const newEvent = { ...latestEvent };

        previousEventTarget &&
          previousEventTarget.callEventHandler(previousEventTarget, {
            ...newEvent,
            type: _INTERACTION_EVENT_MAPPED_TYPE_POINTER_OUT,
          });

        eventTarget &&
          eventTarget.callEventHandler(eventTarget, {
            ...newEvent,
            type: _INTERACTION_EVENT_MAPPED_TYPE_POINTER_OVER,
          });
      }

      eventTarget &&
        eventTarget.callEventHandler(eventTarget, {
          ...latestEvent,
          type: _INTERACTION_EVENT_MAPPED_TYPES[latestEvent.type],
        });

      this._previousEventTarget = eventTarget;
    }

    this._latestEvent = null;
  }

  /**
   * @param {*} x
   * @param {*} y
   * @ignore
   */
  _setMousePosition(x, y) {
    this._isMousePositionSet = true;

    const matrixCache = this.container.matrixCache,
      mousePosition = this._mousePosition;

    mousePosition.x = (x - this.widthHalf) * matrixCache[0];
    mousePosition.y = (y - this.heightHalf) * matrixCache[3];
  }

  /**
   * @param {Item} item
   * @ignore
   */
  _drawItem(item) {
    const renderTime = this.$renderTime;
    item.update(renderTime);
    item.callbackBeforeRender(item, renderTime);
    item.renderable && this[_RENDERING_TYPE_PREFIX + item.RENDERING_TYPE](item);
    item.callbackAfterRender(item, renderTime);
  }

  /**
   * @param {Container} container
   * @ignore
   */
  _drawContainer(container) {
    const children = container.children,
      l = children.length;
    let i = -1;

    while (++i < l) this._drawItem(children[i]);
  }

  /**
   * @param {Image} image
   * @ignore
   */
  _drawImage(image) {
    this.context.setBlendMode(image.blendMode, this._batchDraw);

    const batchItems = this._batchItems,
      dataBufferId = batchItems * 12,
      matrixBufferId = batchItems * 16,
      itemParent = image.parent,
      dataBufferData = this._dataBuffer.data,
      matrixBufferData = this.$matrixBuffer.data;

    if (itemParent) {
      if (
        this._isMousePositionSet &&
        image.interactive &&
        image.isContainsPoint(this._mousePosition)
      )
        this._eventTarget = image;

      arraySet(dataBufferData, image.colorCache, dataBufferId);
      arraySet(
        dataBufferData,
        image.textureRepeatRandomCache,
        dataBufferId + 8,
      );
      dataBufferData[dataBufferId + 4] =
        image.alpha * itemParent.getPremultipliedAlpha();
      dataBufferData[dataBufferId + 5] =
        image.tintType * itemParent.getPremultipliedUseTint();
      dataBufferData[dataBufferId + 6] = this.context.useTexture(
        image.texture,
        this.$renderTime,
        false,
        this._batchDraw,
      );
      dataBufferData[dataBufferId + 7] = image.distortion.distortTexture;

      arraySet(matrixBufferData, image.matrixCache, matrixBufferId);
      arraySet(matrixBufferData, image.textureMatrixCache, matrixBufferId + 6);
      arraySet(matrixBufferData, image.textureCropCache, matrixBufferId + 12);

      arraySet(
        this._distortionBuffer.data,
        image.distortionCache,
        batchItems * 8,
      );

      ++this._batchItems === this.$MAX_RENDER_COUNT && this._batchDraw();
    }
  }

  /**
   * @ignore
   */
  _batchDraw() {
    const gl = this.$gl,
      locations = this.$locations,
      context = this.context,
      batchItems = this._batchItems;
    if (batchItems) {
      if (context.textureIds.length) {
        gl.uniform1iv(locations.uB, context.textureIds);
        gl.uniform2fv(locations.uF, context.textureSizes);
      }
      this.$uploadBuffers();
      this.$drawInstanced(batchItems);
      this._batchItems = 0;
    }
  }

  /**
   * @ignore
   */
  _onMouseEventHandler(event) {
    this._latestEvent = event;
    const canvas = this.context.canvas;
    this._setMousePosition(
      (canvas.width / canvas.offsetWidth) * event.offsetX,
      (canvas.height / canvas.offsetHeight) * event.offsetY,
    );
  }

  /**
   * @ignore
   */
  $render() {
    this._eventTarget = null;
    this._drawItem(this.container);
    this._batchDraw();
    this._isMousePositionSet = false;
    this._handleMouseEvent();
  }

  /**
   * @ignore
   */
  $uploadBuffers() {
    const gl = this.$gl;
    this._dataBuffer.upload(gl);
    this._distortionBuffer.upload(gl);
    super.$uploadBuffers();
  }

  /**
   * @ignore
   */
  $createBuffers() {
    const gl = this.$gl,
      locations = this.$locations;
    super.$createBuffers();
    this._dataBuffer.create(gl, locations);
    this._distortionBuffer.create(gl, locations);
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    const useRepeatTextures = this._config.useRepeatTextures,
     maxTextureImageUnits = Utils.INFO.maxTextureImageUnits;

    return Utils.GLSL.DEFINE.Z +

    BASE_VERTEX_SHADER_ATTRIBUTES +
    "in mat4x2 " +
      "aE;" +
    "in mat3x4 " +
      "aD;" +
    "in mat4 " +
      "aB;" +

    BASE_VERTEX_SHADER_UNIFORMS +

    "uniform vec2 " +
      "uF[" + maxTextureImageUnits + "];" +

    "out vec2 " +
      "v0;" +
    "flat out float " +
      "v1;" +
    "flat out vec4 " +
      "v2," +
      "v3," +
      "v4" +
    (useRepeatTextures
      ? ",v5;"
      : ";") +

    "vec2 clcQd(vec2 p){" +
      "return mix(" + 
        "mix(" + 
          "aE[0]," + 
          "aE[1]," + 
          "p.x" + 
        ")," + 
        "mix(" + 
          "aE[3]," + 
          "aE[2]," + 
          "p.x" + 
        ")," + 
        "p.y" + 
      ");" +
    "}" +

    "void main(void){" +
      "vec2 " +
        "tPs=clcQd(aA);" +

      "gl_Position=vec4(" + 
        "mat3(aB[0].xy,0,aB[0].zw,0,aB[1].xy,1)*" + 
        "vec3(tPs,1.)," + 
        "1" + 
      ")*vec4(1.,uA,1.,1.);" +

      "v0=(" + 
          "mat3(aB[1].zw,0,aB[2].xy,0,aB[2].zw,1)*" + 
          "vec3(" +
            "mix(" + 
              "tPs," + 
              "aA," + 
              "aD[1].w" + 
            ")," +
            "1." +
          ")" + 
        ").xy;" +
      "v1=aD[1].x;" +
      "v2.xy=aD[1].yz;" +
      "v2.zw=v2.y>-1.?.5/uF[int(v2.y)]:Z.yy;" +
      "v3=aB[3];" +
      "v4=aD[0];" +
      (useRepeatTextures
        ? "v5=aD[2];"
        : "") +
    "}";
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    const config = this._config,
     maxTextureImageUnits = Utils.INFO.maxTextureImageUnits,
     useRepeatTextures = config.useRepeatTextures,
     useTint = config.useTint;

    const getSimpleTexColor = (modCoordName) =>
      "gtTexCl(v2.y,v3," + modCoordName + ")";

    return Utils.GLSL.DEFINE.Z +
    Utils.GLSL.DEFINE.RADIANS_360 +

    "in vec2 " +
      "v0;" +
    "flat in float " +
      "v1;" +
    "flat in vec4 " +
      "v2," +
      "v3," +
      "v4" +
      (useRepeatTextures
        ? ",v5;"
        : ";") +

    "uniform sampler2D " +
      "uB[" + maxTextureImageUnits + "];" +

    "out vec4 " +
      "oCl;" +

    "vec4 gtTexCl(float i,vec4 s,vec2 m){" +
      "vec2 " + 
        "sxy=s.xy," +
        "szw=s.zw," +
        "ofs=szw*m," +
        "cp=clamp(" +
          "sxy+ofs," +
          "sxy+v2.zw," +
          "sxy+szw-v2.zw" +
        ");" +
      Array(maxTextureImageUnits).fill().map((v, i) => 
      "if(i<" + (i + 1) + ".)" + 
        "return texture(uB[" + i + "],cp);").join("") +
      "return Z.yyyy;" +
    "}" +

    "float cosine(float a,float b,float v){" +
      "v=abs(v);" +
      "float " + 
        "t=-2.*v+2.;" +
      "v=mix(2.*v*v,1.-t*t*.5,step(.5,v));" +
      "return a*(1.-v)+b*v;" +
    "}" +

    (useRepeatTextures
      ? Utils.GLSL.RANDOM2 +
        "vec4 gtClBUv(vec2 st){" +
          "vec2 " +
            "uv=v0;" +

          "float " +
            "rnd=rand2(floor(uv+st)/100.)," +
            "rndDg=rnd*RADIANS_360*v5.x;" +

          "if(rndDg>0.){" +
            "vec2 " +
              "rt=vec2(sin(rndDg),cos(rndDg));" +
            "uv=vec2(uv.x*rt.y-uv.y*rt.x,uv.x*rt.x+uv.y*rt.y);" +
          "}" +

          "return " + getSimpleTexColor("mod(uv,Z.yy)") + ";" +
        "}" +

        "float gtRClBUv(vec2 st,vec2 uv){" +
          "float " +
            "rnd=rand2(floor(v0+st)/100.);" +
          "return (1.-(v5.w*rnd-v5.w*.5)*v5.y)*" +
            "cosine(0.,1.,1.-st.x-uv.x)*cosine(0.,1.,1.-st.y-uv.y);" +
        "}"
      : "") +

    "void main(void){" +
      "if(v2.y>-1.){" +
        "vec2 " +
          "uv=mod(v0,Z.yy);" +

        (useRepeatTextures
          ? "if(v5.x>0.||v5.y>0.){" +
              "vec4 " +
                "rc=vec4(" + 
                  "gtRClBUv(Z.xx,uv)," +
                  "gtRClBUv(Z.yx,uv)," +
                  "gtRClBUv(Z.xy,uv)," +
                  "gtRClBUv(Z.yy,uv)" +
                ");" +
              "oCl=mix(" +
                "gtClBUv(Z.xy)," +
                "clamp(" +
                  "gtClBUv(Z.xx)*rc.x+" +
                  "gtClBUv(Z.yx)*rc.y+" +
                  "gtClBUv(Z.xy)*rc.z+" +
                  "gtClBUv(Z.yy)*rc.w" +
                ",0.,1.)," +
                "vec4(v5.z)" + 
              ");" +
              "oCl.a=mix(" + 
                "oCl.a," + 
                "clamp(" +
                  "oCl.a*(" +
                    "rc.x+" +
                    "rc.y+" +
                    "rc.z+" +
                    "rc.w" +
                  "),0.,1.)," + 
                  "v5.y" +
                ");" +
            "}else oCl=" + getSimpleTexColor("uv") + ";"
          : "oCl=" + getSimpleTexColor("uv") + ";") +
      "}else oCl+=1.;" +

      "oCl.a*=v1;" +

      "if(oCl.a<=0.)discard;" +

      (useTint
        ? "if(v2.x>0.)" +
          "if(v2.x==1.||(v2.x==2.&&oCl.r==oCl.g&&oCl.r==oCl.b))" +
            "oCl*=v4;" +
          "else if(v2.x==3.)" +
            "oCl=v4;" +
          "else if(v2.x==4.)" +
            "oCl+=v4;" 
        : "") +
    "}";
  }
}
