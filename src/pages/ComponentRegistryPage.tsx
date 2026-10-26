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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#60433D] pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[#E8D8CE] flex items-center gap-2">
            <Cpu className="text-[#C1A094]" size={22} />
            <span>Component Registry &amp; Serial Inventory</span>
          </h1>
          <p className="text-xs text-[#C1A094] font-serif mt-1">
            Unit-level serialization across displays, batteries, motherboards, cameras, frames, and sensors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="px-3.5 py-2 rounded-none bg-[#60433D] hover:bg-[#342f3d] border border-[#60433D] text-[#E8D8CE] text-xs font-serif flex items-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => navigate('/batches')}
            className="btn-vintage-accent text-xs py-2 px-3.5 flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Plus size={13} />
            <span>Batch Operations</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 vintage-card flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search serial (e.g. ABC-0042) or ID..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 bg-[#211B1A] border border-[#60433D] rounded-none text-xs text-[#E8D8CE] font-mono focus:outline-none focus:border-[#C1A094]"
          />
          <Search className="w-3.5 h-3.5 text-[#C1A094] absolute left-2.5 top-2.5" />
        </div>

        <select
          value={selectedType}
          onChange={e => {
            setSelectedType(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 bg-[#60433D] border border-[#60433D] rounded-none text-xs text-[#E8D8CE] font-serif"
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
          className="px-3 py-1.5 bg-[#60433D] border border-[#60433D] rounded-none text-xs text-[#E8D8CE] font-serif"
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
          className="px-3 py-1.5 bg-[#60433D] border border-[#60433D] rounded-none text-xs text-[#E8D8CE] font-serif"
        >
          <option value="All">All Quality Statuses</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
          <option value="Pending">Pending</option>
        </select>

        <span className="text-xs text-[#916B60] font-serif ml-auto">
          Found: <strong className="text-[#E8D8CE] font-mono">{allComponents.length}</strong> items
        </span>
      </div>

      {/* Components Table */}
      <div className="vintage-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#60433D] text-[#C1A094] border-b border-[#60433D] font-serif text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-normal">Serial Number</th>
                <th className="py-3 px-4 font-normal">Component ID</th>
                <th className="py-3 px-4 font-normal">Batch ID</th>
                <th className="py-3 px-4 font-normal">Type</th>
                <th className="py-3 px-4 font-normal">Supplier</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 px-4 font-normal">Installed In</th>
                <th className="py-3 px-4 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#60433D] bg-[#211B1A]">
              {paginatedComponents.map(c => {
                const isDefective = c.batchId === 'ABC';
                return (
                  <tr
                    key={c.serialNumber}
                    onClick={() => setSelectedComponent(c)}
                    className="hover:bg-[#60433D]/50 cursor-pointer transition-colors"
                  >
                    <td className={`py-2.5 px-4 font-bold ${isDefective ? 'text-[#F08C8A]' : 'text-[#E8D8CE]'}`}>
                      {c.serialNumber}
                    </td>
                    <td className="py-2.5 px-4 text-[#C1A094]">{c.componentId}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-1.5 py-0.5 bg-[#60433D] text-[#E8D8CE] border border-[#60433D] text-[10px]">
                        {c.batchId}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[#E8D8CE] font-serif">{c.type}</td>
                    <td className="py-2.5 px-4 text-[#C1A094] font-serif truncate max-w-[150px]">{c.supplier}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono border ${
                          c.status === 'Recalled' || c.status === 'Quality Failed'
                            ? 'bg-[#2D1C22] text-[#F08C8A] border-[#5A2C35]'
                            : 'bg-[#1B2D22] text-[#86D6A6] border-[#2D543B]'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[#E8D8CE]">
                      {c.installedInProductId ? (
                        <span className="text-[#E8D8CE] hover:underline">{c.installedInProductId}</span>
                      ) : (
                        <span className="text-[#916B60] font-serif">Inventory</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/traceability?query=${c.serialNumber}`);
                        }}
                        className="text-[#E8D8CE] hover:underline font-serif text-[11px]"
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
        <div className="p-3 border-t border-[#60433D] flex items-center justify-between text-xs font-serif bg-[#382A28]">
          <span className="text-[#C1A094]">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[#60433D] hover:bg-[#342f3d] border border-[#60433D] disabled:opacity-40 text-[#E8D8CE] transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-[#60433D] hover:bg-[#342f3d] border border-[#60433D] disabled:opacity-40 text-[#E8D8CE] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Component Detail Drawer */}
      {selectedComponent && (
        <div className="fixed inset-0 z-50 bg-[#211B1A]/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-[#382A28] border-l border-[#60433D] h-full p-6 space-y-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#60433D]">
              <span className="text-xs font-serif uppercase tracking-wider text-[#C1A094]">Component Specification</span>
              <button onClick={() => setSelectedComponent(null)} className="text-[#C1A094] hover:text-[#E8D8CE]">
                <X size={18} />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-normal font-serif text-[#E8D8CE]">{selectedComponent.serialNumber}</h2>
              <span className="text-xs text-[#916B60] font-mono">{selectedComponent.componentId}</span>
            </div>

            <div className="p-4 bg-[#211B1A] border border-[#60433D] space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#C1A094] font-serif">Category:</span>
                <span className="text-[#E8D8CE] font-serif font-bold">{selectedComponent.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C1A094] font-serif">Batch ID:</span>
                <button
                  onClick={() => navigate(`/batches?search=${selectedComponent.batchId}`)}
                  className="text-[#E8D8CE] hover:underline"
                >
                  Batch {selectedComponent.batchId}
                </button>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C1A094] font-serif">Manufacturer:</span>
                <span className="text-[#E8D8CE] font-serif">{selectedComponent.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C1A094] font-serif">Location:</span>
                <span className="text-[#E8D8CE] font-serif">{selectedComponent.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C1A094] font-serif">Quality Status:</span>
                <span
                  className={
                    selectedComponent.qualityStatus === 'Passed' ? 'text-[#86D6A6] font-bold' : 'text-[#F08C8A] font-bold'
                  }
                >
                  {selectedComponent.qualityStatus}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-serif uppercase tracking-wider text-[#C1A094]">Cryptographic Signature</span>
              <div className="p-2.5 bg-[#211B1A] border border-[#60433D] font-mono text-[11px] text-[#E8D8CE] break-all">
                {selectedComponent.cryptographicHash}
              </div>
            </div>

            <div className="pt-4 border-t border-[#60433D] space-y-2">
              <button
                onClick={() => navigate(`/traceability?query=${selectedComponent.serialNumber}`)}
                className="w-full btn-vintage-accent text-xs py-2.5 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>Full Graph Traversal for Unit</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
