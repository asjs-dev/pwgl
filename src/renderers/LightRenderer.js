import { arraySet } from "../../common/utils/arraySet";
import { Buffer } from "../core/Buffer";
import { Utils } from "../core/Utils";
import { Light } from "../display/Light";
import { BlendMode } from "../rendering/BlendMode";
import { BatchRenderer } from "./BatchRenderer";

/**
 * @typedef {Object} LightRendererConfig
 * @extends {RendererConfig}
 * @property {number} maxRenderCount
 * @property {TextureInfo} sourceTexture
 * @property {TextureInfo} normalMap
 * @property {TextureInfo} heightMap
 * @property {TextureInfo} roughnessMap
 * @property {number} offsetX // Offset x
 * @property {number} offsetY // Offset y
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
   * @param {LightRendererConfig} config
   */
  constructor(config = {}) {
    config = Utils.initRendererConfig(config);

    // prettier-ignore
    Utils.setLocations(config, [
      "aC",
      "uC",
      "uF",
      "uG",
      "uM",
      "uN",
      "uO"
    ]);

    super(config);

    this.clearBeforeRender = true;
    this.clearColor.set(0, 0, 0, 1);

    this.$sizable = this;

    this.sourceTexture = config.sourceTexture;
    this.normalMap = config.normalMap;
    this.heightMap = config.heightMap;
    this.roughnessMap = config.roughnessMap;
    this.offsetX = config.offsetX ?? 0;
    this.offsetY = config.offsetY ?? 0;

    // prettier-ignore
    this.$extensionBuffer = new Buffer(
      "aC",
      this.$MAX_RENDER_COUNT,
      2,
      3
    );
  }

  get sourceTexture() {
    return this.$sourceTexture;
  }

  set sourceTexture(v) {
    this.$sourceTexture = v;
    if (v) {
      this.$sizable = v;
    }
  }

  get normalMap() {
    return this.$normalMap;
  }

  set normalMap(v) {
    this.$normalMap = v;
    if (v) {
      this.$sizable = v;
    }
  }

  get heightMap() {
    return this.$heightMap;
  }

  set heightMap(v) {
    this.$heightMap = v;
    if (v) {
      this.$sizable = v;
    }
  }

  get roughnessMap() {
    return this.$roughnessMap;
  }

  set roughnessMap(v) {
    this.$roughnessMap = v;
    if (v) {
      this.$sizable = v;
    }
  }

  /**
   * Sets the offset for the light renderer.
   * @param {number} x - The x offset.
   * @param {number} y - The y offset.
   */
  setOffset(x, y) {
    this.offsetX = x;
    this.offsetY = y;
  }

  /**
   * Register a Light instance for rendering
   * @param {Light} light
   */
  addLightForRender(light) {
    const { $batchItems } = this;
    const { parent } = light;

    if ($batchItems < this.$MAX_RENDER_COUNT) {
      const matrixBufferId = $batchItems * 16;
      const extensionBufferId = $batchItems * 6;
      const matrixBufferData = this.$matrixBuffer.data;
      const extensionBufferData = this.$extensionBuffer.data;

      arraySet(matrixBufferData, light.matrixCache, matrixBufferId);
      matrixBufferData[matrixBufferId + 6] = light.transform.width;
      matrixBufferData[matrixBufferId + 7] = light.spotAngle;
      arraySet(matrixBufferData, light.colorCache, matrixBufferId + 8);
      matrixBufferData[matrixBufferId + 11] *= light.alpha * parent.getPremultipliedAlpha();
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

      ++this.$batchItems;
    }
  }

  /**
   * @ignore
   */
  $render() {
    const { $gl, $locations, $sourceTexture, $normalMap, $roughnessMap, $heightMap } = this;
    const sourceTextureBoolean = !!$sourceTexture;
    const normalMapBoolean = !!$normalMap;
    const roughnessMapBoolean = !!$roughnessMap;
    const heightMapBoolean = !!$heightMap;

    this.context.setBlendMode(BlendMode.ADD);

    sourceTextureBoolean && this.$useTexture($sourceTexture, $locations.uC);

    normalMapBoolean && this.$useTexture($normalMap, $locations.uM);

    roughnessMapBoolean && this.$useTexture($roughnessMap, $locations.uN);

    heightMapBoolean && this.$useTexture($heightMap, $locations.uB);

    $gl.uniform3f($locations.uO, sourceTextureBoolean, roughnessMapBoolean, normalMapBoolean);
    $gl.uniform2f($locations.uF, this.$sizable.width, this.$sizable.height);
    $gl.uniform2f($locations.uG, this.offsetX, this.offsetY);

    this.$uploadBuffers();

    this.$drawInstanced(this.$batchItems);

    this.$batchItems = 0;
  }

  /**
   * @ignore
   */
  $uploadBuffers() {
    this.$extensionBuffer.uploadElements(this.$gl, this.$batchItems);
    super.$uploadBuffers();
  }

  /**
   * @ignore
   */
  $createBuffers() {
    super.$createBuffers();
    this.$extensionBuffer.create(this.$gl, this.$locations);
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    return `${Utils.GLSL.DEFINE.Z}` +
    `${Utils.GLSL.DEFINE.PI}` +
    `#define P vec4(1,-1,2,-2)\n` +

    `${Utils.GLSL.BASE_VERTEX_SHADER_ATTRIBUTES}` +
    `in mat4 ` +
      `aB;` +
    `in mat2x3 ` +
      `aC;` +

    `${Utils.GLSL.BASE_VERTEX_SHADER_UNIFORMS}` +

    `out vec2 ` +
      `v0;` +
    `out vec4 ` +
      `v1;` +
    `flat out vec4 ` +
      `v2,` +
      `v3,` +
      `v4,` +
      `v5;` +

    `void main(){` +
      `vec3 ` + 
        `pos=vec3(aA*2.-1.,1);` +
      
      `v1.xy=pos.xy;` +

      `mat3 mt=mat3(aB[0].xy,0,aB[0].zw,0,aB[1].xy,1);` +
      `v2.x=aB[1].z;` + 
      `v2.y=v2.x*aB[3].x;` +

      `v3=vec4(aC[1],PI-aB[1].w);` +
      `v4=vec4(aB[3].z,aC[0]);` +
      `v5=aB[2];` +

      `if(v4.x<1.){` +
        `gl_Position=vec4(mt*pos,1);` +
        `v0=(gl_Position.xy+P.xy)/P.zw;` +
        `v1.zw=(aB[1].xy+P.xy)/P.zw;` +
        `v2.zw=vec2(sin(aB[3].y),cos(aB[3].y));` +
      `}else{` +
        `mt[2].xy=Z.zy;` +
        `gl_Position=vec4(pos,1);` +
        `v0=(gl_Position.xy+P.xy)/P.zw;` +
        `v1.zw=v0+((mt*vec3(1)).xy+P.xy)/P.zw;` +
      `}` +

      `gl_Position.y*=uA;` +
    `}`;
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    // Marches from the receiver towards the light, jittered inside each step and growing it per sample.
    const loop = (core, jitter = "0.", growth = "0.") => `for(;sd<se;sd+=ss){` +
            `i=max(fltDst-sd-${jitter}*ss,m);` +
            `p=ivec2((v1.zw+i*opdm)*uF);` +
            `tc=texelFetch(uB,p,0)*HEIGHT;` +
            `${core}` +
            `ss+=${growth};` +
          `}`;

    return `${Utils.GLSL.DEFINE.HEIGHT}` +
    `${Utils.GLSL.DEFINE.Z}` +

    `in vec2 ` +
      `v0;` +
    `in vec4 ` +
      `v1;` +
    `flat in vec4 ` +
      `v2,` +
      `v3,` +
      `v4,` +
      `v5;` +

    `uniform vec2 ` +
      `uF;` +
    `uniform vec2 ` +
      `uG;` +
    `uniform vec3 ` +
      `uO;` +
    `uniform sampler2D ` +
      `uB,` +
      `uC,` +
      `uM,` +
      `uN;` +

    `out vec4 ` +
      `oCl;` +

    `${Utils.GLSL.RANDOM}` +

    `void main(){` +
      `float ` +
        `vol=v5.a;` +

      `if(vol<=0.)discard;` +

      `vec2 ` +
        `tUv=v0*uF,` +
        `tCnt=v1.zw*uF;` +

      `vec4 ` +
        `tc=texelFetch(uB,ivec2(tUv),0);` +

      `int ` + 
        `flg=int(v4.y);` +

      `float ` +
        `ph=tc.g*HEIGHT,` +
        `spc=0.;` +

      `vec3 ` +
        `sf=vec3(tUv,ph),` +
        `lp=vec3(tCnt,v4.z),` +
        `sftla=lp-sf;` +

      `if(v4.x<1.){` +
        `float ` + 
          `d=length(sftla)/v2.x,` +
          `od=1.-d,` +
          `dv=(flg&16)>0?pow(od,v3.z):1.;` +

        `vol*=dv;` +

        `float ` +
          `slh=(v4.z-ph)/HEIGHT;` +

        `vec2 ` +
          `sl=vec2(` +
            `slh*v2.w-v1.x*v2.z,` +
            `slh*v2.z+v1.x*v2.w` +
          `);` +

        `if(` +
          `vol<=0.||` + 
          `od<=0.||` +
          `atan(` +
            `sl.x,` +
            `length(vec2(sl.y,v1.y))` +
          `)+${Utils.ALPHA}-v3.w<0.)discard;` +
      `}` +

      `float ` +
        `fltDst=distance(tCnt,tUv),` +
        `shdw=1.;` +

      `if((flg&2)>0){` +
        `vec3 ` +
          `nm=uO.z>0.` + 
            `?normalize((texture(uM,v0).rgb*2.-1.)*Z.yzy)` +
            `:Z.xxy,` +
          `sftl=normalize(sftla),` +
          `sftv=normalize(vec3(` +
            `(flg&8)>0?uF*.5:tUv,` +
            `HEIGHT` +
          `)-sf);` +

        `vol*=dot(nm,sftl);` +

        `if(vol<=0.)discard;` +
        
        `float ` + 
          `shn=uO.y>0.?texture(uN,v0).r:tc.b,` +
          `ndh=max(dot(nm,normalize(sftl+sftv)),0.);` +

        `spc=pow(ndh,32.)*shn*v3.y;` +
      `}` +

      `if((flg&1)>0){` +
        `ivec2 ` +
          `p;` +

        `vec2 ` +
          `opd=(tUv-tCnt)/fltDst,` +
          `opdm=opd/uF;` +

        `float ` +
          `i,` +
          `pc,` +
          `st=max(1.,ceil(fltDst/v3.x)),` + // loop step length
          `l=min(fltDst-st,4096.),` +
          `m=max(st,l-v2.y),` +
          `ss=st,` + // current step length
          `sd=fltDst-l,` + // distance from the receiver
          `se=fltDst-m;` +
        
        `if((flg&4)>0)` + 
          `${loop(`if(tc.g>=v4.z)discard;`)}` +
        `else{` +
          `float ` +
            `opdL=length(opd),` + // horizontal step
            `hst=(ph-v4.z)/fltDst,` + // vertical step
            `rnd=rand(tUv+floor(uG));` + // world-anchored jitter
          `${loop(
            `pc=v4.z+i*hst;` +
            `shdw*=mix(1.,(fltDst-i*opdL)/v2.y,step(tc.r,pc)*step(pc,tc.g));`,
            "rnd",
            "v4.w*.5"
          )}` +
        `}` +
      `}` +

      `vec3 ` +
        `stCl=uO.x>0.?texture(uC,v0).rgb:Z.yyy;` +

      `oCl=vec4((stCl+spc)*v5.rgb*vol*clamp(shdw,0.,1.),1);` +
    `}`;
  }
}
