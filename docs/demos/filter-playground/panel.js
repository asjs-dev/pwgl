// Control panel: the add menu and one card per chain entry with on/up/down/remove buttons,
// the filter's own parameters and a collapsible Advanced group. Cards are rebuilt only on
// structural chain changes, so dragging a slider never replaces the slider itself.

import { createControl, element } from "./controls.js";
import { MAX_FILTERS } from "./chain.js";
import { ADVANCED_PARAMS, select } from "./registry-advanced.js";
import { FILTERS } from "./registry.js";

const createButton = (text, title, onClick) => {
  const button = element("button", "icon-button", text);
  button.type = "button";
  button.title = title;
  button.setAttribute("aria-label", title);
  button.addEventListener("click", onClick);
  return button;
};

export const createPanel = (root, chain) => {
  const addSelect = root.querySelector("#add-select");
  const addButton = root.querySelector("#add-button");
  const list = root.querySelector("#chain-list");
  const count = root.querySelector("#chain-count");
  // Ids of entries whose Advanced group is open, kept across rebuilds.
  const openAdvanced = new Set();

  for (const definition of FILTERS) {
    const option = element("option", "", definition.label);
    option.value = definition.name;
    addSelect.appendChild(option);
  }
  addButton.addEventListener("click", () => chain.add(addSelect.value));

  const createParams = (entry, params) => {
    const fragment = document.createDocumentFragment();
    for (const param of params) {
      fragment.appendChild(
        createControl(param, entry.filter[param.property], (value) => chain.setParam(entry.id, param.property, value)),
      );
    }
    return fragment;
  };

  const createHeader = (entry, index) => {
    const header = element("div", "filter-header");
    const toggle = element("input");
    toggle.type = "checkbox";
    toggle.checked = entry.filter.on;
    toggle.title = `Enable ${entry.definition.label}`;
    toggle.setAttribute("aria-label", toggle.title);
    toggle.addEventListener("change", () => chain.toggle(entry.id, toggle.checked));

    const up = createButton("↑", "Move up", () => chain.move(entry.id, -1));
    const down = createButton("↓", "Move down", () => chain.move(entry.id, 1));
    up.disabled = index === 0;
    down.disabled = index === chain.entries.length - 1;

    header.append(
      toggle,
      element("strong", "filter-name", entry.definition.label),
      up,
      down,
      createButton("✕", "Remove", () => chain.remove(entry.id)),
    );
    return header;
  };

  // Texture switch as a select over the indices of the definition's `textures`.
  const createTextureSelect = (entry) => {
    const choices = entry.definition.textures;
    const options = choices.map(({ label }, value) => ({ label, value }));
    const current = choices.findIndex(({ name }) => name === entry.texture);
    return createControl(select("texture", "Texture", options, current), current, (index) =>
      chain.setTexture(entry.id, choices[index].name),
    );
  };

  const createCard = (entry, index) => {
    const card = element("li", "filter-card");
    card.appendChild(createHeader(entry, index));
    if (entry.definition.textures) card.appendChild(createTextureSelect(entry));
    if (entry.definition.params.length) card.appendChild(createParams(entry, entry.definition.params));

    const advanced = element("details", "advanced");
    advanced.open = openAdvanced.has(entry.id);
    advanced.addEventListener("toggle", () =>
      advanced.open ? openAdvanced.add(entry.id) : openAdvanced.delete(entry.id),
    );
    advanced.append(element("summary", "", "Advanced"), createParams(entry, ADVANCED_PARAMS));
    card.appendChild(advanced);
    return card;
  };

  const render = () => {
    const ids = new Set(chain.entries.map((entry) => entry.id));
    for (const id of openAdvanced) if (!ids.has(id)) openAdvanced.delete(id);

    list.replaceChildren(...chain.entries.map(createCard));
    if (!chain.entries.length) list.appendChild(element("li", "chain-empty", "No filters: the source is shown as is."));

    count.textContent = `${chain.entries.length} / ${MAX_FILTERS}`;
    addButton.disabled = addSelect.disabled = chain.isFull();
  };

  chain.subscribe((structural) => structural && render());
  render();
};
