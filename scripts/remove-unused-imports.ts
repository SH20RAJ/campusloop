import * as fs from "node:fs";
import * as path from "node:path";
import ts from "typescript";

function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!["node_modules", ".next", ".git", ".open-next"].includes(file)) {
        getAllSourceFiles(fullPath, fileList);
      }
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function cleanUnusedImports() {
  const srcDir = path.resolve(process.cwd(), "src");
  if (!fs.existsSync(srcDir)) {
    console.error("src directory not found");
    return;
  }

  const filePaths = getAllSourceFiles(srcDir);
  console.log(`Analyzing ${filePaths.length} source files for unused imports...`);

  // Read tsconfig.json compiler options
  const configPath = path.resolve(process.cwd(), "tsconfig.json");
  let compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.Preserve,
    allowJs: true,
    esModuleInterop: true,
  };

  if (fs.existsSync(configPath)) {
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      process.cwd()
    );
    compilerOptions = parsedConfig.options;
  }

  // Create TypeScript language service host
  const fileContents = new Map<string, string>();
  for (const filePath of filePaths) {
    fileContents.set(filePath, fs.readFileSync(filePath, "utf-8"));
  }

  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => filePaths,
    getScriptVersion: () => "1",
    getScriptSnapshot: (fileName) => {
      if (!fs.existsSync(fileName)) return undefined;
      const content = fileContents.get(fileName) ?? fs.readFileSync(fileName, "utf-8");
      return ts.ScriptSnapshot.fromString(content);
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  };

  const languageService = ts.createLanguageService(
    servicesHost,
    ts.createDocumentRegistry()
  );

  let updatedCount = 0;

  for (const filePath of filePaths) {
    try {
      const changes = languageService.organizeImports(
        { type: "file", fileName: filePath },
        {},
        {}
      );


      if (changes && changes.length > 0) {
        let content = fileContents.get(filePath) ?? fs.readFileSync(filePath, "utf-8");
        // Apply text changes in reverse order to preserve character offsets
        const textChanges = changes.flatMap((c) => c.textChanges);
        textChanges.sort((a, b) => b.span.start - a.span.start);

        let modified = content;
        for (const change of textChanges) {
          const prefix = modified.substring(0, change.span.start);
          const suffix = modified.substring(change.span.start + change.span.length);
          modified = prefix + change.newText + suffix;
        }

        if (modified !== content) {
          fs.writeFileSync(filePath, modified, "utf-8");
          fileContents.set(filePath, modified);
          updatedCount++;
          console.log(`Cleaned imports: ${path.relative(process.cwd(), filePath)}`);
        }
      }
    } catch (err) {
      console.warn(`Skipped ${filePath}:`, err);
    }
  }

  console.log(`Done! Cleaned unused imports across ${updatedCount} files.`);
}

cleanUnusedImports();
