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
      this.depthMultiplier,
    );
    gl.uniform2f(locations.uOs, this.offsetX, this.offsetY);

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
      "v0=vec4(" + BASE_VERTEX_SHADER_POSITION + ",cos(r),sin(r));" +
    "}";
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    return Utils.GLSL.DEFINE.Z +
    Utils.GLSL.DEFINE.RADIANS_360 +

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
          "rnd=rand(vxy+floor(uOs)*ts)," + 
          "ta=RADIANS_360*rnd," +
          "l=min(uP.y,32.);" +
        
        "vec2 " +
          "tn=uP.x*ts," +
          "n=tn*rnd," +
          "dr=vec2(cos(ta),sin(ta));" +

        "float " +
          "ln=1.-length(n)/length(tn);" +

        "mat2 " + 
          "r=mat2(v0.z,-v0.w,v0.w,v0.z);" +

        "for(float i=0.;i<l;i++){" +
          "rg=max(texture(uTx,vxy+dr*n).rg-tx,Z.xx);" +
          "v+=max(0.,(rg.y-rg.x)*(1.-rg.x)*ln);" +
          "dr*=r;" +
        "}" +
        "v/=l;" +
      "}" +
      
      "vec3 " +
        "stCl=uUST>0.?texture(uSTx,vxy).rgb:Z.yyy;" +

      "oCl=vec4(stCl*mix(1.,tx,uP.w)*(1.-v*uP.z),1);" +
    "}";
  }
}
