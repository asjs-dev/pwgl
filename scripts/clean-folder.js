const fs = require("fs");
const path = require("path");

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
    console.log(`Deleted folder: ${folderToDelete}`);
  } else {
    console.log(`Folder not found, nothing to delete: ${folderToDelete}`);
  }
});
