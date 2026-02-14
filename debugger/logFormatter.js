export const TYPES = {
  FRAME: "FRAME",
  BASE: "    ",
  PROGRAM: "PROG",
  BINDING: "BIND",
  RESOURCES: "RSRC",
  BUFFER_UPLOAD: "UPLD",
  TEXTURE_PARAMS: "TEXT",
  UNIFORMS: "UNIF",
  VERTEX_ATTRIBUTES: "ATTR",
  VIEWPORT: "VIEW",
  BLENDING: "BLND",
  SAMPLERS: "SAMP",
  FRAMEBUFFERS: "FBO ",
  RENDERBUFFERS: "RBO ",
  DEPTH_STENCIL: "DPTH",
  SHADER: "SHDR",
  DRAW: "DRAW",
  ALERT: "ALRT",
  WARN: "WARN",
};

export const COLORS = [
  { icon: "", label: TYPES.FRAME, color: "#0f0", bg: "#000" },
  { icon: "-", label: TYPES.BASE, color: "#999", bg: "#111" },
  { icon: "◉", label: TYPES.PROGRAM, color: "#7CFF9B", bg: "#0b3d1f" },
  { icon: "↔", label: TYPES.BINDING, color: "#4FC3F7", bg: "#002233" },
  { icon: "□", label: TYPES.RESOURCES, color: "#FFD54F", bg: "#3a2a00" },
  { icon: "↑", label: TYPES.BUFFER_UPLOAD, color: "#FF7043", bg: "#3b1200" },
  { icon: "▦", label: TYPES.TEXTURE_PARAMS, color: "#c792ea", bg: "#2a1433" },
  { icon: "≡", label: TYPES.UNIFORMS, color: "#FF7AA2", bg: "#2a0f1a" },
  {
    icon: "▣",
    label: TYPES.VERTEX_ATTRIBUTES,
    color: "#26E6A6",
    bg: "#00382f",
  },
  { icon: "▢", label: TYPES.VIEWPORT, color: "#90a4ae", bg: "#1c262b" },
  { icon: "≈", label: TYPES.BLENDING, color: "#69f0ae", bg: "#032" },
  { icon: "⇅", label: TYPES.SAMPLERS, color: "#000", bg: "#33F" },
  { icon: "▭", label: TYPES.FRAMEBUFFERS, color: "#fff", bg: "#4a148c" },
  { icon: "▩", label: TYPES.RENDERBUFFERS, color: "#fff", bg: "#004d40" },
  { icon: "∠", label: TYPES.DEPTH_STENCIL, color: "#999", bg: "#333" },
  { icon: "∞", label: TYPES.SHADER, color: "#8cedd4", bg: "#390b5a" },
  { icon: "●", label: TYPES.DRAW, color: "#fff", bg: "#086818" },
  { icon: "■", label: TYPES.ALERT, color: "#fff", bg: "#b00020" },
  { icon: "▲", label: TYPES.WARN, color: "#000", bg: "#fc0" },
];

/**
 * Resolve the output label used to style a logged WebGL call.
 *
 * @param {number} duration Elapsed time in milliseconds for the previous call.
 * @param {string} command WebGL method name.
 * @returns {string} One of the labels defined in `TYPES`.
 */
export const getFormat = (duration, command) => {
  if (duration > 5) return TYPES.ALERT;
  if (duration > 2) return TYPES.WARN;

  switch (command) {
    case "createProgram":
    case "attachShader":
    case "linkProgram":
    case "validateProgram":
    case "deleteProgram":
    case "useProgram":
      return TYPES.PROGRAM;
    case "createShader":
    case "shaderSource":
    case "compileShader":
    case "deleteShader":
      return TYPES.SHADER;
    case "getBufferSubData":
    case "finish":
    case "flush":
    case "readPixels":
      return TYPES.WARN;
    case "getError":
      return TYPES.ALERT;
    case "bindVertexArray":
    case "bindBuffer":
    case "activeTexture":
    case "bindTexture":
      return TYPES.BINDING;
    case "createBuffer":
      return TYPES.RESOURCES;
    case "bufferData":
    case "texImage2D":
    case "bufferSubData":
    case "copyBufferSubData":
    case "texSubImage2D":
    case "texStorage2D":
    case "copyTexImage2D":
    case "copyTexSubImage2D":
    case "compressedTexImage2D":
    case "compressedTexSubImage2D":
      return TYPES.BUFFER_UPLOAD;
    case "texParameteri":
    case "generateMipmap":
      return TYPES.TEXTURE_PARAMS;
    case "bindBufferBase":
    case "bindBufferRange":
      return TYPES.UNIFORMS;
    case "enableVertexAttribArray":
    case "vertexAttribPointer":
    case "vertexAttribDivisor":
    case "vertexAttribIPointer":
    case "disableVertexAttribArray":
      return TYPES.VERTEX_ATTRIBUTES;
    case "viewport":
    case "scissor":
    case "clearColor":
    case "clear":
      return TYPES.VIEWPORT;
    case "blendEquation":
    case "blendFuncSeparate":
      return TYPES.BLENDING;
    case "drawElementsInstanced":
    case "drawArrays":
    case "drawElements":
    case "drawArraysInstanced":
    case "drawRangeElements":
    case "drawBuffers":
    case "drawElementsInstancedBaseVertex":
      return TYPES.DRAW;
    case "createSampler":
    case "samplerParameteri":
    case "bindSampler":
    case "deleteSampler":
      return TYPES.SAMPLERS;
    case "createFramebuffer":
    case "bindFramebuffer":
    case "framebufferTexture2D":
    case "framebufferRenderbuffer":
    case "checkFramebufferStatus":
    case "blitFramebuffer":
      return TYPES.FRAMEBUFFERS;
    case "createRenderbuffer":
    case "bindRenderbuffer":
    case "renderbufferStorage":
    case "renderbufferStorageMultisample":
      return TYPES.RENDERBUFFERS;
    case "depthFunc":
    case "depthMask":
    case "cullFace":
    case "frontFace":
    case "stencilFunc":
    case "stencilOp":
      return TYPES.DEPTH_STENCIL;
  }

  if (command.startsWith("createTexture")) return TYPES.RESOURCES;
  if (command.startsWith("uniform")) return TYPES.UNIFORMS;

  return TYPES.BASE;
};
