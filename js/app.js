const catalog = [
  { id: 1, title: "Sombras del Horizonte", type: "Pelicula", year: 2026, genre: "Ciencia ficcion", rating: 9.3, duration: "2h 08m", description: "Una expedicion cruza una ciudad suspendida mientras una transmision perdida despierta secretos de otra era.", section: "Tendencias", background: "linear-gradient(135deg, #00d1ff, #372764 52%, #06070c)" },
  { id: 2, title: "Reino Nocturno", type: "Serie", year: 2025, genre: "Drama", rating: 8.7, duration: "8 episodios", description: "Tres familias rivales gobiernan una capital sin amanecer y negocian el precio de la memoria.", section: "Tendencias", background: "linear-gradient(135deg, #ff3f81, #362146 58%, #090a10)" },
  { id: 3, title: "Codigo Estelar", type: "Pelicula", year: 2024, genre: "Accion", rating: 8.9, duration: "1h 56m", description: "Una piloto descifra un mapa vivo antes de que una flota clandestina borre su planeta natal.", section: "Tendencias", background: "linear-gradient(135deg, #7cffb2, #165d67 50%, #061017)" },
  { id: 4, title: "Guardianes del Silencio", type: "Serie", year: 2026, genre: "Accion", rating: 9.1, duration: "10 episodios", description: "Un equipo secreto protege archivos capaces de convertir cualquier susurro en una amenaza global.", section: "Tendencias", background: "linear-gradient(135deg, #f3c969, #71323a 54%, #0b0c12)" },
  { id: 5, title: "Ciudad Abisal", type: "Pelicula", year: 2025, genre: "Terror", rating: 8.4, duration: "1h 49m", description: "Una biologa baja a una estacion oceanica donde las luces responden a pensamientos ajenos.", section: "Tendencias", background: "linear-gradient(135deg, #1d5a83, #12192c 48%, #020409)" },

  { id: 6, title: "Ecos de Medianoche", type: "Pelicula", year: 2024, genre: "Terror", rating: 8.2, duration: "1h 42m", description: "Cada campanada revela una version distinta de una casa que no deberia existir.", section: "Peliculas populares", background: "linear-gradient(135deg, #7e1f4b, #1a1024 52%, #050507)" },
  { id: 7, title: "La Ultima Orbita", type: "Pelicula", year: 2026, genre: "Ciencia ficcion", rating: 9.0, duration: "2h 15m", description: "La ultima nave alrededor de una luna rota decide entre salvar su tripulacion o salvar la verdad.", section: "Peliculas populares", background: "linear-gradient(135deg, #5c7cff, #18224c 50%, #070812)" },
  { id: 8, title: "Niebla Carmesi", type: "Pelicula", year: 2023, genre: "Drama", rating: 8.0, duration: "1h 58m", description: "Una periodista vuelve a su pueblo cuando una niebla roja expone las culpas de sus habitantes.", section: "Peliculas populares", background: "linear-gradient(135deg, #d43d5d, #4b1f2f 55%, #07070b)" },
  { id: 9, title: "Archivo Secreto", type: "Pelicula", year: 2025, genre: "Accion", rating: 8.6, duration: "2h 01m", description: "Un analista roba un expediente imposible y descubre que su identidad fue escrita por otros.", section: "Peliculas populares", background: "linear-gradient(135deg, #00a88f, #143a4f 50%, #080a0f)" },
  { id: 10, title: "El Valle Perdido", type: "Pelicula", year: 2022, genre: "Familia", rating: 8.1, duration: "1h 37m", description: "Dos hermanos encuentran un valle oculto donde cada criatura protege un recuerdo familiar.", section: "Peliculas populares", background: "linear-gradient(135deg, #81d86e, #2f5f54 54%, #08100d)" },

  { id: 11, title: "Circuito Fantasma", type: "Serie", year: 2026, genre: "Ciencia ficcion", rating: 8.8, duration: "7 episodios", description: "Una ciudad inteligente empieza a repetir el pasado de sus ciudadanos para evitar una catastrofe.", section: "Series recomendadas", background: "linear-gradient(135deg, #28d8ff, #223463 56%, #05060c)" },
  { id: 12, title: "Rutas del Alba", type: "Serie", year: 2024, genre: "Familia", rating: 8.3, duration: "12 episodios", description: "Una familia viajera restaura mapas antiguos que abren caminos hacia lugares olvidados.", section: "Series recomendadas", background: "linear-gradient(135deg, #ffcc66, #356864 54%, #080b0f)" },
  { id: 13, title: "La Torre Vacia", type: "Serie", year: 2025, genre: "Terror", rating: 8.5, duration: "6 episodios", description: "Un ascensor sube cada noche a pisos que no figuran en los planos.", section: "Series recomendadas", background: "linear-gradient(135deg, #8b5cf6, #23152e 52%, #060508)" },
  { id: 14, title: "Compas de Acero", type: "Serie", year: 2023, genre: "Accion", rating: 7.9, duration: "9 episodios", description: "Una banda de especialistas ejecuta rescates imposibles guiada por una brujula mecanica.", section: "Series recomendadas", background: "linear-gradient(135deg, #ff8a3d, #67343a 54%, #0b0908)" },
  { id: 15, title: "Bitacora Azul", type: "Serie", year: 2026, genre: "Comedia", rating: 8.0, duration: "10 episodios", description: "La tripulacion mas torpe de una flota cientifica intenta parecer profesional en cada mision.", section: "Series recomendadas", background: "linear-gradient(135deg, #51e0c2, #31516a 52%, #070b10)" },

  { id: 16, title: "Linea de Fuego", type: "Pelicula", year: 2026, genre: "Accion", rating: 8.7, duration: "1h 51m", description: "Una mensajera cruza una ciudad bloqueada para entregar un codigo que puede detener una guerra.", section: "Estrenos", background: "linear-gradient(135deg, #ff4d4d, #4a2738 50%, #09090d)" },
  { id: 17, title: "Marea Invisible", type: "Serie", year: 2026, genre: "Drama", rating: 8.4, duration: "8 episodios", description: "Una comunidad costera enfrenta desapariciones cuando el mar empieza a devolver cartas del futuro.", section: "Estrenos", background: "linear-gradient(135deg, #34a1ff, #23445f 50%, #071018)" },
  { id: 18, title: "El Jardin de Neon", type: "Pelicula", year: 2026, genre: "Ciencia ficcion", rating: 8.9, duration: "2h 06m", description: "Una botanica cultiva plantas luminosas que guardan conversaciones de personas desaparecidas.", section: "Estrenos", background: "linear-gradient(135deg, #7cffb2, #2b4f5f 52%, #06100d)" },
  { id: 19, title: "Hotel Eclipse", type: "Serie", year: 2026, genre: "Comedia", rating: 7.8, duration: "8 episodios", description: "El personal de un hotel orbital resuelve problemas absurdos durante un eclipse interminable.", section: "Estrenos", background: "linear-gradient(135deg, #ffdc7a, #5c3762 52%, #09070d)" },
  { id: 20, title: "Puertas de Hielo", type: "Pelicula", year: 2026, genre: "Familia", rating: 8.2, duration: "1h 44m", description: "Una nina y su abuelo buscan llaves antiguas dentro de montanas que cantan al atardecer.", section: "Estrenos", background: "linear-gradient(135deg, #a4f1ff, #536c8a 54%, #071018)" },

  { id: 21, title: "Impacto Norte", type: "Pelicula", year: 2025, genre: "Accion", rating: 8.1, duration: "1h 46m", description: "Un equipo de rescate persigue un tren autonomo cargado con tecnologia experimental.", section: "Accion", background: "linear-gradient(135deg, #ff6a3d, #43323c 50%, #090807)" },
  { id: 22, title: "Distrito Cero", type: "Serie", year: 2024, genre: "Accion", rating: 8.3, duration: "10 episodios", description: "Agentes sin insignia protegen el unico barrio donde las camaras no pueden grabar.", section: "Accion", background: "linear-gradient(135deg, #00b2ff, #203040 52%, #05080c)" },
  { id: 23, title: "Pulso Rojo", type: "Pelicula", year: 2023, genre: "Accion", rating: 7.7, duration: "1h 39m", description: "Un corredor urbano transporta un dispositivo que late mas rapido cuando se acerca el peligro.", section: "Accion", background: "linear-gradient(135deg, #ff2f5f, #47233c 48%, #08060a)" },
  { id: 24, title: "Clave Relampago", type: "Serie", year: 2025, genre: "Accion", rating: 8.6, duration: "6 episodios", description: "Cuatro especialistas roban energia de tormentas para evitar un apagado continental.", section: "Accion", background: "linear-gradient(135deg, #f4e85a, #355773 52%, #07090d)" },
  { id: 25, title: "Frontera Latente", type: "Pelicula", year: 2024, genre: "Accion", rating: 8.0, duration: "2h 03m", description: "Una frontera digital se vuelve fisica y obliga a dos rivales a cruzarla juntos.", section: "Accion", background: "linear-gradient(135deg, #29f1a5, #24445a 54%, #06100f)" },

  { id: 26, title: "Nucleo Aurora", type: "Serie", year: 2025, genre: "Ciencia ficcion", rating: 8.9, duration: "9 episodios", description: "Una estacion polar descubre un sol miniatura enterrado bajo el hielo.", section: "Ciencia ficcion", background: "linear-gradient(135deg, #9bf6ff, #3d4d7a 52%, #050814)" },
  { id: 27, title: "Memoria Sintetica", type: "Pelicula", year: 2023, genre: "Ciencia ficcion", rating: 8.2, duration: "1h 57m", description: "Una archivista vende recuerdos fabricados hasta encontrar uno que predice su propia vida.", section: "Ciencia ficcion", background: "linear-gradient(135deg, #c17cff, #343061 52%, #080811)" },
  { id: 28, title: "Reloj de Titanio", type: "Serie", year: 2024, genre: "Ciencia ficcion", rating: 8.5, duration: "8 episodios", description: "Un relojero repara minutos defectuosos antes de que el tiempo pierda consistencia.", section: "Ciencia ficcion", background: "linear-gradient(135deg, #00d1ff, #405063 52%, #070b10)" },
  { id: 29, title: "Orbital Nueve", type: "Pelicula", year: 2025, genre: "Ciencia ficcion", rating: 8.4, duration: "2h 10m", description: "La novena colonia orbital queda aislada cuando descubre que su planeta no responde desde hace anos.", section: "Ciencia ficcion", background: "linear-gradient(135deg, #597cff, #20254d 54%, #060714)" },
  { id: 30, title: "Lenguaje de Luz", type: "Serie", year: 2026, genre: "Ciencia ficcion", rating: 9.0, duration: "7 episodios", description: "Linguistas traducen destellos del cielo y encuentran instrucciones para construir una puerta.", section: "Ciencia ficcion", background: "linear-gradient(135deg, #f4ff7a, #25736d 52%, #07100f)" },

  { id: 31, title: "Casa de Sal", type: "Pelicula", year: 2024, genre: "Terror", rating: 8.1, duration: "1h 40m", description: "Una casa costera se conserva con sal para impedir que algo enterrado vuelva a respirar.", section: "Terror", background: "linear-gradient(135deg, #d2d7d3, #3c4550 48%, #06070a)" },
  { id: 32, title: "Voces del Tunel", type: "Serie", year: 2025, genre: "Terror", rating: 8.3, duration: "6 episodios", description: "Un tunel abandonado repite voces de personas que todavia no han entrado.", section: "Terror", background: "linear-gradient(135deg, #6d6bff, #1b1a2e 52%, #030305)" },
  { id: 33, title: "El Cuarto Latido", type: "Pelicula", year: 2026, genre: "Terror", rating: 8.6, duration: "1h 48m", description: "Un edificio antiguo esconde un cuarto que aparece cuando alguien miente.", section: "Terror", background: "linear-gradient(135deg, #a51f40, #25101d 52%, #050406)" },
  { id: 34, title: "Umbral Negro", type: "Serie", year: 2023, genre: "Terror", rating: 7.9, duration: "8 episodios", description: "Cada episodio sigue a una persona distinta al cruzar una puerta sin regreso aparente.", section: "Terror", background: "linear-gradient(135deg, #513a60, #141019 52%, #020203)" },
  { id: 35, title: "Lago Dormido", type: "Pelicula", year: 2025, genre: "Terror", rating: 8.0, duration: "1h 43m", description: "Un lago sin olas guarda bajo su superficie todas las pesadillas de un pueblo.", section: "Terror", background: "linear-gradient(135deg, #1f6a73, #10232b 54%, #030708)" },

  { id: 36, title: "La Banda del Cometa", type: "Serie", year: 2024, genre: "Familia", rating: 8.2, duration: "12 episodios", description: "Cinco amigos construyen instrumentos que capturan sonidos dejados por cometas.", section: "Familia", background: "linear-gradient(135deg, #ffb86b, #4b806f 52%, #08100d)" },
  { id: 37, title: "Mapa de Caramelo", type: "Pelicula", year: 2023, genre: "Familia", rating: 7.8, duration: "1h 31m", description: "Una receta antigua lleva a una familia a descubrir una ciudad dulce que cambia de lugar.", section: "Familia", background: "linear-gradient(135deg, #ff8ab3, #645a87 52%, #09080e)" },
  { id: 38, title: "Inventores del Patio", type: "Serie", year: 2025, genre: "Comedia", rating: 8.1, duration: "10 episodios", description: "Tres vecinos convierten objetos cotidianos en inventos demasiado grandes para su patio.", section: "Familia", background: "linear-gradient(135deg, #74f0ff, #4b6d54 52%, #070f0b)" },
  { id: 39, title: "Travesia Minima", type: "Pelicula", year: 2026, genre: "Familia", rating: 8.4, duration: "1h 35m", description: "Una diminuta exploradora viaja por una casa gigantesca para devolver una estrella a la ventana.", section: "Familia", background: "linear-gradient(135deg, #f8e16c, #3a8178 50%, #070d0d)" },
  { id: 40, title: "Club Lunar", type: "Serie", year: 2024, genre: "Comedia", rating: 8.0, duration: "9 episodios", description: "Un club escolar transmite radio a la luna y recibe respuestas muy poco convenientes.", section: "Familia", background: "linear-gradient(135deg, #b5a7ff, #3c5d7c 52%, #080a12)" }
];

const featuredContent = catalog[0];
const favoritesKey = "pelisdark-favorites";

const rows = document.querySelectorAll("[data-section]");
const myListRow = document.querySelector("#myListRow");
const emptyList = document.querySelector("#emptyList");
const resultsArea = document.querySelector("#resultsArea");
const searchInput = document.querySelector("#searchInput");
const searchToggle = document.querySelector("#searchToggle");
const filterButtons = document.querySelectorAll(".filter-button");
const detailsModal = document.querySelector("#detailsModal");
const playerModal = document.querySelector("#playerModal");
const modalArt = document.querySelector("#modalArt");
const modalType = document.querySelector("#modalType");
const modalTitle = document.querySelector("#modalTitle");
const modalDescription = document.querySelector("#modalDescription");
const modalMeta = document.querySelector("#modalMeta");
const playerTitle = document.querySelector("#playerTitle");
const playerToggle = document.querySelector("#playerToggle");
const progressFill = document.querySelector("#progressFill");
const timeLabel = document.querySelector("#timeLabel");
const playSymbol = document.querySelector("#playSymbol");

let activeGenre = "Todos";
let selectedItem = featuredContent;
let favorites = loadFavorites();
let playerTimer = null;
let playerProgress = 0;
let isPlaying = false;

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(favoritesKey)) || [];
  } catch {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem(favoritesKey, JSON.stringify(favorites));
}

function isFavorite(id) {
  return favorites.includes(id);
}

function createCard(item, options = {}) {
  const card = document.createElement("article");
  card.className = "movie-card";
  card.innerHTML = `
    <div class="card-art" style="--card-bg: ${item.background}">
      <span class="type-pill">${item.type}</span>
      <span class="rating-pill">${item.rating}</span>
    </div>
    <div class="card-copy">
      <h3>${item.title}</h3>
      <p>${item.year} · ${item.genre}</p>
      <p>${item.duration}</p>
      <div class="card-actions">
        <button class="card-button" data-details="${item.id}">Ver detalles</button>
        ${
          options.removable
            ? `<button class="remove-button" data-remove="${item.id}">Eliminar</button>`
            : `<button class="card-button favorite-button ${isFavorite(item.id) ? "active" : ""}" data-favorite="${item.id}" aria-label="Agregar ${item.title} a favoritos">+</button>`
        }
      </div>
    </div>
  `;
  return card;
}

function renderRows() {
  rows.forEach((row) => {
    const section = row.dataset.section;
    const items = catalog.filter((item) => item.section === section);
    row.innerHTML = "";
    items.forEach((item) => row.appendChild(createCard(item)));
  });
}

function renderMyList() {
  const favoriteItems = catalog.filter((item) => favorites.includes(item.id));
  myListRow.innerHTML = "";
  favoriteItems.forEach((item) => myListRow.appendChild(createCard(item, { removable: true })));
  emptyList.style.display = favoriteItems.length ? "none" : "block";
}

function renderSearchResults(items) {
  resultsArea.innerHTML = "";

  if (!searchInput.value.trim() && activeGenre === "Todos") {
    return;
  }

  const title = document.createElement("div");
  title.className = "section-heading";
  title.innerHTML = `<h2>Resultados</h2><span>${items.length} encontrados</span>`;
  resultsArea.appendChild(title);

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "no-results";
    empty.textContent = "No se encontraron resultados";
    resultsArea.appendChild(empty);
    return;
  }

  const grid = document.createElement("div");
  grid.className = "results-grid";
  items.forEach((item) => grid.appendChild(createCard(item)));
  resultsArea.appendChild(grid);
}

function applySearchAndFilters() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = catalog.filter((item) => {
    const matchesTerm = item.title.toLowerCase().includes(term);
    const matchesGenre = activeGenre === "Todos" || item.genre === activeGenre;
    return matchesTerm && matchesGenre;
  });

  renderSearchResults(filtered);
}

function openDetails(item) {
  selectedItem = item;
  modalArt.style.setProperty("--modal-bg", item.background);
  modalType.textContent = item.type;
  modalTitle.textContent = item.title;
  modalDescription.textContent = item.description;
  modalMeta.innerHTML = `
    <span>${item.year}</span>
    <span>${item.genre}</span>
    <span>${item.duration}</span>
    <span>Calificacion ${item.rating}</span>
  `;
  detailsModal.classList.add("open");
  detailsModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeDetails() {
  detailsModal.classList.remove("open");
  detailsModal.setAttribute("aria-hidden", "true");
  if (!playerModal.classList.contains("open")) {
    document.body.classList.remove("modal-open");
  }
}

function openPlayer(item) {
  selectedItem = item;
  playerTitle.textContent = item.title;
  playerProgress = 0;
  isPlaying = false;
  updatePlayer();
  playerModal.classList.add("open");
  playerModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closePlayer() {
  stopPlayerTimer();
  playerModal.classList.remove("open");
  playerModal.setAttribute("aria-hidden", "true");
  if (!detailsModal.classList.contains("open")) {
    document.body.classList.remove("modal-open");
  }
}

function updatePlayer() {
  const totalSeconds = 120;
  const currentSeconds = Math.round((playerProgress / 100) * totalSeconds);
  const minutes = String(Math.floor(currentSeconds / 60)).padStart(2, "0");
  const seconds = String(currentSeconds % 60).padStart(2, "0");

  progressFill.style.width = `${playerProgress}%`;
  timeLabel.textContent = `${minutes}:${seconds} / 02:00`;
  playerToggle.textContent = isPlaying ? "Pause" : "Play";
  playSymbol.textContent = isPlaying ? "❚❚" : "▶";
}

function startPlayerTimer() {
  stopPlayerTimer();
  playerTimer = setInterval(() => {
    playerProgress = Math.min(playerProgress + 1.5, 100);
    if (playerProgress >= 100) {
      isPlaying = false;
      stopPlayerTimer();
    }
    updatePlayer();
  }, 350);
}

function stopPlayerTimer() {
  if (playerTimer) {
    clearInterval(playerTimer);
    playerTimer = null;
  }
}

function togglePlayer() {
  isPlaying = !isPlaying;
  if (isPlaying) {
    if (playerProgress >= 100) {
      playerProgress = 0;
    }
    startPlayerTimer();
  } else {
    stopPlayerTimer();
  }
  updatePlayer();
}

function toggleFavorite(id) {
  if (isFavorite(id)) {
    favorites = favorites.filter((favoriteId) => favoriteId !== id);
  } else {
    favorites.push(id);
  }
  saveFavorites();
  renderRows();
  renderMyList();
  applySearchAndFilters();
}

function removeFavorite(id) {
  favorites = favorites.filter((favoriteId) => favoriteId !== id);
  saveFavorites();
  renderRows();
  renderMyList();
  applySearchAndFilters();
}

function findItem(id) {
  return catalog.find((item) => item.id === Number(id));
}

document.addEventListener("click", (event) => {
  const detailsButton = event.target.closest("[data-details]");
  const favoriteButton = event.target.closest("[data-favorite]");
  const removeButton = event.target.closest("[data-remove]");

  if (detailsButton) {
    openDetails(findItem(detailsButton.dataset.details));
  }

  if (favoriteButton) {
    toggleFavorite(Number(favoriteButton.dataset.favorite));
  }

  if (removeButton) {
    removeFavorite(Number(removeButton.dataset.remove));
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((filterButton) => filterButton.classList.remove("active"));
    button.classList.add("active");
    activeGenre = button.dataset.genre;
    applySearchAndFilters();
  });
});

searchInput.addEventListener("input", applySearchAndFilters);

searchToggle.addEventListener("click", () => {
  document.querySelector("#searchBox").scrollIntoView({ behavior: "smooth", block: "center" });
  searchInput.focus();
});

document.querySelector("[data-close-details]").addEventListener("click", closeDetails);
document.querySelector("[data-close-player]").addEventListener("click", closePlayer);
document.querySelector("[data-play-modal]").addEventListener("click", () => openPlayer(selectedItem));
document.querySelector("[data-add-modal]").addEventListener("click", () => toggleFavorite(selectedItem.id));
document.querySelector("[data-play-hero]").addEventListener("click", () => openPlayer(featuredContent));
document.querySelector("[data-add-hero]").addEventListener("click", () => toggleFavorite(featuredContent.id));
playerToggle.addEventListener("click", togglePlayer);

[detailsModal, playerModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal === detailsModal ? closeDetails() : closePlayer();
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDetails();
    closePlayer();
  }
});

renderRows();
renderMyList();
