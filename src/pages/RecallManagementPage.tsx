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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <AlertOctagon className="text-red-500" size={24} />
            <span>Precision Recall Command Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Graph-driven targeted recall isolation without blunt mass-recalls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAffectedList}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Export Recall Manifest</span>
          </button>
          <button
            onClick={advanceLifecycle}
            className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-red-950 transition-colors"
          >
            <span>Advance Lifecycle State</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-xs text-cyan-200 flex items-center gap-2">
          <Info size={16} className="text-cyan-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Lifecycle Progress Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
            Recall Case Lifecycle Progression: Case {recallCase.recallId}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
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
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? 'bg-red-950/50 border-red-500 text-red-200 ring-1 ring-red-500'
                    : isPassed
                    ? 'bg-slate-900 border-slate-700 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">Step {idx + 1}</div>
                <div className="text-xs font-semibold mt-0.5 truncate">{st}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Impact Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">Defective Component</span>
          <p className="text-lg font-bold text-white mt-1">Batch {recallCase.batchId}</p>
          <span className="text-[11px] text-cyan-400">{recallCase.unitsInBatch} Total Display Units</span>
        </div>
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40">
          <span className="text-xs text-red-300 font-mono">Affected Finished Phones</span>
          <p className="text-lg font-bold text-red-400 mt-1">{recallCase.affectedProductIds.length} Devices</p>
          <span className="text-[11px] text-red-300">Assembled with Batch ABC</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">Affected Shipments</span>
          <p className="text-lg font-bold text-amber-400 mt-1">{recallCase.affectedShipmentIds.length} Shipments</p>
          <span className="text-[11px] text-slate-400">DHL, FedEx, Maersk</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">Customer Delivered</span>
          <p className="text-lg font-bold text-white mt-1">{recallCase.deliveredCount} Phones</p>
          <span className="text-[11px] text-slate-500">Consumer Notice Push</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">Cargo in Transit</span>
          <p className="text-lg font-bold text-cyan-400 mt-1">{recallCase.inTransitCount} Phones</p>
          <span className="text-[11px] text-slate-500">Hold Order Active</span>
        </div>
      </div>

      {/* Case Details & Root Cause Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Root Cause & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={16} />
              <span>Root Cause &amp; Defect Analysis</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{recallCase.description}</p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
              <strong className="text-slate-300">Root Cause Diagnostics: </strong>
              {recallCase.rootCause}
            </div>

            <div className="pt-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Actions Taken</span>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                {recallCase.actionsTaken.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={dispatchCarrierHolds}
                className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Truck size={14} />
                <span>Dispatch Carrier Hold Notice</span>
              </button>
              <button
                onClick={() => navigate('/logistics?search=GT-SHP-00000326')}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Inspect Munich Hub Shipment (GT-SHP-00000326)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Affected Finished Phones List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Affected Finished Phones ({recallCase.affectedProductIds.length})</h3>
              <span className="text-xs font-mono text-red-400">Target Isolated</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {recallCase.affectedProductIds.map(pid => (
                <div
                  key={pid}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone size={14} className="text-slate-500" />
                    <span className="font-bold text-white">{pid}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/passport/${pid}`)}
                    className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
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
