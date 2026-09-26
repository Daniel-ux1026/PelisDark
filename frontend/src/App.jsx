import { useEffect, useState } from 'react';
import { Search, Play, Plus, Check, Star, Info, Settings as SettingsIcon, Users, MessageCircle, ChevronRight, Film, LogIn } from 'lucide-react';
import { api, resetCsrf } from './api';
import { filterCatalog, trailerUrl } from './catalog';
import Modal from './Modal';
import Auth from './Auth';
import Profiles from './Profiles';
import Settings from './Settings';
import Chatbot from './Chatbot';

const pages = { home: 'Inicio', movies: 'Peliculas', series: 'Series', trailers: 'Trailers', list: 'Mi lista' };
const readView = () => [...Object.keys(pages), 'settings'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
const emptyLibrary = { watchlist: [], ratings: {} };

function Poster({ media }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="poster-fallback"><Film size={36}/><span>{media.title}</span></div> :
    <img src={media.poster} alt={`Caratula de ${media.title}`} loading="lazy" onError={() => setFailed(true)}/>;
}

export default function App() {
  const [catalog, setCatalog] = useState([]);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [view, setView] = useState(readView);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [profile, setProfile] = useState(null);
  const [library, setLibrary] = useState(emptyLibrary);
  const [auth, setAuth] = useState(false);
  const [chooseProfile, setChooseProfile] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showSynopsis, setShowSynopsis] = useState(false);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  async function load() {
    setLoading(true); setLoadError('');
    try { setCatalog(await api('/catalog')); }
    catch { setLoadError('No podemos conectar con el catalogo. Comprueba que el servidor este en funcionamiento.'); }
    finally { setLoading(false); }
  }
  async function refreshProfiles() {
    const all = await api('/profiles'); setProfiles(all);
    setProfile(old => all.find(p => p.id === old?.id) || all[0] || null);
  }
  async function signedIn(account) { setUser(account); await refreshProfiles(); }
  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); }
    catch (err) { if (err.status !== 401 && err.status !== 403) { setToast(err.message); return; } }
    resetCsrf(); setUser(null); setProfiles([]); setProfile(null); setLibrary(emptyLibrary); location.hash = 'home';
  }
  useEffect(() => { load(); api('/me').then(signedIn).catch(() => {}); api('/health').then(data => setPreview(data.database === 'preview')).catch(() => {}); }, []);
  useEffect(() => { const change = () => { setView(readView()); setQuery(''); setGenre(''); setYear(''); }; window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  useEffect(() => {
    let current = true; setLibrary(emptyLibrary);
    if (profile) {
      setLibraryLoading(true);
      api(`/profiles/${profile.id}/library`).then(data => { if (current) setLibrary(data); }).catch(err => { if (current) setToast(err.message); }).finally(() => { if (current) setLibraryLoading(false); });
    }
    return () => { current = false; };
  }, [profile?.id]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 6000); return () => clearTimeout(timer); }, [toast]);

  async function mutate(media, score) {
    if (!profile) { setSelected(null); setAuth(true); return; }
    if (busy || libraryLoading) return;
    setBusy(true);
    try {
      const rating = score !== undefined;
      const saved = library.watchlist.includes(media.id);
      await api(`/profiles/${profile.id}/${rating ? 'ratings' : 'watchlist'}/${media.id}`, { method: rating || !saved ? 'PUT' : 'DELETE', ...(rating ? { body: { score } } : {}) });
      setLibrary(await api(`/profiles/${profile.id}/library`));
      setToast(rating ? 'Tu puntuacion se ha guardado.' : saved ? 'Titulo eliminado de tu lista.' : 'Titulo anadido a tu lista.');
    } catch (err) { setToast(err.message); } finally { setBusy(false); }
  }
  function details(media) { setShowSynopsis(profile?.spoilers || false); setSelected(media); }
  const filtered = filterCatalog(catalog, { view, query, genre, year, watchlist: library.watchlist });
  const featured = catalog.find(m => m.id === 'dune2');
  const isHome = view === 'home' && !query && !genre && !year;
  function cards(items, row = false) {
    return <div className={row ? 'poster-row' : 'poster-grid'}>{items.map(m => <article className="movie" key={m.id}>
      <button className="poster-button" onClick={() => details(m)} aria-label={`Ver ${m.title}`}><Poster media={m}/><span className="poster-hover"><Info size={24}/></span>{library.watchlist.includes(m.id) && <span className="saved-badge"><Check size={16}/></span>}</button>
      <div className="movie-title"><h3><button onClick={() => details(m)}>{m.title}</button></h3><button className="icon small" disabled={busy || libraryLoading} title={library.watchlist.includes(m.id) ? 'Quitar de mi lista' : 'Anadir a mi lista'} aria-label={`Mi lista: ${m.title}`} onClick={() => mutate(m)}>{library.watchlist.includes(m.id) ? <Check size={17}/> : <Plus size={17}/>}</button></div>
      <p>{m.year}<span>·</span>{m.kind === 'tv' ? 'Serie' : m.genre}</p>
      {view === 'trailers' && <a className="trailer-link" href={trailerUrl(m)} target="_blank" rel="noreferrer"><Play size={14}/>{m.trailer ? 'Ver trailer' : 'Buscar trailer'}</a>}
    </article>)}</div>;
  }
  return <>
    <header className="header"><a className="brand" href="#home"><Film size={25}/><span>PELIS<span>DARK</span></span></a>
      <nav aria-label="Navegacion principal">{Object.entries(pages).map(([id, label]) => <a key={id} href={`#${id}`} className={view === id ? 'active' : ''}>{label}</a>)}</nav>
      <div className="header-actions"><button className="icon" onClick={() => setChatOpen(true)} aria-expanded={chatOpen} aria-controls="chatbot-panel" title="Asistente de cine" aria-label="Abrir chatbot"><MessageCircle size={21}/></button>
        {user ? <><a href="#settings" className="icon" aria-label="Configuracion" title="Configuracion"><SettingsIcon size={20}/></a><button className="avatar small-avatar" style={{ background: profile?.color }} aria-label="Cambiar perfil" title={profile?.name || 'Perfiles'} onClick={() => setChooseProfile(true)}>{profile?.name.charAt(0).toUpperCase() || <Users size={20}/>}</button></> : <button className="login" onClick={() => setAuth(true)}><LogIn size={17}/><span>Entrar</span></button>}
      </div>
    </header>
    <main>
      {loading ? <section className="status" role="status"><Film size={38}/><h1>Cargando catalogo...</h1></section> : loadError ? <section className="status" role="alert"><h1>Un momento...</h1><p>{loadError}</p><button className="primary" onClick={load}>Reintentar</button></section> : view === 'settings' ? user ? <Settings key={profile?.id} user={user} profile={profile} refresh={refreshProfiles} logout={logout} notify={setToast}/> : <section className="status"><h1>Tu cuenta, a tu manera</h1><button className="primary" onClick={() => setAuth(true)}>Iniciar sesion</button></section> : <>
        {isHome && featured && <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(11,12,16,.96) 0%, rgba(11,12,16,.56) 43%, rgba(11,12,16,.04) 80%), linear-gradient(0deg,#0b0c10,transparent 45%),url(${featured.backdrop})` }}>
          <div className="hero-copy"><p className="eyebrow"><span className="red-line"/>LA ELECCION DE HOY</p><h1>DUNE<span>PARTE DOS</span></h1><div className="hero-meta"><span>2024</span><span>Ciencia ficcion</span><span>Denis Villeneuve</span></div><p className="hero-description">El desierto guarda una profecia.<br/>El futuro exige una decision.</p><div className="hero-actions"><a className="primary" href={trailerUrl(featured)} target="_blank" rel="noreferrer"><Play size={19} fill="currentColor"/>Ver trailer</a><button className="secondary" onClick={() => details(featured)}><Info size={19}/>Mas informacion</button></div><p className="hero-note">Una historia de poder, amor y destino.</p></div>
        </section>}
        <section className="catalog-section">
          {!isHome && <div className="page-heading"><p className="eyebrow">EXPLORA PELISDARK</p><h1>{pages[view] || 'Catalogo'}</h1></div>}
          <div className="filters"><label className="search"><Search size={19}/><input aria-label="Buscar peliculas y series" placeholder="Busca tu proxima historia" value={query} onChange={e => setQuery(e.target.value)}/></label><select aria-label="Filtrar por genero" value={genre} onChange={e => setGenre(e.target.value)}><option value="">Todos los generos</option>{[...new Set(catalog.map(m => m.genre))].sort().map(g => <option key={g}>{g}</option>)}</select><select aria-label="Filtrar por ano" value={year} onChange={e => setYear(e.target.value)}><option value="">2020 - 2026</option>{[2026,2025,2024,2023,2022,2021,2020].map(y => <option key={y}>{y}</option>)}</select></div>
          {view === 'list' && !user ? <div className="empty"><h2>Tus favoritas tienen un lugar</h2><p>Inicia sesion para guardar tu lista personal.</p><button className="primary" onClick={() => setAuth(true)}>Entrar a mi cuenta</button></div> : libraryLoading && view === 'list' ? <p role="status">Cargando tu lista...</p> : isHome ? <>
            <div className="section-heading"><div><p className="eyebrow">HISTORIAS QUE SE QUEDAN</p><h2>Esta noche, elige algo extraordinario</h2></div><a href="#movies">Ver peliculas<ChevronRight size={17}/></a></div>{cards(catalog.filter(m => m.kind === 'movie').sort((a,b) => b.year-a.year).slice(0,7),true)}
            <div className="section-heading"><div><p className="eyebrow">UN EPISODIO MAS</p><h2>Series para desconectar</h2></div><a href="#series">Ver series<ChevronRight size={17}/></a></div>{cards(catalog.filter(m => m.kind === 'tv'),true)}
            <div className="section-heading"><div><p className="eyebrow">DEL 2020 AL 2026</p><h2>El catalogo completo</h2></div><span className="muted">{catalog.length} historias</span></div>{cards(catalog)}
          </> : filtered.length ? <><p className="result-count">{filtered.length} {filtered.length === 1 ? 'titulo' : 'titulos'}{view === 'list' && profile ? ` en la lista de ${profile.name}` : ''}</p>{cards(filtered)}</> : <div className="empty"><Film size={32}/><h2>{view === 'list' ? 'Tu proxima favorita esta por llegar' : 'No encontramos ese titulo'}</h2><p>{view === 'list' ? 'Anade peliculas y series desde el catalogo.' : 'Prueba otro nombre, genero o ano.'}</p></div>}
        </section>
      </>}
    </main>
    <footer><a className="brand" href="#home">PELIS<span>DARK</span></a><p>Un buen momento empieza con una buena historia.</p>{preview && <small>Vista previa local · Los datos de cuenta se borran al reiniciar el servidor.</small>}<small>Proyecto educativo. Catalogo y trailers; no aloja peliculas completas.<br/>Imagenes: TMDB, TVmaze y sus titulares. Sin afiliacion con plataformas de streaming.</small></footer>
    {selected && <Modal title={selected.title} onClose={() => setSelected(null)} wide><div className="details"><div className="detail-poster"><Poster media={selected}/></div><div><p className="eyebrow">{selected.kind === 'tv' ? 'SERIE' : 'PELICULA'} · {selected.year}</p><p className="muted">{selected.genre}</p>{showSynopsis ? <p className="synopsis">{selected.description}</p> : <button className="text-button" onClick={() => setShowSynopsis(true)}>Mostrar sinopsis</button>}<div className="detail-actions"><a className="primary" href={trailerUrl(selected)} target="_blank" rel="noreferrer"><Play size={18}/>{selected.trailer ? 'Ver trailer' : 'Buscar trailer oficial'}</a><button className="secondary" disabled={busy || libraryLoading} onClick={() => mutate(selected)}>{library.watchlist.includes(selected.id) ? <Check size={18}/> : <Plus size={18}/>}Mi lista</button></div><div className="rating"><h3>Tu puntuacion</h3><div aria-label="Puntuar de 1 a 5">{[1,2,3,4,5].map(score => <button key={score} className="icon" title={`${score} de 5`} aria-label={`Puntuar ${score} de 5`} aria-pressed={library.ratings[selected.id] === score} disabled={busy || libraryLoading} onClick={() => mutate(selected,score)}><Star size={25} fill={(library.ratings[selected.id] || 0) >= score ? '#ecbb53' : 'none'} color="#ecbb53"/></button>)}</div><small>{library.ratings[selected.id] ? `${library.ratings[selected.id]} / 5 · Guardado en tu perfil` : 'Aun no has puntuado este titulo'}</small></div></div></div></Modal>}
    {auth && <Auth onClose={() => setAuth(false)} onSuccess={signedIn}/>}
    {chooseProfile && <Profiles profiles={profiles} active={profile} onSelect={setProfile} onRefresh={refreshProfiles} onClose={() => setChooseProfile(false)}/>}
    <Chatbot open={chatOpen} onOpen={() => setChatOpen(true)} onClose={() => setChatOpen(false)}/>
    {toast && <div className="toast" role="status">{toast}</div>}
  </>;
}
