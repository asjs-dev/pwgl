export class WaterRenderer extends AGL.Container {
  constructor(noiseTexture, speed) {
    super();

    this._speed = speed;
    this._width = 1;
    this._height = 1;

    const heightMapTexture = AGL.Texture.loadImage(noiseTexture);
    heightMapTexture.magFilter = AGL.Const.LINEAR;

    this._waterDisplacementImageLarge = new AGL.Image(heightMapTexture);
    this._waterDisplacementImageLarge.textureTransform.repeatX = 0.7;
    this._waterDisplacementImageLarge.tintType = AGL.Image.TintType.GRAYSCALE;
    this._waterDisplacementImageLarge.color.set(0, 0.1, 0.75, 1);
    this.addChild(this._waterDisplacementImageLarge);

    this._waterDisplacementImageSmall = new AGL.Image(heightMapTexture);
    this._waterDisplacementImageSmall.blendMode = AGL.BlendMode.ADD;
    this._waterDisplacementImageSmall.textureTransform.repeatX = 4;
    this._waterDisplacementImageSmall.textureTransform.repeatRandomRotation = 1;
    this._waterDisplacementImageSmall.tintType = AGL.Image.TintType.GRAYSCALE;
    this._waterDisplacementImageSmall.color.set(0, 0.06, 0.75, 1);
    this.addChild(this._waterDisplacementImageSmall);

    this._moveTarget = { x: 0, y: 0 };

    this._wave = 0;
  }

  setSize(w, h) {
    this._width = w;
    this._height = h;

    const ratio = h / w;

    this._waterDisplacementImageSmall.transform.width =
      this._waterDisplacementImageLarge.transform.width = w;

    this._waterDisplacementImageSmall.transform.height =
      this._waterDisplacementImageLarge.transform.height = h;

    this._waterDisplacementImageSmall.textureTransform.repeatY =
      this._waterDisplacementImageSmall.textureTransform.repeatX * ratio;

    this._waterDisplacementImageLarge.textureTransform.repeatY =
      this._waterDisplacementImageLarge.textureTransform.repeatX * ratio;
  }

  render(delay) {
    const waveSpeedX = this._speed * delay;
    const waveSpeedY = waveSpeedX * 2;

    this._wave += waveSpeedX * 2.5;
    const sinWave = Math.sin(this._wave) * 0.3;
    const cosWave = Math.cos(this._wave) * 0.3;

    let textureTransform = this._waterDisplacementImageLarge.textureTransform;
    textureTransform.x =
      this._moveTarget.x * textureTransform.repeatX +
      ((waveSpeedX * 0.75 + sinWave) % 1);
    textureTransform.y =
      this._moveTarget.y * textureTransform.repeatY +
      ((waveSpeedY * 0.75 + cosWave) % 1);

    textureTransform = this._waterDisplacementImageSmall.textureTransform;
    textureTransform.x =
      this._moveTarget.x * textureTransform.repeatX +
      ((waveSpeedX - sinWave) % 1);
    textureTransform.y =
      this._moveTarget.y * textureTransform.repeatY +
      ((waveSpeedY - cosWave) % 1);
  }

  move(x, y) {
    this._moveTarget.x = x / this._width;
    this._moveTarget.y = y / this._height;
  }
}
