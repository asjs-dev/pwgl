import { beforeEach, describe, expect, it, vi } from "vitest";
import { installDocumentMock } from "./helpers/domMocks";

describe("panel", () => {
  beforeEach(() => {
    vi.resetModules();
    globalThis.PWGLDebugger = {
      instances: [
        {
          canvas: { id: "a" },
          snapshots: [
            [
              {
                sumFrameDurationMS: 1,
                currentCallDurationMS: 0,
                prop: "useProgram",
                args: ["1"],
                stackTrace: "",
              },
            ],
          ],
        },
      ],
    };
    installDocumentMock();
  });

  it("creates and appends the debugger overlay to the document body", async () => {
    const { panel } = await import("../../../debugger/panel.js");

    panel();

    expect(document.body.appendChild).toHaveBeenCalledTimes(3);
    expect(document.created.some((el) => el.tagName === "STYLE")).toBe(true);
    expect(document.created.some((el) => el.tagName === "PRE")).toBe(true);
  });

  it("updates the panel output when instance buttons are clicked", async () => {
    const { panel } = await import("../../../debugger/panel.js");

    panel();

    const infoButton = document.created.find((el) => el.classList.toArray().some((v) => v.includes("info-button")));
    const debuggerContainer = document.created.find((el) =>
      el.classList.toArray().some((v) => v.includes("debugger-container")),
    );
    const instanceList = document.created.find((el) => el.tagName === "UL");
    const output = document.created.find((el) => el.tagName === "PRE");

    infoButton.dispatch("mousedown", { stopPropagation: vi.fn() });
    expect(debuggerContainer.removeAttribute).toHaveBeenCalledWith("hidden");
    expect(instanceList.children).toHaveLength(1);
    expect(output.innerHTML).toContain("useProgram");

    instanceList.dispatch("click", {
      target: {
        getAttribute: () => "0",
      },
    });
    expect(output.innerHTML).toContain("FRAME");
  });
});
