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

// prettier-ignore
export const TINT_TYPE_SHADER = (id, outColor, tintColor) => "if(" + id + ">0.)" +
  "if(" + id + "==1.||(" + id + "==2.&&" + outColor + ".r==" + outColor + ".g&&" + outColor + ".r==" + outColor + ".b))" +
    outColor + "*=" + tintColor + ";" +
  "else if(" + id + "==3.)" +
    outColor + "=" + tintColor + ";" +
  "else if(" + id + "==4.)" +
    outColor + "+=" + tintColor + ";";

// prettier-ignore
export const CREATE_SAMPLING_FILTER = (beforeLoop = "", afterLoop = "") => "" +
  "if(v>0.){" +
    "vec2 " +
      "wh=vec2(v,uJ[1]);" +

    "ivec2 " +
      "mn=ivec2(Z.xx)," + 
      "mx=ivec2(ts)-1;" +
      
    beforeLoop +

    ["z", "yz", "zy", "y"].reduce((acc, v) => 
      acc += "oCl+=texelFetch(uB,clamp(f+ivec2(Z." + v + "*wh),mn,mx),0);", 
      ""
    ) +

    afterLoop +
  "}";
