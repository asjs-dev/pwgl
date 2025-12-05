import { BaseRenderer } from "./BaseRenderer";
import { Framebuffer } from "../data/texture/Framebuffer";
import { BlendMode } from "../data/BlendMode";
import { noop } from "../utils/helpers";
import { Utils } from "../utils/Utils";

/**
 * @typedef {Object} FilterRendererConfig
 * @extends {RendererConfig}
 * @property {Array<BaseFilter>} filters
 * @property {TextureInfo} sourceTexture
 */

/**
 * <pre>
 *  Filter renderer
 *    - Renders filters to a source image
 * </pre>
 * @extends {BaseRenderer}
 * @property {Array<BaseFilter>} filters
 * @property {TextureInfo} sourceTexture
 */
export class FilterRenderer extends BaseRenderer {
  /**
   * Creates an instance of FilterRenderer.
   * @constructor
   * @param {FilterRendererConfig} config
   */
  constructor(config = {}) {
    config = Utils.initRendererConfig(config);

    // prettier-ignore
    config.locations = [
      "uFTx",
      "uFtrT",
      "uFtrV",
      "uFtrK",
      "uFRt",
    ];

    super(config);

    this._attachFramebufferAndClearFv = this.$attachFramebufferAndClear;
    this.$attachFramebufferAndClear = noop;

    this.filters = config.filters || [];
    this.sourceTexture = config.sourceTexture;

    this._framebuffers = [new Framebuffer(), new Framebuffer()];
  }

  get filters() {
    return this._filters;
  }

  set filters(v) {
    this._filters = new Proxy(v, {
      deleteProperty: (target, property) => {
        delete target[property];
        this._rendererId++;
        return true;
      },
      set: (target, property, value) => {
        target[property] = value;
        this._rendererId++;
        return true;
      },
    });
    this._rendererId++;
  }

  /**
   * @param {Framebuffer} framebuffer
   * @ignore
   */
  $render(framebuffer) {
    const context = this.context,
      gl = this.$gl,
      renderTime = this.$renderTime,
      locations = this.$locations,
      filters = this._filters,
      l = filters.length || 1,
      minL = l - 2;
    let i = -1;

    context.setBlendMode(BlendMode.NORMAL);

    this.$uploadBuffers();

    gl.uniform1f(locations.uFRt, renderTime % 864e5);

    this.$useTextureAt(this.sourceTexture, locations.uTx, 0);

    while (++i < l) {
      const filter = filters[i],
        useFilter = filter && filter.on,
        isLast = i > minL,
        filterTexture =
          useFilter &&
          filter.textureTransform &&
          filter.textureTransform.texture;

      let filterFramebuffer;

      filterTexture && this.$useTextureAt(filterTexture, locations.uFTx, 1);

      if (isLast)
        framebuffer
          ? this._attachFramebufferAndClearFv(framebuffer)
          : gl.uniform1f(locations.uFlpY, 1);
      else if (useFilter) {
        filterFramebuffer = this._framebuffers[i & 1];
        this._attachFramebufferAndClearFv(filterFramebuffer);
      }

      if (useFilter) {
        gl.uniform1i(locations.uFtrT, filter.uniqueId);
        gl.uniform1fv(locations.uFtrV, filter.v);
        filter.kernels &&
          gl.uniformMatrix4fv(locations.uFtrK, false, filter.kernels);
      }

      (useFilter || isLast) && this.$drawInstanced(1);

      filterTexture && context.deactivateTexture(filterTexture);

      if (filterFramebuffer) {
        filterFramebuffer.unbind(gl);
        context.useTextureAt(filterFramebuffer, 0, renderTime);
      }
    }
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createVertexShader() {
    return "" +
    "in vec2 " +
      "aPs;" +

    "uniform float " +
      "uFlpY;" +
    "uniform sampler2D " +
      "uTx;" +

    "out vec2 " +
      "vTs," +
      "vUv," +
      "vTUv;" +

    "void main(void){" +
      "gl_Position=vec4(aPs*2.-1.,1,1);" +
      "vUv=gl_Position.xy;" +
      "gl_Position.y*=uFlpY;" +
      "vTUv=vec2(aPs.x,1.-aPs.y);" +
      "vTs=vec2(textureSize(uTx,0));" +
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
      "vTs," +
      "vUv," +
      "vTUv;" +

    "uniform int " +
      "uFtrT;" +
    "uniform float " +
      "uFRt," +
      "uFtrV[9];" +
    "uniform mat4 " +
      "uFtrK;" +
    "uniform sampler2D " +
      "uTx," +
      "uFTx;" +

    "out vec4 " +
      "oCl;" +

    Utils.GLSL.RANDOM +
    
    "float gtGS(vec4 cl){" + 
      "return .3*cl.r+.59*cl.g+.11*cl.b;" +
    "}" +

    "void main(void){" +
      "oCl=texture(uTx,vTUv);" +

      "float " +
        "vl[]=uFtrV," +
        "v=vl[0];" +

      "ivec2 " +
        "f=ivec2(floor(vTUv*vTs));" +

      "vec2 " +
        "vol=v/vTs;" +

      "vec3 " +
        "rgb=vec3(vl[2],vl[3],vl[4]);" +

      "vec4 " +
        "oClVl=oCl*(1.-v);" +

      "mat4 " +
        "kr=uFtrK;"+
    
      this.filters.reduce((acc, item) => {
        let index = acc.findIndex((record) => record.GLSL === item.GLSL);
        if (index < 0) index = acc.push(item) - 1;
        item.uniqueId = index;
        return acc;
      }, []).map((item) => "if(uFtrT==" + item.uniqueId + "){" + item.GLSL + "}").join("else ") + 

    "}";
  }
}
