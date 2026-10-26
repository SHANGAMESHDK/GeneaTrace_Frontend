import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  ShieldCheck,
  Search,
  Wrench,
  AlertTriangle,
  Copy,
  ExternalLink,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  MapPin,
  Truck,
  Cpu,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Boxes,
  Compass,
  AlertOctagon,
  FileText
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { ProductRecord, ShopkeeperDefectReport } from '../types';
import { api } from '../services/apiClient';

export const PassportPage: React.FC = () => {
  const { productId: paramProductId } = useParams();
  const navigate = useNavigate();

  // Search input state
  const [searchInput, setSearchInput] = useState(paramProductId || '');
  const [activeSearchedSerial, setActiveSearchedSerial] = useState<string | null>(paramProductId || null);
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [defectReport, setDefectReport] = useState<ShopkeeperDefectReport | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Progressive Disclosure states
  const [showPartDetails, setShowPartDetails] = useState(false);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Query passport and any linked shopkeeper defect report upon search
  useEffect(() => {
    if (activeSearchedSerial && activeSearchedSerial.trim()) {
      const clean = activeSearchedSerial.trim().toUpperCase();
      const foundProduct = GeneaTraceStore.getProduct(clean) ||
        GeneaTraceStore.getProducts().find(p => p.productId.toUpperCase() === clean || p.imeiMasked.toUpperCase() === clean);
      
      setProduct(foundProduct || null);

      // Search if a shopkeeper reported a defect for this unit
      const foundReport = GeneaTraceStore.getDefectReportBySerial(clean);
      setDefectReport(foundReport || null);

      setHasSearched(true);
      // Reset progressive disclosure toggles on new search
      setShowPartDetails(false);
      setShowBatchDetails(false);

      // Fetch live passport verification from Azure FastAPI backend
      api.getPublicPassport(clean)
        .then(res => {
          console.log(`Live backend passport for ${clean}:`, res);
        })
        .catch(err => {
          console.warn('Backend public passport fallback:', err);
        });
    } else {
      setProduct(null);
      setDefectReport(null);
      setHasSearched(false);
      setShowPartDetails(false);
      setShowBatchDetails(false);
    }
  }, [activeSearchedSerial]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setActiveSearchedSerial(searchInput.trim());
    navigate(`/passport/${searchInput.trim()}`, { replace: true });
  };

  const handleClear = () => {
    setSearchInput('');
    setActiveSearchedSerial(null);
    setProduct(null);
    setDefectReport(null);
    setHasSearched(false);
    setShowPartDetails(false);
    setShowBatchDetails(false);
    navigate('/passport', { replace: true });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Resolve Batch ID & Batch Locations
  const primaryBatchId = defectReport?.batchId ||
    (product?.installedComponents ? Object.values(product.installedComponents)[0]?.split('-')[0] : 'ABC');

  const batchLocations = primaryBatchId ? GeneaTraceStore.getBatchLocations(primaryBatchId) : null;

  return (
    <div className="space-y-6 font-serif-vintage max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl text-[#413634] flex items-center gap-2">
            <QrCode className="text-[#c5716d]" size={22} />
            <span>Digital Product Passport (DPP) Lookup</span>
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Search any manufactured unit (Smartphone, EV Battery, Medical Device, Aerospace Controller) by serial number or IMEI.
          </p>
        </div>

        <button
          onClick={() => navigate('/shop-portal')}
          className="btn-vintage-outline text-xs flex items-center gap-1.5"
        >
          <Wrench size={13} className="text-[#c5716d]" />
          <span>Report Defect as Shopkeeper</span>
        </button>
      </div>

      {/* Clean Search Input Form */}
      <div className="p-6 vintage-card bg-[#fffcf8] space-y-3">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <label className="block text-xs font-medium text-[#413634]">
            Enter Device Serial Number / IMEI / Digital Passport ID:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                autoFocus
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="e.g. GT-DEV-00000851, GT-DEV-00000853, GT-EVB-00094120, GT-MED-00041289..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#fffdf6] border border-[#413634] text-sm text-[#413634] font-mono placeholder-[#8b6c58]/60 focus:outline-none"
              />
              <Search className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="btn-vintage-accent px-6 py-2.5 text-xs font-medium flex items-center gap-2"
            >
              <span>Search Passport</span>
              <ArrowRight size={14} />
            </button>
            {hasSearched && (
              <button
                type="button"
                onClick={handleClear}
                className="btn-vintage-outline px-4 py-2.5 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Quick Sample Serials across sectors */}
        <div className="pt-2 border-t border-[#e5e5e5] flex flex-wrap items-center gap-2 text-[11px] text-[#666666]">
          <span>Try sample serials:</span>
          {[
            { s: 'GT-DEV-00000851', label: 'Mobile Phone #851' },
            { s: 'GT-DEV-00000853', label: 'Mobile Phone #853' },
            { s: 'GT-EVB-00094120', label: 'EV Battery Pack' },
            { s: 'GT-MED-00041289', label: 'Medical Implant' },
            { s: 'GT-AVN-00018902', label: 'Avionics Controller' }
          ].map(item => (
            <button
              key={item.s}
              type="button"
              onClick={() => {
                setSearchInput(item.s);
                setActiveSearchedSerial(item.s);
                navigate(`/passport/${item.s}`, { replace: true });
              }}
              className="px-2 py-0.5 bg-[#faf3dc] border border-[#e5e5e5] hover:border-[#413634] font-mono text-[#c5716d]"
              title={item.label}
            >
              {item.s}
            </button>
          ))}
        </div>
      </div>

      {/* BEFORE SEARCH: Empty State Prompt */}
      {!hasSearched && (
        <div className="p-12 vintage-card text-center space-y-3 bg-[#fffcf8]">
          <div className="w-12 h-12 mx-auto rounded-none bg-[#faf3dc] border border-[#e5e5e5] flex items-center justify-center text-[#c5716d]">
            <Search size={22} />
          </div>
          <h3 className="text-base text-[#413634] font-medium">Ready for Passport Query</h3>
          <p className="text-xs text-[#666666] max-w-md mx-auto leading-relaxed">
            Enter a product serial number in the search bar above to query reported defects, component parts, and multi-location batch distribution.
          </p>
        </div>
      )}

      {/* NOT FOUND: Error State */}
      {hasSearched && !product && !defectReport && (
        <div className="p-8 vintage-card text-center space-y-3 bg-[#fffdf6] border border-[#b84a44]">
          <div className="w-10 h-10 mx-auto rounded-none bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44] flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-base text-[#413634] font-medium">No Record Found</h3>
          <p className="text-xs text-[#666666]">
            No verified digital passport or reported defect found for serial <strong className="font-mono text-[#b84a44]">"{searchInput}"</strong>.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/shop-portal')}
              className="btn-vintage-outline text-xs"
            >
              Log New Defect Incident for this Serial as Service Technician
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Once entered serial no -> Show the DEFECT of the device only (What is reported, what is the cause) */}
      {hasSearched && (product || defectReport) && (
        <div className="space-y-5">
          {/* Defect Card: Exactly what user requested */}
          <div className="p-6 vintage-card bg-[#fffcf8] space-y-4 border-l-4 border-l-[#b84a44]">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="text-[#b84a44]" size={20} />
                <div>
                  <h2 className="text-lg text-[#413634] font-medium">
                    Reported Product Defect Analysis
                  </h2>
                  <span className="text-xs text-[#666666]">
                    Product: <strong>{product?.productModel || defectReport?.productModel || 'Manufactured Device'}</strong> ({activeSearchedSerial})
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 text-xs border bg-[#fdf2f1] text-[#b84a44] border-[#b84a44] font-mono">
                {defectReport?.status || 'Defect Logged'}
              </span>
            </div>

            {/* 2 Primary Informations Given by the Shopkeeper */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. What is the Reported Defect */}
              <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#b84a44] font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    <span>1. Reported Defect (Symptoms)</span>
                  </span>
                  <span className="text-[10px] text-[#666666]">From Service Technician</span>
                </div>
                <p className="text-xs text-[#413634] leading-relaxed font-medium">
                  {defectReport?.problemDescription ||
                    'Display panel exhibits severe horizontal flickering and green vertical lines after 20 minutes of usage. Touch matrix unresponsive around center quadrant.'}
                </p>
                <div className="text-[11px] text-[#8b6c58] pt-1 border-t border-[#e5e5e5]">
                  Subsystem Category: <strong>{defectReport?.problemCategory || 'Screen & Display'}</strong>
                </div>
              </div>

              {/* 2. What May Be the Cause (Suspected Cause) */}
              <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#b87428] font-semibold flex items-center gap-1.5">
                    <Wrench size={14} />
                    <span>2. Suspected Cause for the Defect</span>
                  </span>
                  <span className="text-[10px] text-[#666666]">Technician Hypothesis</span>
                </div>
                <p className="text-xs text-[#413634] leading-relaxed italic">
                  "{defectReport?.suspectedCause ||
                    'Defective display adhesive or polarizer delamination occurring during manufacturing curing stage.'}"
                </p>
                <div className="text-[11px] text-[#8b6c58] pt-1 border-t border-[#e5e5e5]">
                  Reported by: <strong>{defectReport?.shopName || 'iFix Retail & Service Hub - Indiranagar'}</strong> ({defectReport?.location || 'Bangalore, Karnataka'})
                </div>
              </div>
            </div>

            {/* Buttons for Progressive Disclosure */}
            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-[#e5e5e5]">
              <button
                onClick={() => setShowPartDetails(!showPartDetails)}
                className={`btn-vintage-primary text-xs flex items-center gap-2 ${showPartDetails ? 'bg-[#c5716d] text-white' : ''}`}
              >
                <Cpu size={14} />
                <span>{showPartDetails ? 'Hide Component Parts' : 'Show More Details (Serial No of Parts)'}</span>
                {showPartDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <button
                onClick={() => setShowBatchDetails(!showBatchDetails)}
                className={`btn-vintage-accent text-xs flex items-center gap-2 ${showBatchDetails ? 'bg-[#413634] text-white' : ''}`}
              >
                <Layers size={14} />
                <span>{showBatchDetails ? 'Hide Batch & Locations' : 'Show Batch Details & Locations'}</span>
                {showBatchDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* STEP 2: If click 'Show More Details' -> Serial No of Parts Should Be Shown There */}
          {showPartDetails && product && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-4 border-l-4 border-l-[#c5716d] animate-in fade-in duration-200">
              <div className="border-b border-[#e5e5e5] pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-base text-[#413634] font-medium flex items-center gap-2">
                    <Cpu size={16} className="text-[#c5716d]" />
                    <span>Component Parts &amp; Serial Numbers</span>
                  </h3>
                  <p className="text-xs text-[#666666]">
                    Every installed part serial number linked to this product passport.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#666666]">
                  {Object.keys(product.installedComponents).length} Subsystem Modules
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(product.installedComponents).map(([partName, partSerial]) => {
                  const isDefectivePart = partSerial.startsWith('ABC-') || partSerial.includes('ABC');
                  return (
                    <div
                      key={partName}
                      className={`p-3 border text-xs space-y-1 ${
                        isDefectivePart
                          ? 'bg-[#fdf2f1] border-[#b84a44]'
                          : 'bg-[#faf3dc] border-[#e5e5e5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#666666] text-[10px] uppercase">{partName}</span>
                        {isDefectivePart && (
                          <span className="text-[9px] px-1 bg-[#b84a44] text-white">
                            Defect Source
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-medium text-[#413634] text-xs break-all">
                        {partSerial}
                      </div>
                      <div className="text-[10px] text-[#8b6c58]">
                        Batch: <span className="font-mono">{partSerial.split('-')[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* General Device Identity */}
              <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#666666] uppercase block">Product Model</span>
                  <strong className="text-[#413634]">{product.productModel}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] uppercase block">Device Serial / UDI</span>
                  <strong className="text-[#c5716d] font-mono">{product.productId}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] uppercase block">Assembly Facility</span>
                  <strong className="text-[#413634]">{product.assemblyFacility}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] uppercase block">Assembly Date</span>
                  <strong className="text-[#413634] font-mono">{product.assemblyDate}</strong>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: If click 'Show Batch Details' -> Details of the batch product belongs, how many produced, and currently WHERE the products of the batch are located */}
          {showBatchDetails && batchLocations && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#413634] animate-in fade-in duration-200">
              <div className="border-b border-[#e5e5e5] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base text-[#413634] font-medium flex items-center gap-2">
                    <Layers size={17} className="text-[#c5716d]" />
                    <span>Batch Production &amp; Multi-Location Distribution</span>
                  </h3>
                  <p className="text-xs text-[#666666]">
                    Batch details and real-time locations of all products produced in Batch <strong>{batchLocations.batchId}</strong>.
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 bg-[#faf3dc] border border-[#e5e5e5] text-[#c5716d]">
                  Batch ID: {batchLocations.batchId}
                </span>
              </div>

              {/* Batch Summary: How many products assembled or produced */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#faf3dc] p-4 border border-[#e5e5e5]">
                <div>
                  <span className="text-[10px] text-[#666666] uppercase block">Batch Number:</span>
                  <strong className="text-base text-[#c5716d] font-mono">{batchLocations.batchId}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] uppercase block">Total Produced / Assembled:</span>
                  <strong className="text-base text-[#413634] font-mono">{batchLocations.totalUnitsInBatch} Units</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] uppercase block">Production Date:</span>
                  <strong className="text-base text-[#413634] font-mono">{batchLocations.productionDate}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#666666] uppercase block">Manufacturing Facility:</span>
                  <strong className="text-xs text-[#413634]">{batchLocations.facility}</strong>
                </div>
              </div>

              {/* CURRENT LOCATIONS OF PRODUCTS IN THIS BATCH */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm text-[#413634] font-medium flex items-center gap-2">
                    <MapPin size={15} className="text-[#c5716d]" />
                    <span>Where the products of this batch are currently located:</span>
                  </h4>
                  <span className="text-[11px] text-[#666666]">
                    Company manufacturing plant, distribution warehouses, &amp; retailer shops
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {/* Category 1: Still at Company Manufacturing Place */}
                  <div className="p-4 bg-[#fffdf6] border border-[#e5e5e5] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-1.5">
                      <span className="font-medium text-[#413634] flex items-center gap-1.5">
                        <Building2 size={14} className="text-[#2e6b4d]" />
                        <span>Company Manufacturing Plant</span>
                      </span>
                      <span className="px-1.5 py-0.2 bg-[#edf6f0] text-[#2e6b4d] font-mono text-[10px]">
                        At Factory
                      </span>
                    </div>
                    <div className="text-xl text-[#413634] font-mono font-medium">
                      13 Units
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      Still at company manufacturing plant / factory quarantine storage (Gumi Complex Line 3).
                    </p>
                  </div>

                  {/* Category 2: At Warehouses Ready to Dispatch */}
                  <div className="p-4 bg-[#fffdf6] border border-[#e5e5e5] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-1.5">
                      <span className="font-medium text-[#413634] flex items-center gap-1.5">
                        <Truck size={14} className="text-[#b87428]" />
                        <span>Warehouses / Transit Hubs</span>
                      </span>
                      <span className="px-1.5 py-0.2 bg-[#fef7ec] text-[#b87428] font-mono text-[10px]">
                        Ready to Dispatch
                      </span>
                    </div>
                    <div className="text-xl text-[#b87428] font-mono font-medium">
                      49 Units
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      Located across regional distribution warehouses (Frankfurt Cargo City, Munich Hub, &amp; Incheon Depot).
                    </p>
                  </div>

                  {/* Category 3: At Retailer Shops */}
                  <div className="p-4 bg-[#fffdf6] border border-[#e5e5e5] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-1.5">
                      <span className="font-medium text-[#413634] flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#b84a44]" />
                        <span>Retailer Shops</span>
                      </span>
                      <span className="px-1.5 py-0.2 bg-[#fdf2f1] text-[#b84a44] font-mono text-[10px]">
                        In Retail Store
                      </span>
                    </div>
                    <div className="text-xl text-[#b84a44] font-mono font-medium">
                      38 Units
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      Delivered to authorized dealer shops &amp; electronics retail stores across cities.
                    </p>
                  </div>
                </div>

                {/* Specific Location Summary Table */}
                <div className="border border-[#e5e5e5] overflow-x-auto text-xs">
                  <table className="w-full text-left divide-y divide-[#e5e5e5]">
                    <thead className="bg-[#faf3dc] text-[#666666] font-normal uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Specific Location</th>
                        <th className="p-2.5">Facility Type</th>
                        <th className="p-2.5">Units Count</th>
                        <th className="p-2.5">Carrier / Shipment ID</th>
                        <th className="p-2.5">Hold Mandate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e5e5] bg-[#fffdf6] text-[11px]">
                      <tr className="hover:bg-[#faf3dc]">
                        <td className="p-2.5 font-medium text-[#413634]">Gumi Mega-Hub Cleanroom Quarantine</td>
                        <td className="p-2.5 text-[#2e6b4d]">Company Manufacturing Plant</td>
                        <td className="p-2.5 font-mono">13 units</td>
                        <td className="p-2.5 font-mono text-[#666666]">PLANT-HOLD-01</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.2 text-[10px] bg-[#edf6f0] text-[#2e6b4d] border border-[#2e6b4d]">
                            LOCKED AT FACTORY
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-[#faf3dc]">
                        <td className="p-2.5 font-medium text-[#413634]">Munich Rail Freight Gateway Hub</td>
                        <td className="p-2.5 text-[#b87428]">Transit Warehouse (Ready to Dispatch)</td>
                        <td className="p-2.5 font-mono">25 units</td>
                        <td className="p-2.5 font-mono text-[#666666]">GT-SHP-00000326 (DHL)</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.2 text-[10px] bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44]">
                            STOP-DISPATCH HOLD
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-[#faf3dc]">
                        <td className="p-2.5 font-medium text-[#413634]">Frankfurt Cargo City Distribution Center</td>
                        <td className="p-2.5 text-[#b87428]">Regional Distribution Warehouse</td>
                        <td className="p-2.5 font-mono">24 units</td>
                        <td className="p-2.5 font-mono text-[#666666]">GT-SHP-00000327 (FedEx)</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.2 text-[10px] bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44]">
                            STOP-DISPATCH HOLD
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-[#faf3dc]">
                        <td className="p-2.5 font-medium text-[#413634]">Retail Store Network (Bangalore, Mumbai, Delhi, Munich)</td>
                        <td className="p-2.5 text-[#b84a44]">Authorized Retailer Shops</td>
                        <td className="p-2.5 font-mono">38 units</td>
                        <td className="p-2.5 font-mono text-[#666666]">Multiple Retail Channels</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.2 text-[10px] bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44]">
                            STOP-SELLING ORDERED
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Direct Action Link to Corporate Hold Dispatch */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[#666666]">
                    Informing all respective retailer shops and warehouses to hold selling:
                  </span>
                  <button
                    onClick={() => navigate('/company-defects')}
                    className="btn-vintage-accent text-xs flex items-center gap-1.5"
                  >
                    <span>Manage Shop Stop-Sale Mandates</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
