export const VERSION = "#version 300 es\n";

export const DEFINE = {
  RADIANS_360: "#define RADIANS_360 radians(360.)\n",
  HEIGHT: "#define HEIGHT 255.\n",
  Z: "#define Z vec3(0,1,-1)\n", // Z swizzle patterns: Z.xx=(0,0), Z.yx=(1,0), Z.xy=(0,1), Z.yy=(1,1)
  PI: `#define PI ${Math.PI}\n`,
};

// prettier-ignore
export const BASE_VERTEX_SHADER_ATTRIBUTES = 
  `in vec2 ` + 
    `aA;`;

// prettier-ignore
export const BASE_VERTEX_SHADER_UNIFORMS = 
  `uniform float ` + 
  `uA;`;

// prettier-ignore
export const RANDOM =
  "float rand(vec2 p,float s){" +
    "vec3 p3=fract(p.xyx*(.1031*s));" +
    "p3+=dot(p3,p3.yzx+33.33);" +
    "return fract((p3.x+p3.y)*p3.z);" +
  "}" +
  "float rand(vec2 p){" +
    "return rand(p,1.);" +
  "}";

// prettier-ignore
export const RANDOM2 =
  "float rand2(vec2 p,float s){" +
    "p=mod(p*100.,vec2(1e4))+100.;" +
    "return fract(" +
      "dot(" +
        "p," +
        "vec2(" +
          "sin(p.x+p.y)," +
          "cos(p.y-p.x)" +
        ")*s" +
      ")" +
    ");" +
  "}" +
  "float rand2(vec2 p){" +
    "return rand2(p,1.);" +
  "}";

// prettier-ignore
export const BASE_VERTEX_SHADER = 
  `vec4 ` + 
    `pos=vec4(aA*2.-1.,1,1);` + 
  `gl_Position=pos;` + 
  `gl_Position.y*=uA;`;

export const BASE_VERTEX_SHADER_POSITION = `vec2(aA.x,1.-aA.y)`;

export const BASE_VERTEX_SHADER_INITIALIZATION = BASE_VERTEX_SHADER_ATTRIBUTES + BASE_VERTEX_SHADER_UNIFORMS;

// prettier-ignore
export const TINT_TYPE_SHADER = (id, outColor, tintColor) => '' +
  `if(${id}>0.)` +
    `if(${id}==1.||(${id}==2.&&${outColor}.r==${outColor}.g&&${outColor}.r==${outColor}.b))` +
      `${outColor}*=${tintColor};` +
    `else if(${id}==3.)` +
      `${outColor}=${tintColor};` +
    `else if(${id}==4.)` +
      `${outColor}+=${tintColor};`;

// prettier-ignore
export const CREATE_TEXTURE_UNIT_LOOKUP = ({ index, uv, samplerArray, count, miss }) =>
  `${Array(count).fill().map((v, i) =>
    `if(${index}<${i + 1}.)` +
      `return texture(${samplerArray}[${i}],${uv});`
  ).join(``)}` +
  `return ${miss};`;

// prettier-ignore
export const CREATE_ATLAS_CROP = ({ crop, uv, bias }) =>
  `clamp(` +
    `mix(${crop}.xy,${crop}.zw,${uv}),` +
    `${crop}.xy+${bias},` +
    `${crop}.zw-${bias}` +
  `)`;

// prettier-ignore
export const CREATE_SAMPLING_FILTER = (after) => `` +
  `if(v>0.){` +
    // Stable per-pixel rotation; scale afterwards to preserve the blur axes.
    `float ra=rand(vec2(f))*RADIANS_360,rc=cos(ra),rs=sin(ra);` +
    `mat2 r=mat2(rc,rs,-rs,rc);` +
    `vec2 ` +
      `wh=vec2(v,uJ[1]);` +
      `ivec2 ` +
      `mn=ivec2(Z.xx),` +
      `mx=ivec2(ts)-1;` +

    `${[`zz`, `yz`, `zy`, `yy`].reduce(
      (acc, v) => (acc += `oCl+=texelFetch(uB,clamp(f+ivec2(roundEven((r*Z.${v})*wh)),mn,mx),0);`),
      ``,
    )}` +
    
    `${after}` +
  `}`;
