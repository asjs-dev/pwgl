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
 * @property {TextureInfo} sourceTexture
 * @property {TextureInfo} normalMap
 * @property {TextureInfo} heightMap
 * @property {TextureInfo} roughnessMap
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
  }

  /**
   * Register a Light instance for rendering
   * @param {Light} light
   */
  registerLightForRender(light) {
    if (this._batchItems < this.$MAX_BATCH_ITEMS) {
      const matId = this._batchItems * 16;
      const extId = this._batchItems * 8;

      const matData = this.$matrixBuffer.data;
      const extData = this._extensionBuffer.data;

      arraySet(matData, light.matrixCache, matId);
      matData[matId + 6] = light.transform.width;
      matData[matId + 7] = light.spotAngle;
      arraySet(matData, light.colorCache, matId + 8);
      matData[matId + 12] = light.shadowLength;
      matData[matId + 13] = light.alpha * light.parent.premultipliedAlpha;
      matData[matId + 14] = light.angle;

      extData[extId] = light.type;
      extData[extId + 1] = light.flags;
      extData[extId + 2] = light.transform.z;
      extData[extId + 3] = light.precision;
      extData[extId + 4] = light.maxShadowStep;
      extData[extId + 5] = light.specularStrength;

      this._batchItems++;
    }
  }

  /**
   * @ignore
   */
  $render() {
    this.context.setBlendMode(BlendMode.ADD);

    let sizable = this;

    if (this.sourceTexture) {
      this.$useTexture(this.sourceTexture, this.$locations.uSTTex);
      sizable = this.sourceTexture;
      this.$gl.uniform1f(this.$locations.uUSTT, 1);
    } else this.$gl.uniform1f(this.$locations.uUSTT, 0);

    if (this.normalMap) {
      this.$useTexture(this.normalMap, this.$locations.uNMTex);
      sizable = this.normalMap;
      this.$gl.uniform1f(this.$locations.uUNMT, 1);
    } else this.$gl.uniform1f(this.$locations.uUNMT, 0);

    if (this.roughnessMap) {
      this.$useTexture(this.roughnessMap, this.$locations.uRGTex);
      sizable = this.roughnessMap;
      this.$gl.uniform1f(this.$locations.uURGT, 1);
    } else this.$gl.uniform1f(this.$locations.uURGT, 0);

    if (this.heightMap) {
      this.$useTexture(this.heightMap, this.$locations.uTex);
      sizable = this.heightMap;
    }

    this.$gl.uniform2f(this.$locations.uTS, sizable.width, sizable.height);

    this.$uploadBuffers();

    this.$drawInstanced(this._batchItems);
    this._batchItems = 0;
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
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    return Utils.GLSL.VERSION + 
    "precision highp float;\n" +

    Utils.GLSL.DEFINE.PI +
    Utils.GLSL.DEFINE.Z +
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
      "vShl," +
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
    "out vec4 " +
      "flg;" +

    "void main(void){" +
      "vec3 pos=vec3(aPos*2.-1.,1);" +

      "vExt=aExt;" +
      "vCl=aMt[2];" +
      "vDt=aMt[3];" +

      "int " +
        "f=int(vExt[0].y);" +
      
      "flg=vec4(f&1,f&2,f&4,f&8);" +

      "vUv.xy=pos.xy;" +
      "vHS=vExt[0].z;" +

      "mat3 mt=mat3(aMt[0].xy,0,aMt[0].zw,0,aMt[1].xy,1);" +
      "vD=aMt[1].z;" +
      "vShl=vD*vDt.x;" +

      "if(vExt[0].x<1.){" +
        "gl_Position=vec4(mt*pos,1);" +
        "vTUv=(gl_Position.xy+P.xy)/P.zw;" +
        "vUv.zw=(aMt[1].xy+P.xy)/P.zw;" +
        "vSpt=PI-aMt[1].w;" +
        "vSln=vec2(sin(vDt.z),cos(vDt.z));" +
      "}else{" +
        "mt[2].xy=Z.zy;" +
        "gl_Position=vec4(pos,1);" +
        "vTUv=vec2(aPos.x,1.-aPos.y);" +
        "vUv.zw=vTUv+((mt*vec3(1)).xy+P.xy)/P.zw;" +
      "}" +

      "gl_Position.y*=uFlpY;" +
    "}";
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    const loop = (core) => "for(i=m;i<l;i+=st){" +
            "p=ivec2((vUv.zw+i*opdm)*uTS);" +
            "tc=texelFetch(uTex,p,0)*HEIGHT;" +
            core +
          "}";

    return Utils.GLSL.VERSION + 
    "precision highp float;\n" +

    Utils.GLSL.DEFINE.HEIGHT +
    Utils.GLSL.DEFINE.PI +
    Utils.GLSL.DEFINE.Z +

    "in float " +
      "vHS," +
      "vD," +
      "vShl," +
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
    "in vec4 " +
      "flg;" +

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

    Utils.GLSL.RANDOM +

    "void main(void){" +
      "vec2 " +
        "tUv=vTUv*uTS," +
        "tCnt=vUv.zw*uTS;" +

      "vec4 " +
        "tc=texelFetch(uTex,ivec2(tUv),0);" +

      "float " +
        "ph=tc.g*HEIGHT," +
        "shn=tc.b," +
        "rgh=1.;" +

      "vec3 " +
        "sf=vec3(tUv,ph)," +
        "lp=vec3(tCnt,vHS)," +
        "sftla=lp-sf;" +

      "float " +
        "dst=1.-length(sftla)/vD," +
        "vol=vDt.y*vCl.a," +
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

        "if(" +
          "atan(" +
            "sl.x," +
            "length(vec2(sl.y,vUv.y))" +
          ")+1.5707963267948966-vSpt<0.)discard;" +
      "}" +

      "float " +
        "fltDst=distance(tCnt,tUv)," +
        "shdw=1.;" +

      "if(flg.y>0.){" +
        "vec3 " +
          "nm=uUNMT<1." + 
            "?Z.xxy" + 
            ":normalize((texture(uNMTex,vTUv).rgb*2.-1.)*Z.yzy)," +
          "sftl=normalize(sftla)," +
          "sftv=normalize(vec3(" +
            "flg.w>0." +
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

      "if(flg.x>0.){" +
        "ivec2 " +
          "p;" +

        "vec2 " +
          "opd=(tUv-tCnt)/fltDst," +
          "opdm=opd/uTS;" +

        "float " +
          "shl=vShl," + // shadow length
          "st=max(1.,ceil(fltDst/vExt[1].x))," + // loop step length
          "hst=(ph-vHS)/fltDst," + // vertical step
          "opdL=length(opd)," + // horizontal step
          "i," +
          "pc," +
          "l=fltDst-st," +
          "m=max(st,l-shl);" +
        
        "if(flg.z>0.){" + 
          loop("if(tc.g>=vHS)discard;") +
        "}else{" +
          "float " +
            "rnd=vExt[0].w*rand(vTUv*100.+50.);" +
            
          loop(
            "st+=rnd;" +
            "pc=vHS+i*hst;" +
            "if(tc.r<=pc&&tc.g>=pc)shdw*=(fltDst-i*opdL)/shl;"
          ) +
        "}" +
      "}" +
      
      "if(shdw<=0.)discard;" +

      "vec3 " +
        "stCl=uUSTT<1.?Z.yyy:texture(uSTTex,vTUv).rgb;" +
        
      "oCl=vec4((stCl+spc)*vCl.rgb*vol*shdw,1);" +
    "}";
  }
}
