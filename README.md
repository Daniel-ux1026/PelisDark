# PelisDark

[![PelisDark CI](https://github.com/Daniel-ux1026/PelisDark/actions/workflows/pelisdark-ci.yml/badge.svg)](https://github.com/Daniel-ux1026/PelisDark/actions/workflows/pelisdark-ci.yml)

PelisDark es una plataforma ficticia de peliculas y series con una interfaz oscura, moderna, responsiva e interactiva. El proyecto esta creado solo con HTML, CSS y JavaScript puro.

Repositorio: `https://github.com/Daniel-ux1026/PelisDark`

## Tecnologias usadas

- HTML5
- CSS3
- JavaScript puro
- localStorage para guardar favoritos

## Funciones principales

- Header fijo con navegacion principal, busqueda y perfil.
- Hero visual con contenido destacado ficticio.
- Carruseles horizontales por categoria.
- Mas de 40 peliculas y series ficticias cargadas desde JavaScript.
- Tarjetas con detalles, favoritos, animaciones y efectos hover.
- Modal de detalles por contenido.
- Reproductor simulado con Play/Pause, progreso y tiempo.
- Buscador funcional por nombre.
- Filtros por genero.
- Seccion Mi Lista persistente con localStorage.
- Diseno responsivo para laptop, tablet y celular.

## Estructura de carpetas

```text
PelisDark/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── README.md
```

## Como ejecutarlo localmente

Abre el archivo `index.html` con doble clic desde el explorador de archivos, o abre la carpeta del proyecto con:

```powershell
cd "$env:USERPROFILE\Documents\CodexProyects\PelisDark"
```

## Automatizacion con GitHub Actions

El proyecto incluye un flujo en `.github/workflows/pelisdark-ci.yml` con tres pasos principales:

- Compilacion/validacion simple con `npm run build`.
- Pruebas automatizadas con `npm test`.
- Despliegue simulado con `npm run deploy:simulate`, copiando archivos a `staging/`.

Tambien puedes ejecutarlo localmente:

```powershell
npm run build
npm test
npm run deploy:simulate
```

## Scripts disponibles

- `npm run build`: valida el JavaScript y genera una copia lista en `dist/`.
- `npm test`: ejecuta pruebas automatizadas sin dependencias externas.
- `npm run deploy:simulate`: copia `dist/` a `staging/` como despliegue simulado.

## GitHub Actions

El workflow se ejecuta en cada `push`, `pull_request` y manualmente desde `workflow_dispatch`. Al finalizar publica un artefacto llamado `pelisdark-staging` con los archivos del despliegue simulado.

## Aclaracion

PelisDark es una plataforma ficticia. No reproduce contenido real, no usa marcas reales y todos los titulos, datos visuales y descripciones fueron creados desde cero.

## Autor

Daniel Olivos / DARNEXDAN
