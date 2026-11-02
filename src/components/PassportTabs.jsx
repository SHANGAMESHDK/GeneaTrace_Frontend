import { useState } from 'react';
import { Route, GitBranch, ShieldCheck, Lock, Bell, ScanLine } from 'lucide-react';
import { publicApi } from '../lib/api';
import { fmtDateTime } from '../lib/format';
import { Badge, Modal, SeverityBadge, Tabs } from './ui';
import { ComponentTree, IntegrityPanel, JourneyMap, journeyPoints, ProofView, Timeline, WarrantyPanel } from './domain';

export default function PassportTabs({ passport, internal }) {
  const [tab, setTab] = useState('journey');
  const [proof, setProof] = useState(null);
  const showProof = async (txId) => setProof(await publicApi(`/proof/${txId}`));
  const tabs = [
    { id: 'journey', label: 'Journey', icon: Route, count: passport.journey.length },
    { id: 'genealogy', label: 'Genealogy', icon: GitBranch },
    { id: 'warranty', label: 'Warranty', icon: ShieldCheck },
    { id: 'integrity', label: 'Ledger proof', icon: Lock },
    ...(internal ? [{ id: 'alerts', label: 'Alerts', icon: Bell, count: passport.alerts.length }, { id: 'scans', label: 'Scans', icon: ScanLine, count: passport.scans.length }] : []),
  ];
  return (
    <div className="card">
      <div className="px-4 pt-2"><Tabs tabs={tabs} value={tab} onChange={setTab} /></div>
      <div className="p-5">
        {tab === 'journey' && (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3"><Timeline journey={passport.journey} internal={internal} /></div>
            <div className="lg:col-span-2"><JourneyMap points={journeyPoints(passport.journey)} /></div>
          </div>
        )}
        {tab === 'genealogy' && (
          <div className="space-y-3">
            <p className="text-sm text-ink-600">What this unit is made of: every component lot is itself a passport with its own maker and history.</p>
            <ComponentTree nodes={passport.components} linkBatches={internal} />
          </div>
        )}
        {tab === 'warranty' && <WarrantyPanel warranty={passport.warranty} />}
        {tab === 'integrity' && <IntegrityPanel integrity={passport.integrity} trust={passport.trust} onProof={showProof} />}
        {tab === 'alerts' && (
          passport.alerts.length ? (
            <ul className="divide-y divide-ink-100">
              {passport.alerts.map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-2.5 text-sm">
                  <SeverityBadge severity={a.severity} />
                  <span className="flex-1 text-ink-700">{a.message}</span>
                  <Badge tone={a.status === 'open' ? 'amber' : 'gray'}>{a.status}</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ink-500">No alerts for this unit.</p>
        )}
        {tab === 'scans' && (
          passport.scans.length ? (
            <table className="w-full">
              <thead><tr><th className="table-head">When</th><th className="table-head">Verdict</th><th className="table-head">Location</th><th className="table-head">Label signature</th></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {passport.scans.map((s) => (
                  <tr key={s.id}>
                    <td className="table-cell">{fmtDateTime(s.created_at)}</td>
                    <td className="table-cell"><Badge tone={s.verdict === 'GENUINE' ? 'brand' : 'red'}>{s.verdict}</Badge></td>
                    <td className="table-cell mono">{s.lat != null ? `${s.lat.toFixed(3)}, ${s.lng.toFixed(3)}` : '—'}</td>
                    <td className="table-cell">{s.sig_valid == null ? 'manual entry' : s.sig_valid ? 'valid' : 'invalid'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-ink-500">Never scanned by a consumer.</p>
        )}
      </div>
      <Modal open={!!proof} onClose={() => setProof(null)} title="Merkle inclusion proof" subtitle="Anyone can recompute this path to confirm the event is sealed in the block.">
        <ProofView proof={proof} />
      </Modal>
    </div>
  );
}
