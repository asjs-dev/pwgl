import { BaseRenderer } from "./BaseRenderer";
import { Utils } from "../core/Utils";
import { Framebuffer } from "../textures/Framebuffer";
import { BlendMode } from "../rendering/BlendMode";
import {
  BASE_VERTEX_SHADER,
  BASE_VERTEX_SHADER_INITIALIZATION,
  BASE_VERTEX_SHADER_POSITION,
} from "../utils/shaderUtils";
import { noop } from "../../extensions/utils/noop";

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
      "uF",
      "uH",
      "uI",
      "uJ",
      "uK",
      "uL",
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
      l = filters.length || 1,
      minL = l - 2;
    let i = -1;

    context.setBlendMode(BlendMode.NORMAL);

    this.$uploadBuffers();

    this.$useTextureAt(this.sourceTexture, locations.uB, 0);

    gl.uniform3f(locations.uF, this.width, this.height, renderTime % 864e5);

    while (++i < l) {
      const filter = filters[i],
        useFilter = filter && filter.on,
        isLast = i > minL,
        filterTexture =
          useFilter &&
          filter.texture;

      let filterFramebuffer;

      filterTexture && this.$useTextureAt(filterTexture, locations.uH, 1);

      if (isLast)
        framebuffer
          ? this._attachFramebufferAndClearFv(framebuffer)
          : gl.uniform1f(locations.uA, 1);
      else if (useFilter) {
        filterFramebuffer = this._framebuffers[i & 1];
        this._attachFramebufferAndClearFv(filterFramebuffer);
      }

      if (useFilter) {
        gl.uniform1i(locations.uI, filter.uniqueId);
        gl.uniform1fv(locations.uJ, filter.data);
        gl.uniformMatrix2x4fv(locations.uL, false, filter.customData);
        gl.uniformMatrix3fv(locations.uK, false, filter.kernels);
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

    "void main(){" +
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
      
    "uniform float " + 
      "uJ[10];" +
    "uniform int " +
      "uI;" +
    "uniform vec3 " +
      "uF;" +
    "uniform mat3 " +
      "uK;" +
    "uniform mat2x4 " +
      "uL;" +
    "uniform sampler2D " +
      "uB," +
      "uH;" +

    "out vec4 " +
      "oCl;" +

    Utils.GLSL.RANDOM +
    
    "float gs(vec3 c){" + 
      "return .3*c.r+.59*c.g+.11*c.b;" +
    "}" +

    "void main(){" +
      "oCl=texture(uB,v0.zw);" +

      "vec4 " +
        "tmpCl=oCl;" +

      "float " +
        "v=uJ[0];" +

      "vec2 " + 
        "ts=floor(uF.xy)," +
        "vol=v/ts;" +
      
      "ivec2 " +
        "f=ivec2(floor(v0.zw*ts));" +
    
      this.filters.reduce((acc, item) => {
        let index = acc.findIndex((record) => record.GLSL === item.GLSL);
        if (index < 0) index = acc.push(item) - 1;
        item.uniqueId = index;
        return acc;
      }, []).map((item) => "if(uI==" + item.uniqueId + "){" + item.GLSL + "}").join("else ") + 

      "vec2 d=abs(v0.zw-vec2(uJ[4],uJ[5]));" +
      
      "float " + 
        "ds=mix(length(d),pow(pow(d.x,4.)+pow(d.y,4.),.25),uJ[8])," +
        "dst=mix(" +
          "1.," +
          "clamp(" +
            "pow(" +
              "clamp(ds,0.,1.)/uJ[7]," +
              "uJ[9]" +
            ")," +
            "0.," +
            "1." +
          ")," +
          "uJ[3]" +
        ")," +
        "mA=mix(dst,1.-dst,uJ[6]);" +

        "oCl=mix(tmpCl,oCl,mA*uJ[2]);" +
    "}";
  }
}
