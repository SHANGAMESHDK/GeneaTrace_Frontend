import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Smartphone,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  Send,
  Layers,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { RecallCase } from '../types';

export const RecallManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [recallCase, setRecallCase] = useState<RecallCase>(GeneaTraceStore.getState().recallCase);
  const [actionFeedback, setActionFeedback] = useState<string>('');

  const advanceLifecycle = () => {
    const states: RecallCase['status'][] = [
      'Investigation',
      'Confirmed',
      'Recall Initiated',
      'Notifications Sent',
      'Recovery in Progress',
      'Resolved'
    ];
    const currentIndex = states.indexOf(recallCase.status);
    if (currentIndex < states.length - 1) {
      const nextState = states[currentIndex + 1];
      const updated: RecallCase = {
        ...recallCase,
        status: nextState,
        actionsTaken: [
          ...recallCase.actionsTaken,
          `Lifecycle status advanced to "${nextState}" by Lead QA Architect`
        ]
      };
      GeneaTraceStore.getState().recallCase = updated;
      GeneaTraceStore.saveState();
      setRecallCase(updated);
      setActionFeedback(`Recall lifecycle successfully advanced to: ${nextState}`);
      setTimeout(() => setActionFeedback(''), 4000);
    }
  };

  const dispatchCarrierHolds = () => {
    setActionFeedback('Signed API Hold Requests dispatched to DHL Express and FedEx global freight dispatchers. 14 shipments locked in sorting centers.');
    setTimeout(() => setActionFeedback(''), 5000);
  };

  const exportAffectedList = () => {
    const header = 'Recall ID,Defective Batch,Product ID,Shipment ID,Impact Status\n';
    const rows = recallCase.affectedProductIds
      .map(
        pid =>
          `${recallCase.recallId},${recallCase.batchId},${pid},GT-SHP-00000326,HOLD_REQUESTED`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geneatrace-recall-${recallCase.recallId}-manifest.csv`;
    a.click();
  };

  const lifecycleStages = [
    'Investigation',
    'Confirmed',
    'Recall Initiated',
    'Notifications Sent',
    'Recovery in Progress',
    'Resolved'
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[#413634] flex items-center gap-2">
            <AlertOctagon className="text-[#c5716d]" size={22} />
            <span>Precision Recall Command Center</span>
          </h1>
          <p className="text-xs text-[#666666] font-serif mt-1">
            Graph-driven targeted recall isolation without blunt mass-recalls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAffectedList}
            className="px-3.5 py-2 rounded-none bg-[#faf3dc] hover:bg-[#eee4d5] border border-[#413634] text-[#413634] font-serif text-xs flex items-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <Download size={13} />
            <span>Export Recall Manifest</span>
          </button>
          <button
            onClick={advanceLifecycle}
            className="btn-vintage-accent text-xs py-2 px-3.5 flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>Advance Lifecycle State</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 bg-[#faf3dc] border border-[#e5e5e5] text-xs text-[#413634] flex items-center gap-2 font-serif">
          <Info size={16} className="text-[#c5716d] shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Lifecycle Progress Bar */}
      <div className="p-5 vintage-card space-y-3">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
          <span className="text-xs font-serif uppercase tracking-wider text-[#8b6c58]">
            Recall Case Lifecycle Progression: Case {recallCase.recallId}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 bg-[#fdf2f1] text-[#b84a44] font-bold border border-[#f5c6cb]">
            {recallCase.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
          {lifecycleStages.map((st, idx) => {
            const currentIdx = lifecycleStages.indexOf(recallCase.status);
            const isPassed = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={st}
                className={`p-2.5 border text-center transition-all ${
                  isCurrent
                    ? 'bg-[#fdf2f1] border-[#c5716d] text-[#b84a44]'
                    : isPassed
                    ? 'bg-[#faf3dc] border-[#e5e5e5] text-[#413634]'
                    : 'bg-[#fffdf6] border-[#e5e5e5] text-[#8b6c58]/60'
                }`}
              >
                <div className="text-[10px] font-mono text-[#8b6c58]">Step {idx + 1}</div>
                <div className="text-xs font-serif mt-0.5 truncate">{st}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Impact Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 vintage-card">
          <span className="text-xs text-[#8b6c58] font-serif">Defective Component</span>
          <p className="text-lg font-normal font-serif text-[#413634] mt-1">Batch {recallCase.batchId}</p>
          <span className="text-[11px] text-[#49627d] font-mono">{recallCase.unitsInBatch} Total Units</span>
        </div>
        <div className="p-4 bg-[#fdf2f1] border border-[#f5c6cb]">
          <span className="text-xs text-[#b84a44] font-serif">Affected Finished Products</span>
          <p className="text-lg font-normal font-serif text-[#b84a44] mt-1">{recallCase.affectedProductIds.length} Devices</p>
          <span className="text-[11px] text-[#b84a44]/80 font-serif">Assembled with Batch ABC</span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-xs text-[#8b6c58] font-serif">Affected Shipments</span>
          <p className="text-lg font-normal font-serif text-[#b87428] mt-1">{recallCase.affectedShipmentIds.length} Shipments</p>
          <span className="text-[11px] text-[#666666] font-serif">DHL, FedEx, Maersk</span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-xs text-[#8b6c58] font-serif">Customer Delivered</span>
          <p className="text-lg font-normal font-serif text-[#413634] mt-1">{recallCase.deliveredCount} Units</p>
          <span className="text-[11px] text-[#8b6c58] font-serif">Consumer Notice Push</span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-xs text-[#8b6c58] font-serif">Cargo in Transit</span>
          <p className="text-lg font-normal font-serif text-[#49627d] mt-1">{recallCase.inTransitCount} Units</p>
          <span className="text-[11px] text-[#8b6c58] font-serif">Hold Order Active</span>
        </div>
      </div>

      {/* Case Details & Root Cause Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Root Cause & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 vintage-card space-y-3">
            <h3 className="text-sm font-normal font-serif text-[#413634] flex items-center gap-2">
              <AlertTriangle className="text-[#c5716d]" size={16} />
              <span>Root Cause &amp; Defect Analysis</span>
            </h3>
            <p className="text-xs text-[#666666] font-serif leading-relaxed">{recallCase.description}</p>
            <div className="p-3 bg-[#fffdf6] border border-[#e5e5e5] text-xs font-serif text-[#413634]">
              <strong className="text-[#8b6c58] uppercase tracking-wider text-[11px]">Root Cause Diagnostics: </strong>
              <span className="font-mono text-[#413634]">{recallCase.rootCause}</span>
            </div>

            <div className="pt-2">
              <span className="text-xs font-serif text-[#8b6c58] uppercase tracking-wider">Actions Taken</span>
              <ul className="mt-2 space-y-1.5 text-xs text-[#413634] font-serif">
                {recallCase.actionsTaken.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-[#2e6b4d] shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-[#e5e5e5] flex flex-wrap gap-2">
              <button
                onClick={dispatchCarrierHolds}
                className="btn-vintage-accent text-xs py-2 px-3.5 flex items-center gap-1.5 uppercase tracking-wider"
              >
                <Truck size={14} />
                <span>Dispatch Carrier Hold Notice</span>
              </button>
              <button
                onClick={() => navigate('/logistics?search=GT-SHP-00000326')}
                className="btn-vintage-outline text-xs py-2 px-3.5"
              >
                Inspect Munich Hub Shipment (GT-SHP-00000326)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Affected Finished Products List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 vintage-card space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
              <h3 className="text-sm font-normal font-serif text-[#413634]">Affected Finished Products ({recallCase.affectedProductIds.length})</h3>
              <span className="text-xs font-mono text-[#b84a44]">Target Isolated</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {recallCase.affectedProductIds.map(pid => (
                <div
                  key={pid}
                  className="p-2.5 bg-[#fffdf6] border border-[#e5e5e5] flex items-center justify-between text-xs font-mono hover:bg-[#faf3dc]/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone size={14} className="text-[#8b6c58]" />
                    <span className="font-bold text-[#413634]">{pid}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/passport/${pid}`)}
                    className="text-[#c5716d] hover:underline flex items-center gap-1 text-[11px] font-serif"
                  >
                    <span>Passport</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
