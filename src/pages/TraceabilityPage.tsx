import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Download,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  ChevronRight,
  Smartphone,
  Cpu,
  Clock
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { api } from '../services/apiClient';

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
  const [backendVerified, setBackendVerified] = useState<boolean | null>(null);

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

      // Async verification with Azure FastAPI backend
      api.traceProduct(q)
        .then(apiRes => {
          console.log(`Backend backward trace for ${q}:`, apiRes);
          setBackendVerified(true);
        })
        .catch(err => {
          console.warn('Backend traceProduct fallback:', err);
          setBackendVerified(false);
        });
    } else {
      // Forward trace from batch or component
      setActiveDirection('forward');
      const batchId = q.includes('-') ? q.split('-')[0] : q;
      const res = GeneaTraceStore.traceForwardFromBatch(batchId);
      setForwardResult(res);
      setBackwardResult(null);
      setLatencyMs(res.traversalTimeMs);

      // Async verification with Azure FastAPI backend
      api.traceBatch(batchId)
        .then(apiRes => {
          console.log(`Backend forward trace for batch ${batchId}:`, apiRes);
          setBackendVerified(true);
        })
        .catch(err => {
          console.warn('Backend traceBatch fallback:', err);
          setBackendVerified(false);
        });
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const exportAffectedProductsCsv = () => {
    if (!forwardResult || !forwardResult.affectedProducts) return;
    const header = 'Product ID,Display Serial,Shipment ID,Status\n';
    const rows = forwardResult.affectedProducts
      .map(
        (p: any) =>
          `${p.productId},${p.installedComponents?.displaySerial || p.installedComponents?.['Display Module'] || 'N/A'},${p.shipmentId},${p.status}`
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
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Search className="text-blue-600" size={24} />
            <span>Traceability Engine (Merkle DAG)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bi-directional graph traversal across sub-assemblies, production stations, and shipment manifests.
          </p>
        </div>

        {/* Measured Latency Chip */}
        {latencyMs > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800">
            <Zap size={14} className="text-emerald-600" />
            <span>Traversal:</span>
            <span className="font-bold">{latencyMs} ms</span>
            <span className="text-emerald-600/70 text-[11px]">(Sub-50ms DAG)</span>
          </div>
        )}
      </div>

      {/* Query Bar & Presets Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4"
      >
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
              placeholder="Enter Batch ID (ABC), Component Serial (ABC-0042), or Product ID (GT-DEV-00000851)..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn-modern-accent flex items-center justify-center gap-2 text-xs py-3 px-6 rounded-xl font-semibold"
          >
            <span>Traverse Graph</span>
            <ArrowRight size={14} />
          </motion.button>
        </form>

        {/* Quick Demo Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Example Presets:</span>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setSearchQuery('ABC');
              executeSearch('ABC');
            }}
            className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-mono text-xs font-medium transition-all"
          >
            Batch ABC (Forward Trace)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setSearchQuery('GT-DEV-00000851');
              executeSearch('GT-DEV-00000851');
            }}
            className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-mono text-xs font-medium transition-all"
          >
            Product GT-DEV-00000851 (Backward Trace)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setSearchQuery('ABC-0042');
              executeSearch('ABC-0042');
            }}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono text-xs font-medium transition-all"
          >
            Component ABC-0042
          </motion.button>
        </div>
      </motion.div>

      {/* FORWARD TRACE RESULTS (Batch -> Components -> Products -> Shipments) */}
      <AnimatePresence mode="wait">
        {forwardResult && forwardResult.batch && (
          <motion.div
            key="forward-results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-6"
          >
            {/* Summary Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Source Batch</span>
                <p className="text-xl font-bold text-slate-900 mt-1">Batch {forwardResult.batch.batchId}</p>
                <span className="text-[11px] text-blue-600 font-mono font-medium">{forwardResult.totalUnits} Unit Registered</span>
              </div>
              <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl shadow-xs space-y-1">
                <span className="text-xs text-rose-600 font-medium uppercase tracking-wider">Affected Products</span>
                <p className="text-xl font-bold text-rose-700 mt-1">{forwardResult.affectedProducts.length} Device</p>
                <span className="text-[11px] text-rose-600/80 font-medium">Assembled &amp; Flagged</span>
              </div>
              <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Shipment In Transit</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{forwardResult.affectedShipments.length} Cargo</p>
                <span className="text-[11px] text-amber-600 font-medium">{forwardResult.inTransitCount} Hold Pending</span>
              </div>
              <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Custody Hold Status</span>
                <p className="text-xl font-bold text-emerald-600 mt-1">Pre-Delivery</p>
                <span className="text-[11px] text-slate-500 font-medium">Munich Gateway Intercept</span>
              </div>
            </div>

            {/* Impact Visual Hierarchy */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Traversed Lineage Record</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Product carrying component manufactured from Batch {forwardResult.batch.batchId}.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={exportAffectedProductsCsv}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/recalls')}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <AlertTriangle size={13} />
                    <span>Launch Recall Action</span>
                  </motion.button>
                </div>
              </div>

              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Product ID</th>
                      <th className="py-3 px-4 font-semibold">Installed Display</th>
                      <th className="py-3 px-4 font-semibold">Shipment</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Passport</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {forwardResult.affectedProducts.map((p: any) => (
                      <tr key={p.productId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{p.productId}</td>
                        <td className="py-3 px-4 text-rose-600 font-bold">{p.installedComponents?.displaySerial || p.installedComponents?.['Display Module'] || 'ABC-0042'}</td>
                        <td className="py-3 px-4 text-amber-600 font-medium">{p.shipmentId}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => navigate(`/passport/${p.productId}`)}
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 ml-auto text-xs"
                          >
                            <span>Open</span>
                            <ExternalLink size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACKWARD TRACE RESULTS (Product -> Components -> Batches -> Operations) */}
      <AnimatePresence mode="wait">
        {backwardResult && backwardResult.product && (
          <motion.div
            key="backward-results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-6"
          >
            {/* Product Header Card */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">{backwardResult.product.productId}</h2>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                      {backwardResult.product.productModel}
                    </span>
                    <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">
                      {backwardResult.product.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    IMEI: <span className="font-mono text-slate-700 font-semibold">{backwardResult.product.imeiMasked}</span> • Assembled: <span className="font-mono text-slate-700">{backwardResult.product.assemblyDate}</span>
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/passport/${backwardResult.product.productId}`)}
                  className="btn-modern-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
                >
                  <span>View Digital Passport</span>
                  <ExternalLink size={13} />
                </motion.button>
              </div>

              {/* Installed Components Lineage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {backwardResult.components.map((c: any) => (
                  <div key={c.category} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-slate-400 font-sans">
                      <span>{c.category}</span>
                      <span className="text-[10px] text-blue-600 font-mono font-semibold">Batch {c.batch}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-1">{c.serial}</div>
                    <div className="text-[11px] text-slate-500 font-sans truncate">
                      {c.record?.manufacturer || 'Samsung Display Corp (South Korea)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chronological Manufacturing Operation History */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Cryptographically Hashed Manufacturing Timeline
              </h3>
              <div className="space-y-2">
                {backwardResult.events.map((e: any) => (
                  <div key={e.eventId} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between text-xs font-mono hover:bg-slate-100/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded-md text-[10px] font-bold">{e.operationId}</span>
                      <div>
                        <span className="font-semibold text-slate-900 font-sans">{e.operationName}</span>
                        <span className="text-slate-400 text-[11px] ml-2">Station: {e.machineId}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500">
                      <span className="text-[11px] font-mono">{e.completionTimestamp}</span>
                      <span className={e.result === 'OK' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {e.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
