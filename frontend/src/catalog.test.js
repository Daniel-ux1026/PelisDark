import { describe, expect, it } from 'vitest';
import { filterCatalog, trailerUrl } from './catalog';
const items = [{ id: '1', title: 'Corazon', kind: 'movie', genre: 'Drama', year: 2024 }, { id: '2', title: 'Otra serie', kind: 'tv', genre: 'Comedia', year: 2021 }];
describe('catalogo', () => {
  it('filtra por formato, genero, ano y nombre', () => expect(filterCatalog(items, { view: 'movies', genre: 'Drama', year: '2024', query: 'corazón' })).toHaveLength(1));
  it('no devuelve peliculas al buscar series', () => expect(filterCatalog(items, { view: 'series' })[0].id).toBe('2'));
  it('la lista solo incluye identificadores guardados', () => expect(filterCatalog(items, { view: 'list', watchlist: ['2'] })).toEqual([items[1]]));
  it('no inventa trailers cuando no hay uno', () => expect(trailerUrl(items[0])).toContain('youtube.com/results?'));
  it('no permite un enlace arbitrario en un trailer', () => expect(trailerUrl({ ...items[0], trailer: 'javascript:alert(1)' })).toContain('youtube.com/results?'));
});
