import { useEffect, useRef, useState } from 'react';
import { MessageCircle, RotateCw, X } from 'lucide-react';
import './chatbot.css';

function chatbotUrl() {
  try {
    const url = new URL(import.meta.env.VITE_CHATBOT_URL || 'http://localhost:8501', window.location.origin);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    url.searchParams.set('embed', 'true');
    url.searchParams.set('embed_options', 'dark_theme');
    url.searchParams.set('compact', 'true');
    return url.href;
  } catch { return null; }
}

export default function Chatbot({ open, onOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [revision, setRevision] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const closeButton = useRef(null);
  const launcher = useRef(null);
  const returnFocus = useRef(null);
  const src = chatbotUrl();

  useEffect(() => {
    if (!open) return;
    setMounted(true);
    returnFocus.current = document.activeElement;
    closeButton.current?.focus();
    const escape = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('keydown', escape);
      const target = returnFocus.current;
      if (target && target !== document.body && target.isConnected) target.focus();
      else launcher.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!mounted || loaded) return;
    const timer = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timer);
  }, [mounted, loaded, revision]);

  function reload() { setLoaded(false); setSlow(false); setRevision(value => value + 1); }

  return <>
    <button ref={launcher} className="chat-launcher" hidden={open} onClick={onOpen} aria-label="Conversar con PelisDark" aria-expanded={open} aria-controls="chatbot-panel" title="Conversar con PelisDark"><MessageCircle size={26}/></button>
    <section id="chatbot-panel" className="chat-panel" hidden={!open} role="dialog" aria-modal="false" aria-labelledby="chatbot-heading">
      <div className="chat-heading"><MessageCircle size={23}/><div><h2 id="chatbot-heading">Asistente PelisDark</h2><span>Peliculas y series</span></div><button className="icon" onClick={reload} title="Recargar conversacion" aria-label="Recargar chatbot"><RotateCw size={18}/></button><button ref={closeButton} className="icon" onClick={onClose} title="Minimizar" aria-label="Minimizar chatbot"><X size={21}/></button></div>
      {!src ? <p className="chat-notice" role="alert">La direccion del asistente no es valida.</p> : <>
        {!loaded && <p className="chat-notice" role="status">{slow ? 'El asistente esta tardando. Comprueba que Streamlit este iniciado y pulsa recargar.' : 'Conectando con tu asistente...'}</p>}
        {mounted && <iframe key={revision} src={src} title="Conversacion con el asistente PelisDark" onLoad={() => setLoaded(true)} allow="clipboard-write" referrerPolicy="no-referrer"/>}
      </>}
    </section>
  </>;
}
