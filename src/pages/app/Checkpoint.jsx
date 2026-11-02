import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, LogOut, MapPin, Camera, Trash2, Send, X, ScanLine, Package, Warehouse, Truck } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { fmtDateTime, ROLE_LABEL, eventMeta } from '../../lib/format';
import { Button, Card, cx, Empty, ErrorBox, Field, Hash, PageHeader, useAsync, useToast } from '../../components/ui';
import Scanner, { parseScan } from '../../components/Scanner';
import { EventResult } from '../../components/EventComposer';

// Step 7 – packing → warehouse → dispatched → delivered; receivers record Entry.
const MODES = [
  { id: 'PACKED', label: 'Packing', sub: 'Carton / pallet', icon: Package, tone: 'border-violet-500 bg-violet-50 text-violet-800' },
  { id: 'STORED', label: 'Warehouse', sub: 'Put away in storage', icon: Warehouse, tone: 'border-ink-500 bg-ink-100 text-ink-800' },
  { id: 'EXIT', label: 'Dispatch', sub: 'Exit to next party', icon: LogOut, tone: 'border-amber-500 bg-amber-50 text-amber-800' },
  { id: 'DELIVERED', label: 'Delivered', sub: 'Proof of delivery', icon: Truck, tone: 'border-brand-500 bg-brand-50 text-brand-800' },
  { id: 'ENTRY', label: 'Receive', sub: 'Entry into facility', icon: LogIn, tone: 'border-sky-500 bg-sky-50 text-sky-800' },
  { id: 'CHECKPOINT', label: 'Checkpoint', sub: 'Transit scan / temp.', icon: MapPin, tone: 'border-ink-500 bg-ink-100 text-ink-800' },
];

/** Gate station: scan any number of units and seal one entry/exit event per unit. */
export default function Checkpoint() {
  const { actor, facilities, can } = useAuth();
  const toast = useToast();
  const modes = MODES.filter((m) => can(m.id));
  const [mode, setMode] = useState(modes[0]?.id);
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || '');
  const [allFacilities, setAllFacilities] = useState([]);
  const [toActor, setToActor] = useState('');
  const [temp, setTemp] = useState('');
  const [extra, setExtra] = useState('');
  const [ids, setIds] = useState([]);
  const [paste, setPaste] = useState('');
  const [camera, setCamera] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const actors = useAsync(() => api('/actors'), []);
  const log = useAsync(async () => {
    const [entries, exits] = await Promise.all([api(`/events?type=ENTRY&actor_id=${actor.id}&limit=25`), api(`/events?type=EXIT&actor_id=${actor.id}&limit=25`)]);
    return [...entries, ...exits].sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, 30);
  }, [actor.id]);

  useEffect(() => {
    if (['admin', 'regulator', 'logistics'].includes(actor.role)) api('/facilities').then(setAllFacilities).catch(() => {});
  }, [actor.role]);
  const facilityOptions = ['admin', 'regulator', 'logistics'].includes(actor.role) ? allFacilities : facilities;

  const add = (raw) => {
    const found = String(raw).split(/[\s,;]+/).map((x) => parseScan(x).id).filter((x) => x.length > 3);
    if (!found.length) return;
    setIds((cur) => [...new Set([...cur, ...found])]);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const body = { type: mode, product_ids: ids, facility_id: facilityId || undefined, data: {} };
      if (mode === 'EXIT') body.to_actor_id = toActor;
      if (temp !== '' && ['ENTRY', 'CHECKPOINT'].includes(mode)) body.data.temperature_c = Number(temp);
      if (extra) body.data[{ PACKED: 'carton_id', STORED: 'bin', DELIVERED: 'received_by' }[mode] || 'note'] = extra;
      const r = await api('/events', { method: 'POST', body });
      setResult(r);
      if (r.accepted.length) {
        toast(`${r.accepted.length} ${mode.toLowerCase()} record(s) sealed in block #${r.block.height}`);
        setIds((cur) => cur.filter((x) => !r.accepted.some((a) => a.product_id === x)));
      }
      log.reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  if (!modes.length) return <><PageHeader title="Logistics gate" /><Card><Empty icon={ScanLine} title="Not available for your role" text={`${ROLE_LABEL[actor.role]}s do not move goods through gates.`} /></Card></>;
  const recipients = (actors.data || []).filter((a) => a.id !== actor.id && a.role !== 'admin' && a.status === 'active');

  return (
    <>
      <PageHeader title="Logistics gate" subtitle="Packing, warehouse, dispatch, delivery and receiving. Each unit gets its own signed record." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
            {modes.map((m) => (
              <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }} className={cx('rounded-xl border-2 p-3 text-left transition', mode === m.id ? m.tone : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300')}>
                <m.icon className="h-5 w-5" />
                <p className="mt-2 text-sm font-semibold">{m.label}</p>
                <p className="hidden text-xs opacity-80 sm:block">{m.sub}</p>
              </button>
            ))}
          </div>
          <Card>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Facility / gate">
                <select className="input" value={facilityId} onChange={(e) => setFacilityId(e.target.value)}>
                  <option value="">— none —</option>
                  {facilityOptions.map((f) => <option key={f.id} value={f.id}>{f.name}{f.licensed ? '' : ' (unlicensed)'}</option>)}
                </select>
              </Field>
              {mode === 'EXIT' ? (
                <Field label="Dispatch to">
                  <select className="input" value={toActor} onChange={(e) => setToActor(e.target.value)}>
                    <option value="">Select receiving party…</option>
                    {recipients.map((a) => <option key={a.id} value={a.id}>{a.name} · {ROLE_LABEL[a.role]}</option>)}
                  </select>
                </Field>
              ) : ['ENTRY', 'CHECKPOINT'].includes(mode) ? (
                <Field label="Temperature °C (optional)"><input className="input" type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} /></Field>
              ) : (
                <Field label={{ PACKED: 'Carton / pallet ID', STORED: 'Bin / rack location', DELIVERED: 'Received by (name)' }[mode]}><input className="input" value={extra} onChange={(e) => setExtra(e.target.value)} /></Field>
              )}
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="label">Scan or paste passport IDs / QR URLs</span>
                <Button variant="ghost" size="sm" icon={camera ? X : Camera} onClick={() => setCamera((c) => !c)}>{camera ? 'Close camera' : 'Use camera'}</Button>
              </div>
              {camera && <div className="mb-3"><Scanner continuous onScan={add} height={240} /></div>}
              <form onSubmit={(e) => { e.preventDefault(); add(paste); setPaste(''); }} className="flex gap-2">
                <input className="input font-mono" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Scan with a barcode gun or paste many IDs, then Enter" autoFocus />
                <Button type="submit" variant="secondary">Add</Button>
              </form>
            </div>
            <div className="mt-4 min-h-[64px] rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-3">
              {ids.length === 0 ? <p className="py-3 text-center text-sm text-ink-400">No units queued</p> : (
                <div className="flex flex-wrap gap-1.5">
                  {ids.map((x) => (
                    <span key={x} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 font-mono text-xs ring-1 ring-ink-200">
                      {x}<button onClick={() => setIds((c) => c.filter((y) => y !== x))} className="text-ink-400 hover:text-red-600" aria-label="Remove"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" icon={Send} loading={busy} disabled={!ids.length || (mode === 'EXIT' && !toActor)} onClick={submit}>
                Record {eventMeta(mode).label.toLowerCase()} for {ids.length} unit{ids.length === 1 ? '' : 's'}
              </Button>
              {ids.length > 0 && <Button variant="secondary" icon={Trash2} onClick={() => setIds([])}>Clear</Button>}
            </div>
            <div className="mt-3 space-y-2"><ErrorBox error={error} />{result && <EventResult result={result} />}</div>
          </Card>
        </div>
        <Card title="Your gate log" subtitle="Latest entries and exits you signed" className="lg:col-span-2" bodyClass="max-h-[640px] divide-y divide-ink-100 overflow-y-auto">
          {(log.data || []).length === 0 && <Empty icon={ScanLine} title="No gate activity yet" />}
          {(log.data || []).map((e) => {
            const m = eventMeta(e.type);
            return (
              <div key={e.id} className="flex items-start gap-3 px-5 py-3">
                <m.icon className={cx('mt-0.5 h-4 w-4', e.type === 'ENTRY' ? 'text-sky-600' : 'text-amber-600')} />
                <div className="min-w-0 flex-1 text-sm">
                  <Link to={`/app/products/${e.product_id}`} className="font-mono text-xs font-medium text-brand-700 hover:underline">{e.product_id}</Link>
                  <p className="text-ink-600">{m.label}{e.data?.to_actor_name ? ` → ${e.data.to_actor_name}` : ''}{e.data?.unlicensed_facility ? ' · unlicensed site' : ''}</p>
                  <p className="text-xs text-ink-400">{fmtDateTime(e.ts)} · block #{e.block_height} · <Hash value={e.id} len={6} /></p>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </>
  );
}
