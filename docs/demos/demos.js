// Renders the demo list from docs/assets/demos.json, the single source of every demo entry.

const DEMOS_URL = "../assets/demos.json";
const CODEPEN_PEN_URL = "https://codepen.io/iroshan/pen/";

const createLink = (demo) => {
  const link = document.createElement("a");
  link.className = "demo-card";

  if (demo.type === "local") {
    link.href = `${demo.path}/`;
  } else {
    link.href = CODEPEN_PEN_URL + demo.codepenId;
    link.target = "_blank";
    link.rel = "noopener";
  }

  const title = document.createElement("strong");
  title.textContent = demo.title;

  const description = document.createElement("span");
  description.textContent = demo.description;

  const badge = document.createElement("small");
  badge.className = `demo-badge demo-badge-${demo.type}`;
  badge.textContent = demo.type === "local" ? "Run here" : "CodePen ↗";

  link.append(title, description, badge);
  return link;
};

const renderDemos = (list, demos) => {
  for (const demo of demos) {
    const item = document.createElement("li");
    item.appendChild(createLink(demo));
    list.appendChild(item);
  }
};

const showError = (list) => {
  const item = document.createElement("li");
  item.className = "demo-error";
  item.textContent = "The demo list could not be loaded.";
  list.appendChild(item);
};

const list = document.getElementById("demo-list");

fetch(DEMOS_URL)
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((demos) => renderDemos(list, demos))
  .catch((error) => {
    console.error("Failed to load demos:", error);
    showError(list);
  });
