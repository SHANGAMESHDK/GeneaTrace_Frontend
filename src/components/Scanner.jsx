import { useEffect, useRef, useState } from 'react';
import { CameraOff, ImageUp, Loader2, SwitchCamera } from 'lucide-react';

/** Extract { id, s } from a scanned GeneaTrace QR (URL) or a bare ID. */
export function parseScan(text) {
  const t = String(text || '').trim();
  try {
    const u = new URL(t);
    const m = u.pathname.match(/\/v\/([^/?#]+)/);
    if (m) return { id: decodeURIComponent(m[1]).toUpperCase(), s: u.searchParams.get('s') || undefined };
  } catch {
    /* not a URL */
  }
  return { id: t.toUpperCase() };
}

// Browser camera errors → what the person can actually do about them.
function describe(e) {
  const name = e?.name || '';
  const msg = String(e?.message || e || '');
  if (!window.isSecureContext) return 'The camera needs a secure (https) page.';
  if (name === 'NotAllowedError' || /permission|denied|NotAllowed/i.test(msg)) return 'Camera permission is blocked. Allow the camera from the icon in the address bar, then reload.';
  if (name === 'NotFoundError' || /NotFound|Requested device not found|no camera/i.test(msg)) return 'No camera was found on this device.';
  if (name === 'NotReadableError' || /NotReadable|in use|Could not start video source/i.test(msg)) return 'The camera is being used by another app. Close it and try again.';
  return `The camera could not start (${msg.slice(0, 80)}).`;
}

const scanConfig = { fps: 10, qrbox: (w, h) => ({ width: Math.min(w, h) * 0.7, height: Math.min(w, h) * 0.7 }) };

/**
 * Camera QR/barcode scanner with a photo fallback. Calls onScan(text) for each distinct code.
 * Order: rear camera → any available camera (picker when several) → "Scan from a photo".
 */
export default function Scanner({ onScan, continuous = false, height = 280 }) {
  const last = useRef({ text: '', at: 0 });
  const scannerRef = useRef(null);
  const fileRef = useRef(null);
  const [state, setState] = useState('starting'); // starting | live | error
  const [error, setError] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [cameraId, setCameraId] = useState(null);
  const [photoMsg, setPhotoMsg] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const id = useRef(`qr-${Math.random().toString(36).slice(2)}`).current;
  const fileId = `${id}-file`;

  const emit = (text) => {
    const now = Date.now();
    if (text === last.current.text && now - last.current.at < 2500) return;
    last.current = { text, at: now };
    onScan(text);
  };

  const start = async (source) => {
    const scanner = scannerRef.current;
    if (scanner.isScanning) await scanner.stop().catch(() => {});
    await scanner.start(source, scanConfig, (text) => {
      emit(text);
      if (!continuous) scanner.stop().catch(() => {});
    }, () => {});
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (cancelled) return;
      scannerRef.current = new Html5Qrcode(id, { verbose: false });
      try {
        await start({ facingMode: 'environment' });
        if (!cancelled) setState('live');
      } catch (first) {
        // No rear camera (e.g. a laptop): fall back to whatever camera exists.
        try {
          const list = await Html5Qrcode.getCameras();
          if (cancelled) return;
          setCameras(list);
          if (!list.length) throw first;
          const pick = list.find((c) => /back|rear|environment/i.test(c.label)) || list[0];
          setCameraId(pick.id);
          await start(pick.id);
          if (!cancelled) setState('live');
        } catch (e) {
          if (!cancelled) {
            setError(describe(e?.name ? e : first));
            setState('error');
          }
        }
      }
      if (!cancelled && !cameras.length) Html5Qrcode.getCameras().then((l) => !cancelled && setCameras(l)).catch(() => {});
    })();
    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s?.isScanning) s.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchCamera = async (next) => {
    setCameraId(next);
    try {
      await start(next);
      setState('live');
    } catch (e) {
      setError(describe(e));
      setState('error');
    }
  };

  const scanPhoto = async (file) => {
    if (!file) return;
    setPhotoBusy(true);
    setPhotoMsg(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const reader = new Html5Qrcode(fileId, { verbose: false });
      const text = await reader.scanFile(file, false);
      reader.clear();
      emit(text);
      setPhotoMsg('QR code read from the photo.');
    } catch {
      setPhotoMsg('No QR code found in that photo. Try a sharper, closer picture.');
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="overflow-hidden rounded-xl bg-ink-950 text-ink-300">
      <div style={{ minHeight: state === 'error' ? undefined : height }} className="relative">
        {state === 'error' ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 pb-2 pt-6 text-center text-sm" style={{ minHeight: height * 0.6 }}>
            <CameraOff className="h-6 w-6" />
            <p>{error}</p>
            <p className="text-xs text-ink-400">Scan a photo of the QR label below, or type the serial instead.</p>
          </div>
        ) : (
          <>
            {state === 'starting' && <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Starting camera…</div>}
            <div id={id} className="w-full" />
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-3 py-2 text-xs">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={photoBusy} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 font-medium text-white hover:bg-white/15 disabled:opacity-60">
          {photoBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageUp className="h-3.5 w-3.5" />}Scan from a photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => scanPhoto(e.target.files?.[0])} />
        {cameras.length > 1 && (
          <label className="ml-auto inline-flex items-center gap-1.5">
            <SwitchCamera className="h-3.5 w-3.5" />
            <select value={cameraId || ''} onChange={(e) => switchCamera(e.target.value)} className="rounded-md border border-white/15 bg-ink-900 px-2 py-1 text-xs text-white">
              {!cameraId && <option value="">Choose camera</option>}
              {cameras.map((c, i) => <option key={c.id} value={c.id}>{c.label || `Camera ${i + 1}`}</option>)}
            </select>
          </label>
        )}
        {photoMsg && <span className="w-full text-ink-400">{photoMsg}</span>}
      </div>
      <div id={fileId} className="hidden" />
    </div>
  );
}
