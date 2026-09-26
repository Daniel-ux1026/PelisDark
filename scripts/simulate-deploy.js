const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "frontend", "dist");
const jar = path.join(rootDir, "backend", "target", "pelisdark-api-2.0.0.jar");
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

if (!fs.existsSync(distDir) || !fs.existsSync(jar)) {
  throw new Error("Compila primero React (npm run build) y Java (mvn -f backend/pom.xml package).");
}

fs.rmSync(stagingDir, { recursive: true, force: true });
copyDirectory(distDir, path.join(stagingDir, "frontend"));
fs.mkdirSync(path.join(stagingDir, "backend", "src", "main", "resources"), { recursive: true });
fs.copyFileSync(jar, path.join(stagingDir, "backend", "pelisdark-api-2.0.0.jar"));
fs.copyFileSync(path.join(rootDir, "backend/src/main/resources/catalog.json"), path.join(stagingDir, "backend/src/main/resources/catalog.json"));
fs.mkdirSync(path.join(stagingDir, "chatbot"));
for (const file of ["app.py", "service.py", "requirements.txt"]) fs.copyFileSync(path.join(rootDir,"chatbot",file),path.join(stagingDir,"chatbot",file));
fs.copyFileSync(path.join(rootDir,"README.md"),path.join(stagingDir,"README.md"));

console.log("Despliegue exitoso: archivos copiados a staging/.");
