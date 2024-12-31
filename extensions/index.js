import { FPS } from "./FPS";
import { PressState } from "./PressState";
import { Mouse } from "./Mouse";
import { Keyboard } from "./Keyboard";
import { Gamepad } from "./Gamepad";
import { DataObserver } from "./DataObserver";
import { AudioMixer, crossFadeAudioVolumes, fadeAudioVolume } from "./AudioMixer";
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
import { mix } from "./utils/mix";

window.PWGLExtensions = window.AGLExtensions = {
  FPS,
  PressState,
  Mouse,
  Keyboard,
  Gamepad,
  DataObserver,

  AudioMixer,
  fadeAudioVolume,
  crossFadeAudioVolumes,

  SmoothLight,
  WaterRenderer,

  areObjectsEqual,
  clamp,
  mix,
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
