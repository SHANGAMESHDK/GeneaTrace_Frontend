import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Boxes, Search, Trash2, ArrowUp, ArrowDown, Cog } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { CATEGORY_META, categoryMeta, fmtDate, ROUTE_PRESETS } from '../../lib/format';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal, PageHeader, useAsync, useToast } from '../../components/ui';

export default function Batches() {
  const { actor } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [open, setOpen] = useState(false);
  const { data, loading, error, reload } = useAsync(() => api(`/batches?${new URLSearchParams({ ...(q && { q }), ...(cat && { category: cat }) })}`), [q, cat]);
  const canCreate = ['manufacturer', 'admin'].includes(actor.role);

  return (
    <>
      <PageHeader title="Batches & lots" subtitle="Production runs, component lots and their minted passports" actions={canCreate && <Button icon={Plus} onClick={() => setOpen(true)}>New batch</Button>} />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search batches" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input sm:w-48" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All categories</option>
          {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      {loading && !data ? <Loading /> : error ? <ErrorBox error={error} /> : data.length === 0 ? <Card><Empty icon={Boxes} title="No batches yet" text={canCreate ? 'Create your first batch to mint passports.' : 'Manufacturers create batches.'} /></Card> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((b) => {
            const Icon = categoryMeta(b.category).icon;
            const expired = b.expiry_date && b.expiry_date < new Date().toISOString().slice(0, 10);
            return (
              <button key={b.id} onClick={() => nav(`/app/batches/${b.id}`)} className="card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-lg bg-brand-50 p-2"><Icon className="h-5 w-5 text-brand-700" /></span>
                  <div className="flex gap-1">
                    {b.status === 'recalled' && <Badge tone="red">Recalled</Badge>}
                    {expired && <Badge tone="amber">Expired</Badge>}
                    <Badge tone="gray">{categoryMeta(b.category).label}</Badge>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 font-semibold text-ink-900">{b.name}</p>
                <p className="mt-0.5 font-mono text-xs text-ink-500">{b.id} · {b.sku}</p>
                <div className="mt-4 flex items-end justify-between text-sm">
                  <div className="text-ink-500">{b.manufacturer_name}<br /><span className="text-xs">Mfg {fmtDate(b.mfg_date)}</span></div>
                  <div className="text-right"><span className="text-lg font-bold text-ink-900">{b.minted}</span><span className="text-ink-400"> / {b.quantity.toLocaleString()}</span><br /><span className="text-xs text-ink-500">minted</span></div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, (b.minted / b.quantity) * 100)}%` }} /></div>
              </button>
            );
          })}
        </div>
      )}
      {open && <NewBatch onClose={() => setOpen(false)} onCreated={(r) => { reload(); nav(`/app/batches/${r.batch.id}`); }} />}
    </>
  );
}

function NewBatch({ onClose, onCreated }) {
  const { facilities } = useAuth();
  const toast = useToast();
  const comps = useAsync(() => api('/batches?category=component'), []);
  const [f, setF] = useState({ category: 'medicine', quantity: 100, mint: 20, facility_id: facilities[0]?.id || '', mfg_date: new Date().toISOString().slice(0, 10) });
  const [extra, setExtra] = useState({});
  const [custom, setCustom] = useState([]);
  const [components, setComponents] = useState([]);
  const [route, setRoute] = useState(ROUTE_PRESETS.medicine);
  const [newStep, setNewStep] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => {
    const v = e.target.value;
    setF((x) => ({ ...x, [k]: v }));
    if (k === 'category') setRoute(ROUTE_PRESETS[v] || []);
  };
  const moveStep = (i, d) => setRoute((r) => { const n = [...r]; [n[i], n[i + d]] = [n[i + d], n[i]]; return n; });
  const setX = (k) => (e) => setExtra((x) => ({ ...x, [k]: e.target.value }));

  const presets = useMemo(() => ({
    medicine: [['strength', 'Strength', 'e.g. 500 mg'], ['form', 'Dosage form', 'Tablet / Injection'], ['schedule', 'Schedule', 'H / H1 / X'], ['temp_min_c', 'Min storage °C', '2'], ['temp_max_c', 'Max storage °C', '8'], ['mrp_inr', 'MRP (₹)', '']],
    electronics: [['firmware', 'Factory firmware', 'OS 1.0.0'], ['warranty_months', 'Warranty (months)', '12'], ['color', 'Colour', ''], ['storage', 'Storage', '']],
    food: [['temp_min_c', 'Min storage °C', ''], ['temp_max_c', 'Max storage °C', ''], ['allergens', 'Allergens', '']],
  }[f.category] || []), [f.category]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const attributes = {};
    for (const [k, v] of Object.entries(extra)) if (v !== '' && presets.some((p) => p[0] === k)) attributes[k] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
    for (const c of custom) if (c.k && c.v) attributes[c.k] = c.v;
    try {
      const r = await api('/batches', {
        method: 'POST',
        body: {
          id: (f.code || '').trim().toUpperCase(), process_route: route, sku: f.sku, name: f.name, category: f.category, quantity: Number(f.quantity), mint: Number(f.mint), mfg_date: f.mfg_date || undefined, expiry_date: f.expiry_date || undefined,
          facility_id: f.facility_id || undefined, attributes, components: components.filter((c) => c.batch_id),
        },
      });
      toast(`Batch ${r.batch.id} created · ${r.minted.length} passports minted in block #${r.block.height}`);
      onCreated(r);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} wide title="New batch" subtitle="Steps 1–3: assign the batch, issue signed serials. Each starts as an empty container filled by the process scanner."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={submit} disabled={!f.sku || !f.name || !f.code}>Create &amp; issue serials</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Batch code" hint="Prefix of every serial, e.g. AAA → AAA12345678"><input className="input font-mono uppercase" value={f.code || ''} onChange={set('code')} placeholder="AAA" maxLength={20} /></Field>
          <Field label="Category">
            <select className="input" value={f.category} onChange={set('category')}>{Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          </Field>
          <Field label="SKU"><input className="input" value={f.sku || ''} onChange={set('sku')} placeholder="AMOX-500" /></Field>
          <Field label="Facility">
            <select className="input" value={f.facility_id} onChange={set('facility_id')}>
              <option value="">— none —</option>
              {facilities.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Product name"><input className="input" value={f.name || ''} onChange={set('name')} placeholder="Amoxicillin 500 mg capsules – strip of 10" /></Field>
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Batch quantity"><input type="number" className="input" value={f.quantity} onChange={set('quantity')} /></Field>
          <Field label="Mint now" hint="max 2000 per request"><input type="number" className="input" value={f.mint} onChange={set('mint')} /></Field>
          <Field label="Mfg date"><input type="date" className="input" value={f.mfg_date} onChange={set('mfg_date')} /></Field>
          <Field label="Expiry"><input type="date" className="input" value={f.expiry_date || ''} onChange={set('expiry_date')} /></Field>
        </div>
        <div>
          <span className="label flex items-center gap-1"><Cog className="h-3.5 w-3.5" />Process route: each step is scanned at its machine (in this order)</span>
          <ol className="space-y-1.5">
            {route.map((s, i) => (
              <li key={s} className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-1.5 text-sm">
                <span className="w-5 text-xs text-ink-400">{i + 1}.</span><span className="flex-1">{s}</span>
                <button type="button" disabled={i === 0} onClick={() => moveStep(i, -1)} className="text-ink-400 hover:text-ink-700 disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button type="button" disabled={i === route.length - 1} onClick={() => moveStep(i, 1)} className="text-ink-400 hover:text-ink-700 disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => setRoute((r) => r.filter((_, j) => j !== i))} className="text-ink-400 hover:text-red-600" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ol>
          <div className="mt-2 flex gap-2">
            <input className="input" value={newStep} onChange={(e) => setNewStep(e.target.value)} placeholder="Add a process step" onKeyDown={(e) => { if (e.key === 'Enter' && newStep.trim()) { e.preventDefault(); setRoute((r) => [...new Set([...r, newStep.trim()])]); setNewStep(''); } }} />
            <Button variant="secondary" onClick={() => { if (newStep.trim()) { setRoute((r) => [...new Set([...r, newStep.trim()])]); setNewStep(''); } }}>Add</Button>
          </div>
        </div>
        {presets.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {presets.map(([k, label, ph]) => <Field key={k} label={label}><input className="input" value={extra[k] || ''} onChange={setX(k)} placeholder={ph} /></Field>)}
          </div>
        )}
        <div>
          <div className="mb-1 flex items-center justify-between"><span className="label">Components (genealogy)</span><Button variant="ghost" size="sm" icon={Plus} onClick={() => setComponents((c) => [...c, { name: '', batch_id: '' }])}>Add</Button></div>
          {components.length === 0 && <p className="text-xs text-ink-400">Link component lots (e.g. display panel, API raw material) so defects and recalls trace through.</p>}
          {components.map((c, i) => (
            <div key={i} className="mb-2 grid grid-cols-[1fr_1.4fr_auto] gap-2">
              <input className="input" placeholder="Part name" value={c.name} onChange={(e) => setComponents((x) => x.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} />
              <select className="input" value={c.batch_id} onChange={(e) => setComponents((x) => x.map((y, j) => (j === i ? { ...y, batch_id: e.target.value } : y)))}>
                <option value="">Select component lot…</option>
                {(comps.data || []).map((b) => <option key={b.id} value={b.id}>{b.id} · {b.name}</option>)}
              </select>
              <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setComponents((x) => x.filter((_, j) => j !== i))} aria-label="Remove" />
            </div>
          ))}
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between"><span className="label">Custom attributes</span><Button variant="ghost" size="sm" icon={Plus} onClick={() => setCustom((c) => [...c, { k: '', v: '' }])}>Add</Button></div>
          {custom.map((c, i) => (
            <div key={i} className="mb-2 grid grid-cols-2 gap-2">
              <input className="input" placeholder="key" value={c.k} onChange={(e) => setCustom((x) => x.map((y, j) => (j === i ? { ...y, k: e.target.value } : y)))} />
              <input className="input" placeholder="value" value={c.v} onChange={(e) => setCustom((x) => x.map((y, j) => (j === i ? { ...y, v: e.target.value } : y)))} />
            </div>
          ))}
        </div>
        <ErrorBox error={error} />
      </div>
    </Modal>
  );
}
