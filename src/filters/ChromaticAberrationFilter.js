import { BaseFilter } from "./BaseFilter.js";

export class ChromaticAberrationFilter extends BaseFilter {
  constructor(intensity, isRadial, centerX, centerY, size) {
    super(8, 0, intensity);

    this.isRadial = isRadial || false;
    this.centerX = centerX || 0;
    this.centerY = centerY || 0;
    this.size = size || 1;
  }

  get isRadial() {
    return this.v[2] === 1;
  }
  set isRadial(v) {
    this.v[2] = v ? 1 : 0;
  }

  get centerX() {
    return this.v[3];
  }
  set centerX(v) {
    this.v[3] = v;
  }

  get centerY() {
    return this.v[4];
  }
  set centerY(v) {
    this.v[4] = v;
  }

  get size() {
    return this.v[5];
  }
  set size(v) {
    this.v[5] = v;
  }
}
