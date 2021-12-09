export class DistortionProps {
  constructor() {
    this.distortTexture = true;

    this.items = [
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ];
  }

  get topLeftX() { return this.items[0]; }
  set topLeftX(v) { this.items[0] = v; }

  get topLeftY() { return this.items[1]; }
  set topLeftY(v) { this.items[1] = v; }

  get topRightX() { return this.items[2]; }
  set topRightX(v) { this.items[2] = v; }

  get topRightY() { return this.items[3]; }
  set topRightY(v) { this.items[3] = v; }

  get bottomRightX() { return this.items[4]; }
  set bottomRightX(v) { this.items[4] = v; }

  get bottomRightY() { return this.items[5]; }
  set bottomRightY(v) { this.items[5] = v; }

  get bottomLeftX() { return this.items[6]; }
  set bottomLeftX(v) { this.items[6] = v; }

  get bottomLeftY() { return this.items[7]; }
  set bottomLeftY(v) { this.items[7] = v; }
}
