export class BaseFilter {
  constructor(type, subType, intensity) {
    this.TYPE = type;
    this.SUB_TYPE = subType;
    this.on = true;

    this.v = new Float32Array(9);

    this.kernels = new Float32Array(16);

    this.intensity = intensity || 0;
  }

  get intensity() {
    return this.v[0];
  }
  set intensity(v) {
    this.v[0] = v;
  }

  get intensityX() {
    return this.v[0];
  }
  set intensityX(v) {
    this.v[0] = v;
  }

  get intensityY() {
    return this.v[1];
  }
  set intensityY(v) {
    this.v[1] = v;
  }

  get r() {
    return this.v[2];
  }
  set r(v) {
    this.v[2] = v;
  }

  get g() {
    return this.v[3];
  }
  set g(v) {
    this.v[3] = v;
  }

  get b() {
    return this.v[4];
  }
  set b(v) {
    this.v[4] = v;
  }
}
