export function filterCatalog(items, { view = 'home', query = '', genre = '', year = '', watchlist = [] } = {}) {
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return items.filter(m =>
    (view !== 'movies' || m.kind === 'movie') &&
    (view !== 'series' || m.kind === 'tv') &&
    (view !== 'list' || watchlist.includes(m.id)) &&
    (!genre || m.genre === genre) && (!year || m.year === Number(year)) &&
    normalize(m.title).includes(normalize(query.trim())));
}
export function trailerUrl(media) {
  return /^[a-zA-Z0-9_-]{11}$/.test(media.trailer || '') ? `https://www.youtube.com/watch?v=${media.trailer}` :
    `https://www.youtube.com/results?search_query=${encodeURIComponent(media.title + ' ' + media.year + ' trailer oficial')}`;
}
