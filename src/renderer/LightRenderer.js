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
      "uNMTex",
      "uSITex",
      "aExt",
      "uTS",
      "uUSIT"
    ]);
    const maxBatchItems = options.maxBatchItems = options.lightNum || 1;

    super(options);

    this.clearBeforeRender = true;
    this.clearColor.set(0, 0, 0, 1);

    this.sourceImage = options.sourceImage;
    this.normalMap = options.normalMap;
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

  _useTexture(sourceTexture, location) {
    this._gl.uniform1i(
      location,
      this.context.useTexture(sourceTexture, this._renderTime, true)
    );
  }

  _render() {
    this.context.setBlendMode(BlendMode.ADD);

    let width = this.width;
    let height = this.height;

    if (this.sourceImage) {
      this._useTexture(this.sourceImage, this._locations.uSITex);
      this._gl.uniform1f(this._locations.uUSIT, 1);
    } else this._gl.uniform1f(this._locations.uUSIT, 0);

    this.normalMap && this._useTexture(this.normalMap, this._locations.uNMTex);

    if (this.heightMap) {
      this._useTexture(this.heightMap, this._locations.uTex);

      width = this.heightMap.width;
      height = this.heightMap.height;
    }

    this._gl.uniform2f(this._locations.uTS, width, height);

    this._uploadBuffers();

    this._drawInstanced(this._lights.length);
  }

  _uploadBuffers() {
    this._extensionBuffer.upload(this._gl, this._enableBuffers);
    super._uploadBuffers();
  }

  _createBuffers() {
    super._createBuffers();
    this._extensionBuffer.create(this._gl, this._locations);
  }

  _createVertexShader(options) {
    return Utils.createVersion(options.config.precision) +
    "#define H vec4(1,-1,2,-2)\n" +
    "#define PI radians(180.)\n" +

    "in vec2 " +
      "aPos;" +
    "in mat4 " +
      "aExt," +
      "aMt;" +

    "uniform float " +
      "uFlpY;" +

    "out float " +
      "vHS," +
      "vD," +
      "vSpt;" +
    "out vec2 " +
      "vTUv," +
      "vSln;" +
    "out vec4 " +
      "vUv," +
      "vCl," +
      "vDt;" +
    "out mat4 " +
      "vExt;" +

    "void main(void){" +
      "vec3 pos=vec3(aPos*2.-1.,1);" +

      "vExt=aExt;" +
      "vCl=aMt[2];" +
      "vDt=aMt[3];" +

      "vUv.xy=pos.xy;" +
      "vHS=vExt[0].z;" +

      "mat3 mt=mat3(aMt[0].xy,0,aMt[0].zw,0,aMt[1].xy,1);" +
      "vD=aMt[1].z;" +

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
    "}";
  }

  _createFragmentShader(options) {
    return Utils.createVersion(options.config.precision) +
    "#define H 256.\n" +
    "#define PI radians(180.)\n" +
    "#define PIH radians(90.)\n" +

    "in float " +
      "vHS," +
      "vD," +
      "vSpt;" +
    "in vec2 " +
      "vTUv," +
      "vSln;" +
    "in vec4 " +
      "vUv," +
      "vCl," +
      "vDt;" +
    "in mat4 " +
      "vExt;" +

    "uniform sampler2D " +
      "uNMTex," +
      "uSITex," +
      "uTex;" +
    "uniform float " +
      "uUSIT;" +
    "uniform vec2 " +
      "uTS;" +

    "out vec4 " +
      "oCl;" +

    "void main(void){" +
      "oCl=vec4(0);" +
      "if(vDt.x>0.){" +
        "bool " +
          "isl=vExt[0].x<1.;" +

        "vec4 " +
          "tc=texture(uTex,vTUv);" +

        "float " +
          "ph=tc.g*H," +
          "shn=tc.b;" +

        "vec2 " +
          "tUv=vTUv*uTS," +
          "tCnt=vUv.zw*uTS;" +

        "vec3 " +
          "sf=vec3(tUv,ph)," +
          "lp=vec3(tCnt,vHS)," +
          "sftla=lp-sf;" +

        "float " +
          "dst=1.-length(sftla)/vD," +
          "vol=vDt.z*vCl.a," +
          "spc=0.;" +

        "if(isl){" +
          "vol*=dst;" +
          "if(vol<=0.)discard;" +

          "float " +
            "slh=(vHS-ph)/H;" +

          "vec2 " +
            "sl=vec2(" +
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

        "int " +
          "flg=int(vExt[0].y);" +

        "float " +
          "fltDst=distance(tCnt,tUv)," +
          "shdw=1.;" +

        "if((flg&2)>0){" +
          "vec3 " +
            "nm=normalize((texture(uNMTex,vTUv).rgb*2.-1.)*vec3(1,-1,1))," +
            "sftl=normalize(sftla)," +
            "sftv=normalize(vec3(" +
              "(flg&16)>0" +
                "?uTS*.5" +
                ":tUv," +
              "H" +
            ")-sf)," +
            "hlf=normalize(sftl+sftv);" +

          "vol*=dot(nm,sftl);" +
          "if(vol<=0.)discard;" +
          "if(isl)" +
            "spc=pow(dot(nm,hlf),shn+H)*vExt[1].y;" +
        "}" +

        "if((flg&1)>0){" +
          "vec2 " +
            "p," +
            "opd=(tUv-tCnt)/fltDst," +
            "opdm=opd/uTS;" +

          "float " +
            "shl=vD/vDt.y," +
            "st=ceil(max(1.,max(fltDst/vExt[1].x,vExt[0].w)))," +
            "hst=(ph-vHS)/fltDst," +
            "l=fltDst-st," +
            "m=max(st,l-shl)," +
            "i," +
            "pc," +
            "opdL=length(opd);" +

          "for(i=l;i>m;i-=st){" +
            "p=vUv.zw+i*opdm;" +
            "tc=texture(uTex,p)*H;" +

            "if((flg&4)>0&&tc.g>=vHS)discard;" +

            "pc=vHS+i*hst;" +
            "if(tc.r<=pc&&tc.g>=pc){" +
              "shdw*=(fltDst-i*opdL)/shl;" +
              "if(shdw<=0.)discard;" +
            "}" +
          "}" +
        "}" +

        "vec3 " +
          "stCl=uUSIT<1.?vec3(1):texture(uSITex,vTUv).rgb," +
          "rCl=(flg&8)>0?vCl.rgb:vec3(1);" +
        "oCl=vec4((stCl*vCl.rgb+rCl*spc)*shdw*vol,1);" +
      "}" +
    "}";
  }
}
