import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  GitFork,
  Smartphone,
  Cpu,
  Layers,
  Truck,
  Clock,
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';

export const TraceabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || 'ABC';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeDirection, setActiveDirection] = useState<'forward' | 'backward'>('forward');

  // Search results state
  const [forwardResult, setForwardResult] = useState<any>(null);
  const [backwardResult, setBackwardResult] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);

  const executeSearch = (query: string) => {
    const q = query.trim().toUpperCase();
    if (!q) return;

    if (q.startsWith('GT-DEV') || q.length === 15) {
      // Backward trace from phone
      setActiveDirection('backward');
      const res = GeneaTraceStore.traceBackwardFromProduct(q);
      setBackwardResult(res);
      setForwardResult(null);
      setLatencyMs(res.traversalTimeMs);
    } else {
      // Forward trace from batch or component
      setActiveDirection('forward');
      const batchId = q.includes('-') ? q.split('-')[0] : q;
      const res = GeneaTraceStore.traceForwardFromBatch(batchId);
      setForwardResult(res);
      setBackwardResult(null);
      setLatencyMs(res.traversalTimeMs);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const exportAffectedProductsCsv = () => {
    if (!forwardResult || !forwardResult.affectedProducts) return;
    const header = 'Product ID,Display Serial,Battery Serial,PCB Serial,Camera Serial,Shipment ID,Status\n';
    const rows = forwardResult.affectedProducts
      .map(
        (p: any) =>
          `${p.productId},${p.installedComponents.displaySerial},${p.installedComponents.batterySerial},${p.installedComponents.pcbSerial},${p.installedComponents.cameraSerial},${p.shipmentId},${p.status}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geneatrace-affected-products-${forwardResult.batch?.batchId || 'batch'}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Search className="text-cyan-400" size={24} />
            <span>Multi-Directional Traceability Explorer</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Bi-directional Merkle graph traversal engine across components, assembly lines, and shipment manifests.
          </p>
        </div>

        {/* Measured Latency Chip */}
        {latencyMs > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <Zap size={14} className="text-amber-400" />
            <span className="text-slate-400">Graph Traversal:</span>
            <span className="text-emerald-400 font-bold">{latencyMs} ms</span>
            <span className="text-slate-500">(Sub-100ms benchmark)</span>
          </div>
        )}
      </div>

      {/* Query Bar & Presets */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            executeSearch(searchQuery);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Enter Batch ID (e.g. ABC), Serial (e.g. ABC-0042), Product ID (e.g. GT-DEV-00000851), or IMEI..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-600/20"
          >
            <span>Traverse Graph</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Demo Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60 text-xs">
          <span className="text-slate-500 font-mono text-[11px] uppercase">Example Presets:</span>
          <button
            onClick={() => {
              setSearchQuery('ABC');
              executeSearch('ABC');
            }}
            className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-red-300 font-mono transition-colors"
          >
            Defective Display Batch ABC (Forward)
          </button>
          <button
            onClick={() => {
              setSearchQuery('GT-DEV-00000851');
              executeSearch('GT-DEV-00000851');
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono transition-colors"
          >
            Finished Phone GT-DEV-00000851 (Backward)
          </button>
          <button
            onClick={() => {
              setSearchQuery('ABC-0042');
              executeSearch('ABC-0042');
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
          >
            Component Serial ABC-0042
          </button>
        </div>
      </div>

      {/* FORWARD TRACE RESULTS (Batch -> Components -> Phones -> Shipments) */}
      {forwardResult && forwardResult.batch && (
        <div className="space-y-6">
          {/* Summary Stat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-mono">Source Batch</span>
              <p className="text-xl font-bold text-white font-mono mt-1">Batch {forwardResult.batch.batchId}</p>
              <span className="text-[11px] text-cyan-400">{forwardResult.totalUnits} Units Total</span>
            </div>
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30">
              <span className="text-xs text-red-300 font-mono">Affected Finished Phones</span>
              <p className="text-xl font-bold text-red-400 font-mono mt-1">{forwardResult.affectedProducts.length} Phones</p>
              <span className="text-[11px] text-red-300">Assembled &amp; Dispatched</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-mono">Associated Shipments</span>
              <p className="text-xl font-bold text-white font-mono mt-1">{forwardResult.affectedShipments.length} Active</p>
              <span className="text-[11px] text-amber-400">{forwardResult.inTransitCount} in Transit</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-mono">Delivered to Customers</span>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{forwardResult.deliveredCount} Units</p>
              <span className="text-[11px] text-slate-400">Recall Notice Required</span>
            </div>
          </div>

          {/* Impact Visual Hierarchy */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Traversed Finished Products with Installed Components</h3>
                <p className="text-xs text-slate-400">
                  Every phone below carries a display panel manufactured in defective Batch {forwardResult.batch.batchId}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportAffectedProductsCsv}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => navigate('/recalls')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <AlertTriangle size={14} />
                  <span>Launch Recall Action</span>
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Product ID</th>
                    <th className="py-2.5 px-3">Installed Display Serial</th>
                    <th className="py-2.5 px-3">Battery Serial</th>
                    <th className="py-2.5 px-3">Main PCB Serial</th>
                    <th className="py-2.5 px-3">Assigned Shipment</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Passport</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {forwardResult.affectedProducts.map((p: any) => (
                    <tr key={p.productId} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold text-white">{p.productId}</td>
                      <td className="py-2 px-3 text-red-400 font-bold">{p.installedComponents.displaySerial}</td>
                      <td className="py-2 px-3 text-slate-300">{p.installedComponents.batterySerial}</td>
                      <td className="py-2 px-3 text-slate-300">{p.installedComponents.pcbSerial}</td>
                      <td className="py-2 px-3 text-amber-400">{p.shipmentId}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => navigate(`/passport/${p.productId}`)}
                          className="text-cyan-400 hover:underline flex items-center gap-1 ml-auto"
                        >
                          <span>Open</span>
                          <ExternalLink size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BACKWARD TRACE RESULTS (Phone -> Components -> Batches -> Operations) */}
      {backwardResult && backwardResult.product && (
        <div className="space-y-6">
          {/* Phone Header Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white font-mono">{backwardResult.product.productId}</h2>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold">
                    {backwardResult.product.productModel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-bold font-mono">
                    {backwardResult.product.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Protected IMEI: <span className="font-mono text-slate-200">{backwardResult.product.imeiMasked}</span> • Assembled: <span className="font-mono text-slate-200">{backwardResult.product.assemblyDate}</span>
                </p>
              </div>

              <button
                onClick={() => navigate(`/passport/${backwardResult.product.productId}`)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
              >
                <span>View Full Product Passport</span>
                <ExternalLink size={14} />
              </button>
            </div>

            {/* Installed Components Lineage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              {backwardResult.components.map((c: any) => (
                <div key={c.category} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{c.category}</span>
                    <span className="text-[10px] text-cyan-400">Batch {c.batch}</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">{c.serial}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {c.record?.manufacturer || 'Certified Supplier'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Manufacturing Operation History */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white">Chronological Manufacturing &amp; Assembly Operations</h3>
            <div className="space-y-2">
              {backwardResult.events.map((e: any) => (
                <div key={e.eventId} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px]">{e.operationId}</span>
                    <div>
                      <span className="font-bold text-white">{e.operationName}</span>
                      <span className="text-slate-400 text-[11px] ml-2">Machine: {e.machineId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>{e.completionTimestamp}</span>
                    <span className={e.result === 'OK' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {e.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
