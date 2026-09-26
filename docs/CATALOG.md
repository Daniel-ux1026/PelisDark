# Catalogo y procedencia

Catalogo inicial: 21 titulos reales, 13 peliculas y 8 series, con estrenos entre 2020 y 2026. El ano de una serie corresponde al estreno de la serie, no al ano del poster de su temporada mas reciente. Las sinopsis iniciales son resenas breves redactadas para el proyecto; no se inventan puntuaciones de usuarios.

## Fuentes

- Peliculas y caratulas: [The Movie Database](https://www.themoviedb.org/). Los enlaces de imagen se comprobaron por HTTP el 25 de septiembre de 2026.
- Series y caratulas: [TVmaze API](https://www.tvmaze.com/api). Consultas por titulo a `/singlesearch/shows`; caratulas enlazadas desde static.tvmaze.com. Datos bajo la licencia indicada por TVmaze; las imagenes conservan los derechos de sus titulares.
- Proyecto Fin del Mundo / Project Hail Mary (2026): [Sony Pictures Imageworks](https://www.imageworks.com/movies/project-hail-mary), [trailer de Sony Pictures Malaysia](https://www.youtube.com/watch?v=oA1aBu4ISxQ) y [caratula referenciada](https://filmitena.com/mov/20137/project-hail-mary-proektyt-ave-mariq).
- Fotograma de Dune: Parte dos: [HD Report](https://hd-report.com/2024/05/14/review-dune-part-two-4k-blu-ray-excellent-video-audio/).

Cuando existe un identificador de trailer en el catalogo, el enlace abre YouTube; cuando no existe, se muestra expresamente "Buscar trailer oficial" y se abre una busqueda. No se inventa un video ni se incrusta un reproductor falso. La disponibilidad de videos e imagenes depende del proveedor y puede cambiar por region o con el tiempo.

## Ampliacion con TMDB

1. Crear una cuenta en TMDB y solicitar acceso a su API.
2. Guardar el token de lectura en `TMDB_TOKEN` dentro de `.env`.
3. Ejecutar `npm run catalog:sync` desde la raiz del proyecto.
4. Revisar los cambios de `backend/src/main/resources/catalog.json`.
5. Reiniciar Spring Boot para sincronizar los datos con la base y reiniciar Streamlit para usar el mismo archivo.

El importador consulta hasta ocho resultados populares por formato y ano, filtra el rango 2020-2026 y busca trailers oficiales en espanol. Si una consulta falla, no sobrescribe el archivo. No elimina datos existentes; pueden aparecer titulos equivalentes con nombres regionales distintos, que deben revisarse editorialmente. No se ejecuto el importador sin un token del propietario.

Referencia tecnica: [Discover Movie](https://developer.themoviedb.org/reference/discover-movie).

El proyecto no aloja peliculas completas, no vende acceso ni esta afiliado a Netflix, Disney+, Paramount+, TMDB o TVmaze. Antes de una publicacion comercial deben revisarse permisos, condiciones de uso y atribuciones de los proveedores; disponer de un enlace no concede derechos de distribucion.
