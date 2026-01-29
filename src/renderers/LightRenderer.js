import { BatchRenderer } from "./BatchRenderer";
import { Utils } from "../core/Utils";
import { Buffer } from "../core/Buffer";
import { BlendMode } from "../rendering/BlendMode";
import { Light } from "../display/Light";
import {
  BASE_VERTEX_SHADER_ATTRIBUTES,
  BASE_VERTEX_SHADER_UNIFORMS,
} from "../utils/baseVertexShaderUtils";
import { arraySet } from "../../extensions/utils/arraySet";

/**
 * @typedef {Object} LightRendererConfig
 * @extends {RendererConfig}
 * @property {number} maxRenderCount
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
   * @param {LightRendererConfig} config
   */
  constructor(config = {}) {
    config = Utils.initRendererConfig(config);

    // prettier-ignore
    Utils.setLocations(config, [
      "aExt",
      "uNTx",
      "uSTx",
      "uRTx",
      "uTS",
      "uUT"
    ]);

    super(config);

    this.clearBeforeRender = true;
    this.clearColor.set(0, 0, 0, 1);

    this._sizable = this;

    this.sourceTexture = config.sourceTexture;
    this.normalMap = config.normalMap;
    this.heightMap = config.heightMap;
    this.roughnessMap = config.roughnessMap;

    // prettier-ignore
    this._extensionBuffer = new Buffer(
      "aExt",
      this.$MAX_RENDER_COUNT,
      2,
      3
    );
  }

  get sourceTexture() {
    return this._sourceTexture;
  }

  set sourceTexture(v) {
    this._sourceTexture = v;
    if (v) this._sizable = v;
  }

  get normalMap() {
    return this._normalMap;
  }

  set normalMap(v) {
    this._normalMap = v;
    if (v) this._sizable = v;
  }

  get heightMap() {
    return this._heightMap;
  }

  set heightMap(v) {
    this._heightMap = v;
    if (v) this._sizable = v;
  }

  get roughnessMap() {
    return this._roughnessMap;
  }

  set roughnessMap(v) {
    this._roughnessMap = v;
    if (v) this._sizable = v;
  }

  /**
   * Register a Light instance for rendering
   * @param {Light} light
   */
  addLightForRender(light) {
    const batchItems = this._batchItems,
      parent = light.parent;

    if (batchItems < this.$MAX_RENDER_COUNT && parent) {
      const matrixBufferId = batchItems * 16,
        extensionBufferId = batchItems * 6,
        matrixBufferData = this.$matrixBuffer.data,
        extensionBufferData = this._extensionBuffer.data;

      arraySet(matrixBufferData, light.matrixCache, matrixBufferId);
      matrixBufferData[matrixBufferId + 6] = light.transform.width;
      matrixBufferData[matrixBufferId + 7] = light.spotAngle;
      arraySet(matrixBufferData, light.colorCache, matrixBufferId + 8);
      matrixBufferData[matrixBufferId + 11] *=
        light.alpha * parent.getPremultipliedAlpha();
      matrixBufferData[matrixBufferId + 12] = light.shadowLength;
      matrixBufferData[matrixBufferId + 13] = light.angle;
      matrixBufferData[matrixBufferId + 14] = light.type;
      // matrixBufferData[matrixBufferId + 15] = reserved

      extensionBufferData[extensionBufferId] = light.flags;
      extensionBufferData[extensionBufferId + 1] = light.transform.z;
      extensionBufferData[extensionBufferId + 2] = light.precision;
      extensionBufferData[extensionBufferId + 3] = light.maxShadowStep;
      extensionBufferData[extensionBufferId + 4] = light.specularStrength;
      extensionBufferData[extensionBufferId + 5] = light.attenuation;

      ++this._batchItems;
    }
  }

  /**
   * @ignore
   */
  $render() {
    const gl = this.$gl,
      locations = this.$locations,
      sourceTextureBoolean = !!this.sourceTexture,
      normalMapBoolean = !!this.normalMap,
      roughnessMapBoolean = !!this.roughnessMap,
      heightMapBoolean = !!this.heightMap;

    this.context.setBlendMode(BlendMode.ADD);

    sourceTextureBoolean &&
      this.$useTexture(this._sourceTexture, locations.uSTx);

    normalMapBoolean && this.$useTexture(this._normalMap, locations.uNTx);

    roughnessMapBoolean && this.$useTexture(this._roughnessMap, locations.uRTx);

    heightMapBoolean && this.$useTexture(this._heightMap, locations.uTx);

    gl.uniform3f(
      locations.uUT,
      sourceTextureBoolean,
      roughnessMapBoolean,
      normalMapBoolean,
    );
    gl.uniform2f(locations.uTS, this._sizable.width, this._sizable.height);

    this.$uploadBuffers();

    this.$drawInstanced(this._batchItems);

    this._batchItems = 0;
  }

  /**
   * @ignore
   */
  $uploadBuffers() {
    this._extensionBuffer.upload(this.$gl);
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
    return Utils.GLSL.DEFINE.Z +
    Utils.GLSL.DEFINE.PI +
    "#define P vec4(1,-1,2,-2)\n" +

    BASE_VERTEX_SHADER_ATTRIBUTES +
    "in mat4 " +
      "aMt;" +
    "in mat2x3 " +
      "aExt;" +

    BASE_VERTEX_SHADER_UNIFORMS +

    "out vec2 " +
      "v0;" +
    "out vec4 " +
      "v1;" +
    "flat out vec4 " +
      "v2," +
      "v3," +
      "v4," +
      "v5;" +

    "void main(void){" +
      "vec3 " + 
        "pos=vec3(aPs*2.-1.,1);" +
      
      "v1.xy=pos.xy;" +

      "mat3 mt=mat3(aMt[0].xy,0,aMt[0].zw,0,aMt[1].xy,1);" +
      "v2.x=aMt[1].z;" + 
      "v2.y=v2.x*aMt[3].x;" +

      "v3=vec4(aExt[1],PI-aMt[1].w);" +
      "v4=vec4(aMt[3].z,aExt[0]);" +
      "v5=aMt[2];" +

      "if(v4.x<1.){" +
        "gl_Position=vec4(mt*pos,1);" +
        "v0=(gl_Position.xy+P.xy)/P.zw;" +
        "v1.zw=(aMt[1].xy+P.xy)/P.zw;" +
        "v2.zw=vec2(sin(aMt[3].y),cos(aMt[3].y));" +
      "}else{" +
        "mt[2].xy=Z.zy;" +
        "gl_Position=vec4(pos,1);" +
        "v0=(gl_Position.xy+P.xy)/P.zw;" +
        "v1.zw=v0+((mt*vec3(1)).xy+P.xy)/P.zw;" +
      "}" +

      "gl_Position.y*=uFY;" +
    "}";
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    const loop = (core) => "for(i=m;i<l;i+=st){" +
            "p=ivec2((v1.zw+i*opdm)*uTS);" +
            "tc=texelFetch(uTx,p,0)*HEIGHT;" +
            core +
          "}";

    return Utils.GLSL.DEFINE.HEIGHT +
    Utils.GLSL.DEFINE.Z +

    "in vec2 " +
      "v0;" +
    "in vec4 " +
      "v1;" +
    "flat in vec4 " +
      "v2," +
      "v3," +
      "v4," +
      "v5;" +

    "uniform vec2 " +
      "uTS;" +
    "uniform vec3 " +
      "uUT;" +
    "uniform sampler2D " +
      "uNTx," +
      "uSTx," +
      "uRTx," +
      "uTx;" +

    "out vec4 " +
      "oCl;" +

    Utils.GLSL.RANDOM +

    "void main(void){" +
      "float " +
        "vol=v5.a;" +

      "if(vol<=0.)discard;" +

      "vec2 " +
        "tUv=v0*uTS," +
        "tCnt=v1.zw*uTS;" +

      "vec4 " +
        "tc=texelFetch(uTx,ivec2(tUv),0);" +

      "int " + 
        "flg=int(v4.y);" +

      "float " +
        "ph=tc.g*HEIGHT," +
        "spc=0.;" +

      "vec3 " +
        "sf=vec3(tUv,ph)," +
        "lp=vec3(tCnt,v4.z)," +
        "sftla=lp-sf;" +

      "if(v4.x<1.){" +
        "float " + 
          "d=length(sftla)/v2.x," +
          "od=1.-d," +
          "dv=(flg&16)>0?pow(od,v3.z):1.;" +

        "vol*=dv;" +

        "float " +
          "slh=(v4.z-ph)/HEIGHT;" +

        "vec2 " +
          "sl=vec2(" +
            "slh*v2.w-v1.x*v2.z," +
            "slh*v2.z+v1.x*v2.w" +
          ");" +

        "if(" +
          "vol<=0.||" + 
          "od<=0.||" +
          "atan(" +
            "sl.x," +
            "length(vec2(sl.y,v1.y))" +
          ")+" + Utils.ALPHA + "-v3.w<0.)discard;" +
      "}" +

      "float " +
        "fltDst=distance(tCnt,tUv)," +
        "shdw=1.;" +

      "if((flg&2)>0){" +
        "vec3 " +
          "nm=uUT.z>0." + 
            "?normalize((texture(uNTx,v0).rgb*2.-1.)*Z.yzy)" +
            ":Z.xxy," +
          "sftl=normalize(sftla)," +
          "sftv=normalize(vec3(" +
            "(flg&8)>0?uTS*.5:tUv," +
            "HEIGHT" +
          ")-sf)," +
          "hlf=normalize(sftl+sftv);" +

        "vol*=dot(nm,sftl);" +
        
        "if(vol<=0.)discard;" +
        
        "float " + 
          "rgh=1.," +
          "shn=uUT.y>0.?texture(uRTx,v0).r:tc.b;" +

        "spc=pow(max(dot(nm,hlf),0.),32.)*shn*v3.y;" +
      "}" +

      "if((flg&1)>0){" +
        "ivec2 " +
          "p;" +

        "vec2 " +
          "opd=(tUv-tCnt)/fltDst," +
          "opdm=opd/uTS;" +

        "float " +
          "i," +
          "pc," +
          "st=max(1.,ceil(fltDst/v3.x))," + // loop step length
          "l=min(fltDst-st,4096.)," +
          "m=max(st,l-v2.y);" +
        
        "if((flg&4)>0)" + 
          loop("if(tc.g>=v4.z)discard;") +
        "else{" +
          "float " +
            "opdL=length(opd)," + // horizontal step
            "hst=(ph-v4.z)/fltDst," + // vertical step
            "rnd=v4.w*rand(v0);" +

          loop(
            "st+=rnd;" +
            "pc=v4.z+i*hst;" +
            "shdw*=mix(1.,(fltDst-i*opdL)/v2.y,step(tc.r,pc)*step(pc,tc.g));"
          ) +
        "}" +
      "}" +

      "vec3 " +
        "stCl=uUT.x>0.?texture(uSTx,v0).rgb:Z.yyy;" +
        
      "oCl=vec4((stCl+spc)*v5.rgb*vol*shdw,1);" +
    "}";
  }
}
