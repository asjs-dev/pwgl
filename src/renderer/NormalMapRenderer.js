import { Utils } from "../utils/Utils.js";
import { BlendMode } from "../data/BlendMode.js";
import { BaseRenderer } from "./BaseRenderer.js";

export class NormalMapRenderer extends BaseRenderer {
  constructor(options) {
    options = options || {};
    options.config = Utils.initRendererConfig(options.config);

    super(options);

    this.clearBeforeRender = true;
    this.clearColor.set(0, 0, 0, 1);

    this.heightMap = options.heightMap;
  }

  _render() {
    this.context.setBlendMode(BlendMode.NORMAL);

    this._gl.uniform1i(
      this._locations.uTex,
      this.context.useTexture(this.heightMap, this._renderTime, true)
    );

    this._uploadBuffers();

    this._drawInstanced(1);
  }

  _createVertexShader(options) {
    return Utils.createVersion(options.config.precision) +
    "in vec2 " +
      "aPos;" +

    "uniform float " +
      "uFlpY;" +

    "out vec2 " +
      "vTUv;" +

    "void main(void){" +
      "gl_Position=vec4(aPos*2.-1.,1,1);" +
      "vTUv=vec2(aPos.x,1.-aPos.y);" +
      "gl_Position.y*=uFlpY;" +
    "}";
  }

  _createFragmentShader(options) {
    return Utils.createVersion(options.config.precision) +
    "#define H 256.\n" +

    "in vec2 " +
      "vTUv;" +

    "uniform sampler2D " +
      "uTex;" +

    "out vec4 oCl;" +

    "void main(void){" +
      "vec2 ts=vec2(textureSize(uTex,0));" +
      "vec4 tc=texture(uTex,vTUv);" +
      "float ph=tc.g*H;" +
      "vec2 tUv=vTUv*ts;" +
      "vec3 sf=vec3(tUv,ph);" +
      "vec2 " +
        "ppa=tUv+vec2(0,1)," +
        "ppb=tUv+vec2(1,0);" +
      "oCl=vec4((normalize(" +
        "cross(" +
          "sf-vec3(ppa,texture(uTex,ppa/ts).g*H)," +
          "vec3(ppb,texture(uTex,ppb/ts).g*H)-sf" +
        ")" +
      ")+1.)/2.,1);" +
    "}";
  }
}
