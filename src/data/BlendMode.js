import { Const } from "../utils/Utils.js";

const _createBlendMode = (functions, equations) => ({
  functionName : "blendFunc" + (
    functions.length < 3
      ? ""
      : "Separate"
  ),
  functions : functions,
  equationName : "blendEquation" + (
    !equations || equations.length < 2
      ? ""
      : "Separate"
  ),
  equations : equations || [Const.FUNC_ADD]
});

export const BlendMode = {
  NONE : _createBlendMode([
    0,
    0
  ]),

  NORMAL_PM : _createBlendMode([
    Const.ONE,
    Const.ONE_MINUS_SRC_ALPHA
  ]),
  ADD_PM : _createBlendMode([
    Const.ONE,
    Const.ONE
  ]),
  MULTIPLY_PM : _createBlendMode([
    Const.DST_COLOR,
    Const.ONE_MINUS_SRC_ALPHA,
    Const.ONE,
    Const.ONE_MINUS_SRC_ALPHA
  ]),
  SCREEN_PM : _createBlendMode([
    Const.ONE,
    Const.ONE_MINUS_SRC_COLOR,
    Const.ONE,
    Const.ONE_MINUS_SRC_ALPHA
  ]),

  ADD_NPM : _createBlendMode([
    Const.SRC_ALPHA,
    Const.ONE,
    Const.ONE,
    Const.ONE
  ]),

  SRC_IN : _createBlendMode([
    Const.DST_ALPHA,
    Const.ZERO
  ]),
  SRC_OUT : _createBlendMode([
    Const.ONE_MINUS_DST_ALPHA,
    Const.ZERO
  ]),
  SRC_ATOP : _createBlendMode([
    Const.DST_ALPHA,
    Const.ONE_MINUS_SRC_ALPHA
  ]),
  DST_OVER : _createBlendMode([
    Const.ONE_MINUS_DST_ALPHA,
    Const.ONE
  ]),
  DST_IN : _createBlendMode([
    Const.ZERO,
    Const.SRC_ALPHA
  ]),
  DST_OUT : _createBlendMode([
    Const.ZERO,
    Const.ONE_MINUS_SRC_ALPHA
  ]),
  DST_ATOP : _createBlendMode([
    Const.ONE_MINUS_DST_ALPHA,
    Const.SRC_ALPHA
  ]),
  XOR : _createBlendMode([
    Const.ONE_MINUS_DST_ALPHA,
    Const.ONE_MINUS_SRC_ALPHA
  ]),

  NORMAL : _createBlendMode([
    Const.SRC_ALPHA,
    Const.ONE_MINUS_SRC_ALPHA,
    Const.ONE,
    Const.ONE_MINUS_SRC_ALPHA
  ]),
  ADD : _createBlendMode([
    Const.SRC_ALPHA,
    Const.DST_ALPHA,
    Const.ONE,
    Const.DST_ALPHA
  ]),
  MULTIPLY : _createBlendMode([
    Const.DST_COLOR,
    Const.ZERO
  ]),
  SCREEN : _createBlendMode([
    Const.SRC_ALPHA,
    Const.ONE_MINUS_SRC_COLOR,
    Const.ONE,
    Const.ONE_MINUS_SRC_COLOR
  ]),
  OVERLAY : _createBlendMode([
    Const.ONE,
    Const.ONE_MINUS_SRC_ALPHA
  ]),
  EXCLUSION : _createBlendMode([
    Const.ONE_MINUS_DST_COLOR,
    Const.ONE_MINUS_SRC_COLOR
  ]),
  LIGHTEN : _createBlendMode([
    Const.ONE,
    Const.ONE
  ],[
    Const.MAX
  ]),
  DARKEN : _createBlendMode([
    Const.ONE,
    Const.ONE
  ],[
    Const.MIN
  ]),
  SHADOW : _createBlendMode([
    Const.DST_COLOR,
    Const.SRC_COLOR
  ])
};
