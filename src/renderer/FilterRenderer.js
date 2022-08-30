import { emptyFunction } from "../utils/helpers.js";
import { Utils } from "../utils/Utils.js";
import { BlendMode } from "../data/BlendMode.js";
import { Framebuffer } from "../data/texture/Framebuffer.js";
import { BaseRenderer } from "./BaseRenderer.js";

export class FilterRenderer extends BaseRenderer {
  constructor(options) {
    options = options || {};
    options.config = Utils.initRendererConfig(options.config);
    options.config.locations = options.config.locations.concat([
      "uFTex",
      "uFtrT",
      "uFtrV",
      "uFtrK"
    ]);

    super(options);

    this._attachFramebufferCustom = emptyFunction;

    this.filters = options.filters || [];
    this.texture = options.texture;

    this._framebuffers = [
      new Framebuffer(),
      new Framebuffer()
    ];
  }

  _render(framebuffer) {
    const context = this.context;
    const gl = this._gl;
    const renderTime = this._renderTime;
    const locations = this._locations;

    context.setBlendMode(BlendMode.NORMAL);

    this._uploadBuffers();

    context.useTextureAt(this.texture, 0, renderTime, true);
    gl.uniform1i(locations.uTex, 0);

    const l = this.filters.length || 1;
    const minL = l - 2;

    for (let i = 0; i < l; ++i) {
      let filterFramebuffer;

      const filter = this.filters[i];
      const useFilter = filter && filter.on;

      const isLast = i > minL;

      const filterTexture = useFilter &&
        filter.textureProps &&
        filter.textureProps.texture;
      if (filterTexture) {
        context.useTextureAt(filterTexture, 1, renderTime, true);
        gl.uniform1i(locations.uFTex, 1);
      }

      if (isLast)
        framebuffer
          ? this._attachFramebuffer(framebuffer)
          : gl.uniform1f(locations.uFlpY, 1);
      else if (useFilter) {
        filterFramebuffer = this._framebuffers[i & 1];
        this._attachFramebuffer(filterFramebuffer);
      }

      if (useFilter) {
        gl.uniform1fv(locations.uFtrV, filter.v);
        gl.uniformMatrix4fv(locations.uFtrK, false, filter.kernels);
        gl.uniform2i(locations.uFtrT, filter.TYPE, filter.SUB_TYPE);
      }

      (useFilter || isLast) && this._drawInstanced(1);

      filterTexture && context.deactivateTexture(filterTexture);

      if (filterFramebuffer) {
        filterFramebuffer.unbind(gl);
        context.useTextureAt(filterFramebuffer, 0, renderTime, true);
      }
    }
  }

  _createVertexShader(options) {
    return Utils.createVersion(options.config.precision) +
    "in vec2 aPos;" +

    "uniform float uFlpY;" +

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

  _createFragmentShader(options) {
    return Utils.createVersion(options.config.precision) +
    "uniform sampler2D " +
      "uTex," +
      "uFTex;" +
    "uniform ivec2 uFtrT;" +
    "uniform float uFtrV[9];" +
    "uniform mat4 uFtrK;" +

    "in vec2 " +
      "vUv," +
      "vTUv;" +

    "out vec4 oCl;" +

    "void main(void){" +
      "oCl=texture(uTex,vTUv);" +
      // FILTERS
      "if(uFtrT.x>0){" +
        "float[] vl=uFtrV;" +
        "float v=vl[0];" +

        "vec2 " +
          "oPx=1./vec2(textureSize(uTex,0))," +
          "vol=v*oPx;" +
        /*
          CONVOLUTE FILTERS:
            - SharpenFilter
            - EdgeDetectFilter
        */
        "if(uFtrT.x<2){" +
          "mat4 kr=uFtrK*v;" +
          "oCl=vec4((" +
            "texture(uTex,vTUv-oPx)*kr[0].x+" +
            "texture(uTex,vTUv+oPx*vec2(0,-1))*kr[0].y+" +
            "texture(uTex,vTUv+oPx*vec2(1,-1))*kr[0].z+" +
            "texture(uTex,vTUv+oPx*vec2(-1,0))*kr[0].w+" +
            "oCl*kr[1].x+" +
            "texture(uTex,vTUv+oPx*vec2(1,0))*kr[1].y+" +
            "texture(uTex,vTUv+oPx*vec2(-1,1))*kr[1].z+" +
            "texture(uTex,vTUv+oPx*vec2(0,1))*kr[1].w+" +
            "texture(uTex,vTUv+oPx)*kr[2].x" +
          ").rgb,oCl.a);" +
        /*
          COLORMATRIX FILTERS:
            - Saturate
        */
        "}else if(uFtrT.x<3){" +
          "mat4 kr=uFtrK;" +
          "oCl.rgb=vec3(" +
            "kr[0].r*oCl.r+kr[0].g*oCl.g+kr[0].b*oCl.b+kr[0].a," +
            "kr[1].r*oCl.r+kr[1].g*oCl.g+kr[1].b*oCl.b+kr[1].a," +
            "kr[2].r*oCl.r+kr[2].g*oCl.g+kr[2].b*oCl.b+kr[2].a" +
          ");" +
        // COLOR MANIPULATION FILTERS
        "}else if(uFtrT.x<4){"+
          "vec4 oClVl=oCl*(1.-v);" +
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
            "oCl.rgb*=vec3(vl[2],vl[3],vl[4])*v;" +
          // ColorLimitFilter
          "else if(uFtrT.y<6)" +
            "oCl=vec4((round((oCl.rgb*256.)/v)/256.)*v,oCl.a);" +
          // VignetteFilter
          "else if(uFtrT.y<7){" +
            "vec2 pv=pow(abs(vUv*v),vec2(vl[1]));" +
            "float cv=clamp((1.-length(pv))*vl[5],0.,1.);" +
            "oCl.rgb=oCl.rgb*cv+vec3(vl[2],vl[3],vl[4])*(1.-cv);" +
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
          "vec2 wh=oPx*vec2(v,vl[1]);" +

          "vec4 " +
            "cl," +
            "tCl;" +

          "float " +
            "c," +
            "i," +
            "j," +
            "m," +
            "im;" +

          "for(i=-2.;i<3.;++i){" +
            "for(j=-2.;j<3.;++j){" +
              "m=abs(i)+abs(j);" +
              "im=1.-(m*.25);" +
              "tCl=i==0.&&j==0." +
                "?oCl" +
                ":texture(uTex,vTUv+(wh*vec2(i,j)));" +
              "cl+=tCl*im;" +
              "c+=im;" +
            "}" +
          "}" +

          "oCl=uFtrT.y<2" +
            // BlurFilter
            "?cl/c" +
            // GlowFilter
            ":max(oCl,cl/c);" +
        "}" +
        // PixelateFilter
        "else if(uFtrT.x<6)" +
          "oCl=texture(uTex,floor(vTUv/vol)*vol);" +
        // DisplacementFilter
        "else if(uFtrT.x<7){" +
          "vec2 dspMd=vec2(1,-1)*(texture(" +
            "uFTex," +
            "mod(vec2(vl[1],vl[2])+vTUv,1.)*vec2(vl[5]-vl[3],vl[6]-vl[4])" +
          ").rg-.5)*2.*vol;" +
          "oCl=texture(uTex,vTUv+dspMd);" +
        "}" +
        // MaskFilter
        "else if(uFtrT.x<8){" +
          "vec4 mskCl=texture(uFTex," +
            "mod(vec2(vl[1],vl[2])+vTUv,1.)*vec2(vl[5]-vl[3],vl[6]-vl[4])" +
          ");" +
          "oCl.a*=v<4." +
            "?mskCl[int(v)]" +
            ":(mskCl.r+mskCl.g+mskCl.b+mskCl.a)/4.;" +
        "}" +
      "}" +
    "}";
  }
}
