import { noop } from "../../common/utils/noop";
import { Color } from "../attributes/Color";
import { ItemTransform } from "../attributes/ItemTransform";
import { Matrix3Utilities } from "../math/Matrix3Utilities";
import "../math/RectangleType";
import { nextVersion } from "../utils/nextVersion";

/**
 * Item
 * @property {Item.Type} TYPE
 * @property {Array<number>} matrixCache
 * @property {Array<number>} colorCache
 * @property {boolean} interactive
 * @property {boolean} renderable
 * @property {Container} parent
 * @property {ItemTransform} transform
 * @property {Color} color
 * @property {number} alpha
 * @property {boolean} transformUpdated
 * @property {boolean} colorUpdated
 * @property {function} callbackBeforeRender
 * @property {function} callbackAfterRender
 */
export class Item {
  /**
   * Creates an instance of Item.
   * @constructor
   */
  constructor() {
    this.RENDERING_TYPE = Item.RENDERING_TYPE;

    this.matrixCache = Matrix3Utilities.identity();
    this.colorCache = new Float32Array([1, 1, 1, 1]);
    this.transform = new this.$transformClass();
    this.color = new Color();
    this.alpha = 1;
    this.callbackBeforeRender = this.callbackAfterRender = noop;
    this.renderable = true;
    this.$bounds = { x: 0, y: 0, width: 0, height: 0 };
    this.$colorVersion = this.$transformVersion = nextVersion();
    this.$parentColorVersion = this.$parentTransformVersion = -1;
  }

  /**
   * Get StageContainer
   * @readonly
   * @type {StageContainer}
   */
  get stage() {
    return this.parent ? this.parent.stage : null;
  }

  /**
   * <pre>
   *  Set/Get before render callback
   *    - It will be called before the Item rendered
   * </pre>
   * @type {function}
   */
  get callbackBeforeRender() {
    return this.$callbackBeforeRender;
  }
  set callbackBeforeRender(v) {
    this.$callbackBeforeRender = v ?? noop;
  }

  /**
   * <pre>
   *  Set/Get after render callback
   *    - It will be called after the Item rendered
   * </pre>
   * @type {function}
   */
  get callbackAfterRender() {
    return this.$callbackAfterRender;
  }
  set callbackAfterRender(v) {
    this.$callbackAfterRender = v ?? noop;
  }

  /**
   * <pre>
   *  Handle event
   *    - It can handle mouse events if the item is interactive and has [
   *      onPointerOver,
   *      onPointerOut,
   *      onPointerMove,
   *      onPointerDown,
   *      onPointerUp,
   *      onPointerClick
   *    ] function
   * </pre>
   * @param {*} event
   */
  callEventHandler(target, event) {
    if (this.interactive) {
      const callback = this["on" + event.type];
      callback && callback(this, target, event);
    }

    const { parent } = this;
    parent && parent.callEventHandler(target, event);
  }

  /**
   * Destruct class
   */
  destruct() {
    this.remove();
  }

  /**
   * Remove Item from parent
   */
  remove() {
    const { parent } = this;
    parent && parent.removeChild(this);
  }

  /**
   * <pre>
   *  Update color and transform values
   *    - A channel is recalculated only when the own attribute or the parent's version of that
   *      channel changed since the last update, and then gets a new version for the children
   * </pre>
   */
  update() {
    const { transform, color, parent } = this;
    const { $colorVersion, $transformVersion } = parent;

    color.update();

    this.colorUpdated = color.updated || $colorVersion !== this.$parentColorVersion;

    if (this.colorUpdated) {
      const { colorCache } = this;
      const originalColorCache = color.cache;
      const parentColorCache = parent.colorCache;

      this.$parentColorVersion = $colorVersion;
      this.$colorVersion = nextVersion();

      colorCache[0] = parentColorCache[0] * originalColorCache[0];
      colorCache[1] = parentColorCache[1] * originalColorCache[1];
      colorCache[2] = parentColorCache[2] * originalColorCache[2];
      colorCache[3] = parentColorCache[3] * originalColorCache[3];
    }

    transform.update();

    this.transformUpdated = transform.updated || $transformVersion !== this.$parentTransformVersion;

    if (this.transformUpdated) {
      this.$parentTransformVersion = $transformVersion;
      this.$transformVersion = nextVersion();

      Matrix3Utilities.transform(this.matrixCache, parent.matrixCache, transform);
    }
  }

  /**
   * @ignore
   */
  get $transformClass() {
    return ItemTransform;
  }
}

/**
 * Type "item"
 * @string
 */
Item.RENDERING_TYPE = "item";
