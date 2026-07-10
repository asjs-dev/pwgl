import * as utils from ".";
import { logExtensions, registerExtensions } from "../register";

registerExtensions("utils", utils);
logExtensions();
