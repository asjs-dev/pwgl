import { emptyFunction } from "../utils/helpers.js";
import "../namespace.js";
import "./Image.js";

AGL.AnimatedImage = class extends AGL.Image {
  constructor(texture) {
    super(texture);

    this.frameLength = 120;
    this.frames = [];

    this.frame =
    this._currentRenderTime = 0;

    this.updateAnimation;
    this.stop();
  }

  get isPlaying() { return this.updateAnimation === this._updateAnimation; }

  gotoAndStop(frame) {
    this.stop();
    this.frame = frame;
    this._useTextureFrame();
  }

  gotoAndPlay(frame) {
    this.frame = frame;
    this.play();
  }

  stop() {
    this.updateAnimation = emptyFunction;
  }

  play() {
    this.updateAnimation = this._updateAnimation;
  }

  update(renderTime) {
    super.update();
    this.updateAnimation(renderTime);
  }

  destruct() {
    this.stop();
    super.destruct();
  }

  _updateAnimation(renderTime) {
    const ellapsedTime = renderTime - this._currentRenderTime;
    if (ellapsedTime > this.frameLength) {
      this._currentRenderTime = renderTime;
      this.frame += ~~(ellapsedTime / this.frameLength);
      this.frame >= this.frames.length && (this.frame = 0);

      this._useTextureFrame();
    }
  }

  _useTextureFrame() {
    this.textureCrop.setRect(this.frames[this.frame]);
  }
}
