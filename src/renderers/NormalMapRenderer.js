import { BaseRenderer } from "./BaseRenderer";
import { Utils } from "../core/Utils";
import { BlendMode } from "../rendering/BlendMode";
import {
  BASE_VERTEX_SHADER,
  BASE_VERTEX_SHADER_INITIALIZATION,
  BASE_VERTEX_SHADER_POSITION,
} from "../utils/shaderUtils";

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
 * @property {TextureInfo} heightMap
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
    const locations = this.$locations;

    this.context.setBlendMode(BlendMode.NORMAL);

    this.$useTextureAt(this.heightMap, locations.uB, 0);

    this.$gl.uniform2f(locations.uF, this.width, this.height);

    this.$uploadBuffers();

    this.$drawInstanced(1);
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    return BASE_VERTEX_SHADER_INITIALIZATION +

    "out vec2 " +
      "v0;" +

    "void main(){" +
      BASE_VERTEX_SHADER +
      
      "v0=" + BASE_VERTEX_SHADER_POSITION + ";" +
    "}";
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    return Utils.GLSL.DEFINE.Z +
    Utils.GLSL.DEFINE.HEIGHT +
    
    "in vec2 " +
      "v0;" +

    "uniform vec2 " +
      "uF;" +
    "uniform sampler2D " +
      "uB;" +

    "out vec4 " +
      "oCl;" +

    "void main(){" +
      "vec2 " +
        "ts=floor(uF)," +
        "p=1./ts," +
        "p0=floor(v0.xy*ts);" +

      "float " + 
        "h0=texture(uB,p0*p).g," +
        "h1=texture(uB,(p0+Z.yx)*p).g," +
        "h2=texture(uB,(p0+Z.xy)*p).g;" +

      "vec3 " + 
        "nm=normalize(" + 
          "cross(" + 
            "vec3(1,0,h1-h0)," + 
            "vec3(0,1,h2-h0)" + 
          "))*HEIGHT*Z.yzy;" +

      "oCl=vec4(nm*.5+.5,1);" +
    "}";
  }
}
