import { BaseRenderer } from "./BaseRenderer";
import { BlendMode } from "../data/BlendMode";
import { Utils } from "../utils/Utils";
import {
  BASE_VERTEX_SHADER,
  BASE_VERTEX_SHADER_INITIALIZATION,
  BASE_VERTEX_SHADER_POSITION,
} from "../../extensions/renderer/BaseVertexShader";

/**
 * @typedef {Object} AmbientOcclusionMapRendererConfig
 * @extends {RendererConfig}
 * @property {TextureInfo} sourceTexture
 * @property {TextureInfo} heightMap
 * @property {number} radius
 * @property {number} samples
 * @property {number} multiplier
 * @property {number} depthMultiplier
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
      "uSTx",
      "uP",
      "uUST",
      "uOs",
    ]);

    super(config);

    this.sourceTexture = config.sourceTexture;
    this.heightMap = config.heightMap;
    this.radius = config.radius ?? 4;
    this.samples = config.samples ?? 4;
    this.multiplier = config.multiplier ?? 1;
    this.depthMultiplier = config.depthMultiplier ?? 1;
    this._offset = config.offset ?? new Float32Array(2);
  }

  /**
   * Gets the x offset for the ambient occlusion map.
   * @returns {number}
   */
  get offsetX() {
    return this._offset[0];
  }
  /**
   * Sets the x offset for the ambient occlusion map.
   * @param {number} value
   */
  set offsetX(value) {
    this._offset[0] = value;
  }

  /**
   * Gets the y offset for the ambient occlusion map.
   * @returns {number}
   */
  get offsetY() {
    return this._offset[1];
  }
  /**
   * Sets the y offset for the ambient occlusion map.
   * @param {number} value
   */
  set offsetY(value) {
    this._offset[1] = value;
  }

  /**
   * Sets the offset for the ambient occlusion map.
   * @param {number} x - The x offset.
   * @param {number} y - The y offset.
   */
  setOffset(x, y) {
    this._offset[0] = x;
    this._offset[1] = y;
  }

  /**
   * @ignore
   */
  $render() {
    const gl = this.$gl,
      locations = this.$locations,
      sourceTextureBoolean = !!this.sourceTexture;

    this.context.setBlendMode(BlendMode.NORMAL);

    this.$useTextureAt(this.heightMap, locations.uTx, 0);

    sourceTextureBoolean &&
      this.$useTextureAt(this.sourceTexture, locations.uSTx, 1);

    gl.uniform1f(locations.uUST, sourceTextureBoolean);
    gl.uniform4f(
      locations.uP,
      this.radius,
      this.samples,
      this.multiplier,
      this.depthMultiplier
    );
    gl.uniform2fv(locations.uOs, this._offset);

    this.$uploadBuffers();

    this.$drawInstanced(1);
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    return Utils.GLSL.DEFINE.RADIANS_360 +
    
    BASE_VERTEX_SHADER_INITIALIZATION +

    "uniform vec4 " +
      "uP;" +

    "out vec4 " +
      "v0;" +

    "void main(void){" +
      BASE_VERTEX_SHADER +
      
      "float " + 
        "r=RADIANS_360/uP.y;" + 
      "v0=vec4(" + BASE_VERTEX_SHADER_POSITION + ",vec2(cos(r),sin(r)));" +
    "}";
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    return Utils.GLSL.DEFINE.Z +

    "in vec4 " +
      "v0;" +

    "uniform sampler2D " +
      "uSTx," +
      "uTx;" +
    "uniform float " +
      "uUST;" +
    "uniform vec2 " +
      "uOs;" +
    "uniform vec4 " +
      "uP;" +

    "out vec4 " +
      "oCl;" +

    Utils.GLSL.RANDOM +

    "void main(void){" +
      "vec2 " +
        "vxy=v0.xy," +
        "ts=1./vec2(textureSize(uTx,0));" +

      "float " +
        "tx=texture(uTx,vxy).g," +
        "v=0.;" +
        
      "if(uP.y>0.&&uP.x>0.){" +
        "vec2 " +
          "rg;" +

        "float " +
          "rnd=rand(vxy+uOs*ts)*.9+.1," + 
          "l=min(uP.y,1024.);" +
        
        "vec2 " +
          "n=(uP.x*ts)*rnd," +
          "dr=Z.yx;" +

        "float " +
          "ln=length(n);" +

        "mat2 " + 
          "rot=mat2(v0.z,-v0.w,v0.w,v0.z);" +

        "for(float i=0.;i<l;i++){" +
          "rg=max(texture(uTx,vxy+dr*n).rg-tx,Z.xx);" +
          "v+=(rg.y*(1.-rg.y))/(1.+ln*uP.x);" +
          "dr*=rot;" +
        "}" +
        "v/=l;" +
      "}" +
      
      "vec3 " +
        "stCl=uUST>0.?texture(uSTx,vxy).rgb:Z.yyy;" +

      "oCl=vec4(stCl*(mix(1.,tx,uP.w)-v*uP.z),1);" +
    "}";
  }
}
