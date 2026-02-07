import { SHOW_CALL_STACK, SHOW_ORIGINAL_VALUES, SHOW_ARRAYS } from "./constants";
import { init } from "./debugger";

window.PWGLDebugger = {
  version: "{{appVersion}}",
  SHOW_CALL_STACK,
  SHOW_ORIGINAL_VALUES,
  SHOW_ARRAYS,
  init,
  instances: [],
};

console.log(
  `%cPWGL Debugger v${PWGLDebugger.version}\nhttps:\/\/github.com/asjs-dev/pwgl`,
  "background:#222;color:#0F0",
);
