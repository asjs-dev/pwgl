import { Utils } from "../core/Utils";
import { BlendMode } from "../rendering/BlendMode";
import {
  BASE_VERTEX_SHADER,
  BASE_VERTEX_SHADER_INITIALIZATION,
  BASE_VERTEX_SHADER_POSITION,
} from "../utils/shaderUtils";
import { BaseRenderer } from "./BaseRenderer";

/**
 * @typedef {Object} AmbientOcclusionMapRendererConfig
 * @extends {RendererConfig}
 * @property {TextureInfo} sourceTexture // Optional source texture
 * @property {TextureInfo} heightMap // Height map texture
 * @property {number} radius // Sampling radius
 * @property {number} samples // Number of samples
 * @property {number} multiplier // Occlusion multiplier
 * @property {number} depthMultiplier // Depth multiplier
 * @property {number} offsetX // Offset x
 * @property {number} offsetY // Offset y
 */

/**
 * <pre>
 *  Ambient occlusion map renderer
 *    - Creates an ambient occlusion texture from a height map texture
 * </pre>
 * @extends {BaseRenderer}
 */
export class AmbientOcclusionMapRenderer extends BaseRenderer {
  /**
   * Creates an instance of AmbientOcclusionMapRenderer.
   * @constructor
   * @param {AmbientOcclusionMapRendererConfig} config
   */
  constructor(config = {}) {
    config = Utils.initRendererConfig(config);

    // prettier-ignore
    Utils.setLocations(config, [
      "uC",
      "uD",
      "uE",
      "uF",
      "uG",
    ]);

    super(config);

    this.sourceTexture = config.sourceTexture;
    this.heightMap = config.heightMap;
    this.radius = config.radius ?? 4;
    this.samples = config.samples ?? 4;
    this.multiplier = config.multiplier ?? 1;
    this.depthMultiplier = config.depthMultiplier ?? 1;
    this.offsetX = config.offsetX ?? 0;
    this.offsetY = config.offsetY ?? 0;
  }

  /**
   * Sets the offset for the ambient occlusion map.
   * @param {number} x - The x offset.
   * @param {number} y - The y offset.
   */
  setOffset(x, y) {
    this.offsetX = x;
    this.offsetY = y;
  }

  /**
   * @ignore
   */
  $render() {
    const { $gl, $locations } = this;
    const sourceTextureBoolean = !!this.sourceTexture;

    this.context.setBlendMode(BlendMode.NORMAL);

    this.$useTextureAt(this.heightMap, $locations.uB, 0);

    $gl.uniform2f($locations.uF, this.width, this.height);

    sourceTextureBoolean && this.$useTextureAt(this.sourceTexture, $locations.uC, 1);

    $gl.uniform1f($locations.uE, sourceTextureBoolean);

    $gl.uniform4f($locations.uD, this.radius, this.samples, this.multiplier, this.depthMultiplier);
    $gl.uniform2f($locations.uG, this.offsetX, this.offsetY);

    this.$uploadBuffers();

    this.$drawInstanced(1);
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    return `${Utils.GLSL.DEFINE.RADIANS_360}` +

    `${BASE_VERTEX_SHADER_INITIALIZATION}` +

    `uniform vec2 ` +
      `uF;` +
    `uniform vec4 ` +
      `uD;` +

    `out vec2 ` +
      `v0;` +
    `flat out vec3 ` +
      `v1,` +
      `v2;` +

    `void main(){` +
      `${BASE_VERTEX_SHADER}` +
      
      `float ` + 
        `r=RADIANS_360/uD.y;` + 
      
      `vec2 ` +
        `ts=1./floor(uF);` +

      `v0=${BASE_VERTEX_SHADER_POSITION};` +
      `v1=vec3(ts,length(ts)*uD.x);` +
      `v2=vec3(cos(r),sin(r),clamp(uD.y,1.,32.));` +
    `}`;
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    return `${Utils.GLSL.DEFINE.Z}` +
    `${Utils.GLSL.DEFINE.RADIANS_360}` +

    `in vec2 ` +
      `v0;` +
    `flat in vec3 ` +
      `v1,` +
      `v2;` +

    `uniform sampler2D ` +
      `uB,` +
      `uC;` +
    `uniform float ` +
      `uE;` +
    `uniform vec2 ` +
      `uG;` +
    `uniform vec4 ` +
      `uD;` +

    `out vec4 ` +
      `oCl;` +

    `${Utils.GLSL.RANDOM}` +

    `void main(){` +
      `float ` +
        `tx=texture(uB,v0).g,` +
        `v=0.;` +
        
      `if(uD.x*uD.y>0.){` +
        `int ` +
          `l=int(v2.z);` +

        `vec2 ` +
          `ts=v1.xy;` +

        `float ` +
          `rnd=rand(v0+floor(uG)*ts),` + 
          `ta=RADIANS_360*rnd,` +
          `nrnd=max(v1.z,rnd),` +
          `ln=1.-nrnd;` +
        
        `vec2 ` +
          `rg,` +
          `n=uD.x*ts*nrnd,` +
          `dr=vec2(cos(ta),sin(ta));` +

        `for(int i=0;i<l;i++){` +
          `rg=max(texture(uB,v0+n*dr).rg-tx,Z.xx);` +
          `v+=max(0.,(min(rg.y-rg.x,v1.z)*ln-rg.x));` +
          
          `dr=vec2(` + 
            `v2.x*dr.x-v2.y*dr.y,` +
            `v2.y*dr.x+v2.x*dr.y` +
          `);` +
        `}` +
        `v/=float(l);` +
      `}` +
      
      `vec3 ` +
        `stCl=uE>0.?texture(uC,v0).rgb:Z.yyy;` +

      `oCl=vec4(stCl*mix(1.,tx,uD.w)*(1.-v*uD.z),1);` +
    `}`;
  }
}
