import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { fmtDateTime, humanize } from '../../lib/format';
import { Badge, Button, Card, cx, Empty, ErrorBox, Loading, PageHeader, SeverityBadge, useAsync, useToast } from '../../components/ui';

const SEV_BAR = { critical: 'bg-red-500', high: 'bg-amber-500', medium: 'bg-sky-500', low: 'bg-ink-300' };

export default function Alerts() {
  const { actor } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState('open');
  const [severity, setSeverity] = useState('');
  const { data, loading, error, reload } = useAsync(() => api(`/alerts?${new URLSearchParams({ ...(status && { status }), ...(severity && { severity }) })}`), [status, severity]);
  const canResolve = ['admin', 'regulator', 'manufacturer'].includes(actor.role);
  const resolve = async (a) => {
    const note = window.prompt('Resolution note (optional)') ?? null;
    if (note === null) return;
    await api(`/alerts/${a.id}/resolve`, { method: 'PATCH', body: { note } });
    toast('Alert resolved');
    reload();
  };
  const counts = (data || []).reduce((m, a) => ({ ...m, [a.severity]: (m[a.severity] || 0) + 1 }), {});

  return (
    <>
      <PageHeader title="Alerts" subtitle="Fraud, custody, cold-chain and defect signals raised automatically from ledger activity" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['open', 'resolved', ''].map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)} className={cx('rounded-lg px-3 py-1.5 text-sm font-medium', status === s ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50')}>{s ? humanize(s) : 'All'}</button>
        ))}
        <select className="input ml-auto w-40" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">All severities</option>
          {['critical', 'high', 'medium', 'low'].map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
        </select>
      </div>
      {data && (
        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          {['critical', 'high', 'medium', 'low'].map((s) => <span key={s} className="flex items-center gap-1.5 text-ink-600"><span className={cx('h-2 w-2 rounded-full', SEV_BAR[s])} />{humanize(s)}: <strong>{counts[s] || 0}</strong></span>)}
        </div>
      )}
      {loading && !data ? <Loading /> : error ? <ErrorBox error={error} /> : data.length === 0 ? <Card><Empty icon={Bell} title="No alerts" text="Nothing matches this filter." /></Card> : (
        <div className="space-y-2">
          {data.map((a) => (
            <div key={a.id} className="card flex overflow-hidden">
              <span className={cx('w-1 shrink-0', SEV_BAR[a.severity])} />
              <div className="flex flex-1 flex-col gap-2 p-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={a.severity} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">{humanize(a.type)}</span>
                    {a.status === 'resolved' && <Badge tone="brand"><CheckCircle2 className="h-3 w-3" />Resolved</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-ink-800">{a.message}</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                    <span>{fmtDateTime(a.created_at)}</span>
                    {a.product_id && <Link to={`/app/products/${a.product_id}`} className="font-mono text-brand-700 hover:underline">{a.product_id}</Link>}
                    {a.batch_id && <Link to={`/app/batches/${a.batch_id}`} className="font-mono text-brand-700 hover:underline">{a.batch_id}</Link>}
                    {a.details?.ids?.length > 1 && <span>{a.details.ids.length} units</span>}
                    {a.details?.lat != null && <span className="font-mono">{Number(a.details.lat).toFixed(3)}, {Number(a.details.lng).toFixed(3)}</span>}
                    {a.details?.resolution && <span>Resolution: {a.details.resolution}</span>}
                  </div>
                </div>
                {canResolve && a.status === 'open' && <Button variant="secondary" size="sm" onClick={() => resolve(a)}>Resolve</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
