import { Utils } from "../utils/Utils";
import { BlendMode } from "../data/BlendMode";
import { BaseRenderer } from "./BaseRenderer";

/**
 * @typedef {Object} AmbientOcclusionMapRendererConfig
 * @extends {RendererConfig}
 * @property {TextureInfo} sourceTexture
 * @property {TextureInfo} heightMap
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
    options.config.locations = options.config.locations.concat([
      "uSTTex",
      "uR",
      "uS",
      "uDM",
      "uUSTT",
    ]);

    super(options);

    this.clearBeforeRender = true;
    this.clearColor.set(0, 0, 0, 1);

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
    this.context.setBlendMode(BlendMode.NORMAL);

    this.$useTextureAt(this.heightMap, this.$locations.uTex, 0);

    if (this.sourceTexture) {
      this.$useTextureAt(this.sourceTexture, this.$locations.uSTTex, 1);
      this.$gl.uniform1f(this.$locations.uUSTT, 1);
    } else this.$gl.uniform1f(this.$locations.uUSTT, 0);

    this.$gl.uniform1f(this.$locations.uR, this.radius);
    this.$gl.uniform1f(this.$locations.uS, this.samples);
    this.$gl.uniform1f(this.$locations.uDM, this.depthMultiplier);

    this.$uploadBuffers();

    this.$drawInstanced(1);
  }

  // prettier-ignore
  /**
   * @param {AmbientOcclusionMapRendererConfig} options
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
   * @param {AmbientOcclusionMapRendererConfig} options
   * @returns {string}
   * @ignore
   */
  $createFragmentShader(options) {
    return Utils.GLSL.VERSION + 
    "precision highp float;\n" +
    
    Utils.GLSL.DEFINE.HEIGHT +
    Utils.GLSL.DEFINE.RADIAN_360 +
    Utils.GLSL.DEFINE.PI +
    Utils.GLSL.DEFINE.Z +
    
    "in vec2 " +
      "vTUv;" +

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
          "its=vec2(textureSize(uTex,0))," +
          "p;" +
          
        "float " + 
          "rnd=rand(vTUv*100.+50.)+length(1./its)," +
          "t=RADIAN_360/uS," +
          "l=uS*t," +
          "rad;" +

        "for(rad=0.;rad<l;rad+=t){" +
          "p=vec2(" + 
            "cos(rad)," + 
            "sin(rad)" +
          ")*uR/its*rnd;" +
          
          "v+=clamp((texture(uTex,vTUv+p).g-tx)/length(p),0.,1.);" +
        "}" +
        "v/=uS;" +
      "}" +
      
      "vec3 " +
        "stCl=uUSTT<1." + 
          "?Z.yyy" + 
          ":texture(uSTTex,vTUv).rgb;" +

      "oCl=vec4(stCl*((1.-uDM)*.5+tx*uDM)*(1.-v),1);" +
    "}";
  }
}
