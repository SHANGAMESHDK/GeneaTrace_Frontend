import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Printer, Plus, MapPin, GitBranch, Truck, Bell, Undo2, CheckSquare } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { categoryMeta, fmtDate, humanize, ROLE_LABEL, STATUS_META, timeAgo } from '../../lib/format';
import { Badge, Button, Card, ErrorBox, Field, Loading, Modal, PageHeader, SeverityBadge, Stat, StatusBadge, useAsync, useToast } from '../../components/ui';
import { ComponentTree } from '../../components/domain';
import EventComposer from '../../components/EventComposer';

export default function BatchDetail() {
  const { id } = useParams();
  const { actor, can } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => api(`/batches/${id}`), [id]);
  const [sel, setSel] = useState(new Set());
  const [filter, setFilter] = useState('');
  const [action, setAction] = useState(null);
  const [mint, setMint] = useState(false);
  const units = useMemo(() => (data?.units || []).filter((u) => !filter || u.status === filter), [data, filter]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const { batch, trace } = data;
  const Icon = categoryMeta(batch.category).icon;
  const mine = batch.manufacturer_id === actor.id || actor.role === 'admin';
  const toggle = (uid) => setSel((s) => { const n = new Set(s); n.has(uid) ? n.delete(uid) : n.add(uid); return n; });
  const allSel = units.length > 0 && units.every((u) => sel.has(u.id));
  const attrs = Object.entries(batch.attributes || {}).filter(([, v]) => typeof v !== 'object');

  return (
    <>
      <PageHeader
        eyebrow={<Link to="/app/batches" className="hover:underline">Batches</Link>}
        title={batch.name}
        subtitle={<span className="flex flex-wrap items-center gap-2"><span className="font-mono">{batch.id}</span>· {batch.sku} · by {data.manufacturer?.name}{batch.status === 'recalled' && <Badge tone="red">Recalled</Badge>}</span>}
        actions={<>
          {data.units.length > 0 && <Link to={`/app/batches/${batch.id}/labels`}><Button variant="secondary" icon={Printer}>Print labels</Button></Link>}
          {mine && batch.minted < batch.quantity && <Button variant="secondary" icon={Plus} onClick={() => setMint(true)}>Mint more</Button>}
          {can('RECALL') && batch.status !== 'recalled' && data.units.length > 0 && (mine || actor.role === 'regulator') && <Button variant="danger" icon={Undo2} onClick={() => setAction({ type: 'RECALL', batch: true })}>Recall batch</Button>}
        </>}
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Minted" value={`${batch.minted} / ${batch.quantity.toLocaleString()}`} icon={Icon} />
        {trace
          ? <Stat label="Units traced (incl. downstream)" value={trace.units} icon={GitBranch} tone="purple" hint={trace.dependents.length ? `${trace.dependents.length} product batch(es) use this lot` : undefined} />
          : <Stat label="Your units in this batch" value={data.units.length} icon={GitBranch} tone="purple" hint={`Made by ${data.manufacturer?.name}`} />}
        <Stat label="Manufactured" value={fmtDate(batch.mfg_date)} icon={Truck} tone="gray" />
        <Stat label="Expiry" value={batch.expiry_date ? fmtDate(batch.expiry_date) : 'n/a'} icon={Bell} tone={batch.expiry_date && batch.expiry_date < new Date().toISOString().slice(0, 10) ? 'red' : 'gray'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {!trace ? (
          <Card title="Where are the units now?" className="lg:col-span-2" icon={MapPin}>
            <p className="text-sm text-ink-600">You can see only the units of this batch that your company holds or has handled. The full network-wide trace is visible to {data.manufacturer?.name} and regulators.</p>
          </Card>
        ) : (
        <Card title="Where are the units now?" subtitle="Forward trace – for recalls and stock audits" className="lg:col-span-2" icon={MapPin} bodyClass="overflow-x-auto">
          {trace.dependents.length > 0 && (
            <p className="px-5 pt-3 text-sm text-ink-600">This lot is a component in: {trace.dependents.map((d) => <Link key={d.id} to={`/app/batches/${d.id}`} className="mr-2 font-mono text-brand-700 hover:underline">{d.id}</Link>)}</p>
          )}
          <table className="w-full">
            <thead><tr><th className="table-head">Holder</th><th className="table-head">Location</th><th className="table-head">Units</th><th className="table-head">Status mix</th></tr></thead>
            <tbody className="divide-y divide-ink-100">
              {trace.locations.map((l, i) => (
                <tr key={i}>
                  <td className="table-cell"><span className="font-medium text-ink-900">{l.holder}</span><br /><span className="text-xs text-ink-500">{ROLE_LABEL[l.role] || humanize(l.role)}</span></td>
                  <td className="table-cell">{l.in_transit_to ? <span className="text-sky-700">In transit → {l.in_transit_to}</span> : l.facility ? <>{l.facility.name}{!l.facility.licensed && <Badge tone="red" className="ml-1">unlicensed</Badge>}</> : '—'}</td>
                  <td className="table-cell font-semibold">{l.units}</td>
                  <td className="table-cell"><div className="flex flex-wrap gap-1">{Object.entries(l.statuses).map(([s, n]) => <Badge key={s} tone={STATUS_META[s]?.tone}>{STATUS_META[s]?.label || s}: {n}</Badge>)}</div></td>
                </tr>
              ))}
              {trace.locations.length === 0 && <tr><td className="table-cell text-ink-500" colSpan={4}>No units minted yet.</td></tr>}
            </tbody>
          </table>
        </Card>
        )}
        <div className="space-y-6">
          <Card title="Bill of materials" icon={GitBranch}><ComponentTree nodes={data.components} linkBatches /></Card>
          {attrs.length > 0 && (
            <Card title="Batch attributes">
              <dl className="space-y-1.5 text-sm">{attrs.map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-ink-500">{humanize(k)}</dt><dd className="text-right font-medium">{String(v)}</dd></div>)}</dl>
            </Card>
          )}
        </div>
      </div>

      {data.alerts.length > 0 && (
        <Card title="Alerts on this batch" className="mt-6" icon={Bell} bodyClass="divide-y divide-ink-100">
          {data.alerts.map((a) => (
            <div key={a.id} className="flex items-start gap-3 px-5 py-3 text-sm">
              <SeverityBadge severity={a.severity} /><span className="flex-1 text-ink-700">{a.message}</span><span className="whitespace-nowrap text-xs text-ink-400">{timeAgo(a.created_at)}</span>
            </div>
          ))}
        </Card>
      )}

      <Card className="mt-6" title={`Units (${data.units.length})`} bodyClass="p-0"
        action={<div className="flex items-center gap-2">
          <select className="input h-8 py-0 text-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All ({data.units.length})</option>
            {Object.entries(data.status_counts).map(([s, n]) => <option key={s} value={s}>{STATUS_META[s]?.label || s} ({n})</option>)}
          </select>
          {sel.size > 0 && <Button size="sm" icon={CheckSquare} onClick={() => setAction({ ids: [...sel] })}>Record event for {sel.size}</Button>}
        </div>}>
        <div className="max-h-[480px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white"><tr>
              <th className="table-head w-10"><input type="checkbox" checked={allSel} onChange={() => setSel(allSel ? new Set() : new Set(units.map((u) => u.id)))} /></th>
              <th className="table-head">#</th><th className="table-head">Passport ID</th><th className="table-head">Status</th><th className="table-head">Custodian</th><th className="table-head">Scans</th>
            </tr></thead>
            <tbody className="divide-y divide-ink-100">
              {units.map((u) => (
                <tr key={u.id} className={sel.has(u.id) ? 'bg-brand-50/50' : ''}>
                  <td className="table-cell"><input type="checkbox" checked={sel.has(u.id)} onChange={() => toggle(u.id)} /></td>
                  <td className="table-cell text-ink-500">{u.serial_no}</td>
                  <td className="table-cell"><Link to={`/app/products/${u.id}`} className="mono font-medium text-brand-700 hover:underline">{u.id}</Link></td>
                  <td className="table-cell"><StatusBadge status={u.status} /></td>
                  <td className="table-cell mono text-ink-500">{u.pending_to ? `→ ${u.pending_to}` : u.custodian_id}</td>
                  <td className="table-cell">{u.scan_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!action} onClose={() => setAction(null)} title={action?.batch ? 'Recall entire batch' : `Record event for ${action?.ids?.length} unit(s)`} subtitle="One signed transaction per unit, sealed in a single block">
        {action && <EventComposer productIds={action.ids} batchId={action.batch ? batch.id : undefined} defaultType={action.type} types={action.batch ? ['RECALL'] : undefined} onDone={() => { reload(); setSel(new Set()); }} />}
      </Modal>
      <MintMore open={mint} onClose={() => setMint(false)} batch={batch} onDone={(r) => { toast(`${r.minted.length} passports minted in block #${r.block.height}`); setMint(false); reload(); }} />
    </>
  );
}

function MintMore({ open, onClose, batch, onDone }) {
  const { facilities } = useAuth();
  const [count, setCount] = useState(10);
  const [fac, setFac] = useState(facilities[0]?.id || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      onDone(await api(`/batches/${batch.id}/mint`, { method: 'POST', body: { count: Number(count), facility_id: fac || undefined } }));
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Mint more passports" subtitle={`${batch.quantity - batch.minted} remaining in this batch`} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={go}>Mint</Button></>}>
      <div className="space-y-3">
        <Field label="Units"><input type="number" className="input" value={count} min={1} max={Math.min(2000, batch.quantity - batch.minted)} onChange={(e) => setCount(e.target.value)} /></Field>
        <Field label="Facility"><select className="input" value={fac} onChange={(e) => setFac(e.target.value)}><option value="">— none —</option>{facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></Field>
        <ErrorBox error={error} />
      </div>
    </Modal>
  );
}
