import { noop } from "../utils/helpers";
import { Utils } from "../utils/Utils";
import { BlendMode } from "../data/BlendMode";
import { Framebuffer } from "../data/texture/Framebuffer";
import { BaseRenderer } from "./BaseRenderer";

/**
 * @typedef {Object} FilterRendererConfig
 * @extends {RendererConfig}
 * @property {Array<BaseFilter>} filters
 * @property {TextureInfo} texture
 */

/**
 * Filter renderer
 *  - Renders filters to a source texture
 * @extends {BaseRenderer}
 */
export class FilterRenderer extends BaseRenderer {
  /**
   * Creates an instance of FilterRenderer.
   * @constructor
   * @param {FilterRendererConfig} options
   */
  constructor(options) {
    options = options || {};
    options.config = Utils.initRendererConfig(options.config);

    // prettier-ignore
    options.config.locations = options.config.locations.concat([
      "uFTex",
      "uFtrT",
      "uFtrV",
      "uFtrK"
    ]);

    super(options);

    this.$attachFramebufferCustom = this.$attachFramebufferAndClearCustom =
      noop;

    this.filters = options.filters || [];
    this.texture = options.texture;

    this._framebuffers = [new Framebuffer(), new Framebuffer()];
  }

  /**
   * @param {Framebuffer} framebuffer
   * @ignore
   */
  $render(framebuffer) {
    const context = this.context;
    const gl = this.$gl;
    const renderTime = this.$renderTime;
    const locations = this.$locations;

    context.setBlendMode(BlendMode.NORMAL);

    this.$uploadBuffers();

    context.useTextureAt(this.texture, 0, renderTime, true);
    gl.uniform1i(locations.uTex, 0);

    const l = this.filters.length || 1;
    const minL = l - 2;

    for (let i = 0; i < l; ++i) {
      let filterFramebuffer;

      const filter = this.filters[i];
      const useFilter = filter && filter.on;

      const isLast = i > minL;

      const filterTexture =
        useFilter && filter.textureProps && filter.textureProps.texture;
      if (filterTexture) {
        context.useTextureAt(filterTexture, 1, renderTime, true);
        gl.uniform1i(locations.uFTex, 1);
      }

      if (isLast)
        framebuffer
          ? this.$attachFramebufferAndClear(framebuffer)
          : gl.uniform1f(locations.uFlpY, 1);
      else if (useFilter) {
        filterFramebuffer = this._framebuffers[i & 1];
        this.$attachFramebufferAndClear(filterFramebuffer);
      }

      if (useFilter) {
        gl.uniform1fv(locations.uFtrV, filter.v);
        gl.uniformMatrix4fv(locations.uFtrK, false, filter.kernels);
        gl.uniform2i(locations.uFtrT, filter.TYPE, filter.SUB_TYPE);
      }

      (useFilter || isLast) && this.$drawInstanced(1);

      filterTexture && context.deactivateTexture(filterTexture);

      if (filterFramebuffer) {
        filterFramebuffer.unbind(gl);
        context.useTextureAt(filterFramebuffer, 0, renderTime, true);
      }
    }
  }

  // prettier-ignore
  /**
   * @param {FilterRendererConfig} options
   * @returns {string}
   * @ignore
   */
  $createVertexShader(options) {
    return Utils.createVersion(options.config.precision) +
    "in vec2 " +
      "aPos;" +

    "uniform float " +
      "uFlpY;" +

    "out vec2 " +
      "vUv," +
      "vTUv;" +

    "void main(void){" +
      "gl_Position=vec4(aPos*2.-1.,1,1);" +
      "vUv=gl_Position.xy;" +
      "gl_Position.y*=uFlpY;" +
      "vTUv=vec2(aPos.x,1.-aPos.y);" +
    "}";
  }

  // prettier-ignore
  /**
   * @param {FilterRendererConfig} options
   * @returns {string}
   * @ignore
   */
  $createFragmentShader(options) {
    const blurFunc = (core) =>
      "for(oft.x=-2.;oft.x<3.;++oft.x)" +
        "for(oft.y=-2.;oft.y<3.;++oft.y)" +
          "if(oft.x!=0.&&oft.y!=0.){" +
            "poft=clamp(f+ivec2(floor(wh*oft)),P.xx,ts-1);" +
            "clg=texelFetch(uTex,poft,0);" +
            core +
          "}" +
      "pcl=cl/c;";

    return Utils.createVersion(options.config.precision) +
    "#define P ivec2(0,1)\n" +

    "uniform sampler2D " +
      "uTex," +
      "uFTex;" +
    "uniform ivec2 " +
      "uFtrT;" +
    "uniform float " +
      "uFtrV[9];" +
    "uniform mat4 " +
      "uFtrK;" +

    "in vec2 " +
      "vUv," +
      "vTUv;" +

    "out vec4 " +
      "oCl;" +

    "void main(void){" +
      "oCl=texture(uTex,vTUv);" +
      // FILTERS
      "if(uFtrT.x>0){" +
        "float " +
          "vl[]=uFtrV," +
          "v=vl[0];" +

        "ivec2 " +
          "ts=textureSize(uTex,0)," +
          "f=ivec2(floor(vTUv*vec2(ts)));" +

        "vec2 " +
          "vol=v*(1./vec2(ts));" +

        "vec3 " +
          "rgb=vec3(vl[2],vl[3],vl[4]);" +

        "mat4 " +
          "kr=uFtrK;" +
        /*
          CONVOLUTE FILTERS:
            - SharpenFilter
            - EdgeDetectFilter
        */
        "if(uFtrT.x<2){" +
          "kr*=v;" +
          "oCl=vec4((" +
            "texelFetch(uTex,f-ivec2(1),0)*kr[0].x+" +
            "texelFetch(uTex,f+ivec2(0,-1),0)*kr[0].y+" +
            "texelFetch(uTex,f+ivec2(1,-1),0)*kr[0].z+" +
            "texelFetch(uTex,f+ivec2(-1,0),0)*kr[0].w+" +
            "oCl*kr[1].x+" +
            "texelFetch(uTex,f+ivec2(1,0),0)*kr[1].y+" +
            "texelFetch(uTex,f+ivec2(-1,1),0)*kr[1].z+" +
            "texelFetch(uTex,f+ivec2(0,1),0)*kr[1].w+" +
            "texelFetch(uTex,f+ivec2(1),0)*kr[2].x" +
          ").rgb,oCl.a);" +
        /*
          COLORMATRIX FILTERS:
            - Saturate
        */
        "}else if(uFtrT.x<3)" +
          "oCl.rgb=vec3(" +
            "kr[0].r*oCl.r+kr[0].g*oCl.g+kr[0].b*oCl.b+kr[0].a," +
            "kr[1].r*oCl.r+kr[1].g*oCl.g+kr[1].b*oCl.b+kr[1].a," +
            "kr[2].r*oCl.r+kr[2].g*oCl.g+kr[2].b*oCl.b+kr[2].a" +
          ");" +
        // COLOR MANIPULATION FILTERS
        "else if(uFtrT.x<4){"+
          "vec4 " +
            "oClVl=oCl*(1.-v);" +
          // GrayscaleFilter
          "if(uFtrT.y<2)" +
            "oCl=oClVl+vec4(vec3((oCl.r+oCl.g+oCl.b)/3.),oCl.a)*v;" +
          // SepiaFilter
          "else if(uFtrT.y<3)" +
            "oCl=oClVl+" +
              "vec4(vec3(.874,.514,.156)*((oCl.r+oCl.g+oCl.b)/3.),oCl.a)*v;" +
          // InvertFilter
          "else if(uFtrT.y<4)" +
            "oCl=oClVl+vec4(1.-oCl.rgb,oCl.a)*v;" +
          // TintFilter
          "else if(uFtrT.y<5)" +
            "oCl.rgb*=rgb*v;" +
          // ColorLimitFilter
          "else if(uFtrT.y<6)" +
            "oCl=vec4((round((oCl.rgb*256.)/v)/256.)*v,oCl.a);" +
          // VignetteFilter
          "else if(uFtrT.y<7){" +
            "vec2 " +
              "pv=pow(abs(vUv*v),vec2(vl[1]));" +
            "float " +
              "cv=clamp((1.-length(pv))*vl[5],0.,1.);" +
            "oCl.rgb=oCl.rgb*cv+rgb*(1.-cv);" +
          "}" +
          // RainbowFilter
          "else if(uFtrT.y<8)" +
            "oCl.rgb+=vec3(vUv.xy*.15,(vUv.x*vUv.y)*.15)*v;" +
          // BrightnessContrastFilter
          "else if(uFtrT.y<9)" +
            "oCl.rgb=vec3((oCl.rgb-.5)*vl[1]+.5+v);" +
          // GammaFilter
          "else if(uFtrT.y<10)" +
            "oCl.rgb=pow(oCl.rgb,vec3(v));" +
        "}" +
        // SAMPLING FILTERS
        "else if(uFtrT.x<5){" +
          "vec2 " +
            "oft," +
            "wh=vec2(v,vl[1]);" +

          "ivec2 " +
            "poft;" +

          "vec4 " +
            "pcl," +
            "clg," +
            "cl=oCl;" +

          "float " +
            "c=1.;" +

          // BlurFilter
          "if(uFtrT.y<2){" +
            "float " +
              "l=length(vec2(2))," +
              "im;" +

            blurFunc(
              "im=1.-(length(oft)/l)*.9;" +
              "cl+=clg*im;" +
              "c+=im;"
            ) +

            "float " +
              "dst=vl[2]<1." +
                "?1." +
                ":clamp(distance(vec2(vl[3],vl[4]),vTUv)*vl[5],0.,1.);" +

            "oCl=dst*pcl+(1.-dst)*oCl;" +

          // GlowFilter
          "}else{" +
            "float " +
              "omx=max(oCl.r,max(oCl.g,oCl.b));" +

            blurFunc(
              "if(abs(max(clg.r,max(clg.g,clg.b))-omx)>.3)" +
                "cl+=clg;" +
              "c++;"
            ) +

            "oCl+=pcl;" +
          "}" +
        "}" +
        // PixelateFilter
        "else if(uFtrT.x<6)" +
          "oCl=texture(uTex,floor(vTUv/vol)*vol);" +
        // DisplacementFilter
        "else if(uFtrT.x<8){" +
          "vec4 " +
            "mskCl=texture(" +
              "uFTex," +
              "mod(vec2(vl[1],vl[2])+vTUv,1.)*vec2(vl[5]-vl[3],vl[6]-vl[4])" +
            ");" +
          "if(uFtrT.x<7)" +
            "oCl=texture(uTex,vTUv+(vec2(1,-1)*(mskCl.rg-.5)*2.*vol));" +
          // MaskFilter
          "else if(uFtrT.x<8)" +
            "oCl.a*=v<4." +
              "?mskCl[int(v)]" +
              ":(mskCl.r+mskCl.g+mskCl.b+mskCl.a)/4.;" +
        // ChromaticAberrationFilter
        "}else if(uFtrT.x<9){" +
          "vec4 " +
            "pcl=vec4(" +
              "texture(uFTex,vTUv-vec2(vol.x,0)).r," +
              "texture(uFTex,vTUv+vec2(0,vol.y)).g," +
              "texture(uFTex,vTUv+vec2(vol.x,0)).b," +
              "1" +
            ");" +

          "float " +
            "dst=vl[2]<1." +
              "?1." +
              ":clamp(distance(vec2(vl[3],vl[4]),vTUv)*vl[5],0.,1.);" +

          "oCl=dst*pcl+(1.-dst)*oCl;" +
        "}" +
      "}" +
    "}";
  }
}
