import { audio, controls, display, textureAtlas, utils } from "./exports";
import { logExtensions, registerExtensions } from "./register";

registerExtensions("controls", controls);
registerExtensions("audio", audio);
registerExtensions("display", display);
registerExtensions("textureAtlas", textureAtlas);
registerExtensions("utils", utils);
logExtensions();
