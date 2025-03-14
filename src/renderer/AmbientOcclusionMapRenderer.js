import { BaseRenderer } from "./BaseRenderer";
import { BlendMode } from "../data/BlendMode";
import { Utils } from "../utils/Utils";

/**
 * @typedef {Object} AmbientOcclusionMapRendererConfig
 * @extends {RendererConfig}
 * @property {TextureInfo} sourceTexture
 * @property {TextureInfo} heightMap
 * @property {number} radius
 * @property {number} samples
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
   * @param {AmbientOcclusionMapRendererConfig} options
   */
  constructor(options = {}) {
    options.config = Utils.initRendererConfig(options.config);

    // prettier-ignore
    options.config.locations = [
      "uSTTex",
      "uR",
      "uS",
      "uDM",
      "uUSTT",
    ];

    super(options);

    this.sourceTexture = options.sourceTexture;
    this.heightMap = options.heightMap;
    this.radius = options.radius ?? 4;
    this.samples = options.samples ?? 4;
    this.depthMultiplier = options.depthMultiplier ?? 1;
  }

  /**
   * @ignore
   */
  $render() {
    const gl = this.$gl,
      locations = this.$locations;

    this.context.setBlendMode(BlendMode.NORMAL);

    this.$useTextureAt(this.heightMap, locations.uTex, 0);

    if (this.sourceTexture) {
      this.$useTextureAt(this.sourceTexture, locations.uSTTex, 1);
      gl.uniform1f(locations.uUSTT, 1);
    } else gl.uniform1f(locations.uUSTT, 0);

    gl.uniform1f(locations.uR, this.radius);
    gl.uniform1f(locations.uS, this.samples);
    gl.uniform1f(locations.uDM, this.depthMultiplier);

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
      "aPos;" +

    "uniform float " +
      "uR," +
      "uFlpY;" +
    "uniform sampler2D " +
      "uTex;" +

    "out vec2 " +
      "vTUv," + 
      "vTs;" +

    "void main(void){" +
      "gl_Position=vec4(aPos*2.-1.,1,1);" +
      "vTUv=vec2(aPos.x,1.-aPos.y);" +
      "gl_Position.y*=uFlpY;" +
      "vTs=uR/vec2(textureSize(uTex,0));" + 
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
    Utils.GLSL.DEFINE.RADIANS_360 +
    
    "in vec2 " +
      "vTUv," + 
      "vTs;" +

    "uniform sampler2D " +
      "uSTTex," +
      "uTex;" +
    "uniform float " +
      "uR," +
      "uS," +
      "uUSTT," +
      "uDM;" +

    "out vec4 " +
      "oCl;" +

    Utils.GLSL.RANDOM +

    "void main(void){" +
      "float " +
        "tx=texture(uTex,vTUv).g," +
        "v=0.;" +
        
      "if(uS>0.&&uR>0.){" +
        "vec2 " +
          "vh=vTUv*100.+100.;" +

        "float " +
          "rad=RADIANS_360*rand(vh-2.)," + 
          "l=max(1.,ceil(uS*rand(vh-1.)))," +
          "t=RADIANS_360/l;" +
        
        "vec2 " +
          "dr=vec2(cos(rad),sin(rad))," +
          "r=vec2(cos(t),sin(t));" +

        "for(int i=0;i<int(l);i++){" +
          "v+=texture(uTex,vTUv+dr*vTs*rand(vh+float(i))).g-tx;" +
          "dr*=mat2(r.x,-r.y,r.y,r.x);" +
        "}" +
        "v/=l;" +
      "}" +
      
      "vec3 " +
        "stCl=uUSTT<1." + 
          "?Z.yyy" + 
          ":texture(uSTTex,vTUv).rgb;" +

      "oCl=vec4(stCl*(1.-(1.-tx)*uDM-v),1);" +
    "}";
  }
}
