import "../../namespace.js";
import "./BaseProps.js";

AGL.ColorProps = class extends AGL.BaseProps {
  constructor() {
    super();

    this.items = [1, 1, 1, 1];
  }

  get r() { return this.items[0]; }
  set r(v) {
    if (this.items[0] !== v) {
      this.items[0] = v;
      ++this.updateId;
    }
  }

  get g() { return this.items[1]; }
  set g(v) {
    if (this.items[1] !== v) {
      this.items[1] = v;
      ++this.updateId;
    }
  }

  get b() { return this.items[2]; }
  set b(v) {
    if (this.items[2] !== v) {
      this.items[2] = v;
      ++this.updateId;
    }
  }

  get a() { return this.items[3]; }
  set a(v) {
    if (this.items[3] !== v) {
      this.items[3] = v;
      ++this.updateId;
    }
  }

  set(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}
