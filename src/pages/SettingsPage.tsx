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
    if (window.confirm('Reset all local cached state back to default production records?')) {
      GeneaTraceStore.resetDemoData();
      setFeedback('Local cache reset successfully.');
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[#413634] flex items-center gap-2">
            <Settings className="text-[#c5716d]" size={22} />
            <span>Industrial Integrations &amp; System Configuration</span>
          </h1>
          <p className="text-xs text-[#666666] font-serif mt-1">
            ERP, MES, SCADA data ingestion gateways, environment telemetry, and state management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 bg-[#fdf2f1] hover:bg-[#fae7e6] border border-[#f5c6cb] text-[#b84a44] text-xs font-serif flex items-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <RotateCcw size={13} />
            <span>Reset Local Cache</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5] text-xs text-[#413634] font-serif">
          {feedback}
        </div>
      )}

      {/* Industrial Integration Dashboard */}
      <div className="p-5 vintage-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
          <div>
            <h3 className="text-sm font-normal font-serif text-[#413634]">Enterprise Industrial Systems Integration</h3>
            <p className="text-xs text-[#666666] font-serif">
              Clean abstraction architecture ready to attach live OPC UA, MQTT Sparkplug B, and REST endpoints.
            </p>
          </div>
          <span className="text-xs font-serif text-[#c5716d]">6 Gateways Connected</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map(int => (
            <div key={int.id} className="p-4 bg-[#fffdf6] border border-[#e5e5e5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-serif uppercase tracking-wider px-2 py-0.5 bg-[#faf3dc] text-[#413634] border border-[#e5e5e5]">
                  {int.category}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-serif text-[#2e6b4d]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2e6b4d]" />
                  <span>{int.status}</span>
                </span>
              </div>

              <div>
                <h4 className="font-normal font-serif text-xs text-[#413634]">{int.name}</h4>
                <p className="text-[11px] text-[#666666] font-serif mt-1 line-clamp-2 leading-relaxed">{int.description}</p>
              </div>

              <div className="pt-2 border-t border-[#e5e5e5] grid grid-cols-2 gap-2 text-[10px] font-mono text-[#8b6c58]">
                <div>
                  <span className="font-serif">Protocol:</span>
                  <p className="text-[#413634] font-medium truncate">{int.protocol}</p>
                </div>
                <div>
                  <span className="font-serif">Ingested:</span>
                  <p className="text-[#49627d] font-bold truncate">{int.eventsIngested.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* State Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 vintage-card space-y-3 text-xs font-serif">
          <h3 className="text-sm font-normal text-[#413634] flex items-center gap-2">
            <Database size={15} className="text-[#c5716d]" />
            <span>Local State &amp; Cache Storage</span>
          </h3>
          <p className="text-[#666666]">
            Current state modifications are persisted locally in the browser and synchronized with the Azure cloud backend.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleExportStateJson}
              className="btn-vintage-primary text-xs py-2 px-3.5 flex items-center gap-1.5 uppercase tracking-wider"
            >
              <Download size={13} />
              <span>Export State JSON</span>
            </button>
          </div>
        </div>

        <div className="p-5 vintage-card space-y-3 text-xs font-serif">
          <h3 className="text-sm font-normal text-[#413634] flex items-center gap-2">
            <Layers size={15} className="text-[#c5716d]" />
            <span>Manufacturing Batch Configuration</span>
          </h3>
          <p className="text-[#666666]">
            Standard demonstration batch size is configured to <strong>100 units/batch</strong> (e.g. ABC-0001 through ABC-0100).
          </p>
          <div className="p-3 bg-[#fffdf6] border border-[#e5e5e5] font-mono text-[11px] text-[#413634]">
            Batch Namespace: <span className="text-[#c5716d] font-bold">GT-KOREA-GUMI-L2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
