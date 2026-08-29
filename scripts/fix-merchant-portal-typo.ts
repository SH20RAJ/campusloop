import * as fs from "node:fs";
import * as path from "node:path";

function getAllFiles(dir: string, list: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!["node_modules", ".next", ".git", ".open-next"].includes(file)) {
        getAllFiles(full, list);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".css")) {
      list.push(full);
    }
  }
  return list;
}

function fixMerchantPortalTypo() {
  const srcDir = path.resolve(process.cwd(), "src");
  const files = getAllFiles(srcDir);
  let changedFiles = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, "utf-8");
    const original = content;

    content = content.replaceAll("/merchantt-portal", "/merchant-portal");

    if (content !== original) {
      fs.writeFileSync(file, content, "utf-8");
      changedFiles++;
      console.log(`Updated merchant portal path in: ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`Finished fixing merchant portal paths across ${changedFiles} files.`);
}

fixMerchantPortalTypo();
