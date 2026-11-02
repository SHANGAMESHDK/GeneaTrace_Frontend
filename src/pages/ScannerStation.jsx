import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, X, Cog, CheckCircle2, XCircle, Plug, ScanLine, Send, Circle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { fmtDateTime, ROLE_LABEL } from '../lib/format';
import { Logo } from '../components/domain';
import { Badge, Button, cx, ErrorBox, Field, StatusBadge } from '../components/ui';
import Scanner, { parseScan } from '../components/Scanner';

const PREF = 'gt_station';
const loadPref = () => {
  try {
    return JSON.parse(localStorage.getItem(PREF) || '{}');
  } catch {
    return {};
  }
};
const savePref = (v) => {
  try {
    localStorage.setItem(PREF, JSON.stringify(v));
  } catch {
    /* ignore */
  }
};

/**
 * Production scanner station (/scanner). Steps 4–5 of the workflow: at every process the
 * operator scans the unit, and the timestamp, machine ID and process are pushed into its
 * cryptographic serial. Steps that fit a component also scan the part's serial.
 */
export default function ScannerStation() {
  const { actor, facilities } = useAuth();
  const [machines, setMachines] = useState([]);
  const [pref, setPref] = useState(() => ({ result: 'pass', auto: false, ...loadPref() }));
  const [camera, setCamera] = useState(false);
  const [serial, setSerial] = useState('');
  const [partInput, setPartInput] = useState('');
  const [unit, setUnit] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const partRef = useRef(null);
  const serialRef = useRef(null);
  const set = (k, v) => setPref((p) => {
    const n = { ...p, [k]: v };
    savePref(n);
    return n;
  });

  useEffect(() => {
    api('/machines?mine=1').then(setMachines).catch(setError);
  }, []);
  const machine = machines.find((m) => m.id === pref.machine_id);
  const stationMachines = machines.filter((m) => !pref.facility_id || m.facility_id === pref.facility_id);
  const process = pref.process || machine?.processes?.[0] || '';
  const needsPart = !!pref.with_part;

  const push = async (u = unit, part = partInput) => {
    if (!u || !machine || !process) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api('/events', {
        method: 'POST',
        body: { type: 'PROCESS_STEP', product_ids: [u.product.id], part_ids: needsPart ? [parseScan(part).id] : undefined, data: { process, machine_id: machine.id, result: pref.result, operator: actor.name } },
      });
      const okItem = r.accepted.length > 0;
      setLog((l) => [{ id: u.product.id, process, machine: machine.id, ok: okItem, reason: r.rejected[0]?.reason, block: r.block?.height, part: needsPart ? parseScan(part).id : null, at: new Date().toISOString() }, ...l].slice(0, 50));
      if (okItem) {
        setUnit(await api(`/scanner/${u.product.id}`));
        setPartInput('');
        setSerial('');
        serialRef.current?.focus();
      } else setError(new Error(r.rejected[0]?.reason));
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  const lookup = async (text) => {
    const { id } = parseScan(text);
    if (!id) return;
    setError(null);
    try {
      const u = await api(`/scanner/${id}`);
      setUnit(u);
      setSerial(id);
      if (needsPart) setTimeout(() => partRef.current?.focus(), 50);
      else if (pref.auto) await push(u);
    } catch (e) {
      setUnit(null);
      setError(e);
    }
  };

  const ready = machine && process;
  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/app" className="rounded-lg p-1.5 text-ink-300 hover:bg-white/10" aria-label="Back to console"><ArrowLeft className="h-5 w-5" /></Link>
          <Logo light />
          <Badge tone="purple" className="hidden sm:inline-flex">Process scanner</Badge>
        </div>
        <div className="text-right text-xs text-ink-300"><div className="font-semibold text-white">{actor.name}</div>{ROLE_LABEL[actor.role]}</div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 p-4 lg:grid-cols-5">
        <section className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-400">Station setup</p>
            <div className="space-y-3 [&_.label]:text-ink-300">
              <Field label="Facility">
                <select className="input" value={pref.facility_id || ''} onChange={(e) => set('facility_id', e.target.value)}>
                  <option value="">All my facilities</option>
                  {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </Field>
              <Field label="Machine ID">
                <select className="input" value={pref.machine_id || ''} onChange={(e) => { set('machine_id', e.target.value); set('process', ''); }}>
                  <option value="">Select machine…</option>
                  {stationMachines.map((m) => <option key={m.id} value={m.id}>{m.id} · {m.name}</option>)}
                </select>
              </Field>
              <Field label="Process">
                {machine?.processes?.length ? (
                  <select className="input" value={process} onChange={(e) => set('process', e.target.value)}>
                    {machine.processes.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                ) : <input className="input" value={pref.process || ''} onChange={(e) => set('process', e.target.value)} placeholder="Process name" />}
              </Field>
              <div className="flex flex-wrap gap-4 text-sm text-ink-200">
                <label className="flex items-center gap-2"><input type="checkbox" checked={needsPart} onChange={(e) => set('with_part', e.target.checked)} /> Step installs a part (scan its serial)</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!pref.auto} onChange={(e) => set('auto', e.target.checked)} disabled={needsPart} /> Auto-push on scan</label>
              </div>
              <div className="flex gap-2">
                {['pass', 'fail'].map((r) => (
                  <button key={r} onClick={() => set('result', r)} className={cx('flex-1 rounded-lg py-2 text-sm font-semibold ring-1', pref.result === r ? (r === 'pass' ? 'bg-brand-600 ring-brand-500' : 'bg-red-600 ring-red-500') : 'ring-white/15 text-ink-300')}>
                    Result: {r}
                  </button>
                ))}
              </div>
            </div>
            {!machines.length && <p className="mt-3 text-xs text-amber-300">No machines registered yet. Add them under Network → Machines.</p>}
          </div>

          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Scan unit</p>
              <button onClick={() => setCamera((c) => !c)} className="flex items-center gap-1 text-xs text-ink-300 hover:text-white">{camera ? <><X className="h-3.5 w-3.5" />Close camera</> : <><Camera className="h-3.5 w-3.5" />Camera</>}</button>
            </div>
            {camera && <div className="mb-3"><Scanner continuous height={220} onScan={(t) => (needsPart && unit && !partInput ? setPartInput(parseScan(t).id) : lookup(t))} /></div>}
            <form onSubmit={(e) => { e.preventDefault(); lookup(serial); }} className="flex gap-2">
              <input ref={serialRef} autoFocus className="input font-mono" placeholder="Scan / type serial e.g. AAA12345678" value={serial} onChange={(e) => setSerial(e.target.value)} disabled={!ready} />
              <Button type="submit" variant="secondary" disabled={!ready}>Load</Button>
            </form>
            {needsPart && unit && (
              <div className="mt-3">
                <label className="label text-ink-300"><Plug className="mb-0.5 mr-1 inline h-3.5 w-3.5" />Part serial for this unit</label>
                <input ref={partRef} className="input font-mono" placeholder="Scan the component's QR / serial" value={partInput} onChange={(e) => setPartInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && push()} />
              </div>
            )}
            {!ready && <p className="mt-2 text-xs text-ink-400">Choose a machine and process first.</p>}
          </div>
        </section>

        <section className="space-y-4 lg:col-span-3">
          <ErrorBox error={error} />
          {unit ? (
            <div className="rounded-2xl bg-white p-5 text-ink-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-lg font-bold">{unit.product.id}</p>
                  <p className="text-sm text-ink-600">{unit.product.name} · batch {unit.product.batch_id} · unit #{unit.product.serial_no}</p>
                </div>
                <StatusBadge status={unit.product.status} />
              </div>
              {unit.progress.route.length > 0 && (
                <ol className="mt-4 flex flex-wrap gap-2">
                  {unit.progress.route.map((r) => {
                    const done = unit.progress.done.includes(r);
                    const next = unit.progress.next === r;
                    return (
                      <li key={r} className={cx('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1', done ? 'bg-brand-50 text-brand-800 ring-brand-200' : next ? 'bg-sky-50 text-sky-800 ring-sky-300' : unit.progress.failed.includes(r) ? 'bg-red-50 text-red-700 ring-red-200' : 'text-ink-500 ring-ink-200')}>
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}{r}{next && ' · next'}
                      </li>
                    );
                  })}
                </ol>
              )}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button icon={Send} loading={busy} onClick={() => push()} disabled={!ready || (needsPart && !partInput)} className="sm:flex-1">
                  Push “{process}” on {machine?.id || '—'} ({pref.result})
                </Button>
                {unit.progress.complete && unit.product.status === 'in_production' && <span className="text-xs text-brand-700">Route complete – mark “Production complete” from the batch page.</span>}
              </div>
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Recorded in this serial ({unit.steps.length})</p>
                {unit.steps.length === 0 ? <p className="text-sm text-ink-500">Empty container – no steps yet.</p> : (
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-[11px] uppercase text-ink-500"><th className="py-1">Process</th><th>Machine</th><th>Result</th><th>Time</th></tr></thead>
                    <tbody className="divide-y divide-ink-100">
                      {unit.steps.map((s, i) => (
                        <tr key={i}><td className="py-1.5 font-medium">{s.process}{s.rework && <Badge tone="amber" className="ml-1">rework</Badge>}</td><td className="font-mono text-xs">{s.machine_id}</td><td>{s.result === 'pass' ? <span className="text-brand-700">pass</span> : <span className="text-red-600">fail</span>}</td><td className="text-xs text-ink-500">{fmtDateTime(s.at)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {Object.keys(unit.product.parts).length > 0 && (
                  <p className="mt-3 text-xs text-ink-600">Paired parts: {Object.entries(unit.product.parts).map(([n, p]) => `${n} ${p.serial}`).join(' · ')}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 p-12 text-center text-ink-400">
              <ScanLine className="h-8 w-8" />
              <p className="mt-2 text-sm">Scan a serial to load its passport.</p>
            </div>
          )}

          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">Station log</p>
            {log.length === 0 ? <p className="text-sm text-ink-500">Nothing pushed this session.</p> : (
              <ul className="space-y-1.5 text-sm">
                {log.map((l, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {l.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
                    <span className="flex-1"><span className="font-mono">{l.id}</span> · {l.process} · <Cog className="mb-0.5 inline h-3 w-3" /> {l.machine}{l.part && <> · part {l.part}</>}{l.ok ? <span className="text-ink-400"> · block #{l.block}</span> : <span className="text-red-300"> · {l.reason}</span>}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
