type ColorDefinition = {
  icon: string;
  label: LogType;
  color: string;
  bg: string;
};

const _createColorDefinition = (icon: string, label: LogType, color: string, bg: string): ColorDefinition => ({
  icon,
  label,
  color,
  bg,
});

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
} as const;

export type LogType = (typeof TYPES)[keyof typeof TYPES];

export const COLORS: ColorDefinition[] = [
  _createColorDefinition("", TYPES.FRAME, "#0f0", "#000"),
  _createColorDefinition("-", TYPES.BASE, "#999", "#111"),
  _createColorDefinition("◉", TYPES.PROGRAM, "#7CFF9B", "#0b3d1f"),
  _createColorDefinition("↔", TYPES.BINDING, "#4FC3F7", "#002233"),
  _createColorDefinition("□", TYPES.RESOURCES, "#FFD54F", "#3a2a00"),
  _createColorDefinition("↑", TYPES.BUFFER_UPLOAD, "#FF7043", "#3b1200"),
  _createColorDefinition("▦", TYPES.TEXTURE_PARAMS, "#c792ea", "#2a1433"),
  _createColorDefinition("≡", TYPES.UNIFORMS, "#FF7AA2", "#2a0f1a"),
  _createColorDefinition("▣", TYPES.VERTEX_ATTRIBUTES, "#26E6A6", "#00382f"),
  _createColorDefinition("▢", TYPES.VIEWPORT, "#90a4ae", "#1c262b"),
  _createColorDefinition("≈", TYPES.BLENDING, "#69f0ae", "#032"),
  _createColorDefinition("⇅", TYPES.SAMPLERS, "#000", "#33F"),
  _createColorDefinition("▭", TYPES.FRAMEBUFFERS, "#fff", "#4a148c"),
  _createColorDefinition("▩", TYPES.RENDERBUFFERS, "#fff", "#004d40"),
  _createColorDefinition("∠", TYPES.DEPTH_STENCIL, "#999", "#333"),
  _createColorDefinition("∞", TYPES.SHADER, "#8cedd4", "#390b5a"),
  _createColorDefinition("●", TYPES.DRAW, "#fff", "#086818"),
  _createColorDefinition("■", TYPES.ALERT, "#fff", "#b00020"),
  _createColorDefinition("▲", TYPES.WARN, "#000", "#fc0"),
];

/**
 * Resolve the output label used to style a logged WebGL call.
 */
export const getFormat = (duration: number, command: string): LogType => {
  if (duration > 5) {
    return TYPES.ALERT;
  }

  if (duration > 2) {
    return TYPES.WARN;
  }

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

  if (command.startsWith("createTexture")) {
    return TYPES.RESOURCES;
  }

  if (command.startsWith("uniform")) {
    return TYPES.UNIFORMS;
  }

  return TYPES.BASE;
};
