export const WEBGL2_RENDERING_CONTEXT = {
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963,
  DYNAMIC_DRAW: 35048,
  STATIC_DRAW: 35044,
  FLOAT: 5126,
  FUNC_ADD: 32774,
  MIN: 32775,
  MAX: 32776,
  ZERO: 0,
  ONE: 1,
  SRC_ALPHA: 770,
  ONE_MINUS_SRC_ALPHA: 771,
  DST_ALPHA: 772,
  ONE_MINUS_DST_ALPHA: 773,
  DST_COLOR: 774,
  SRC_COLOR: 768,
  ONE_MINUS_SRC_COLOR: 769,
  ONE_MINUS_DST_COLOR: 775,
  TEXTURE_2D: 3553,
  CLAMP_TO_EDGE: 33071,
  RGBA: 6408,
  LINEAR: 9729,
  UNSIGNED_BYTE: 5121,
  TEXTURE0: 33984,
  TEXTURE_WRAP_S: 10242,
  TEXTURE_WRAP_T: 10243,
  TEXTURE_MIN_FILTER: 10241,
  TEXTURE_MAG_FILTER: 10240,
  TEXTURE_MAX_LEVEL: 33085,
  TEXTURE_BASE_LEVEL: 33084,
  MAX_TEXTURE_IMAGE_UNITS: 34930,
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  LINK_STATUS: 35714,
  VALIDATE_STATUS: 35715,
  TRIANGLE_STRIP: 5,
  UNSIGNED_SHORT: 5123,
  COLOR_BUFFER_BIT: 16384,
  UNPACK_PREMULTIPLY_ALPHA_WEBGL: 37441,
  BLEND: 3042,
  SCISSOR_TEST: 3089,
  FRAMEBUFFER: 36160,
  COLOR_ATTACHMENT0: 36064,
};

export const installWebGL2RenderingContextMock = () => {
  globalThis.WebGL2RenderingContext = WEBGL2_RENDERING_CONTEXT;
  return WEBGL2_RENDERING_CONTEXT;
};

export const createMockGl = () => ({
  ...WEBGL2_RENDERING_CONTEXT,
  createTexture: () => ({ id: "texture" }),
  activeTexture: () => {},
  bindTexture: () => {},
  texImage2D: () => {},
  texParameteri: () => {},
  generateMipmap: () => {},
  createBuffer: () => ({ id: "buffer" }),
  bindBuffer: () => {},
  bufferData: () => {},
  deleteBuffer: () => {},
  enableVertexAttribArray: () => {},
  vertexAttribPointer: () => {},
  vertexAttribDivisor: () => {},
  getParameter: () => 8,
  getExtension: () => false,
  pixelStorei: () => {},
  enable: () => {},
  blendColor: () => {},
  blendFunc: function () {},
  blendEquation: function () {},
  // Shader methods
  createShader: () => ({ id: "shader" }),
  shaderSource: () => {},
  compileShader: () => {},
  getShaderParameter: () => true,
  createProgram: () => ({ id: "program" }),
  attachShader: () => {},
  linkProgram: () => {},
  getProgramParameter: () => true,
  getAttribLocation: () => 0,
  getUniformLocation: () => ({ id: "location" }),
  createVertexArray: () => ({ id: "vao" }),
  useProgram: () => {},
  // Drawing methods
  drawElementsInstanced: () => {},
  clearColor: () => {},
  clear: () => {},
  // Uniform methods
  uniform1i: () => {},
  uniform1f: () => {},
  uniform2f: () => {},
  uniform3f: () => {},
  uniform4f: () => {},
  uniformMatrix2x4fv: () => {},
  uniformMatrix3fv: () => {},
});

const createBaseElement = (tagName) => ({
  tagName: tagName.toUpperCase(),
  style: {},
  addEventListener: () => {},
  removeEventListener: () => {},
});

export const createMockDocument = (gl = createMockGl()) => ({
  readyState: "complete",
  addEventListener: () => {},
  createElement: (tag) => {
    if (tag === "canvas") {
      return {
        ...createBaseElement(tag),
        width: 0,
        height: 0,
        getContext: (type) => {
          if (type === "webgl2") {
            return gl;
          }

          if (type === "2d") {
            return {
              measureText: (text) => ({ width: text.length }),
              fillText: () => {},
            };
          }

          return null;
        },
      };
    }

    if (tag === "video") {
      return {
        ...createBaseElement(tag),
        paused: true,
        videoWidth: 0,
        videoHeight: 0,
        src: "",
        crossOrigin: "",
      };
    }

    if (tag === "img") {
      return {
        ...createBaseElement(tag),
        naturalWidth: 0,
        naturalHeight: 0,
        src: "",
        crossOrigin: "",
      };
    }

    return createBaseElement(tag);
  },
});
