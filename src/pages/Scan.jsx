import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Scanner, { parseScan } from '../components/Scanner';
import { Logo } from '../components/domain';
import { Button } from '../components/ui';

export default function Scan() {
  const nav = useNavigate();
  const [id, setId] = useState('');
  const open = (text) => {
    const p = parseScan(text);
    if (p.id) nav(`/v/${p.id}${p.s ? `?s=${encodeURIComponent(p.s)}` : ''}`);
  };
  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <header className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
        <Link to="/"><Logo light /></Link>
      </header>
      <main className="mx-auto max-w-md px-4 pb-10">
        <h1 className="text-2xl font-bold">Verify a product</h1>
        <p className="mt-1 text-sm text-ink-300">Point your camera at the GeneaTrace QR on the pack.</p>
        <div className="mt-5"><Scanner onScan={open} height={320} /></div>
        <form onSubmit={(e) => { e.preventDefault(); open(id); }} className="mt-5 space-y-2">
          <label className="text-xs font-medium text-ink-300">Or type the passport ID</label>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="GT-XXXXX-XXXXX" value={id} onChange={(e) => setId(e.target.value)} />
            <Button type="submit" icon={ShieldCheck}>Verify</Button>
          </div>
        </form>
        <p className="mt-6 text-xs text-ink-400">Your approximate location (if you allow it) helps detect cloned labels. No personal data is stored.</p>
      </main>
    </div>
  );
}
