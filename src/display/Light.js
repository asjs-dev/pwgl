import { arraySet } from "../utils/helpers";
import { Utils } from "../utils/Utils";
import { LightProps } from "../data/props/LightProps";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import { BaseDrawable } from "./BaseDrawable";
import { Container } from "./Container";

const TEMP_ARRAY = [];

/**
 * <pre>
 *  Light
 *    - Register every Light instance to a LightRenderer
 *      with LightRenderer.registerLight
 *      and unregister with LightRenderer.unregisterLight
 * </pre>
 * @extends {BaseDrawable}
 * @property {LightProps} props
 * @property {number} type - Type of the Light
 * @property {number} maxShadowStep - The maximum step of shadow caster per pixel
 *                                  - Default value is 128
 * @property {number} specularStrength - Strength of specular light
 * @property {number} precision - Shadow precision
 *                              - Default value is 1
 * @property {number} angle - Rotation of the light
 * @property {number} spotAngle - Angle of the light source
 *                              - Default value is 180deg [hemisphere]
 *                              - 360deg [sphere]
 */
export class Light extends BaseDrawable {
  /**
   * Creates an instance of Light.
   * @constructor
   */
  constructor() {
    super();

    this.props = new LightProps();

    this.unregisterData();

    this.castShadow = this.shading = this.centerReflection = true;
    this.flattenShadow = false;

    this.angle = 0;
    this.spotAngle = 180 * Utils.THETA;
    this.type = Light.Type.POINT;
    this.precision = this.shadowLength = this.specularStrength = 1;
    this.maxShadowStep = 128;
  }

  /**
   * @ignore
   */
  registerData(id, lightData, extensionData) {
    this._id = id;
    this._lightDataId = id * 16;
    this._extensionDataId = id * 8;

    this._lightData = lightData;
    this._extensionData = extensionData;

    this.$currentColorUpdateId = -1;

    this._updateLightProps();
  }

  /**
   * @ignore
   */
  unregisterData() {
    this.registerData(0, TEMP_ARRAY, TEMP_ARRAY);
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
   * <pre>
   *  Set/Get flatten the shadow
   *    - Cast shadow if true and a pixel is higher or equal than the light z position
   *    - Cast shadow if false and a pixel is higher than the light z position
   * </pre>
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
    const lightDataId = this._lightDataId;

    if (this.isOn()) {
      super.update();
      this._updateColor();

      const extensionDataId = this._extensionDataId;
      const extensionData = this._extensionData;

      extensionData[extensionDataId] = this.type;
      extensionData[extensionDataId + 2] = this.props.z;
      extensionData[extensionDataId + 3] = this.precision;
      extensionData[extensionDataId + 4] = this.maxShadowStep;
      extensionData[extensionDataId + 5] = this.specularStrength;

      lightData[lightDataId + 6] = this.props.width;
      lightData[lightDataId + 7] = this.spotAngle;
      lightData[lightDataId + 12] = lightData[lightDataId + 11] > 0 ? 1 : 0;
      lightData[lightDataId + 13] = this.shadowLength;
      lightData[lightDataId + 14] = this.props.alpha;
      lightData[lightDataId + 15] = this.angle;
    } else lightData[lightDataId + 12] = 0;
  }

  /**
   * @ignore
   */
  _updateLightProps() {
    this._extensionData[this._extensionDataId + 1] =
      (this._castShadow * 1) |
      (this._shading * 2) |
      (this._flattenShadow * 4) |
      (this._centerReflection * 8);
  }

  /**
   * @ignore
   */
  $updateAdditionalData() {
    if (
      this.isOn() &&
      this.$currentAdditionalPropsUpdateId < this.propsUpdateId
    ) {
      this.$currentAdditionalPropsUpdateId = this.propsUpdateId;
      this.$calcBounds();
    }
  }

  /**
   * @ignore
   */
  $calcCorners() {
    Matrix3Utilities.calcCorners(
      this.matrixCache,
      this.$corners,
      this.stage.renderer
    );

    const corners = this.$corners;

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
  $updateTransform(props, parent) {
    super.$updateTransform(props, parent);

    arraySet(this._lightData, this.matrixCache, this._lightDataId);
  }

  /**
   * @ignore
   */
  _updateColor() {
    const color = this.color;

    if (this.$currentColorUpdateId < color.updateId) {
      this.$currentColorUpdateId = color.updateId;

      const lightData = this._lightData;
      const parentColorCache = this.$parent.colorCache;
      const lightDataId = this._lightDataId;

      lightData[lightDataId + 8] = parentColorCache[0] * color.r;
      lightData[lightDataId + 9] = parentColorCache[1] * color.g;
      lightData[lightDataId + 10] = parentColorCache[2] * color.b;
      lightData[lightDataId + 11] = parentColorCache[3] * color.a;
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
