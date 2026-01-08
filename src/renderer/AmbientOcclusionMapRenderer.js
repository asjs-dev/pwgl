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
   * @param {AmbientOcclusionMapRendererConfig} config
   */
  constructor(config = {}) {
    config = Utils.initRendererConfig(config);

    // prettier-ignore
    Utils.setLocations(config, [
      "uSTTx",
      "uP",
      "uUSTT",
      "uOs",
    ]);

    super(config);

    this.sourceTexture = config.sourceTexture;
    this.heightMap = config.heightMap;
    this.radius = config.radius ?? 4;
    this.samples = config.samples ?? 4;
    this.multiplier = config.multiplier ?? 1;
    this.depthMultiplier = config.depthMultiplier ?? 1;
    this._offset = config.offset ?? new Float32Array(2);
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
      locations = this.$locations,
      sourceTextureBoolean = !!this.sourceTexture;

    this.context.setBlendMode(BlendMode.NORMAL);

    this.$useTextureAt(this.heightMap, locations.uTx, 0);

    sourceTextureBoolean &&
      this.$useTextureAt(this.sourceTexture, locations.uSTTx, 1);

    gl.uniform1f(locations.uUSTT, sourceTextureBoolean);
    gl.uniform4f(
      locations.uP,
      this.radius,
      this.samples,
      this.multiplier,
      this.depthMultiplier
    );
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
      "aPs;" +

    "uniform float " +
      "uFlpY;" +
    "uniform vec2 " +
      "uOs;" +
    "uniform vec4 " +
      "uP;" +
    "uniform sampler2D " +
      "uTx;" +

    "out vec2 " +
      "vOs," +
      "vTUv," + 
      "vTs," +
      "vT;" +

    "void main(void){" +
      "gl_Position=vec4(aPs*2.-1.,1,1);" +
      "gl_Position.y*=uFlpY;" +
      "vTUv=vec2(aPs.x,1.-aPs.y);" +
      "vec2 ts=1./vec2(textureSize(uTx,0));" +
      "vTs=uP.x*ts;" + 
      "vOs=(vTUv+uOs*ts)*100.;" +
      "float " + 
        "r=RADIANS_360/uP.y;" + 
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

    "in vec2 " +
      "vOs," +
      "vTUv," + 
      "vTs," +
      "vT;" +

    "uniform sampler2D " +
      "uSTTx," +
      "uTx;" +
    "uniform float " +
      "uUSTT;" +
    "uniform vec4 " +
      "uP;" +

    "out vec4 " +
      "oCl;" +

    Utils.GLSL.RANDOM +

    "void main(void){" +
      "float " +
        "tx=texture(uTx,vTUv).g," +
        "v=0.;" +
        
      "if(uP.y>0.&&uP.x>0.){" +
        "vec2 " +
          "n," +
          "rg;" +

        "float " +
          "l=min(uP.y,1024.)," +
          "ln;" +
        
        "vec2 " +
          "dr=Z.yx;" +

        "mat2 " + 
          "rot=mat2(vT.x,-vT.y,vT.y,vT.x);" +

        "for(float i=0.;i<l;i++){" +
          "n=vTs*rand(vOs+i,i);" +
          "ln=length(n);" +
          "rg=max(texture(uTx,vTUv+dr*n).rg-tx,Z.xx);" +

          "v+=(rg.y*(1.-rg.y))/(1.+ln*uP.x);" +

          "dr*=rot;" +
        "}" +
        "v/=l;" +
      "}" +
      
      "vec3 " +
        "stCl=uUSTT>0.?texture(uSTTx,vTUv).rgb:Z.yyy;" +

      "oCl=vec4(stCl*(mix(1.,tx,uP.w)-v*uP.z),1);" +
    "}";
  }
}
