import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { LineChart as LineIcon, Cpu, BadgeCheck, Plus, Lightbulb, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { fmtDate, humanize, pct } from '../../lib/format';
import { Badge, Button, Card, Empty, ErrorBox, Field, Loading, Modal, PageHeader, Stat, useAsync, useToast } from '../../components/ui';

export default function Insights() {
  const { actor } = useAuth();
  const defects = useAsync(() => api('/analytics/defects'), []);
  const programs = useAsync(() => api('/programs'), []);
  const [newProgram, setNewProgram] = useState(null);
  if (defects.loading && !defects.data) return <Loading />;
  if (defects.error) return <ErrorBox error={defects.error} />;
  const d = defects.data;

  return (
    <>
      <PageHeader title="Defect intelligence & warranty" subtitle="Root-cause analytics across component lots and firmware, with on-chain replacement programs" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Defect reports" value={d.total_reports} icon={AlertTriangle} tone="red" />
        <Stat label="Defect types" value={d.codes.length} icon={LineIcon} tone="amber" />
        <Stat label="Firmware rollouts" value={d.firmware_rollouts.length} icon={Cpu} tone="purple" />
        <Stat label="Active programs" value={(programs.data || []).filter((p) => p.active).length} icon={BadgeCheck} />
      </div>

      {d.codes.length === 0 && <Card className="mt-6"><Empty icon={LineIcon} title="No defect reports yet" text="Service centres file DEFECT_REPORTED events; clusters appear here." /></Card>}
      {d.codes.map((c) => {
        // Compare a lot only with alternative lots of the same part: a part with a single lot
        // (fitted in every unit) cannot discriminate.
        const comparable = c.by_lot.filter((x) => c.by_lot.some((y) => y.part === x.part && y.lot !== x.lot));
        const top = comparable[0] || null; // a lot with no alternative of the same part explains nothing
        const others = c.by_lot.filter((x) => top && x.part === top.part && x.lot !== top.lot);
        const baseline = others.length ? others.reduce((s, x) => s + x.rate, 0) / others.length : 0;
        const ratio = top && baseline ? top.rate / baseline : null;
        return (
          <Card key={c.code} className="mt-6" title={humanize(c.code)} subtitle={`${c.reports} reports on ${c.units} units`} icon={AlertTriangle}
            action={actor.role === 'manufacturer' && <Button size="sm" icon={Plus} onClick={() => setNewProgram({ code: c.code, lot: top?.lot, sku: c.by_sku[0]?.sku })}>Create replacement program</Button>}>
            {top && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="text-ink-800">
                  <p className="font-semibold">Root-cause signal: {top.name} ({top.lot})</p>
                  <p className="mt-0.5">
                    {pct(top.rate)} of units built with this lot reported {humanize(c.code).toLowerCase()}
                    {ratio ? <>: <strong>{ratio.toFixed(1)}×</strong> the rate of other {top.part.toLowerCase()} lots</> : others.length ? `, while other ${top.part.toLowerCase()} lots show no reports` : ''}.
                    {c.post_update_share > 0 && <> {pct(c.post_update_share)} of reports began within 45 days of a firmware update, so the update is a trigger, not the cause: the defect concentrates in one hardware lot.</>}
                  </p>
                  <p className="mt-1 text-ink-600">Suggested action: targeted replacement program for this lot only, not a blanket recall.</p>
                </div>
              </div>
            )}
            {c.by_machine?.some((m) => m.share >= 0.8 && m.fleet > m.units) && (() => {
              const m = c.by_machine.find((x) => x.share >= 0.8 && x.fleet > x.units);
              return (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
                  <Cpu className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div><p className="font-semibold">Process signal: {m.process} on {m.machine_id}</p><p className="mt-0.5 text-ink-700">{m.units} of {c.units} affected units passed through this machine ({pct(m.share)}), which processed {m.fleet} units in total: {pct(m.rate)} failure rate.</p></div>
                </div>
              );
            })()}
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Defect rate by component lot</p>
                <div className="h-56">
                  <ResponsiveContainer>
                    <BarChart data={c.by_lot.map((x) => ({ ...x, ratePct: Math.round(x.rate * 1000) / 10 }))} margin={{ left: -16, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
                      <XAxis dataKey="lot" tick={{ fontSize: 11, fill: '#535c72' }} axisLine={false} tickLine={false} />
                      <YAxis unit="%" tick={{ fontSize: 11, fill: '#8791a7' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v, _n, p) => [`${v}% (${p.payload.reports}/${p.payload.fleet} units)`, p.payload.part]} />
                      <Bar dataKey="ratePct" radius={[4, 4, 0, 0]} barSize={36}>
                        {c.by_lot.map((x) => <Cell key={x.lot} fill={x.lot === top?.lot ? '#dc2626' : x.part === top?.part ? '#b1b8c7' : '#dde1e8'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Reports by firmware at time of failure</p>
                <div className="h-56">
                  <ResponsiveContainer>
                    <BarChart data={c.by_firmware} margin={{ left: -16, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
                      <XAxis dataKey="firmware" tick={{ fontSize: 11, fill: '#535c72' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8791a7' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="reports" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Firmware rollouts" icon={Cpu} bodyClass="divide-y divide-ink-100">
          {d.firmware_rollouts.length === 0 && <p className="p-5 text-sm text-ink-500">No OTA updates recorded.</p>}
          {d.firmware_rollouts.map((f) => (
            <div key={f.version} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="font-medium">{f.version}</span>
              <span className="text-ink-500">{f.units} units · {fmtDate(f.first)}</span>
            </div>
          ))}
        </Card>
        <Card title="Replacement & warranty programs" className="lg:col-span-2" icon={BadgeCheck}
          action={actor.role === 'manufacturer' && <Button size="sm" variant="secondary" icon={Plus} onClick={() => setNewProgram({})}>New program</Button>} bodyClass="divide-y divide-ink-100">
          {(programs.data || []).length === 0 && <p className="p-5 text-sm text-ink-500">No programs yet.</p>}
          {(programs.data || []).map((p) => (
            <div key={p.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{p.name}</span>
                <Badge tone={p.active ? 'brand' : 'gray'}>{p.active ? 'Active' : 'Closed'}</Badge>
                <span className="font-mono text-xs text-ink-400">{p.id}</span>
              </div>
              {p.description && <p className="mt-1 text-sm text-ink-600">{p.description}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                {p.criteria.skus?.map((s) => <Badge key={s} tone="gray">Model {s}</Badge>)}
                {p.criteria.component_lots?.map((s) => <Badge key={s} tone="purple">Lot {s}</Badge>)}
                {p.criteria.defect_codes?.map((s) => <Badge key={s} tone="red">{humanize(s)}</Badge>)}
                {p.criteria.exclude_damage && <Badge tone="amber">No physical/liquid damage</Badge>}
                {p.criteria.one_time && <Badge tone="blue">One-time</Badge>}
                {p.criteria.max_age_months && <Badge tone="gray">≤ {p.criteria.max_age_months} months</Badge>}
              </div>
            </div>
          ))}
        </Card>
      </div>
      {newProgram && <ProgramModal preset={newProgram} onClose={() => setNewProgram(null)} onDone={() => { setNewProgram(null); programs.reload(); }} />}
    </>
  );
}

function ProgramModal({ preset, onClose, onDone }) {
  const toast = useToast();
  const [f, setF] = useState({
    name: preset.code ? `${humanize(preset.code)} – free replacement` : '',
    coverage: 'Free replacement (one-time)',
    description: '',
    skus: preset.sku || '',
    lots: preset.lot || '',
    codes: preset.code || '',
    max_age_months: '',
    exclude_damage: true,
    one_time: true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const criteria = { exclude_damage: f.exclude_damage, one_time: f.one_time };
      if (list(f.skus).length) criteria.skus = list(f.skus);
      if (list(f.lots).length) criteria.component_lots = list(f.lots);
      if (list(f.codes).length) criteria.defect_codes = list(f.codes);
      if (f.max_age_months) criteria.max_age_months = Number(f.max_age_months);
      await api('/programs', { method: 'POST', body: { name: f.name, coverage: f.coverage, description: f.description || undefined, criteria } });
      toast('Program published on-chain');
      onDone();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="New replacement program" subtitle="Criteria are public and checked automatically for every claim" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={submit} disabled={!f.name}>Publish</Button></>}>
      <div className="space-y-3">
        <Field label="Name"><input className="input" value={f.name} onChange={set('name')} /></Field>
        <Field label="Coverage"><input className="input" value={f.coverage} onChange={set('coverage')} /></Field>
        <Field label="Description"><textarea className="input" value={f.description} onChange={set('description')} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Models (SKUs, comma separated)"><input className="input" value={f.skus} onChange={set('skus')} /></Field>
          <Field label="Component lots"><input className="input" value={f.lots} onChange={set('lots')} /></Field>
          <Field label="Defect codes"><input className="input" value={f.codes} onChange={set('codes')} /></Field>
          <Field label="Max months since purchase"><input type="number" className="input" value={f.max_age_months} onChange={set('max_age_months')} /></Field>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.exclude_damage} onChange={set('exclude_damage')} /> Exclude physical / liquid damage</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.one_time} onChange={set('one_time')} /> One-time per unit</label>
        </div>
        <ErrorBox error={error} />
      </div>
    </Modal>
  );
}
