let csrf;
export async function api(path, options = {}) {
  const method = options.method || 'GET';
  if (method !== 'GET' && !csrf) csrf = await api('/csrf');
  const response = await fetch(`/api${path}`, {
    ...options, credentials: 'same-origin',
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(method !== 'GET' ? { [csrf.headerName]: csrf.token } : {}), ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data.message || ({ 401: 'Inicia sesion para continuar.', 403: 'Tu sesion ha cambiado. Actualiza la pagina.', 429: 'Demasiados intentos. Espera unos minutos.', 503: 'Servicio no disponible.' }[response.status]) || 'No se pudo completar la solicitud.');
    error.status = response.status;
    if (response.status === 403) csrf = undefined;
    throw error;
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') return null;
  return response.json().catch(() => null);
}
export function resetCsrf() { csrf = undefined; }
