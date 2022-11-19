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

    "out vec4 oCl;" +

    "void main(void){" +
      "vec2 ts=1./vec2(textureSize(uTex,0));" +

      "vec2 " +
        "p1=vTUv+vec2(1.,0.)*ts," +
        "p2=vTUv+vec2(0.,1.)*ts;" +

      "float " +
        "sf0=texture(uTex,vTUv).g," +
        "sf1=texture(uTex,p1).g," +
        "sf2=texture(uTex,p2).g;" +

      "vec3 " +
        "nm=normalize(vec3(sf0-sf1,sf0-sf2,.01));" +

      "nm.y*=-1.;" +
      "oCl=vec4(nm*.5+.5,1);" +
    "}";
  }
}
