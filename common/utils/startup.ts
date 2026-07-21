/** This function ensures that the provided callback is executed when the document is ready */
export const startup = (func: () => void): void => {
  ["interactive", "complete"].includes(document.readyState)
    ? func()
    : document.addEventListener("DOMContentLoaded", () => func(), {
        once: true,
      });
};
