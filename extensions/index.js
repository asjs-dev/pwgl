import { FPS } from "./FPS";
import { PressState } from "./controls/PressState";
import { Mouse } from "./controls/Mouse";
import { Keyboard } from "./controls/Keyboard";
import { Gamepad } from "./controls/Gamepad";
import { DataObserver } from "./DataObserver";
import { crossFadeAudioVolumes, fadeAudioVolume } from "./audio/utils";
import { AudioItem } from "./audio/AudioItem";
import { AudioMixer } from "./audio/AudioMixer";
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
  version: "{{appVersion}}",

  FPS,

  DataObserver,

  PressState,
  Mouse,
  Keyboard,
  Gamepad,

  AudioItem,
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

console.log(
  `%cPWGL Extensions v${AGLExtensions.version}\nhttps:\/\/github.com/asjs-dev/pwgl`,
  "background:#222;color:#0F0"
);
