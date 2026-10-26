import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ChevronRight,
  Download,
  AlertTriangle,
  X
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
    <div className="space-y-6 font-serif-vintage">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl text-[#413634] flex items-center gap-2">
            <Layers className="text-[#c5716d]" size={22} />
            <span>Industrial Batch Management &amp; Serialization</span>
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Cryptographic batch grouping with individual unit-level serial number generation across industries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-vintage-accent"
          >
            <Plus size={14} />
            <span>Register New Batch</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Batches List, Right Active Batch & 100 Serials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Batches Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 vintage-card space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#fffdf6] border border-[#e5e5e5] rounded-none text-xs text-[#413634] placeholder-[#8b6c58]/60 focus:outline-none focus:border-[#413634]"
                />
                <Search className="w-3.5 h-3.5 text-[#666666] absolute left-2.5 top-2.5" />
              </div>

              <select
                value={selectedSectorFilter}
                onChange={e => setSelectedSectorFilter(e.target.value)}
                className="px-2 py-1.5 bg-[#faf3dc] border border-[#e5e5e5] rounded-none text-[11px] text-[#413634]"
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
                    className={`p-3 border cursor-pointer transition-all ${
                      isSelected
                        ? isDefective
                          ? 'bg-[#fdf2f1] border-[#b84a44]'
                          : 'bg-[#faf3dc] border-[#413634]'
                        : 'bg-[#fffdf6] border-[#e5e5e5] hover:bg-[#faf3dc]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#413634]">Batch {b.batchId}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#faf3dc] text-[#8b6c58] border border-[#e5e5e5]">
                          {b.componentType}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 uppercase font-mono ${
                          isDefective
                            ? 'bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44]'
                            : 'bg-[#edf6f0] text-[#2e6b4d] border border-[#2e6b4d]/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-[#666666] flex items-center justify-between font-mono">
                      <span className="text-[#c5716d] text-[10px]">{b.sector}</span>
                      <span className="text-[11px] text-[#8b6c58]">{b.batchSize} units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Batch Details & Serials Table */}
        <div className="lg:col-span-8 space-y-6">
          {activeBatch ? (
            <>
              {/* Batch Overview Card */}
              <div
                className={`p-5 vintage-card ${
                  activeBatch.status === 'Defective' || activeBatch.status === 'Recalled'
                    ? 'bg-[#fdf2f1] border-[#b84a44]'
                    : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e5e5]">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl text-[#413634] font-mono">Batch {activeBatch.batchId}</h2>
                      <span className="px-2 py-0.5 bg-[#faf3dc] text-[#c5716d] border border-[#e5e5e5] text-xs">
                        {activeBatch.componentType}
                      </span>
                      <span className="px-2 py-0.5 bg-[#faf3dc] text-[#666666] border border-[#e5e5e5] text-xs">
                        {activeBatch.sector}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-mono uppercase ${
                          activeBatch.status === 'Defective' || activeBatch.status === 'Recalled'
                            ? 'bg-[#b84a44] text-white'
                            : 'bg-[#edf6f0] text-[#2e6b4d]'
                        }`}
                      >
                        {activeBatch.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#666666] mt-1">
                      Supplier: <strong className="text-[#413634]">{activeBatch.supplier}</strong> • Facility: <strong className="text-[#413634]">{activeBatch.facility}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeBatch.status !== 'Defective' && activeBatch.status !== 'Recalled' ? (
                      <button
                        onClick={() => handleMarkDefective(activeBatch.batchId)}
                        className="btn-vintage-outline border-[#b84a44] text-[#b84a44] hover:bg-[#fdf2f1]"
                      >
                        <AlertOctagon size={13} />
                        <span>Flag Defective</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/recalls')}
                        className="btn-vintage-accent"
                      >
                        <AlertTriangle size={13} />
                        <span>Manage Recall</span>
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/traceability?query=${activeBatch.batchId}`)}
                      className="btn-vintage-outline"
                    >
                      <span>Trace</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Sub details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-mono">
                  <div>
                    <span className="text-[#666666]">Batch Size:</span>
                    <p className="text-[#413634] text-sm mt-0.5">{activeBatch.batchSize} Units</p>
                  </div>
                  <div>
                    <span className="text-[#666666]">Serial Range:</span>
                    <p className="text-[#c5716d] text-sm mt-0.5">
                      {activeBatch.batchId}-0001 → {activeBatch.batchId}-{activeBatch.batchSize.toString().padStart(4, '0')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#666666]">Inspection:</span>
                    <p className="text-[#413634] text-xs mt-0.5 truncate">{activeBatch.inspectionResult}</p>
                  </div>
                  <div>
                    <span className="text-[#666666]">Demo TX Hash:</span>
                    <p className="text-[#8b6c58] text-xs mt-0.5 truncate">{activeBatch.blockchainCheckpointTx}</p>
                  </div>
                </div>
              </div>

              {/* Individual Serials Table */}
              <div className="p-5 vintage-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#e5e5e5]">
                  <div>
                    <h3 className="text-sm text-[#413634]">
                      Unit Serial Registry ({batchComponents.length} units in Batch {activeBatch.batchId})
                    </h3>
                    <p className="text-xs text-[#666666]">
                      Individual unit-level identification. {activeBatch.batchId} is the batch; {activeBatch.batchId}-0001 is the unit serial.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#8b6c58]">{batchComponents.length} units</span>
                </div>

                <div className="max-h-96 overflow-y-auto border border-[#e5e5e5]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#faf3dc] text-[#666666] border-b border-[#e5e5e5]">
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
                    <tbody className="divide-y divide-[#e5e5e5] bg-[#fffdf6]">
                      {batchComponents.map(c => (
                        <tr key={c.serialNumber} className="hover:bg-[#faf3dc]/60 transition-colors">
                          <td className="py-2 px-3 text-[#c5716d]">{c.serialNumber}</td>
                          <td className="py-2 px-3 text-[#413634]">{c.componentId}</td>
                          <td className="py-2 px-3 text-[#8b6c58] text-[10px]">{c.sector}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.2 text-[9px] uppercase ${
                                c.status === 'Recalled' || c.status === 'Quality Failed'
                                  ? 'bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44]'
                                  : 'bg-[#edf6f0] text-[#2e6b4d]'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[#666666]">{c.qualityStatus}</td>
                          <td className="py-2 px-3 text-[#413634]">
                            {c.installedInProductId ? (
                              <button
                                onClick={() => navigate(`/passport/${c.installedInProductId}`)}
                                className="text-[#c5716d] hover:underline"
                              >
                                {c.installedInProductId}
                              </button>
                            ) : (
                              <span className="text-[#8b6c58]">Inventory</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => navigate(`/traceability?query=${c.serialNumber}`)}
                              className="text-[11px] text-[#413634] hover:text-[#c5716d]"
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
            <div className="p-12 text-center text-[#666666]">Select a batch to inspect its details</div>
          )}
        </div>
      </div>

      {/* Register Batch Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#413634]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#fffdf6] border border-[#413634] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <h3 className="text-base text-[#413634] flex items-center gap-2">
                <Plus size={16} className="text-[#c5716d]" />
                <span>Register New Manufacturing Batch</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#666666] hover:text-[#413634]">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#fdf2f1] border border-[#b84a44] text-xs text-[#b84a44]">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#666666] mb-1">Industry Sector</label>
                  <select
                    value={newSector}
                    onChange={e => setNewSector(e.target.value as IndustrySector)}
                    className="w-full px-3 py-2 bg-[#fffcf8] border border-[#e5e5e5] rounded-none text-[#413634] focus:outline-none focus:border-[#413634]"
                  >
                    <option value="Consumer Electronics">Consumer Electronics</option>
                    <option value="Automotive & EV Battery">Automotive & EV Battery</option>
                    <option value="Medical Technology">Medical Technology</option>
                    <option value="Industrial & Aerospace">Industrial & Aerospace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#666666] mb-1">Component Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as ComponentCategory)}
                    className="w-full px-3 py-2 bg-[#fffcf8] border border-[#e5e5e5] rounded-none text-[#413634] focus:outline-none focus:border-[#413634]"
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
                  <label className="block text-[#666666] mb-1">Batch ID Code (e.g. CELL-97)</label>
                  <input
                    type="text"
                    value={newBatchId}
                    onChange={e => setNewBatchId(e.target.value)}
                    placeholder="CELL-97"
                    className="w-full px-3 py-2 bg-[#fffcf8] border border-[#e5e5e5] rounded-none text-[#413634] font-mono focus:outline-none focus:border-[#413634]"
                  />
                </div>

                <div>
                  <label className="block text-[#666666] mb-1">Batch Size</label>
                  <input
                    type="number"
                    value={newBatchSize}
                    onChange={e => setNewBatchSize(Number(e.target.value))}
                    min={1}
                    max={500}
                    className="w-full px-3 py-2 bg-[#fffcf8] border border-[#e5e5e5] rounded-none text-[#413634] font-mono focus:outline-none focus:border-[#413634]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#666666] mb-1">Supplier Organization</label>
                <input
                  type="text"
                  value={newSupplier}
                  onChange={e => setNewSupplier(e.target.value)}
                  placeholder="Northvolt Gigafactory / CATL / Medtronic / Sony"
                  className="w-full px-3 py-2 bg-[#fffcf8] border border-[#e5e5e5] rounded-none text-[#413634] focus:outline-none focus:border-[#413634]"
                />
              </div>

              {/* Preview */}
              <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5] space-y-1">
                <span className="text-[10px] uppercase text-[#666666]">
                  Serial Range Preview:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {previewSerials.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-[#fffdf6] text-[#c5716d] font-mono text-[11px] border border-[#e5e5e5]">
                      {s}
                    </span>
                  ))}
                  <span className="text-[#8b6c58] text-[11px] self-center">... up to {newBatchSize} units</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-vintage-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-vintage-accent"
                >
                  Confirm &amp; Register Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
