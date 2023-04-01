import { Utils } from "../utils/Utils";
import { BlendMode } from "../data/BlendMode";
import { BaseRenderer } from "./BaseRenderer";

/**
 * @typedef {Object} NormalMapRendererConfig
 * @extends {RendererConfig}
 * @property {TextureInfo} heightMap
 */

/**
 * Normal map renderer
 *  - Renders a normal map from height map texture
 * @extends {BaseRenderer}
 */
export class NormalMapRenderer extends BaseRenderer {
  /**
   * Creates an instance of NormalMapRenderer.
   * @constructor
   * @param {NormalMapRendererConfig} options
   */
  constructor(options) {
    options = options || {};
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

    this.$gl.uniform1i(
      this._locations.uTex,
      this.context.useTexture(this.heightMap, this.$renderTime, true)
    );

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
    return Utils.createVersion(options.config.precision) +
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
    return Utils.createVersion(options.config.precision) +
    "#define H 256.\n" +
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
        "p1=p0+vec2(1,0)," +
        "p2=p0+vec2(0,1);" +

      "vec3 " +
        "A=vec3(p0,texture(uTex,p0*ts).g*H)," +
        "B=vec3(p1,texture(uTex,p1*ts).g*H)," +
        "C=vec3(p2,texture(uTex,p2*ts).g*H)," +
        "nm=normalize(cross(B-A,C-A));" +

      "nm.y*=-1.;" +

      "oCl=vec4(nm*.5+.5,1);" +
    "}";
  }
}
