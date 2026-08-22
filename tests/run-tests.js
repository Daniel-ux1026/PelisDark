const fs = require("fs");
const path = require("path");
const vm = require("vm");

const rootDir = path.resolve(__dirname, "..");
const appPath = path.join(rootDir, "js", "app.js");
const htmlPath = path.join(rootDir, "index.html");
const cssPath = path.join(rootDir, "css", "styles.css");

function test(name, callback) {
  try {
    callback();
    console.log(`OK - ${name}`);
  } catch (error) {
    console.error(`FAIL - ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readFile(filePath) {
  assert(fs.existsSync(filePath), `No existe ${filePath}`);
  return fs.readFileSync(filePath, "utf8");
}

const html = readFile(htmlPath);
const css = readFile(cssPath);
const app = readFile(appPath);

function extractCatalog(source) {
  const startToken = "const catalog = ";
  const endToken = "];\n\nconst featuredContent";
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken);

  assert(start >= 0, "No se encontro el arreglo catalog.");
  assert(end > start, "No se pudo determinar el final del arreglo catalog.");

  const catalogLiteral = source.slice(start + startToken.length, end + 1);
  return vm.runInNewContext(catalogLiteral);
}

const catalog = extractCatalog(app);

test("index.html enlaza CSS y JavaScript", () => {
  assert(html.includes('href="css/styles.css"'), "Falta el enlace a css/styles.css.");
  assert(html.includes('src="js/app.js"'), "Falta el enlace a js/app.js.");
});

test("catalogo tiene al menos 40 contenidos ficticios", () => {
  assert(Array.isArray(catalog), "catalog no es un arreglo.");
  assert(catalog.length >= 40, `catalog tiene ${catalog.length} elementos.`);
});

test("cada contenido tiene los campos obligatorios", () => {
  const requiredFields = [
    "id",
    "title",
    "type",
    "year",
    "genre",
    "rating",
    "duration",
    "description",
    "section",
    "background"
  ];

  catalog.forEach((item) => {
    requiredFields.forEach((field) => {
      assert(Object.prototype.hasOwnProperty.call(item, field), `${item.title || item.id} no tiene ${field}.`);
    });
  });
});

test("existen las secciones requeridas", () => {
  const requiredSections = [
    "Tendencias",
    "Peliculas populares",
    "Series recomendadas",
    "Estrenos",
    "Accion",
    "Ciencia ficcion",
    "Terror",
    "Familia"
  ];
  const sections = new Set(catalog.map((item) => item.section));

  requiredSections.forEach((section) => {
    assert(sections.has(section), `Falta contenido para la seccion ${section}.`);
  });
});

test("busqueda, filtros, favoritos, modal y reproductor estan implementados", () => {
  assert(app.includes("localStorage"), "Falta persistencia con localStorage.");
  assert(app.includes("applySearchAndFilters"), "Falta logica de busqueda/filtros.");
  assert(app.includes("openDetails"), "Falta modal de detalles.");
  assert(app.includes("openPlayer"), "Falta reproductor simulado.");
  assert(app.includes("No se encontraron resultados"), "Falta mensaje de busqueda sin resultados.");
});

test("CSS contiene responsive design y estilos de experiencia visual", () => {
  assert(css.includes("@media"), "Faltan media queries.");
  assert(css.includes("transition"), "Faltan transiciones.");
  assert(css.includes("scroll-snap-type"), "Falta scroll horizontal mejorado.");
  assert(css.includes("backdrop-filter"), "Faltan efectos visuales premium.");
});
