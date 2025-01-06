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
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    return Utils.GLSL.VERSION +
    "precision highp float;\n" +

    "in vec2 " +
      "aPos;" +

    "uniform float " +
      "uR," +
      "uFlpY;" +
    "uniform sampler2D " +
      "uTex;" +

    "out float " +
      "vLng," +
      "vR;" +
    "out vec2 " +
      "vTUv," + 
      "vTs;" +

    "void main(void){" +
      "gl_Position=vec4(aPos*2.-1.,1,1);" +
      "vTUv=vec2(aPos.x,1.-aPos.y);" +
      "gl_Position.y*=uFlpY;" +
      "vTs=uR/vec2(textureSize(uTex,0));" + 
      "vLng=length(vTs);" +
      "vR=uR;" +
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
    Utils.GLSL.DEFINE.RADIAN_360 +
    Utils.GLSL.DEFINE.PI +
    Utils.GLSL.DEFINE.Z +
    
    "in float " +
      "vLng," +
      "vR;" +
    "in vec2 " +
      "vTUv," + 
      "vTs;" +

    "uniform sampler2D " +
      "uSTTex," +
      "uTex;" +
    "uniform float " +
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
        
      "if(uS>0.&&vR>0.){" +
        "vec2 " +
          "dr=Z.yx," +
          "p;" +
          
        "float " + 
          "l=3.+ceil(uS*rand(vTUv*100.+50.))," +
          "t=RADIAN_360/l," +
          "rad;" +

        "vec2 " +
          "sts=vTs*(.8+rand(vTUv*100.+50.)*.4)," +
          "r=vec2(cos(t),sin(t));" +

        "for(rad=0.;rad<RADIAN_360;rad+=t){" +
          "p=dr*sts;" +
          "v+=(texture(uTex,vTUv+p).g-tx)*length(p)/vLng;" +
          "dr=vec2(dr.x*r.x-dr.y*r.y,dr.x*r.y+dr.y*r.x);" +
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
