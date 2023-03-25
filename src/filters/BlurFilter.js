import { BaseFilter } from "./BaseFilter.js";

export class BlurFilter extends BaseFilter {
  constructor(intensityX, intensityY, isRadialBlur, centerX, centerY, size) {
    super(4, 1, intensityX);

    this.intensityY = intensityY;
    this.isRadialBlur = isRadialBlur || false;
    this.centerX = centerX || 0;
    this.centerY = centerY || 0;
    this.size = size || 1;
  }

  get isRadialBlur() {
    return this.v[2] === 1;
  }
  set isRadialBlur(v) {
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
