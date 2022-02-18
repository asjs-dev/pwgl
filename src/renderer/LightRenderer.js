import { Utils } from "../utils/Utils.js";
import { Buffer } from "../utils/Buffer.js";
import { BlendMode } from "../data/BlendMode.js";
import { Light } from "../display/Light.js";
import { BatchRenderer } from "./BatchRenderer.js";

export class LightRenderer extends BatchRenderer {
  constructor(options) {
    options = options || {};
    options.config = Utils.initRendererConfig(options.config);
    options.config.locations = options.config.locations.concat([
      "aExt",
      "uS",
      "uSC"
    ]);
    const maxBatchItems = options.maxBatchItems = options.lightNum || 1;

    super(options);

    this.clearBeforeRender = true;
    this.clearColor.set(0, 0, 0, 1);

    this.heightMap = options.heightMap;

    this._extensionBuffer = new Buffer(
      "aExt", maxBatchItems,
      4, 4
    );

    this._lights = [];
    for (let i = 0; i < maxBatchItems; ++i)
      this._lights.push(
        new Light(
          i,
          this._matrixBuffer.data,
          this._extensionBuffer.data
        )
      );
  }

  getLight(id) {
    return this._lights[id];
  }

  _render() {
    this.context.setBlendMode(BlendMode.ADD);

    this.heightMap && this._gl.uniform1i(
      this._locations.uTex,
      this.context.useTexture(this.heightMap, this._renderTime, true)
    );

    this._gl.uniform1f(this._locations.uSC, this._calcScale);

    this._uploadBuffers();

    this._drawInstanced(this._lights.length);
  }

  _customResize() {
    super._customResize();

    const dpr = window.devicePixelRatio;
    this._calcScale = this._scale / dpr;
    const calcWidth = this._calcWidth / dpr;
    const calcHeight = this._calcHeight / dpr;

    this._gl.uniform4f(
      this._locations.uS,
      calcWidth, calcHeight,
      1 / calcWidth, 1 / calcHeight
    );
  }

  _uploadBuffers() {
    this._extensionBuffer.upload(
      this._gl,
      this._enableBuffers,
      this._locations
    );
    super._uploadBuffers();
  }

  _createBuffers() {
    super._createBuffers();
    this._extensionBuffer.create(this._gl);
  }

  _createVertexShader(options) {
    return Utils.createVersion(options.config.precision) +
    "#define H vec4(1,-1,2,-2)\n" +
    "#define PI radians(180.)\n" +

    "in vec2 aPos;" +
    "in mat4 " +
      "aExt," +
      "aMt;" +

    "uniform float " +
      "uFlpY," +
      "uSC;" +

    "out float " +
      "vHS," +
      "vD," +
      "vSpt," +
      "vSC;" +
    "out vec2 " +
      "vTUv," +
      "vSln;" +
    "out vec4 " +
      "vUv," +
      "vCl," +
      "vDt;" +
    "out mat4 vExt;" +

    "void main(void){" +
      "vExt=aExt;" +
      "vCl=aMt[2];" +
      "vDt=aMt[3];" +

      "vSC=uSC;" +
      "vec3 pos=vec3(aPos*2.-1.,1);" +

      "vUv.xy=pos.xy*vSC;" +
      "vHS=vExt[0].z*vSC;" +

      "mat3 mt=mat3(aMt[0].xy,0,aMt[0].zw,0,aMt[1].xy,1);" +
      "vExt[0].w*=vSC;" +
      "vDt.y*=vSC;" +
      "vD=aMt[1].z*vSC;" +
      "if(vExt[0].x<1.){" +
        "gl_Position=vec4(mt*pos,1);" +
        "vTUv=(gl_Position.xy+H.xy)/H.zw;" +
        "vUv.zw=(aMt[1].xy+H.xy)/H.zw;" +
        "vSpt=PI-aMt[1].w;" +
        "vSln=vec2(sin(vDt.w),cos(vDt.w));" +
      "}else{" +
        "mt[2].xy=vec2(-1,1);" +
        "gl_Position=vec4(pos,1);" +
        "vTUv=vec2(aPos.x,1.-aPos.y);" +
        "vUv.zw=vTUv+((mt*vec3(1)).xy+H.xy)/H.zw;" +
      "}" +
      "gl_Position.y*=uFlpY;" +
      "vSC*=255.;" +
    "}";
  }

  _createFragmentShader(options) {
    return Utils.createVersion(options.config.precision) +
    "#define PI radians(180.)\n" +
    "#define PIH radians(90.)\n" +

    "in float " +
      "vHS," +
      "vD," +
      "vSpt," +
      "vSC;" +
    "in vec2 " +
      "vTUv," +
      "vSln;" +
    "in vec4 " +
      "vUv," +
      "vCl," +
      "vDt;" +
    "in mat4 vExt;" +

    "uniform sampler2D uTex;" +
    "uniform vec4 uS;" +

    "out vec4 oCl;" +

    "void main(void){" +
      "if(vDt.x>0.){" +
        "bool isl=vExt[0].x<1.;" +

        "vec4 tc=texture(uTex,vTUv);" +

        "float " +
          "ph=tc.g*vSC," +
          "shn=1.+tc.b;" +

        "vec2 " +
          "tUv=vTUv*uS.xy," +
          "tCnt=vUv.zw*uS.xy;" +

        "vec3 " +
          "sf=vec3(tUv,ph)," +
          "lp=vec3(tCnt,vHS);" +

        "float " +
          "dst=distance(lp,sf)/vD," +
          "vol=vDt.z*vCl.a;" +

        "if(isl){" +
          "vol*=1.-dst;" +
          "if(dst>=1.)discard;" +
        "}" +

        "if(vol>0.){" +
          "if(isl&&vSpt>0.&&vSpt<PI){" +
            "float slh=(vHS-ph)/vSC;" +
            "vec2 sl=vec2(" +
              "slh*vSln.y-vUv.x*vSln.x," +
              "slh*vSln.x+vUv.x*vSln.y" +
            ");" +

            "if((" +
              "atan(" +
                "sl.x," +
                "length(vec2(sl.y,vUv.y))" +
              ")+PIH" +
            ")-vSpt<0.)discard;" +
          "}" +

          "int flg=int(vExt[0].y);" +

          "float fltDst=distance(tCnt,tUv);" +

          "vec2 opd=(tUv-tCnt)/fltDst;" +

          "float opdL=length(opd);" +

          "if((flg&2)>0&&vol>0.){" +
            "vec2 " +
              "ppa=tUv-vec2(0,1)," +
              "ppb=tUv-vec2(1,0);" +

            "vec3 " +
              "nm=normalize(" +
                "cross(" +
                  "sf-vec3(ppa,texture(uTex,ppa*uS.zw).g*vSC)," +
                  "vec3(ppb,texture(uTex,ppb*uS.zw).g*vSC)-sf" +
                ")" +
              ")," +
              "sftl=normalize(lp-sf);" +

            "vol*=pow(" +
              "dot(nm,sftl)*" +
              "dot(" +
                "nm," +
                "normalize(" +
                  "sftl+normalize(vec3(tUv,vSC)-sf)" +
                ")" +
              ")," +
              "shn" +
            ");" +
          "}" +

          "if((flg&1)>0&&vol>0.){" +
            "float " +
              "shl=vD/vDt.y," +
              "st=max(ceil(fltDst/vExt[1].x),vExt[0].w)," +
              "hst=(ph-vHS)/fltDst," +
              "l=fltDst-2.*st," +
              "i," +
              "pc;" +

            "vec2 p;" +

            "for(i=l;i>st;i-=st){" +
              "p=tCnt+i*opd;" +
              "pc=vHS+i*hst;" +
              "tc=texture(uTex,p*uS.zw)*vSC;" +
              "if(tc.r<=pc&&tc.g>=pc){" +
                "vol*=clamp((fltDst-i*opdL)/shl,0.,1.);" +
                "break;" +
              "}" +
            "}" +
          "}" +
        "}" +

        "oCl=vec4(vCl.rgb*vol,1);" +

      "}" +
    "}";
  }
}
