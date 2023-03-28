import { Context } from "./Context";

/**
 * @typedef {Object} WebGLContext
 */

/**
 * @typedef {Object} WebGLProgram
 */

/**
 * @typedef {Object} RendererConfig
 * @property {Array<string>} locations
 * @property {string} precision
 * @property {WebGLContext} context
 */

/**
 * @typedef {Object} ContextConfig
 * @property {HTMLCanvasElement} canvas
 * @property {function} initCallback
 * @property {Object} contextAttributes
 */

/**
 * Location types
 * @const {Object}
 * @property {string} a
 * @property {string} u
 * @ignore
 */
const _locationTypes = {
  a: "Attrib",
  u: "Uniform",
};

/**
 * Shade creator
 * @param {WebGLContext} gl WebGL context
 * @param {number} shaderType Shader type
 * @param {string} shaderSource Shader source
 * @returns {Object} Shader
 * @ignore
 */
const _createShader = (gl, shaderType, shaderSource) => {
  const shader = gl.createShader(shaderType);

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  return shader;
};

/**
 * Common utilities
 * @typedef {Object} Utils
 * @property {number} THETA Useful number for conversion between rad and deg
 * @property {Object} GLSL Common glsl scripts
 * @property {Object} INFO Information about WebGL
 * @property {function(ContextConfig)} initContextConfig Create new context config
 * @property {function(RendererConfig)} initRendererConfig Create new renderer config
 * @property {function(string)} createVersion Create shader version
 * @property {function(function)} initApplication Call the callback function if the document.readyState interactive or complete
 * @property {function(WebGLContext, string, string):WebGLProgram} createProgram Create a WebGL program
 * @property {function(WebGLContext, WebGLProgram, Object):Object} getLocationsFor
 */

export const Utils = {
  /**
   * @property {number}
   */
  THETA: Math.PI / 180,

  /**
   * @property {Object}
   */
  // prettier-ignore
  GLSL : {
    RANDOM : "float rand(vec2 p,float s){" +
      "return fract(" +
        "sin(" +
          "dot(" +
            "p," +
            "vec2(" +
              "sin(p.x+p.y)," +
              "cos(p.y-p.x)*s" +
            ")" +
          ")*s" +
        ")*.5+.5" +
      ");" +
    "}" +
    "float rand(vec2 p){" +
      "return rand(p,1.);" +
    "}"
  },

  /**
   * @property {Object}
   */
  INFO: {
    isWebGl2Supported: false,
  },

  /**
   * Create new context config
   * @param {ContextConfig} config Context config
   * @returns {ContextConfig}
   */
  initContextConfig: (config) => ({
    canvas: (config = config || {}).canvas || document.createElement("canvas"),
    initCallback: config.initCallback,
    contextAttributes: {
      ...{
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        premultipliedAlpha: false,
      },
      ...(config.contextAttributes || {}),
    },
  }),

  /**
   * Create new renderer config
   * @param {RendererConfig} config Renderer config
   * @returns {RendererConfig}
   */
  initRendererConfig: (config) => ({
    locations: (config = config || {}).locations || [],
    precision: config.precision || "highp" /* lowp mediump highp */,
    context: config.context || new Context(),
  }),

  /**
   * Create shader version
   * @param {string} precision Shader precision
   * @returns {string}
   */
  createVersion: (precision) =>
    "#version 300 es\n" + "precision " + precision + " float;\n",

  /**
   * Call the callback function if the document.readyState interactive or complete
   * @param {function} callback Callback function
   */
  initApplication: (callback) => {
    const checkDocumentReady = () => {
      if (["interactive", "complete"].indexOf(document.readyState) > -1) {
        document.removeEventListener("readystatechange", checkDocumentReady);
        callback(Utils.INFO.isWebGl2Supported);
      } else document.addEventListener("readystatechange", checkDocumentReady);
    };

    checkDocumentReady();
  },

  /**
   * Create a WebGL program
   * @param {WebGLContext} gl WebGL context
   * @param {string} vertexShaderSource Vertex shader source
   * @param {string} fragmentShaderSource Fragment shader source
   * @returns {WebGLProgram} WebGL program
   */
  createProgram: (gl, vertexShaderSource, fragmentShaderSource) => {
    const vertexShader = _createShader(
      gl,
      Const.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = _createShader(
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
        "Program info:",
        gl.getProgramInfoLog(program),
        "\n",
        "Validate status:",
        gl.getProgramParameter(program, Const.VALIDATE_STATUS),
        "\n",
        "Vertex shader info:",
        gl.getShaderInfoLog(vertexShader),
        "\n",
        "Fragment shader info:",
        gl.getShaderInfoLog(fragmentShader)
      );

      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);

      throw "WebGL application stoped";
    }

    return program;
  },

  /**
   * @param {WebGLContext} gl WebGL context
   * @param {WebGLProgram} program WebGL program
   * @param {Array<string>} locationsDescriptor List of attributes and uniforms locations
   * @returns {Object}
   */
  getLocationsFor: (gl, program, locationsDescriptor) => {
    const locations = {};

    locationsDescriptor.forEach((name) => {
      locations[name] = gl["get" + _locationTypes[name[0]] + "Location"](
        program,
        name
      );
    });

    return locations;
  },
};

/**
 * Contains all constant values for WebGL
 * @type {Object}
 */
export const Const = {};

const _gl = document.createElement("canvas").getContext("webgl2");
if (_gl) {
  for (let key in _gl) {
    const value = _gl[key];
    if (typeof value === "number" && key === key.toUpperCase())
      Const[key] = value;
  }

  Utils.INFO.isWebGl2Supported = true;
  Utils.INFO.maxTextureImageUnits = _gl.getParameter(
    Const.MAX_TEXTURE_IMAGE_UNITS
  );
}
