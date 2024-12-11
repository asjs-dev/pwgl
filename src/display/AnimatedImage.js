import { TextureInfo } from "../data/texture/TextureInfo";
import { noop } from "../utils/helpers";
import { Image } from "./Image";
import "../geom/RectangleType";

/**
 * Frame
 * @typedef {Object} Frame
 * @extends {Rectangle}
 * @property {number} length - optional frame length
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * Animated Image
 * @extends {Image}
 */
export class AnimatedImage extends Image {
  /**
   * Creates an instance of AnimatedImage.
   * @constructor
   * @param {TextureInfo} texture
   * @property {number} frameLength
   * @property {number} frame
   */
  constructor(texture) {
    super(texture);

    this._currentFrameLength = this.frameLength = 120;
    this._frames = [];

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
   * Set/Get frames
   * @type {Array<Frame>}
   */
  get frames() {
    return this._frames;
  }
  set frames(v) {
    this._frames = v;
    const firstFrame = this._frames[0];
    if (firstFrame) {
      this._currentFrameLength = firstFrame.length ?? this.frameLength;
      this._currentRenderTime = Date.now();
    }
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
    if (ellapsedTime > this._currentFrameLength) {
      this._currentRenderTime = renderTime;
      this.frame += ~~(ellapsedTime / this._currentFrameLength);
      if (this.frame >= this._frames.length) this.frame = 0;

      this._useTextureFrame();
    }
  }

  /**
   * @ignore
   */
  _useTextureFrame() {
    const selectedFrame = this._frames[this.frame];
    this.textureCrop.setRect(selectedFrame);
    this._currentFrameLength = selectedFrame.length ?? this.frameLength;
  }
}
