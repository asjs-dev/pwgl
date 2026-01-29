import { Image } from "./Image";
import { TextureInfo } from "../textures/TextureInfo";
import "../math/RectangleType";
import { noop } from "../../extensions/utils/noop";

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
 * @property {number} frameLength
 * @property {boolean} isPlaying
 */
export class AnimatedImage extends Image {
  /**
   * Creates an instance of AnimatedImage.
   * @constructor
   * @param {TextureInfo} texture
   */
  constructor(texture) {
    super(texture);

    this._frame = 0;
    this.frameLength = this._currentFrameLength = 120;

    this._frames = [];
    this._currentRenderTime = Date.now();

    this.stop();
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
    this._frame = frame;
    this._useTextureFrame();
  }

  /**
   * Go to a frame and play
   * @param {number} frame
   */
  gotoAndPlay(frame) {
    this._frame = frame;
    this.play();
  }

  /**
   * Stop the animation
   */
  stop() {
    this._updateAnimationFv = noop;
    this.isPlaying = false;
  }

  /**
   * Play the animation
   */
  play() {
    this._updateAnimationFv = this._updateAnimation;
    this.isPlaying = true;
    this._useTextureFrame();
  }

  /**
   * Update the animation
   * @param {number} renderTime
   */
  update(renderTime) {
    super.update();
    this._updateAnimationFv(renderTime);
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
      this._frame += ~~(ellapsedTime / this._currentFrameLength);
      if (this._frame >= this._frames.length) this._frame = 0;

      this._useTextureFrame();
    }
  }

  /**
   * @ignore
   */
  _useTextureFrame() {
    const selectedFrame = this._frames[this._frame];
    this.textureCrop.setRect(selectedFrame);
    this._currentFrameLength = selectedFrame.length ?? this.frameLength;
  }
}
