import { useState } from 'react';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import Modal from './Modal';
import { api } from './api';

export default function Profiles({ profiles, active, onSelect, onRefresh, onClose }) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const { id, ...body } = editing;
      await api(`/profiles${id ? '/' + id : ''}`, { method: id ? 'PUT' : 'POST', body });
      await onRefresh(); setEditing(null);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function remove(id) {
    if (!window.confirm('Se eliminaran este perfil, su lista y sus puntuaciones. ¿Continuar?')) return;
    setBusy(true); setError('');
    try { await api(`/profiles/${id}`, { method: 'DELETE' }); await onRefresh(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <Modal title={editing ? 'Editar perfil' : '¿Quien esta viendo?'} onClose={onClose}>
    {editing ? <form onSubmit={save} className="form">
      <label>Nombre<input required maxLength={40} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })}/></label>
      <fieldset><legend>Color del perfil</legend><div className="swatches">{['#e43d52', '#22b8a0', '#ecbb53', '#639cf4'].map((color, i) => <button type="button" className="swatch" key={color} style={{ background: color }} aria-label={['Rojo', 'Verde', 'Amarillo', 'Azul'][i]} aria-pressed={editing.color === color} onClick={() => setEditing({ ...editing, color })}>{editing.color === color && <Check/>}</button>)}</div></fieldset>
      <button className="primary" disabled={busy}>Guardar perfil</button><button type="button" onClick={() => setEditing(null)}>Cancelar</button>
    </form> : <div className="profiles">{profiles.map(p => <div className="profile-row" key={p.id}>
      <button className="profile-select" disabled={busy} onClick={() => { onSelect(p); onClose(); }}><span className="avatar" style={{ background: p.color }}>{p.name.charAt(0).toUpperCase()}</span><span>{p.name}</span>{active?.id === p.id && <Check size={16}/>}</button>
      <button className="icon" aria-label={`Editar ${p.name}`} title="Editar perfil" onClick={() => setEditing(p)}><Pencil size={18}/></button>
      <button className="icon" aria-label={`Eliminar ${p.name}`} title="Eliminar perfil" disabled={busy || profiles.length <= 1} onClick={() => remove(p.id)}><Trash2 size={18}/></button>
    </div>)}{profiles.length < 5 && <button className="secondary" onClick={() => setEditing({ name: '', color: '#22b8a0', language: 'es', spoilers: false })}><Plus size={18}/>Nuevo perfil</button>}</div>}
    {error && <p className="error" role="alert">{error}</p>}
  </Modal>;
}
