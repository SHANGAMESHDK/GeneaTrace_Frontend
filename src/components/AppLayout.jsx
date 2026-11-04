import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Boxes, ScanLine, Bell, LineChart, Blocks, Network, LogOut, Menu, X, ShieldCheck, Search, ExternalLink, Cog, Store, LifeBuoy, KeyRound } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { api, publicApi } from '../lib/api';
import { ROLE_LABEL } from '../lib/format';
import { Logo, ethStatus } from './domain';
import { cx, Button, ErrorBox, Field, Modal, useToast } from './ui';
import SecurityPanel from './SecurityPanel';

// roles: who sees the item (omitted = everyone)
const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/products', label: 'Passports', icon: Package },
  { to: '/app/batches', label: 'Batches', icon: Boxes },
  { to: '/scanner', label: 'Process scanner', icon: Cog, roles: ['manufacturer', 'admin'] },
  { to: '/app/checkpoint', label: 'Logistics gate', icon: ScanLine, roles: ['manufacturer', 'distributor', 'logistics', 'retailer', 'pharmacy', 'hospital', 'service_center', 'regulator', 'admin'] },
  { to: '/app/retail', label: 'Retail desk', icon: Store, roles: ['retailer', 'pharmacy', 'hospital', 'admin'] },
  { to: '/app/cases', label: 'Service & recalls', icon: LifeBuoy, roles: ['manufacturer', 'retailer', 'pharmacy', 'hospital', 'service_center', 'regulator', 'admin'] },
  { to: '/app/alerts', label: 'Alerts', icon: Bell, badge: true },
  { to: '/app/insights', label: 'Defects & warranty', icon: LineChart },
  { to: '/app/explorer', label: 'Ledger explorer', icon: Blocks },
  { to: '/app/network', label: 'Network', icon: Network },
];

export default function AppLayout() {
  const { actor, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [openAlerts, setOpenAlerts] = useState(0);
  const [tip, setTip] = useState(null);
  const [q, setQ] = useState('');
  const [pw, setPw] = useState(false);
  const [security, setSecurity] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    const poll = () => {
      api('/alerts?status=open&limit=1000').then((a) => setOpenAlerts(a.length)).catch(() => {});
      publicApi('/health').then((h) => setTip(h)).catch(() => {});
    };
    poll();
    const t = setInterval(poll, 15000);
    return () => clearInterval(t);
  }, [loc.pathname]);

  const search = (e) => {
    e.preventDefault();
    const v = q.trim().toUpperCase();
    if (!v) return;
    nav(/^[A-Z0-9-]{6,}\d{6,}$/.test(v) || v.startsWith('GT-') ? `/app/products/${v}` : `/app/products?q=${encodeURIComponent(q.trim())}`);
    setQ('');
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-ink-950 text-ink-300">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo light />
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.filter((n) => !n.roles || n.roles.includes(actor.role)).map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => cx('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white')}
          >
            <n.icon className="h-4 w-4" />
            <span className="flex-1">{n.label}</span>
            {n.badge && openAlerts > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{openAlerts}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="m-3 rounded-xl bg-white/5 p-3 text-xs">
        <div className="flex items-center gap-2 text-ink-200">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" /></span>
          Ledger live · {tip?.store === 'supabase' ? 'Supabase' : 'local store'}
        </div>
        <div className="mt-1 font-mono text-ink-400">height #{tip?.tip?.height ?? '…'}</div>
        {tip?.ethereum?.enabled && (
          <div className="mt-2 border-t border-white/10 pt-2" title={tip.ethereum.last_error || ''}>
            <div className={tip.ethereum.status === 'synced' ? 'text-brand-300' : ['unreachable', 'no_contract', 'not_owner', 'ahead'].includes(tip.ethereum.status) ? 'text-amber-300' : 'text-sky-300'}>◆ {ethStatus(tip.ethereum.status).label}</div>
            <div className="mt-0.5 text-ink-400">{tip.ethereum.network} · {tip.ethereum.anchored} anchored</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72">{sidebar}</aside>
        </div>
      )}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/85 px-4 backdrop-blur sm:px-6">
        <button className="rounded-lg p-1.5 text-ink-600 hover:bg-ink-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <form onSubmit={search} className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search serial (e.g. AAA12345678), product or batch…" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <a href="/scan" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900 md:flex">
          <ShieldCheck className="h-4 w-4" /> Consumer verify <ExternalLink className="h-3 w-3" />
        </a>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden max-w-[220px] text-right sm:block">
            <div className="truncate text-sm font-semibold leading-tight text-ink-900">{actor.name}</div>
            <div className="text-xs text-ink-500">{ROLE_LABEL[actor.role]} · <span className="font-mono">{actor.id}</span></div>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">{actor.name.slice(0, 1)}</span>
          <button onClick={() => setSecurity(true)} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800" title="Security" aria-label="Security">
            <ShieldCheck className="h-4 w-4" />
          </button>
          {actor.username && (
            <button onClick={() => setPw(true)} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800" title="Change password" aria-label="Change password">
              <KeyRound className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => { logout(); nav('/login'); }} className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800" title="Sign out" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      {pw && <ChangePassword onClose={() => setPw(false)} />}
      {security && <SecurityPanel onClose={() => setSecurity(false)} />}
    </div>
  );
}

function ChangePassword({ onClose }) {
  const toast = useToast();
  const [f, setF] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const submit = async () => {
    if (f.next !== f.confirm) return setError(new Error('The new passwords do not match'));
    setBusy(true);
    setError(null);
    try {
      await api('/me/password', { method: 'POST', body: { current: f.current, next: f.next } });
      toast('Password changed. Please sign in again.');
      setTimeout(() => location.assign('/login'), 800);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Change password" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={submit} disabled={!f.current || f.next.length < 8}>Change</Button></>}>
      <div className="space-y-3">
        <Field label="Current password"><input className="input" type="password" value={f.current} onChange={set('current')} autoComplete="current-password" /></Field>
        <Field label="New password" hint="At least 8 characters"><input className="input" type="password" value={f.next} onChange={set('next')} autoComplete="new-password" /></Field>
        <Field label="Repeat new password"><input className="input" type="password" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" /></Field>
        <ErrorBox error={error} />
      </div>
    </Modal>
  );
}
