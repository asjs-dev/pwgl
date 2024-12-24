import { Utils } from "../utils/Utils";
import { LightTransformProps } from "../data/props/LightTransformProps";
import { Matrix3Utilities } from "../geom/Matrix3Utilities";
import { BaseDrawable } from "./BaseDrawable";

/**
 * <pre>
 *  Light
 * </pre>
 * @extends {BaseDrawable}
 * @property {LightTransformProps} transform
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

    this.RENDERING_TYPE = Light.RENDERING_TYPE;

    this.castShadow = this.shading = this.centerReflection = true;
    this.flattenShadow = false;
    this.angle = 0;
    this.spotAngle = 180 * Utils.THETA;
    this.type = Light.Type.POINT;
    this.precision = this.shadowLength = this.specularStrength = 1;
    this.maxShadowStep = 128;
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
    this._updateFlags();
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
    this._updateFlags();
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
    this._updateFlags();
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
    this._updateFlags();
  }

  /**
   * @ignore
   */
  get $transformClass() {
    return LightTransformProps;
  }

  /**
   * @ignore
   */
  $updateAdditionalData() {
    if (
      this.renderable &&
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
   * @ignore
   */
  _updateFlags() {
    this.flags =
      (this._castShadow * 1) |
      (this._shading * 2) |
      (this._flattenShadow * 4) |
      (this._centerReflection * 8);
  }
}

Light.RENDERING_TYPE = "light";

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
