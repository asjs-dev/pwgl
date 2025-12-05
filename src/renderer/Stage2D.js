import { BatchRenderer } from "./BatchRenderer";
import { LightRenderer } from "./LightRenderer";
import { Item } from "../display/Item";
import { Image } from "../display/Image";
import { Light } from "../display/Light";
import { Container } from "../display/Container";
import { StageContainer } from "../display/StageContainer";
import { arraySet, noop } from "../utils/helpers";
import { Buffer } from "../utils/Buffer";
import { Utils } from "../utils/Utils";
import "../geom/PointType";

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
    config.locations = [
      "aDt",
      "aDst"
    ];

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

    this._dataBuffer = new Buffer("aDt", maxRenderCount, 3, 4);
    this._distortionBuffer = new Buffer("aDst", maxRenderCount, 4, 2);

    this._onMouseEventHandler = this._onMouseEventHandler.bind(this);
    const canvas = this.context.canvas,
      lightRenderer = config.lightRenderer;

    _INTERACTION_EVENT_TYPES.forEach((type) =>
      canvas.addEventListener(type, this._onMouseEventHandler)
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
      canvas.removeEventListener(type, this._onMouseEventHandler)
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
        dataBufferId + 8
      );
      dataBufferData[dataBufferId + 4] =
        image.alpha * itemParent.getPremultipliedAlpha();
      dataBufferData[dataBufferId + 5] =
        image.tintType * itemParent.getPremultipliedUseTint();
      dataBufferData[dataBufferId + 6] = this.context.useTexture(
        image.texture,
        this.$renderTime,
        false,
        this._batchDraw
      );
      dataBufferData[dataBufferId + 7] = image.distortionProps.distortTexture;

      arraySet(matrixBufferData, image.matrixCache, matrixBufferId);
      arraySet(matrixBufferData, image.textureMatrixCache, matrixBufferId + 6);
      arraySet(matrixBufferData, image.textureCropCache, matrixBufferId + 12);

      arraySet(
        this._distortionBuffer.data,
        image.distortionPropsCache,
        batchItems * 8
      );

      ++this._batchItems === this.$MAX_RENDER_COUNT && this._batchDraw();
    }
  }

  /**
   * @ignore
   */
  _batchDraw() {
    if (this._batchItems) {
      this.$uploadBuffers();
      this.$gl.uniform1iv(this.$locations.uTx, this.context.textureIds);
      this.$drawInstanced(this._batchItems);
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
      (canvas.height / canvas.offsetHeight) * event.offsetY
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

    return "" +
    Utils.GLSL.DEFINE.Z +

    "in vec2 " +
      "aPs;" +
    "in mat4x2 " +
      "aDst;" +
    "in mat3x4 " +
      "aDt;" +
    "in mat4 " +
      "aMt;" +

    "uniform float " +
      "uFlpY;" +
    "uniform sampler2D " +
      "uTx[" + maxTextureImageUnits + "];" +

    "out float " +
      "vACl," +
      "vTId," +
      "vTTp;" +
    "out vec2 " +
      "vTUv," +
      "vTsh;" +
    "out vec4 " +
      "vTCrop," +
      "vCl" +
    (useRepeatTextures
      ? ",vRR;"
      : ";") +

    "vec2 gtTexS(float i){" +
      Array(maxTextureImageUnits).fill().map((v, i) => 
      "if(i<" + (i + 1) + ".)" + 
        "return .5/vec2(textureSize(uTx[" + i + "],0));").join("") +
      "return Z.yy;" +
    "}" +

    "vec2 clcQd(vec2 p){" +
      "return mix(" + 
        "mix(" + 
          "aDst[0]," + 
          "aDst[1]," + 
          "p.x" + 
        ")," + 
        "mix(" + 
          "aDst[3]," + 
          "aDst[2]," + 
          "p.x" + 
        ")," + 
        "p.y" + 
      ");" +
    "}" +

    "void main(void){" +
      "vec2 " +
        "tPs=clcQd(aPs);" +
      "gl_Position=vec4(" + 
        "mat3(aMt[0].xy,0,aMt[0].zw,0,aMt[1].xy,1)*" + 
        "vec3(tPs,1.)," + 
        "1" + 
      ");" +
      "gl_Position.y*=uFlpY;" +
      "vTUv=(" + 
        "mat3(aMt[1].zw,0,aMt[2].xy,0,aMt[2].zw,1)*" + 
        "vec3(" +
          "mix(" + 
            "tPs," + 
            "aPs," + 
            "aDt[1].w" + 
          ")," +
          "1." +
        ")" + 
      ").xy;" + 

      "vTCrop=aMt[3];" +

      "vCl=aDt[0];" +
      "vACl=aDt[1].x;" +

      "vTTp=aDt[1].y;" +
      "vTId=aDt[1].z;" +

      "vTsh=gtTexS(vTId);" +

      (useRepeatTextures
        ? "vRR=aDt[2];"
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
      "gtTexCl(vTId,vTCrop," + modCoordName + ")";

    return "" +
    Utils.GLSL.DEFINE.Z +
    Utils.GLSL.DEFINE.RADIANS_360 +

    "in float " +
      "vACl," +
      "vTId," +
      "vTTp;" +
    "in vec2 " +
      "vTUv," + 
      "vTsh;" +
    "in vec4 " +
      "vTCrop," +
      "vCl" +
      (useRepeatTextures
        ? ",vRR;"
        : ";") +

    "uniform sampler2D " +
      "uTx[" + maxTextureImageUnits + "];" +

    "out vec4 " +
      "oCl;" +

    "vec4 gtTexCl(float i,vec4 s,vec2 m){" +
      Array(maxTextureImageUnits).fill().map((v, i) => 
      "if(i<" + (i + 1) + ".)" + 
        "return texture(uTx[" + i + "],clamp(s.xy+s.zw*m,s.xy+vTsh,s.xy+s.zw-vTsh));").join("") +
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
      ? Utils.GLSL.RANDOM +
        "vec4 gtClBUv(vec2 st){" +
          "vec2 " +
            "uv=vTUv;" +

          "float " +
            "rnd=rand(floor(uv+st))," +
            "rndDg=rnd*RADIANS_360*vRR.x;" +

          "if(rndDg>0.){" +
            "vec2 " +
              "rt=vec2(sin(rndDg),cos(rndDg));" +
            "uv=vec2(uv.x*rt.y-uv.y*rt.x,uv.x*rt.x+uv.y*rt.y);" +
          "}" +

          "return " + getSimpleTexColor("mod(uv,Z.yy)") + ";" +
        "}" +

        "float gtRClBUv(vec2 st,vec2 uv){" +
          "float " +
            "rnd=rand(floor(vTUv+st));" +
          "return (1.-(vRR.w*rnd-vRR.w*.5)*vRR.y)*" +
            "cosine(0.,1.,1.-st.x-uv.x)*cosine(0.,1.,1.-st.y-uv.y);" +
        "}"
      : "") +

    "void main(void){" +
      "if(vTId>-1.){" +
        "vec2 " +
          "uv=mod(vTUv,Z.yy);" +

        (useRepeatTextures
          ? "if(vRR.x>0.||vRR.y>0.){" +
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
                "vec4(vRR.z)" + 
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
                  "vRR.y" +
                ");" +
            "}else oCl=" + getSimpleTexColor("uv") + ";"
          : "oCl=" + getSimpleTexColor("uv") + ";") +
      "}else oCl+=1.;" +

      "oCl.a*=vACl;" +

      "if(oCl.a<=0.)discard;" +

      (useTint
        ? "if(vTTp>0.)" +
          "if(vTTp==1.||(vTTp==2.&&oCl.r==oCl.g&&oCl.r==oCl.b))" +
            "oCl*=vCl;" +
          "else if(vTTp==3.)" +
            "oCl=vCl;" +
          "else if(vTTp==4.)" +
            "oCl+=vCl;" 
        : "") +
    "}";
  }
}
