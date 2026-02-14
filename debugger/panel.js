import { COLORS, getFormat, TYPES } from "./logFormatter";

const _HASH = String(Math.random()).split(".")[1],
  // prettier-ignore
  _STYLE = "" +
    "*[hidden] {" +
      "display:" + "none !important;" +
    "}" +
    
    "*[class*=\"-" + _HASH + "\"]," +
    "*[class*=\"-" + _HASH + "\"] > * {" +
      "box-sizing:" + "border-box;" +
    "}" +
    
    ".info-button-" + _HASH + " {" +
      "position:" + "fixed;" +
      "top:" + "10px;" +
      "left:" + "10px;" +
      "width:" + "20px;" +
      "height:" + "20px;" +
      "border-radius:" + "100%;" +
      "opacity:" + ".2;" +
      "background:" + "#0097e6;" +
      "color:" + "white;" +
      "font-size:" + "16px;" +
      "transition:" + "opacity 250ms linear;" +
      "cursor:" + "pointer;" +
      "z-index:" + "99999999;" +
      "display:" + "flex;" +
      "align-items:" + "center;" +
      "justify-content:" + "center;" +
      "font-family:" + "monospace;" +
      "box-shadow:" + "0 0 10px 0 rgba(0,0,0,.6);" +
    "}" +
    
    ".info-button-" + _HASH + ":after {" +
      "content:" + "\"i\";" +
    "}" +
    
    ".info-button-" + _HASH + ":hover {" +
      "opacity:" + "1;" +
    "}" +
    
    ".debugger-container-" + _HASH + " {" +
      "position:" + "fixed;" +
      "top:" + "0;" +
      "left:" + "0;" +
      "right:" + "0;" +
      "bottom:" + "0;" +
      "z-index:" + "99999999;" +
      "background:" + "rgba(0,0,0,.5);" +
      "display:" + "flex;" +
      "justify-content:" + "center;" +
      "align-items:" + "center;" +
      "background-image:" + "linear-gradient(45deg,#00000075 25%,transparent 25%,transparent 50%,#00000075 50%,#00000075 75%,transparent 75%);" +
      "background-size:" + "8px 8px;" +
    "}" +
    
    ".debugger-panel-" + _HASH + " {" +
      "min-width:" + "320px;" +
      "min-height:" + "240px;" +
      "width:" + "90vw;" +
      "max-width:" + "960px;" +
      "background:" + "rgba(0,0,0,.5);" +
      "position:" + "relative;" +
      "padding:" + "10px;" +
      "gap:" + "10px;" +
      "display:" + "flex;" +
      "flex-direction:" + "column;" +
      "box-shadow:" + "0 0 30px rgba(0,0,0,.35);" +
      "backdrop-filter:" + "blur(10px);" +
      "border:" + "1px solid rgba(255,255,255,.2);" +
      "border-radius:" + "3px;" +
    "}" +
    
    ".panel-container-" + _HASH + " {" +
      "display:" + "flex;" +
      "flex-direction:" + "row;" +
      "align-items:" + "center;" +
      "gap:" + "10px;" +
    "}" +
    
    ".panel-container-bottom-" + _HASH + " {" +
      "height:" + "70vh;" +
      "gap:" + "5px;" +
    "}" +
    
    ".panel-title-" + _HASH + " {" +
      "color:" + "white;" +
      "font-size:" + "16px;" +
      "font-family:" + "Arial;" +
      "width:" + "100%;" +
      "white-space:" + "nowrap;" +
      "overflow:" + "hidden;" +
      "text-overflow:" + "ellipsis;" +
      "padding-left:" + "5px;" +
    "}" +
    
    ".close-button-" + _HASH + " {" +
      "width:" + "20px;" +
      "height:" + "20px;" +
      "cursor:" + "pointer;" +
      "display:" + "flex;" +
      "align-items:" + "center;" +
      "justify-content:" + "center;" +
      "color:" + "white;" +
      "font-size:" + "16px;" +
    "}" +
    
    ".close-button-" + _HASH + ":after {" +
      "content:" + "\"✖\";" +
    "}" +
    
    ".instance-list-" + _HASH + " {" +
      "width:" + "120px;" +
      "height:" + "100%;" +
      "padding:" + "0;" +
      "margin:" + "0;" +
      "overflow:" + "auto;" +
    "}" +
    
    ".instance-button-" + _HASH + " {" +
      "padding:" + "4px 6px;" +
      "background:" + "black;" +
      "font-family:" + "Arial;" +
      "font-size:" + "14px;" +
      "color:" + "white;" +
      "transition:" + "opacity 250ms linear;" +
      "cursor:" + "pointer;" +
      "overflow:" + "hidden;" +
      "text-overflow:" + "ellipsis;" +
      "font-weight:" + "bold;" +
      "white-space:" + "nowrap;" +
      "opacity:" + ".75;" +
    "}" +
    
    ".instance-button-" + _HASH + ":hover {" +
      "opacity:" + "1;" +
    "}" +
    
    ".output-" + _HASH + " {" +
      "width:" + "100%;" +
      "height:" + "100%;" +
      "padding:" + "1px;" +
      "background:" + "rgba(0,0,0,.75);" +
      "overflow:" + "scroll;" +
      "display:" + "flex;" +
      "flex-direction:" + "column;" +
      "gap:" + "2px;" +
      "margin:" + "0;" +
      "scrollbar-width:" + "none;" +
    "}" +
    
    ".output-" + _HASH + " span {" +
      "min-width:" + "fit-content;" +
      "width:" + "100%;" +
      "text-wrap-mode:" + "wrap;" +
      "word-break:" + "break-word;" +
      "border:" + "1px solid rgba(255,255,255,0);" +
      "transition:" + "all 250ms linear;" +
      "cursor:" + "pointer;" +
      "padding:" + "3px 6px;" +
    "}" +
    
    ".output-" + _HASH + " span:hover {" +
      "border:" + "1px solid rgba(255,255,255,.5);" +
    "}" +

    COLORS.map((v) => ".output-" + _HASH + " span[type=\"" + v.label + "\"] {" +
      "background:" + v.bg + ";" + 
      "color:" + v.color + ";" + 
    "}" + 

    ".output-" + _HASH + " span[type=\"" + v.label + "\"]:before {" +
      "content:" + "\"" + v.icon + " " + v.label + " \";" +
    "}").join("") +

    ".output-" + _HASH + " span a {" +
      "color:" + "inherit;" +
    "}";

const _createElement = (elementType = "div", classList = []) => {
  const element = document.createElement(elementType);
  element.classList.add(...classList);
  return element;
};

const _createEntry = (textContent, typeName) =>
  `<span type=\"${typeName}\">${textContent}</span>\n`;

/**
 * Create and attach the PWGL debugger UI overlay.
 *
 * The panel is mounted once to `document.body` and displays
 * captured frame snapshots for each tracked WebGL canvas.
 */
export const panel = () => {
  const styleElement = _createElement("style");
  styleElement.textContent = _STYLE;

  const infoButton = _createElement("div", ["info-button-" + _HASH]),
    debuggerContainer = _createElement("div", ["debugger-container-" + _HASH]),
    debuggerPanel = _createElement("div", ["debugger-panel-" + _HASH]),
    topPanelContainer = _createElement("div", ["panel-container-" + _HASH]),
    bottomPanelContainer = _createElement("div", [
      "panel-container-" + _HASH,
      "panel-container-bottom-" + _HASH,
    ]),
    panelTitle = _createElement("div", ["panel-title-" + _HASH]),
    closeButton = _createElement("div", ["close-button-" + _HASH]),
    instanceList = _createElement("ul", ["instance-list-" + _HASH]),
    output = _createElement("pre", ["output-" + _HASH]);

  panelTitle.textContent = "WebGL2 debug panel";

  const showDebugger = () => debuggerContainer.removeAttribute("hidden"),
    hideDebugger = () => debuggerContainer.setAttribute("hidden", null),
    showDetails = (id) => {
      const instance = PWGLDebugger.instances[id];
      if (instance) {
        let result = "",
          maxSumFrameDurationMSLength = 0,
          maxCurrentCallDurationMSLength = 0,
          maxPropLength = 0;

        instance.snapshots.forEach((frame) =>
          frame.forEach((entry) => {
            maxSumFrameDurationMSLength = Math.max(
              maxSumFrameDurationMSLength,
              String(entry.sumFrameDurationMS).length,
            );
            maxCurrentCallDurationMSLength = Math.max(
              maxCurrentCallDurationMSLength,
              String(entry.currentCallDurationMS).length,
            );
            maxPropLength = Math.max(maxPropLength, entry.prop.length);
          }),
        );

        const paramIndent = String("").padStart(
          14 +
            maxSumFrameDurationMSLength +
            maxCurrentCallDurationMSLength +
            maxPropLength,
        );

        instance.snapshots.forEach((frame, frameId) => {
          result += _createEntry("#" + frameId, TYPES.FRAME);

          frame.forEach((entry) => {
            const format = getFormat(entry.currentCallDurationMS, entry.prop);

            result += _createEntry(
              `${String(entry.sumFrameDurationMS).padStart(maxSumFrameDurationMSLength)}ms ` +
                `${String(entry.currentCallDurationMS).padStart(maxCurrentCallDurationMSLength)}ms ` +
                `${String(entry.prop).padStart(maxPropLength)} ` +
                (entry.args.length ? entry.args.join("\n" + paramIndent) : "") +
                entry.stackTrace,
              format,
            );
          });
        });

        output.innerHTML = result;
      }
    },
    updateDebuggerPanel = () => {
      [...instanceList.children].forEach((child) => child.remove());

      PWGLDebugger.instances.forEach((instance, id) => {
        const instanceButton = _createElement("div", [
          "instance-button-" + _HASH,
        ]);
        instanceButton.setAttribute("instance-id", id);
        instanceButton.textContent = `#${id + 1} Canvas`;
        instanceList.appendChild(instanceButton);
        id === 0 && showDetails(0);
      });
    };

  hideDebugger();

  infoButton.addEventListener("mousedown", (event) => {
    event.stopPropagation();
    updateDebuggerPanel();
    showDebugger();
  });
  closeButton.addEventListener("click", hideDebugger);
  instanceList.addEventListener("click", (event) =>
    showDetails(parseInt(event.target.getAttribute("instance-id"))),
  );
  debuggerContainer.addEventListener("mousedown", (event) =>
    event.stopPropagation(),
  );

  topPanelContainer.appendChild(panelTitle);
  topPanelContainer.appendChild(closeButton);
  bottomPanelContainer.appendChild(instanceList);
  bottomPanelContainer.appendChild(output);
  debuggerPanel.appendChild(topPanelContainer);
  debuggerPanel.appendChild(bottomPanelContainer);
  debuggerContainer.appendChild(debuggerPanel);
  document.body.appendChild(styleElement);
  document.body.appendChild(infoButton);
  document.body.appendChild(debuggerContainer);
};
