import { Utils } from "../utils/Utils";
import { Buffer } from "../utils/Buffer";
import { BlendMode } from "../data/BlendMode";
import { Light } from "../display/Light";
import { BatchRenderer } from "./BatchRenderer";

/**
 * @typedef {Object} LightRendererConfig
 * @extends {RendererConfig}
 * @property {number} lightNum
 * @property {TextureInfo} sourceTexture
 * @property {TextureInfo} normalMap
 * @property {TextureInfo} heightMap
 * @property {TextureInfo} roughnessMap
 */

/**
 * <pre>
 *  Light renderer
 *  - Renders lights and shadows based on height, normal and roughness map
 *  - Height map could store the following values:
 *    - Red channel: start of a vertical object
 *    - Green channel: end of a vertical object
 *    - Blue channel: shiness of the surface
 *  - If the roughness map exists, the shiness and roughness values are
 *    derived from its red and green channels.
 *  - Every input texture are optional
 * </pre>
 * @extends {BatchRenderer}
 */
export class LightRenderer extends BatchRenderer {
  /**
   * Creates an instance of LightRenderer.
   * @constructor
   * @param {LightRendererConfig} options
   */
  constructor(options = {}) {
    options.config = Utils.initRendererConfig(options.config);

    // prettier-ignore
    options.config.locations = options.config.locations.concat([
      "uNMTex",
      "uSTTex",
      "uRGTex",
      "aExt",
      "uTS",
      "uUSTT",
      "uUNMT",
      "uURGT"
    ]);

    const maxBatchItems = (options.maxBatchItems = options.lightNum || 1);

    super(options);

    this.clearBeforeRender = true;
    this.clearColor.set(0, 0, 0, 1);

    this.sourceTexture = options.sourceTexture;
    this.normalMap = options.normalMap;
    this.heightMap = options.heightMap;
    this.roughnessMap = options.roughnessMap;

    this._extensionBuffer = new Buffer("aExt", maxBatchItems, 2, 4);

    this._lights = [];
  }

  /**
   * Register a Light instance
   * @param {Light} light
   */
  registerLight(light) {
    if (this._lights.indexOf(light) > -1) return;

    let index = this._lights.indexOf(null);
    index > -1
      ? (this._lights[index] = light)
      : (index = this._lights.push(light) - 1);

    light.registerData(
      index,
      this.$matrixBuffer.data,
      this._extensionBuffer.data
    );
  }

  /**
   * Remove a Light instance
   * @param {Light} light
   */
  unregisterLight(light) {
    const index = this._lights.indexOf(light);
    if (index > -1) {
      this._lights[index] = null;
      light.unregisterData();
    }
  }

  /**
   * @ignore
   */
  $render() {
    this.context.setBlendMode(BlendMode.ADD);

    let sizeable = this;

    if (this.sourceTexture) {
      this.$useTexture(this.sourceTexture, this.$locations.uSTTex);
      sizeable = this.sourceTexture;
      this.$gl.uniform1f(this.$locations.uUSTT, 1);
    } else this.$gl.uniform1f(this.$locations.uUSTT, 0);

    if (this.normalMap) {
      this.$useTexture(this.normalMap, this.$locations.uNMTex);
      sizeable = this.normalMap;
      this.$gl.uniform1f(this.$locations.uUNMT, 1);
    } else this.$gl.uniform1f(this.$locations.uUNMT, 0);

    if (this.roughnessMap) {
      this.$useTexture(this.roughnessMap, this.$locations.uRGTex);
      sizeable = this.roughnessMap;
      this.$gl.uniform1f(this.$locations.uURGT, 1);
    } else this.$gl.uniform1f(this.$locations.uURGT, 0);

    if (this.heightMap) {
      this.$useTexture(this.heightMap, this.$locations.uTex);
      sizeable = this.heightMap;
    }

    this.$gl.uniform2f(this.$locations.uTS, sizeable.width, sizeable.height);

    this.$uploadBuffers();

    this.$drawInstanced(this.$MAX_BATCH_ITEMS);
  }

  /**
   * @ignore
   */
  $uploadBuffers() {
    this._extensionBuffer.upload(this.$gl, this.$enableBuffers);
    super.$uploadBuffers();
  }

  /**
   * @ignore
   */
  $createBuffers() {
    super.$createBuffers();
    this._extensionBuffer.create(this.$gl, this.$locations);
  }

  // prettier-ignore
  /**
   * @param {LightRendererConfig} options
   * @returns {string}
   * @ignore
   */
  $createVertexShader(options) {
    return Utils.GLSL.VERSION + 
    "precision highp float;\n" +

    Utils.GLSL.DEFINE.PI +
    "#define P vec4(1,-1,2,-2)\n" +

    "in vec2 " +
      "aPos;" +
    "in mat4 " +
      "aMt;" +
    "in mat2x4 " +
      "aExt;" +

    "uniform float " +
      "uFlpY;" +

    "out float " +
      "vHS," +
      "vD," +
      "vSpt;" +
    "out vec2 " +
      "vTUv," +
      "vSln;" +
    "out vec4 " +
      "vUv," +
      "vCl," +
      "vDt;" +
    "out mat2x4 " +
      "vExt;" +

    "void main(void){" +
      "vec3 pos=vec3(aPos*2.-1.,1);" +

      "vExt=aExt;" +
      "vCl=aMt[2];" +
      "vDt=aMt[3];" +

      "vUv.xy=pos.xy;" +
      "vHS=vExt[0].z;" +

      "mat3 mt=mat3(aMt[0].xy,0,aMt[0].zw,0,aMt[1].xy,1);" +
      "vD=aMt[1].z;" +

      "if(vExt[0].x<1.){" +
        "gl_Position=vec4(mt*pos,1);" +
        "vTUv=(gl_Position.xy+P.xy)/P.zw;" +
        "vUv.zw=(aMt[1].xy+P.xy)/P.zw;" +
        "vSpt=PI-aMt[1].w;" +
        "vSln=vec2(sin(vDt.w),cos(vDt.w));" +
      "}else{" +
        "mt[2].xy=vec2(-1,1);" +
        "gl_Position=vec4(pos,1);" +
        "vTUv=vec2(aPos.x,1.-aPos.y);" +
        "vUv.zw=vTUv+((mt*vec3(1)).xy+P.xy)/P.zw;" +
      "}" +

      "gl_Position.y*=uFlpY;" +
    "}";
  }

  // prettier-ignore
  /**
   * @param {LightRendererConfig} options
   * @returns {string}
   * @ignore
   */
  $createFragmentShader(options) {
    return Utils.GLSL.VERSION + 
    "precision highp float;\n" +

    Utils.GLSL.DEFINE.HEIGHT +
    Utils.GLSL.DEFINE.PI +
    "#define PIH 1.570796326795\n" +

    "in float " +
      "vHS," +
      "vD," +
      "vSpt;" +
    "in vec2 " +
      "vTUv," +
      "vSln;" +
    "in vec4 " +
      "vUv," +
      "vCl," +
      "vDt;" +
    "in mat2x4 " +
      "vExt;" +

    "uniform sampler2D " +
      "uNMTex," +
      "uSTTex," +
      "uRGTex," +
      "uTex;" +
    "uniform float " +
      "uUSTT," +
      "uURGT," +
      "uUNMT;" +
    "uniform vec2 " +
      "uTS;" +

    "out vec4 " +
      "oCl;" +

    "void main(void){" +
      "oCl=vec4(0);" +

      "if(vDt.x==0.)discard;" +

      "vec4 " +
        "tc=texture(uTex,vTUv);" +

      "float " +
        "ph=tc.g*HEIGHT," +
        "shn=tc.b," +
        "rgh=1.;" +

      "vec2 " +
        "tUv=vTUv*uTS," +
        "tCnt=vUv.zw*uTS;" +

      "vec3 " +
        "sf=vec3(tUv,ph)," +
        "lp=vec3(tCnt,vHS)," +
        "sftla=lp-sf;" +

      "float " +
        "dst=1.-length(sftla)/vD," +
        "vol=vDt.z*vCl.a," +
        "spc=0.;" +

      "if(vol<=0.)discard;" +

      "if(vExt[0].x<1.){" +
        "vol*=dst;" +
        "if(vol<=0.)discard;" +

        "float " +
          "slh=(vHS-ph)/HEIGHT;" +

        "vec2 " +
          "sl=vec2(" +
            "slh*vSln.y-vUv.x*vSln.x," +
            "slh*vSln.x+vUv.x*vSln.y" +
          ");" +

        "if((" +
          "atan(" +
            "sl.x," +
            "length(vec2(sl.y,vUv.y))" +
          ")+PIH" +
        ")-vSpt<0.)discard;" +
      "}" +

      "int " +
        "flg=int(vExt[0].y);" +

      "float " +
        "fltDst=distance(tCnt,tUv)," +
        "shdw=1.;" +

      "if((flg&2)>0){" +
        "vec3 " +
          "nm=uUNMT<1." + 
            "?vec3(0,0,1.)" + 
            ":normalize((texture(uNMTex,vTUv).rgb*2.-1.)*vec3(1,-1,1))," +
          "sftl=normalize(sftla)," +
          "sftv=normalize(vec3(" +
            "(flg&8)>0" +
              "?uTS*.5" +
              ":tUv," +
            "HEIGHT" +
          ")-sf)," +
          "hlf=normalize(sftl+sftv);" +

        "float lght=dot(nm,sftl);" +
        "vol*=lght;" +
        "if(vol<=0.)discard;" +
        "if(uURGT>0.){" + 
          "vec2 rgt=texture(uRGTex,vTUv).rg;" +
          "rgh=rgt.r;" +
          "shn=rgt.g;" +
        "}" +
        "spc=pow(dot(nm,hlf),rgh*HEIGHT)*shn*vExt[1].y;" +
      "}" +

      "if((flg&1)>0){" +
        "ivec2 " +
          "p;" +

        "vec2 " +
          "opd=(tUv-tCnt)/fltDst," +
          "opdm=opd/uTS;" +

        "float " +
          "shl=vD*vDt.y," + // shadow length
          "st=max(1.,ceil(max(fltDst/vExt[1].x,vExt[0].w)))," + // loop step length
          "hst=(ph-vHS)/fltDst," + // vertical step
          "opdL=length(opd)," + // horizontal step
          "i," +
          "pc;" +
        
        "float " +
          "l=fltDst-st," +
          "m=max(st,l-shl);" +
        
        "if((flg&4)>0){" + 
          "for(i=m;i<l;i+=st){" +
            "p=ivec2((vUv.zw+i*opdm)*uTS);" +
            "tc=texelFetch(uTex,p,0)*HEIGHT;" +
            "if(tc.g>=vHS)discard;" +
          "}" +
        "}else{" +
          "for(i=m;i<l;i+=st){" +
            "p=ivec2((vUv.zw+i*opdm)*uTS);" +
            "tc=texelFetch(uTex,p,0)*HEIGHT;" +
            "pc=vHS+i*hst;" +
            "if(tc.r<=pc&&tc.g>=pc){" +
              "shdw*=(fltDst-i*opdL)/shl;" +
            "}" +
          "}" +
        "}" +
      "}" +
      
      "if(shdw<=0.)discard;" +

      "vec3 " +
        "stCl=uUSTT<1.?vec3(1):texture(uSTTex,vTUv).rgb;" +
      "oCl=vec4(((stCl+spc)*vCl.rgb)*vol*shdw,1);" +
    "}";
  }
}
