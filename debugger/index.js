import { SHOW_ARRAYS, SHOW_CALL_STACKS, SHOW_ORIGINAL_VALUES } from "./constants";
import { init } from "./init";

window.PWGLDebugger = {
  version: "{{appVersion}}",
  SHOW_CALL_STACKS,
  SHOW_ORIGINAL_VALUES,
  SHOW_ARRAYS,
  init,
  instances: [],
};

console.log(
  `%cPWGL Debugger v${PWGLDebugger.version}\nhttps:\/\/github.com/asjs-dev/pwgl`,
  "background:#222;color:#0F0",
);
