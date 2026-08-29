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

function fixCanonicalClasses() {
  const srcDir = path.resolve(process.cwd(), "src");
  const files = getAllFiles(srcDir);
  let changedFiles = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, "utf-8");
    const original = content;

    // Fix stroke-[3] -> stroke-3
    content = content.replaceAll("stroke-[3]", "stroke-3");
    content = content.replaceAll("stroke-[2.5]", "stroke-2");
    content = content.replaceAll("stroke-[1.5]", "stroke-1");
    content = content.replaceAll("stroke-[1.8]", "stroke-2");

    // Fix gradients in Tailwind v4
    content = content.replaceAll("bg-gradient-to-r", "bg-linear-to-r");
    content = content.replaceAll("bg-gradient-to-t", "bg-linear-to-t");
    content = content.replaceAll("bg-gradient-to-b", "bg-linear-to-b");
    content = content.replaceAll("bg-gradient-to-tr", "bg-linear-to-tr");
    content = content.replaceAll("bg-gradient-to-br", "bg-linear-to-br");
    content = content.replaceAll("bg-gradient-to-tl", "bg-linear-to-tl");
    content = content.replaceAll("bg-gradient-to-bl", "bg-linear-to-bl");
    content = content.replaceAll("bg-gradient-to-l", "bg-linear-to-l");

    if (content !== original) {
      fs.writeFileSync(file, content, "utf-8");
      changedFiles++;
      console.log(`Updated canonical classes in: ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`Finished fixing canonical classes across ${changedFiles} files.`);
}

fixCanonicalClasses();
