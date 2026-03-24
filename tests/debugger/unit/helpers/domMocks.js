import { vi } from "vitest";

const createClassList = () => {
  const classes = [];

  return {
    add: (...items) => classes.push(...items),
    toArray: () => [...classes],
  };
};

export const createElementMock = (tagName = "div") => {
  const attributes = {};
  const listeners = {};
  const children = [];
  const classList = createClassList();

  return {
    tagName: tagName.toUpperCase(),
    children,
    classList,
    style: {},
    hidden: false,
    innerHTML: "",
    textContent: "",
    appendChild: vi.fn((child) => {
      children.push(child);
      return child;
    }),
    setAttribute: vi.fn((name, value) => {
      attributes[name] = value;
    }),
    getAttribute: vi.fn((name) => attributes[name]),
    removeAttribute: vi.fn((name) => {
      delete attributes[name];
    }),
    addEventListener: vi.fn((type, handler) => {
      listeners[type] = handler;
    }),
    dispatch: (type, event = {}) => listeners[type]?.(event),
    attributes,
  };
};

export const installDocumentMock = () => {
  const created = [];
  const body = createElementMock("body");

  const document = {
    body,
    created,
    createElement: vi.fn((tag) => {
      const element = createElementMock(tag);
      created.push(element);
      return element;
    }),
  };

  globalThis.document = document;
  return document;
};
