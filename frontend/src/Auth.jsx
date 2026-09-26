import { useState } from 'react';
import { Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import Modal from './Modal';
import { api, resetCsrf } from './api';

export default function Auth({ onClose, onSuccess }) {
  const [register, setRegister] = useState(false);
  const [challenge, setChallenge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (challenge) {
        const user = await api('/auth/verify', { method: 'POST', body: { challengeId: challenge, code } });
        resetCsrf(); await onSuccess(user); onClose();
      } else {
        const data = await api(`/auth/${register ? 'register' : 'login'}`, { method: 'POST', body: { email, password } });
        setChallenge(data.challengeId); setPassword('');
      }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <Modal title={challenge ? 'Confirma que eres tu' : register ? 'Crea tu cuenta' : 'Bienvenido de nuevo'} onClose={onClose}>
    <div className="auth-symbol">{challenge ? <ShieldCheck size={32}/> : <Mail size={32}/>}</div>
    {challenge && <p>Introduce el codigo enviado a <strong>{email}</strong>. Es valido durante 10 minutos.</p>}
    <form onSubmit={submit} className="form">
      {challenge ? <label>Codigo de verificacion<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value)} autoFocus/></label> : <>
        <label>Correo electronico<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus/></label>
        <label>Contrasena<input type="password" required minLength={12} maxLength={64} autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)}/></label>
        <small>De 12 a 64 caracteres. El acceso se confirma por correo.</small>
      </>}
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Procesando...' : challenge ? 'Confirmar acceso' : register ? 'Crear cuenta' : 'Continuar'}<ArrowRight size={18}/></button>
    </form>
    <button className="text-button" disabled={busy} onClick={() => { setChallenge(''); setCode(''); setError(''); if (!challenge) setRegister(!register); }}>
      {challenge ? 'Volver al inicio de sesion' : register ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
    </button>
    {register && !challenge && <small>Si ya tienes una cuenta, inicia sesion. El registro no revela correos existentes.</small>}
  </Modal>;
}
