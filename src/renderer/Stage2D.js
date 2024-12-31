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
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import "../geom/PointType";

/**
 * @typedef {Object} Stage2DConfig
 * @extends {RendererConfig}
 */

const _INTERACTION_EVENT_TYPES = [
  "mousemove",
  "mousedown",
  "mouseup",
  "click",
  "touchstart",
  "touchmove",
  "touchend",
];

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
   * @param {Stage2DConfig} options
   */
  constructor(options = {}) {
    options.config = Utils.initRendererConfig(options.config);
    options.useTint = options.useTint ?? true;

    // prettier-ignore
    options.config.locations = [
      "aDt",
      "aDst"
    ];

    super(options);

    const maxRenderCount = this.$MAX_RENDER_COUNT;

    this.container = new StageContainer(this);

    this._batchItems = 0;

    this["_draw" + Item.RENDERING_TYPE] = this["_draw" + Light.RENDERING_TYPE] =
      noop;
    this["_draw" + Image.RENDERING_TYPE] = this._drawImage;
    this["_draw" + Container.RENDERING_TYPE] = this._drawContainer;
    this._batchDraw = this._batchDraw.bind(this);

    this._mousePosition = { x: 0, y: 0 };

    this._dataBuffer = new Buffer("aDt", maxRenderCount, 3, 4);
    this._distortionBuffer = new Buffer("aDst", maxRenderCount, 4, 2);

    this._onMouseEventHandler = this._onMouseEventHandler.bind(this);
    const body = document.body;
    _INTERACTION_EVENT_TYPES.forEach((type) =>
      body.addEventListener(type, this._onMouseEventHandler)
    );
  }

  /**
   * Attach LightRenderer
   * Recommended to set LightRenderer when using Light
   * @param {LightRenderer} v
   */
  attachLightRenderer(v) {
    this["_draw" + Light.RENDERING_TYPE] = v.addLightForRender.bind(v);
  }

  /**
   * Detach LightRenderer
   */
  detachLightRenderer() {
    this["_draw" + Light.RENDERING_TYPE] = noop;
  }

  /**
   * Renders the scene
   */
  render() {
    this._eventTarget = null;
    super.render();
    this._isMousePositionSet = false;
    this._handleMouseEvent();
  }

  /**
   * Description placeholder
   */
  destruct() {
    const body = document.body;
    _INTERACTION_EVENT_TYPES.forEach((type) =>
      body.removeEventListener(type, this._onMouseEventHandler)
    );
  }

  /**
   * @ignore
   */
  _handleMouseEvent() {
    if (this._latestEvent) {
      if (this._eventTarget !== this._previousEventTarget) {
        const newEvent = {};
        for (let key in this._latestEvent)
          newEvent[key] = this._latestEvent[key];

        this._previousEventTarget &&
          this._previousEventTarget.callEventHandler(
            this._previousEventTarget,
            {
              ...newEvent,
              type: "mouseout",
            }
          );

        this._eventTarget &&
          this._eventTarget.callEventHandler(this._eventTarget, {
            ...newEvent,
            type: "mouseover",
          });
      }

      this._eventTarget &&
        this._eventTarget.callEventHandler(
          this._eventTarget,
          this._latestEvent
        );

      this._previousEventTarget = this._eventTarget;
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

    const matrixCache = this.container.parent.matrixCache;

    this._mousePosition.x = (x - this.widthHalf) * matrixCache[0];
    this._mousePosition.y = (y - this.heightHalf) * matrixCache[3];
  }

  /**
   * @param {Item} item
   * @ignore
   */
  _drawItem(item) {
    item.update(this.$renderTime);
    item.callbackBeforeRender(item, this.$renderTime);
    item.renderable && this["_draw" + item.RENDERING_TYPE](item);
    item.callbackAfterRender(item, this.$renderTime);
  }

  /**
   * @param {Container} container
   * @ignore
   */
  _drawContainer(container) {
    const children = container.children,
      l = children.length;

    for (let i = 0; i < l; ++i) this._drawItem(children[i]);
  }

  /**
   * @param {Image} image
   * @ignore
   */
  _drawImage(image) {
    this.context.setBlendMode(image.blendMode, this._batchDraw);

    if (
      this._isMousePositionSet &&
      image.interactive &&
      image.isContainsPoint(this._mousePosition)
    )
      this._eventTarget = image;

    const twId = this._batchItems * 12,
      matId = this._batchItems * 16,
      itemParent = image.parent,
      colorCache = image.colorCache,
      dataBuffer = this._dataBuffer.data,
      matrixBuffer = this.$matrixBuffer.data;

    arraySet(dataBuffer, colorCache, twId);
    arraySet(dataBuffer, image.textureRepeatRandomCache, twId + 8);
    dataBuffer[twId + 4] = image.alpha * itemParent.getPremultipliedAlpha();
    dataBuffer[twId + 5] =
      image.tintType * itemParent.getPremultipliedUseTint();
    dataBuffer[twId + 6] = this.context.useTexture(
      image.texture,
      this.$renderTime,
      false,
      this._batchDraw
    );
    dataBuffer[twId + 7] = image.distortionProps.distortTexture;

    arraySet(matrixBuffer, image.matrixCache, matId);
    arraySet(matrixBuffer, image.textureMatrixCache, matId + 6);
    arraySet(matrixBuffer, image.textureCropCache, matId + 12);

    arraySet(
      this._distortionBuffer.data,
      image.distortionPropsCache,
      this._batchItems * 8
    );

    ++this._batchItems === this.$MAX_RENDER_COUNT && this._batchDraw();
  }

  /**
   * @ignore
   */
  _batchDraw() {
    if (this._batchItems) {
      this.$uploadBuffers();
      this.$gl.uniform1iv(this.$locations.uTex, this.context.textureIds);
      this.$drawInstanced(this._batchItems);
      this._batchItems = 0;
    }
  }

  /**
   * @ignore
   */
  _onMouseEventHandler(event) {
    const canvas = this.context.canvas;
    if (event.target === canvas) {
      this._latestEvent = event;
      this._setMousePosition(
        (canvas.width / canvas.offsetWidth) * event.offsetX,
        (canvas.height / canvas.offsetHeight) * event.offsetY
      );
    }
  }

  /**
   * @ignore
   */
  $render() {
    this._drawItem(this.container);
    this._batchDraw();
  }

  /**
   * @ignore
   */
  $resize() {
    super.$resize();
    if (this.$sizeUpdateId) {
      this.$sizeUpdateId = 0;
      Matrix3Utilities.projection(this.container.parent.matrixCache, this);
      ++this.container.parent.propsUpdateId;
    }
  }

  /**
   * @ignore
   */
  $uploadBuffers() {
    this._dataBuffer.upload(this.$gl, this.$enableBuffers);
    this._distortionBuffer.upload(this.$gl, this.$enableBuffers);
    super.$uploadBuffers();
  }

  /**
   * @ignore
   */
  $createBuffers() {
    super.$createBuffers();
    this._dataBuffer.create(this.$gl, this.$locations);
    this._distortionBuffer.create(this.$gl, this.$locations);
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    const useRepeatTextures = this._options.useRepeatTextures;

    return Utils.GLSL.VERSION + 
    "precision highp float;\n" +

    "in vec2 " +
      "aPos;" +
    "in mat4x2 " +
      "aDst;" +
    "in mat3x4 " +
      "aDt;" +
    "in mat4 " +
      "aMt;" +

    "uniform float " +
      "uFlpY;" +

    "out float " +
      "vACl," +
      "vTId," +
      "vTTp;" +
    "out vec2 " +
      "vTUv;" +
    "out vec4 " +
      "vTCrop," +
      "vCl" +
    (useRepeatTextures
      ? ",vRR;"
      : ";") +

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
      "mat3 " +
        "mt=mat3(aMt[0].xy,0,aMt[0].zw,0,aMt[1].xy,1)," +
        "tMt=mat3(aMt[1].zw,0,aMt[2].xy,0,aMt[2].zw,1);" +

      "vec3 " +
        "tPos=vec3(" +
          "clcQd(aPos)," +
          "1" +
        ");" +
      "gl_Position=vec4(mt*tPos,1);" +
      "gl_Position.y*=uFlpY;" +
      "float dt=aDt[1].w;" +
      "vTUv=(tMt*((dt*vec3(aPos,1))+((1.-dt)*tPos))).xy;" + 

      "vTCrop=aMt[3];" +

      "vCl=aDt[0];" +
      "vACl=aDt[1].x;" +

      "vTTp=aDt[1].y;" +
      "vTId=aDt[1].z;" +

      (useRepeatTextures
        ? "vRR=aDt[2].xyzw;" +
          "vRR.w=vRR.x+vRR.y;"
        : "") +
    "}";
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    const options = this._options,
     maxTextureImageUnits = Utils.INFO.maxTextureImageUnits,
     useRepeatTextures = options.useRepeatTextures,
     useTint = options.useTint;

     const createGetTextureFunction = (maxTextureImageUnits) => {
      let func = "vec4 gtTexCl(float i,vec4 s,vec2 m){" +
        "vec2 " + 
          "tsh;";

      for (let i = 0; i < maxTextureImageUnits; ++i)
        func += "if(i<" + (i + 1) + ".){" + 
          "tsh=.5/vec2(textureSize(uTex[" + i + "],0));" +
          "return texture(uTex[" + i + "],clamp(s.xy+s.zw*m,s.xy+tsh,s.xy+s.zw-tsh));" +
        "}";
        func += "return Z.yyyy;" +
      "}";

      return func;
    }

    const getSimpleTexColor = (modCoordName) =>
      "gtTexCl(vTId,vTCrop," + modCoordName + ")";

    return Utils.GLSL.VERSION + 
    "precision highp float;\n" +

    Utils.GLSL.DEFINE.RADIAN_360 +
    Utils.GLSL.DEFINE.Z +

    "in float " +
      "vACl," +
      "vTId," +
      "vTTp;" +
    "in vec2 " +
      "vTUv;" +
    "in vec4 " +
      "vTCrop," +
      "vCl" +
      (useRepeatTextures
        ? ",vRR;"
        : ";") +

    "uniform sampler2D " +
      "uTex[" + maxTextureImageUnits + "];" +

    "out vec4 " +
      "oCl;" +

    createGetTextureFunction(maxTextureImageUnits) +

    "float cosine(float a,float b,float v){" +
      "v=abs(v);" +
      "v=v<.5?2.*v*v:1.-pow(-2.*v+2.,2.)/2.;" +
      "return a*(1.-v)+b*v;" +
    "}" +

    (useRepeatTextures
      ? Utils.GLSL.RANDOM +
        "vec4 gtClBUv(vec2 st){" +
          "vec2 " +
            "uv=vTUv;" +

          "float " +
            "rnd=rand(floor(uv+st))," +
            "rndDg=rnd*RADIAN_360*vRR.x;" +

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
          "return (1.-(2.*rnd-1.)*vRR.y)*" +
            "cosine(0.,1.,1.-st.x-uv.x)*cosine(0.,1.,1.-st.y-uv.y);" +
        "}"
      : "") +

    "void main(void){" +
      "if(vTId>-1.){" +
        "vec2 " +
          "uv=mod(vTUv,Z.yy);" +

        (useRepeatTextures
          ? "if(vRR.w>0.){" +
              "float " +
                "rca," +
                "rcb," +
                "rcc," +
                "rcd;" +
              "if(vRR.y+vRR.z>0.){" +
                "rca=gtRClBUv(Z.xx,uv);" +
                "rcb=gtRClBUv(Z.yx,uv);" +
                "rcc=gtRClBUv(Z.xy,uv);" +
                "rcd=gtRClBUv(Z.yy,uv);" +
              "}" +
              "oCl=vRR.z>0." +
                "?clamp(" +
                  "gtClBUv(Z.xx)*rca+" +
                  "gtClBUv(Z.yx)*rcb+" +
                  "gtClBUv(Z.xy)*rcc+" +
                  "gtClBUv(Z.yy)*rcd" +
                ",0.,1.)" +
                ":gtClBUv(Z.xy);" +
              "if(vRR.y>0.)" +
                "oCl.a=clamp(" +
                  "oCl.a*(" +
                    "rca+" +
                    "rcb+" +
                    "rcc+" +
                    "rcd" +
                  "),0.,1.);" +
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
