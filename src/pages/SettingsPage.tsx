import React, { useState } from 'react';
import {
  Settings,
  Database,
  Radio,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';

export const SettingsPage: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const store = GeneaTraceStore.getState();
  const integrations = store.integrations;

  const handleResetData = () => {
    if (window.confirm('Reset all GeneaTrace demo data back to default state?')) {
      GeneaTraceStore.resetDemoData();
      setFeedback('Demo data reset successfully.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleExportStateJson = () => {
    const data = JSON.stringify(GeneaTraceStore.getState(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geneatrace-state-backup-${Date.now()}.json`;
    a.click();
    setFeedback('State JSON exported.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="text-cyan-400" size={24} />
            <span>Industrial Integrations &amp; System Configuration</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            ERP, MES, SCADA data ingestion gateways, demo environment controls, and data management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-xs text-cyan-200">
          {feedback}
        </div>
      )}

      {/* Industrial Integration Dashboard (Section 8 of Master Prompt) */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Enterprise Industrial Systems Integration</h3>
            <p className="text-xs text-slate-400">
              Clean abstraction architecture ready to attach live OPC UA, MQTT Sparkplug B, and REST endpoints.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">6 Gateways Connected</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map(int => (
            <div key={int.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                  {int.category}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{int.status}</span>
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-white">{int.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{int.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                <div>
                  <span>Protocol:</span>
                  <p className="text-slate-200 font-medium truncate">{int.protocol}</p>
                </div>
                <div>
                  <span>Ingested Events:</span>
                  <p className="text-cyan-400 font-bold truncate">{int.eventsIngested.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Controls & State Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Database size={16} className="text-cyan-400" />
            <span>Demonstration State Storage</span>
          </h3>
          <p className="text-slate-400">
            Current changes are saved to browser local state for immediate interactive demonstration.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleExportStateJson}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span>Export State JSON</span>
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers size={16} className="text-cyan-400" />
            <span>Manufacturing Batch Configuration</span>
          </h3>
          <p className="text-slate-400">
            Standard demonstration batch size is configured to <strong>100 units/batch</strong> (e.g. ABC-0001 through ABC-0100).
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
            Batch Namespace: <span className="text-cyan-400 font-bold">GT-KOREA-GUMI-L2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
