const _layoutPart = (lines, ctx, chars, maxWidth) => {
  let charLine = "";
  for (let c = 0; c < chars.length; c++) {
    const testChar = charLine + chars[c];
    if (ctx.measureText(testChar).width <= maxWidth) charLine = testChar;
    else {
      charLine && lines.push(charLine);
      charLine = chars[c];
    }
  }
  charLine && lines.push(charLine);
};

/**
 * Layouts text into lines based on the maximum width.
 *
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context used to measure text width.
 * @param {string} text - The text to be laid out.
 * @param {number} maxWidth - The maximum width for each line.
 * @returns {string[]} An array of strings, each representing a line of laid-out text.
 */
export const layoutText = (ctx, text, maxWidth) => {
  const lines = [],
    textLines = text.split("\n");

  for (let i = 0; i < textLines.length; i++) {
    const paragraph = textLines[i];

    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }

    let currentLine = "",
      cursor = 0;

    while (cursor < paragraph.length) {
      let nextSpace = paragraph.indexOf(" ", cursor);
      if (nextSpace === -1) nextSpace = paragraph.length;

      const word = paragraph.slice(cursor, nextSpace),
        testLine = currentLine + (currentLine === "" ? "" : " ") + word;

      if (ctx.measureText(testLine).width <= maxWidth) currentLine = testLine;
      else {
        if (ctx.measureText(word).width > maxWidth) {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = "";
          }

          if (word.includes("-")) {
            const parts = word.split(/(-)/);
            let partLine = "";

            for (let p = 0; p < parts.length; p++) {
              const testPart = partLine + parts[p];
              if (ctx.measureText(testPart).width <= maxWidth)
                partLine = testPart;
              else {
                partLine && lines.push(partLine);

                if (ctx.measureText(parts[p]).width > maxWidth) {
                  _layoutPart(lines, ctx, [...parts[p]], maxWidth);
                  partLine = "";
                } else partLine = parts[p];
              }
            }
            partLine && lines.push(partLine);
          } else _layoutPart(lines, ctx, [...word], maxWidth);
        } else {
          currentLine && lines.push(currentLine);
          currentLine = word;
        }
      }

      cursor = nextSpace + 1;
    }

    currentLine && lines.push(currentLine);
  }

  return lines;
};
