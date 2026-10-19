import { describe, expect, it, vi } from "vitest";
import { MAX_FILTERS, createChain } from "../../../docs/demos/filter-playground/chain.js";
import { ADVANCED_PARAMS } from "../../../docs/demos/filter-playground/registry-advanced.js";
import { FILTERS, isDefault } from "../../../docs/demos/filter-playground/registry.js";
import { createSnippetCode } from "../../../docs/demos/filter-playground/snippet.js";

const textures = { displacement: { id: "displacement" }, mask: { id: "mask" } };

// Records every assignment to `filters`, so tests can count shader rebuilds.
const createFilterRenderer = () => {
  const assignments = [];
  return {
    assignments,
    set filters(value) {
      assignments.push(value);
    },
    get filters() {
      return assignments[assignments.length - 1] ?? [];
    },
  };
};

const setup = () => {
  const filterRenderer = createFilterRenderer();
  const chain = createChain(filterRenderer, textures);
  const listener = vi.fn();
  chain.subscribe(listener);
  return { filterRenderer, chain, listener };
};

const names = (chain) => chain.entries.map((entry) => entry.definition.name);

describe("filter playground registry defaults", () => {
  it("matches the library default of every parameter", () => {
    for (const definition of FILTERS) {
      const filter = new definition.Filter();
      for (const param of [...definition.params, ...ADVANCED_PARAMS]) {
        expect(isDefault(param, filter[param.property]), `${definition.name}.${param.property}`).toBe(true);
      }
    }
  });

  it("keeps every initial value inside its control range", () => {
    for (const definition of FILTERS) {
      for (const param of [...definition.params, ...ADVANCED_PARAMS]) {
        const label = `${definition.name}.${param.property}`;
        if (param.control === "range") {
          expect(param.initial, label).toBeGreaterThanOrEqual(param.min);
          expect(param.initial, label).toBeLessThanOrEqual(param.max);
        } else if (param.control === "select") {
          expect(param.options.map((option) => option.value), label).toContain(param.initial);
        }
      }
    }
  });
});

describe("filter playground chain", () => {
  it("adds a filter with the initial values and its shared texture", () => {
    const { chain, filterRenderer, listener } = setup();

    chain.add("DisplacementFilter");

    const [{ filter }] = chain.entries;
    expect(filter.intensity).toBe(20);
    expect(filter.texture).toBe(textures.displacement);
    expect(filterRenderer.filters).toEqual([filter]);
    expect(listener).toHaveBeenCalledWith(true);
  });

  it("ignores unknown filter names", () => {
    const { chain, filterRenderer } = setup();

    chain.add("NoSuchFilter");

    expect(chain.entries).toHaveLength(0);
    expect(filterRenderer.assignments).toHaveLength(0);
  });

  it("stops at the filter cap", () => {
    const { chain, filterRenderer } = setup();

    for (let i = 0; i < MAX_FILTERS + 2; i++) chain.add("InvertFilter");

    expect(chain.entries).toHaveLength(MAX_FILTERS);
    expect(chain.isFull()).toBe(true);
    expect(filterRenderer.assignments).toHaveLength(MAX_FILTERS);
  });

  it("assigns one fresh filters array per structural change", () => {
    const { chain, filterRenderer } = setup();
    chain.add("BlurFilter");
    chain.add("SepiaFilter");
    const before = filterRenderer.assignments.length;

    chain.move(chain.entries[1].id, -1);

    expect(filterRenderer.assignments).toHaveLength(before + 1);
    expect(filterRenderer.filters).not.toBe(filterRenderer.assignments[before - 1]);
    expect(filterRenderer.filters).toEqual(chain.entries.map((entry) => entry.filter));
  });

  it("moves entries up and down and ignores moves past the ends", () => {
    const { chain, filterRenderer } = setup();
    ["BlurFilter", "SepiaFilter", "InvertFilter"].forEach(chain.add);
    const [first, , last] = chain.entries;
    const before = filterRenderer.assignments.length;

    chain.move(first.id, -1);
    chain.move(last.id, 1);
    expect(filterRenderer.assignments).toHaveLength(before);

    chain.move(first.id, 1);
    expect(names(chain)).toEqual(["SepiaFilter", "BlurFilter", "InvertFilter"]);
    chain.move(last.id, -1);
    expect(names(chain)).toEqual(["SepiaFilter", "InvertFilter", "BlurFilter"]);
  });

  it("removes entries and frees a slot under the cap", () => {
    const { chain, filterRenderer } = setup();
    for (let i = 0; i < MAX_FILTERS; i++) chain.add("InvertFilter");

    chain.remove(chain.entries[0].id);
    chain.remove(-1);

    expect(chain.entries).toHaveLength(MAX_FILTERS - 1);
    expect(chain.isFull()).toBe(false);
    expect(filterRenderer.filters).toHaveLength(MAX_FILTERS - 1);
  });

  it("toggles and tunes the instance without rebuilding the filters", () => {
    const { chain, filterRenderer, listener } = setup();
    chain.add("BrightnessFilter");
    const [{ id, filter }] = chain.entries;
    const before = filterRenderer.assignments.length;
    listener.mockClear();

    chain.toggle(id, false);
    chain.setParam(id, "intensity", 2.5);

    expect(filter.on).toBe(false);
    expect(filter.intensity).toBe(2.5);
    expect(filterRenderer.assignments).toHaveLength(before);
    expect(listener.mock.calls).toEqual([[false], [false]]);
  });
});

describe("filter playground snippet", () => {
  const chainWith = (...filterNames) => {
    const { chain } = setup();
    filterNames.forEach(chain.add);
    return chain;
  };

  it("prints an empty filter list for an empty chain", () => {
    expect(createSnippetCode([])).toBe(
      [
        "const filterRenderer = new FilterRenderer({",
        "  context,",
        "  sourceTexture: framebuffer,",
        "  filters: [],",
        "});",
      ].join("\n"),
    );
  });

  it("omits default options and lists changed ones", () => {
    const chain = chainWith("GrayscaleFilter", "BrightnessFilter");
    chain.setParam(chain.entries[1].id, "intensity", 1);

    expect(createSnippetCode(chain.entries)).toContain("    new GrayscaleFilter(),\n    new BrightnessFilter(),\n  ],");

    chain.setParam(chain.entries[1].id, "intensity", 1.25);
    expect(createSnippetCode(chain.entries)).toContain("    new BrightnessFilter({ intensity: 1.25 }),");
  });

  it("prints select values as source expressions, booleans, the off state, one option per line when long", () => {
    const chain = chainWith("MaskFilter");
    const [{ id }] = chain.entries;
    chain.setParam(id, "type", 2);
    chain.setParam(id, "isRadial", true);
    chain.toggle(id, false);

    expect(createSnippetCode(chain.entries)).toContain(
      [
        "    new MaskFilter({",
        "      texture: maskTexture,",
        "      type: MaskFilter.Type.BLUE,",
        "      isRadial: true,",
        "      on: false,",
        "    }),",
      ].join("\n"),
    );
  });

  it("keeps short option lists on one line", () => {
    const chain = chainWith("TintFilter");

    expect(createSnippetCode(chain.entries)).toContain("    new TintFilter({ r: 1.2, g: 0.8, b: 0.5 }),");
  });
});
