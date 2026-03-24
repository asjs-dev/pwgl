const fs = require("fs");
const path = require("path");
const { COLORS } = require("./colors");

const foldersToDelete = [
  path.resolve("docs/extensions/fonts"),
  path.resolve("docs/extensions/scripts"),
  path.resolve("docs/extensions/styles"),
  path.resolve("docs/debugger/fonts"),
  path.resolve("docs/debugger/scripts"),
  path.resolve("docs/debugger/styles"),
];

foldersToDelete.forEach((folderToDelete) => {
  if (fs.existsSync(folderToDelete)) {
    fs.rmSync(folderToDelete, { recursive: true, force: true });
    console.log(`${COLORS.yellowOnBlack}- Deleted folder: ${folderToDelete}${COLORS.reset}`);
  } else {
    console.log(`${COLORS.redOnBlack}- Folder not found, nothing to delete: ${folderToDelete}${COLORS.reset}`);
  }
});
