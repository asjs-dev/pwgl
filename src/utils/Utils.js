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
const _createShader = (gl, shaderSource, shaderType) => {
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
 * @property {function(function)} initApplication Call the callback function if the document.readyState interactive or complete
 * @property {function(WebGLContext, string, string):WebGLProgram} createProgram Create a WebGL program
 * @property {function(WebGLContext, WebGLProgram, Object):Object} getLocationsFor
 */

const _THETA = Math.PI / 180;

export const Utils = {
  /**
   * @property {number}
   */
  ALPHA: 90 * _THETA,

  /**
   * @property {number}
   */
  THETA: _THETA,

  /**
   * @property {Object}
   */
  // prettier-ignore
  GLSL: {
    VERSION: "#version 300 es\n",
    DEFINE: {
      RADIAN_360: "#define RADIAN_360 " + Math.PI * 2 + "\n",
      HEIGHT: "#define HEIGHT 255.\n",
      Z: "#define Z vec3(0,1,-1)\n",
      PI: "#define PI " + Math.PI + "\n",
    },
    RANDOM: 
      "float rand(vec2 p,float s){" +
        "p=mod(p,vec2(10000));" +
        "return fract(" + 
          "sin(" + 
            "dot(" + 
              "p," + 
              "vec2(" + 
                "sin(p.x+p.y)," + 
                "cos(p.y-p.x)" + 
              ")" + 
            ")" + 
          ")*s" +
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
  initContextConfig: (config = {}) => ({
    canvas: document.createElement("canvas"),
    ...config,
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
  initRendererConfig: (config = {}) => ({
    locations: config.locations || [],
    context: config.context || new Context(),
  }),

  /**
   * Call the callback function if the document.readyState interactive or complete
   * @param {function} callback Callback function
   */
  initApplication: (callback) => {
    const loadedCallback = () => callback(Utils.INFO.isWebGl2Supported);

    ["interactive", "complete"].includes(document.readyState)
      ? loadedCallback()
      : document.addEventListener("DOMContentLoaded", loadedCallback, {
          once: true,
        });
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
        vertexShaderSource,
        Const.VERTEX_SHADER
      ),
      fragmentShader = _createShader(
        gl,
        fragmentShaderSource,
        Const.FRAGMENT_SHADER
      ),
      program = gl.createProgram();

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

    locationsDescriptor.forEach(
      (name) =>
        (locations[name] = gl["get" + _locationTypes[name[0]] + "Location"](
          program,
          name
        ))
    );

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
