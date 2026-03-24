export const createMockGl = () => ({
  ARRAY_BUFFER: 34962,
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
