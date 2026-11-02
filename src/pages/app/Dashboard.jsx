import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Tooltip as MapTip } from 'react-leaflet';
import { Package, Blocks, Activity, Bell, ScanLine, ShieldAlert, ArrowRight, Boxes, Users } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { fmtDateTime, humanize, ROLE_LABEL, STATUS_META, timeAgo } from '../../lib/format';
import { Card, ErrorBox, Hash, Loading, PageHeader, SeverityBadge, Stat, useAsync, Empty } from '../../components/ui';

const STATUS_COLORS = { in_stock: '#059673', in_transit: '#0284c7', sold: '#8791a7', recalled: '#dc2626', flagged: '#f43f5e', quarantined: '#d97706', retired: '#b1b8c7' };
const VERDICT_COLORS = { GENUINE: '#059673', COUNTERFEIT: '#dc2626', SUSPECTED_CLONE: '#f43f5e', RECALLED: '#ea580c', EXPIRED: '#d97706', SUSPICIOUS: '#f59e0b', TAMPERED: '#7f1d1d' };

export default function Dashboard() {
  const { actor } = useAuth();
  const { data, loading, error } = useAsync(() => api('/analytics/overview'), []);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const t = data.totals;
  const statusData = Object.entries(data.by_status).map(([k, v]) => ({ name: STATUS_META[k]?.label || k, key: k, value: v }));
  const verdictData = Object.entries(data.verdicts).map(([k, v]) => ({ name: humanize(k), key: k, value: v }));
  const threats = Object.entries(data.verdicts).filter(([k]) => k !== 'GENUINE').reduce((a, [, v]) => a + v, 0);

  return (
    <>
      <PageHeader title={`Welcome, ${actor.name}`} subtitle={`${ROLE_LABEL[actor.role]} console · live view of the GeneaTrace ledger`} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Passports" value={t.products.toLocaleString()} icon={Package} hint={`${t.batches} batches`} />
        <Stat label="Blocks" value={t.blocks.toLocaleString()} icon={Blocks} tone="purple" hint={`${t.events.toLocaleString()} signed events`} />
        <Stat label="Network" value={t.actors} icon={Users} tone="blue" hint={`${t.facilities} facilities`} />
        <Stat label="Consumer scans" value={t.scans.toLocaleString()} icon={ScanLine} tone="gray" hint={`${threats} threats caught (60d)`} />
        <Stat label="Open alerts" value={t.open_alerts} icon={Bell} tone={t.open_alerts ? 'red' : 'brand'} hint="needs attention" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Supply-chain activity" subtitle="Entries, exits and threat scans over the last 60 days" className="lg:col-span-2" icon={Activity}>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={data.activity} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gEntry" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0284c7" stopOpacity={0.25} /><stop offset="100%" stopColor="#0284c7" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gExit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d97706" stopOpacity={0.25} /><stop offset="100%" stopColor="#d97706" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
                <XAxis dataKey="day" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 11, fill: '#8791a7' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8791a7' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="events" name="All events" stroke="#8791a7" fill="none" strokeWidth={1.5} strokeDasharray="4 3" />
                <Area type="monotone" dataKey="entries" name="Entries" stroke="#0284c7" fill="url(#gEntry)" strokeWidth={2} />
                <Area type="monotone" dataKey="exits" name="Exits" stroke="#d97706" fill="url(#gExit)" strokeWidth={2} />
                <Area type="monotone" dataKey="threats" name="Threat scans" stroke="#dc2626" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Passports by status" icon={Boxes}>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={statusData} layout="vertical" margin={{ left: 10, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12, fill: '#535c72' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} cursor={{ fill: '#f6f7f9' }} />
                <Bar dataKey="value" name="Units" radius={[0, 4, 4, 0]} barSize={16}>
                  {statusData.map((s) => <Cell key={s.key} fill={STATUS_COLORS[s.key] || '#059673'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Counterfeit & clone hotspots" subtitle="Non-genuine consumer scans, last 60 days" className="lg:col-span-2" icon={ShieldAlert} bodyClass="p-3">
          {data.hotspots.length ? (
            <div className="h-72 overflow-hidden rounded-lg">
              <MapContainer center={[data.hotspots[0].lat, data.hotspots[0].lng]} zoom={8} scrollWheelZoom={false} style={{ height: '100%' }}>
                <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {data.hotspots.map((h, i) => (
                  <CircleMarker key={i} center={[h.lat, h.lng]} radius={10} pathOptions={{ color: VERDICT_COLORS[h.verdict] || '#dc2626', fillOpacity: 0.45 }}>
                    <MapTip>{humanize(h.verdict)} · {h.claimed_id}<br />{fmtDateTime(h.created_at)}</MapTip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          ) : <Empty icon={ShieldAlert} title="No threats detected" text="Counterfeit and clone scans will appear here." />}
          <div className="mt-3 flex flex-wrap gap-3 px-2 text-xs">
            {verdictData.map((v) => (
              <span key={v.key} className="flex items-center gap-1.5 text-ink-600"><span className="h-2 w-2 rounded-full" style={{ background: VERDICT_COLORS[v.key] }} />{v.name}: <strong>{v.value}</strong></span>
            ))}
          </div>
        </Card>
        <Card title="Latest alerts" icon={Bell} action={<Link to="/app/alerts" className="text-xs font-medium text-brand-700 hover:underline">View all</Link>} bodyClass="divide-y divide-ink-100">
          {data.recent_alerts.length === 0 && <Empty icon={Bell} title="All clear" />}
          {data.recent_alerts.map((a) => (
            <div key={a.id} className="px-5 py-3">
              <div className="flex items-center gap-2"><SeverityBadge severity={a.severity} /><span className="text-[11px] font-semibold text-ink-500">{humanize(a.type)}</span><span className="ml-auto text-[11px] text-ink-400">{timeAgo(a.created_at)}</span></div>
              <p className="mt-1 line-clamp-2 text-sm text-ink-700">{a.message}</p>
            </div>
          ))}
        </Card>
      </div>

      <Card title="Latest blocks" className="mt-6" icon={Blocks} action={<Link to="/app/explorer" className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">Explorer <ArrowRight className="h-3 w-3" /></Link>} bodyClass="overflow-x-auto">
        <table className="w-full">
          <thead><tr><th className="table-head">Height</th><th className="table-head">Hash</th><th className="table-head">Transactions</th><th className="table-head">Sealed</th></tr></thead>
          <tbody className="divide-y divide-ink-100">
            {data.recent_blocks.map((b) => (
              <tr key={b.height}>
                <td className="table-cell font-semibold">#{b.height}</td>
                <td className="table-cell"><Hash value={b.hash} len={16} /></td>
                <td className="table-cell">{b.tx_count}</td>
                <td className="table-cell text-ink-500">{fmtDateTime(b.ts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
