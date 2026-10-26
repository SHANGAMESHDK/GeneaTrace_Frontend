import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';

export const AssemblyTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const products = GeneaTraceStore.getProducts();

  const assemblySteps = [
    { id: '1', step: 'PCB Assembly', machine: 'SMT-01', eventId: 'EVT-100201', desc: 'Main logic board placement & solder paste reflow', time: '11:00:00', result: 'OK', status: 'Completed' },
    { id: '2', step: 'Component Mounting', machine: 'AS-02', eventId: 'EVT-100202', desc: 'Display, camera arrays & battery automated robotic mounting', time: '11:12:00', result: 'OK', status: 'Completed' },
    { id: '3', step: 'Main Assembly', machine: 'AS-03', eventId: 'EVT-100203', desc: 'Internal chassis routing, shielding & acoustic sealing', time: '11:24:00', result: 'OK', status: 'Completed' },
    { id: '4', step: 'Final Assembly & Sealing', machine: 'FA-01', eventId: 'EVT-100204', desc: 'IP68 waterproof seal, titanium rim screw fastening', time: '11:36:00', result: 'OK', status: 'Completed' },
    { id: '5', step: 'Functional Test', machine: 'FT-01', eventId: 'EVT-100205', desc: 'Screen color calibration, RF signal BIST & sensor audit', time: '11:48:00', result: 'OK', status: 'Completed' },
    { id: '6', step: 'Packaging & DPP Laser', machine: 'PK-01', eventId: 'EVT-100206', desc: 'Laser engraving QR code, box sealing & Merkle commit', time: '12:00:00', result: 'OK', status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Smartphone className="text-indigo-400" size={24} />
            <span>Smartphone Final Assembly Line Tracking</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Sequential work order execution across Cleanroom Mega-Hub 4, Line 2. Unit-level event generation for every section.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Conveyor Line 2 Active (99.4% OEE)</span>
          </span>
        </div>
      </div>

      {/* Assembly Pipeline Visual Cards (Infographic Section 3) */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Sequential Assembly Stages &amp; Recorded Machine Events</h3>
          <span className="text-xs font-mono text-slate-400">Target Device: GT-DEV-00000851</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {assemblySteps.map((step, idx) => (
            <div
              key={step.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono pb-1 border-b border-slate-800/80">
                  <span className="text-indigo-400 font-bold">Stage 3.{idx + 1}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300">{step.machine}</span>
                </div>
                <h4 className="font-bold text-xs text-white mt-2 leading-tight">{step.step}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-normal">{step.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 space-y-1 font-mono text-[10px]">
                <div className="flex justify-between text-slate-500">
                  <span>Event ID:</span>
                  <span className="text-cyan-400">{step.eventId}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Inspection:</span>
                  <span className="text-emerald-400 font-bold">{step.result}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assembled Devices Stream */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recently Assembled Smartphones ({products.length} Tracked)</h3>
            <p className="text-xs text-slate-400">
              Each completed assembly links exactly one serial from Display, Battery, PCB, Camera, Speaker, and Frame.
            </p>
          </div>
          <button
            onClick={() => navigate('/passport/GT-DEV-00000851')}
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Flagship: GT-DEV-00000851</span>
            <ExternalLink size={12} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Product ID</th>
                <th className="py-2.5 px-3">Display Serial</th>
                <th className="py-2.5 px-3">Battery Serial</th>
                <th className="py-2.5 px-3">PCB Serial</th>
                <th className="py-2.5 px-3">Camera Serial</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Passport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.slice(0, 20).map(p => (
                <tr key={p.productId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-white">{p.productId}</td>
                  <td className="py-2 px-3 text-cyan-400">{p.installedComponents.displaySerial}</td>
                  <td className="py-2 px-3 text-slate-300">{p.installedComponents.batterySerial}</td>
                  <td className="py-2 px-3 text-slate-300">{p.installedComponents.pcbSerial}</td>
                  <td className="py-2 px-3 text-slate-300">{p.installedComponents.cameraSerial}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        p.status === 'Recall Flagged'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => navigate(`/passport/${p.productId}`)}
                      className="text-cyan-400 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
