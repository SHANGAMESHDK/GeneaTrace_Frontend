import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldX, ShieldAlert, Factory, Calendar, Boxes, MapPin, Flag, ScanLine, AlertTriangle } from 'lucide-react';
import { publicApi } from '../lib/api';
import { categoryMeta, fmtDate, ROLE_LABEL, VERDICT_META, humanize, STATUS_META, INTERNAL_ATTRS } from '../lib/format';
import { Logo, TrustRing } from '../components/domain';
import { Badge, Button, cx, ErrorBox, Field, Loading, Modal, StatusBadge } from '../components/ui';
import PassportTabs from '../components/PassportTabs';

const getPosition = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    const t = setTimeout(() => resolve(null), 4000);
    navigator.geolocation.getCurrentPosition(
      (p) => { clearTimeout(t); resolve({ lat: p.coords.latitude, lng: p.coords.longitude }); },
      () => { clearTimeout(t); resolve(null); },
      { timeout: 3500, maximumAge: 600000 },
    );
  });

// One scan per page view (React StrictMode mounts effects twice in development).
const inflight = new Map();
function scanOnce(body) {
  const key = `${body.id}|${body.s || ''}`;
  const hit = inflight.get(key);
  if (hit && Date.now() - hit.at < 5000) return hit.promise;
  const promise = publicApi('/scan', { method: 'POST', body });
  inflight.set(key, { at: Date.now(), promise });
  return promise;
}

const HIDE = INTERNAL_ATTRS;

export default function Verify() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const sig = sp.get('s') || undefined;
  const [res, setRes] = useState(null);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      setRes(null);
      setError(null);
      try {
        const pos = await getPosition();
        const r = await scanOnce({ id, s: sig, ...(pos || {}) });
        if (live) setRes(r);
      } catch (e) {
        if (live) setError(e);
      }
    })();
    return () => { live = false; };
  }, [id, sig]);

  const p = res?.passport;
  const vm = res ? VERDICT_META[res.verdict] : null;
  const Icon = res?.verdict === 'GENUINE' ? ShieldCheck : ['EXPIRED', 'SUSPICIOUS'].includes(res?.verdict) ? ShieldAlert : ShieldX;
  const Cat = p ? categoryMeta(p.product.category).icon : null;
  const attrs = p ? Object.entries({ ...(p.batch?.attributes || {}), ...p.product.attributes }).filter(([k, v]) => !HIDE.has(k) && v != null && typeof v !== 'object') : [];

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/"><Logo /></Link>
          <Link to="/scan"><Button variant="secondary" size="sm" icon={ScanLine}>Scan another</Button></Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        {!res && !error && <Loading text="Verifying against the ledger…" />}
        <ErrorBox error={error} />
        {res && (
          <div className={cx('overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-lg', vm.bg)}>
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15"><Icon className="h-8 w-8" /></span>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Verification result</p>
                <h1 className="text-2xl font-bold sm:text-3xl">{res.headline}</h1>
                <ul className="mt-1 space-y-0.5 text-sm text-white/90">{res.reasons.slice(0, 4).map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
              {p && <div className="rounded-2xl bg-white p-2"><TrustRing score={p.trust.score} size={84} /></div>}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 bg-black/10 px-6 py-2.5 text-xs text-white/80">
              <span className="font-mono">{id}</span>
              <button onClick={() => setReport(true)} className="inline-flex items-center gap-1 font-semibold text-white hover:underline"><Flag className="h-3.5 w-3.5" /> Report a problem</button>
            </div>
          </div>
        )}

        {res && !p && (
          <div className="card p-6 text-sm text-ink-700">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold">What to do</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>Do not consume, use or resell this item.</li>
                  <li>Keep the packaging and the receipt; report it below so regulators can trace the source.</li>
                  <li>Buy only from sellers whose products verify on GeneaTrace.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {p && (
          <>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="card p-5 md:col-span-2">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50"><Cat className="h-6 w-6 text-brand-700" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="gray">{categoryMeta(p.product.category).label}</Badge>
                      <StatusBadge status={p.product.status} />
                      {p.integrity.signature_valid && <Badge tone="brand"><ShieldCheck className="h-3 w-3" />Signed label</Badge>}
                    </div>
                    <h2 className="mt-1.5 text-xl font-bold">{p.product.name}</h2>
                    <p className="text-sm text-ink-500">SKU {p.product.sku} · Unit #{p.product.attributes?.serial_no}</p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Info icon={Factory} label="Manufacturer" value={p.manufacturer?.name} />
                  <Info icon={Boxes} label="Batch" value={p.batch?.id} mono />
                  <Info icon={Calendar} label="Manufactured" value={fmtDate(p.batch?.mfg_date)} />
                  <Info icon={Calendar} label="Expiry" value={p.batch?.expiry_date ? fmtDate(p.batch.expiry_date) : 'n/a'} danger={p.batch?.expiry_date && p.batch.expiry_date < new Date().toISOString().slice(0, 10)} />
                </dl>
                {attrs.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-ink-100 pt-4 text-sm sm:grid-cols-3">
                    {attrs.map(([k, v]) => (
                      <div key={k}><span className="text-ink-500">{humanize(k)}: </span><span className="font-medium text-ink-800">{String(v)}</span></div>
                    ))}
                  </div>
                )}
              </div>
              <div className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Where it is now</p>
                <p className="mt-2 text-base font-semibold">{p.custodian?.name || '—'}</p>
                {p.custodian?.role && <p className="text-sm text-ink-500">{ROLE_LABEL[p.custodian.role]}</p>}
                {p.facility && <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-600"><MapPin className="h-4 w-4 text-ink-400" />{p.facility.name}{p.facility.city ? `, ${p.facility.city}` : ''}</p>}
                {p.pending_to && <p className="mt-2 text-sm text-sky-700">In transit to {p.pending_to.name}</p>}
                <div className="mt-4 border-t border-ink-100 pt-3 text-sm text-ink-600">
                  <p>{STATUS_META[p.product.status]?.label} · {p.journey.length} verified events</p>
                  <p>Scanned {p.product.scan_count + 1} time(s)</p>
                </div>
              </div>
            </div>
            <PassportTabs passport={p} />
          </>
        )}
      </main>
      <ReportModal open={report} onClose={() => setReport(false)} id={id} />
    </div>
  );
}

function Info({ icon: Icon, label, value, mono, danger }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-ink-500"><Icon className="h-3.5 w-3.5" />{label}</dt>
      <dd className={cx('mt-0.5 truncate text-sm font-semibold', mono && 'font-mono text-[13px]', danger ? 'text-red-600' : 'text-ink-900')}>{value || '—'}</dd>
    </div>
  );
}

function ReportModal({ open, onClose, id }) {
  const [f, setF] = useState({ issue: 'suspected_fake', description: '' });
  const [done, setDone] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      setDone(await publicApi('/report', { method: 'POST', body: { id, ...f } }));
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Report a problem" subtitle="Your report goes to the manufacturer and regulators."
      footer={done ? <Button onClick={onClose}>Close</Button> : <><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={submit}>Submit report</Button></>}>
      {done ? (
        <p className="text-sm">Thank you. Reference <span className="font-mono font-semibold">{done.reference}</span>.</p>
      ) : (
        <div className="space-y-3">
          <Field label="Issue">
            <select className="input" value={f.issue} onChange={(e) => setF({ ...f, issue: e.target.value })}>
              <option value="suspected_fake">Suspected fake</option>
              <option value="defect">Product defect</option>
              <option value="damaged_packaging">Damaged / tampered packaging</option>
              <option value="adverse_reaction">Adverse reaction (medicine)</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="What happened?"><textarea className="input min-h-[90px]" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={1000} /></Field>
          <ErrorBox error={error} />
        </div>
      )}
    </Modal>
  );
}
