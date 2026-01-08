export const AnimatedWater = window.AGL
  ? class AnimatedWater extends AGL.Container {
      constructor(noiseTexture, speed = 1, level = 0, scale = 1) {
        super();

        this._width = 1;
        this._height = 1;

        const heightMapTexture = AGL.Texture.loadImage(noiseTexture);
        heightMapTexture.magFilter = AGL.Const.LINEAR;

        this._backdropImage = new AGL.Image();
        this.addChild(this._backdropImage);

        this._waterDisplacementImageLarge = new AGL.Image(heightMapTexture);
        this._waterDisplacementImageLarge.blendMode = AGL.BlendMode.ADD;
        this._waterDisplacementImageLarge.textureTransform.repeatX = 0.7;
        this._waterDisplacementImageLarge.tintType =
          AGL.Image.TintType.GRAYSCALE;
        this.addChild(this._waterDisplacementImageLarge);

        this._waterDisplacementImageSmall = new AGL.Image(heightMapTexture);
        this._waterDisplacementImageSmall.blendMode = AGL.BlendMode.ADD;
        this._waterDisplacementImageSmall.textureTransform.repeatX = 4;
        this._waterDisplacementImageSmall.textureTransform.repeatRandomRotation = 1;
        this._waterDisplacementImageSmall.tintType =
          AGL.Image.TintType.GRAYSCALE;
        this.addChild(this._waterDisplacementImageSmall);

        this.speed = speed;
        this.level = level;
        this.scale = scale;

        this._moveTarget = { x: 0, y: 0 };

        this._wave = 0;
      }

      get speed() {
        return this._speed;
      }

      set speed(v) {
        this._speed = v;
      }

      get scale() {
        return this._scale;
      }

      set scale(v) {
        this._scale = v;
        this._waterDisplacementImageLarge.color.set(0, 0.1 * v, 0.75, 1);
        this._waterDisplacementImageSmall.color.set(0, 0.06 * v, 0.75, 1);
      }

      get level() {
        return this._level;
      }

      set level(v) {
        this._level = v;
        this._backdropImage.color.g = v;
      }

      setSize(w, h) {
        this._width = w;
        this._height = h;

        const ratio = h / w;

        this._waterDisplacementImageSmall.transform.width =
          this._waterDisplacementImageLarge.transform.width =
          this._backdropImage.transform.width =
            w;

        this._waterDisplacementImageSmall.transform.height =
          this._waterDisplacementImageLarge.transform.height =
          this._backdropImage.transform.height =
            h;

        this._waterDisplacementImageSmall.textureTransform.repeatY =
          this._waterDisplacementImageSmall.textureTransform.repeatX * ratio;

        this._waterDisplacementImageLarge.textureTransform.repeatY =
          this._waterDisplacementImageLarge.textureTransform.repeatX * ratio;
      }

      render(delay) {
        const waveSpeedX = this._speed * delay,
          waveSpeedY = waveSpeedX * 2;

        this._wave += waveSpeedX * 2.5;
        const sinWave = Math.sin(this._wave) * 0.3,
          cosWave = Math.cos(this._wave) * 0.3;

        let textureTransform =
          this._waterDisplacementImageLarge.textureTransform;
        textureTransform.x =
          this._moveTarget.x * textureTransform.repeatX +
          ((waveSpeedX * 0.75 + sinWave) % 1);
        textureTransform.y =
          this._moveTarget.y * textureTransform.repeatY +
          ((waveSpeedY * 0.75 + cosWave) % 1);

        textureTransform = this._waterDisplacementImageSmall.textureTransform;
        textureTransform.x =
          this._moveTarget.x * textureTransform.repeatX +
          ((waveSpeedX * 2 - sinWave) % 1);
        textureTransform.y =
          this._moveTarget.y * textureTransform.repeatY +
          ((waveSpeedY * 2 - cosWave) % 1);
      }

      move(x, y) {
        this._moveTarget.x = x / this._width;
        this._moveTarget.y = y / this._height;
      }
    }
  : null;
