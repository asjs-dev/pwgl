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

    this._filters = options.filters || [];
    this.sourceTexture = options.sourceTexture;

    this._framebuffers = [new Framebuffer(), new Framebuffer()];
  }

  get filters() {
    return this._filters;
  }

  set filters(v) {
    this._filters = v;
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
        gl.uniform1fv(locations.uFtrV, filter.v);
        gl.uniformMatrix4fv(locations.uFtrK, false, filter.kernels);
        gl.uniform2i(locations.uFtrT, filter.TYPE, filter.SUB_TYPE);
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
    return `` +
    `in vec2 ` +
      `aPos;` +

    `uniform float ` +
      `uFlpY;` +
    `uniform sampler2D ` +
      `uTex;` +

    `out vec2 ` +
      `vTs,` +
      `vUv,` +
      `vTUv;` +

    `void main(void){` +
      `gl_Position=vec4(aPos*2.-1.,1,1);` +
      `vUv=gl_Position.xy;` +
      `gl_Position.y*=uFlpY;` +
      `vTUv=vec2(aPos.x,1.-aPos.y);` +
      `vTs=vec2(textureSize(uTex,0));` +
    `}`;
  }

  // prettier-ignore
  /**
   * @returns {string}
   * @ignore
   */
  $createFragmentShader() {
    const blurFunc = (core) =>
      `for(int i=0;i<int(l);i++){` +
        `clg=texelFetch(uTex,clamp(` + 
          `f+ivec2(floor(dr)),` + 
          `mn,mx` +
        `),0);` +
        `dr=mat2(r.x,-r.y,r.y,r.x)*dr;` +
        core +
      `}`;

    return `` +
    Utils.GLSL.DEFINE.Z +
    Utils.GLSL.DEFINE.RADIAN_360 +
    
    `in vec2 ` +
      `vTs,` +
      `vUv,` +
      `vTUv;` +

    `uniform sampler2D ` +
      `uTex,` +
      `uFTex;` +
    `uniform ivec2 ` +
      `uFtrT;` +
    `uniform float ` +
      `uFtrV[9];` +
    `uniform mat4 ` +
      `uFtrK;` +

    `out vec4 ` +
      `oCl;` +

    Utils.GLSL.RANDOM +
    
    `float gtGS(vec4 cl){` + 
      `return .3*oCl.r+.59*oCl.g+.11*oCl.b;` +
    `}` +

    `void main(void){` +
      `oCl=texture(uTex,vTUv);` +

      `float ` +
        `vl[]=uFtrV,` +
        `v=vl[0];` +

      `ivec2 ` +
        `f=ivec2(floor(vTUv*vTs));` +

      `vec2 ` +
        `vol=v/vTs;` +

      `vec3 ` +
        `rgb=vec3(vl[2],vl[3],vl[4]);` +

      `mat4 ` +
        `kr=uFtrK;` +
      /*
        CONVOLUTE FILTERS:
          - SharpenFilter
          - EdgeDetectFilter
      */
      `if(uFtrT.x<2){` +
        `kr*=v;` +
        `oCl.rgb=(oCl.rgb*(1.-vl[1]))+(` +
          `texelFetch(uTex,f-ivec2(1),0)*kr[0].x+` +
          `texelFetch(uTex,f+ivec2(0,-1),0)*kr[0].y+` +
          `texelFetch(uTex,f+ivec2(1,-1),0)*kr[0].z+` +
          `texelFetch(uTex,f+ivec2(-1,0),0)*kr[0].w+` +
          `oCl*kr[1].x+` +
          `texelFetch(uTex,f+ivec2(1,0),0)*kr[1].y+` +
          `texelFetch(uTex,f+ivec2(-1,1),0)*kr[1].z+` +
          `texelFetch(uTex,f+ivec2(0,1),0)*kr[1].w+` +
          `texelFetch(uTex,f+ivec2(1),0)*kr[2].x` +
        `).rgb*vl[1];` +
      /*
        COLORMATRIX FILTERS:
          - Saturate
      */
      `}else if(uFtrT.x<3)` +
        `oCl.rgb=(oCl.rgb*(1.-vl[1]))+vec3(` +
          `kr[0].r*oCl.r+kr[0].g*oCl.g+kr[0].b*oCl.b,` +
          `kr[1].r*oCl.r+kr[1].g*oCl.g+kr[1].b*oCl.b,` +
          `kr[2].r*oCl.r+kr[2].g*oCl.g+kr[2].b*oCl.b` +
        `);` +
      // COLOR MANIPULATION FILTERS
      `else if(uFtrT.x<4){`+
        `vec4 ` +
          `oClVl=oCl*(1.-v);` +
        // GrayscaleFilter
        `if(uFtrT.y<2)` +
          `oCl=oClVl+vec4(vec3(gtGS(oCl)),oCl.a)*v;` +
        // SepiaFilter
        `else if(uFtrT.y<3)` +
          `oCl=oClVl+` +
            `vec4(vec3(.874,.514,.156)*gtGS(oCl),oCl.a)*v;` +
        // InvertFilter
        `else if(uFtrT.y<4)` +
          `oCl=oClVl+vec4(1.-oCl.rgb,oCl.a)*v;` +
        // TintFilter
        `else if(uFtrT.y<5)` +
          `oCl.rgb*=rgb*v;` +
        // ColorLimitFilter
        `else if(uFtrT.y<6)` +
          `oCl.rgb=(round((oCl.rgb*255.)/v)/255.)*v;` +
        // VignetteFilter
        `else if(uFtrT.y<7){` +
          `vec2 ` +
            `pv=pow(abs(vUv*v),vec2(vl[1]));` +
          
          `float ` +
            `cv=clamp((1.-length(pv))*vl[5],0.,1.);` +

          `oCl.rgb=oCl.rgb*cv+rgb*(1.-cv);` +
        `}` +
        // RainbowFilter
        `else if(uFtrT.y<8)` +
          `oCl.rgb+=vec3(vUv.xy*.15,(vUv.x*vUv.y)*.15)*v;` +
        // BrightnessContrastFilter
        `else if(uFtrT.y<9)` +
          `oCl.rgb=(vl[1]+1.)*oCl.rgb*v-.5*vl[1];`+
        // GammaFilter
        `else if(uFtrT.y<10)` +
          `oCl.rgb=pow(oCl.rgb,vec3(1./v));` +
      `}` +
      // SAMPLING FILTERS
      `else if(uFtrT.x<5){` +
        `float ` + 
          `rd=rand(vTUv*100.+50.),` +
          `rad=radians(rd*360.),` +
          `cnt=1.,` +
          `l=3.+ceil(3.*rd),` +
          `t=RADIAN_360/l;` +

        `vec2 ` +
          `wh=vec2(v,vl[1]),` +
          `dr=wh*Z.xy*vec2(sin(rad),cos(rad))*(.5+rd*.5),` +
          `r=vec2(cos(t),sin(t));` +

        `vec4 ` +
          `clg,` +
          `cl=oCl;` +

        `ivec2 ` +
          `mn=ivec2(Z.xx),` + 
          `mx=ivec2(vTs)-1;` + 

        // BlurFilter
        `if(uFtrT.y<2){` +
          blurFunc(
            `cl+=clg;` +
            `cnt++;`
          ) + 

          `cl/=cnt;` +

        // GlowFilter
        `}else{` +
          `float ` +
            `omx=max(oCl.r,max(oCl.g,oCl.b));` +

          `cl=vec4(0);` +

          blurFunc(
            `if(max(clg.r,max(clg.g,clg.b))>omx){` +
              `cl+=clg;` +
              `cnt++;` +
            `}`
          ) +

          `cl=(oCl+cl)/cnt;` +

        `}` +

        `float ` +
          `dst=vl[2]<1.` +
            `?1.` +
            `:clamp(distance(vec2(vl[3],vl[4]),vTUv)*vl[5],0.,1.);` +

        `oCl=dst*cl+(1.-dst)*oCl;` +
      `}` +
      // PixelateFilter
      `else if(uFtrT.x<6)` +
        `oCl=texture(uTex,floor(vTUv/vol)*vol);` +
      // DisplacementFilter
      `else if(uFtrT.x<8){` +
        `vec4 ` +
          `mskCl=texture(` +
            `uFTex,` +
            `mod(vec2(vl[1],vl[2])+vTUv,1.)*vec2(vl[5]-vl[3],vl[6]-vl[4])` +
          `);` +
        `if(uFtrT.x<7)` +
          `oCl=texture(uTex,vTUv+(Z.yz*(mskCl.rg-.5)*2.*vol));` +
        // MaskFilter
        `else if(uFtrT.x<8)` +
          `oCl.a*=v<4.` +
            `?mskCl[int(v)]` +
            `:(mskCl.r+mskCl.g+mskCl.b+mskCl.a)/4.;` +
      // ChromaticAberrationFilter
      `}else if(uFtrT.x<9){` +
        `vec4 ` +
          `pcl=vec4(` +
            `texture(uFTex,vTUv-vec2(vol.x,0)).r,` +
            `oCl.g,` +
            `texture(uFTex,vTUv+vec2(vol.x,0)).b,` +
            `1` +
          `);` +

        `float ` +
          `dst=vl[2]<1.` +
            `?1.` +
            `:clamp(distance(vec2(vl[3],vl[4]),vTUv),0.,1.),` +
          `mA=vl[5]==0.?dst:1.-dst,` +
          `mB=1.-mA;` +

        `oCl=mA*pcl+mB*oCl;` +
      `}` +
    `}`;
  }
}
