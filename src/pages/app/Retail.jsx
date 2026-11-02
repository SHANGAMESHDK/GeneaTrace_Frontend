import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Store, Users, RotateCcw, PackageCheck, ShoppingBag, BellRing } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { DEFECT_CODES, fmtDateTime, timeAgo } from '../../lib/format';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal, PageHeader, StatusBadge, Tabs, useAsync, useToast } from '../../components/ui';
import { EventResult } from '../../components/EventComposer';

/** Retail login (steps 8–10): accept deliveries, sell with customer details, take returns. */
export default function Retail() {
  const { actor, facilities } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [tab, setTab] = useState('incoming');
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || '');
  const incoming = useAsync(() => api(`/products?pending_to=${actor.id}&limit=500`), [actor.id]);
  const stock = useAsync(() => api(`/products?mine=1&status=in_stock&limit=500`), [actor.id]);
  const sales = useAsync(() => api('/sales'), []);
  const recalls = useAsync(() => api('/tickets?kind=recall&status=recall_notice'), []);
  const [sel, setSel] = useState(new Set());
  const [sell, setSell] = useState(null);
  const [ret, setRet] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const reloadAll = () => { incoming.reload(); stock.reload(); sales.reload(); recalls.reload(); };

  const receive = async () => {
    setBusy(true);
    try {
      const r = await api('/events', { method: 'POST', body: { type: 'ENTRY', product_ids: [...sel], facility_id: facilityId || undefined } });
      setResult(r);
      if (r.accepted.length) toast(`${r.accepted.length} unit(s) received into stock`);
      setSel(new Set());
      reloadAll();
    } finally {
      setBusy(false);
    }
  };

  const inc = incoming.data?.items || [];
  return (
    <>
      <PageHeader title="Retail desk" subtitle="Receive deliveries, sell to customers, and take back units with issues"
        actions={<>
          <select className="input w-56" value={facilityId} onChange={(e) => setFacilityId(e.target.value)}>{facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
          <Button variant="secondary" icon={RotateCcw} onClick={() => setRet(true)}>Customer return</Button>
        </>} />
      {recalls.data?.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
          <BellRing className="h-5 w-5 text-red-600" />
          <span className="flex-1 font-medium text-red-800">{recalls.data.length} recall notice(s): contact these customers and collect their units.</span>
          <Link to="/app/cases"><Button size="sm" variant="danger">Open recall cases</Button></Link>
        </div>
      )}
      <Card bodyClass="p-0">
        <div className="px-4 pt-2">
          <Tabs value={tab} onChange={setTab} tabs={[
            { id: 'incoming', label: 'Incoming deliveries', icon: Truck, count: inc.length },
            { id: 'stock', label: 'In stock · sell', icon: Store, count: stock.data?.items?.length },
            { id: 'sales', label: 'Customers', icon: Users, count: sales.data?.length },
          ]} />
        </div>
        {tab === 'incoming' && (incoming.loading && !incoming.data ? <Loading /> : inc.length === 0 ? <Empty icon={Truck} title="Nothing in transit to you" /> : (
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={sel.size === inc.length} onChange={() => setSel(sel.size === inc.length ? new Set() : new Set(inc.map((p) => p.id)))} /> Select all</label>
              <Button size="sm" icon={PackageCheck} loading={busy} disabled={!sel.size} onClick={receive}>Receive {sel.size || ''} into stock</Button>
            </div>
            <table className="w-full">
              <thead><tr><th className="table-head w-10" /><th className="table-head">Serial</th><th className="table-head">Product</th><th className="table-head">From</th><th className="table-head">Delivered</th></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {inc.map((p) => (
                  <tr key={p.id}>
                    <td className="table-cell"><input type="checkbox" checked={sel.has(p.id)} onChange={() => setSel((s) => { const n = new Set(s); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })} /></td>
                    <td className="table-cell mono">{p.id}</td>
                    <td className="table-cell">{p.name}{p.attributes?.open_ticket && <Badge tone="amber" className="ml-2">service return</Badge>}</td>
                    <td className="table-cell">{p.custodian_name}</td>
                    <td className="table-cell">{p.attributes?.delivered_at ? <Badge tone="brand">POD {timeAgo(p.attributes.delivered_at)}</Badge> : <span className="text-ink-400">in transit</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result && <div className="p-4"><EventResult result={result} /></div>}
          </div>
        ))}
        {tab === 'stock' && (stock.loading && !stock.data ? <Loading /> : (stock.data?.items || []).length === 0 ? <Empty icon={Store} title="No stock" /> : (
          <table className="w-full">
            <thead><tr><th className="table-head">Serial</th><th className="table-head">Product</th><th className="table-head">Status</th><th className="table-head" /></tr></thead>
            <tbody className="divide-y divide-ink-100">
              {stock.data.items.map((p) => (
                <tr key={p.id}>
                  <td className="table-cell"><Link to={`/app/products/${p.id}`} className="mono text-brand-700 hover:underline">{p.id}</Link></td>
                  <td className="table-cell">{p.name}</td>
                  <td className="table-cell"><StatusBadge status={p.status} /></td>
                  <td className="table-cell text-right"><Button size="sm" icon={ShoppingBag} onClick={() => setSell(p)}>Sell</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
        {tab === 'sales' && (sales.loading && !sales.data ? <Loading /> : (sales.data || []).length === 0 ? <Empty icon={Users} title="No sales yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th className="table-head">Customer</th><th className="table-head">Phone</th><th className="table-head">Serial</th><th className="table-head">Product</th><th className="table-head">Invoice</th><th className="table-head">Date</th><th className="table-head">On-chain ref</th></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {sales.data.map((s) => (
                  <tr key={s.id}>
                    <td className="table-cell font-medium text-ink-900">{s.customer_name || '—'}{s.replaces && <Badge tone="purple" className="ml-1">replacement</Badge>}</td>
                    <td className="table-cell">{s.customer_phone || '—'}</td>
                    <td className="table-cell"><Link to={`/app/products/${s.product_id}`} className="mono text-brand-700 hover:underline">{s.product_id}</Link></td>
                    <td className="table-cell">{s.product_name} <StatusBadge status={s.product_status} /></td>
                    <td className="table-cell">{s.invoice || '—'}</td>
                    <td className="table-cell text-ink-500">{fmtDateTime(s.created_at)}</td>
                    <td className="table-cell mono text-ink-400">{s.customer_ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-4 py-3 text-xs text-ink-500">Customer details stay off-chain for privacy. The ledger only stores the salted reference shown on the right.</p>
          </div>
        ))}
      </Card>
      {sell && <SellModal product={sell} facilityId={facilityId} onClose={() => setSell(null)} onDone={() => { setSell(null); reloadAll(); }} />}
      {ret && <ReturnModal facilityId={facilityId} onClose={() => setRet(false)} onDone={(r) => { setRet(false); reloadAll(); if (r.tickets?.[0]) nav(`/app/cases?id=${r.tickets[0]}`); }} />}
    </>
  );
}

function SellModal({ product, facilityId, onClose, onDone }) {
  const toast = useToast();
  const [f, setF] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const go = async () => {
    setBusy(true);
    setErr(null);
    try {
      const r = await api('/events', { method: 'POST', body: { type: 'SOLD', product_ids: [product.id], facility_id: facilityId || undefined, data: { invoice: f.invoice || undefined }, customer: { name: f.name, phone: f.phone || undefined, email: f.email || undefined, price: f.price ? Number(f.price) : undefined } } });
      if (!r.accepted.length) throw new Error(r.rejected[0]?.reason);
      toast(`Sold to ${f.name} · block #${r.block.height}`);
      onDone();
    } catch (e) {
      setErr(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title={`Sell ${product.name}`} subtitle={product.id} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={go} disabled={!f.name}>Record sale</Button></>}>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Customer name"><input className="input" value={f.name || ''} onChange={set('name')} /></Field>
          <Field label="Phone"><input className="input" value={f.phone || ''} onChange={set('phone')} /></Field>
          <Field label="Email"><input className="input" value={f.email || ''} onChange={set('email')} /></Field>
          <Field label="Price (₹)"><input className="input" type="number" value={f.price || ''} onChange={set('price')} /></Field>
        </div>
        <Field label="Invoice / prescription no."><input className="input" value={f.invoice || ''} onChange={set('invoice')} /></Field>
        <p className="text-xs text-ink-500">Stored off-chain. Warranty starts today and is recorded on the passport.</p>
        <ErrorBox error={err} />
      </div>
    </Modal>
  );
}

function ReturnModal({ facilityId, onClose, onDone }) {
  const toast = useToast();
  const [f, setF] = useState({ code: DEFECT_CODES[0] });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const go = async () => {
    setBusy(true);
    setErr(null);
    try {
      const r = await api('/events', { method: 'POST', body: { type: 'ISSUE_REPORTED', product_ids: [f.serial.trim().toUpperCase()], facility_id: facilityId || undefined, data: { code: f.code, description: f.description } } });
      if (!r.accepted.length) throw new Error(r.rejected[0]?.reason);
      toast(`Service case ${r.tickets[0]} opened`);
      onDone(r);
    } catch (e) {
      setErr(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Customer return (step 10)" subtitle="The customer brought a product back. Log the issue against its serial; the manufacturer is notified."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={go} disabled={!f.serial}>Open service case</Button></>}>
      <div className="space-y-3">
        <Field label="Serial no."><input className="input font-mono" value={f.serial || ''} onChange={set('serial')} placeholder="AAA12345678" /></Field>
        <Field label="Issue">
          <input className="input" list="ret-codes" value={f.code} onChange={set('code')} />
          <datalist id="ret-codes">{DEFECT_CODES.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="Customer's description"><textarea className="input" value={f.description || ''} onChange={set('description')} /></Field>
        <ErrorBox error={err} />
      </div>
    </Modal>
  );
}
