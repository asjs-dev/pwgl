import { BaseRenderer } from "./BaseRenderer";
import { BlendMode } from "../data/BlendMode";
import { Utils } from "../utils/Utils";
import {
  BASE_VERTEX_SHADER,
  BASE_VERTEX_SHADER_INITIALIZATION,
  BASE_VERTEX_SHADER_POSITION,
} from "../../extensions/renderer/BaseVertexShader";

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
      "uTS"
    ]);

    super(config);

    this.heightMap = config.heightMap;
  }

  /**
   * @ignore
   */
  $render() {
    const locations = this.$locations,
      heightMap = this.heightMap;

    this.context.setBlendMode(BlendMode.NORMAL);

    this.$useTextureAt(heightMap, locations.uTx, 0);

    this.$gl.uniform2f(locations.uTS, heightMap.width, heightMap.height);

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

    "void main(void){" +
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
      "uTS;" +
    "uniform sampler2D " +
      "uTx;" +

    "out vec4 " +
      "oCl;" +

    "void main(void){" +
      "vec2 " +
        "ts=floor(uTS)," +
        "p=1./ts," +
        "p0=floor(v0.xy*ts);" +

      "float " + 
        "h0=texture(uTx,p0*p).g," +
        "h1=texture(uTx,(p0+Z.yx)*p).g," +
        "h2=texture(uTx,(p0+Z.xy)*p).g;" +

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
