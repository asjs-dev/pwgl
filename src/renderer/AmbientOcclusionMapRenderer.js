import { Utils } from "../utils/Utils";
import { BlendMode } from "../data/BlendMode";
import { BaseRenderer } from "./BaseRenderer";

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
          "ts=uR/its," +
          "p;" +
          
        "float " + 
          "lng=length(ts)," +
          "rnd=.8+rand(vTUv*100.+50.)*.4," +
          "l=3.+ceil(uS*rand(vTUv*100.+50.))," +
          "t=RADIAN_360/l," +
          "ht," +
          "rad;" +

        "for(rad=0.;rad<RADIAN_360;rad+=t){" +
          "p=vec2(" + 
            "cos(rad)," + 
            "sin(rad)" +
          ")*ts*rnd;" +
          
          "ht=texture(uTex,vTUv+p).g-tx;" +
          "v+=ht*length(p)/lng;" +
        "}" +
        "v/=l;" +
      "}" +
      
      "vec3 " +
        "stCl=uUSTT<1." + 
          "?Z.yyy" + 
          ":texture(uSTTex,vTUv).rgb;" +

      "oCl=vec4(stCl*(1.-(1.-tx)*uDM-clamp(v,0.,1.)),1);" +
    "}";
  }
}
