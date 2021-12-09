import { arraySet, emptyFunction } from "../utils/helpers.js";
import "../namespace.js";
import "../display/Item.js";
import "../geom/Matrix3.js";
import "../display/Container.js";
import "../display/StageContainer.js";
import "../utils/Utils.js";
import "./BatchRenderer.js";

AGL.Stage2D = class extends AGL.BatchRenderer {
  constructor(options) {
    options = {... {
      useTint : true
    }, ... (options || {})};

    options.config = AGL.Utils.initRendererConfig(options.config, AGL.Stage2D);
    options.config.locations = options.config.locations.concat([
      "aDt",
      "aDst",
      "uWCl",
      "uWA"
    ]);
    const maxBatchItems =
    options.maxBatchItems = options.maxBatchItems || 1e4;

    super(options);

    this._container = new AGL.StageContainer(this);

    this._batchItems = 0;

    this._drawFunctionMap = {};
    this._drawFunctionMap[AGL.Item.TYPE] = emptyFunction;
    this._drawFunctionMap[AGL.Image.TYPE] = this._drawImage.bind(this);
    this._drawFunctionMap[AGL.Container.TYPE] = this._drawContainer.bind(this);

    this._batchDrawBound = this._batchDraw.bind(this);
    this._drawItemBound = this._drawItem.bind(this);

    /*
    this.picked
    this._isPickerSet
    */

    this.pickerPoint = AGL.Point.create();

    this._dataBuffer = new AGL.Buffer(
      "aDt", maxBatchItems,
      3, 4
    );

    this._distortionBuffer = new AGL.Buffer(
      "aDst", maxBatchItems,
      4, 2
    );
  }

  get container() { return this._container; }

  render() {
    this.picked = null;

    super.render();

    this._isPickerSet = false;
  }

  setPickerPoint(point) {
    this._isPickerSet = true;

    this.pickerPoint.x = (point.x - this.widthHalf) * this.matrixCache[0];
    this.pickerPoint.y = (point.y - this.heightHalf) * this.matrixCache[4];
  }

  _render() {
    this._drawItem(this._container);
    this._batchDraw();
  }

  _drawItem(item) {
    item.update(this._renderTime);
    item.callback(item, this._renderTime);
    item.renderable && this._drawFunctionMap[item.TYPE](item);
  }

  _drawContainer(container) {
    this._gl.uniform4fv(this._locations.uWCl, container.colorCache);
    this._gl.uniform1f(this._locations.uWA, container.premultipliedAlpha);

    const children = container.children;
    for (let i = 0, l = children.length; i < l; ++i)
      this._drawItem(children[i]);
  }

  _drawImage(item) {
    this._context.setBlendMode(item.blendMode, this._batchDrawBound);

    if (
      this._isPickerSet &&
      item.interactive &&
      item.isContainsPoint(this.pickerPoint)
    ) this.picked = item;

    const twId  = this._batchItems * 12;
    const matId = this._batchItems * 16;

    arraySet(this._dataBuffer.data, item.colorCache, twId);
    arraySet(
      this._dataBuffer.data,
      item.textureRepeatRandomCache,
      twId + 8
    );

    this._dataBuffer.data[twId + 4] = item.props.alpha;
    this._dataBuffer.data[twId + 5] = item.tintType;
    this._dataBuffer.data[twId + 6] = this._context.useTexture(
      item.texture,
      this._renderTime,
      false,
      this._batchDrawBound
    );
    this._dataBuffer.data[twId + 7] = item.distortionProps.distortTexture;

    arraySet(this._matrixBuffer.data, item.matrixCache, matId);
    arraySet(
      this._matrixBuffer.data,
      item.textureMatrixCache,
      matId + 6
    );
    arraySet(
      this._matrixBuffer.data,
      item.textureCropCache,
      matId + 12
    );

    arraySet(
      this._distortionBuffer.data,
      item.distortionPropsCache,
      this._batchItems * 8
    );

    ++this._batchItems === this._MAX_BATCH_ITEMS && this._batchDraw();
  }

  _batchDraw() {
    if (this._batchItems > 0) {
      this._uploadBuffers();

      this._gl.uniform1iv(this._locations.uTex, this._context.textureIds);

      this._drawInstanced(this._batchItems);

      this._batchItems = 0;
    }
  }

  _customResize() {
    AGL.Matrix3.projection(
      this._width,
      this._height,
      this._container.parent.matrixCache
    );
    ++this._container.parent.propsUpdateId;
  }

  _uploadBuffers() {
    this._dataBuffer.upload(this._gl, this._enableBuffers, this._locations);
    this._distortionBuffer.upload(
      this._gl,
      this._enableBuffers,
      this._locations
    );

    super._uploadBuffers();
  }

  _createBuffers() {
    super._createBuffers();

    this._dataBuffer.create(this._gl);
    this._distortionBuffer.create(this._gl);
  }

  _createVertexShader(options) {
    const useRepeatTextures = options.useRepeatTextures;

    return AGL.Utils.createVersion(options.config.precision) +
    "in vec2 aPos;" +
    "in mat4x2 aDst;" +
    "in mat3x4 aDt;" +
    "in mat4 aMt;" +

    "uniform float " +
      "uFlpY," +
      "uWA;" +
    "uniform vec4 uWCl;" +

    "out float " +
      "vACl," +
      "vTId," +
      "vTTp;" +
    "out vec2 vTCrd;" +
    "out vec4 vTCrop" +
    (useRepeatTextures
      ? ",vRR;"
      : ";") +
    "out mat2x4 vCl;" +

    "vec2 clcQd(vec2 p){" +
      "vec2 o=1.-p;" +
      "vec4 cmt=vec4(" +
        "o.y*aDst[0].x+p.y*aDst[3].x," +
        "o.x*aDst[0].y+p.x*aDst[1].y," +
        "o.y*aDst[1].x+p.y*aDst[2].x," +
        "o.x*aDst[3].y+p.x*aDst[2].y" +
      ");" +
      "return vec2(" +
        "o.x*cmt.x+p.x*cmt.z," +
        "o.y*cmt.y+p.y*cmt.w" +
      ");" +
    "}" +

    "void main(void){" +
      "mat3 " +
        "mt=mat3(aMt[0].xy,0,aMt[0].zw,0,aMt[1].xy,1)," +
        "tMt=mat3(aMt[1].zw,0,aMt[2].xy,0,aMt[2].zw,1);" +

      "vec3 tPos=vec3(" +
        "clcQd(aPos)," +
        "1" +
      ");" +
      "gl_Position=vec4(mt*tPos,1);" +
      "gl_Position.y*=uFlpY;" +
      "float dt=aDt[1].w;" +
      "vTCrd=(tMt*((dt*vec3(aPos,1))+((1.-dt)*tPos))).xy;" +
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

  _createFragmentShader(options) {
    const maxTextureImageUnits = AGL.Utils.INFO.maxTextureImageUnits;
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

    return AGL.Utils.createVersion(options.config.precision) +
    "in float " +
      "vACl," +
      "vTId," +
      "vTTp;" +
    "in vec2 vTCrd;" +
    "in vec4 vTCrop" +
    (useRepeatTextures
      ? ",vRR;"
      : ";") +
    "in mat2x4 vCl;" +

    "uniform sampler2D uTex[" + maxTextureImageUnits + "];" +

    "out vec4 oCl;" +

    createGetTextureFunction(maxTextureImageUnits) +

    (useRepeatTextures
      ? AGL.Utils.GLSL_RANDOM +
        "vec4 gtClBCrd(vec2 st){" +
          "vec2 tCrd=vTCrd;" +

          "float " +
            "rnd=rand(floor(tCrd+st),1.)," +
            "rndDg=rnd*360.*vRR.x;" +

          "if(rndDg>0.){" +
            "vec2 rt=vec2(sin(rndDg),cos(rndDg));" +
            "tCrd=vec2(tCrd.x*rt.y-tCrd.y*rt.x,tCrd.x*rt.x+tCrd.y*rt.y);" +
          "}" +

          "return " + getSimpleTexColor("mod(tCrd,1.)") + ";" +
        "}" +
        "float gtRClBCrd(vec2 st,vec2 crd){" +
          "float rnd=rand(floor(vTCrd+st),1.);" +
          "return (1.-(2.*rnd-1.)*vRR.y)*" +
            "abs((1.-st.x-crd.x)*(1.-st.y-crd.y));" +
        "}"
      : "") +

    "void main(void){" +
      "if(vTId>-1.){" +
        "vec2 crd=mod(vTCrd,1.);" +

        (useRepeatTextures
          ? "if(vRR.w>0.){" +
              "vec2 zr=vec2(0,1);" +
              "oCl=vRR.z>0." +
                "?(" +
                  "gtClBCrd(zr.xx)+" +
                  "gtClBCrd(zr.yx)+" +
                  "gtClBCrd(zr.xy)+" +
                  "gtClBCrd(zr.yy)" +
                ")/vec4(4)" +
                ":gtClBCrd(zr);" +
              "if(vRR.y>0.)oCl.rgb*=(" +
                "gtRClBCrd(zr.xx,crd)+" +
                "gtRClBCrd(zr.yx,crd)+" +
                "gtRClBCrd(zr.xy,crd)+" +
                "gtRClBCrd(zr.yy,crd)" +
              ");" +
            "}else oCl=" + getSimpleTexColor("crd") + ";"
          : "oCl=" + getSimpleTexColor("crd") + ";") +
      "}else oCl+=1.;" +

      "oCl.a*=vACl;" +

      "if(oCl.a<=0.)discard;" +

      (useTint
        ? "if(vTTp>0.){" +
            "vec3 cl=vCl[1].rgb+oCl.rgb*vCl[1].a;" +
            "if(vTTp<2.||(vTTp<3.&&oCl.r==oCl.g&&oCl.r==oCl.b))" +
              "oCl.rgb*=cl;" +
            "else if(vTTp<4.)" +
              "oCl.rgb=cl;" +
          "}"
        : "") +

      "oCl*=vCl[0];" +
    "}";
  }
}
