import { BatchRenderer } from "./BatchRenderer";
import { BlendMode } from "../data/BlendMode";
import { Light } from "../display/Light";
import { Utils } from "../utils/Utils";
import { Buffer } from "../utils/Buffer";

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
   * @param {LightRendererConfig} options
   */
  constructor(options = {}) {
    options.config = Utils.initRendererConfig(options.config);

    // prettier-ignore
    options.config.locations = [
      "aExt",
      "uNMTex",
      "uSTTex",
      "uRGTex",
      "uTS",
      "uUSTT",
      "uUNMT",
      "uURGT"
    ];

    super(options);

    this.clearBeforeRender = true;
    this.clearColor.set(0, 0, 0, 1);

    this.sourceTexture = options.sourceTexture;
    this.normalMap = options.normalMap;
    this.heightMap = options.heightMap;
    this.roughnessMap = options.roughnessMap;

    this._extensionBuffer = new Buffer("aExt", this.$MAX_RENDER_COUNT, 2, 4);
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
        extensionBufferId = batchItems * 8,
        matrixBufferData = this.$matrixBuffer.data,
        extensionBufferData = this._extensionBuffer.data;

      arraySet(matrixBufferData, light.matrixCache, matrixBufferId);
      matrixBufferData[matrixBufferId + 6] = light.transform.width;
      matrixBufferData[matrixBufferId + 7] = light.spotAngle;
      arraySet(matrixBufferData, light.colorCache, matrixBufferId + 8);
      matrixBufferData[matrixBufferId + 12] = light.shadowLength;
      matrixBufferData[matrixBufferId + 13] =
        light.alpha * parent.getPremultipliedAlpha();
      matrixBufferData[matrixBufferId + 14] = light.angle;

      extensionBufferData[extensionBufferId] = light.type;
      extensionBufferData[extensionBufferId + 1] = light.flags;
      extensionBufferData[extensionBufferId + 2] = light.transform.z;
      extensionBufferData[extensionBufferId + 3] = light.precision;
      extensionBufferData[extensionBufferId + 4] = light.maxShadowStep;
      extensionBufferData[extensionBufferId + 5] = light.specularStrength;
      extensionBufferData[extensionBufferId + 6] = light.attenuation;
      // extensionBufferData[extensionBufferId + 7] // empty slot for future use

      ++this._batchItems;
    }
  }

  /**
   * @ignore
   */
  $render() {
    const gl = this.$gl,
      locations = this.$locations;

    this.context.setBlendMode(BlendMode.ADD);

    let sizable = this;

    if (this.sourceTexture) {
      this.$useTexture(this.sourceTexture, locations.uSTTex);
      sizable = this.sourceTexture;
      gl.uniform1f(locations.uUSTT, 1);
    } else gl.uniform1f(locations.uUSTT, 0);

    if (this.normalMap) {
      this.$useTexture(this.normalMap, locations.uNMTex);
      sizable = this.normalMap;
      gl.uniform1f(locations.uUNMT, 1);
    } else gl.uniform1f(locations.uUNMT, 0);

    if (this.roughnessMap) {
      this.$useTexture(this.roughnessMap, locations.uRGTex);
      sizable = this.roughnessMap;
      gl.uniform1f(locations.uURGT, 1);
    } else gl.uniform1f(locations.uURGT, 0);

    if (this.heightMap) {
      this.$useTexture(this.heightMap, locations.uTex);
      sizable = this.heightMap;
    }

    gl.uniform2f(locations.uTS, sizable.width, sizable.height);

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
    return "" +
    Utils.GLSL.DEFINE.Z +
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
    "flat out int[5] " +
      "flg;" +

    "void main(void){" +
      "vec3 pos=vec3(aPos*2.-1.,1);" +

      "vExt=aExt;" +
      "vCl=aMt[2];" +
      "vDt=aMt[3];" +

      "int " +
        "f=int(vExt[0].y);" +
      
      "flg=int[](f&1,f&2,f&4,f&8,f&16);" +

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
    const loop = (core) => "for(i=m;i<4096.;i+=st){" +
            "if(i>=l)break;" +
            "p=ivec2((vUv.zw+i*opdm)*uTS);" +
            "tc=texelFetch(uTex,p,0)*HEIGHT;" +
            core +
          "}";

    return "" +
    Utils.GLSL.DEFINE.HEIGHT +
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
    "flat in int[5] " +
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
        "vol=vDt.y*vCl.a," +
        "spc=0.;" +

      "if(vol<=0.)discard;" +

      "vec3 " +
        "sf=vec3(tUv,ph)," +
        "lp=vec3(tCnt,vHS)," +
        "sftla=lp-sf;" +

      "if(vExt[0].x<1.){" +
        "float " + 
          "d=length(sftla)/vD," +
          "od=1.-d," +
          "dv=flg[4]>0" +
            "?pow(od,vExt[1].z)" +
            ":ceil(od);" +

        "vol*=dv;" +

        "float " +
          "slh=(vHS-ph)/HEIGHT;" +

        "vec2 " +
          "sl=vec2(" +
            "slh*vSln.y-vUv.x*vSln.x," +
            "slh*vSln.x+vUv.x*vSln.y" +
          ");" +

        "if(" +
          "vol<=0.||" + 
          "od<=0.||" +
          "atan(" +
            "sl.x," +
            "length(vec2(sl.y,vUv.y))" +
          ")+" + Utils.ALPHA + "-vSpt<0.)discard;" +
      "}" +

      "float " +
        "fltDst=distance(tCnt,tUv)," +
        "shdw=1.;" +

      "if(flg[1]>0){" +
        "vec3 " +
          "nm=mix(" + 
            "Z.xxy," + 
            "normalize((texture(uNMTex,vTUv).rgb*2.-1.)*Z.yzy)," +
            "uUNMT" + 
          ")," +
          "sftl=normalize(sftla)," +
          "sftv=normalize(vec3(" +
            "flg[3]>0" +
              "?uTS*.5" +
              ":tUv," +
            "HEIGHT" +
          ")-sf)," +
          "hlf=normalize(sftl+sftv);" +

        "vol*=dot(nm,sftl);" +
        
        "if(vol<=0.)discard;" +
        
        "float " + 
          "rgh=1.," +
          "shn=mix(tc.b,texture(uRGTex,vTUv).r,uURGT);" +

        "spc=pow(max(dot(nm,hlf),0.),32.)*shn*vExt[1].y;" +
      "}" +

      "if(flg[0]>0){" +
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
        
        "if(flg[2]>0)" + 
          loop("if(tc.g>=vHS)discard;") +
        "else{" +
          "float " +
            "rnd=vExt[0].w*rand(vTUv);" +
            
          loop(
            "st+=rnd;" +
            "pc=vHS+i*hst;" +
            "if(tc.r<=pc&&tc.g>=pc)shdw*=(fltDst-i*opdL)/shl;"
          ) +
        "}" +
      "}" +
      
      "if(shdw<=0.)discard;" +

      "vec3 " +
        "stCl=mix(Z.yyy,texture(uSTTex,vTUv).rgb,vec3(uUSTT));" +
        
      "oCl=vec4((stCl+spc)*vCl.rgb*vol*shdw,1);" +
    "}";
  }
}
