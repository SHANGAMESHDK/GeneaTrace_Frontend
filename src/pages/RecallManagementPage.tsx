import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertOctagon,
  Smartphone,
  Truck,
  CheckCircle2,
  Download,
  ArrowRight,
  ExternalLink,
  Info,
  ShieldAlert,
  Zap,
  Sparkles
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
    setActionFeedback('Signed API Hold Request dispatched to DHL Express logistics network. Shipment GT-SHP-00000326 held at Munich Gateway.');
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
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <AlertOctagon className="text-rose-600" size={26} />
            <span>Precision Recall Command Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Graph-driven targeted recall isolation without blunt, expensive mass-recalls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportAffectedList}
            className="btn-modern-outline text-xs rounded-xl flex items-center gap-2"
          >
            <Download size={14} />
            <span>Export Manifest</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={advanceLifecycle}
            className="btn-modern-accent text-xs rounded-xl flex items-center gap-2"
          >
            <span>Advance Lifecycle State</span>
            <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 bg-blue-50 border border-blue-200 text-xs text-blue-900 rounded-xl flex items-center gap-2.5 font-medium shadow-xs"
          >
            <Info size={16} className="text-blue-600 shrink-0" />
            <span>{actionFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lifecycle Progress Bar */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Lifecycle Progression: Case {recallCase.recallId}
          </span>
          <span className="text-xs font-mono px-3 py-1 bg-rose-50 text-rose-700 font-bold border border-rose-200 rounded-full">
            {recallCase.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 pt-1">
          {lifecycleStages.map((st, idx) => {
            const currentIdx = lifecycleStages.indexOf(recallCase.status);
            const isPassed = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <motion.div
                key={st}
                whileHover={{ y: -1 }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
                    : isPassed
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-white border-slate-200/50 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Step {idx + 1}</div>
                <div className="text-xs font-semibold mt-0.5 truncate">{st}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Target Impact Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Defective Component</span>
          <p className="text-lg font-bold text-slate-900 mt-1">Batch {recallCase.batchId}</p>
          <span className="text-[11px] text-blue-600 font-mono font-medium">{recallCase.unitsInBatch} Total Unit</span>
        </div>
        <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-rose-600 uppercase font-semibold tracking-wider">Affected Products</span>
          <p className="text-lg font-bold text-rose-700 mt-1">{recallCase.affectedProductIds.length} Device</p>
          <span className="text-[11px] text-rose-600/80 font-medium">Assembled with Batch ABC</span>
        </div>
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Affected Shipment</span>
          <p className="text-lg font-bold text-amber-600 mt-1">{recallCase.affectedShipmentIds.length} Cargo</p>
          <span className="text-[11px] text-slate-500 font-medium">DHL Intercontinental</span>
        </div>
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
          <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Cargo In Transit</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{recallCase.inTransitCount} Unit</p>
          <span className="text-[11px] text-emerald-600 font-medium">Carrier Hold Active</span>
        </div>
      </div>

      {/* Case Details & Root Cause Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Root Cause & Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-rose-500" size={16} />
              <span>Root Cause &amp; Defect Analysis</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{recallCase.description}</p>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
              <strong className="text-slate-500 uppercase tracking-wider text-[11px] block">Root Cause Diagnostics: </strong>
              <span className="font-mono text-slate-900 font-medium">{recallCase.rootCause}</span>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions Executed</span>
              <ul className="mt-2.5 space-y-2 text-xs text-slate-700">
                {recallCase.actionsTaken.map((act, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={dispatchCarrierHolds}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                <Truck size={14} />
                <span>Dispatch Carrier Hold Notice</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/logistics?search=GT-SHP-00000326')}
                className="btn-modern-outline text-xs py-2 px-4 rounded-xl"
              >
                Inspect Munich Shipment (GT-SHP-00000326)
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column: Affected Finished Products List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Affected Finished Products ({recallCase.affectedProductIds.length})</h3>
              <span className="text-xs font-mono text-rose-600 font-semibold">100% Target Isolated</span>
            </div>

            <div className="space-y-2">
              {recallCase.affectedProductIds.map(pid => (
                <div
                  key={pid}
                  className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs font-mono hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone size={15} className="text-slate-500" />
                    <span className="font-bold text-slate-900">{pid}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/passport/${pid}`)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs font-sans font-medium"
                  >
                    <span>View DPP</span>
                    <ExternalLink size={12} />
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
