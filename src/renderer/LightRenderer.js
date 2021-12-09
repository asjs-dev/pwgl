import { Utils } from "../utils/Utils.js";
import { Buffer } from "../utils/Buffer.js";
import { BlendMode } from "../data/BlendMode.js";
import { Light } from "../display/Light.js";
import { BatchRenderer } from "./BatchRenderer.js";

export class LightRenderer extends BatchRenderer {
  constructor(options) {
    options = options || {};
    options.config = Utils.initRendererConfig(
      options.config,
      LightRenderer
    );
    options.config.locations = options.config.locations.concat([
      "aExt",
      "uS",
      "uSC"
    ]);
    const maxBatchItems = options.maxBatchItems = options.lightNum || 1;

    super(options);

    this.heightMap = options.heightMap;

    this.scale = options.scale || 1;

    this._extensionBuffer = new Buffer(
      "aExt", maxBatchItems,
      1, 4
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
    this._context.setBlendMode(BlendMode.ADD);

    this.heightMap && this._gl.uniform1i(
      this._locations.uTex,
      this._context.useTexture(this.heightMap, this._renderTime, true)
    );

    this._gl.uniform1f(this._locations.uSC, this.scale);

    this._uploadBuffers();

    this._drawInstanced(this._lights.length);
  }

  _customResize() {
    this._gl.uniform4f(
      this._locations.uS,
      this._width,
      this._height,
      1 / this._width,
      1 / this._height
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
    "in vec4 aExt;" +
    "in mat4 aMt;" +

    "uniform float " +
      "uFlpY," +
      "uSC;" +

    "out float " +
      "vHS," +
      "vD," +
      "vSpt," +
      "vSC;" +
    "out vec2 " +
      "vTCrd," +
      "vSln;" +
    "out vec4 " +
      "vCrd," +
      "vCl," +
      "vDt," +
      "vExt;" +

    "void main(void){" +
      "vExt=aExt;" +
      "vCl=aMt[2];" +
      "vDt=aMt[3];" +

      "vSC=uSC;" +
      "vec3 pos=vec3(aPos*2.-1.,1);" +

      "vCrd.xy=pos.xy*vSC;" +
      "vHS=vExt.z*vSC;" +

      "mat3 mt=mat3(aMt[0].xy,0,aMt[0].zw,0,aMt[1].xy,1);" +
      "vExt.w*=vSC;" +
      "vDt.y*=vSC;" +
      "vD=aMt[1].z*vSC;" +
      "if(vExt.x<1.){" +
        "gl_Position=vec4(mt*pos,1);" +
        "vTCrd=(gl_Position.xy+H.xy)/H.zw;" +
        "vCrd.zw=(aMt[1].xy+H.xy)/H.zw;" +
        "vSpt=PI-aMt[1].w;" +
        "vSln=vec2(sin(vDt.w),cos(vDt.w));" +
      "}else{" +
        "mt[2].xy=vec2(-1,1);" +
        "gl_Position=vec4(pos,1);" +
        "vTCrd=vec2(aPos.x,1.-aPos.y);" +
        "vCrd.zw=vTCrd+((mt*vec3(1)).xy+H.xy)/H.zw;" +
      "}" +
      "gl_Position.y*=uFlpY;" +
      "vSC*=100.;" +
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
      "vTCrd," +
      "vSln;" +
    "in vec4 " +
      "vCrd," +
      "vCl," +
      "vDt," +
      "vExt;" +

    "uniform sampler2D uTex;" +
    "uniform vec4 uS;" +

    "out vec4 oCl;" +

    "void main(void){" +
      "if(vDt.x>0.){" +
        "bool isl=vExt.x<1.;" +

        "vec4 tc=texture(uTex,vTCrd);" +

        "vec2 " +
          "tCrd=vTCrd*uS.xy," +
          "tCnt=vCrd.zw*uS.xy;" +

        "float " +
          "alp=tc.a," +
          "shn=1.+tc.b," +
          "ph=tc.g*vSC," +
          "pxDst=distance(vec3(tCnt,vHS),vec3(tCrd,ph))," +
          "dst=pxDst/vD," +
          "vol=1.-(" +
            "isl" +
              "?dst" +
              ":0." +
          ");" +

        "if(!isl||dst<1.){" +
          "float shl=vD/vDt.y;" +

          "if(isl&&vSpt>0.&&vSpt<PI){" +
            "float slh=(vHS-ph)/100.;" +
            "vec2 sl=vec2(slh*vSln.y-vCrd.x*vSln.x,slh*vSln.x+vCrd.x*vSln.y);" +

            //"if(atan(sl.x,length(vec2(sl.y,vCrd.y)))+PIH<vSpt)vol=0.;" +

            "vol*=(atan(sl.x,length(vec2(sl.y,vCrd.y)))+PIH)-vSpt;" +
          "}" +

          "int flg=int(vExt.y);" +

          "float " +
            "fltDst=distance(tCnt,tCrd)," +
            "mh=ph-vHS," +
            "pc;" +

          "vec2 " +
            "dsth=vec2(tCrd.x-tCnt.x,tCrd.y-tCnt.y)/fltDst," +
            "p;" +

          "float dsthL=length(dsth);" +

          "if((flg&2)>0&&alp>0.&&vol>0.){" +
            "p=tCrd-dsth;" +

            "float pl=fltDst-dsthL;" +

            "pc=vHS+(pl/fltDst)*mh;" +

            "tc=texture(uTex,p*uS.zw);" +

            "float " +
              "h=tc.g*vSC," +
              "mtp=clamp(0.,1.,pc-h);" +

            "shn+=1.-mtp;" +

            "vol*=((atan(vHS-h,pl)+atan(ph-h,dsthL))/PI)+mtp;" +
          "}" +

          "vol*=shn;" +

          "if((flg&1)>0&&vol>0.){" +
            "float " +
              "st=max(ceil(fltDst/128.),vExt.w)," +
              "hst=mh/fltDst," +
              "l=fltDst-2.*st," +
              "s=max(0.,l-shl)+st;" +

            "for(float i=l;i>s;i-=st){" +
              "p=tCnt+i*dsth;" +
              "pc=vHS+i*hst;" +
              "tc=texture(uTex,p*uS.zw);" +
              "tc.rg*=vSC;" +
              "if(tc.r<=pc&&tc.g>=pc){" +
                "vol*=clamp(0.,1.,distance(tCrd,p)/shl);" +
                "break;" +
              "}" +
            "}" +
          "}" +
        "}" +

        "oCl=vec4(vCl.rgb*vol*vDt.z*vCl.a,1);" +
      "}" +
    "}";
  }
}
