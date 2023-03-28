import { arraySet } from "../utils/helpers";
import { Utils } from "../utils/Utils";
import { LightProps } from "../data/props/LightProps";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import { BaseDrawable } from "./BaseDrawable";
import { Container } from "./Container";

/**
 * Light
 *  - Use LightRenderer.getLight() instead of new Light()
 * @extends {BaseDrawable}
 */
export class Light extends BaseDrawable {
  /**
   * Creates an instance of Light.
   * @constructor
   * @param {number} id
   * @param {Float32Array} lightData
   * @param {Float32Array} extensionData
   */
  constructor(id, lightData, extensionData) {
    super();

    /*
    this._castShadow
    this._shading
    this._flattenShadow
    this._colorProofReflection
    this._centerReflection
    */

    this.props = new LightProps();

    this.color.a = 0;

    this._id = id;
    this._matId = id * 16;
    this._quadId = this._matId + 4;
    this._octId = this._matId + 8;
    this._datId = this._matId + 12;

    this._lightData = lightData;
    this._extensionData = extensionData;

    this.castShadow = this.shading = true;
    this.flattenShadow = false;
    this.centerReflection = true;

    this.angle = 0;
    this.spotAngle = 180 * Utils.THETA;
    this.type = Light.Type.POINT;
    this.precision = this.diffuse = this.reflectionSize = 1;
    this.maxShadowStep = 128;
  }

  /**
   * Set/Get type of the Light
   * @type {number}
   */
  get type() {
    return this._extensionData[this._matId];
  }
  set type(v) {
    this._extensionData[this._matId] = v;
  }

  /**
   * Set/Get shadow casting
   * @type {boolean}
   */
  get castShadow() {
    return this._castShadow;
  }
  set castShadow(v) {
    this._castShadow = v;
    this._updateLightProps();
  }

  /**
   * Set/Get shading
   * @type {boolean}
   */
  get shading() {
    return this._shading;
  }
  set shading(v) {
    this._shading = v;
    this._updateLightProps();
  }

  /**
   * Set/Get flatten the shadow
   *  - Cast shadow if true and a pixel is higher or equal than the light z position
   *  - Cast shadow if false and a pixel is higher than the light z position
   * @type {boolean}
   */
  get flattenShadow() {
    return this._flattenShadow;
  }
  set flattenShadow(v) {
    this._flattenShadow = v;
    this._updateLightProps();
  }

  /**
   * Set/Get the surface reflects the color of the light
   *  - If it is false the surface reflects white color
   * @type {boolean}
   */
  get colorProofReflection() {
    return this._colorProofReflection;
  }
  set colorProofReflection(v) {
    this._colorProofReflection = v;
    this._updateLightProps();
  }

  /**
   * Set/Get is the reflection moves towards the center of the screen
   * @type {boolean}
   */
  get centerReflection() {
    return this._centerReflection;
  }
  set centerReflection(v) {
    this._centerReflection = v;
    this._updateLightProps();
  }

  /**
   * Set/Get the maximum step of shadow caster per pixel
   *  - Default value is 128
   * @type {number}
   */
  get maxShadowStep() {
    return this._extensionData[this._quadId];
  }
  set maxShadowStep(v) {
    this._extensionData[this._quadId] = v;
  }

  /**
   * Set/Get reflection size
   * @type {number}
   */
  get reflectionSize() {
    return this._extensionData[this._quadId + 1];
  }
  set reflectionSize(v) {
    this._extensionData[this._quadId + 1] = v;
  }

  /**
   * Set/Get shadow precision
   *  - Default value is 1
   * @type {number}
   */
  get precision() {
    return this._extensionData[this._matId + 3];
  }
  set precision(v) {
    this._extensionData[this._matId + 3] = v;
  }

  /**
   * Set/Get rotation of the light
   * @type {number}
   */
  get angle() {
    return this._lightData[this._datId + 3];
  }
  set angle(v) {
    this._lightData[this._datId + 3] = v;
  }

  /**
   * Set/Get angle of the light source
   *  - Default value is 180deg - hemisphere
   *  - 360deg - sphere
   * @type {number}
   */
  get spotAngle() {
    return this._lightData[this._matId + 7];
  }
  set spotAngle(v) {
    this._lightData[this._matId + 7] = v;
  }

  /**
   * Returns true if the light is renderable
   * @returns {boolean}
   */
  isOn() {
    return this.renderable && this.stage !== null;
  }

  /**
   * Update Light properties
   */
  update() {
    const lightData = this._lightData;
    const datId = this._datId;

    if (this.isOn()) {
      this._updateProps();
      this._updateColor();

      lightData[datId] = lightData[datId - 1] > 0 ? 1 : 0;
      lightData[datId + 1] = this.diffuse;
      lightData[datId + 2] = this.props.alpha;

      lightData[this._matId + 6] = this.props.width;

      this._extensionData[this._matId + 2] = this.props.z;
    } else lightData[datId] = 0;
  }

  /**
   * @ignore
   */
  _updateLightProps() {
    this._extensionData[this._matId + 1] =
      (this._castShadow * 1) |
      (this._shading * 2) |
      (this._flattenShadow * 4) |
      (this._colorProofReflection * 8) |
      (this._centerReflection * 16);
  }

  /**
   * @ignore
   */
  _updateAdditionalData() {
    if (
      this.isOn() &&
      this._currentAdditionalPropsUpdateId < this.propsUpdateId
    ) {
      this._currentAdditionalPropsUpdateId = this.propsUpdateId;
      this._calcBounds();
    }
  }

  /**
   * @ignore
   */
  _calcCorners() {
    Matrix3Utilities.calcCorners(
      this.matrixCache,
      this._corners,
      this.stage.renderer
    );

    const corners = this._corners;

    const a = corners[0];
    const b = corners[1];
    const c = corners[2];
    const d = corners[3];

    a.x += a.x - d.x + (a.x - c.x);
    a.y += a.y - d.y + (a.y - c.y);
    c.x += c.x - b.x;
    c.y += c.y - b.y;
    d.x += d.x - b.x;
    d.y += d.y - b.y;
  }

  /**
   * @param {LightProps} props
   * @param {Container} parent
   * @ignore
   */
  _updateTransform(props, parent) {
    super._updateTransform(props, parent);

    arraySet(this._lightData, this.matrixCache, this._matId);
  }

  /**
   * @ignore
   */
  _updateColor() {
    const color = this.color;

    if (this._currentColorUpdateId < color.updateId) {
      this._currentColorUpdateId = color.updateId;

      const lightData = this._lightData;
      const parentColorCache = this._parent.colorCache;

      const colId = this._octId;

      lightData[colId] = parentColorCache[0] * color.r;
      lightData[colId + 1] = parentColorCache[1] * color.g;
      lightData[colId + 2] = parentColorCache[2] * color.b;
      lightData[colId + 3] = parentColorCache[3] * color.a;
    }
  }
}

/**
 * Light type
 * @member
 * @property {number} POINT Like a lamp light source
 * @property {number} DIRECTIONAL Like sunlight
 */
Light.Type = {
  POINT: 0,
  DIRECTIONAL: 1,
};
