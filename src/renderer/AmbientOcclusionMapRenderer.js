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
 * @property {number} multiplier
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
      "uM",
      "uDM",
      "uUSTT",
    ];

    super(options);

    this.sourceTexture = options.sourceTexture;
    this.heightMap = options.heightMap;
    this.radius = options.radius ?? 4;
    this.samples = options.samples ?? 4;
    this.multiplier = options.multiplier ?? 1;
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
    gl.uniform1f(locations.uM, this.multiplier);
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

    "out float " +
      "vLv;" +
    "out vec2 " +
      "vTUv," + 
      "vTs;" +

    "void main(void){" +
      "gl_Position=vec4(aPos*2.-1.,1,1);" +
      "vTUv=vec2(aPos.x,1.-aPos.y);" +
      "gl_Position.y*=uFlpY;" +
      "vTs=uR/vec2(textureSize(uTex,0));" + 
      "vLv=length(vTs);" +
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

    "in float " +
      "vLv;" +
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
      "uM," +
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
          "vh=vTUv*100.+100.," + 
          "n," +
          "rg;" +

        "float " +
          "rad=RADIANS_360*rand(vh-2.)," + 
          "l=max(1.,max(uS*.5,ceil(uS*rand(vh-1.))))," +
          "t=RADIANS_360/l," + 
          "a," +
          "b," +
          "ln;" +
        
        "vec2 " +
          "dr=vec2(cos(rad),sin(rad))," +
          "r=vec2(cos(t),sin(t));" +

        "for(float i=0.;i<1024.;i++){" +
          "if(i>=l)break;" +
          "n=vTs*rand(vh+i,i);" +
          "ln=length(n);" +
          "rg=texture(uTex,vTUv+dr*n).rg-tx;" +
          
          "a=rg.x>0.?min(1.,ln/rg.x):0.;" +
          "b=rg.y>0.?vLv*rg.y/max(ln,rg.y):0.;" +
          "v+=.5*(a+b);" +

          "dr*=mat2(r.x,-r.y,r.y,r.x);" +
        "}" +
        "v/=l;" +
      "}" +
      
      "vec3 " +
        "stCl=mix(Z.yyy,texture(uSTTex,vTUv).rgb,vec3(uUSTT));" +

      "oCl=vec4(stCl*(1.-(1.-tx)*uDM-v*uM),1);" +
    "}";
  }
}
