import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Smartphone, KeyRound, Webhook, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { createDeviceKey, deviceKey, forgetDeviceKey, signText } from '../lib/signing';
import { Badge, Button, ErrorBox, Field, Modal, useToast } from './ui';

export default function SecurityPanel({ onClose }) {
  const [error, setError] = useState(null);
  const run = (busy, fn) => async () => {
    busy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e);
    } finally {
      busy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Security" subtitle="Protect this account and prove that events really came from your company." footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
      <div className="space-y-5">
        <ErrorBox error={error} />
        <TwoFactor run={run} />
        <DeviceKeys run={run} />
        <Alerts run={run} />
      </div>
    </Modal>
  );
}

function Section({ icon: Icon, title, badge, children }) {
  return (
    <section className="rounded-xl border border-ink-200 p-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900"><Icon className="h-4 w-4 text-brand-700" />{title}{badge}</p>
      {children}
    </section>
  );
}

function TwoFactor({ run }) {
  const { actor, reload } = useAuth();
  const toast = useToast();
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const start = run(setBusy, async () => {
    const r = await api('/me/2fa/setup', { method: 'POST' });
    setSetup({ ...r, qr: await QRCode.toDataURL(r.otpauth_url, { margin: 1, width: 180 }) });
  });
  const enable = run(setBusy, async () => {
    await api('/me/2fa/enable', { method: 'POST', body: { code } });
    toast('Two-factor sign-in is on');
    setSetup(null);
    setCode('');
    await reload();
  });
  const disable = run(setBusy, async () => {
    await api('/me/2fa/disable', { method: 'POST', body: { password, code } });
    toast('Two-factor sign-in is off');
    setCode('');
    setPassword('');
    await reload();
  });
  if (!actor.username) return null;
  return (
    <Section icon={Smartphone} title="Two-factor sign-in" badge={actor.mfa ? <Badge tone="brand">On</Badge> : <Badge tone="gray">Off</Badge>}>
      {actor.mfa ? (
        <div className="space-y-2">
          <p className="text-sm text-ink-600">To turn it off, confirm with your password and a current code.</p>
          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <input className="input font-mono" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <Button variant="secondary" size="sm" loading={busy} disabled={!password || code.length !== 6} onClick={disable}>Turn off</Button>
        </div>
      ) : setup ? (
        <div className="space-y-2">
          <p className="text-sm text-ink-600">Scan this with Google Authenticator or a similar app, then enter the code it shows.</p>
          <img src={setup.qr} alt="Authenticator setup QR code" className="h-44 w-44 rounded-lg border border-ink-200" />
          <p className="break-all font-mono text-xs text-ink-600">{setup.secret}</p>
          <input className="input font-mono" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button size="sm" loading={busy} disabled={code.length !== 6} onClick={enable}>Confirm</Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-ink-600">Ask for a code from your phone as well as your password.</p>
          <Button size="sm" loading={busy} onClick={start}>Set up</Button>
        </div>
      )}
    </Section>
  );
}

function DeviceKeys({ run }) {
  const { actor, reload } = useAuth();
  const toast = useToast();
  const [local, setLocal] = useState(null);
  const [label, setLabel] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    deviceKey(actor.id).then((k) => setLocal(k || null));
  }, [actor.id]);
  const keys = actor.signing_keys || [];
  const here = keys.some((k) => k.public_key === local?.publicKey);

  const register = run(setBusy, async () => {
    if (!crypto.subtle) throw new Error('Device keys need a secure (https) page.');
    const key = local || await createDeviceKey(actor.id).catch(() => { throw new Error('This browser cannot create device keys. Update it and try again.'); });
    const proof = await signText(key, `geneatrace-key:${actor.id}:${key.publicKey}`);
    await api('/me/signing-keys', { method: 'POST', body: { public_key: key.publicKey, label: label || 'Device', proof, password: password || undefined } });
    setLocal(key);
    setPassword('');
    toast('This device now signs your events');
    await reload();
  });
  const revoke = (publicKey) => run(setBusy, async () => {
    await api('/me/signing-keys/revoke', { method: 'POST', body: { public_key: publicKey, password: password || undefined } });
    if (publicKey === local?.publicKey) {
      await forgetDeviceKey(actor.id);
      setLocal(null);
    }
    setPassword('');
    await reload();
  });

  return (
    <Section icon={KeyRound} title="Company device keys" badge={here ? <Badge tone="brand">This device signs</Badge> : null}>
      <p className="text-sm text-ink-600">Once a key is added, every event from your company must be signed on a registered device. The key never leaves that device, so even the server cannot act as you.</p>
      <p className="mt-1 text-xs text-amber-700">Add a key on every computer that records events, and keep at least two. Clearing browser data removes that device's key.</p>
      {keys.length > 0 && (
        <ul className="mt-2 divide-y divide-ink-100 text-sm">
          {keys.map((k) => (
            <li key={k.public_key} className="flex items-center justify-between gap-2 py-1.5">
              <span>{k.label}{k.public_key === local?.publicKey && ' (this device)'}</span>
              <button onClick={revoke(k.public_key)} disabled={busy || (!!actor.username && !password)} className="text-ink-400 hover:text-red-600 disabled:opacity-40" aria-label={`Remove ${k.label}`} title={actor.username && !password ? 'Enter your password below first' : 'Remove'}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input className="input" placeholder="Device name, e.g. Line 1" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} />
        {actor.username && <input className="input" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />}
      </div>
      {!here && <Button className="mt-2" size="sm" loading={busy} disabled={!!actor.username && !password} onClick={register}>Add this device</Button>}
    </Section>
  );
}

function Alerts({ run }) {
  const { actor, reload } = useAuth();
  const [url, setUrl] = useState(actor.webhook_url || '');
  const [secret, setSecret] = useState(null);
  const [busy, setBusy] = useState(false);
  const save = run(setBusy, async () => {
    const r = await api('/me/webhook', { method: 'POST', body: { url } });
    setSecret(r.secret);
    await reload();
  });
  return (
    <Section icon={Webhook} title="Alert webhook">
      <Field label="https address" hint="High and critical alerts are posted here, signed with the secret below">
        <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-system.example/geneatrace" />
      </Field>
      {secret && <p className="mt-2 break-all font-mono text-xs text-ink-600">Signing secret: {secret}</p>}
      <Button className="mt-2" variant="secondary" size="sm" loading={busy} onClick={save}>Save</Button>
    </Section>
  );
}
