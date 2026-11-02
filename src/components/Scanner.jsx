import { useEffect, useRef, useState } from 'react';
import { CameraOff } from 'lucide-react';

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

/** Camera QR/barcode scanner. Calls onScan(text) for each distinct code. */
export default function Scanner({ onScan, continuous = false, height = 280 }) {
  const ref = useRef(null);
  const last = useRef({ text: '', at: 0 });
  const [error, setError] = useState(null);
  const id = useRef(`qr-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    let scanner;
    let stopped = false;
    (async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (stopped) return;
      scanner = new Html5Qrcode(id, { verbose: false });
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: (w, h) => ({ width: Math.min(w, h) * 0.7, height: Math.min(w, h) * 0.7 }) },
          (text) => {
            const now = Date.now();
            if (text === last.current.text && now - last.current.at < 2500) return;
            last.current = { text, at: now };
            onScan(text);
            if (!continuous) scanner.stop().catch(() => {});
          },
          () => {},
        );
      } catch (e) {
        setError(e?.message || String(e));
      }
    })();
    return () => {
      stopped = true;
      if (scanner?.isScanning) scanner.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="overflow-hidden rounded-xl bg-ink-950" style={{ minHeight: height }}>
      {error ? (
        <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-ink-300" style={{ height }}>
          <CameraOff className="h-6 w-6" />
          Camera unavailable ({error.slice(0, 80)}). Type or paste the ID instead.
        </div>
      ) : (
        <div id={id} ref={ref} className="w-full" />
      )}
    </div>
  );
}
