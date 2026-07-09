import * as audio from "./audio";
import * as controls from "./controls";
import * as display from "./display";
import * as utils from "./utils";

window.PWGLExtensions = window.AGLExtensions = {
  version: "{{appVersion}}",
  controls,
  audio,
  display,
  utils,
};

console.log(
  `%cPWGL Extensions v${AGLExtensions.version}\nhttps:\/\/github.com/asjs-dev/pwgl`,
  "background:#222;color:#0F0",
);
