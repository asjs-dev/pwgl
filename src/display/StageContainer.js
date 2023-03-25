import { Container } from "./Container.js";
import { BaseItem } from "./BaseItem.js";

export class StageContainer extends Container {
  constructor(renderer) {
    super();

    this.renderer = renderer;
    this._parent = new BaseItem();
  }

  get stage() {
    return this;
  }

  get parent() {
    return this._parent;
  }

  get premultipliedAlpha() {
    return this.props.alpha;
  }
}
