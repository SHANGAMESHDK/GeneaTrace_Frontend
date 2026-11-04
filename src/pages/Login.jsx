import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { publicApi } from '../lib/api';
import { ROLE_LABEL } from '../lib/format';
import { Logo } from '../components/domain';
import { Button, ErrorBox, Field } from '../components/ui';

export default function Login() {
  const { login, loginWithPassword, actor } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [code, setCode] = useState('');
  const [needCode, setNeedCode] = useState(false);
  const [key, setKey] = useState('');
  const [demo, setDemo] = useState([]);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (actor) nav('/app', { replace: true });
  }, [actor, nav]);
  useEffect(() => {
    publicApi('/demo-accounts').then(setDemo).catch(() => {});
  }, []);

  const run = async (id, fn) => {
    setBusy(id);
    setError(null);
    try {
      await fn();
      nav('/app');
    } catch (e) {
      if (e.details?.mfa_required) setNeedCode(true);
      setError(e);
    } finally {
      setBusy(null);
    }
  };
  const signIn = (u, p, c) => run(u, () => loginWithPassword(u, p, c));

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink-950 p-10 text-white lg:flex">
        <Link to="/"><Logo light /></Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">Every signature you make<br />is permanent.</h2>
          <p className="mt-3 max-w-md text-ink-300">Each event you record is signed with your organisation's on-chain key, sealed into a block and anchored on Ethereum. It can be audited, but never edited.</p>
        </div>
        <p className="text-xs text-ink-500">Permissioned consortium ledger · Supabase · Ethereum</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden"><Logo /></div>
          <h1 className="mt-6 text-2xl font-bold">Partner sign in</h1>
          <p className="mt-1 text-sm text-ink-500">Use the username and password from your network administrator.</p>

          {mode === 'password' ? (
            <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); signIn(username, password, code); }}>
              <Field label="Username"><input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus /></Field>
              <Field label="Password">
                <div className="relative">
                  <input className="input pr-10" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" aria-label={show ? 'Hide password' : 'Show password'}>
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              {needCode && <Field label="Authenticator code"><input className="input font-mono" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" autoFocus /></Field>}
              <ErrorBox error={error} />
              <Button type="submit" icon={LogIn} className="w-full" loading={busy === username && !!username} disabled={!username || !password}>Sign in</Button>
              <button type="button" onClick={() => { setMode('key'); setError(null); }} className="w-full text-center text-xs font-medium text-ink-500 hover:text-ink-800">Sign in with an API key instead</button>
            </form>
          ) : (
            <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); run('key', () => login(key)); }}>
              <Field label="API key" hint="For integrations and scanners"><input className="input font-mono" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="gt_…" autoComplete="off" /></Field>
              <ErrorBox error={error} />
              <Button type="submit" icon={KeyRound} className="w-full" loading={busy === 'key'} disabled={!key}>Sign in with key</Button>
              <button type="button" onClick={() => { setMode('password'); setError(null); }} className="w-full text-center text-xs font-medium text-ink-500 hover:text-ink-800">Use username and password</button>
            </form>
          )}

          {demo.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Demo logins: click to sign in</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {demo.map((d) => (
                  <button key={d.id} onClick={() => signIn(d.username, d.password)} disabled={!!busy} className="group flex items-center justify-between rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-left transition hover:border-brand-400 hover:shadow-sm disabled:opacity-60">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink-900">{d.name}</span>
                      <span className="block text-xs text-ink-500">{ROLE_LABEL[d.role]}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-ink-600">{d.username} · {d.password}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-300 group-hover:text-brand-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
