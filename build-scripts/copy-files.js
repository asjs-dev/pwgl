import fs from "fs";
import path from "path";
import { COLORS } from "./colors";

const NAME = "copy-files-plugin";

export function copyFiles(mappings = {}) {
  return {
    name: NAME,

    closeBundle() {
      const root = process.cwd();

      console.log(`[${NAME}] Copy files...`);

      Object.entries(mappings).forEach(([srcRel, destRel]) => {
        destRel = Array.isArray(destRel) ? destRel : [destRel];
        const src = path.resolve(root, srcRel);

        if (!fs.existsSync(src)) {
          console.error(`- Source not found: ${src}`);
          return;
        }
        console.log(`${COLORS.yellowOnBlack}- Copy ${srcRel}...${COLORS.reset}`);

        destRel.forEach((destRelSingle) => {
          const dest = path.resolve(root, destRelSingle);
          const stat = fs.statSync(src);

          try {
            if (stat.isDirectory()) {
              fs.cpSync(src, dest, { recursive: true });
              console.log(`${COLORS.blueOnBlack}-   Dir copied to ${destRelSingle}${COLORS.reset}`);
            } else {
              fs.mkdirSync(path.dirname(dest), { recursive: true });
              fs.copyFileSync(src, dest);
              console.log(`${COLORS.greenOnBlack}-   File copied to ${destRelSingle}${COLORS.reset}`);
            }
          } catch (err) {
            console.error(`-   Error copying to ${dest}`, err);
          }
        });
      });
    },
  };
}
