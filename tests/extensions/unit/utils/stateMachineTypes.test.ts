import { expectTypeOf, it } from "vitest";
import { createStateMachine } from "../../../../extensions/src/utils/stateMachine";

it("types state machine actions and subscribers", () => {
  type CounterState = { count: number; nested: { enabled: boolean } };

  const machine = createStateMachine({
    initialState: { count: 0, nested: { enabled: true } },
    increment(state: CounterState, amount: number) {
      state.count += amount;
    },
    toggle(state: CounterState) {
      state.nested.enabled = !state.nested.enabled;
    },
    keepCount(state: CounterState) {
      state.count = 0;
      return false;
    },
  });

  expectTypeOf(machine.increment).parameters.toEqualTypeOf<[amount: number]>();
  expectTypeOf(machine.toggle).parameters.toEqualTypeOf<[]>();
  expectTypeOf(machine.keepCount).parameters.toEqualTypeOf<[]>();

  machine.increment(1);
  machine.toggle();
  machine.keepCount();

  // @ts-expect-error actions exposed on the machine do not receive state directly
  machine.increment({ count: 0, nested: { enabled: true } }, 1);

  machine.subscribe((state, previousState) => {
    expectTypeOf(state.count).toEqualTypeOf<number>();
    expectTypeOf(state.nested.enabled).toEqualTypeOf<boolean>();
    expectTypeOf(previousState).toEqualTypeOf<typeof state | undefined>();
  });
});
