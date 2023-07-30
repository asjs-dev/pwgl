export class WaterRenderer extends AGL.Container {
  constructor(noiseTexture, speed) {
    super();

    this._speed = speed;
    this._width = 1;
    this._height = 1;

    const heightMapTexture = AGL.Texture.loadImage(noiseTexture);

    this._waterDisplacementImageLarge = new AGL.Image(heightMapTexture);
    this._waterDisplacementImageLarge.textureProps.repeatX = 1;
    this._waterDisplacementImageLarge.tintType = AGL.Image.TintType.GRAYSCALE;
    this._waterDisplacementImageLarge.color.set(0, .1, .5, 1);
    this.addChild(this._waterDisplacementImageLarge);

    this._waterDisplacementImageSmall = new AGL.Image(heightMapTexture);
    this._waterDisplacementImageSmall.blendMode = AGL.BlendMode.ADD;
    this._waterDisplacementImageSmall.textureProps.repeatX = 4;
    this._waterDisplacementImageSmall.textureProps.repeatRandomRotation = 1;
    this._waterDisplacementImageSmall.tintType = AGL.Image.TintType.GRAYSCALE;
    this._waterDisplacementImageSmall.color.set(0, .04, .5, 1);
    this.addChild(this._waterDisplacementImageSmall);

    this._moveTarget = { x: 0, y: 0 };

    this._wave = 0;
  }

  setSize(w, h) {
    this._width = w;
    this._height = h;

    const ratio = h / w;

    this._waterDisplacementImageSmall.props.width =
      this._waterDisplacementImageLarge.props.width = w;

    this._waterDisplacementImageSmall.props.height =
      this._waterDisplacementImageLarge.props.height = h;

    this._waterDisplacementImageSmall.textureProps.repeatY =
      this._waterDisplacementImageSmall.textureProps.repeatX * ratio;

    this._waterDisplacementImageLarge.textureProps.repeatY =
      this._waterDisplacementImageLarge.textureProps.repeatX * ratio;
  }

  render(delay) {
    const waveSpeedX = this._speed * delay;
    const waveSpeedY = waveSpeedX * 2;

    this._wave += waveSpeedX * 2.5;
    const sinWave = Math.sin(this._wave) * .3;
    const cosWave = Math.cos(this._wave) * .3;

    let textureProps;

    textureProps = this._waterDisplacementImageLarge.textureProps;
    textureProps.x =
      this._moveTarget.x * textureProps.repeatX +
      ((waveSpeedX * .75 + sinWave) % 1);
    textureProps.y =
      this._moveTarget.y * textureProps.repeatY +
      ((waveSpeedY * .75 + cosWave) % 1);

    textureProps = this._waterDisplacementImageSmall.textureProps;
    textureProps.x =
      this._moveTarget.x * textureProps.repeatX + ((waveSpeedX - sinWave) % 1);
    textureProps.y =
      this._moveTarget.y * textureProps.repeatY + ((waveSpeedY - cosWave) % 1);
  }

  move(x, y) {
    this._moveTarget.x = x / this._width;
    this._moveTarget.y = y / this._height;
  }
}
