import { noop } from "../../common/utils/noop";
import "../math/RectangleType";
import { TextureInfo } from "../textures/TextureInfo";
import { Image } from "./Image";

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

    this.$frame = 0;
    this.frameLength = this.$currentFrameLength = 120;

    this.$frames = [];
    this.$currentRenderTime = Date.now();

    this.stop();
  }

  /**
   * Set/Get frames
   * @type {Array<Frame>}
   */
  get frames() {
    return this.$frames;
  }
  set frames(v) {
    this.$frames = v;
    const firstFrame = this.$frames[0];
    if (firstFrame) {
      this.$currentFrameLength = firstFrame.length ?? this.frameLength;
      this.$currentRenderTime = Date.now();
    }
  }

  /**
   * Go to a frame and stop
   * @param {number} frame
   */
  gotoAndStop(frame) {
    this.stop();
    this.$frame = frame;
    this.$useTextureFrame();
  }

  /**
   * Go to a frame and play
   * @param {number} frame
   */
  gotoAndPlay(frame) {
    this.$frame = frame;
    this.play();
  }

  /**
   * Stop the animation
   */
  stop() {
    this.$updateAnimationFv = noop;
    this.isPlaying = false;
  }

  /**
   * Play the animation
   */
  play() {
    this.$updateAnimationFv = this.$updateAnimation;
    this.isPlaying = true;
    this.$useTextureFrame();
  }

  /**
   * Update the animation
   * @param {number} renderTime
   */
  update(renderTime) {
    super.update();
    this.$updateAnimationFv(renderTime);
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
  $updateAnimation(renderTime) {
    const ellapsedTime = renderTime - this.$currentRenderTime;
    if (ellapsedTime > this.$currentFrameLength) {
      this.$currentRenderTime = renderTime;
      this.$frame += ~~(ellapsedTime / this.$currentFrameLength);
      if (this.$frame >= this.$frames.length) {
        this.$frame = 0;
      }
      this.$useTextureFrame();
    }
  }

  /**
   * @ignore
   */
  $useTextureFrame() {
    const selectedFrame = this.$frames[this.$frame];
    this.textureCrop.setRect(selectedFrame);
    this.$currentFrameLength = selectedFrame.length ?? this.frameLength;
  }
}
