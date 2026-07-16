import * as audio from "./audio";
import * as controls from "./controls";
import * as display from "./display";
import * as textureAtlas from "./textureAtlas";
import * as utils from "./utils";
import { logExtensions, registerExtensions } from "./register";

registerExtensions("controls", controls);
registerExtensions("audio", audio);
registerExtensions("display", display);
registerExtensions("textureAtlas", textureAtlas);
registerExtensions("utils", utils);
logExtensions();
