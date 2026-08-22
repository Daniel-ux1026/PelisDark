const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const requiredFiles = [
  "index.html",
  "css/styles.css",
  "js/app.js",
  "README.md"
];

function assertFileExists(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Falta el archivo requerido: ${relativePath}`);
  }
}

function copyFile(relativePath) {
  const source = path.join(rootDir, relativePath);
  const target = path.join(distDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function cleanDirectory(directory) {
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
}

requiredFiles.forEach(assertFileExists);
execFileSync(process.execPath, ["--check", path.join(rootDir, "js", "app.js")], {
  stdio: "inherit"
});

cleanDirectory(distDir);
requiredFiles.forEach(copyFile);

console.log("Compilacion/validacion exitosa. Archivos generados en dist/.");
