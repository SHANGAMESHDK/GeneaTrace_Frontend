import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crosshair, Undo2, Cog } from 'lucide-react';
import { api } from '../lib/api';
import { fmtDateTime, pct } from '../lib/format';
import { Badge, Button, cx, Field, Modal, useToast } from './ui';

/** Step 12: the unit's process history, the batch-wide machine correlation and the recall scope. */
export default function BacktracePanel({ bt, canRecall, onRecalled }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  if (!bt) return null;
  const s = bt.suspect;
  const discriminative = bt.correlation.filter((c) => c.discriminative && c.affected > 0);

  const recall = async () => {
    setBusy(true);
    try {
      const r = await api('/events', { method: 'POST', body: { type: 'RECALL', product_ids: bt.scope.units, data: { reason, scope: 'machine', machine_id: s.machine_id, process: s.process } } });
      toast(`${r.accepted.length} unit(s) recalled · ${r.rejected.length} skipped`);
      setOpen(false);
      onRecalled?.(r);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={cx('rounded-xl border p-4 text-sm', s ? 'border-red-200 bg-red-50' : 'border-ink-200 bg-ink-50')}>
        <p className="flex items-center gap-2 font-semibold"><Crosshair className={cx('h-4 w-4', s ? 'text-red-600' : 'text-ink-500')} />{s ? 'Root cause located' : 'Backtrace'}</p>
        <p className="mt-1 text-ink-700">{bt.summary}</p>
        {bt.affected.length > 0 && (
          <p className="mt-1 text-xs text-ink-500">Same issue in this batch: {bt.affected.map((id) => <Link key={id} to={`/app/products/${id}`} className="mr-1.5 font-mono text-brand-700 hover:underline">{id}</Link>)}</p>
        )}
        {s && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="red">Recommended: recall {bt.scope.count} unit(s) from {s.machine_id}</Badge>
            <span className="text-xs text-ink-600">{bt.scope.with_consumers} with customers · {bt.scope.already_recalled} already recalled</span>
            {canRecall && bt.scope.count > bt.scope.already_recalled && <Button size="sm" variant="danger" icon={Undo2} onClick={() => { setReason(`${bt.code} – ${s.process} fault on ${s.machine_id}`); setOpen(true); }}>Recall these units</Button>}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">This unit's production history</p>
          {bt.unit_steps.length === 0 ? <p className="text-sm text-ink-500">No process steps recorded.</p> : (
            <ol className="space-y-1.5">
              {bt.unit_steps.map((st, i) => (
                <li key={i} className={cx('flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ring-1', s && st.machine_id === s.machine_id ? 'bg-red-50 ring-red-200' : 'ring-ink-100')}>
                  <Cog className="h-3.5 w-3.5 text-ink-400" />
                  <span className="flex-1 font-medium">{st.process}</span>
                  <span className="font-mono text-xs">{st.machine_id}</span>
                  <span className="text-[11px] text-ink-400">{fmtDateTime(st.at)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Issue rate by machine (batch {bt.batch_id})</p>
          {discriminative.length === 0 ? <p className="text-sm text-ink-500">Not enough reports to correlate yet.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] uppercase text-ink-500"><th className="py-1">Process / machine</th><th>Affected</th><th>Rate</th></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {bt.correlation.filter((c) => c.discriminative).map((c) => (
                  <tr key={c.process + c.machine_id} className={s && c.machine_id === s.machine_id && c.process === s.process ? 'font-semibold text-red-700' : ''}>
                    <td className="py-1.5">{c.process}<br /><span className="font-mono text-xs">{c.machine_id}</span></td>
                    <td>{c.affected}/{bt.affected.length}</td>
                    <td>{pct(c.rate)} <span className="text-xs text-ink-400">of {c.units}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`Recall ${bt.scope.count} unit(s)`} subtitle={s && `Precision recall: only units processed by ${s.machine_id} in "${s.process}". Customers' retailers get recall notices.`}
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button variant="danger" loading={busy} onClick={recall} disabled={!reason}>Issue recall</Button></>}>
        <Field label="Public reason"><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </Modal>
    </div>
  );
}
