// Filter chain state. Each entry pairs a registry definition with a live filter instance.
// Structural changes (add, remove, move) assign one fresh array to `filterRenderer.filters`,
// which rebuilds the shader once; toggles and parameter edits only touch the instance,
// because `on` is checked on the CPU and every parameter is a uniform.

import { ADVANCED_PARAMS } from "./registry-advanced.js";
import { findFilter } from "./registry.js";

export const MAX_FILTERS = 8;

export const createChain = (filterRenderer, textures) => {
  const entries = [];
  const listeners = new Set();
  let nextId = 1;

  // `structural` tells listeners whether the entry list itself changed.
  const notify = (structural) => listeners.forEach((listener) => listener(structural));

  const rebuild = () => {
    filterRenderer.filters = entries.map((entry) => entry.filter);
    notify(true);
  };

  const indexOf = (id) => entries.findIndex((entry) => entry.id === id);

  const add = (name) => {
    const definition = findFilter(name);
    if (!definition || entries.length >= MAX_FILTERS) return;

    const options = {};
    for (const param of [...definition.params, ...ADVANCED_PARAMS]) options[param.property] = param.initial;
    if (definition.texture) options.texture = textures[definition.texture];

    const filter = new definition.Filter(options);
    entries.push({ id: nextId++, definition, filter });
    rebuild();
  };

  const remove = (id) => {
    const index = indexOf(id);
    if (index < 0) return;
    entries.splice(index, 1);
    rebuild();
  };

  // `delta` is -1 (up) or +1 (down).
  const move = (id, delta) => {
    const index = indexOf(id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= entries.length) return;
    [entries[index], entries[target]] = [entries[target], entries[index]];
    rebuild();
  };

  const toggle = (id, on) => {
    const entry = entries[indexOf(id)];
    if (!entry) return;
    entry.filter.on = on;
    notify(false);
  };

  const setParam = (id, property, value) => {
    const entry = entries[indexOf(id)];
    if (!entry) return;
    entry.filter[property] = value;
    notify(false);
  };

  return {
    entries,
    add,
    remove,
    move,
    toggle,
    setParam,
    isFull: () => entries.length >= MAX_FILTERS,
    subscribe: (listener) => listeners.add(listener),
  };
};
