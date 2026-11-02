import { Link, useParams } from 'react-router-dom';
import { ExternalLink, MapPin, Factory, Boxes, Calendar, Printer, LifeBuoy } from 'lucide-react';
import { api } from '../../lib/api';
import { categoryMeta, fmtDate, ROLE_LABEL, humanize, TICKET_STATUS, INTERNAL_ATTRS } from '../../lib/format';
import { useAuth } from '../../lib/auth';
import { Badge, Button, Card, ErrorBox, Loading, PageHeader, StatusBadge, useAsync } from '../../components/ui';
import { QrImage, TrustRing } from '../../components/domain';
import PassportTabs from '../../components/PassportTabs';
import EventComposer from '../../components/EventComposer';
import { ProductionCard, PartsCard, DeviceCheckin } from '../../components/ProductionPanels';
import BacktracePanel from '../../components/Backtrace';

const HIDE = INTERNAL_ATTRS;

export default function ProductDetail() {
  const { id } = useParams();
  const { actor } = useAuth();
  const { data: p, loading, error, reload } = useAsync(() => api(`/products/${id}`), [id]);
  const issueCount = (p?.product?.attributes?.issues || []).filter((c) => c !== 'RECALL').length + (p?.product?.attributes?.defects || []).length;
  const bt = useAsync(() => (issueCount && ['manufacturer', 'admin', 'regulator'].includes(actor.role) ? api(`/products/${id}/backtrace`) : Promise.resolve(null)), [id, issueCount]);
  if (loading && !p) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const Icon = categoryMeta(p.product.category).icon;
  const attrs = Object.entries(p.product.attributes || {}).filter(([k, v]) => !HIDE.has(k) && v != null && typeof v !== 'object');

  return (
    <>
      <PageHeader
        eyebrow={<Link to="/app/products" className="hover:underline">Passports</Link>}
        title={p.product.name}
        subtitle={<span className="font-mono">{p.product.id}</span>}
        actions={<a href={`/v/${p.product.id}`} target="_blank" rel="noreferrer"><Button variant="secondary" icon={ExternalLink}>Public passport</Button></a>}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <TrustRing score={p.trust.score} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="gray"><Icon className="h-3 w-3" />{categoryMeta(p.product.category).label}</Badge>
                  <StatusBadge status={p.product.status} />
                  {!p.integrity.valid && <Badge tone="red">Integrity failure</Badge>}
                  {p.integrity.drift.length > 0 && <Badge tone="red">State drift</Badge>}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div><dt className="flex items-center gap-1 text-xs text-ink-500"><Factory className="h-3.5 w-3.5" />Maker</dt><dd className="mt-0.5 font-semibold">{p.manufacturer?.name}</dd></div>
                  <div><dt className="flex items-center gap-1 text-xs text-ink-500"><Boxes className="h-3.5 w-3.5" />Batch</dt><dd className="mt-0.5"><Link to={`/app/batches/${p.batch.id}`} className="font-mono text-[13px] font-semibold text-brand-700 hover:underline">{p.batch.id}</Link></dd></div>
                  <div><dt className="flex items-center gap-1 text-xs text-ink-500"><Calendar className="h-3.5 w-3.5" />Expiry</dt><dd className="mt-0.5 font-semibold">{p.batch.expiry_date ? fmtDate(p.batch.expiry_date) : 'n/a'}</dd></div>
                  <div><dt className="flex items-center gap-1 text-xs text-ink-500"><MapPin className="h-3.5 w-3.5" />Custodian</dt><dd className="mt-0.5 font-semibold">{p.pending_to ? `→ ${p.pending_to.name}` : p.custodian?.name}</dd></div>
                </dl>
                {attrs.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {attrs.map(([k, v]) => <span key={k} className="rounded-md bg-ink-100 px-2 py-0.5 text-xs text-ink-700"><span className="text-ink-500">{humanize(k)}:</span> {String(v)}</span>)}
                  </div>
                )}
              </div>
            </div>
          </Card>
          <ProductionCard production={p.production} />
          {bt.data && <Card title="Backtrace" subtitle="Issue → process → machine → affected units" icon={LifeBuoy}><BacktracePanel bt={bt.data} canRecall={actor.id === p.manufacturer?.id} onRecalled={reload} /></Card>}
          <PassportTabs passport={p} internal />
        </div>
        <div className="space-y-6">
          <Card title="Record event" subtitle="Signed with your key and sealed into the next block">
            <EventComposer productIds={[p.product.id]} onDone={() => reload()} compact />
          </Card>
          {p.tickets.length > 0 && (
            <Card title="Service cases" icon={LifeBuoy} bodyClass="divide-y divide-ink-100">
              {p.tickets.map((t) => (
                <Link key={t.id} to={`/app/cases?id=${t.id}`} className="flex items-center justify-between gap-2 px-5 py-2.5 text-sm hover:bg-ink-50">
                  <span><span className="font-mono text-xs">{t.id}</span> · {t.kind === 'recall' ? 'Recall' : t.code}</span>
                  <Badge tone={TICKET_STATUS[t.status]?.tone}>{TICKET_STATUS[t.status]?.label}</Badge>
                </Link>
              ))}
            </Card>
          )}
          <PartsCard parts={p.parts} />
          {p.product.category === 'electronics' && p.parts.length > 0 && ['sold', 'locked'].includes(p.product.status) && <DeviceCheckin productId={p.product.id} parts={p.parts} onDone={reload} />}
          <Card title="QR label" action={<Link to={`/app/batches/${p.batch.id}/labels?ids=${p.product.id}`}><Button variant="ghost" size="sm" icon={Printer}>Print</Button></Link>}>
            <div className="flex flex-col items-center text-center">
              <QrImage value={p.product.qr_url} size={168} />
              <p className="mt-2 font-mono text-xs text-ink-600">{p.product.id}</p>
              <p className="mt-1 text-[11px] text-ink-400">Encodes the passport URL + manufacturer signature</p>
            </div>
          </Card>
          {p.custodian?.role && (
            <Card title="Current holder">
              <p className="font-semibold">{p.custodian.name}</p>
              <p className="text-sm text-ink-500">{ROLE_LABEL[p.custodian.role]}</p>
              {p.facility && <p className="mt-2 text-sm text-ink-600">{p.facility.name}{p.facility.licensed ? '' : ' (unlicensed)'}</p>}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
