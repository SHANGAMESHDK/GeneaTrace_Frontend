import { useState } from 'react';
import { Users, Building2, Plus, KeyRound, ShieldCheck, ShieldOff, Copy, Cog } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { fmtDate, humanize, ROLE_LABEL } from '../../lib/format';
import { Badge, Button, Card, ErrorBox, Field, Hash, Loading, Modal, PageHeader, Tabs, useAsync, useToast } from '../../components/ui';

export default function Network() {
  const { actor, meta, reload: reloadMe } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('actors');
  const actors = useAsync(() => api('/actors'), []);
  const facilities = useAsync(() => api('/facilities'), []);
  const [newActor, setNewActor] = useState(false);
  const [creds, setCreds] = useState(null);
  const [newFacility, setNewFacility] = useState(false);
  const machines = useAsync(() => api('/machines'), []);
  const [newMachine, setNewMachine] = useState(false);
  const names = new Map((actors.data || []).map((a) => [a.id, a.name]));
  const isRegulator = ['admin', 'regulator'].includes(actor.role);

  const toggleLicense = async (f) => {
    const reason = window.prompt(f.licensed ? 'Reason for revoking the license' : 'Reason for granting the license');
    if (reason === null) return;
    await api(`/facilities/${f.id}/license`, { method: 'PATCH', body: { licensed: !f.licensed, reason } });
    toast(`License ${f.licensed ? 'revoked' : 'granted'} for ${f.name} (recorded on-chain)`);
    facilities.reload();
  };
  const toggleActor = async (a) => {
    await api(`/actors/${a.id}/status`, { method: 'PATCH', body: { status: a.status === 'active' ? 'suspended' : 'active' } });
    actors.reload();
  };

  return (
    <>
      <PageHeader title="Network" subtitle="Registered members and facilities. Registrations and licenses are recorded on-chain."
        actions={<>
          {actor.role === 'admin' && <Button icon={Plus} onClick={() => setNewActor(true)}>Add member</Button>}
          <Button variant="secondary" icon={Building2} onClick={() => setNewFacility(true)}>Register facility</Button>
          {['manufacturer', 'admin'].includes(actor.role) && <Button variant="secondary" icon={Cog} onClick={() => setNewMachine(true)}>Add machine</Button>}
        </>} />
      <Card bodyClass="p-0">
        <div className="px-4 pt-2"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'actors', label: 'Members', icon: Users, count: actors.data?.length }, { id: 'facilities', label: 'Facilities', icon: Building2, count: facilities.data?.length }, { id: 'machines', label: 'Machines', icon: Cog, count: machines.data?.length }]} /></div>
        {tab === 'actors' && (actors.loading && !actors.data ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th className="table-head">Member</th><th className="table-head">Role</th><th className="table-head">Username</th><th className="table-head">ID</th><th className="table-head">Signing key</th><th className="table-head">Joined</th><th className="table-head">Status</th>{actor.role === 'admin' && <th className="table-head" />}</tr></thead>
              <tbody className="divide-y divide-ink-100">
                {actors.data.map((a) => (
                  <tr key={a.id}>
                    <td className="table-cell"><span className="font-medium text-ink-900">{a.name}</span>{a.org && <><br /><span className="text-xs text-ink-500">{a.org}</span></>}</td>
                    <td className="table-cell"><Badge tone="gray">{ROLE_LABEL[a.role]}</Badge></td>
                    <td className="table-cell mono">{a.username || <span className="text-ink-300">—</span>}</td>
                    <td className="table-cell mono">{a.id}</td>
                    <td className="table-cell"><Hash value={a.public_key} len={12} /></td>
                    <td className="table-cell text-ink-500">{fmtDate(a.created_at)}</td>
                    <td className="table-cell"><Badge tone={a.status === 'active' ? 'brand' : 'red'}>{a.status}</Badge></td>
                    {actor.role === 'admin' && (
                      <td className="table-cell whitespace-nowrap text-right">
                        {a.id !== 'ACT-ADMIN' && <Button variant="ghost" size="sm" onClick={() => setCreds(a)}>{a.username ? 'Reset password' : 'Create login'}</Button>}
                        {a.id !== 'ACT-ADMIN' && <Button variant="ghost" size="sm" onClick={() => toggleActor(a)}>{a.status === 'active' ? 'Suspend' : 'Reactivate'}</Button>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {tab === 'machines' && (machines.loading && !machines.data ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th className="table-head">Machine ID</th><th className="table-head">Name</th><th className="table-head">Facility</th><th className="table-head">Owner</th><th className="table-head">Qualified processes</th></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {machines.data.map((m) => (
                  <tr key={m.id}>
                    <td className="table-cell mono font-semibold">{m.id}</td>
                    <td className="table-cell">{m.name}</td>
                    <td className="table-cell">{(facilities.data || []).find((f) => f.id === m.facility_id)?.name || m.facility_id}</td>
                    <td className="table-cell">{names.get(m.actor_id)}</td>
                    <td className="table-cell"><div className="flex flex-wrap gap-1">{m.processes.map((p) => <Badge key={p} tone="blue">{p}</Badge>)}</div></td>
                  </tr>
                ))}
                {machines.data.length === 0 && <tr><td colSpan={5} className="table-cell text-ink-500">No machines registered.</td></tr>}
              </tbody>
            </table>
          </div>
        ))}
        {tab === 'facilities' && (facilities.loading && !facilities.data ? <Loading /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th className="table-head">Facility</th><th className="table-head">Type</th><th className="table-head">Operator</th><th className="table-head">Location</th><th className="table-head">License</th>{isRegulator && <th className="table-head" />}</tr></thead>
              <tbody className="divide-y divide-ink-100">
                {facilities.data.map((f) => (
                  <tr key={f.id}>
                    <td className="table-cell"><span className="font-medium text-ink-900">{f.name}</span><br /><span className="mono text-ink-400">{f.id}</span></td>
                    <td className="table-cell">{humanize(f.type)}</td>
                    <td className="table-cell">{names.get(f.actor_id) || f.actor_id}</td>
                    <td className="table-cell">{f.city || '—'}{f.lat != null && <><br /><span className="mono text-ink-400">{f.lat.toFixed(3)}, {f.lng.toFixed(3)}</span></>}</td>
                    <td className="table-cell">{f.licensed ? <Badge tone="brand"><ShieldCheck className="h-3 w-3" />Licensed</Badge> : <Badge tone="red"><ShieldOff className="h-3 w-3" />Unlicensed</Badge>}{f.license_no && <><br /><span className="mono text-ink-400">{f.license_no}</span></>}</td>
                    {isRegulator && <td className="table-cell text-right"><Button variant={f.licensed ? 'ghost' : 'secondary'} size="sm" onClick={() => toggleLicense(f)}>{f.licensed ? 'Revoke' : 'Grant license'}</Button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </Card>
      {newMachine && <MachineModal facilities={(facilities.data || []).filter((f) => f.actor_id === actor.id || actor.role === 'admin')} onClose={() => setNewMachine(false)} onDone={() => { setNewMachine(false); machines.reload(); }} />}
      {creds && <CredentialsModal member={creds} onClose={() => { setCreds(null); actors.reload(); }} />}
      {newActor && <ActorModal roles={meta.roles.filter((r) => r !== 'admin')} onClose={() => setNewActor(false)} onDone={() => actors.reload()} />}
      {newFacility && <FacilityModal types={meta.facility_types} actors={actors.data || []} isAdmin={isRegulator} onClose={() => setNewFacility(false)} onDone={() => { setNewFacility(false); facilities.reload(); reloadMe(); }} />}
    </>
  );
}

function ActorModal({ roles, onClose, onDone }) {
  const [f, setF] = useState({ role: 'manufacturer' });
  const [created, setCreated] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = { ...f };
      for (const k of ['username', 'password', 'email']) if (!body[k]) delete body[k];
      setCreated(await api('/actors', { method: 'POST', body }));
      onDone();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Add network member" subtitle="Generates an on-chain signing key and an API key"
      footer={created ? <Button onClick={onClose}>Done</Button> : <><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={submit} disabled={!f.name}>Register</Button></>}>
      {created ? (
        <div className="space-y-3 text-sm">
          <p><strong>{created.actor.name}</strong> registered as {ROLE_LABEL[created.actor.role]} (<span className="font-mono">{created.actor.id}</span>).</p>
          {created.username && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
              <p className="font-semibold text-brand-900">Sign-in details: shown once</p>
              <p className="mt-1 font-mono text-xs">Username: {created.username}<br />Password: {created.password}</p>
              <Button className="mt-2" size="sm" variant="secondary" icon={Copy} onClick={() => navigator.clipboard?.writeText(`Username: ${created.username}\nPassword: ${created.password}`)}>Copy</Button>
            </div>
          )}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="flex items-center gap-1.5 font-semibold text-amber-900"><KeyRound className="h-4 w-4" />API key – shown once</p>
            <div className="mt-2 flex items-center gap-2"><code className="flex-1 break-all rounded bg-white px-2 py-1 font-mono text-xs">{created.api_key}</code><Button size="sm" variant="secondary" icon={Copy} onClick={() => navigator.clipboard?.writeText(created.api_key)}>Copy</Button></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="Organisation name"><input className="input" value={f.name || ''} onChange={set('name')} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Role"><select className="input" value={f.role} onChange={set('role')}>{roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></Field>
            <Field label="License no. (optional)"><input className="input" value={f.license_no || ''} onChange={set('license_no')} /></Field>
            <Field label="Org / division"><input className="input" value={f.org || ''} onChange={set('org')} /></Field>
            <Field label="Contact email"><input className="input" type="email" value={f.email || ''} onChange={set('email')} /></Field>
            <Field label="Username (for sign-in)" hint="Leave the password empty to generate one"><input className="input" value={f.username || ''} onChange={set('username')} placeholder="e.g. medlink" /></Field>
            <Field label="Password (optional)"><input className="input" value={f.password || ''} onChange={set('password')} placeholder="auto-generate" /></Field>
          </div>
          <ErrorBox error={error} />
        </div>
      )}
    </Modal>
  );
}

function FacilityModal({ types, actors, isAdmin, onClose, onDone }) {
  const [f, setF] = useState({ type: 'warehouse' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const locate = () => navigator.geolocation?.getCurrentPosition((p) => setF((x) => ({ ...x, lat: p.coords.latitude.toFixed(5), lng: p.coords.longitude.toFixed(5) })));
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = { ...f, lat: f.lat ? Number(f.lat) : undefined, lng: f.lng ? Number(f.lng) : undefined };
      for (const k of Object.keys(body)) if (body[k] === '') delete body[k];
      await api('/facilities', { method: 'POST', body });
      onDone();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Register facility" subtitle={isAdmin ? 'Facilities you register are licensed immediately.' : 'New sites start unlicensed until a regulator approves them.'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={submit} disabled={!f.name}>Register</Button></>}>
      <div className="space-y-3">
        <Field label="Facility name"><input className="input" value={f.name || ''} onChange={set('name')} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Type"><select className="input" value={f.type} onChange={set('type')}>{types.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}</select></Field>
          {isAdmin && <Field label="Operator"><select className="input" value={f.actor_id || ''} onChange={set('actor_id')}><option value="">Me</option>{actors.filter((a) => a.role !== 'admin').map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>}
          <Field label="City"><input className="input" value={f.city || ''} onChange={set('city')} /></Field>
          <Field label="License no."><input className="input" value={f.license_no || ''} onChange={set('license_no')} /></Field>
          <Field label="Latitude"><input className="input" value={f.lat || ''} onChange={set('lat')} /></Field>
          <Field label="Longitude"><input className="input" value={f.lng || ''} onChange={set('lng')} /></Field>
        </div>
        <Button variant="ghost" size="sm" onClick={locate}>Use my current location</Button>
        <ErrorBox error={error} />
      </div>
    </Modal>
  );
}

function MachineModal({ facilities, onClose, onDone }) {
  const [f, setF] = useState({ facility_id: facilities[0]?.id || '', processes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api('/machines', { method: 'POST', body: { id: f.id?.trim() || undefined, name: f.name, facility_id: f.facility_id, processes: f.processes.split(',').map((s) => s.trim()).filter(Boolean) } });
      onDone();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Add production machine" subtitle="Process steps must name a registered machine qualified for that process"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={submit} disabled={!f.name || !f.facility_id}>Register</Button></>}>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Machine ID"><input className="input font-mono uppercase" value={f.id || ''} onChange={set('id')} placeholder="LAM-03" /></Field>
          <Field label="Name"><input className="input" value={f.name || ''} onChange={set('name')} placeholder="Display laminator #3" /></Field>
        </div>
        <Field label="Facility"><select className="input" value={f.facility_id} onChange={set('facility_id')}>{facilities.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
        <Field label="Qualified processes (comma separated)" hint="Must match the batch's process route names"><input className="input" value={f.processes} onChange={set('processes')} placeholder="Display lamination" /></Field>
        <ErrorBox error={error} />
      </div>
    </Modal>
  );
}

function CredentialsModal({ member, onClose }) {
  const [username, setUsername] = useState(member.username || '');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      setDone(await api(`/actors/${member.id}/credentials`, { method: 'PATCH', body: { username, ...(password ? { password } : {}) } }));
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title={member.username ? 'Reset password' : 'Create sign-in'} subtitle={member.name}
      footer={done ? <Button onClick={onClose}>Done</Button> : <><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={submit} disabled={!username}>Save</Button></>}>
      {done ? (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm">
          <p className="font-semibold text-brand-900">New sign-in details: shown once</p>
          <p className="mt-1 font-mono text-xs">Username: {done.username}<br />Password: {done.password}</p>
          <Button className="mt-2" size="sm" variant="secondary" icon={Copy} onClick={() => navigator.clipboard?.writeText(`Username: ${done.username}\nPassword: ${done.password}`)}>Copy</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="Username"><input className="input" value={username} onChange={(e) => setUsername(e.target.value)} /></Field>
          <Field label="New password" hint="Leave empty to generate an easy, strong one"><input className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <ErrorBox error={error} />
        </div>
      )}
    </Modal>
  );
}
