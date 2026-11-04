import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Scanner, { parseScan } from '../components/Scanner';
import { Logo } from '../components/domain';
import { Button } from '../components/ui';
import { LangPicker, useLang } from '../lib/i18n';

export default function Scan() {
  const nav = useNavigate();
  const [id, setId] = useState('');
  const { lang, choose, t } = useLang();
  const open = (text) => {
    const p = parseScan(text);
    if (p.id) nav(`/v/${p.id}${p.s ? `?s=${encodeURIComponent(p.s)}` : ''}`);
  };
  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <header className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
        <Link to="/"><Logo light /></Link>
        <LangPicker lang={lang} choose={choose} className="rounded-lg bg-white/10 px-2 py-1 text-sm text-white [&>option]:text-ink-900" />
      </header>
      <main className="mx-auto max-w-md px-4 pb-10">
        <h1 className="text-2xl font-bold">{t.verifyTitle}</h1>
        <p className="mt-1 text-sm text-ink-300">{t.verifyHint}</p>
        <div className="mt-5"><Scanner onScan={open} height={320} /></div>
        <form onSubmit={(e) => { e.preventDefault(); open(id); }} className="mt-5 space-y-2">
          <label className="text-xs font-medium text-ink-300">{t.typeId}</label>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="GT-XXXXX-XXXXX" value={id} onChange={(e) => setId(e.target.value)} />
            <Button type="submit" icon={ShieldCheck}>{t.verify}</Button>
          </div>
        </form>
        <p className="mt-6 text-xs text-ink-400">{t.locationNote}</p>
      </main>
    </div>
  );
}
