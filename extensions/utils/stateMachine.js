/**
 * createStateMachine utility
 * @typedef {Object} StateMachine
 * @param {Object} initialState - The initial state of the state machine.
 * @returns {StateMachine} The state machine instance.
 * @property {function} createAction - Creates an action function that can modify the state.
 * @property {function} subscribe - Subscribes a callback to state changes.
 * @property {function} update - Updates the state and notifies subscribers if there are changes.
 */
export const createStateMachine = (initialState) => {
  const listeners = new Set();
  const writableCache = new WeakMap();
  const readonlyCache = new WeakMap();

  let dirty = false;

  const rawState = structuredClone(initialState);
  let previousSnapshot = structuredClone(rawState);
  let previousReadonly;

  const createWritableProxy = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    if (writableCache.has(obj)) return writableCache.get(obj);

    const proxy = new Proxy(obj, {
      get(target, prop) {
        return createWritableProxy(target[prop]);
      },

      set(target, prop, value) {
        if (target[prop] === value) return true;

        target[prop] = value;
        dirty = true;

        return true;
      },

      deleteProperty(target, prop) {
        if (!(prop in target)) return true;

        delete target[prop];
        dirty = true;

        return true;
      },
    });

    writableCache.set(obj, proxy);
    return proxy;
  };

  const createReadonlyProxy = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    if (readonlyCache.has(obj)) return readonlyCache.get(obj);

    const proxy = new Proxy(obj, {
      get(target, prop) {
        return createReadonlyProxy(target[prop]);
      },

      set() {
        throw new Error("State is readonly.");
      },

      deleteProperty() {
        throw new Error("State is readonly.");
      },
    });

    readonlyCache.set(obj, proxy);
    return proxy;
  };

  const writableState = createWritableProxy(rawState);
  const readonlyState = createReadonlyProxy(rawState);

  previousReadonly = createReadonlyProxy(previousSnapshot);

  return {
    createAction(callback) {
      return (...args) => callback(writableState, ...args);
    },

    subscribe(callback) {
      listeners.add(callback);

      callback(readonlyState, undefined);

      return () => {
        listeners.delete(callback);
      };
    },

    update() {
      if (!dirty) return false;

      dirty = false;

      for (const listener of listeners) {
        listener(readonlyState, previousReadonly);
      }

      previousSnapshot = structuredClone(rawState);
      previousReadonly = createReadonlyProxy(previousSnapshot);

      return true;
    },
  };
};
