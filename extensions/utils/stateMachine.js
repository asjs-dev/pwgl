import { deepFreeze } from "./deepFreeze";

/**
 * Action function that receives mutable state and optional arguments.
 * @callback StateMachineAction
 * @param {Object} state - Mutable state owned by the state machine
 * @param {...*} args - Arguments passed to the exposed action
 * @returns {boolean|void} Return false to skip the subscriber notification
 */

/**
 * State change listener.
 * @callback StateMachineSubscriber
 * @param {Object} state - State snapshot, deeply frozen in strict mode
 * @param {Object|undefined} previousState - Previous state snapshot, or undefined for the initial subscription
 * @returns {void}
 */

/**
 * createStateMachine utility
 * @typedef {Object} StateMachine
 * @property {function(StateMachineSubscriber): function} subscribe - Subscribe to state changes
 * @property {StateMachineAction} [actionName] - Action functions to modify the state
 * @param {Object} config - Configuration object
 * @param {Object} config.initialState - Initial state of the state machine
 * @param {boolean} [config.strict=true] - Deeply freeze subscriber snapshots
 * @param {StateMachineAction} [config.actionName] - Action functions to expose on the state machine
 * @returns {StateMachine} - State machine instance
 */

export const createStateMachine = ({ initialState, strict = true, ...actions }) => {
  const prepareSnapshot = strict ? deepFreeze : (snapshot) => snapshot;
  const createSnapshot = () => prepareSnapshot(structuredClone(state));

  const notify = () => {
    const currentSnapshot = createSnapshot();

    for (const listener of listeners) {
      listener(currentSnapshot, previousSnapshot);
    }

    previousSnapshot = currentSnapshot;
  };

  const scheduleNotify = () => {
    if (scheduled) return;

    scheduled = true;

    queueMicrotask(() => {
      scheduled = false;
      notify();
    });
  };

  const listeners = new Set();
  const state = structuredClone(initialState);

  let previousSnapshot = createSnapshot();
  let scheduled = false;

  for (const key of Object.keys(actions)) {
    const action = actions[key];

    actions[key] = (...args) => {
      if (action(state, ...args) !== false) {
        scheduleNotify();
      }
    };
  }

  return {
    subscribe(callback) {
      listeners.add(callback);

      const currentSnapshot = createSnapshot();

      callback(currentSnapshot, undefined);

      return () => {
        listeners.delete(callback);
      };
    },

    ...actions,
  };
};
