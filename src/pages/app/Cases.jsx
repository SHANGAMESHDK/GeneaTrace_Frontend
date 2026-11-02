import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LifeBuoy, Send, PackageCheck, HandHeart, Stethoscope, Wrench, Truck, RotateCcw, User } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { eventMeta, fmtDateTime, humanize, TICKET_STATUS, timeAgo } from '../../lib/format';
import { Badge, Button, Card, cx, Empty, ErrorBox, Field, Loading, PageHeader, useAsync, useToast } from '../../components/ui';
import BacktracePanel from '../../components/Backtrace';
import { EventResult } from '../../components/EventComposer';

const STAGES = ['reported', 'sent_to_manufacturer', 'at_manufacturer', 'diagnosed', 'repaired', 'returning_to_retailer', 'ready_for_customer', 'closed'];

/** Service cases: steps 10–15 – retailer → manufacturer → backtrace → repair/replace → retailer → customer. */
export default function Cases() {
  const { actor } = useAuth();
  const [sp, setSp] = useSearchParams();
  const [filter, setFilter] = useState('open');
  const list = useAsync(() => api('/tickets'), []);
  const selected = sp.get('id');
  const rows = (list.data || []).filter((t) => (filter === 'open' ? t.status !== 'closed' : filter === 'closed' ? t.status === 'closed' : true));

  return (
    <>
      <PageHeader title="Service & recall cases" subtitle={actor.role === 'manufacturer' ? 'Returned units from retailers: receive, backtrace, repair or replace, send back' : 'Customer returns and recall notices: send to the manufacturer, receive back, hand over'} />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2" bodyClass="p-0"
          action={<select className="input h-8 py-0 text-xs" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="open">Open</option><option value="closed">Closed</option><option value="all">All</option></select>}
          title={`${rows.length} case(s)`}>
          {list.loading && !list.data ? <Loading /> : rows.length === 0 ? <Empty icon={LifeBuoy} title="No cases" text="Customer returns and recall notices appear here." /> : (
            <ul className="max-h-[70vh] divide-y divide-ink-100 overflow-y-auto">
              {rows.map((t) => (
                <li key={t.id}>
                  <button onClick={() => setSp({ id: t.id })} className={cx('w-full px-4 py-3 text-left hover:bg-ink-50', selected === t.id && 'bg-brand-50/60')}>
                    <div className="flex items-center gap-2">
                      <Badge tone={t.kind === 'recall' ? 'red' : 'amber'}>{t.kind === 'recall' ? 'Recall' : humanize(t.code)}</Badge>
                      <span className="font-mono text-xs text-ink-500">{t.id}</span>
                      <span className="ml-auto text-[11px] text-ink-400">{timeAgo(t.updated_at)}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-ink-900">{t.product_name} <span className="font-mono text-xs text-ink-500">{t.product_id}</span></p>
                    <p className="text-xs text-ink-500">{TICKET_STATUS[t.status]?.label || t.status} · {actor.role === 'manufacturer' ? t.retailer_name : t.manufacturer_name}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div className="lg:col-span-3">
          {selected ? <CaseDetail id={selected} onChange={list.reload} /> : <Card><Empty icon={LifeBuoy} title="Select a case" /></Card>}
        </div>
      </div>
    </>
  );
}

function CaseDetail({ id, onChange }) {
  const { actor, facilities } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => api(`/tickets/${id}`), [id]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [f, setF] = useState({});
  useEffect(() => { setResult(null); setErr(null); setF({}); }, [id]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const t = data.ticket;
  const unit = t.replacement_id && ['returning_to_retailer', 'ready_for_customer', 'diagnosed'].includes(t.status) && t.diagnosis?.action === 'replace' ? t.replacement_id : t.product_id;
  const myFacility = facilities[0]?.id;
  const isRetail = actor.id === t.retailer_id || actor.role === 'admin';
  const isMaker = actor.id === t.manufacturer_id || actor.role === 'admin';
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const run = async (label, body) => {
    setBusy(true);
    setErr(null);
    try {
      const r = await api('/events', { method: 'POST', body: { facility_id: myFacility, ...body } });
      setResult(r);
      if (r.accepted.length) toast(`${label} – sealed in block #${r.block.height}`);
      else toast(r.rejected[0]?.reason || 'Rejected', 'error');
      await reload();
      onChange();
    } catch (e) {
      setErr(e);
    } finally {
      setBusy(false);
    }
  };

  const bt = data.backtrace;
  const steps = bt?.unit_steps || [];
  const actions = [];
  if (isRetail && t.status === 'recall_notice') actions.push(<Button key="c" icon={RotateCcw} loading={busy} onClick={() => run('Collected from customer', { type: 'ISSUE_REPORTED', product_ids: [t.product_id], data: { code: 'RECALL', ticket_id: t.id, description: 'Collected under recall' } })}>Collected from customer</Button>);
  if (isRetail && ['reported', 'collected'].includes(t.status) && t.custodian_id === actor.id) actions.push(<Button key="s" icon={Send} loading={busy} onClick={() => run('Sent to manufacturer', { type: 'EXIT', product_ids: [t.product_id], to_actor_id: t.manufacturer_id, data: { note: `Service case ${t.id}` } })}>Send unit to manufacturer</Button>);
  if (isMaker && t.status === 'sent_to_manufacturer') actions.push(<Button key="r" icon={PackageCheck} loading={busy} onClick={() => run('Returned unit received', { type: 'ENTRY', product_ids: [t.product_id] })}>Receive returned unit</Button>);
  if (isRetail && t.status === 'returning_to_retailer') actions.push(<Button key="rb" icon={PackageCheck} loading={busy} onClick={() => run('Received back from manufacturer', { type: 'ENTRY', product_ids: [unit] })}>Receive {unit !== t.product_id ? 'replacement' : 'unit'} back</Button>);
  if (isRetail && t.status === 'ready_for_customer') actions.push(<Button key="h" icon={HandHeart} loading={busy} onClick={() => run('Handed over to customer', { type: 'HANDED_OVER', product_ids: [unit] })}>Hand over to customer</Button>);
  if (isMaker && t.status === 'repaired') actions.push(<Button key="d" icon={Truck} loading={busy} onClick={() => run('Dispatched to retailer', { type: 'EXIT', product_ids: [t.product_id], to_actor_id: t.retailer_id })}>Send back to {t.retailer_name}</Button>);
  if (isMaker && t.status === 'diagnosed' && t.diagnosis?.action === 'replace') actions.push(<Button key="dr" icon={Truck} loading={busy} onClick={() => run('Replacement dispatched', { type: 'EXIT', product_ids: [t.replacement_id], to_actor_id: t.retailer_id })}>Dispatch replacement {t.replacement_id}</Button>);
  const stageIdx = STAGES.indexOf(t.status === 'collected' ? 'reported' : t.status);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><Badge tone={t.kind === 'recall' ? 'red' : 'amber'}>{t.kind === 'recall' ? 'Recall' : humanize(t.code)}</Badge><span className="font-mono text-xs text-ink-500">{t.id}</span></div>
            <h2 className="mt-1 text-lg font-bold">{t.product_name}</h2>
            <Link to={`/app/products/${t.product_id}`} className="font-mono text-sm text-brand-700 hover:underline">{t.product_id}</Link>
            {t.replacement_id && <span className="ml-2 text-sm text-ink-600">→ replacement <Link to={`/app/products/${t.replacement_id}`} className="font-mono text-brand-700 hover:underline">{t.replacement_id}</Link></span>}
            {t.description && <p className="mt-2 text-sm text-ink-600">“{t.description}”</p>}
          </div>
          <Badge tone={TICKET_STATUS[t.status]?.tone}>{TICKET_STATUS[t.status]?.label}</Badge>
        </div>
        {t.kind === 'issue' && (
          <ol className="mt-5 grid grid-cols-4 gap-1 sm:grid-cols-8">
            {STAGES.map((s, i) => (
              <li key={s} className="text-center">
                <div className={cx('mx-auto h-1.5 rounded-full', i <= stageIdx ? 'bg-brand-500' : 'bg-ink-200')} />
                <span className={cx('mt-1 block text-[10px] leading-tight', i <= stageIdx ? 'text-ink-700' : 'text-ink-400')}>{TICKET_STATUS[s].label.replace(/ – .*/, '')}</span>
              </li>
            ))}
          </ol>
        )}
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><span className="text-ink-500">Retailer: </span>{t.retailer_name}</div>
          <div><span className="text-ink-500">Manufacturer: </span>{t.manufacturer_name}</div>
          {t.sale?.customer_name && <div className="flex items-center gap-1.5 sm:col-span-2"><User className="h-4 w-4 text-ink-400" /><span className="font-medium">{t.sale.customer_name}</span>{t.sale.customer_phone && <span className="text-ink-500">· {t.sale.customer_phone}</span>}<span className="text-xs text-ink-400">(off-chain, visible to the retailer only)</span></div>}
          {t.diagnosis?.finding && <div className="sm:col-span-2"><span className="text-ink-500">Diagnosis: </span>{t.diagnosis.finding}{t.diagnosis.machine_id && <> · {t.diagnosis.process} on <span className="font-mono">{t.diagnosis.machine_id}</span></>} · <strong>{t.diagnosis.action}</strong></div>}
        </div>
        {actions.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}

        {isMaker && t.status === 'at_manufacturer' && (
          <div className="mt-5 space-y-3 rounded-xl border border-ink-200 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><Stethoscope className="h-4 w-4 text-violet-600" />Diagnose (step 12)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Faulty process">
                <select className="input" value={f.process ?? bt?.suspect?.process ?? ''} onChange={set('process')}>
                  <option value="">Not process related</option>
                  {[...new Set(steps.map((s) => s.process))].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Machine">
                <select className="input" value={f.machine_id ?? bt?.suspect?.machine_id ?? ''} onChange={set('machine_id')}>
                  <option value="">—</option>
                  {[...new Set(steps.map((s) => s.machine_id))].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Finding"><input className="input" value={f.finding || ''} onChange={set('finding')} placeholder="e.g. lamination pressure drift caused panel delamination" /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Action"><select className="input" value={f.action || 'repair'} onChange={set('action')}><option value="repair">Repair this unit</option><option value="replace">Replace with a new unit</option></select></Field>
              {f.action === 'replace' && <Field label="Replacement serial (from your stock)"><input className="input font-mono" value={f.replacement_id || ''} onChange={set('replacement_id')} /></Field>}
            </div>
            <Button icon={Stethoscope} loading={busy} disabled={!f.finding} onClick={() => run('Diagnosis recorded', { type: 'DIAGNOSED', product_ids: [t.product_id], data: { process: f.process ?? bt?.suspect?.process ?? null, machine_id: f.machine_id ?? bt?.suspect?.machine_id ?? null, finding: f.finding, action: f.action || 'repair', replacement_id: f.replacement_id } })}>Record diagnosis</Button>
          </div>
        )}
        {isMaker && t.status === 'diagnosed' && t.diagnosis?.action !== 'replace' && (
          <div className="mt-5 space-y-3 rounded-xl border border-ink-200 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><Wrench className="h-4 w-4 text-sky-600" />Repair</p>
            <Field label="Work done"><input className="input" value={f.work || ''} onChange={set('work')} placeholder="Display panel replaced" /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Replaced part (optional)"><input className="input" value={f.part_name || ''} onChange={set('part_name')} placeholder="Display panel" /></Field>
              <Field label="New genuine part serial"><input className="input font-mono" value={f.part_serial || ''} onChange={set('part_serial')} /></Field>
            </div>
            {t.product_status === 'recalled' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.remedy ?? true} onChange={set('remedy')} /> Recall remedy applied (clears the recall on this unit)</label>}
            <Button icon={Wrench} loading={busy} onClick={() => run('Repair recorded', { type: 'SERVICE', product_ids: [t.product_id], data: { action: f.work || 'Repaired', remedy: t.product_status === 'recalled' ? (f.remedy ?? true) : undefined, replaced: f.part_name && f.part_serial ? [{ name: f.part_name, new_part_id: f.part_serial.trim().toUpperCase() }] : undefined } })}>Record repair</Button>
          </div>
        )}
        <div className="mt-3 space-y-2"><ErrorBox error={err} />{result && <EventResult result={result} />}</div>
      </Card>

      {bt && <Card title="Backtrace" subtitle="Which process and machine caused it, and which other units are at risk"><BacktracePanel bt={bt} canRecall={isMaker} onRecalled={() => { reload(); onChange(); }} /></Card>}

      <Card title="Case history on the ledger" bodyClass="divide-y divide-ink-100">
        {data.events.length === 0 && <p className="p-5 text-sm text-ink-500">No events yet.</p>}
        {data.events.map((e) => {
          const m = eventMeta(e.type);
          return (
            <div key={e.id} className="flex items-start gap-3 px-5 py-3 text-sm">
              <m.icon className="mt-0.5 h-4 w-4 text-ink-400" />
              <div className="flex-1"><span className="font-medium">{m.label}</span> <span className="font-mono text-xs text-ink-500">{e.product_id}</span>{e.data?.to_actor_name && <span className="text-ink-500"> → {e.data.to_actor_name}</span>}<br /><span className="text-xs text-ink-400">{fmtDateTime(e.ts)} · block #{e.block_height}</span></div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
