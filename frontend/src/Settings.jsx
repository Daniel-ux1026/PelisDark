import { useState } from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { api } from './api';

export default function Settings({ user, profile, refresh, logout, notify }) {
  const [spoilers, setSpoilers] = useState(profile?.spoilers || false);
  const [busy, setBusy] = useState(false);
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  async function preferences(e) {
    e.preventDefault(); setBusy(true);
    try { const { id, ...body } = profile; await api(`/profiles/${id}`, { method: 'PUT', body: { ...body, spoilers } }); await refresh(); notify('Preferencias guardadas.'); }
    catch (err) { notify(err.message); } finally { setBusy(false); }
  }
  async function password(e) {
    e.preventDefault(); setBusy(true);
    try { await api('/me/password', { method: 'PUT', body: { currentPassword, newPassword } }); await logout(); notify('Contrasena actualizada. Vuelve a iniciar sesion.'); }
    catch (err) { notify(err.message); } finally { setBusy(false); }
  }
  return <section className="settings"><p className="eyebrow">TU ESPACIO</p><h1>Configuracion</h1>
    <section><h2>Cuenta</h2><p>{user.email}</p><p className="muted"><ShieldCheck size={18}/>Acceso con contrasena y codigo por correo</p><button onClick={logout}><LogOut size={18}/>Cerrar sesion</button></section>
    {profile && <section><h2>Preferencias de {profile.name}</h2><form onSubmit={preferences} className="form"><label className="check"><input type="checkbox" checked={spoilers} onChange={e => setSpoilers(e.target.checked)}/>Mostrar sinopsis al abrir un titulo</label><button className="secondary" disabled={busy}>Guardar preferencias</button></form></section>}
    <section><h2>Cambiar contrasena</h2><form className="form" onSubmit={password}><label>Contrasena actual<input required type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrent(e.target.value)}/></label><label>Nueva contrasena<input required type="password" minLength={12} maxLength={64} autoComplete="new-password" value={newPassword} onChange={e => setNew(e.target.value)}/></label><button className="secondary" disabled={busy}>Actualizar contrasena</button></form></section>
  </section>;
}
