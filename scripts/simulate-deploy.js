const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const stagingDir = path.join(rootDir, "staging");

function copyDirectory(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

if (!fs.existsSync(distDir)) {
  throw new Error("No existe dist/. Ejecuta primero npm run build.");
}

fs.rmSync(stagingDir, { recursive: true, force: true });
copyDirectory(distDir, stagingDir);

console.log("Despliegue exitoso: archivos copiados a staging/.");
