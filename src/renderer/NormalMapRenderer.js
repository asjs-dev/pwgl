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
        "p1=vTUv+vec2(-1.2247,-0.7071)*ts," +
        "p2=vTUv+vec2(1.2247,-0.7071)*ts," +
        "p3=vTUv+vec2(1.1102,1.4142)*ts;" +

      "vec3 " +
        "sf0=vec3(vTUv,texture(uTex,vTUv).g)," +
        "sf1=vec3(p1,texture(uTex,p1).g)," +
        "sf2=vec3(p2,texture(uTex,p2).g)," +
        "sf3=vec3(p3,texture(uTex,p3).g)," +

        "l0=sf1-sf0," +
        "l1=sf2-sf0," +
        "l2=sf3-sf0;" +

      "vec3 nm=normalize(" +
        "cross(l0,l1)+" +
        "cross(l1,l2)+" +
        "cross(l2,l0)" +
      ");" +
      "nm.y*=-1.;" +
      "oCl=vec4(nm*.5+.5,1);" +
    "}";
  }
}
