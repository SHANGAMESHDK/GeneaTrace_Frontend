import React, { useState, useMemo, useEffect } from 'react';
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
  X,
  MapPin,
  Building2,
  Truck,
  Smartphone,
  Boxes,
  Store,
  Warehouse,
  PackageCheck,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { BatchRecord, ComponentCategory, IndustrySector } from '../types';
import { api } from '../services/apiClient';

export const BatchManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [batches, setBatches] = useState<BatchRecord[]>(GeneaTraceStore.getBatches('All'));
  const [selectedBatchId, setSelectedBatchId] = useState<string>('AAA');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Live Backend Batches fetch
  useEffect(() => {
    api.getBatches(1, 50)
      .then(res => {
        if (res && Array.isArray(res.items) && res.items.length > 0) {
          console.log(`Backend Batches fetched (${res.items.length} items):`, res.items);
        }
      })
      .catch(err => {
        console.warn('Backend batches fallback:', err);
      });
  }, []);

  // Unit Location Tracing Modal State
  const [selectedTraceUnit, setSelectedTraceUnit] = useState<{
    serialNumber: string;
    componentId: string;
    installedProductId?: string;
  } | null>(null);

  // Active Registry View: individual serials vs location bunches
  const [activeTab, setActiveTab] = useState<'serials' | 'bunches'>('serials');
  const [isBatchDetailsModalOpen, setIsBatchDetailsModalOpen] = useState(false);
  const [selectedBunchLocation, setSelectedBunchLocation] = useState<string | null>(null);

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

  // Real-time batch locations & bunches of units
  const activeBatchLocations = useMemo(() => {
    return activeBatch?.batchId ? GeneaTraceStore.getBatchLocations(activeBatch.batchId) : null;
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

      // Dispatch to FastAPI backend on Azure
      api.createBatch({
        batch_code: newBatchId.trim().toUpperCase(),
        component_type: newType.toUpperCase(),
        planned_quantity: Number(newBatchSize) || 100,
        supplier_id: newSupplier.trim() || 'SUP-DEFAULT',
        facility_id: newFacility.trim() || 'FAC-FAB-01',
      }).catch(backendErr => {
        console.warn('Backend sync note for createBatch:', backendErr.message);
      });
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

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBatchDetailsModalOpen(true);
                        setSelectedBunchLocation(null);
                      }}
                      className="btn-vintage-accent text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Inspect all physical stores, warehouses, delivery and hold statuses for this batch"
                    >
                      <Boxes size={14} />
                      <span>Batch Details &amp; Location Bunches</span>
                    </button>

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

              {/* Tab Switcher: Unit Serial Registry vs Location Bunches */}
              <div className="p-5 vintage-card space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e5e5e5]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('serials')}
                      className={`px-3 py-1.5 text-xs font-serif transition-colors flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'serials'
                          ? 'bg-[#413634] text-[#fffdf6] font-medium shadow-xs'
                          : 'bg-[#faf3dc] text-[#666666] hover:text-[#413634] border border-[#e5e5e5]'
                      }`}
                    >
                      <Smartphone size={13} />
                      <span>Unit Serial Registry ({batchComponents.length} Units)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('bunches')}
                      className={`px-3 py-1.5 text-xs font-serif transition-colors flex items-center gap-1.5 cursor-pointer ${
                        activeTab === 'bunches'
                          ? 'bg-[#413634] text-[#fffdf6] font-medium shadow-xs'
                          : 'bg-[#faf3dc] text-[#666666] hover:text-[#413634] border border-[#e5e5e5]'
                      }`}
                    >
                      <Boxes size={13} />
                      <span>Location Bunches &amp; Store Distribution ({activeBatchLocations?.locationsSummary.length || 0} Stores / Warehouses)</span>
                    </button>
                  </div>

                  <span className="text-xs font-mono text-[#8b6c58]">
                    {activeTab === 'serials'
                      ? `${batchComponents.length} units registered`
                      : `${activeBatchLocations?.locationsSummary.length || 0} location bunches`}
                  </span>
                </div>

                {/* VIEW 1: INDIVIDUAL SERIALS TABLE */}
                {activeTab === 'serials' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1">
                      <div>
                        <h3 className="text-sm text-[#413634]">
                          Unit Serial Registry ({batchComponents.length} units in Batch {activeBatch.batchId})
                        </h3>
                        <p className="text-xs text-[#666666]">
                          Individual unit-level identification. {activeBatch.batchId} is the batch; {activeBatch.batchId}-0001 is the unit serial. Click <strong>Trace</strong> on any unit to view where it is right now.
                        </p>
                      </div>
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
                                  onClick={() => setSelectedTraceUnit({
                                    serialNumber: c.serialNumber,
                                    componentId: c.componentId,
                                    installedProductId: c.installedInProductId
                                  })}
                                  className="btn-vintage-outline py-0.5 px-2 text-[11px] text-[#413634] hover:text-[#c5716d] hover:border-[#c5716d]"
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
                )}

                {/* VIEW 2: LOCATION BUNCHES & STORE DISTRIBUTION */}
                {activeTab === 'bunches' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5] text-xs text-[#666666] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Boxes size={16} className="text-[#c5716d] shrink-0" />
                        <span>
                          Batch <strong className="text-[#413634] font-mono">{activeBatch.batchId}</strong> ({activeBatch.batchSize} Units) is grouped into <strong>{activeBatchLocations?.locationsSummary.length || 0} physical location bunches</strong> across shops &amp; warehouses. Click any bunch below to inspect delivery &amp; hold status.
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-mono border font-bold shrink-0 ${
                        activeBatch.status === 'Defective' || activeBatch.status === 'Recalled'
                          ? 'bg-[#fdf2f1] text-[#b84a44] border-[#b84a44]'
                          : 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]'
                      }`}>
                        {activeBatch.status === 'Defective' || activeBatch.status === 'Recalled'
                          ? 'BATCH DEFECTIVE: DELIVERY HOLDED ON ALL BUNCHES'
                          : 'BATCH QUALITY NOMINAL: NO DELIVERY HOLDS'}
                      </span>
                    </div>

                    {/* Bunches Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {activeBatchLocations?.locationsSummary.map(bunch => {
                        const isSelected = selectedBunchLocation === bunch.location;
                        const isBatchDefective = activeBatch.status === 'Defective' || activeBatch.status === 'Recalled';
                        const isHold = isBatchDefective || bunch.isHold;

                        return (
                          <div
                            key={bunch.location}
                            onClick={() => setSelectedBunchLocation(isSelected ? null : bunch.location)}
                            className={`p-3.5 border transition-all cursor-pointer space-y-2.5 ${
                              isSelected
                                ? 'bg-[#faf3dc] border-[#413634] ring-1 ring-[#413634]'
                                : 'bg-[#fffdf6] border-[#e5e5e5] hover:border-[#8b6c58] hover:bg-[#faf3dc]/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 border-b border-[#e5e5e5] pb-2">
                              <div className="flex items-center gap-2">
                                {bunch.locationType === 'Retail Shop' ? (
                                  <Store size={16} className="text-[#c5716d] shrink-0" />
                                ) : bunch.locationType === 'Distribution Warehouse' ? (
                                  <Warehouse size={16} className="text-[#8b6c58] shrink-0" />
                                ) : (
                                  <Truck size={16} className="text-[#49627d] shrink-0" />
                                )}
                                <span className="font-serif font-medium text-xs text-[#413634] line-clamp-1">
                                  {bunch.location}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 bg-[#413634] text-white font-mono text-xs font-bold shrink-0">
                                {bunch.count} Units Bunch
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#666666]">
                              <div>
                                <span>Type: </span>
                                <strong className="text-[#413634]">{bunch.locationType || 'Retail Shop'}</strong>
                              </div>
                              <div>
                                <span>Carrier: </span>
                                <strong className="text-[#413634]">{bunch.carrier}</strong>
                              </div>
                            </div>

                            {/* Status row: Delivered or not, Delivery holded or not */}
                            <div className="flex items-center justify-between pt-1 border-t border-[#e5e5e5] text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-[#666666]">Delivery:</span>
                                <span className={`px-1.5 py-0.2 text-[10px] font-mono border ${
                                  bunch.status === 'Delivered'
                                    ? 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]/40'
                                    : 'bg-[#faf3dc] text-[#8b6c58] border-[#e5e5e5]'
                                }`}>
                                  {bunch.status === 'Delivered' ? 'DELIVERED' : 'IN TRANSIT'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-[#666666]">Hold:</span>
                                {isHold ? (
                                  <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44] font-bold">
                                    DELIVERY HOLDED
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#edf6f0] text-[#2e6b4d] border border-[#2e6b4d]/40">
                                    NOT HOLDED (CLEAR)
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-[10px] text-right text-[#c5716d] pt-0.5 flex items-center justify-end gap-1">
                              <span>{isSelected ? 'Hide bunch units ▲' : 'Click to inspect all units in this bunch ▼'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Detailed Unit List for the Selected Bunch */}
                    {selectedBunchLocation && (() => {
                      const currentBunch = activeBatchLocations?.locationsSummary.find(b => b.location === selectedBunchLocation);
                      if (!currentBunch) return null;
                      const isBatchDefective = activeBatch.status === 'Defective' || activeBatch.status === 'Recalled';
                      const isHold = isBatchDefective || currentBunch.isHold;

                      return (
                        <div className="p-4 bg-[#fffdf6] border-2 border-[#413634] space-y-3 mt-4 animate-in fade-in duration-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e5e5] pb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-[#c5716d]" />
                                <h4 className="text-sm font-medium text-[#413634]">
                                  {currentBunch.location}
                                </h4>
                              </div>
                              <p className="text-xs text-[#666666] mt-0.5 font-mono">
                                Bunch Size: <strong>{currentBunch.count} Units</strong> • Carrier: {currentBunch.carrier} • Shipment: {currentBunch.shipmentId}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-xs font-mono border ${
                                currentBunch.status === 'Delivered'
                                  ? 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]'
                                  : 'bg-[#faf3dc] text-[#8b6c58] border-[#e5e5e5]'
                              }`}>
                                {currentBunch.status === 'Delivered' ? 'DELIVERY STATUS: DELIVERED' : 'DELIVERY STATUS: IN TRANSIT'}
                              </span>

                              {isHold ? (
                                <span className="px-2 py-0.5 text-xs font-mono bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44] font-bold">
                                  DELIVERY HOLDED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs font-mono bg-[#edf6f0] text-[#2e6b4d] border border-[#2e6b4d]">
                                  NOT HOLDED (CLEAR)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Notice Banner */}
                          <div className={`p-3 border text-xs flex items-center gap-2 ${
                            isHold ? 'bg-[#fdf2f1] border-[#b84a44] text-[#b84a44]' : 'bg-[#edf6f0] border-[#2e6b4d] text-[#2e6b4d]'
                          }`}>
                            <AlertTriangle size={15} className="shrink-0" />
                            <span>
                              {isHold
                                ? `Quarantine Hold Active: These ${currentBunch.count} units carry components from defective Batch ${activeBatch.batchId} and are held under stop-sale protocol.`
                                : `Nominal Status: All ${currentBunch.count} units from Batch ${activeBatch.batchId} at this location are fully cleared and verified.`}
                            </span>
                          </div>

                          {/* Units Table */}
                          <div className="max-h-60 overflow-y-auto border border-[#e5e5e5]">
                            <table className="w-full text-left text-xs font-mono">
                              <thead className="bg-[#faf3dc] text-[#666666] border-b border-[#e5e5e5] text-[10px] uppercase">
                                <tr>
                                  <th className="p-2">Component Serial</th>
                                  <th className="p-2">Assigned Product ID</th>
                                  <th className="p-2">Model</th>
                                  <th className="p-2">Delivery Status</th>
                                  <th className="p-2">Hold Status</th>
                                  <th className="p-2 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#e5e5e5] bg-[#fffdf6]">
                                {(currentBunch.units || []).map(u => (
                                  <tr key={u.productId} className="hover:bg-[#faf3dc]/60">
                                    <td className="p-2 text-[#c5716d] font-bold">{u.serialNumber || 'N/A'}</td>
                                    <td className="p-2 text-[#413634]">{u.productId}</td>
                                    <td className="p-2 text-[#666666]">{u.model}</td>
                                    <td className="p-2">
                                      <span className={`px-1.5 py-0.2 text-[10px] border ${
                                        u.deliveryStatus === 'Delivered'
                                          ? 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]/40'
                                          : 'bg-[#faf3dc] text-[#8b6c58] border-[#e5e5e5]'
                                      }`}>
                                        {u.deliveryStatus || 'Delivered'}
                                      </span>
                                    </td>
                                    <td className="p-2">
                                      {isHold ? (
                                        <span className="px-1.5 py-0.2 text-[9px] bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44] font-bold">
                                          DELIVERY HOLDED
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.2 text-[9px] bg-[#edf6f0] text-[#2e6b4d] border border-[#2e6b4d]/40">
                                          CLEAR (NOT HOLDED)
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 text-right">
                                      <button
                                        type="button"
                                        onClick={() => navigate(`/passport/${u.productId}`)}
                                        className="text-[#c5716d] hover:underline flex items-center justify-end gap-1"
                                      >
                                        <span>Passport</span>
                                        <ExternalLink size={11} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
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

      {/* REAL-TIME UNIT LOCATION & SISTER UNITS MODAL */}
      {selectedTraceUnit && (() => {
        const prod = selectedTraceUnit.installedProductId
          ? GeneaTraceStore.getProduct(selectedTraceUnit.installedProductId)
          : null;
        const shp = prod?.shipmentId ? GeneaTraceStore.getShipment(prod.shipmentId) : null;
        
        // Batch locations lookup
        const batchLocs = activeBatch?.batchId ? GeneaTraceStore.getBatchLocations(activeBatch.batchId) : null;
        
        // Current location of this product
        const currentLocation = shp?.currentLocation ||
          (prod ? (prod.status === 'Delivered' ? 'Authorized Retailer Shop' : 'Factory Assembly Floor') : 'Raw Component Inventory / Factory Line');
        
        // Count how many sister units from the same batch are currently at this exact location
        const sisterUnitsInThisLocation = batchLocs?.units.filter(u => u.currentLocation === currentLocation) || [];
        const sisterCount = sisterUnitsInThisLocation.length || (prod ? 1 : 0);

        return (
          <div className="fixed inset-0 z-50 bg-[#413634]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#fffdf6] border border-[#413634] p-6 space-y-5 shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#e5e5e5]">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="text-[#c5716d]" size={18} />
                    <h3 className="text-base text-[#413634] font-medium">
                      Real-Time Product Location &amp; Sister Units Trace
                    </h3>
                  </div>
                  <p className="text-xs text-[#666666] mt-0.5">
                    Unit: <strong className="font-mono text-[#c5716d]">{selectedTraceUnit.serialNumber}</strong> • Batch: <strong className="font-mono">{activeBatch.batchId}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTraceUnit(null)}
                  className="p-1 text-[#666666] hover:text-[#413634]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 1. Exactly Where the Product is Right Now */}
              <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-[#b84a44] font-semibold flex items-center gap-1.5">
                  <MapPin size={13} />
                  <span>Where the product is right now:</span>
                </span>
                <div className="text-base text-[#413634] font-medium flex items-center justify-between">
                  <span>{currentLocation}</span>
                  <span className="px-2 py-0.5 text-xs font-mono bg-[#c5716d] text-white">
                    {shp?.currentStatus || prod?.status || 'In Inventory'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-[#666666] border-t border-[#e5e5e5]">
                  <div>
                    <span>Assigned Product: </span>
                    <strong className="text-[#413634] font-mono">
                      {selectedTraceUnit.installedProductId || 'Not yet assembled in finished device'}
                    </strong>
                  </div>
                  <div>
                    <span>Logistics Carrier: </span>
                    <strong className="text-[#413634]">
                      {shp?.carrier || 'Factory Internal Depot'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 2. Along with its sisters: how many mobiles are in that exact location */}
              <div className="p-4 vintage-card space-y-3 bg-[#fffcf8]">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-[#2e6b4d]" />
                    <h4 className="text-xs font-medium text-[#413634] uppercase tracking-wide">
                      Sister Units in this Same Location
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 bg-[#edf6f0] border border-[#2e6b4d] text-[#2e6b4d] font-mono text-xs font-bold">
                    {sisterCount} Mobiles at this Location
                  </span>
                </div>

                <p className="text-xs text-[#666666]">
                  Along with <strong className="font-mono">{selectedTraceUnit.installedProductId || selectedTraceUnit.serialNumber}</strong>, there are currently <strong className="text-[#c5716d] font-bold">{sisterCount} sister units</strong> from Batch <strong>{activeBatch.batchId}</strong> located together at <strong>{currentLocation}</strong>.
                </p>

                {/* Sister Units List */}
                {sisterUnitsInThisLocation.length > 0 && (
                  <div className="max-h-36 overflow-y-auto border border-[#e5e5e5] text-xs">
                    <table className="w-full text-left divide-y divide-[#e5e5e5] font-mono">
                      <thead className="bg-[#faf3dc] text-[#666666] text-[10px] uppercase">
                        <tr>
                          <th className="p-2">Sister Product ID</th>
                          <th className="p-2">Model</th>
                          <th className="p-2">Shipment ID</th>
                          <th className="p-2">Delivery / Hold Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e5e5] text-[11px] bg-[#fffdf6]">
                        {sisterUnitsInThisLocation.map(s => {
                          const isBatchDefective = activeBatch.status === 'Defective' || activeBatch.status === 'Recalled';
                          const isUnitHeld = isBatchDefective || s.isHoldNotified || s.status === 'Recall Flagged';

                          return (
                            <tr key={s.productId} className="hover:bg-[#faf3dc]">
                              <td className="p-2 text-[#c5716d]">{s.productId}</td>
                              <td className="p-2 text-[#413634]">{s.model}</td>
                              <td className="p-2 text-[#666666]">{s.shipmentId}</td>
                              <td className="p-2">
                                {isUnitHeld ? (
                                  <span className="px-1.5 py-0.2 text-[9px] bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44] font-bold">
                                    DELIVERY HOLDED
                                  </span>
                                ) : (
                                  <span className={`px-1.5 py-0.2 text-[9px] border font-medium ${
                                    s.status === 'Delivered'
                                      ? 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]/40'
                                      : 'bg-[#faf3dc] text-[#8b6c58] border-[#e5e5e5]'
                                  }`}>
                                    {s.status === 'Delivered' ? 'DELIVERED (CLEAR)' : (s.status || 'ACTIVE')}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#e5e5e5] text-xs">
                {selectedTraceUnit.installedProductId ? (
                  <button
                    onClick={() => {
                      const pid = selectedTraceUnit.installedProductId;
                      setSelectedTraceUnit(null);
                      navigate(`/passport/${pid}`);
                    }}
                    className="btn-vintage-outline flex items-center gap-1.5"
                  >
                    <span>Inspect Full Passport</span>
                    <ArrowRight size={13} />
                  </button>
                ) : <span />}

                <button
                  onClick={() => setSelectedTraceUnit(null)}
                  className="btn-vintage-accent"
                >
                  Close Trace View
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* BATCH DETAILS & LOCATION BUNCHES MODAL */}
      {isBatchDetailsModalOpen && activeBatch && (
        <div className="fixed inset-0 z-50 bg-[#413634]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] bg-[#fffdf6] border border-[#413634] p-6 space-y-5 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#e5e5e5] shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Boxes className="text-[#c5716d]" size={20} />
                  <h3 className="text-base text-[#413634] font-medium">
                    Batch Details — Store Location Bunches &amp; Delivery Status
                  </h3>
                </div>
                <p className="text-xs text-[#666666] mt-0.5">
                  Batch: <strong className="font-mono text-[#c5716d]">{activeBatch.batchId}</strong> ({activeBatch.componentType} • {activeBatch.sector}) • <strong className="font-mono">{activeBatch.batchSize} Total Units</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBatchDetailsModalOpen(false);
                  setSelectedBunchLocation(null);
                }}
                className="p-1 text-[#666666] hover:text-[#413634]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Overall Status Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5]">
                  <span className="text-[10px] text-[#666666] uppercase block">Total Batch Units:</span>
                  <span className="text-base font-mono font-bold text-[#413634]">{activeBatch.batchSize} Units</span>
                  <span className="text-[10px] text-[#8b6c58] block mt-0.5">Serial Range: {activeBatch.batchId}-0001 → {activeBatch.batchId}-{activeBatch.batchSize.toString().padStart(4, '0')}</span>
                </div>
                <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5]">
                  <span className="text-[10px] text-[#666666] uppercase block">Distributed Stores &amp; Hubs:</span>
                  <span className="text-base font-mono font-bold text-[#c5716d]">{activeBatchLocations?.locationsSummary.length || 0} Locations</span>
                  <span className="text-[10px] text-[#8b6c58] block mt-0.5">Grouped in bunches of 10-15 units</span>
                </div>
                <div className={`p-3 border ${
                  activeBatch.status === 'Defective' || activeBatch.status === 'Recalled'
                    ? 'bg-[#fdf2f1] border-[#b84a44]'
                    : 'bg-[#edf6f0] border-[#2e6b4d]'
                }`}>
                  <span className="text-[10px] uppercase block font-semibold text-[#666666]">Batch Delivery Hold Status:</span>
                  <span className={`text-xs font-mono font-bold block mt-1 ${
                    activeBatch.status === 'Defective' || activeBatch.status === 'Recalled'
                      ? 'text-[#b84a44]'
                      : 'text-[#2e6b4d]'
                  }`}>
                    {activeBatch.status === 'Defective' || activeBatch.status === 'Recalled'
                      ? '🔴 DELIVERY HOLDED (QUARANTINE ACTIVE)'
                      : '🟢 CLEAR / NOT HOLDED (NOMINAL DELIVERY)'}
                  </span>
                  <span className="text-[10px] text-[#666666] block mt-0.5">
                    {activeBatch.status === 'Defective' || activeBatch.status === 'Recalled'
                      ? 'Batch marked defective; retail stops active'
                      : 'Nominal quality pass; all units cleared for sale'}
                  </span>
                </div>
              </div>

              {/* Bunches Description */}
              <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5] text-xs text-[#413634]">
                <p>
                  As requested, the <strong>{activeBatch.batchSize} units</strong> of Batch <strong>{activeBatch.batchId}</strong> are not stored in one single place — they are distributed as groups/bunches across <strong>{activeBatchLocations?.locationsSummary.length || 0} separate retail shops and warehouses</strong>. Click any bunch below to see its delivery status (Delivered vs In Transit) and hold status (Delivery Holded vs Clear):
                </p>
              </div>

              {/* Bunches Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeBatchLocations?.locationsSummary.map(bunch => {
                  const isSelected = selectedBunchLocation === bunch.location;
                  const isBatchDefective = activeBatch.status === 'Defective' || activeBatch.status === 'Recalled';
                  const isHold = isBatchDefective || bunch.isHold;

                  return (
                    <div
                      key={bunch.location}
                      onClick={() => setSelectedBunchLocation(isSelected ? null : bunch.location)}
                      className={`p-3 border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-[#faf3dc] border-[#413634] ring-1 ring-[#413634]'
                          : 'bg-[#fffdf6] border-[#e5e5e5] hover:border-[#8b6c58] hover:bg-[#faf3dc]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-[#e5e5e5] pb-1.5">
                        <div className="flex items-center gap-1.5">
                          {bunch.locationType === 'Retail Shop' ? (
                            <Store size={15} className="text-[#c5716d] shrink-0" />
                          ) : (
                            <Warehouse size={15} className="text-[#8b6c58] shrink-0" />
                          )}
                          <span className="font-serif font-medium text-xs text-[#413634] line-clamp-1">
                            {bunch.location}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-[#413634] text-white font-mono text-xs font-bold shrink-0">
                          {bunch.count} Units Bunch
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#666666]">
                        <div>
                          <span>Type: </span>
                          <strong className="text-[#413634]">{bunch.locationType || 'Retail Shop'}</strong>
                        </div>
                        <div>
                          <span>Carrier: </span>
                          <strong className="text-[#413634]">{bunch.carrier}</strong>
                        </div>
                      </div>

                      {/* Status Indicators */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#e5e5e5] text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-[#666666]">Delivery:</span>
                          <span className={`px-1.5 py-0.2 text-[10px] font-mono border ${
                            bunch.status === 'Delivered'
                              ? 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]/40'
                              : 'bg-[#faf3dc] text-[#8b6c58] border-[#e5e5e5]'
                          }`}>
                            {bunch.status === 'Delivered' ? 'DELIVERED' : 'IN TRANSIT'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-[#666666]">Hold:</span>
                          {isHold ? (
                            <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44] font-bold">
                              DELIVERY HOLDED
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#edf6f0] text-[#2e6b4d] border border-[#2e6b4d]/40">
                              NOT HOLDED (CLEAR)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-right text-[#c5716d] pt-0.5">
                        <span>{isSelected ? 'Hide bunch units ▲' : 'Click to inspect all units in this bunch ▼'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Bunch Unit Drill-Down */}
              {selectedBunchLocation && (() => {
                const currentBunch = activeBatchLocations?.locationsSummary.find(b => b.location === selectedBunchLocation);
                if (!currentBunch) return null;
                const isBatchDefective = activeBatch.status === 'Defective' || activeBatch.status === 'Recalled';
                const isHold = isBatchDefective || currentBunch.isHold;

                return (
                  <div className="p-4 bg-[#fffdf6] border-2 border-[#413634] space-y-3 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e5e5] pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-[#c5716d]" />
                          <h4 className="text-sm font-medium text-[#413634]">
                            {currentBunch.location}
                          </h4>
                        </div>
                        <p className="text-xs text-[#666666] mt-0.5 font-mono">
                          Bunch Size: <strong>{currentBunch.count} Units</strong> • Carrier: {currentBunch.carrier} • Shipment: {currentBunch.shipmentId}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-mono border ${
                          currentBunch.status === 'Delivered'
                            ? 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]'
                            : 'bg-[#faf3dc] text-[#8b6c58] border-[#e5e5e5]'
                        }`}>
                          {currentBunch.status === 'Delivered' ? 'DELIVERY STATUS: DELIVERED' : 'DELIVERY STATUS: IN TRANSIT'}
                        </span>

                        {isHold ? (
                          <span className="px-2 py-0.5 text-xs font-mono bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44] font-bold">
                            DELIVERY HOLDED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-mono bg-[#edf6f0] text-[#2e6b4d] border border-[#2e6b4d]">
                            NOT HOLDED (CLEAR)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="max-h-52 overflow-y-auto border border-[#e5e5e5]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#faf3dc] text-[#666666] border-b border-[#e5e5e5] text-[10px] uppercase">
                          <tr>
                            <th className="p-2">Component Serial</th>
                            <th className="p-2">Assigned Product ID</th>
                            <th className="p-2">Model</th>
                            <th className="p-2">Delivery Status</th>
                            <th className="p-2">Hold Status</th>
                            <th className="p-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e5e5] bg-[#fffdf6]">
                          {(currentBunch.units || []).map(u => (
                            <tr key={u.productId} className="hover:bg-[#faf3dc]/60">
                              <td className="p-2 text-[#c5716d] font-bold">{u.serialNumber || 'N/A'}</td>
                              <td className="p-2 text-[#413634]">{u.productId}</td>
                              <td className="p-2 text-[#666666]">{u.model}</td>
                              <td className="p-2">
                                <span className={`px-1.5 py-0.2 text-[10px] border ${
                                  u.deliveryStatus === 'Delivered'
                                    ? 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]/40'
                                    : 'bg-[#faf3dc] text-[#8b6c58] border-[#e5e5e5]'
                                }`}>
                                  {u.deliveryStatus || 'Delivered'}
                                </span>
                              </td>
                              <td className="p-2">
                                {isHold ? (
                                  <span className="px-1.5 py-0.2 text-[9px] bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44] font-bold">
                                    DELIVERY HOLDED
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 text-[9px] bg-[#edf6f0] text-[#2e6b4d] border border-[#2e6b4d]/40">
                                    CLEAR (NOT HOLDED)
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsBatchDetailsModalOpen(false);
                                    navigate(`/passport/${u.productId}`);
                                  }}
                                  className="text-[#c5716d] hover:underline flex items-center justify-end gap-1"
                                >
                                  <span>Passport</span>
                                  <ExternalLink size={11} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e5e5e5] shrink-0 text-xs">
              <span className="text-[#666666]">
                Showing physical distribution across all stores &amp; hubs for Batch {activeBatch.batchId}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsBatchDetailsModalOpen(false);
                  setSelectedBunchLocation(null);
                }}
                className="btn-vintage-accent"
              >
                Close Batch Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
