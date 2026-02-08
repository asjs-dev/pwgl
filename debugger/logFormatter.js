const _createFormat = (icon, label, textColor, backgroundColor) => ({
  icon: icon,
  label: label,
  style: `background: ${backgroundColor}; color: ${textColor}; font-family: monospace;`,
});

const _COLORS = {
  BASE: _createFormat("·", "----", "#999", "#000"),
  PROGRAM: _createFormat("◉", "PROG", "#7CFF9B", "#0b3d1f"),
  BINDING: _createFormat("↔", "BIND", "#4FC3F7", "#002233"),
  RESOURCES: _createFormat("□", "RESOURCE", "#FFD54F", "#3a2a00"),
  BUFFER_UPLOAD: _createFormat("↑", "UPLD", "#FF7043", "#3b1200"),
  TEXTURE_PARAMS: _createFormat("▦", "TEXT", "#c792ea", "#2a1433"),
  UNIFORMS: _createFormat("≡", "UNIF", "#FF7AA2", "#2a0f1a"),
  VERTEX_ATTRIBUTES: _createFormat("▣", "ATTR", "#26E6A6", "#00382f"),
  VIEWPORT: _createFormat("▢", "FRAM", "#90a4ae", "#1c262b"),
  BLENDING: _createFormat("≈", "BLND", "#69f0ae", "#032"),
  SAMPLERS: _createFormat("⇅", "SAMP", "#000", "#33F"),
  FRAMEBUFFERS: _createFormat("▭", "FBO ", "#fff", "#4a148c"),
  RENDERBUFFERS: _createFormat("▩", "RBO ", "#fff", "#004d40"),
  DEPTH_STENCIL: _createFormat("∠", "DPTH", "#999", "#333"),
  DRAW: _createFormat("●", "DRAW", "#fff", "#d50000"),
  ALERT: _createFormat("■", "ALRT", "#fff", "#b00020"),
  WARN: _createFormat("▲", "WARN", "#000", "#fc0"),
};

const _ENABLE_LIST = ["DEPTH_TEST", "CULL_FACE", "STENCIL_TEST"];

export const getFormat = (duration, command, args) => {
  if (duration > 5) return _COLORS.ALERT;
  if (duration > 2) return _COLORS.WARN;

  switch (command) {
    case "createProgram":
    case "attachShader":
    case "linkProgram":
    case "validateProgram":
    case "deleteProgram":
    case "useProgram":
      return _COLORS.PROGRAM;
    case "createShader":
    case "shaderSource":
    case "compileShader":
    case "deleteShader":
    case "getBufferSubData":
    case "finish":
    case "flush":
    case "readPixels":
      return _COLORS.WARN;
    case "getError":
      return _COLORS.ALERT;
    case "bindVertexArray":
    case "bindBuffer":
    case "activeTexture":
    case "bindTexture":
      return _COLORS.BINDING;
    case "createBuffer":
      return _COLORS.RESOURCES;
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
      return _COLORS.BUFFER_UPLOAD;
    case "texParameteri":
    case "generateMipmap":
      return _COLORS.TEXTURE_PARAMS;
    case "bindBufferBase":
    case "bindBufferRange":
      return _COLORS.UNIFORMS;
    case "enableVertexAttribArray":
    case "vertexAttribPointer":
    case "vertexAttribDivisor":
    case "vertexAttribIPointer":
    case "disableVertexAttribArray":
      return _COLORS.VERTEX_ATTRIBUTES;
    case "viewport":
    case "scissor":
    case "clearColor":
    case "clear":
      return _COLORS.VIEWPORT;
    case "blendEquation":
    case "blendFuncSeparate":
      return _COLORS.BLENDING;
    case "drawElementsInstanced":
    case "drawArrays":
    case "drawElements":
    case "drawArraysInstanced":
    case "drawRangeElements":
    case "drawBuffers":
    case "drawElementsInstancedBaseVertex":
      return _COLORS.DRAW;
    case "createSampler":
    case "samplerParameteri":
    case "bindSampler":
    case "deleteSampler":
      return _COLORS.SAMPLERS;
    case "createFramebuffer":
    case "bindFramebuffer":
    case "framebufferTexture2D":
    case "framebufferRenderbuffer":
    case "checkFramebufferStatus":
    case "blitFramebuffer":
      return _COLORS.FRAMEBUFFERS;
    case "createRenderbuffer":
    case "bindRenderbuffer":
    case "renderbufferStorage":
    case "renderbufferStorageMultisample":
      return _COLORS.RENDERBUFFERS;
    case "depthFunc":
    case "depthMask":
    case "cullFace":
    case "frontFace":
    case "stencilFunc":
    case "stencilOp":
      return _COLORS.DEPTH_STENCIL;
  }

  if (command.startsWith("createTexture")) return _COLORS.RESOURCES;
  if (command.startsWith("uniform")) return _COLORS.UNIFORMS;
  if (command.startsWith("enable") && _ENABLE_LIST.includes(args[0]))
    return _COLORS.DEPTH_STENCIL;

  return _COLORS.BASE;
};
