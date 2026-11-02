import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { CATEGORY_META, STATUS_META, categoryMeta, timeAgo } from '../../lib/format';
import { Button, Card, Empty, ErrorBox, Loading, PageHeader, StatusBadge, useAsync } from '../../components/ui';

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const [q, setQ] = useState(sp.get('q') || '');
  const [limit, setLimit] = useState(100);
  const query = new URLSearchParams({ limit: String(limit) });
  for (const k of ['q', 'status', 'category', 'mine']) if (sp.get(k)) query.set(k, sp.get(k));
  const { data, loading, error } = useAsync(() => api(`/products?${query}`), [query.toString()]);
  const setParam = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v);
    else n.delete(k);
    setSp(n);
  };

  return (
    <>
      <PageHeader title="Product passports" subtitle="Every serialised unit on the ledger, with its live custody state" />
      <Card bodyClass="p-0">
        <div className="flex flex-col gap-2 border-b border-ink-100 p-3 md:flex-row">
          <form className="relative flex-1" onSubmit={(e) => { e.preventDefault(); setParam('q', q.trim()); }}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input className="input pl-9" placeholder="Search by ID, name, SKU or batch" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <select className="input md:w-44" value={sp.get('status') || ''} onChange={(e) => setParam('status', e.target.value)}>
            <option value="">All statuses</option>
            {Object.entries(STATUS_META).filter(([k]) => k !== 'active').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="input md:w-44" value={sp.get('category') || ''} onChange={(e) => setParam('category', e.target.value)}>
            <option value="">All categories</option>
            {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <label className="flex items-center gap-2 whitespace-nowrap px-2 text-sm text-ink-600">
            <input type="checkbox" checked={sp.get('mine') === '1'} onChange={(e) => setParam('mine', e.target.checked ? '1' : '')} /> In my custody
          </label>
        </div>
        {loading && !data ? <Loading /> : error ? <div className="p-4"><ErrorBox error={error} /></div> : data.items.length === 0 ? (
          <Empty icon={Package} title="No passports found" text="Try a different search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-50/60">
                <tr>
                  <th className="table-head">Passport ID</th><th className="table-head">Product</th><th className="table-head">Batch</th>
                  <th className="table-head">Status</th><th className="table-head">Custodian</th><th className="table-head">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.items.map((p) => {
                  const Icon = categoryMeta(p.category).icon;
                  return (
                    <tr key={p.id} className="cursor-pointer hover:bg-ink-50/70" onClick={() => nav(`/app/products/${p.id}`)}>
                      <td className="table-cell"><Link to={`/app/products/${p.id}`} className="mono font-medium text-brand-700 hover:underline" onClick={(e) => e.stopPropagation()}>{p.id}</Link></td>
                      <td className="table-cell"><span className="flex items-center gap-2"><Icon className="h-4 w-4 shrink-0 text-ink-400" /><span className="max-w-[260px] truncate">{p.name}</span></span></td>
                      <td className="table-cell mono">{p.batch_id}</td>
                      <td className="table-cell"><StatusBadge status={p.status} /></td>
                      <td className="table-cell">{p.pending_to ? <span className="text-sky-700">→ {p.pending_to_name}</span> : p.custodian_name || '—'}</td>
                      <td className="table-cell text-ink-500">{timeAgo(p.updated_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-sm text-ink-500">
              <span>Showing {data.items.length} of {data.total.toLocaleString()}</span>
              {data.items.length < data.total && <Button variant="secondary" size="sm" onClick={() => setLimit((l) => l + 100)} loading={loading}>Load more</Button>}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
