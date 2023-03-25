import { Utils } from "../utils/Utils.js";
import { BlendMode } from "../data/BlendMode.js";
import { BaseRenderer } from "./BaseRenderer.js";

export class AmbientOcclusionMapRenderer extends BaseRenderer {
  constructor(options) {
    options = options || {};
    options.config = Utils.initRendererConfig(options.config);

    // prettier-ignore
    options.config.locations = options.config.locations.concat([
      "uM",
      "uDM"
    ]);

    super(options);

    this.clearBeforeRender = true;
    this.clearColor.set(0, 0, 0, 1);

    this.heightMap = options.heightMap;

    this.multiplier = 10;
    this.depthMultiplier = 2;
  }

  _render() {
    this.context.setBlendMode(BlendMode.NORMAL);

    this._gl.uniform1i(
      this._locations.uTex,
      this.context.useTexture(this.heightMap, this._renderTime, true)
    );

    this._gl.uniform1f(this._locations.uM, this.multiplier);
    this._gl.uniform1f(this._locations.uDM, this.depthMultiplier);

    this._uploadBuffers();

    this._drawInstanced(1);
  }

  // prettier-ignore
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

  // prettier-ignore
  _createFragmentShader(options) {
    return Utils.createVersion(options.config.precision) +
    "#define H 255.\n" +

    "in vec2 " +
      "vTUv;" +

    "uniform sampler2D " +
      "uTex;" +

    "uniform float " +
      "uFlpY," +
      "uM," +
      "uDM;" +

    "out vec4 " +
      "oCl;" +

    "void main(void){" +
      "vec2 " +
        "its=vec2(textureSize(uTex,0))," +
        "ts=1./its," +
        "f=floor(vTUv*its),"+
        "p;" +

      "float " +
        "tx=texture(uTex,f*ts).g," +
        "v=0.," +
        "z," +
        "h;" +

      "for(p.x=-2.;p.x<3.;++p.x)" +
        "for(p.y=-2.;p.y<3.;++p.y)" +
          "if(p.x!=0.&&p.y!=0.){" +
            "h=texture(uTex,(f+p*2.)*ts).g;" +
            "z=clamp(h-tx,0.,1.);" +
            "v+=z*uM*(3./length(vec2(p)));" +
          "}" +
      "v/=24.;" +

      "oCl=vec4(vec3(((1.-uDM)*.5+tx*uDM))+(1.-max(0.,v)),1);" +
    "}";
  }
}
