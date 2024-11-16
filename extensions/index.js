import { Mouse } from "./Mouse";
import { Keyboard } from "./Keyboard";
import { PressState } from "./PressState";
import { Gamepad } from "./Gamepad";
import { DataObserver } from "./DataObserver";
import { SmoothLight } from "./renderer/SmoothLight";
import { WaterRenderer } from "./renderer/WaterRenderer";
import { areObjectsEqual } from "./utils/areObjectsEqual";
import { clamp } from "./utils/clamp";
import { clone } from "./utils/clone";
import { collisionDetection } from "./utils/collisionDetection";
import { cross } from "./utils/cross";
import { dot } from "./utils/dot";
import { enterFrame } from "./utils/enterFrame";
import { enumCheck } from "./utils/enumCheck";
import { fract } from "./utils/fract";
import { getFPS } from "./utils/getFPS";
import { nthCall } from "./utils/nthCall";
import { random } from "./utils/rand";

window.PWGLExtensions = window.AGLExtensions = {
  PressState,
  Mouse,
  Keyboard,
  Gamepad,
  DataObserver,

  SmoothLight,
  WaterRenderer,

  areObjectsEqual,
  clamp,
  clone,
  collisionDetection,
  cross,
  dot,
  enterFrame,
  enumCheck,
  fract,
  getFPS,
  nthCall,
  random,
};
