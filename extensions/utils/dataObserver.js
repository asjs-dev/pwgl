import { clone } from "./clone";

/**
 * DataObserver utility
 * @typedef {Object} DataObserver
 * @property {Object} state Proxy state object
 * @property {function} flush Flush changes and get the updated state
 */
export const createDataObserver = (defaultState = {}) => {
  let dirty = false;
  let prevState = clone(defaultState);

  const state = new Proxy(defaultState, {
    set(target, prop, value) {
      dirty = true;
      target[prop] = value;
      return true;
    },
  });

  /**
   * Flush changes and get the updated state
   * @returns {Object|null} The updated state and previous state, or null if no changes
   */
  const flush = () => {
    if (!dirty) return null;

    const stateClone = clone(state);
    const prevStateClone = prevState;

    prevState = stateClone;
    dirty = false;

    return { state: stateClone, prevState: prevStateClone };
  };

  return { state, flush };
};
