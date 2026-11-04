import { useState } from 'react';
import { CheckCircle2, Circle, XCircle, Cog, Plug, Smartphone, Lock, ShieldCheck, Wifi } from 'lucide-react';
import { api } from '../lib/api';
import { fmtDateTime } from '../lib/format';
import { Badge, Button, Card, cx, ErrorBox, Field } from './ui';

/** Steps 4–6: what has been pushed into this serial during production. */
export function ProductionCard({ production }) {
  if (!production) return null;
  const { route, done, failed, next, steps, complete, completed_at: completedAt } = production;
  return (
    <Card title="Production record" subtitle={complete ? `Route complete${completedAt ? ` · ${fmtDateTime(completedAt)}` : ''}` : next ? `Next step: ${next}` : 'No process route'} icon={Cog}>
      {route.length > 0 && (
        <ol className="mb-4 flex flex-wrap gap-1.5">
          {route.map((r) => (
            <li key={r} className={cx('flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1', done.includes(r) ? 'bg-brand-50 text-brand-800 ring-brand-200' : failed.includes(r) ? 'bg-red-50 text-red-700 ring-red-200' : r === next ? 'bg-sky-50 text-sky-800 ring-sky-300' : 'text-ink-500 ring-ink-200')}>
              {done.includes(r) ? <CheckCircle2 className="h-3 w-3" /> : failed.includes(r) ? <XCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}{r}
            </li>
          ))}
        </ol>
      )}
      {steps.length === 0 ? <p className="text-sm text-ink-500">Empty container. Steps appear here as each process is scanned.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wide text-ink-500"><th className="py-1.5">Process</th><th>Machine ID</th><th>Result</th><th>Timestamp</th></tr></thead>
            <tbody className="divide-y divide-ink-100">
              {steps.map((s, i) => (
                <tr key={i}>
                  <td className="py-1.5 font-medium">{s.process}{s.rework && <Badge tone="amber" className="ml-1">rework</Badge>}</td>
                  <td className="font-mono text-xs">{s.machine_id}</td>
                  <td>{s.result === 'pass' ? <span className="text-brand-700">pass</span> : <span className="text-red-600">fail</span>}</td>
                  <td className="text-xs text-ink-500">{fmtDateTime(s.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export function PartsCard({ parts }) {
  if (!parts?.length) return null;
  return (
    <Card title="Paired genuine parts" subtitle="Cryptographically paired at production or authorised repair" icon={Plug} bodyClass="divide-y divide-ink-100">
      {parts.map((p) => (
        <div key={p.name} className="flex items-center gap-3 px-5 py-2.5 text-sm">
          <span className="flex-1 font-medium">{p.name}</span>
          <span className="font-mono text-xs">{p.serial}</span>
          <span className="text-xs text-ink-500">{p.lot}</span>
        </div>
      ))}
    </Card>
  );
}

/**
 * Simulates the phone phoning home. The device signs a report of its installed parts; if a
 * third-party centre fitted a fake part, the ledger locks the device.
 */
export function DeviceCheckin({ productId, parts, onDone }) {
  const [over, setOver] = useState({});
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const go = async () => {
    setBusy(true);
    setErr(null);
    try {
      const replace = Object.fromEntries(Object.entries(over).filter(([, v]) => v));
      setRes(await api(`/devices/${productId}/checkin`, { method: 'POST', body: { replace_parts: replace } }));
      onDone?.();
    } catch (e) {
      setErr(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card title="Device check-in" subtitle="What the phone sends when it connects to the internet" icon={Smartphone}>
      <div className="space-y-3">
        {parts.map((p) => (
          <Field key={p.name} label={`${p.name} serial reported by device`}>
            <input className="input font-mono" placeholder={p.serial} value={over[p.name] || ''} onChange={(e) => setOver((o) => ({ ...o, [p.name]: e.target.value }))} />
          </Field>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setOver({ [parts[0].name]: `TP-FAKE-${Math.floor(Math.random() * 9000 + 1000)}` })}>Simulate third-party fake {parts[0].name.toLowerCase()}</Button>
          <Button variant="ghost" size="sm" onClick={() => setOver({})}>Genuine parts</Button>
        </div>
        <Button icon={Wifi} loading={busy} onClick={go} className="w-full">Connect device to internet</Button>
        <ErrorBox error={err} />
        {res && (
          <div className={cx('rounded-xl p-4 text-sm', res.locked ? 'bg-ink-950 text-white' : 'border border-brand-200 bg-brand-50')}>
            <p className="flex items-center gap-2 font-semibold">{res.locked ? <Lock className="h-4 w-4 text-red-400" /> : <ShieldCheck className="h-4 w-4 text-brand-600" />}{res.locked ? 'DEVICE LOCKED' : 'Device OK'}</p>
            <p className={res.locked ? 'mt-1 text-ink-300' : 'mt-1 text-ink-700'}>{res.message}</p>
            <ul className="mt-2 space-y-0.5 text-xs">
              {res.checks.map((c) => <li key={c.name}><span className="font-semibold">{c.name}</span> {c.serial} – <span className={c.verdict === 'genuine' ? 'text-brand-500' : 'text-red-400'}>{c.verdict}</span> ({c.detail})</li>)}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

/** Manufacturer: pair an NFC chip with this passport and get what the tag writer needs. */
export function NfcCard({ product, onDone }) {
  const [uid, setUid] = useState('');
  const [keys, setKeys] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  const bind = () => run(async () => {
    setKeys(await api(`/products/${product.id}/nfc`, { method: 'POST', body: { uid } }));
    onDone();
  });
  const tap = () => run(async () => {
    const r = await api(`/products/${product.id}/nfc/simulate`, { method: 'POST' });
    window.open(r.url, '_blank', 'noopener');
  });
  const paired = product.attributes?.nfc_uid;
  return (
    <Card title="NFC tag" subtitle="NTAG 424 DNA: a new signed code on every tap">
      {paired ? <p className="font-mono text-sm text-ink-700">{paired}</p> : (
        <div className="flex gap-2">
          <input className="input font-mono" placeholder="Tag UID, e.g. 04AABBCCDDEE01" value={uid} onChange={(e) => setUid(e.target.value)} maxLength={20} />
          <Button loading={busy} disabled={!uid} onClick={bind}>Pair</Button>
        </div>
      )}
      {keys && (
        <div className="mt-3 space-y-1 break-all rounded-lg bg-ink-50 p-3 font-mono text-xs text-ink-700">
          <p className="font-sans font-semibold text-amber-700">Write these to the tag now and keep them private.</p>
          <p>URL: {keys.url_template}</p>
          <p>Meta read key: {keys.meta_read_key}</p>
          <p>File read key: {keys.file_read_key}</p>
        </div>
      )}
      {paired && <Button className="mt-3" variant="secondary" size="sm" loading={busy} onClick={tap}>Simulate a tap (demo)</Button>}
      <div className="mt-2"><ErrorBox error={error} /></div>
    </Card>
  );
}
