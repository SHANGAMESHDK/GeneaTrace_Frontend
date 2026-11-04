// Company device keys. The private key is created in the browser as non-extractable and stored in
// IndexedDB, so neither the server nor page scripts can read it; they can only ask it to sign.
const DB = 'gt_device_keys';
const STORE = 'keys';

function open() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function store(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const b64url = (buf) => b64(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const utf8 = (s) => new TextEncoder().encode(s);

export const deviceKey = (actorId) => store('readonly', (s) => s.get(actorId)).catch(() => undefined);
export const forgetDeviceKey = (actorId) => store('readwrite', (s) => s.delete(actorId));

export async function createDeviceKey(actorId) {
  const pair = await crypto.subtle.generateKey({ name: 'Ed25519' }, false, ['sign', 'verify']);
  const key = { publicKey: b64(await crypto.subtle.exportKey('spki', pair.publicKey)), privateKey: pair.privateKey };
  await store('readwrite', (s) => s.put(key, actorId));
  return key;
}

export const signText = async (key, text) => b64url(await crypto.subtle.sign({ name: 'Ed25519' }, key.privateKey, utf8(text)));

// Must match canonical() in the backend: sorted keys, undefined dropped.
export function canonical(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v ?? null);
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  const keys = Object.keys(v).filter((k) => v[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}`;
}

async function sha256(text) {
  const d = await crypto.subtle.digest('SHA-256', utf8(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Adds this device's signature to an event request, if this device holds a key. */
export async function attachAttestation(actorId, body) {
  const key = await deviceKey(actorId);
  if (!key) return body;
  const sent = JSON.parse(JSON.stringify(body));
  const nonce = crypto.randomUUID();
  const ts = new Date().toISOString();
  const intent = { actor_id: actorId, type: sent.type, payload: await sha256(canonical(sent)), nonce, ts };
  return { ...sent, attestation: { public_key: key.publicKey, nonce, ts, signature: await signText(key, canonical(intent)) } };
}
