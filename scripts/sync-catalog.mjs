import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';

try { process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))); } catch (err) { if (err.code !== 'ENOENT') throw err; }
const token = process.env.TMDB_TOKEN;
if (!token) throw new Error('Configura TMDB_TOKEN en .env. Usa el token de lectura de la API, no la clave de OpenAI.');
const path = new URL('../backend/src/main/resources/catalog.json', import.meta.url);
const catalog = JSON.parse(await readFile(path, 'utf8'));
async function get(path, params = {}) {
  await setTimeout(180);
  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  for (const [key,value] of Object.entries({ language: 'es-ES', ...params })) url.searchParams.set(key,value);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`TMDB respondio ${response.status}; no se modifico el catalogo.`);
  return response.json();
}
for (const kind of ['movie','tv']) {
  const genres = Object.fromEntries((await get(`genre/${kind}/list`)).genres.map(g => [g.id,g.name]));
  for (let year=2020; year<=2026; year++) {
    const params = kind === 'movie' ? { primary_release_year: year } : { first_air_date_year: year };
    const page = await get(`discover/${kind}`, { ...params, include_adult: false, sort_by: 'popularity.desc' });
    for (const item of page.results.slice(0,8)) {
      const date = item.release_date || item.first_air_date;
      if (!item.poster_path || !date || Number(date.slice(0,4)) !== year || !item.overview) continue;
      const videos = await get(`${kind}/${item.id}/videos`);
      const trailer = videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official && /^[\w-]{11}$/.test(v.key));
      const media = { id: `tmdb-${kind}-${item.id}`, title: item.title || item.name, kind, year,
        genre: genres[item.genre_ids[0]] || 'Otros', description: item.overview.slice(0,2000),
        poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : '', trailer: trailer?.key || '' };
      const existing = catalog.findIndex(m => m.id === media.id || (m.kind === kind && m.year === year && m.title.toLowerCase() === media.title.toLowerCase()));
      if (existing >= 0) catalog[existing] = { ...media, id: catalog[existing].id }; else catalog.push(media);
    }
  }
}
await writeFile(path, JSON.stringify(catalog, null, 2) + '\n');
console.log(`Catalogo actualizado: ${catalog.length} titulos. Reinicia el backend y Streamlit. Revisa los cambios antes de hacer commit.`);
