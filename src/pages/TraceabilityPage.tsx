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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#45404F] pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[#E2DDE7] flex items-center gap-2">
            <Search className="text-[#AAA2B3]" size={22} />
            <span>Multi-Directional Traceability Explorer</span>
          </h1>
          <p className="text-xs text-[#AAA2B3] font-serif mt-1">
            Bi-directional Merkle graph traversal engine across components, assembly lines, and shipment manifests.
          </p>
        </div>

        {/* Measured Latency Chip */}
        {latencyMs > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#292531] border border-[#45404F] text-xs font-mono text-[#E2DDE7]">
            <Zap size={14} className="text-[#E8BC7A]" />
            <span className="text-[#AAA2B3]">Traversal:</span>
            <span className="text-[#86D6A6] font-bold">{latencyMs} ms</span>
            <span className="text-[#716879] text-[11px] font-serif">(Sub-100ms benchmark)</span>
          </div>
        )}
      </div>

      {/* Query Bar & Presets */}
      <div className="p-5 vintage-card space-y-4">
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
              className="w-full pl-10 pr-4 py-2.5 bg-[#17151C] border border-[#45404F] rounded-none text-xs text-[#E2DDE7] placeholder-[#716879] font-mono focus:outline-none focus:border-[#AAA2B3]"
            />
            <Search className="w-4 h-4 text-[#716879] absolute left-3 top-3" />
          </div>

          <button
            type="submit"
            className="btn-vintage-primary flex items-center justify-center gap-2 text-xs py-2.5 px-6 uppercase tracking-wider"
          >
            <span>Traverse Graph</span>
            <ArrowRight size={13} />
          </button>
        </form>

        {/* Quick Demo Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#45404F] text-xs font-serif">
          <span className="text-[#716879] text-[11px] uppercase tracking-wider">Example Presets:</span>
          <button
            onClick={() => {
              setSearchQuery('ABC');
              executeSearch('ABC');
            }}
            className="px-2.5 py-1 rounded-none bg-[#2D1C22] hover:bg-[#3d232c] border border-[#5A2C35] text-[#F08C8A] font-mono text-[11px] transition-colors"
          >
            Defective Display Batch ABC (Forward)
          </button>
          <button
            onClick={() => {
              setSearchQuery('GT-DEV-00000851');
              executeSearch('GT-DEV-00000851');
            }}
            className="px-2.5 py-1 rounded-none bg-[#292531] hover:bg-[#342f3d] border border-[#45404F] text-[#E2DDE7] font-mono text-[11px] transition-colors"
          >
            Finished Product GT-DEV-00000851 (Backward)
          </button>
          <button
            onClick={() => {
              setSearchQuery('ABC-0042');
              executeSearch('ABC-0042');
            }}
            className="px-2.5 py-1 rounded-none bg-[#17151C] hover:bg-[#292531] border border-[#45404F] text-[#AAA2B3] font-mono text-[11px] transition-colors"
          >
            Component Serial ABC-0042
          </button>
        </div>
      </div>

      {/* FORWARD TRACE RESULTS (Batch -> Components -> Products -> Shipments) */}
      {forwardResult && forwardResult.batch && (
        <div className="space-y-6">
          {/* Summary Stat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 vintage-card">
              <span className="text-xs text-[#716879] font-serif">Source Batch</span>
              <p className="text-xl font-normal font-serif text-[#E2DDE7] mt-1">Batch {forwardResult.batch.batchId}</p>
              <span className="text-[11px] text-[#AAA2B3] font-mono">{forwardResult.totalUnits} Units Total</span>
            </div>
            <div className="p-4 rounded-none bg-[#2D1C22] border border-[#5A2C35]">
              <span className="text-xs text-[#F08C8A] font-serif">Affected Finished Products</span>
              <p className="text-xl font-normal font-serif text-[#F08C8A] mt-1">{forwardResult.affectedProducts.length} Units</p>
              <span className="text-[11px] text-[#F08C8A]/80 font-serif">Assembled &amp; Dispatched</span>
            </div>
            <div className="p-4 vintage-card">
              <span className="text-xs text-[#716879] font-serif">Associated Shipments</span>
              <p className="text-xl font-normal font-serif text-[#E2DDE7] mt-1">{forwardResult.affectedShipments.length} Active</p>
              <span className="text-[11px] text-[#E8BC7A] font-serif">{forwardResult.inTransitCount} in Transit</span>
            </div>
            <div className="p-4 vintage-card">
              <span className="text-xs text-[#716879] font-serif">Delivered to End Custody</span>
              <p className="text-xl font-normal font-serif text-[#86D6A6] mt-1">{forwardResult.deliveredCount} Units</p>
              <span className="text-[11px] text-[#AAA2B3] font-serif">Recall Notice Required</span>
            </div>
          </div>

          {/* Impact Visual Hierarchy */}
          <div className="p-5 vintage-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#45404F] pb-3">
              <div>
                <h3 className="text-sm font-normal font-serif text-[#E2DDE7]">Traversed Finished Products with Installed Components</h3>
                <p className="text-xs text-[#AAA2B3] font-serif">
                  Every product below carries a component manufactured in defective Batch {forwardResult.batch.batchId}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportAffectedProductsCsv}
                  className="px-3 py-1.5 rounded-none bg-[#292531] hover:bg-[#342f3d] border border-[#45404F] text-[#E2DDE7] text-xs font-serif flex items-center gap-1.5 transition-colors"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => navigate('/recalls')}
                  className="btn-vintage-accent text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <AlertTriangle size={13} />
                  <span>Launch Recall Action</span>
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto border border-[#45404F]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#292531] text-[#AAA2B3] sticky top-0 border-b border-[#45404F] font-serif text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 font-normal">Product ID</th>
                    <th className="py-2.5 px-3 font-normal">Installed Display</th>
                    <th className="py-2.5 px-3 font-normal">Battery Serial</th>
                    <th className="py-2.5 px-3 font-normal">Main PCB</th>
                    <th className="py-2.5 px-3 font-normal">Shipment</th>
                    <th className="py-2.5 px-3 font-normal">Status</th>
                    <th className="py-2.5 px-3 font-normal text-right">Passport</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#45404F] bg-[#17151C]">
                  {forwardResult.affectedProducts.map((p: any) => (
                    <tr key={p.productId} className="hover:bg-[#292531]/50 transition-colors">
                      <td className="py-2 px-3 font-bold text-[#E2DDE7]">{p.productId}</td>
                      <td className="py-2 px-3 text-[#F08C8A] font-bold">{p.installedComponents.displaySerial}</td>
                      <td className="py-2 px-3 text-[#AAA2B3]">{p.installedComponents.batterySerial}</td>
                      <td className="py-2 px-3 text-[#AAA2B3]">{p.installedComponents.pcbSerial}</td>
                      <td className="py-2 px-3 text-[#E8BC7A]">{p.shipmentId}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded-none text-[10px] bg-[#2D1C22] text-[#F08C8A] border border-[#5A2C35]">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => navigate(`/passport/${p.productId}`)}
                          className="text-[#E2DDE7] hover:underline flex items-center gap-1 ml-auto font-serif text-[11px]"
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

      {/* BACKWARD TRACE RESULTS (Product -> Components -> Batches -> Operations) */}
      {backwardResult && backwardResult.product && (
        <div className="space-y-6">
          {/* Product Header Card */}
          <div className="p-5 vintage-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#45404F]">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-normal font-serif text-[#E2DDE7]">{backwardResult.product.productId}</h2>
                  <span className="px-2 py-0.5 bg-[#292531] text-[#E2DDE7] border border-[#45404F] text-xs font-serif">
                    {backwardResult.product.productModel}
                  </span>
                  <span className="px-2 py-0.5 bg-[#2D1C22] text-[#F08C8A] border border-[#5A2C35] text-xs font-serif">
                    {backwardResult.product.status}
                  </span>
                </div>
                <p className="text-xs text-[#AAA2B3] font-serif mt-1">
                  Protected Identifier: <span className="font-mono text-[#E2DDE7]">{backwardResult.product.imeiMasked}</span> • Assembled: <span className="font-mono text-[#E2DDE7]">{backwardResult.product.assemblyDate}</span>
                </p>
              </div>

              <button
                onClick={() => navigate(`/passport/${backwardResult.product.productId}`)}
                className="btn-vintage-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <span>View Full Product Passport</span>
                <ExternalLink size={13} />
              </button>
            </div>

            {/* Installed Components Lineage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              {backwardResult.components.map((c: any) => (
                <div key={c.category} className="p-3 bg-[#17151C] border border-[#45404F] text-xs font-mono">
                  <div className="flex items-center justify-between text-[#716879] font-serif">
                    <span>{c.category}</span>
                    <span className="text-[10px] text-[#AAA2B3] font-mono">Batch {c.batch}</span>
                  </div>
                  <div className="text-sm font-bold text-[#E2DDE7] mt-1">{c.serial}</div>
                  <div className="text-[10px] text-[#AAA2B3] font-serif mt-0.5 truncate">
                    {c.record?.manufacturer || 'Certified Tier-1 Supplier'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Manufacturing Operation History */}
          <div className="p-5 vintage-card space-y-4">
            <h3 className="text-sm font-normal font-serif text-[#E2DDE7]">Chronological Manufacturing &amp; Assembly Operations</h3>
            <div className="space-y-2">
              {backwardResult.events.map((e: any) => (
                <div key={e.eventId} className="p-3 bg-[#17151C] border border-[#45404F] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-[#292531] text-[#E2DDE7] border border-[#45404F] text-[10px] font-mono">{e.operationId}</span>
                    <div>
                      <span className="font-normal font-serif text-sm text-[#E2DDE7]">{e.operationName}</span>
                      <span className="text-[#716879] text-[11px] font-mono ml-2">Machine: {e.machineId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[#AAA2B3]">
                    <span className="text-[11px]">{e.completionTimestamp}</span>
                    <span className={e.result === 'OK' ? 'text-[#86D6A6] font-bold' : 'text-[#F08C8A] font-bold'}>
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
