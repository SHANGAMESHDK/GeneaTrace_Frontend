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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#155477] pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[#D9F5F7] flex items-center gap-2">
            <Cpu className="text-[#86BFCF]" size={22} />
            <span>Component Registry &amp; Serial Inventory</span>
          </h1>
          <p className="text-xs text-[#86BFCF] font-serif mt-1">
            Unit-level serialization across displays, batteries, motherboards, cameras, frames, and sensors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="px-3.5 py-2 rounded-none bg-[#073451] hover:bg-[#342f3d] border border-[#155477] text-[#D9F5F7] text-xs font-serif flex items-center gap-1.5 transition-colors uppercase tracking-wider"
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
            className="w-full pl-8 pr-3 py-1.5 bg-[#011C40] border border-[#155477] rounded-none text-xs text-[#D9F5F7] font-mono focus:outline-none focus:border-[#86BFCF]"
          />
          <Search className="w-3.5 h-3.5 text-[#86BFCF] absolute left-2.5 top-2.5" />
        </div>

        <select
          value={selectedType}
          onChange={e => {
            setSelectedType(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-1.5 bg-[#073451] border border-[#155477] rounded-none text-xs text-[#D9F5F7] font-serif"
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
          className="px-3 py-1.5 bg-[#073451] border border-[#155477] rounded-none text-xs text-[#D9F5F7] font-serif"
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
          className="px-3 py-1.5 bg-[#073451] border border-[#155477] rounded-none text-xs text-[#D9F5F7] font-serif"
        >
          <option value="All">All Quality Statuses</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
          <option value="Pending">Pending</option>
        </select>

        <span className="text-xs text-[#54ACBF] font-serif ml-auto">
          Found: <strong className="text-[#D9F5F7] font-mono">{allComponents.length}</strong> items
        </span>
      </div>

      {/* Components Table */}
      <div className="vintage-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#073451] text-[#86BFCF] border-b border-[#155477] font-serif text-[11px] uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#155477] bg-[#011C40]">
              {paginatedComponents.map(c => {
                const isDefective = c.batchId === 'ABC';
                return (
                  <tr
                    key={c.serialNumber}
                    onClick={() => setSelectedComponent(c)}
                    className="hover:bg-[#073451]/50 cursor-pointer transition-colors"
                  >
                    <td className={`py-2.5 px-4 font-bold ${isDefective ? 'text-[#F08C8A]' : 'text-[#D9F5F7]'}`}>
                      {c.serialNumber}
                    </td>
                    <td className="py-2.5 px-4 text-[#86BFCF]">{c.componentId}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-1.5 py-0.5 bg-[#073451] text-[#D9F5F7] border border-[#155477] text-[10px]">
                        {c.batchId}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[#D9F5F7] font-serif">{c.type}</td>
                    <td className="py-2.5 px-4 text-[#86BFCF] font-serif truncate max-w-[150px]">{c.supplier}</td>
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
                    <td className="py-2.5 px-4 text-[#D9F5F7]">
                      {c.installedInProductId ? (
                        <span className="text-[#D9F5F7] hover:underline">{c.installedInProductId}</span>
                      ) : (
                        <span className="text-[#54ACBF] font-serif">Inventory</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/traceability?query=${c.serialNumber}`);
                        }}
                        className="text-[#D9F5F7] hover:underline font-serif text-[11px]"
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
        <div className="p-3 border-t border-[#155477] flex items-center justify-between text-xs font-serif bg-[#062B49]">
          <span className="text-[#86BFCF]">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[#073451] hover:bg-[#342f3d] border border-[#155477] disabled:opacity-40 text-[#D9F5F7] transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-[#073451] hover:bg-[#342f3d] border border-[#155477] disabled:opacity-40 text-[#D9F5F7] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Component Detail Drawer */}
      {selectedComponent && (
        <div className="fixed inset-0 z-50 bg-[#011C40]/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-[#062B49] border-l border-[#155477] h-full p-6 space-y-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#155477]">
              <span className="text-xs font-serif uppercase tracking-wider text-[#86BFCF]">Component Specification</span>
              <button onClick={() => setSelectedComponent(null)} className="text-[#86BFCF] hover:text-[#D9F5F7]">
                <X size={18} />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-normal font-serif text-[#D9F5F7]">{selectedComponent.serialNumber}</h2>
              <span className="text-xs text-[#54ACBF] font-mono">{selectedComponent.componentId}</span>
            </div>

            <div className="p-4 bg-[#011C40] border border-[#155477] space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#86BFCF] font-serif">Category:</span>
                <span className="text-[#D9F5F7] font-serif font-bold">{selectedComponent.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86BFCF] font-serif">Batch ID:</span>
                <button
                  onClick={() => navigate(`/batches?search=${selectedComponent.batchId}`)}
                  className="text-[#D9F5F7] hover:underline"
                >
                  Batch {selectedComponent.batchId}
                </button>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86BFCF] font-serif">Manufacturer:</span>
                <span className="text-[#D9F5F7] font-serif">{selectedComponent.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86BFCF] font-serif">Location:</span>
                <span className="text-[#D9F5F7] font-serif">{selectedComponent.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86BFCF] font-serif">Quality Status:</span>
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
              <span className="text-xs font-serif uppercase tracking-wider text-[#86BFCF]">Cryptographic Signature</span>
              <div className="p-2.5 bg-[#011C40] border border-[#155477] font-mono text-[11px] text-[#D9F5F7] break-all">
                {selectedComponent.cryptographicHash}
              </div>
            </div>

            <div className="pt-4 border-t border-[#155477] space-y-2">
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
