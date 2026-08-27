import fs from "node:fs";
import path from "node:path";

function walkDir(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (/\.(tsx|ts|jsx|js)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = walkDir(path.resolve("src"));
let fixedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const usesZap = /\bZap\b/.test(content);
  
  if (usesZap) {
    const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']/s);
    if (importMatch) {
      const importedNames = importMatch[1].split(",").map((s) => s.trim());
      if (!importedNames.includes("Zap")) {
        const newImport = `import {\n  Zap,\n  ${importMatch[1].trim()}\n} from "lucide-react"`;
        content = content.replace(importMatch[0], newImport);
        fs.writeFileSync(file, content, "utf8");
        fixedCount++;
      }
    }
  }
}

console.log(`Added Zap import to ${fixedCount} files.`);
