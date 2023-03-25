export class FilterTextureProps {
  constructor(
    filter,
    texture,
    translateX,
    translateY,
    cropX,
    cropY,
    cropWidth,
    cropHeight
  ) {
    this._filter = filter;
    this.texture = texture;
    this.translateX = translateX || 0;
    this.translateY = translateY || 0;
    this.cropX = cropX || 0;
    this.cropY = cropY || 0;
    this.cropWidth = cropWidth || 1;
    this.cropHeight = cropHeight || 1;
  }

  get translateX() {
    return this._filter.v[1];
  }
  set translateX(v) {
    this._filter.v[1] = v;
  }

  get translateY() {
    return this._filter.v[2];
  }
  set translateY(v) {
    this._filter.v[2] = v;
  }

  get cropX() {
    return this._filter.v[3];
  }
  set cropX(v) {
    this._filter.v[3] = v;
  }

  get cropY() {
    return this._filter.v[4];
  }
  set cropY(v) {
    this._filter.v[4] = v;
  }

  get cropWidth() {
    return this._filter.v[5];
  }
  set cropWidth(v) {
    this._filter.v[5] = v;
  }

  get cropHeight() {
    return this._filter.v[6];
  }
  set cropHeight(v) {
    this._filter.v[6] = v;
  }
}
