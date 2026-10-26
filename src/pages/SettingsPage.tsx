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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#45404F] pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[#E2DDE7] flex items-center gap-2">
            <Settings className="text-[#AAA2B3]" size={22} />
            <span>Industrial Integrations &amp; System Configuration</span>
          </h1>
          <p className="text-xs text-[#AAA2B3] font-serif mt-1">
            ERP, MES, SCADA data ingestion gateways, demo environment controls, and data management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 bg-[#2D1C22] hover:bg-[#3d232c] border border-[#5A2C35] text-[#F08C8A] text-xs font-serif flex items-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <RotateCcw size={13} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-[#292531] border border-[#45404F] text-xs text-[#E2DDE7] font-serif">
          {feedback}
        </div>
      )}

      {/* Industrial Integration Dashboard */}
      <div className="p-5 vintage-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#45404F] pb-2">
          <div>
            <h3 className="text-sm font-normal font-serif text-[#E2DDE7]">Enterprise Industrial Systems Integration</h3>
            <p className="text-xs text-[#AAA2B3] font-serif">
              Clean abstraction architecture ready to attach live OPC UA, MQTT Sparkplug B, and REST endpoints.
            </p>
          </div>
          <span className="text-xs font-serif text-[#AAA2B3]">6 Gateways Connected</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map(int => (
            <div key={int.id} className="p-4 bg-[#17151C] border border-[#45404F] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-serif uppercase tracking-wider px-2 py-0.5 bg-[#292531] text-[#E2DDE7] border border-[#45404F]">
                  {int.category}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-serif text-[#86D6A6]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#86D6A6]" />
                  <span>{int.status}</span>
                </span>
              </div>

              <div>
                <h4 className="font-normal font-serif text-xs text-[#E2DDE7]">{int.name}</h4>
                <p className="text-[11px] text-[#AAA2B3] font-serif mt-1 line-clamp-2 leading-relaxed">{int.description}</p>
              </div>

              <div className="pt-2 border-t border-[#45404F] grid grid-cols-2 gap-2 text-[10px] font-mono text-[#716879]">
                <div>
                  <span className="font-serif">Protocol:</span>
                  <p className="text-[#E2DDE7] font-medium truncate">{int.protocol}</p>
                </div>
                <div>
                  <span className="font-serif">Ingested:</span>
                  <p className="text-[#AAA2B3] font-bold truncate">{int.eventsIngested.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Controls & State Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 vintage-card space-y-3 text-xs font-serif">
          <h3 className="text-sm font-normal text-[#E2DDE7] flex items-center gap-2">
            <Database size={15} className="text-[#AAA2B3]" />
            <span>Demonstration State Storage</span>
          </h3>
          <p className="text-[#AAA2B3]">
            Current changes are saved to browser local state for immediate interactive demonstration.
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
          <h3 className="text-sm font-normal text-[#E2DDE7] flex items-center gap-2">
            <Layers size={15} className="text-[#AAA2B3]" />
            <span>Manufacturing Batch Configuration</span>
          </h3>
          <p className="text-[#AAA2B3]">
            Standard demonstration batch size is configured to <strong>100 units/batch</strong> (e.g. ABC-0001 through ABC-0100).
          </p>
          <div className="p-3 bg-[#17151C] border border-[#45404F] font-mono text-[11px] text-[#E2DDE7]">
            Batch Namespace: <span className="text-[#AAA2B3] font-bold">GT-KOREA-GUMI-L2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
