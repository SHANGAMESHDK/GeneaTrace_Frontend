import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Download,
  AlertTriangle,
  Blocks,
  X,
  BatteryCharging,
  HeartPulse,
  Plane,
  Smartphone
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { BatchRecord, ComponentCategory, IndustrySector } from '../types';

export const BatchManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [batches, setBatches] = useState<BatchRecord[]>(GeneaTraceStore.getBatches('All'));
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ABC');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Batch Form State
  const [newBatchId, setNewBatchId] = useState('');
  const [newSector, setNewSector] = useState<IndustrySector>('Consumer Electronics');
  const [newType, setNewType] = useState<ComponentCategory>('Display');
  const [newBatchSize, setNewBatchSize] = useState<number>(100);
  const [newSupplier, setNewSupplier] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const [formError, setFormError] = useState('');

  // Selected batch details
  const activeBatch = useMemo(() => {
    return batches.find(b => b.batchId.toUpperCase() === selectedBatchId.toUpperCase()) || batches[0];
  }, [batches, selectedBatchId]);

  // Components belonging to the selected batch
  const batchComponents = useMemo(() => {
    if (!activeBatch) return [];
    return GeneaTraceStore.getComponents({ batchId: activeBatch.batchId, sector: 'All' });
  }, [activeBatch]);

  // Filter batches list
  const filteredBatches = useMemo(() => {
    let list = batches;
    if (selectedSectorFilter !== 'All') {
      list = list.filter(b => b.sector === selectedSectorFilter);
    }
    if (searchTerm) {
      list = list.filter(
        b =>
          b.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.componentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return list;
  }, [batches, selectedSectorFilter, searchTerm]);

  // Preview serial numbers
  const previewSerials = useMemo(() => {
    const id = newBatchId.trim().toUpperCase() || 'NEW';
    const count = Math.min(newBatchSize || 10, 5);
    const list: string[] = [];
    for (let i = 1; i <= count; i++) {
      list.push(`${id}-${i.toString().padStart(4, '0')}`);
    }
    return list;
  }, [newBatchId, newBatchSize]);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newBatchId.trim()) {
      setFormError('Batch ID is required (e.g. CELL-97, DSP-02)');
      return;
    }

    try {
      GeneaTraceStore.createBatch({
        batchId: newBatchId.trim().toUpperCase(),
        sector: newSector,
        componentType: newType,
        batchSize: Number(newBatchSize) || 100,
        supplier: newSupplier.trim() || 'Global Certified Enterprise Tier-1 Supplier',
        facility: newFacility.trim() || 'Industrial Smart Cleanroom Facility Alpha',
        productionDate: new Date().toISOString().split('T')[0]
      });

      const updated = GeneaTraceStore.getBatches('All');
      setBatches(updated);
      setSelectedBatchId(newBatchId.trim().toUpperCase());
      setIsCreateModalOpen(false);
      setNewBatchId('');
    } catch (err: any) {
      setFormError(err.message || 'Error registering batch');
    }
  };

  const handleMarkDefective = (batchId: string) => {
    if (window.confirm(`Mark Batch ${batchId} as Defective? This will automatically initiate precision recall traversal and flag all affected finished products.`)) {
      GeneaTraceStore.triggerBatchRecall(batchId, 'Critical defect flagged by QA inspection during reliability stress test.');
      setBatches(GeneaTraceStore.getBatches('All'));
      navigate('/recalls');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="text-cyan-400" size={24} />
            <span>Industrial Batch Management &amp; Serialization</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Cryptographic batch grouping with individual unit-level serial number generation across industries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Plus size={16} />
            <span>Register New Batch</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Batches List, Right Active Batch & 100 Serials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Batches Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={selectedSectorFilter}
                onChange={e => setSelectedSectorFilter(e.target.value)}
                className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 font-mono"
              >
                <option value="All">All Sectors</option>
                <option value="Consumer Electronics">Electronics</option>
                <option value="Automotive & EV Battery">EV Battery</option>
                <option value="Medical Technology">Medical</option>
                <option value="Industrial & Aerospace">Aerospace</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredBatches.map(b => {
                const isSelected = activeBatch?.batchId === b.batchId;
                const isDefective = b.status === 'Defective' || b.status === 'Recalled';

                return (
                  <div
                    key={b.batchId}
                    onClick={() => setSelectedBatchId(b.batchId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? isDefective
                          ? 'bg-red-950/40 border-red-500/80 shadow-md shadow-red-950/40'
                          : 'bg-cyan-950/30 border-cyan-500/80 shadow-md shadow-cyan-950/30'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">Batch {b.batchId}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {b.componentType}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                          isDefective
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-400 flex items-center justify-between font-mono">
                      <span className="text-cyan-400 text-[10px]">{b.sector}</span>
                      <span className="text-[11px] text-slate-500">{b.batchSize} units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Batch Details & 100 Serials Table */}
        <div className="lg:col-span-8 space-y-6">
          {activeBatch ? (
            <>
              {/* Batch Overview Card */}
              <div
                className={`p-5 rounded-xl border ${
                  activeBatch.status === 'Defective' || activeBatch.status === 'Recalled'
                    ? 'bg-red-950/20 border-red-500/50'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white font-mono">Batch ID: {activeBatch.batchId}</h2>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold">
                        {activeBatch.componentType}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                        {activeBatch.sector}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                          activeBatch.status === 'Defective' || activeBatch.status === 'Recalled'
                            ? 'bg-red-500 text-white'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {activeBatch.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Supplier: <strong className="text-slate-200">{activeBatch.supplier}</strong> • Facility: <strong className="text-slate-200">{activeBatch.facility}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeBatch.status !== 'Defective' && activeBatch.status !== 'Recalled' ? (
                      <button
                        onClick={() => handleMarkDefective(activeBatch.batchId)}
                        className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <AlertOctagon size={14} />
                        <span>Flag as Defective</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/recalls')}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-red-950"
                      >
                        <AlertTriangle size={14} />
                        <span>Manage Precision Recall</span>
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/traceability?query=${activeBatch.batchId}`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>Forward Trace</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Sub details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500">Batch Size:</span>
                    <p className="text-white font-bold text-sm mt-0.5">{activeBatch.batchSize} Units</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Serial Range:</span>
                    <p className="text-cyan-400 font-bold text-sm mt-0.5">
                      {activeBatch.batchId}-0001 → {activeBatch.batchId}-{activeBatch.batchSize.toString().padStart(4, '0')}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Inspection:</span>
                    <p className="text-slate-200 font-medium text-xs mt-0.5 truncate">{activeBatch.inspectionResult}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Demo Ledger TX:</span>
                    <p className="text-violet-400 font-mono text-xs mt-0.5 truncate">{activeBatch.blockchainCheckpointTx}</p>
                  </div>
                </div>
              </div>

              {/* Individual Serials Table */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Unit Serial Registry ({batchComponents.length} units in Batch {activeBatch.batchId})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Individual unit-level identification. {activeBatch.batchId} is the batch; {activeBatch.batchId}-0001 is the unit serial.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Showing all {batchComponents.length} units</span>
                </div>

                <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Serial Number</th>
                        <th className="py-2.5 px-3">Component ID</th>
                        <th className="py-2.5 px-3">Sector</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Quality</th>
                        <th className="py-2.5 px-3">Assigned Product</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {batchComponents.map(c => (
                        <tr key={c.serialNumber} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-2 px-3 font-bold text-cyan-400">{c.serialNumber}</td>
                          <td className="py-2 px-3 text-slate-300">{c.componentId}</td>
                          <td className="py-2 px-3 text-slate-400 text-[10px]">{c.sector}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                c.status === 'Recalled' || c.status === 'Quality Failed'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-400">{c.qualityStatus}</td>
                          <td className="py-2 px-3 text-slate-300">
                            {c.installedInProductId ? (
                              <button
                                onClick={() => navigate(`/passport/${c.installedInProductId}`)}
                                className="text-cyan-400 hover:underline flex items-center gap-1"
                              >
                                <span>{c.installedInProductId}</span>
                              </button>
                            ) : (
                              <span className="text-slate-500">Unassembled</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => navigate(`/traceability?query=${c.serialNumber}`)}
                              className="text-[11px] text-slate-400 hover:text-white"
                            >
                              Trace
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">Select a batch to inspect its details</div>
          )}
        </div>
      </div>

      {/* Register Batch Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-cyan-400" />
                <span>Register New Manufacturing Batch</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-xs text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Industry Sector</label>
                  <select
                    value={newSector}
                    onChange={e => setNewSector(e.target.value as IndustrySector)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Automotive & EV Battery">Automotive & EV Battery</option>
                    <option value="Medical Technology">Medical Technology</option>
                    <option value="Industrial & Aerospace">Industrial & Aerospace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Component Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as ComponentCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="Display">Display</option>
                    <option value="Battery">Battery</option>
                    <option value="Main PCB">Main PCB</option>
                    <option value="Camera Module">Camera Module</option>
                    <option value="Prismatic Cell">Prismatic Cell (EV)</option>
                    <option value="BMS Module">BMS Module (EV)</option>
                    <option value="Thermal Cooling Plate">Thermal Cooling Plate (EV)</option>
                    <option value="Biocompatible Housing">Biocompatible Housing (Medical)</option>
                    <option value="Telemetry ASIC">Telemetry ASIC (Medical)</option>
                    <option value="Radiation-Tolerant MCU">Radiation-Tolerant MCU (Aerospace)</option>
                    <option value="Frame">Frame</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Batch ID Code (e.g. CELL-97)</label>
                  <input
                    type="text"
                    value={newBatchId}
                    onChange={e => setNewBatchId(e.target.value)}
                    placeholder="CELL-97"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Batch Size (Units to Generate)</label>
                  <input
                    type="number"
                    value={newBatchSize}
                    onChange={e => setNewBatchSize(Number(e.target.value))}
                    min={1}
                    max={500}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Supplier Organization</label>
                <input
                  type="text"
                  value={newSupplier}
                  onChange={e => setNewSupplier(e.target.value)}
                  placeholder="Northvolt Gigafactory / CATL / Medtronic / Sony"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Preview of serial numbers */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  Serial Range Preview:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previewSerials.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 font-mono text-[11px] border border-slate-800">
                      {s}
                    </span>
                  ))}
                  <span className="text-slate-500 text-[11px] font-mono self-center">... up to {newBatchSize} units</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/30"
                >
                  Confirm &amp; Generate {newBatchSize} Serials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
