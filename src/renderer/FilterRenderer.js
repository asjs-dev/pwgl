import { noop } from "../../extensions/utils/noop";
import { BaseRenderer } from "./BaseRenderer";
import { Framebuffer } from "../data/texture/Framebuffer";
import { BlendMode } from "../data/BlendMode";
import { Utils } from "../utils/Utils";
import {
  BASE_VERTEX_SHADER,
  BASE_VERTEX_SHADER_INITIALIZATION,
  BASE_VERTEX_SHADER_POSITION,
} from "../../extensions/renderer/BaseVertexShader";

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
    Utils.setLocations(config, [
      "uFTx",
      "uId",
      "uFV",
      "uFK",
      "uRT",
      "uTS"
    ]);

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
      sourceTexture = this.sourceTexture,
      l = filters.length || 1,
      minL = l - 2;
    let i = -1;

    context.setBlendMode(BlendMode.NORMAL);

    this.$uploadBuffers();

    gl.uniform1f(locations.uRT, renderTime % 864e5);

    this.$useTextureAt(sourceTexture, locations.uTx, 0);

    gl.uniform2f(locations.uTS, sourceTexture.width, sourceTexture.height);

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
          : gl.uniform1f(locations.uFY, 1);
      else if (useFilter) {
        filterFramebuffer = this._framebuffers[i & 1];
        this._attachFramebufferAndClearFv(filterFramebuffer);
      }

      if (useFilter) {
        gl.uniform1i(locations.uId, filter.uniqueId);
        gl.uniform1fv(locations.uFV, filter.v);
        filter.kernels &&
          gl.uniformMatrix4fv(locations.uFK, false, filter.kernels);
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
    return BASE_VERTEX_SHADER_INITIALIZATION +

    "out vec4 " +
      "v0;" +

    "void main(void){" +
      BASE_VERTEX_SHADER +
      
      "v0=vec4(pos.xy," + BASE_VERTEX_SHADER_POSITION + ");" +
    "}";
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    return Utils.GLSL.DEFINE.Z +
    Utils.GLSL.DEFINE.RADIANS_360 +
    
    "in vec4 " +
      "v0;" +

    "uniform int " +
      "uId;" +
    "uniform float " +
      "uRT," +
      "uFV[9];" +
    "uniform vec2 " +
      "uTS;" +
    "uniform mat4 " +
      "uFK;" +
    "uniform sampler2D " +
      "uTx," +
      "uFTx;" +

    "out vec4 " +
      "oCl;" +

    Utils.GLSL.RANDOM +
    
    "float tl(float c){" +
      "return c<=.04045?c/12.92:pow((c+.055)/1.055,2.4);" +
    "}" +

    "float rl(vec3 c){" +
      "return .2126*tl(c.r)+.7152*tl(c.g)+.0722*tl(c.b);" +
    "}" +

    "float gtGS(vec3 cl){" + 
      "return .3*cl.r+.59*cl.g+.11*cl.b;" +
    "}" +

    "void main(void){" +
      "oCl=texture(uTx,v0.zw);" +

      "float " +
        "vl[]=uFV," +
        "v=vl[0];" +

      "vec2 " + 
        "ts=floor(uTS);" +
      
      "ivec2 " +
        "f=ivec2(floor(v0.zw*ts));" +

      "vec2 " +
        "vol=v/ts;" +

      "vec3 " +
        "rgb=vec3(vl[2],vl[3],vl[4]);" +

      "vec4 " +
        "oClVl=oCl*(1.-v);" +

      "mat4 " +
        "kr=uFK;"+
    
      this.filters.reduce((acc, item) => {
        let index = acc.findIndex((record) => record.GLSL === item.GLSL);
        if (index < 0) index = acc.push(item) - 1;
        item.uniqueId = index;
        return acc;
      }, []).map((item) => "if(uId==" + item.uniqueId + "){" + item.GLSL + "}").join("else ") + 

    "}";
  }
}
