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
    "in vec2 " +
      "vTUv;" +

    "uniform sampler2D " +
      "uTex;" +

    "out vec4 " +
      "oCl;" +

    "void main(void){" +
      "ivec2 " +
        "ts=textureSize(uTex,0)," +
        "f=ivec2(floor(vTUv*vec2(ts)));" +

      "ivec2 " +
        "p1=f+ivec2(1,0)," +
        "p2=f+ivec2(0,1);" +

      "float " +
        "sf0=texelFetch(uTex,f,0).g," +
        "sf1=texelFetch(uTex,p1,0).g," +
        "sf2=texelFetch(uTex,p2,0).g;" +

      "vec3 " +
        "nm=normalize(vec3(sf0-sf1,sf0-sf2,.01));" +

      "nm.y*=-1.;" +
      "oCl=vec4(nm*.5+.5,1);" +
    "}";
  }
}