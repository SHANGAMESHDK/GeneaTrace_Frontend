import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Cpu,
  Search,
  Filter,
  Download,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  X
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { ComponentRecord, ComponentCategory } from '../types';

export const ComponentRegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [selectedQuality, setSelectedQuality] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const [selectedComponent, setSelectedComponent] = useState<ComponentRecord | null>(null);

  const batches = GeneaTraceStore.getBatches();
  const allComponents = useMemo(() => {
    return GeneaTraceStore.getComponents({
      search,
      type: selectedType,
      batchId: selectedBatch,
      qualityStatus: selectedQuality
    });
  }, [search, selectedType, selectedBatch, selectedQuality]);

  const totalPages = Math.ceil(allComponents.length / pageSize) || 1;
  const paginatedComponents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allComponents.slice(start, start + pageSize);
  }, [allComponents, currentPage, pageSize]);

  const exportCsv = () => {
    const header = 'Component ID,Serial Number,Batch ID,Type,Manufacturer,Supplier,Status,Quality Status,Installed in Product\n';
    const rows = allComponents
      .map(
        c =>
          `${c.componentId},${c.serialNumber},${c.batchId},${c.type},${c.manufacturer},${c.supplier},${c.status},${c.qualityStatus},${c.installedInProductId || 'None'}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geneatrace-components-registry.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="text-cyan-400" size={24} />
            <span>Component Registry &amp; Serial Inventory</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Unit-level serialization across displays, batteries, motherboards, cameras, frames, and sensors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => navigate('/batches')}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
          >
            <Plus size={14} />
            <span>Batch Operations</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search serial (e.g. ABC-0042) or ID..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={selectedType}
          onChange={e => {
            setSelectedType(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
        >
          <option value="All">All Categories</option>
          <option value="Display">Display</option>
          <option value="Battery">Battery</option>
          <option value="Main PCB">Main PCB</option>
          <option value="Camera Module">Camera Module</option>
          <option value="Speaker">Speaker</option>
          <option value="Frame">Frame</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={selectedBatch}
          onChange={e => {
            setSelectedBatch(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
        >
          <option value="All">All Batches</option>
          {batches.map(b => (
            <option key={b.batchId} value={b.batchId}>
              Batch {b.batchId} ({b.componentType})
            </option>
          ))}
        </select>

        <select
          value={selectedQuality}
          onChange={e => {
            setSelectedQuality(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono"
        >
          <option value="All">All Quality Statuses</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
          <option value="Pending">Pending</option>
        </select>

        <span className="text-xs text-slate-500 font-mono ml-auto">
          Found: <strong className="text-slate-300">{allComponents.length}</strong> items
        </span>
      </div>

      {/* Components Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Component ID</th>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Installed In</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedComponents.map(c => {
                const isDefective = c.batchId === 'ABC';
                return (
                  <tr
                    key={c.serialNumber}
                    onClick={() => setSelectedComponent(c)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className={`py-2.5 px-4 font-bold ${isDefective ? 'text-red-400' : 'text-cyan-400'}`}>
                      {c.serialNumber}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{c.componentId}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px]">
                        {c.batchId}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{c.type}</td>
                    <td className="py-2.5 px-4 text-slate-400 truncate max-w-[150px]">{c.supplier}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.status === 'Recalled' || c.status === 'Quality Failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {c.installedInProductId ? (
                        <span className="text-cyan-400 hover:underline">{c.installedInProductId}</span>
                      ) : (
                        <span className="text-slate-500">Inventory</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/traceability?query=${c.serialNumber}`);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Trace
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Component Detail Drawer */}
      {selectedComponent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 space-y-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold">Component Specification</span>
              <button onClick={() => setSelectedComponent(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white font-mono">{selectedComponent.serialNumber}</h2>
              <span className="text-xs text-slate-400 font-mono">{selectedComponent.componentId}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="text-white font-bold">{selectedComponent.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch ID:</span>
                <button
                  onClick={() => navigate(`/batches?search=${selectedComponent.batchId}`)}
                  className="text-cyan-400 hover:underline"
                >
                  Batch {selectedComponent.batchId}
                </button>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Manufacturer:</span>
                <span className="text-slate-300">{selectedComponent.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-300">{selectedComponent.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quality Status:</span>
                <span
                  className={
                    selectedComponent.qualityStatus === 'Passed' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'
                  }
                >
                  {selectedComponent.qualityStatus}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-slate-400">Cryptographic Signature</span>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
                {selectedComponent.cryptographicHash}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => navigate(`/traceability?query=${selectedComponent.serialNumber}`)}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2"
              >
                <span>Full Graph Traversal for Unit</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
