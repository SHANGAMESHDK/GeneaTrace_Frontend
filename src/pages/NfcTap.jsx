import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { publicApi } from '../lib/api';
import { Logo } from '../components/domain';
import { ErrorBox, Loading } from '../components/ui';
import { useLang } from '../lib/i18n';

// One check per tap (React StrictMode mounts effects twice in development).
const inflight = new Map();
function verifyOnce(e, c) {
  if (!inflight.has(e)) inflight.set(e, publicApi('/nfc/verify', { method: 'POST', body: { e, c } }));
  return inflight.get(e);
}

/** Landing page of an NFC tap. A genuine tap continues to the passport. */
export default function NfcTap() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const { t } = useLang();
  const [fail, setFail] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyOnce(sp.get('e') || '', sp.get('c') || '')
      .then((r) => {
        if (r.verdict === 'GENUINE') nav(`/v/${r.product_id}?s=${encodeURIComponent(r.signature)}`, { replace: true, state: { nfc: { taps: r.taps } } });
        else setFail(r);
      })
      .catch(setError);
  }, [sp, nav]);

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-3"><Link to="/"><Logo /></Link></div>
      </header>
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <ErrorBox error={error} />
        {!fail && !error && <Loading text={t.checking} />}
        {fail && (
          <div className="rounded-2xl bg-red-700 p-6 text-white shadow-lg">
            <ShieldX className="h-8 w-8" />
            <h1 className="mt-2 text-2xl font-bold">{t.verdict[fail.verdict] || 'Not verified'}</h1>
            <p className="mt-1 text-sm">{fail.reason}</p>
            <p className="mt-3 text-sm font-medium">{t.todo1}</p>
          </div>
        )}
      </main>
    </div>
  );
}
