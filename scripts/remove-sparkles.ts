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
let replacedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  if (content.includes("Sparkles") || content.includes("✨")) {
    // Remove ✨ emoji
    content = content.replaceAll("✨", "");

    // Replace Sparkles with Zap (or appropriate) in lucide-react imports
    // If Zap already exists, just remove Sparkles
    if (content.includes("Sparkles")) {
      content = content.replace(/\bSparkles,\s*/g, "");
      content = content.replace(/,\s*Sparkles\b/g, "");
      content = content.replace(/\bSparkles\b/g, "Zap");

      // Ensure Zap is imported if used
      if (content.includes("<Zap") && !content.includes("Zap") && !content.includes("Zap,")) {
        content = content.replace(/from ["']lucide-react["']/, 'from "lucide-react"');
      }
    }

    fs.writeFileSync(file, content, "utf8");
    replacedCount++;
  }
}

console.log(`Replaced Sparkles in ${replacedCount} files.`);
