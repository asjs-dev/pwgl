// prettier-ignore
export const BASE_VERTEX_SHADER =
  "vec4 " + 
    "pos=vec4(aPs*2.-1.,1,1);" + 
    "gl_Position=pos;" + 
    "gl_Position.y*=uFY;";

// prettier-ignore
export const BASE_VERTEX_SHADER_POSITION =
  "vec2(aPs.x,1.-aPs.y)";

// prettier-ignore
export const BASE_VERTEX_SHADER_ATTRIBUTES = "" +
  "in vec2 " +
    "aPs;";

// prettier-ignore
export const BASE_VERTEX_SHADER_UNIFORMS = "" +
  "uniform float " +
    "uFY;";

export const BASE_VERTEX_SHADER_INITIALIZATION =
  BASE_VERTEX_SHADER_ATTRIBUTES + BASE_VERTEX_SHADER_UNIFORMS;
