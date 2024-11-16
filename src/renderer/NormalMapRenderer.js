import { Utils } from "../utils/Utils";
import { BlendMode } from "../data/BlendMode";
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
   * @param {NormalMapRendererConfig} options
   */
  constructor(options = {}) {
    options.config = Utils.initRendererConfig(options.config);

    super(options);

    this.clearBeforeRender = true;
    this.clearColor.set(0, 0, 0, 1);

    this.heightMap = options.heightMap;
  }

  /**
   * @ignore
   */
  $render() {
    this.context.setBlendMode(BlendMode.NORMAL);

    this.$useTextureAt(this.heightMap, this.$locations.uTex, 0);

    this.$uploadBuffers();

    this.$drawInstanced(1);
  }

  // prettier-ignore
  /**
   * @param {NormalMapRendererConfig} options
   * @returns {string}
   * @ignore
   */
  $createVertexShader(options) {
    return Utils.GLSL.VERSION + 
    "precision highp float;\n" +

    "in vec2 " +
      "aPos;" +

    "uniform float " +
      "uFlpY;" +

    "out vec2 " +
      "vTUv;" +

    "void main(void){" +
      "gl_Position=vec4(aPos*2.-1.,1,1);" +
      "vTUv=vec2(aPos.x,1.-aPos.y);" +
      "gl_Position.y*=uFlpY;" +
    "}";
  }

  // prettier-ignore
  /**
   * @param {NormalMapRendererConfig} options
   * @returns {string}
   * @ignore
   */
  $createFragmentShader(options) {
    return Utils.GLSL.VERSION + 
    "precision highp float;\n" +

    Utils.GLSL.DEFINE.HEIGHT +
    Utils.GLSL.DEFINE.ZO +
    
    "in vec2 " +
      "vTUv;" +

    "uniform sampler2D " +
      "uTex;" +

    "out vec4 " +
      "oCl;" +

    "void main(void){" +
      "vec2 " +
        "its=vec2(textureSize(uTex,0))," +
        "ts=1./its," +
        "p0=floor(vTUv*its)," +
        "p1=p0+ZO.yx," +
        "p2=p0+ZO;" +

      "vec3 " +
        "A=vec3(p0,texture(uTex,p0*ts).g)," +
        "B=vec3(p1,texture(uTex,p1*ts).g)," +
        "C=vec3(p2,texture(uTex,p2*ts).g)," +
        "nm=normalize(cross(B-A,C-A))*HEIGHT;" +

      "nm.y*=-1.;" +

      "oCl=vec4(nm*.5+.5,1);" +
    "}";
  }
}
