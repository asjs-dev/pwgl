import {
  init,
  SHOW_CALL_STACK,
  SHOW_READABLE_NAMES,
  SHOW_ARRAYS,
} from "./debugger";

window.PWGLDebugger = {
  version: "{{appVersion}}",
  SHOW_CALL_STACK,
  SHOW_READABLE_NAMES,
  SHOW_ARRAYS,
  init,
  instances: [],
};

console.log(
  `%cPWGL Debugger v${PWGLDebugger.version}\nhttps:\/\/github.com/asjs-dev/pwgl`,
  "background:#222;color:#0F0",
);
