import { TextureInfo } from "../data/texture/TextureInfo";
import { noop } from "../utils/helpers";
import { Image } from "./Image";

/**
 * Animated Image
 * @extends {Image}
 */
export class AnimatedImage extends Image {
  /**
   * Creates an instance of AnimatedImage.
   * @constructor
   * @param {TextureInfo} texture
   */
  constructor(texture) {
    super(texture);

    this.frameLength = 120;
    this.frames = [];

    this.frame = 0;
    this._currentRenderTime = Date.now();

    this.updateAnimation;
    this.stop();
  }

  /**
   * Returns is animation playing
   * @readonly
   * @type {boolean}
   */
  get isPlaying() {
    return this.updateAnimation === this._updateAnimation;
  }

  /**
   * Go to a frame and stop
   * @param {number} frame
   */
  gotoAndStop(frame) {
    this.stop();
    this.frame = frame;
    this._useTextureFrame();
  }

  /**
   * Go to a frame and play
   * @param {number} frame
   */
  gotoAndPlay(frame) {
    this.frame = frame;
    this.play();
  }

  /**
   * Stop the animation
   */
  stop() {
    this.updateAnimation = noop;
  }

  /**
   * Play the animation
   */
  play() {
    this.updateAnimation = this._updateAnimation;
    this._useTextureFrame();
  }

  /**
   * Update the animation
   * @param {number} renderTime
   */
  update(renderTime) {
    super.update();
    this.updateAnimation(renderTime);
  }

  /**
   * Destruct class
   */
  destruct() {
    this.stop();
    super.destruct();
  }

  /**
   * @param {number} renderTime
   * @ignore
   */
  _updateAnimation(renderTime) {
    const ellapsedTime = renderTime - this._currentRenderTime;
    if (ellapsedTime > this.frameLength) {
      this._currentRenderTime = renderTime;
      this.frame += ~~(ellapsedTime / this.frameLength);
      this.frame >= this.frames.length && (this.frame = 0);

      this._useTextureFrame();
    }
  }

  /**
   * @ignore
   */
  _useTextureFrame() {
    this.textureCrop.setRect(this.frames[this.frame]);
  }
}
