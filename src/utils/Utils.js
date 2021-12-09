import { Context } from "./Context.js";

export const Utils = {
  THETA : Math.PI / 180,

  GLSL_RANDOM : "float rand(vec2 p,float s){" +
    "p=mod(" +
      "p+floor(p/10000.)," +
      "vec2(10000)" +
    ");" +
    "return fract(" +
      "sin(" +
        "dot(" +
          "p," +
          "vec2(" +
            "sin(p.x+p.y)," +
            "cos(p.y-p.x)" +
          ")" +
        ")*s" +
      ")*.5+.5" +
    ");" +
  "}",

  INFO : {
    isWebGl2Supported : false
  },

  initContextConfig : (config) => {
    config = config || {};

    return {
      canvas : config.canvas || document.createElement("canvas"),
      contextAttributes : {... {
        powerPreference : "high-performance",
        preserveDrawingBuffer : true,
      }, ... (config.contextAttributes || {})}
    };
  },

  initRendererConfig : (config) => {
    config = config || {};

    return {
      locations : config.locations || [],
      precision : config.precision || "lowp", /* lowp mediump highp */
      context : config.context || new Context()
    };
  },

  createVersion : (precision) => "#version 300 es\n" +
    "precision " + precision + " float;\n",

  initApplication : (callback) => {
    const checkCanvas = () => {
      if (document.readyState === "complete") {
        document.removeEventListener("readystatechange", checkCanvas);
        callback(Utils.INFO.isWebGl2Supported);
      } else
        document.addEventListener("readystatechange", checkCanvas);
    };

    checkCanvas();
  },

  createShader : (gl, shaderType, shaderSource) => {
    const shader = gl.createShader(shaderType);

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    return shader;
  },

  createProgram : (gl, vertexShaderSource, fragmentShaderSource) => {
    const vertexShader = Utils.createShader(
      gl,
      Const.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = Utils.createShader(
      gl,
      Const.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, Const.LINK_STATUS)) {
      console.error(
        "Program info:", gl.getProgramInfoLog(program), "\n",
        "Validate status:", gl.getProgramParameter(
          program,
          Const.VALIDATE_STATUS
        ), "\n",
        "Vertex shader info:", gl.getShaderInfoLog(vertexShader), "\n",
        "Fragment shader info:", gl.getShaderInfoLog(fragmentShader)
      );

      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);

      throw "WebGL application stoped";
    };

    return program;
  },

  locationTypes : {
    a : "Attrib",
    u : "Uniform"
  },

  getLocationsFor : (gl, program, locationsDescriptor) => {
    const locations = {};

    locationsDescriptor.forEach((name) => {
      locations[name] = gl["get" + Utils.locationTypes[name[0]] + "Location"](
        program,
        name
      );
    });

    return locations;
  },
};

export const Const = {};

(() => {
  const gl = document.createElement("canvas").getContext("webgl2");
  if (gl) {
    for (let key in gl) {
      const value = gl[key];
      if (typeof value === "number" && key === key.toUpperCase())
        Const[key] = value;
    }

    Utils.INFO.isWebGl2Supported = true;
    Utils.INFO.maxTextureImageUnits = gl.getParameter(
      Const.MAX_TEXTURE_IMAGE_UNITS
    );
  }
})();
