/**
 * Action function that receives mutable state and optional arguments.
 * @callback StateMachineAction
 * @param {Object} state - Mutable state owned by the state machine
 * @param {...*} args - Arguments passed to the exposed action
 * @returns {void}
 */

/**
 * State change listener.
 * @callback StateMachineSubscriber
 * @param {Object} state - Readonly state snapshot
 * @param {Object|undefined} previousState - Previous notified state snapshot
 * @returns {void}
 */

/**
 * createStateMachine utility
 * @typedef {Object} StateMachine
 * @property {function(StateMachineSubscriber): function} subscribe - Subscribe to state changes
 * @property {StateMachineAction} [actionName] - Action functions to modify the state
 * @param {Object} config - Configuration object
 * @param {Object} config.initialState - Initial state of the state machine
 * @param {StateMachineAction} [config.actionName] - Action functions to expose on the state machine
 * @returns {StateMachine} - State machine instance
 */

export const createStateMachine = ({ initialState, ...actions }) => {
  const listeners = new Set();
  const readonlyCache = new WeakMap();
  const state = structuredClone(initialState);

  let previousSnapshot;
  let scheduled = false;

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

  const createReadonlySnapshot = () => createReadonlyProxy(structuredClone(state));

  const notify = () => {
    const currentReadonlyState = createReadonlySnapshot();

    for (const listener of listeners) {
      listener(currentReadonlyState, previousSnapshot);
    }

    previousSnapshot = currentReadonlyState;
  };

  const scheduleNotify = () => {
    if (scheduled) return;

    scheduled = true;

    queueMicrotask(() => {
      scheduled = false;
      notify();
    });
  };

  for (const key of Object.keys(actions)) {
    const action = actions[key];

    actions[key] = (...args) => {
      action(state, ...args);
      scheduleNotify();
    };
  }

  return {
    subscribe(callback) {
      listeners.add(callback);

      const currentReadonlyState = createReadonlySnapshot();

      callback(currentReadonlyState, undefined);

      return () => {
        listeners.delete(callback);
      };
    },

    ...actions,
  };
};
