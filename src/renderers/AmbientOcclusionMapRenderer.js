import { BaseRenderer } from "./BaseRenderer";
import { BlendMode } from "../rendering/BlendMode";
import { Utils } from "../core/Utils";
import {
  BASE_VERTEX_SHADER,
  BASE_VERTEX_SHADER_INITIALIZATION,
  BASE_VERTEX_SHADER_POSITION,
} from "../utils/baseVertexShaderUtils";

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
    const gl = this.$gl,
      locations = this.$locations,
      sourceTextureBoolean = !!this.sourceTexture;

    this.context.setBlendMode(BlendMode.NORMAL);

    this.$useTextureAt(this.heightMap, locations.uB, 0);

    gl.uniform2f(locations.uF, this.width, this.height);

    sourceTextureBoolean &&
      this.$useTextureAt(this.sourceTexture, locations.uC, 1);

    gl.uniform1f(locations.uE, sourceTextureBoolean);

    gl.uniform4f(
      locations.uD,
      this.radius,
      this.samples,
      this.multiplier,
      this.depthMultiplier,
    );
    gl.uniform2f(locations.uG, this.offsetX, this.offsetY);

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
      "uD;" +

    "out vec2 " +
      "v0;" +
    "flat out vec2 " +
      "v1;" +

    "void main(void){" +
      BASE_VERTEX_SHADER +
      
      "float " + 
        "r=RADIANS_360/uD.y;" + 

      "v0=" + BASE_VERTEX_SHADER_POSITION + ";" +
      "v1=vec2(cos(r),sin(r));" +
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

    "in vec2 " +
      "v0;" +
    "flat in vec2 " +
      "v1;" +

    "uniform sampler2D " +
      "uB," +
      "uC;" +
    "uniform float " +
      "uE;" +
    "uniform vec2 " +
      "uF," +
      "uG;" +
    "uniform vec4 " +
      "uD;" +

    "out vec4 " +
      "oCl;" +

    Utils.GLSL.RANDOM +

    "void main(void){" +
      "float " +
        "tx=texture(uB,v0).g," +
        "v=0.;" +
        
      "if(uD.y>0.&&uD.x>0.){" +
        "int " +
          "l=clamp(int(uD.y),1,32);" +
        
        "vec2 " +
          "ts=1./floor(uF);" +

        "float " +
          "rnd=rand(v0+floor(uG)*ts)," + 
          "ta=RADIANS_360*rnd," +
          "ln=1.-rnd;" +
        
        "vec2  " +
          "rg," +
          "n=uD.x*ts*rnd," +
          "dr=vec2(cos(ta),sin(ta));" +

        "for(int i=0;i<l;i++){" +
          "rg=max(texture(uB,v0+n*dr).rg-tx,Z.xx);" +
          "v+=max(0.,(rg.y-rg.x)*(1.-rg.x)*ln);" +
          
          "dr=vec2(" + 
            "v1.x*dr.x-v1.y*dr.y," +
            "v1.y*dr.x+v1.x*dr.y" +
          ");" +
        "}" +
        "v/=float(l);" +
      "}" +
      
      "vec3 " +
        "stCl=uE>0.?texture(uC,v0).rgb:Z.yyy;" +

      "oCl=vec4(stCl*mix(1.,tx,uD.w)*(1.-v*uD.z),1);" +
    "}";
  }
}
