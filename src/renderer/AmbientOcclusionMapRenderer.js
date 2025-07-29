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
      "uOs",
    ];

    super(options);

    this.sourceTexture = options.sourceTexture;
    this.heightMap = options.heightMap;
    this.radius = options.radius ?? 4;
    this.samples = options.samples ?? 4;
    this.multiplier = options.multiplier ?? 1;
    this.depthMultiplier = options.depthMultiplier ?? 1;
    this._offset = options.offset ?? new Float32Array(2);
  }

  /**
   * Gets the x offset for the ambient occlusion map.
   * @returns {number}
   */
  get offsetX() {
    return this._offset[0];
  }
  /**
   * Sets the x offset for the ambient occlusion map.
   * @param {number} value
   */
  set offsetX(value) {
    this._offset[0] = value;
  }

  /**
   * Gets the y offset for the ambient occlusion map.
   * @returns {number}
   */
  get offsetY() {
    return this._offset[1];
  }
  /**
   * Sets the y offset for the ambient occlusion map.
   * @param {number} value
   */
  set offsetY(value) {
    this._offset[1] = value;
  }

  /**
   * Sets the offset for the ambient occlusion map.
   * @param {number} x - The x offset.
   * @param {number} y - The y offset.
   */
  setOffset(x, y) {
    this._offset[0] = x;
    this._offset[1] = y;
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
    gl.uniform2fv(locations.uOs, this._offset);

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
    Utils.GLSL.DEFINE.RADIANS_360 +

    "in vec2 " +
      "aPos;" +

    "uniform float " +
      "uR," +
      "uS," +
      "uFlpY;" +
    "uniform vec2 " +
      "uOs;" +
    "uniform sampler2D " +
      "uTex;" +

    "out float " +
      "vLv;" +
    "out vec2 " +
      "vOs," +
      "vTUv," + 
      "vTs," +
      "vT;" +

    "void main(void){" +
      "gl_Position=vec4(aPos*2.-1.,1,1);" +
      "vTUv=vec2(aPos.x,1.-aPos.y);" +
      "gl_Position.y*=uFlpY;" +
      "vec2 ts=1./vec2(textureSize(uTex,0));" +
      "vTs=uR*ts;" + 
      "vLv=length(vTs);" +
      "vOs=vTUv+uOs*ts;" +
      "float " + 
        "r=RADIANS_360/uS;" + 
      "vT=vec2(cos(r),sin(r));" +
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
      "vOs," +
      "vTUv," + 
      "vTs," +
      "vT;" +

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
          "n," +
          "rg;" +

        "float " +
          "a," +
          "b," +
          "ln;" +
        
        "vec2 " +
          "dr=Z.yx," +
          "r=vT;" +

        "for(float i=0.;i<1024.;i++){" +
          "if(i>=uS)break;" +
          "n=vTs*rand(vOs+i,i);" +
          "ln=length(n);" +
          "rg=texture(uTex,vTUv+dr*n).rg-tx;" +
          
          "a=rg.x>0.?min(1.,ln/rg.x):0.;" +
          "b=rg.y>0.?vLv*rg.y/max(ln,rg.y):0.;" +
          "v+=.5*(a+b);" +

          "dr*=mat2(r.x,-r.y,r.y,r.x);" +
        "}" +
        "v/=uS;" +
      "}" +
      
      "vec3 " +
        "stCl=mix(Z.yyy,texture(uSTTex,vTUv).rgb,vec3(uUSTT));" +

      "oCl=vec4(stCl*(1.-(1.-tx)*uDM-v*uM),1);" +
    "}";
  }
}
