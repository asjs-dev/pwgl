import * as audio from "./audio";
import * as controls from "./controls";
import * as display from "./display";
import * as utils from "./utils";
import { logExtensions, registerExtensions } from "./register";

registerExtensions("controls", controls);
registerExtensions("audio", audio);
registerExtensions("display", display);
registerExtensions("utils", utils);
logExtensions();
