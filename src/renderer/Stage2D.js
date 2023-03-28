import { arraySet, noop } from "../utils/helpers";
import { Item } from "../display/Item";
import { Image } from "../display/Image";
import { Container } from "../display/Container";
import { StageContainer } from "../display/StageContainer";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import { PointUtilities } from "../geom/PointUtilities";
import { Buffer } from "../utils/Buffer";
import { Utils } from "../utils/Utils";
import { BatchRenderer } from "./BatchRenderer";
import { BaseItem } from "../display/BaseItem";
import { BaseDrawable } from "../display/BaseDrawable";

/**
 * @typedef {Object} Stage2DRendererConfig
 * @extends {RendererConfig}
 */

/**
 * Stage2D renderer
 *  - Renders multiple textures
 * @extends {BatchRenderer}
 */
export class Stage2D extends BatchRenderer {
  /**
   * Creates an instance of Stage2D.
   * @constructor
   * @param {Stage2DRendererConfig} options
   */
  constructor(options) {
    options = {
      ...{
        useTint: true,
      },
      ...(options || {}),
    };

    options.config = Utils.initRendererConfig(options.config);

    // prettier-ignore
    options.config.locations = options.config.locations.concat([
      "aDt",
      "aDst",
      "uWCl",
      "uWA"
    ]);

    const maxBatchItems = (options.maxBatchItems =
      options.maxBatchItems || 10000);

    super(options);

    this.container = new StageContainer(this);

    this._batchItems = 0;

    this["_draw" + Item.TYPE] = noop;
    this["_draw" + Image.TYPE] = this._drawImage.bind(this);
    this["_draw" + Container.TYPE] = this._drawContainer.bind(this);

    this._batchDraw = this._batchDraw.bind(this);
    this._drawItem = this._drawItem.bind(this);

    /*
    this.picked
    this._isPickerSet
    */

    this.pickerPoint = PointUtilities.create();

    this._dataBuffer = new Buffer("aDt", maxBatchItems, 3, 4);

    this._distortionBuffer = new Buffer("aDst", maxBatchItems, 4, 2);
  }

  /**
   * Renders the scene
   */
  render() {
    this.picked = null;

    super.render();

    this._isPickerSet = false;
  }

  /**
   * Set point for detect an item under it
   * @param {Point} point
   */
  setPickerPoint(point) {
    this._isPickerSet = true;

    this.pickerPoint.x = (point.x - this.widthHalf) * this.matrixCache[0];
    this.pickerPoint.y = (point.y - this.heightHalf) * this.matrixCache[4];
  }

  /**
   * @ignore
   */
  _render() {
    this._drawItem(this.container);
    this._batchDraw();
  }

  /**
   * @param {BaseItem} item
   * @ignore
   */
  _drawItem(item) {
    item.update(this._renderTime);
    item.callback(item, this._renderTime);
    item.renderable && this["_draw" + item.TYPE](item);
  }

  /**
   * @param {Container} container
   * @ignore
   */
  _drawContainer(container) {
    this._gl.uniform4fv(this._locations.uWCl, container.colorCache);
    this._gl.uniform1f(this._locations.uWA, container.premultipliedAlpha);

    const children = container.children;
    for (let i = 0, l = children.length; i < l; ++i)
      this._drawItem(children[i]);
  }

  /**
   * @param {BaseDrawable} item
   * @ignore
   */
  _drawImage(item) {
    this.context.setBlendMode(item.blendMode, this._batchDraw);

    if (
      this._isPickerSet &&
      item.interactive &&
      item.isContainsPoint(this.pickerPoint)
    )
      this.picked = item;

    const twId = this._batchItems * 12;
    const matId = this._batchItems * 16;

    arraySet(this._dataBuffer.data, item.colorCache, twId);
    arraySet(this._dataBuffer.data, item.textureRepeatRandomCache, twId + 8);

    this._dataBuffer.data[twId + 4] = item.props.alpha;
    this._dataBuffer.data[twId + 5] = item.tintType;
    this._dataBuffer.data[twId + 6] = this.context.useTexture(
      item.texture,
      this._renderTime,
      false,
      this._batchDraw
    );
    this._dataBuffer.data[twId + 7] = item.distortionProps.distortTexture;

    arraySet(this._matrixBuffer.data, item.matrixCache, matId);
    arraySet(this._matrixBuffer.data, item.textureMatrixCache, matId + 6);
    arraySet(this._matrixBuffer.data, item.textureCropCache, matId + 12);

    arraySet(
      this._distortionBuffer.data,
      item.distortionPropsCache,
      this._batchItems * 8
    );

    ++this._batchItems === this._MAX_BATCH_ITEMS && this._batchDraw();
  }

  /**
   * @ignore
   */
  _batchDraw() {
    if (this._batchItems > 0) {
      this._uploadBuffers();

      this._gl.uniform1iv(this._locations.uTex, this.context.textureIds);

      this._drawInstanced(this._batchItems);

      this._batchItems = 0;
    }
  }

  /**
   * @ignore
   */
  _resize() {
    super._resize();
    Matrix3Utilities.projection(this.container.parent.matrixCache, this);
    ++this.container.parent.propsUpdateId;
  }

  /**
   * @ignore
   */
  _uploadBuffers() {
    this._dataBuffer.upload(this._gl, this._enableBuffers);
    this._distortionBuffer.upload(this._gl, this._enableBuffers);

    super._uploadBuffers();
  }

  /**
   * @ignore
   */
  _createBuffers() {
    super._createBuffers();

    this._dataBuffer.create(this._gl, this._locations);
    this._distortionBuffer.create(this._gl, this._locations);
  }

  // prettier-ignore
  /**
   * @param {Stage2DRendererConfig} options
   * @returns {string}
   * @ignore
   */
  _createVertexShader(options) {
    const useRepeatTextures = options.useRepeatTextures;

    return Utils.createVersion(options.config.precision) +
    "in vec2 " +
      "aPos;" +
    "in mat4x2 " +
      "aDst;" +
    "in mat3x4 " +
      "aDt;" +
    "in mat4 " +
      "aMt;" +

    "uniform float " +
      "uFlpY," +
      "uWA;" +
    "uniform vec4 " +
      "uWCl;" +

    "out float " +
      "vACl," +
      "vTId," +
      "vTTp;" +
    "out vec2 " +
      "vTUv;" +
    "out vec4 " +
      "vTCrop" +
    (useRepeatTextures
      ? ",vRR;"
      : ";") +
    "out mat2x4 " +
      "vCl;" +

    "vec2 clcQd(vec2 p){" +
      "return vec2(" +
        "mix(" +
          "mix(aDst[0].x,aDst[1].x,p.x)," +
          "mix(aDst[3].x,aDst[2].x,p.x)," +
          "p.y" +
        ")," +
        "mix(" +
          "mix(aDst[0].y,aDst[3].y,p.y)," +
          "mix(aDst[1].y,aDst[2].y,p.y)," +
          "p.x" +
        ")" +
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

      "vCl=mat2x4(uWCl,aDt[0].rgb*aDt[0].a,1.-aDt[0].a);" +
      "vACl=uWA*aDt[1].x;" +

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
   * @param {Stage2DRendererConfig} options
   * @returns {string}
   * @ignore
   */
  _createFragmentShader(options) {
    const maxTextureImageUnits = Utils.INFO.maxTextureImageUnits;
    const useRepeatTextures = options.useRepeatTextures;
    const useTint = options.useTint;

    const createGetTextureFunction = (maxTextureImageUnits) => {
      let func = "vec4 gtTexCl(float i,vec2 c){";
      for (let i = 0; i < maxTextureImageUnits; ++i)
        func += "if(i<" + (i + 1) + ".)return texture(uTex[" + i + "],c);";
      func += "return vec4(1);" +
      "}";
      return func;
    }

    const getSimpleTexColor = (modCoordName) =>
      "gtTexCl(vTId,vTCrop.xy+vTCrop.zw*" + modCoordName + ")";

    return Utils.createVersion(options.config.precision) +
    "#define PI radians(180.)\n" +

    "in float " +
      "vACl," +
      "vTId," +
      "vTTp;" +
    "in vec2 " +
      "vTUv;" +
    "in vec4 " +
      "vTCrop" +
      (useRepeatTextures
        ? ",vRR;"
        : ";") +
    "in mat2x4 " +
      "vCl;" +

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
            "rndDg=rnd*360.*vRR.x;" +

          "if(rndDg>0.){" +
            "vec2 " +
              "rt=vec2(sin(rndDg),cos(rndDg));" +
            "uv=vec2(uv.x*rt.y-uv.y*rt.x,uv.x*rt.x+uv.y*rt.y);" +
          "}" +

          "return " + getSimpleTexColor("mod(uv,vec2(1))") + ";" +
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
          "uv=mod(vTUv,vec2(1));" +

        (useRepeatTextures
          ? "if(vRR.w>0.){" +
              "vec2 " +
                "zr=vec2(0,1);" +
              "float " +
                "rca," +
                "rcb," +
                "rcc," +
                "rcd;" +
              "if(vRR.y+vRR.z>0.){" +
                "rca=gtRClBUv(zr.xx,uv);" +
                "rcb=gtRClBUv(zr.yx,uv);" +
                "rcc=gtRClBUv(zr.xy,uv);" +
                "rcd=gtRClBUv(zr.yy,uv);" +
              "}" +
              "oCl=vRR.z>0." +
                "?clamp(" +
                  "gtClBUv(zr.xx)*rca+" +
                  "gtClBUv(zr.yx)*rcb+" +
                  "gtClBUv(zr.xy)*rcc+" +
                  "gtClBUv(zr.yy)*rcd" +
                ",0.,1.)" +
                ":gtClBUv(zr);" +
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
        ? "if(vTTp>0.){" +
            "vec3 cl=vCl[1].rgb+oCl.rgb*vCl[1].a;" +
            "if(vTTp==1.||(vTTp==2.&&oCl.r==oCl.g&&oCl.r==oCl.b))" +
              "oCl.rgb*=cl+oCl.rgb*vCl[1].a;" +
            "else if(vTTp==3.)" +
              "oCl.rgb=cl;" +
            "else if(vTTp==4.)" +
              "oCl.rgb+=cl;" +
          "}"
        : "") +

      "oCl*=vCl[0];" +
    "}";
  }
}
