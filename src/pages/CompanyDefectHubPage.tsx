import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  MapPin,
  Truck,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Smartphone,
  PhoneCall,
  Download,
  AlertOctagon,
  Clock,
  Radio,
  Share2
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { ShopkeeperDefectReport } from '../types';

export const CompanyDefectHubPage: React.FC = () => {
  const navigate = useNavigate();
  const reports = GeneaTraceStore.getDefectReports();

  // Search & Filter States
  const [defectFilter, setDefectFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Report for Deep Batch Investigation
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [holdDispatchedNotice, setHoldDispatchedNotice] = useState<string>('');

  const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0];

  // Derive Batch Location and Sister Devices
  const batchLocations = selectedReport?.batchId
    ? GeneaTraceStore.getBatchLocations(selectedReport.batchId)
    : null;

  // Filtered reports list
  const filteredReports = reports.filter(r => {
    if (categoryFilter !== 'All' && r.problemCategory !== categoryFilter) return false;
    if (stateFilter !== 'All' && r.state !== stateFilter) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (defectFilter.trim()) {
      const q = defectFilter.toLowerCase();
      const matchText = `${r.serialNumber} ${r.productModel} ${r.problemDescription} ${r.suspectedCause} ${r.shopName} ${r.batchId || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Calculate Similar Defects Count (Checking if similar defect is reported)
  const similarDefectsCount = selectedReport
    ? reports.filter(r => r.problemCategory === selectedReport.problemCategory && r.id !== selectedReport.id).length
    : 0;

  // Dispatch Hold Order to all shops/warehouses carrying mobiles from this batch
  const handleDispatchHold = () => {
    if (!selectedReport) return;
    
    // Update report status
    GeneaTraceStore.updateDefectReportStatus(
      selectedReport.id,
      'Batch Hold Issued',
      `Corporate QA verified similarity with manufacturing defect pattern. Issued emergency stop-sale hold across ${batchLocations?.units.length || 87} devices in Batch ${selectedReport.batchId}.`
    );

    // Trigger batch recall in store
    if (selectedReport.batchId) {
      GeneaTraceStore.triggerBatchRecall(
        selectedReport.batchId,
        `Correlated shop incident #${selectedReport.id} (${selectedReport.problemCategory}): ${selectedReport.problemDescription}`
      );
    }

    setHoldDispatchedNotice(
      `URGENT HOLD DISPATCHED: Automated Stop-Sale instructions transmitted to ${batchLocations?.locationsSummary.length || 4} regional distributor gateways & authorized retail shops.`
    );
    setTimeout(() => setHoldDispatchedNotice(''), 7000);
  };

  const handleExportHoldManifest = () => {
    if (!batchLocations) return;
    const header = 'Product Serial,Model,Batch ID,Current Location,Carrier,Shipment ID,Action Status\n';
    const rows = batchLocations.units.map(u =>
      `${u.productId},${u.model},${batchLocations.batchId},"${u.currentLocation}","${u.carrier}",${u.shipmentId},STOP_SALE_HOLD_MANDATE`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Batch-${batchLocations.batchId}-Shop-Hold-Manifest.csv`;
    a.click();
  };

  const uniqueStates = Array.from(new Set(reports.map(r => r.state)));

  return (
    <div className="space-y-6 font-serif-vintage">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#e5e5e5]">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="text-[#c5716d]" size={22} />
            <h1 className="text-2xl font-normal text-[#413634]">
              Corporate Defect Command Center &amp; Batch Quarantine
            </h1>
            <span className="px-2 py-0.5 text-[11px] bg-[#faf3dc] border border-[#e5e5e5] text-[#2e6b4d]">
              Nationwide Shop Feeds Active
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Real-time shopkeeper incident ingestion, defect similarity matching, manufacturing batch correlation, and multi-location retail hold dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/shop-portal')}
            className="btn-vintage-outline text-xs"
          >
            <span>Open Shopkeeper Entry Portal</span>
          </button>
          <button
            onClick={() => navigate('/recalls')}
            className="btn-vintage-primary text-xs"
          >
            <span>Precision Recall Center</span>
          </button>
        </div>
      </div>

      {/* Emergency Notification Banner */}
      {holdDispatchedNotice && (
        <div className="p-4 bg-[#fdf2f1] border border-[#b84a44] text-xs space-y-1">
          <div className="flex items-center gap-2 text-[#b84a44] font-medium text-sm">
            <AlertOctagon size={16} />
            <span>Retail Hold Notification Dispatched Successfully</span>
          </div>
          <p className="text-[#413634]">{holdDispatchedNotice}</p>
        </div>
      )}

      {/* Top KPI Metrics for Company Executives */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 vintage-card">
          <span className="text-[11px] text-[#666666] uppercase tracking-wider block">Total Shop Reports</span>
          <div className="text-2xl text-[#413634] font-normal mt-1">{reports.length} Reports</div>
          <span className="text-[10px] text-[#2e6b4d] mt-0.5 block">From 14 Service Centers</span>
        </div>

        <div className="p-4 vintage-card">
          <span className="text-[11px] text-[#666666] uppercase tracking-wider block">Defect Matching Matches</span>
          <div className="text-2xl text-[#c5716d] font-normal mt-1">
            {reports.filter(r => r.problemCategory === 'Screen & Display').length} Display Matches
          </div>
          <span className="text-[10px] text-[#b87428] mt-0.5 block">Correlated to Batch ABC</span>
        </div>

        <div className="p-4 vintage-card">
          <span className="text-[11px] text-[#666666] uppercase tracking-wider block">Correlated Batch</span>
          <div className="text-2xl text-[#413634] font-mono mt-1">Batch ABC</div>
          <span className="text-[10px] text-[#666666] mt-0.5 block">Produced 2026-10-01 (100 units)</span>
        </div>

        <div className="p-4 vintage-card">
          <span className="text-[11px] text-[#666666] uppercase tracking-wider block">Tracked Mobile Locations</span>
          <div className="text-2xl text-[#b84a44] font-normal mt-1">87 Units Traced</div>
          <span className="text-[10px] text-[#b84a44] mt-0.5 block">Across 6 Retail / Logistics Hubs</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 vintage-card-secondary flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Text Search for Defect */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              value={defectFilter}
              onChange={e => setDefectFilter(e.target.value)}
              placeholder="Search by defect keyword (e.g. 'green lines', 'flicker', serial)..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#fffdf6] border border-[#e5e5e5] text-xs text-[#413634] placeholder-[#8b6c58]/60 focus:outline-none focus:border-[#413634]"
            />
            <Search size={13} className="text-[#666666] absolute left-2.5 top-2.5" />
          </div>

          {/* Subsystem Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#fffdf6] border border-[#e5e5e5] text-[#413634] focus:outline-none"
          >
            <option value="All">All Defect Categories</option>
            <option value="Screen & Display">Screen &amp; Display</option>
            <option value="Battery & Charging">Battery &amp; Charging</option>
            <option value="Camera & Sensor">Camera &amp; Sensor</option>
            <option value="Logic Board / Power">Logic Board / Power</option>
            <option value="Housing / Assembly">Housing / Assembly</option>
          </select>

          {/* State / Region Filter */}
          <select
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#fffdf6] border border-[#e5e5e5] text-[#413634] focus:outline-none"
          >
            <option value="All">All States / Regions</option>
            {uniqueStates.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#fffdf6] border border-[#e5e5e5] text-[#413634] focus:outline-none"
          >
            <option value="All">All Review Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Investigating">Investigating</option>
            <option value="Batch Hold Issued">Batch Hold Issued</option>
            <option value="Resolved / Cleared">Resolved / Cleared</option>
          </select>
        </div>

        <span className="text-[11px] text-[#666666]">
          Showing {filteredReports.length} of {reports.length} shop reports
        </span>
      </div>

      {/* Main Grid: Left Side Feed, Right Side Deep Batch & Location Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side (5 Cols): Real-time Incident Feed from Shops */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
            <h2 className="text-base text-[#413634] flex items-center gap-2">
              <Radio size={16} className="text-[#c5716d] animate-pulse" />
              <span>Incoming Shop Defect Stream</span>
            </h2>
            <span className="text-[10px] text-[#666666]">Select to inspect batch</span>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredReports.map(rep => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`p-4 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#fffdf6] border-[#c5716d] shadow-sm ring-1 ring-[#c5716d]'
                      : 'bg-[#fffcf8] border-[#e5e5e5] hover:border-[#413634]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium text-[#c5716d]">{rep.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 border ${
                      rep.status === 'Batch Hold Issued'
                        ? 'bg-[#fdf2f1] text-[#b84a44] border-[#b84a44]'
                        : rep.status === 'Investigating'
                        ? 'bg-[#fef7ec] text-[#b87428] border-[#b87428]'
                        : 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-[#413634] font-mono">{rep.serialNumber}</strong>
                      <span className="text-[11px] text-[#666666]">{rep.problemCategory}</span>
                    </div>
                    <div className="text-[11px] text-[#8b6c58] mt-0.5">{rep.productModel}</div>
                  </div>

                  <div className="mt-2 text-xs text-[#413634] bg-[#faf3dc] p-2 border border-[#e5e5e5]">
                    <span className="text-[10px] text-[#666666] block font-medium uppercase">Customer Problem:</span>
                    <p className="line-clamp-2 mt-0.5">{rep.problemDescription}</p>
                  </div>

                  <div className="mt-2 text-xs text-[#666666]">
                    <span className="text-[10px] text-[#666666] block font-medium uppercase">Suspected Cause:</span>
                    <p className="line-clamp-2 italic">{rep.suspectedCause}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#e5e5e5] flex items-center justify-between text-[11px] text-[#666666]">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-[#c5716d]" />
                      <span>{rep.shopName} ({rep.state})</span>
                    </span>
                    <span className="font-mono text-[10px]">{rep.reportedAt.slice(11, 16)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side (7 Cols): Deep Investigation, Batch Correlator & Multi-Shop Hold Manager */}
        <div className="lg:col-span-7 space-y-4">
          {selectedReport ? (
            <div className="space-y-4">
              {/* Step 1: Defect Matching Check */}
              <div className="p-4 vintage-card space-y-3">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#faf3dc] text-[#c5716d] flex items-center justify-center font-bold text-xs border border-[#413634]">
                      1
                    </span>
                    <h3 className="text-sm font-medium text-[#413634]">
                      Defect Similarity Matching Analysis
                    </h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 border ${
                    similarDefectsCount > 0
                      ? 'bg-[#fef7ec] text-[#b87428] border-[#b87428]'
                      : 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]'
                  }`}>
                    {similarDefectsCount > 0 ? `${similarDefectsCount} Similar Defect Reports Found` : 'No Other Matches (Isolated Case)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-[#faf3dc] border border-[#e5e5e5]">
                    <span className="text-[#666666] block text-[10px] uppercase">Active Reported Defect:</span>
                    <span className="font-medium text-[#413634]">{selectedReport.problemCategory}</span>
                    <p className="text-[11px] text-[#666666] mt-1">{selectedReport.problemDescription}</p>
                  </div>
                  <div className="p-2.5 bg-[#faf3dc] border border-[#e5e5e5]">
                    <span className="text-[#666666] block text-[10px] uppercase">Suspected Root Cause Hypothesis:</span>
                    <p className="text-[11px] text-[#413634] italic mt-0.5">"{selectedReport.suspectedCause}"</p>
                    <div className="mt-2 text-[10px] text-[#c5716d]">
                      Reported by {selectedReport.shopName} ({selectedReport.location})
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Manufacturing Batch Correlation */}
              <div className="p-4 vintage-card space-y-3">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#faf3dc] text-[#c5716d] flex items-center justify-center font-bold text-xs border border-[#413634]">
                      2
                    </span>
                    <h3 className="text-sm font-medium text-[#413634]">
                      Manufacturing Batch &amp; Production Date Correlator
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#c5716d]">
                    Batch ID: {selectedReport.batchId || 'ABC'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs bg-[#faf3dc] p-3 border border-[#e5e5e5]">
                  <div>
                    <span className="text-[#666666] block text-[10px] uppercase">Correlated Batch:</span>
                    <strong className="text-sm text-[#c5716d] font-mono">{selectedReport.batchId || 'ABC'}</strong>
                    <span className="text-[10px] text-[#666666] block mt-0.5">Display Subsystem</span>
                  </div>
                  <div>
                    <span className="text-[#666666] block text-[10px] uppercase">Exact Production Date:</span>
                    <strong className="text-sm text-[#413634] font-mono">{batchLocations?.productionDate || '2026-10-01'}</strong>
                    <span className="text-[10px] text-[#666666] block mt-0.5">Shift Alpha (08:30 KST)</span>
                  </div>
                  <div>
                    <span className="text-[#666666] block text-[10px] uppercase">Total Units Manufactured:</span>
                    <strong className="text-sm text-[#413634] font-mono">{batchLocations?.totalUnitsInBatch || 100} Mobiles</strong>
                    <span className="text-[10px] text-[#2e6b4d] block mt-0.5">100% Passport Linked</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[#666666]">
                    Supplier: <strong>{batchLocations?.supplier || 'Samsung Display Corp'}</strong> • Cleanroom Line 3
                  </span>
                  <button
                    onClick={() => navigate(`/lineage?batch=${selectedReport.batchId || 'ABC'}`)}
                    className="text-[#c5716d] hover:underline flex items-center gap-1"
                  >
                    <span>View Lineage Merkle Graph</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>

              {/* Step 3: Location Tracker of All Mobiles in Batch (Where the mobiles are located) */}
              <div className="p-4 vintage-card space-y-3">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#faf3dc] text-[#c5716d] flex items-center justify-center font-bold text-xs border border-[#413634]">
                      3
                    </span>
                    <h3 className="text-sm font-medium text-[#413634]">
                      Multi-Location Tracker: Where are the sister mobiles located?
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#666666]">
                    {batchLocations?.units.length || 87} Assembled Finished Units
                  </span>
                </div>

                <p className="text-xs text-[#666666]">
                  The company can immediately trace where every single unit from Batch <strong>{selectedReport.batchId || 'ABC'}</strong> is currently located (retail stores, warehouses, and carrier flights) so hold orders can be communicated to stop selling!
                </p>

                {/* Locations Summary Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {batchLocations?.locationsSummary.map(loc => (
                    <div
                      key={loc.location}
                      className="p-3.5 bg-[#faf3dc] border border-[#e5e5e5] rounded-none flex flex-col justify-between gap-2.5"
                    >
                      {/* Top Row: Location Name & Unit Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-medium text-[#413634] flex items-start gap-1.5 min-w-0">
                          <MapPin size={14} className="text-[#c5716d] shrink-0 mt-0.5" />
                          <span className="leading-snug break-words">{loc.location}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-[#c5716d] text-[#fffdf6] font-mono text-xs shrink-0 whitespace-nowrap shadow-xs">
                          {loc.count} units
                        </span>
                      </div>

                      {/* Bottom Row: Carrier and Shipment ID aligned */}
                      <div className="pt-2 border-t border-[#e5e5e5]/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="text-[#666666] truncate max-w-[240px]">
                          Carrier: <strong className="text-[#413634] font-normal">{loc.carrier}</strong>
                        </span>
                        <span className="font-mono text-[10px] text-[#8b6c58] bg-[#fffdf6] px-1.5 py-0.5 border border-[#e5e5e5] shrink-0">
                          {loc.shipmentId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Toolbar: Dispatch Hold to All Shops */}
                <div className="pt-3 border-t border-[#e5e5e5] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#b84a44] flex items-center gap-1.5 font-medium">
                    <AlertTriangle size={15} />
                    <span>Informing respective shops to hold the selling of the product</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportHoldManifest}
                      className="btn-vintage-outline text-xs flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>Download Shop Manifest (CSV)</span>
                    </button>
                    <button
                      onClick={handleDispatchHold}
                      className="btn-vintage-accent text-xs flex items-center gap-1.5 px-4 py-2"
                    >
                      <PhoneCall size={13} />
                      <span>Transmit Stop-Selling Hold Mandate</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Table of Specific Devices & IMEI in this Batch */}
              <div className="p-4 vintage-card space-y-3">
                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2 text-xs">
                  <h4 className="font-medium text-[#413634] flex items-center gap-2">
                    <Smartphone size={14} className="text-[#c5716d]" />
                    <span>Device Register in Batch {selectedReport.batchId || 'ABC'} ({batchLocations?.units.length || 0} Mobiles)</span>
                  </h4>
                  <span className="text-[10px] text-[#666666]">Sample breakdown across retail points</span>
                </div>

                <div className="max-h-52 overflow-y-auto border border-[#e5e5e5]">
                  <table className="w-full text-left text-[11px] divide-y divide-[#e5e5e5]">
                    <thead className="bg-[#faf3dc] text-[#666666] font-normal uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Device Serial</th>
                        <th className="p-2">Model</th>
                        <th className="p-2">Current Location / Retail Point</th>
                        <th className="p-2">Logistics Carrier</th>
                        <th className="p-2">Hold Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e5e5] bg-[#fffdf6]">
                      {batchLocations?.units.slice(0, 10).map((u, i) => (
                        <tr key={u.productId} className="hover:bg-[#faf3dc]">
                          <td className="p-2 font-mono text-[#c5716d]">{u.productId}</td>
                          <td className="p-2 text-[#413634] truncate max-w-[140px]">{u.model}</td>
                          <td className="p-2 text-[#413634]">{u.currentLocation}</td>
                          <td className="p-2 text-[#666666]">{u.carrier}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.2 text-[10px] border bg-[#fdf2f1] text-[#b84a44] border-[#b84a44]">
                              HOLD ORDERED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 vintage-card text-center text-[#666666] text-xs">
              Select a shopkeeper defect report from the left stream to begin batch correlation and location tracking.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
