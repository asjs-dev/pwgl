// prettier-ignore
export const BASE_VERTEX_SHADER =
  "vec4 " + 
    "pos=vec4(aA*2.-1.,1,1);" + 
    "gl_Position=pos;" + 
    "gl_Position.y*=uA;";

// prettier-ignore
export const BASE_VERTEX_SHADER_POSITION =
  "vec2(aA.x,1.-aA.y)";

// prettier-ignore
export const BASE_VERTEX_SHADER_ATTRIBUTES = "" +
  "in vec2 " +
    "aA;";

// prettier-ignore
export const BASE_VERTEX_SHADER_UNIFORMS = "" +
  "uniform float " +
    "uA;";

export const BASE_VERTEX_SHADER_INITIALIZATION =
  BASE_VERTEX_SHADER_ATTRIBUTES + BASE_VERTEX_SHADER_UNIFORMS;
