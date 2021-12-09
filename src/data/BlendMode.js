import "../namespace.js";
import "../utils/Utils.js";

(() => {
  const _createBlendMode = (functions, equations) => {
    return {
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
      equations : equations || [AGL.Const.FUNC_ADD]
    };
  }

  AGL.BlendMode = {
    NONE : _createBlendMode([
      0,
      0
    ]),

    SIMPLE : _createBlendMode([
      AGL.Const.ONE,
      AGL.Const.ONE
    ]),
    NORMAL_PM : _createBlendMode([
      AGL.Const.ONE,
      AGL.Const.ONE_MINUS_SRC_ALPHA
    ]),
    ADD_PM : _createBlendMode([
      AGL.Const.ONE,
      AGL.Const.ONE
    ]),
    MULTIPLY_PM : _createBlendMode([
      AGL.Const.DST_COLOR,
      AGL.Const.ONE_MINUS_SRC_ALPHA,
      AGL.Const.ONE,
      AGL.Const.ONE_MINUS_SRC_ALPHA
    ]),
    SCREEN_PM : _createBlendMode([
      AGL.Const.ONE,
      AGL.Const.ONE_MINUS_SRC_COLOR,
      AGL.Const.ONE,
      AGL.Const.ONE_MINUS_SRC_ALPHA
    ]),

    ADD_NPM : _createBlendMode([
      AGL.Const.SRC_ALPHA,
      AGL.Const.ONE,
      AGL.Const.ONE,
      AGL.Const.ONE
    ]),

    SRC_IN : _createBlendMode([
      AGL.Const.DST_ALPHA,
      AGL.Const.ZERO
    ]),
    SRC_OUT : _createBlendMode([
      AGL.Const.ONE_MINUS_DST_ALPHA,
      AGL.Const.ZERO
    ]),
    SRC_ATOP : _createBlendMode([
      AGL.Const.DST_ALPHA,
      AGL.Const.ONE_MINUS_SRC_ALPHA
    ]),
    DST_OVER : _createBlendMode([
      AGL.Const.ONE_MINUS_DST_ALPHA,
      AGL.Const.ONE
    ]),
    DST_IN : _createBlendMode([
      AGL.Const.ZERO,
      AGL.Const.SRC_ALPHA
    ]),
    DST_OUT : _createBlendMode([
      AGL.Const.ZERO,
      AGL.Const.ONE_MINUS_SRC_ALPHA
    ]),
    DST_ATOP : _createBlendMode([
      AGL.Const.ONE_MINUS_DST_ALPHA,
      AGL.Const.SRC_ALPHA
    ]),
    XOR : _createBlendMode([
      AGL.Const.ONE_MINUS_DST_ALPHA,
      AGL.Const.ONE_MINUS_SRC_ALPHA
    ]),

    NORMAL : _createBlendMode([
      AGL.Const.SRC_ALPHA,
      AGL.Const.ONE_MINUS_SRC_ALPHA,
      AGL.Const.ONE,
      AGL.Const.ONE_MINUS_SRC_ALPHA
    ]),
    ADD : _createBlendMode([
      AGL.Const.SRC_ALPHA,
      AGL.Const.DST_ALPHA,
      AGL.Const.ONE,
      AGL.Const.DST_ALPHA
    ]),
    MULTIPLY : _createBlendMode([
      AGL.Const.DST_COLOR,
      AGL.Const.ONE_MINUS_SRC_ALPHA
    ]),
    SCREEN : _createBlendMode([
      AGL.Const.SRC_ALPHA,
      AGL.Const.ONE_MINUS_SRC_COLOR,
      AGL.Const.ONE,
      AGL.Const.ONE_MINUS_SRC_COLOR
    ]),
    OVERLAY : _createBlendMode([
      AGL.Const.ONE,
      AGL.Const.ONE_MINUS_SRC_ALPHA
    ]),
    EXCLUSION : _createBlendMode([
      AGL.Const.ONE_MINUS_DST_COLOR,
      AGL.Const.ONE_MINUS_SRC_COLOR
    ])
  };
})();
