import { vi } from "vitest";

class MockContainer {
  constructor() {
    this.children = [];
  }

  addChild(child) {
    this.children.push(child);
    child.parent = this;
  }
}

class MockImage {
  constructor(texture = null) {
    this.texture = texture;
    this.transform = { width: 0, height: 0 };
    this.textureTransform = {
      repeatX: 1,
      repeatY: 1,
      repeatRandomRotation: 0,
      x: 0,
      y: 0,
    };
    this.color = {
      g: 0,
      set: vi.fn((r, g, b, a) => {
        this.color.r = r;
        this.color.g = g;
        this.color.b = b;
        this.color.a = a;
      }),
    };
  }
}

class MockFramebuffer {}

class MockLightRenderer {
  constructor(config = {}) {
    this.config = config;
    this.context = { id: "context" };
    this.renderToFramebuffer = vi.fn();
    this.setSize = vi.fn();
    this.addLightForRender = vi.fn();
  }
}

class MockFilterRenderer {
  constructor(config = {}) {
    this.config = config;
    this.clearColor = {
      set: vi.fn(),
    };
    this.clearBeforeRender = false;
    this.renderToFramebuffer = vi.fn();
    this.setSize = vi.fn();
  }
}

class MockBlurFilter {
  constructor() {
    this.intensity = 0;
  }
}

const Texture = {
  loadImage: vi.fn((src) => ({
    src,
    magFilter: null,
  })),
};

export const installPWGLMock = () => {
  globalThis.window = globalThis.window ?? {};

  const PWGL = {
    Container: MockContainer,
    Image: MockImage,
    Texture,
    BlendMode: {
      ADD: { id: "add" },
      SHADOW: { id: "shadow" },
    },
    TintType: {
      GRAYSCALE: 2,
    },
    Framebuffer: MockFramebuffer,
    LightRenderer: MockLightRenderer,
    BlurFilter: MockBlurFilter,
    FilterRenderer: MockFilterRenderer,
  };

  globalThis.window.PWGL = PWGL;
  globalThis.PWGL = PWGL;

  return PWGL;
};
