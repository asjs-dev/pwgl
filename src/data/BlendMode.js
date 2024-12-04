import { Const } from "../utils/Utils";

/**
 * @typedef {Object} BlendModeInfo
 * @property {string} functionName
 * @property {Array<number>} functions
 * @property {string} equationName
 * @property {Array<number>} equations
 */


/**
 * @typedef {function} createBlendMode
 * @param {Array<number>} functions
 * @param {Array<number>} equations
 * @returns {BlendModeInfo}
 */

/**
 * @typedef {Object} BlendMode
 * @property {createBlendMode} createBlendMode
 * @property {BlendModeInfo} NONE
 * @property {BlendModeInfo} NORMAL_PM
 * @property {BlendModeInfo} ADD_PM
 * @property {BlendModeInfo} MULTIPLY_PM
 * @property {BlendModeInfo} SCREEN_PM
 * @property {BlendModeInfo} ADD_NPM
 * @property {BlendModeInfo} SRC_IN
 * @property {BlendModeInfo} SRC_OUT
 * @property {BlendModeInfo} SRC_ATOP
 * @property {BlendModeInfo} DST_OVER
 * @property {BlendModeInfo} DST_IN
 * @property {BlendModeInfo} DST_OUT
 * @property {BlendModeInfo} DST_ATOP
 * @property {BlendModeInfo} XOR
 * @property {BlendModeInfo} NORMAL
 * @property {BlendModeInfo} ADD
 * @property {BlendModeInfo} MULTIPLY
 * @property {BlendModeInfo} SCREEN
 * @property {BlendModeInfo} OVERLAY
 * @property {BlendModeInfo} EXCLUSION
 * @property {BlendModeInfo} LIGHTEN
 * @property {BlendModeInfo} DARKEN
 * @property {BlendModeInfo} SHADOW
 */
export const BlendMode = (() => {
  const cb = (functions, equations) => ({
    functionName: "blendFunc" + (functions.length < 3 ? "" : "Separate"),
    functions: functions,
    equationName:
      "blendEquation" + (!equations || equations.length < 2 ? "" : "Separate"),
    equations: equations || [Const.FUNC_ADD],
  });

  return {
    createBlendMode: cb,

    NONE: cb([0, 0]),

    NORMAL_PM: cb([Const.ONE, Const.ONE_MINUS_SRC_ALPHA]),
    ADD_PM: cb([Const.ONE, Const.ONE]),
    MULTIPLY_PM: cb([
      Const.DST_COLOR,
      Const.ONE_MINUS_SRC_ALPHA,
      Const.ONE,
      Const.ONE_MINUS_SRC_ALPHA,
    ]),
    SCREEN_PM: cb([
      Const.ONE,
      Const.ONE_MINUS_SRC_COLOR,
      Const.ONE,
      Const.ONE_MINUS_SRC_ALPHA,
    ]),

    ADD_NPM: cb([Const.SRC_ALPHA, Const.ONE, Const.ONE, Const.ONE]),

    SRC_IN: cb([Const.DST_ALPHA, Const.ZERO]),
    SRC_OUT: cb([Const.ONE_MINUS_DST_ALPHA, Const.ZERO]),
    SRC_ATOP: cb([Const.DST_ALPHA, Const.ONE_MINUS_SRC_ALPHA]),
    DST_OVER: cb([Const.ONE_MINUS_DST_ALPHA, Const.ONE]),
    DST_IN: cb([Const.ZERO, Const.SRC_ALPHA]),
    DST_OUT: cb([Const.ZERO, Const.ONE_MINUS_SRC_ALPHA]),
    DST_ATOP: cb([Const.ONE_MINUS_DST_ALPHA, Const.SRC_ALPHA]),
    XOR: cb([Const.ONE_MINUS_DST_ALPHA, Const.ONE_MINUS_SRC_ALPHA]),

    NORMAL: cb([
      Const.SRC_ALPHA,
      Const.ONE_MINUS_SRC_ALPHA,
      Const.ONE,
      Const.ONE_MINUS_SRC_ALPHA,
    ]),
    ADD: cb([Const.SRC_ALPHA, Const.DST_ALPHA, Const.ONE, Const.DST_ALPHA]),
    MULTIPLY: cb([Const.DST_COLOR, Const.ZERO]),
    SCREEN: cb([
      Const.SRC_ALPHA,
      Const.ONE_MINUS_SRC_COLOR,
      Const.ONE,
      Const.ONE_MINUS_SRC_COLOR,
    ]),
    OVERLAY: cb([Const.ONE, Const.ONE_MINUS_SRC_ALPHA]),
    EXCLUSION: cb([Const.ONE_MINUS_DST_COLOR, Const.ONE_MINUS_SRC_COLOR]),
    LIGHTEN: cb([Const.ONE, Const.ONE], [Const.MAX]),
    DARKEN: cb([Const.ONE, Const.ONE], [Const.MIN]),
    SHADOW: cb([Const.DST_COLOR, Const.SRC_COLOR]),
  };
})();
