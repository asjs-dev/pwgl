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
   * @param {FilterRendererConfig} options
   */
  constructor(options = {}) {
    options.config = Utils.initRendererConfig(options.config);

    // prettier-ignore
    options.config.locations = [
      "uFTex",
      "uFtrT",
      "uFtrV",
      "uFtrK"
    ];

    super(options);

    this._attachFramebufferAndClearFv = this.$attachFramebufferAndClear;
    this.$attachFramebufferAndClear = noop;

    this.filters = options.filters || [];
    this.sourceTexture = options.sourceTexture;

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

    context.setBlendMode(BlendMode.NORMAL);

    this.$uploadBuffers();

    this.$useTextureAt(this.sourceTexture, locations.uTex, 0);

    for (let i = 0; i < l; i++) {
      let filterFramebuffer;

      const filter = filters[i],
        useFilter = filter && filter.on,
        isLast = i > minL,
        filterTexture =
          useFilter &&
          filter.textureTransform &&
          filter.textureTransform.texture;

      filterTexture && this.$useTextureAt(filterTexture, locations.uFTex, 1);

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
      "aPos;" +

    "uniform float " +
      "uFlpY;" +
    "uniform sampler2D " +
      "uTex;" +

    "out vec2 " +
      "vTs," +
      "vUv," +
      "vTUv;" +

    "void main(void){" +
      "gl_Position=vec4(aPos*2.-1.,1,1);" +
      "vUv=gl_Position.xy;" +
      "gl_Position.y*=uFlpY;" +
      "vTUv=vec2(aPos.x,1.-aPos.y);" +
      "vTs=vec2(textureSize(uTex,0));" +
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

    "uniform sampler2D " +
      "uTex," +
      "uFTex;" +
    "uniform int " +
      "uFtrT;" +
    "uniform float " +
      "uFtrV[9];" +
    "uniform mat4 " +
      "uFtrK;" +

    "out vec4 " +
      "oCl;" +

    Utils.GLSL.RANDOM +
    
    "float gtGS(vec4 cl){" + 
      "return .3*oCl.r+.59*oCl.g+.11*oCl.b;" +
    "}" +

    "void main(void){" +
      "oCl=texture(uTex,vTUv);" +

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
