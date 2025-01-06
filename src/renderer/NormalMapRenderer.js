import { BaseRenderer } from "./BaseRenderer";
import { BlendMode } from "../data/BlendMode";
import { Utils } from "../utils/Utils";

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
   * @param {NormalMapRendererConfig} options
   */
  constructor(options = {}) {
    options.config = Utils.initRendererConfig(options.config);

    super(options);

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
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    return Utils.GLSL.VERSION + 
    "precision highp float;\n" +

    "in vec2 " +
      "aPos;" +

    "uniform float " +
      "uFlpY;" +
    "uniform sampler2D " +
      "uTex;" +

    "out vec2 " +
      "vIts," +
      "vTs," +
      "vTUv;" +

    "void main(void){" +
      "gl_Position=vec4(aPos*2.-1.,1,1);" +
      "vTUv=vec2(aPos.x,1.-aPos.y);" +
      "gl_Position.y*=uFlpY;" +
      "vIts=vec2(textureSize(uTex,0));" +
      "vTs=1./vIts;" +
    "}";
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    return Utils.GLSL.VERSION + 
    "precision highp float;\n" +

    Utils.GLSL.DEFINE.HEIGHT +
    Utils.GLSL.DEFINE.Z +
    
    "in vec2 " +
      "vIts," +
      "vTs," +
      "vTUv;" +

    "uniform sampler2D " +
      "uTex;" +

    "out vec4 " +
      "oCl;" +

    "void main(void){" +
      "vec2 " +
        "p0=floor(vTUv*vIts)," +
        "p1=p0+Z.yx," +
        "p2=p0+Z.yy;" +

      "vec3 " +
        "A=vec3(p0,texture(uTex,p0*vTs).g)," +
        "B=vec3(p1,texture(uTex,p1*vTs).g)," +
        "C=vec3(p2,texture(uTex,p2*vTs).g)," +
        "nm=normalize(cross(B-A,C-A))*HEIGHT*Z.yzy;" +

      "oCl=vec4(nm*.5+.5,1);" +
    "}";
  }
}
