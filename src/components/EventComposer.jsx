import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertTriangle, Send } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { eventMeta, DEFECT_CODES, ROLE_LABEL } from '../lib/format';
import { Badge, Button, ErrorBox, Field, Hash, SeverityBadge, useToast } from './ui';

const DATA_TYPES = ['PRODUCTION_COMPLETE', 'PACKED', 'STORED', 'EXIT', 'DELIVERED', 'ENTRY', 'CHECKPOINT', 'QUALITY_CHECK', 'SOLD', 'ISSUE_REPORTED', 'HANDED_OVER', 'FIRMWARE_UPDATE', 'SERVICE', 'UNLOCK', 'DEFECT_REPORTED', 'WARRANTY_CLAIM', 'RECALL', 'FLAG', 'CLEAR', 'REPACKAGE', 'DISPOSE'];

/** Records one ledger event for one or many units. */
export default function EventComposer({ productIds, batchId, defaultType, types, onDone, compact }) {
  const { actor, facilities, can } = useAuth();
  const toast = useToast();
  const allowed = useMemo(() => (types || DATA_TYPES).filter(can), [types, can]);
  const [type, setType] = useState(defaultType && allowed.includes(defaultType) ? defaultType : allowed[0]);
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || '');
  const [allFacilities, setAllFacilities] = useState([]);
  const [actors, setActors] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [f, setF] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  useEffect(() => {
    api('/actors').then((a) => setActors(a.filter((x) => x.id !== actor.id && x.status === 'active' && x.role !== 'admin'))).catch(() => {});
    if (['admin', 'regulator', 'logistics'].includes(actor.role)) api('/facilities').then(setAllFacilities).catch(() => {});
  }, [actor]);
  useEffect(() => {
    if (type === 'WARRANTY_CLAIM') api('/programs').then(setPrograms).catch(() => {});
  }, [type]);

  const facilityOptions = ['admin', 'regulator', 'logistics'].includes(actor.role) ? allFacilities : facilities;
  const count = productIds?.length || 0;

  if (!allowed.length) return <p className="text-sm text-ink-500">Your role ({ROLE_LABEL[actor.role]}) cannot record events on these units.</p>;

  const submit = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    const data = {};
    const num = (v) => (v === '' || v == null ? undefined : Number(v));
    if (f.note) data.note = f.note;
    if (['ENTRY', 'CHECKPOINT'].includes(type) && f.temperature_c !== undefined && f.temperature_c !== '') data.temperature_c = num(f.temperature_c);
    if (type === 'EXIT' && f.invoice) data.invoice = f.invoice;
    if (type === 'QUALITY_CHECK') data.result = f.result || 'pass';
    if (type === 'FIRMWARE_UPDATE') data.version = f.version;
    if (['DEFECT_REPORTED', 'ISSUE_REPORTED'].includes(type)) Object.assign(data, { code: f.code || DEFECT_CODES[0], description: f.description });
    if (type === 'PACKED' && f.carton) data.carton_id = f.carton;
    if (type === 'STORED' && f.bin) data.bin = f.bin;
    if (type === 'DELIVERED' && f.received_by) data.received_by = f.received_by;
    if (type === 'UNLOCK') data.reason = f.reason || 'Genuine part restored';
    if (type === 'SERVICE') {
      Object.assign(data, { action: f.action || 'Inspection', physical_damage: !!f.physical_damage, liquid_damage: !!f.liquid_damage });
      if (f.rep_name && (f.rep_to || f.rep_part)) data.replaced = [{ name: f.rep_name, from_batch: f.rep_from || null, to_batch: f.rep_to || null, new_part_id: f.rep_part ? f.rep_part.trim().toUpperCase() : undefined }];
      if (f.remedy) data.remedy = true;
    }
    if (['RECALL', 'FLAG'].includes(type)) data.reason = f.reason;
    if (type === 'WARRANTY_CLAIM' && f.program_id) data.program_id = f.program_id;
    if (type === 'SOLD' && f.invoice) data.invoice = f.invoice;
    try {
      const body = { type, data, facility_id: facilityId || undefined };
      if (productIds?.length) body.product_ids = productIds;
      else if (batchId) body.batch_id = batchId;
      if (type === 'EXIT') body.to_actor_id = f.to_actor_id;
      if (type === 'SOLD' && f.cust_name) body.customer = { name: f.cust_name, phone: f.cust_phone || undefined, email: f.cust_email || undefined };
      const r = await api('/events', { method: 'POST', body });
      setResult(r);
      if (r.accepted.length) toast(`${eventMeta(type).label}: ${r.accepted.length} unit(s) sealed in block #${r.block.height}`);
      else toast(`All ${r.rejected.length} unit(s) rejected`, 'error');
      onDone?.(r);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  const needsFacility = ['EXIT', 'ENTRY', 'SOLD', 'QUALITY_CHECK', 'STORED'].includes(type);
  return (
    <div className="space-y-3">
      <div className={compact ? 'grid gap-3' : 'grid gap-3 sm:grid-cols-2'}>
        <Field label="Event">
          <select className="input" value={type} onChange={(e) => { setType(e.target.value); setResult(null); }}>
            {allowed.map((t) => <option key={t} value={t}>{eventMeta(t).label}</option>)}
          </select>
        </Field>
        {type !== 'RECALL' && type !== 'FLAG' && type !== 'CLEAR' && type !== 'FIRMWARE_UPDATE' && (
          <Field label={needsFacility ? 'Facility' : 'Facility (optional)'}>
            <select className="input" value={facilityId} onChange={(e) => setFacilityId(e.target.value)}>
              <option value="">{facilityOptions.length ? '— none —' : 'No facilities registered'}</option>
              {facilityOptions.map((x) => <option key={x.id} value={x.id}>{x.name}{x.licensed ? '' : ' (unlicensed)'}</option>)}
            </select>
          </Field>
        )}
      </div>

      {type === 'EXIT' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Receiving party">
            <select className="input" value={f.to_actor_id || ''} onChange={set('to_actor_id')}>
              <option value="">Select…</option>
              {actors.map((a) => <option key={a.id} value={a.id}>{a.name} · {ROLE_LABEL[a.role]}</option>)}
            </select>
          </Field>
          <Field label="Invoice / waybill"><input className="input" value={f.invoice || ''} onChange={set('invoice')} placeholder="INV-…" /></Field>
        </div>
      )}
      {['ENTRY', 'CHECKPOINT'].includes(type) && (
        <Field label="Temperature °C (optional)" hint="Checked against the batch's storage range"><input type="number" step="0.1" className="input" value={f.temperature_c ?? ''} onChange={set('temperature_c')} /></Field>
      )}
      {type === 'QUALITY_CHECK' && (
        <Field label="Result"><select className="input" value={f.result || 'pass'} onChange={set('result')}><option value="pass">Pass</option><option value="fail">Fail → quarantine</option></select></Field>
      )}
      {type === 'SOLD' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Customer name"><input className="input" value={f.cust_name || ''} onChange={set('cust_name')} /></Field>
          <Field label="Customer phone"><input className="input" value={f.cust_phone || ''} onChange={set('cust_phone')} /></Field>
          <Field label="Customer email"><input className="input" value={f.cust_email || ''} onChange={set('cust_email')} /></Field>
          <Field label="Invoice / prescription no."><input className="input" value={f.invoice || ''} onChange={set('invoice')} /></Field>
        </div>
      )}
      {type === 'PACKED' && <Field label="Carton / pallet ID"><input className="input" value={f.carton || ''} onChange={set('carton')} /></Field>}
      {type === 'STORED' && <Field label="Bin / rack location"><input className="input" value={f.bin || ''} onChange={set('bin')} /></Field>}
      {type === 'DELIVERED' && <Field label="Received by"><input className="input" value={f.received_by || ''} onChange={set('received_by')} /></Field>}
      {type === 'UNLOCK' && <Field label="Reason"><input className="input" value={f.reason || ''} onChange={set('reason')} placeholder="Genuine part restored" /></Field>}
      {type === 'FIRMWARE_UPDATE' && <Field label="Firmware version"><input className="input" value={f.version || ''} onChange={set('version')} placeholder="e.g. NovaOS 14.0.3" /></Field>}
      {['DEFECT_REPORTED', 'ISSUE_REPORTED'].includes(type) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Defect code">
            <input className="input" list="defect-codes" value={f.code ?? DEFECT_CODES[0]} onChange={set('code')} />
            <datalist id="defect-codes">{DEFECT_CODES.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Description"><input className="input" value={f.description || ''} onChange={set('description')} /></Field>
        </div>
      )}
      {type === 'SERVICE' && (
        <div className="space-y-3">
          <Field label="Action"><input className="input" value={f.action || ''} onChange={set('action')} placeholder="Inspection, display replacement…" /></Field>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.physical_damage} onChange={set('physical_damage')} /> Physical damage</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.liquid_damage} onChange={set('liquid_damage')} /> Liquid damage</label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Replaced part"><input className="input" value={f.rep_name || ''} onChange={set('rep_name')} placeholder="Display panel" /></Field>
            <Field label="Old lot"><input className="input" value={f.rep_from || ''} onChange={set('rep_from')} /></Field>
            <Field label="New genuine part serial"><input className="input font-mono" value={f.rep_part || ''} onChange={set('rep_part')} /></Field>
          </div>
          {actor.role === 'manufacturer' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.remedy} onChange={set('remedy')} /> Recall remedy applied</label>}
        </div>
      )}
      {type === 'WARRANTY_CLAIM' && (
        <Field label="Program" hint="Eligibility is evaluated automatically from the ledger">
          <select className="input" value={f.program_id || ''} onChange={set('program_id')}>
            <option value="">Best matching program</option>
            {programs.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
      )}
      {['RECALL', 'FLAG'].includes(type) && <Field label="Reason (public)"><input className="input" value={f.reason || ''} onChange={set('reason')} /></Field>}
      <Field label="Note (optional)"><input className="input" value={f.note || ''} onChange={set('note')} /></Field>

      <ErrorBox error={error} />
      <Button icon={Send} loading={busy} onClick={submit} className="w-full" variant={['RECALL', 'FLAG', 'DISPOSE'].includes(type) ? 'danger' : 'primary'} disabled={!count && !batchId}>
        Sign &amp; record {count ? `${count} unit${count > 1 ? 's' : ''}` : 'entire batch'}
      </Button>
      {result && <EventResult result={result} />}
    </div>
  );
}

export function EventResult({ result }) {
  return (
    <div className="space-y-2 rounded-xl border border-ink-200 bg-ink-50/60 p-3 text-sm">
      {result.block && (
        <div className="flex flex-wrap items-center gap-2 text-brand-800">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-semibold">{result.accepted.length} sealed in block #{result.block.height}</span>
          <Hash value={result.block.hash} />
        </div>
      )}
      {result.rejected.length > 0 && (
        <div>
          <div className="flex items-center gap-2 font-semibold text-red-700"><XCircle className="h-4 w-4" />{result.rejected.length} rejected</div>
          <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto text-xs text-ink-600">
            {result.rejected.slice(0, 30).map((r) => <li key={r.product_id}><span className="mono">{r.product_id}</span> – {r.reason}</li>)}
          </ul>
        </div>
      )}
      {result.claims?.length > 0 && (
        <ul className="space-y-0.5 text-xs">
          {result.claims.map((c) => <li key={c.product_id}><span className="mono">{c.product_id}</span> <Badge tone={c.eligible ? 'brand' : 'red'}>{c.eligible ? 'claim approved' : 'claim rejected'}</Badge></li>)}
        </ul>
      )}
      {result.alerts.length > 0 && (
        <div className="space-y-1">
          {result.alerts.map((a) => (
            <Link key={a.id} to="/app/alerts" className="flex items-start gap-2 rounded-lg bg-white p-2 text-xs ring-1 ring-red-100">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
              <span><SeverityBadge severity={a.severity} /> {a.message}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
