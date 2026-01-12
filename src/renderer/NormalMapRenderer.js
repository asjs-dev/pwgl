import { BaseRenderer } from "./BaseRenderer";
import { BlendMode } from "../data/BlendMode";
import { Utils } from "../utils/Utils";
import { BASE_VERTEX_SHADER, BASE_VERTEX_SHADER_POSITION } from "../../extensions/renderer/BaseVertexShader";

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

    super(config);

    this.heightMap = config.heightMap;
  }

  /**
   * @ignore
   */
  $render() {
    this.context.setBlendMode(BlendMode.NORMAL);
    
    this.$useTextureAt(this.heightMap, this.$locations.uTx, 0);

    this.$uploadBuffers();

    this.$drawInstanced(1);
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    return "" +
    "in vec2 " +
      "aPs;" +

    "uniform float " +
      "uFY;" +
    "uniform sampler2D " +
      "uTx;" +

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
    return "" +
    Utils.GLSL.DEFINE.Z +
    Utils.GLSL.DEFINE.HEIGHT +
    
    "in vec2 " +
      "v0;" +

    "uniform sampler2D " +
      "uTx;" +

    "out vec4 " +
      "oCl;" +

    "void main(void){" +
      "vec2 " +
        "ts=vec2(textureSize(uTx,0))," +
        "p=1./ts," +
        "p0=floor(v0.xy*ts)," +
        "p1=p0+Z.yx," +
        "p2=p0+Z.yy;" +

      "vec3 " +
        "A=vec3(p0,texture(uTx,p0*p).g)," +
        "B=vec3(p1,texture(uTx,p1*p).g)," +
        "C=vec3(p2,texture(uTx,p2*p).g)," +
        "nm=normalize(cross(B-A,C-A))*HEIGHT*Z.yzy;" +

      "oCl=vec4(nm*.5+.5,1);" +
    "}";
  }
}
