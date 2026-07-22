import { deepFreeze } from "./deepFreeze";

type InternalAction<State> = (state: State, ...args: any[]) => boolean | void;

export type StateMachineSubscriber<State> = (state: State, previousState: State | undefined) => void;

export type StateMachineActions<Actions> = {
  [Key in keyof Actions]: Actions[Key] extends (state: any, ...args: infer Args) => unknown
    ? (...args: Args) => void
    : never;
};

export type StateMachine<State, Actions> = StateMachineActions<Actions> & {
  subscribe: (callback: StateMachineSubscriber<State>) => () => void;
};

export type StateMachineConfig<State, Actions> = Actions & {
  initialState: State;
  strict?: boolean;
};

type StateMachineConfigActions<Config> = Omit<Config, "initialState" | "strict">;

/** Creates a small observable state container. */
export const createStateMachine = <Config extends { initialState: unknown; strict?: boolean }>(
  config: Config,
): StateMachine<Config["initialState"], StateMachineConfigActions<Config>> => {
  type State = Config["initialState"];
  type Actions = StateMachineConfigActions<Config>;

  const { initialState, strict = true, ...actions } = config;
  const typedActions = actions as Record<keyof Actions, InternalAction<State>>;
  const prepareSnapshot = strict ? deepFreeze : (snapshot: State) => snapshot;
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

  const listeners = new Set<StateMachineSubscriber<State>>();
  const state = structuredClone(initialState);

  let previousSnapshot = createSnapshot();
  let scheduled = false;
  const machineActions = {} as StateMachineActions<Actions>;

  for (const key of Object.keys(typedActions) as Array<keyof Actions>) {
    const action = typedActions[key];

    machineActions[key] = ((...args: Parameters<StateMachineActions<Actions>[typeof key]>) => {
      if (action(state, ...args) !== false) {
        scheduleNotify();
      }
    }) as StateMachineActions<Actions>[typeof key];
  }

  return {
    subscribe(callback: StateMachineSubscriber<State>) {
      listeners.add(callback);

      const currentSnapshot = createSnapshot();

      callback(currentSnapshot, undefined);

      return () => {
        listeners.delete(callback);
      };
    },

    ...machineActions,
  };
};
