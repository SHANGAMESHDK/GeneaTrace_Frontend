import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ScanLine, ShieldCheck, Blocks, LogIn, LogOut, GitBranch, BadgeCheck, Thermometer, Copy, Pill, Smartphone, ArrowRight, Fingerprint, Landmark, ChevronRight,
} from 'lucide-react';
import { publicApi } from '../lib/api';
import { Logo } from '../components/domain';
import { Button } from '../components/ui';
import { parseScan } from '../components/Scanner';

const FEATURES = [
  { icon: Fingerprint, title: 'Signed QR passport', text: 'Every unit gets a random, unguessable ID signed with the manufacturer’s Ed25519 key. Fake or edited labels fail instantly.' },
  { icon: LogOut, title: 'Every entry & exit on-chain', text: 'Custody moves only through EXIT → ENTRY pairs between registered parties. Wrong receiver, unknown site or missing hand-off is rejected and alerted.' },
  { icon: Blocks, title: 'Anchored on Ethereum', text: 'Every block of the ledger is hash-linked, Merkle-rooted and signed in Supabase, and its fingerprint is written to an Ethereum smart contract that nobody can rewrite.' },
  { icon: Copy, title: 'Clone detection', text: 'The same label scanned 250 km apart within hours, or by too many phones after sale, is flagged as a cloned label.' },
  { icon: GitBranch, title: 'Component genealogy', text: 'Units link to the exact component lots inside them. Trace any defect back to a supplier lot and forward to every affected unit.' },
  { icon: BadgeCheck, title: 'Transparent warranty programs', text: 'Replacement programs with machine-checked criteria. Consumers see exactly why they are or are not eligible.' },
  { icon: Thermometer, title: 'Cold-chain & expiry guard', text: 'Temperature excursions, expired stock and recalled units are blocked at the point of sale, not discovered later.' },
  { icon: Landmark, title: 'Regulator console', text: 'Licensing on-chain. Unlicensed facilities, relabelling attempts and counterfeit hotspots surface as live alerts.' },
];

export default function Landing() {
  const nav = useNavigate();
  const [id, setId] = useState('');
  const [health, setHealth] = useState(null);
  useEffect(() => {
    publicApi('/health').then(setHealth).catch(() => {});
  }, []);
  const go = (e) => {
    e.preventDefault();
    if (!id.trim()) return;
    const p = parseScan(id);
    nav(`/v/${p.id}${p.s ? `?s=${encodeURIComponent(p.s)}` : ''}`);
  };

  return (
    <div className="bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link to="/scan" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 sm:block">Verify a product</Link>
          <Link to="/login"><Button variant="dark" size="sm" icon={LogIn}>Partner sign in</Button></Link>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(16,185,140,0.14),transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Ledger live{health?.tip ? ` · block #${health.tip.height}` : ''}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink-950 sm:text-6xl">
              A product passport<br />for <span className="text-brand-600">everything.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-600">
              GeneaTrace records every unit, from medicine vials to smartphones, on a tamper-evident ledger: who made it, what it is made of, and every entry and exit on its way to you.
            </p>
            <form onSubmit={go} className="mx-auto mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border border-ink-200 bg-white p-2 shadow-lg sm:flex-row">
              <input className="flex-1 rounded-xl px-4 py-3 text-base outline-none placeholder:text-ink-400" placeholder="Enter passport ID, e.g. GT-7KQ2M-X9PDA" value={id} onChange={(e) => setId(e.target.value)} />
              <Button type="submit" size="lg" icon={ShieldCheck}>Verify</Button>
            </form>
            <Link to="/scan" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"><ScanLine className="h-4 w-4" /> or scan the QR code with your camera</Link>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-100 bg-ink-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-ink-500">Built for the failures in the news</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <div className="flex items-center gap-3"><span className="rounded-lg bg-red-50 p-2"><Pill className="h-5 w-5 text-red-600" /></span><h3 className="font-semibold">Counterfeit antibiotics in the supply chain</h3></div>
              <p className="mt-3 text-sm text-ink-600">Generic drugs relabelled as branded antibiotics at an unauthorised site, with fake batch details and QR codes that do not work, reaching hospitals.</p>
              <ul className="mt-4 space-y-2 text-sm text-ink-700">
                <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />Signed QR on every vial: relabelled stock has no valid signature</li>
                <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />Entry into an unlicensed site auto-flags units and alerts the regulator</li>
                <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />Hospitals receiving unminted IDs are blocked at intake</li>
                <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />Counterfeit scans are mapped, pointing raids to the source</li>
              </ul>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3"><span className="rounded-lg bg-violet-50 p-2"><Smartphone className="h-5 w-5 text-violet-600" /></span><h3 className="font-semibold">AMOLED “green line” display defects</h3></div>
              <p className="mt-3 text-sm text-ink-600">Vertical lines appearing on phone displays, sometimes after updates, with unclear root cause and eligibility rules for free replacements.</p>
              <ul className="mt-4 space-y-2 text-sm text-ink-700">
                <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />Each phone links to its exact display panel lot</li>
                <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />Defect reports cluster by lot and firmware: root cause in data, not guesswork</li>
                <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />Replacement programs with on-chain, explainable eligibility</li>
                <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />Service history and damage records cannot be rewritten later</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">One passport, the whole life of a product</h2>
          <p className="mt-3 text-ink-600">Manufacturers, distributors, pharmacies, retailers, service centres and regulators each sign what they did. Nobody, not even the platform operator, can quietly rewrite it.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-ink-200 p-5">
              <f.icon className="h-5 w-5 text-brand-600" />
              <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-950">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Run your supply chain on GeneaTrace</h2>
            <p className="mt-2 text-ink-300">Mint passports, record entry and exit at every gate, and watch fraud surface in real time.</p>
          </div>
          <Link to="/login"><Button size="lg" icon={ArrowRight}>Open the console</Button></Link>
        </div>
      </section>
      <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-ink-500 sm:flex-row sm:justify-between sm:px-6">
        <span>© {new Date().getFullYear()} GeneaTrace · Product passports for everything</span>
        <span className="flex items-center gap-1"><LogIn className="h-3 w-3" /> SHA-256 · Ed25519 · Merkle · Ethereum · Supabase Postgres</span>
      </footer>
    </div>
  );
}
