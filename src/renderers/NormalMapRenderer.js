import { Utils } from "../core/Utils";
import { BlendMode } from "../rendering/BlendMode";
import { BaseRenderer } from "./BaseRenderer";

/**
 * @typedef {Object} NormalMapRendererConfig
 * @extends {RendererConfig}
 * @property {TextureInfo} heightMap
 */

/**
 * <pre>
 *  Normal map renderer
 *    - Renders a normal map from height map texture
 * </pre>
 * @extends {BaseRenderer}
 */
export class NormalMapRenderer extends BaseRenderer {
  /**
   * Creates an instance of NormalMapRenderer.
   * @constructor
   * @param {NormalMapRendererConfig} config
   */
  constructor(config = {}) {
    config = Utils.initRendererConfig(config);

    // prettier-ignore
    Utils.setLocations(config, [
      "uF"
    ]);

    super(config);

    this.heightMap = config.heightMap;
  }

  /**
   * @ignore
   */
  $render() {
    const { $locations } = this;

    this.context.setBlendMode(BlendMode.NORMAL);

    this.$useTextureAt(this.heightMap, $locations.uB, 0);

    this.$gl.uniform2f($locations.uF, this.width, this.height);

    this.$uploadBuffers();

    this.$drawInstanced(1);
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    return `${Utils.GLSL.BASE_VERTEX_SHADER_INITIALIZATION}` +

    `out vec2 ` +
      `v0;` +

    `void main(){` +
      `${Utils.GLSL.BASE_VERTEX_SHADER}` +
      
      `v0=${Utils.GLSL.BASE_VERTEX_SHADER_POSITION};` +
    `}`;
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    return `${Utils.GLSL.DEFINE.Z}` +
    `${Utils.GLSL.DEFINE.HEIGHT}` +
    
    `in vec2 ` +
      `v0;` +

    `uniform vec2 ` +
      `uF;` +
    `uniform sampler2D ` +
      `uB;` +

    `out vec4 ` +
      `oCl;` +

    `void main(){` +
      `vec2 ` +
        `ts=floor(uF),` +
        `p0=floor(v0.xy*ts);` +

      `ivec2 ` +
        `mn=ivec2(Z.xx),` +
        `mx=ivec2(ts)-1;` +

      `float ` +
        `hL=texelFetch(uB,clamp(ivec2(p0+Z.zx),mn,mx),0).g,` +
        `hR=texelFetch(uB,clamp(ivec2(p0+Z.yx),mn,mx),0).g,` +
        `hU=texelFetch(uB,clamp(ivec2(p0+Z.xz),mn,mx),0).g,` +
        `hD=texelFetch(uB,clamp(ivec2(p0+Z.xy),mn,mx),0).g;` +

      `vec3 ` +
        `nm=normalize(` +
          `cross(` +
            `vec3(1,0,(hR-hL)*.5*HEIGHT),` +
            `vec3(0,1,(hD-hU)*.5*HEIGHT)` +
          `)` +
        `)*Z.yzy;` +

      `oCl=vec4(nm*.5+.5,1);` +
    `}`;
  }
}
