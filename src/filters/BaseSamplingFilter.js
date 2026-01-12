import { BaseFilter } from "./BaseFilter";

/**
 * Base Sampling filter
 * @extends {BaseFilter}
 */
export class BaseSamplingFilter extends BaseFilter {
  /**
   * Creates an instance of BaseSamplingFilter.
   * @constructor
   * @param {number} intensityX
   * @param {number} intensityY
   * @param {number} isRadial
   * @param {number} centerX
   * @param {number} centerY
   * @param {number} size
   */
  constructor(
    intensityX,
    intensityY,
    isRadial = false,
    centerX = 0.5,
    centerY = 0.5,
    size = 1
  ) {
    super(intensityX);

    this.intensityY = intensityY;
    this.isRadial = isRadial;
    this.centerX = centerX;
    this.centerY = centerY;
    this.size = size;
  }

  /**
   * Set/Get is blur radial
   * @type {boolean}
   */
  get isRadial() {
    return this.v[2];
  }
  set isRadial(v) {
    this.v[2] = v ? 1 : 0;
  }

  /**
   * Set/Get center x
   * @type {number}
   */
  get centerX() {
    return this.v[3];
  }
  set centerX(v) {
    this.v[3] = v;
  }

  /**
   * Set/Get center y
   * @type {number}
   */
  get centerY() {
    return this.v[4];
  }
  set centerY(v) {
    this.v[4] = v;
  }

  /**
   * Set/Get size
   * @type {number}
   */
  get size() {
    return this.v[5];
  }
  set size(v) {
    this.v[5] = v;
  }
}

// prettier-ignore
BaseSamplingFilter.$createGLSL = (beforeLoop, inLoop, afterLoop = "") => "" +
  "vec2 " +
    "wh=vec2(v,vl[1]);" +

  "float " + 
    "lngWH=length(wh/ts);" +

  "if(lngWH>0.){" +
    "float " +
      "rd=rand(v0.zw)," +
      "rd2=.5+rand(v0.zw)*.5," +
      "cnt=1.," +
      "l=4.+ceil(4.*rd)," +
      "t=RADIANS_360/l;" +

    "vec2 " +
      "ps," +
      "dr=Z.yx," +
      "r=vec2(cos(t),sin(t));" +

    "vec4 " +
      "clg," +
      "cl=oCl;" +
      
    "ivec2 " +
      "mn=ivec2(Z.xx)," + 
      "mx=ivec2(ts)-1;" +

    "mat2 " + 
      "rot=mat2(r.x,-r.y,r.y,r.x);" +
      
    beforeLoop +
    "for(float i=0.;i<l;i++){" +
      "ps=wh*rd2*round(dr);" +
      "clg=texelFetch(uTx,clamp(" + 
        "f+ivec2(ps)," + 
        "mn,mx" +
      "),0);" +
      "dr*=rot;" +
      inLoop +
    "}" +
    afterLoop +
    "cl/=cnt;" +
    "float " +
      "dst=mix(" +
        "1.," +
        "clamp(distance(vec2(vl[3],vl[4]),v0.zw)*vl[5],0.,1.)," +
        "vl[2]" + 
      ");" +

    "oCl=dst*cl+(1.-dst)*oCl;" +
  "}";
