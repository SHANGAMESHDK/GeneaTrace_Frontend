const KEY = 'gt_api_key';
// Backend origin. Empty = same origin (the Vite dev server proxies /api to the Next.js backend on :8080).
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Set while someone is signed in, so event requests can be signed on this device.
let signer = null;
export const setSigner = (actorId) => { signer = actorId; };

export const getKey = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
export const setKey = (k) => {
  try {
    if (k) localStorage.setItem(KEY, k);
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable – session-only login */
  }
};

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const key = getKey();
  if (auth && key) headers['x-api-key'] = key;
  if (path === '/events' && method === 'POST' && signer) {
    const { attachAttestation } = await import('./signing');
    body = await attachAttestation(signer, body);
  }
  const res = await fetch(`${API_BASE}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401 && auth && key?.startsWith('gts_') && !path.startsWith('/public')) {
    setKey(null); // expired session → back to sign-in
    if (!location.pathname.startsWith('/login')) location.assign('/login');
  }
  if (!res.ok) {
    const err = new Error(json.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = json.details;
    throw err;
  }
  return json;
}

export const publicApi = (path, opts) => api(`/public${path}`, { ...opts, auth: false });
