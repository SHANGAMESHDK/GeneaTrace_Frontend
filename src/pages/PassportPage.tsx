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
  ArrowRight
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { ProductRecord } from '../types';

export const PassportPage: React.FC = () => {
  const { productId: paramProductId } = useParams();
  const navigate = useNavigate();

  // Search input state - user types serial no here
  const [searchInput, setSearchInput] = useState(paramProductId || '');
  const [activeSearchedSerial, setActiveSearchedSerial] = useState<string | null>(paramProductId || null);
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  // If a param exists in URL or user triggers search
  useEffect(() => {
    if (activeSearchedSerial && activeSearchedSerial.trim()) {
      const clean = activeSearchedSerial.trim().toUpperCase();
      const found = GeneaTraceStore.getProduct(clean) ||
        GeneaTraceStore.getProducts().find(p => p.productId.toUpperCase() === clean || p.imeiMasked.toUpperCase() === clean);
      setProduct(found || null);
      setHasSearched(true);
    } else {
      setProduct(null);
      setHasSearched(false);
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
    setHasSearched(false);
    navigate('/passport', { replace: true });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const passportUrl = product ? `${window.location.origin}/passport/${product.productId}` : '';
  const isRecallFlagged = product?.status === 'Recall Flagged';

  return (
    <div className="space-y-6 font-serif-vintage max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl text-[#413634] flex items-center gap-2">
            <QrCode className="text-[#c5716d]" size={22} />
            <span>Digital Product Passport (DPP) Lookup</span>
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Search device serial number or IMEI to retrieve cryptographic identity, batch origin, and lifecycle passport.
          </p>
        </div>

        <button
          onClick={() => navigate('/shop-portal')}
          className="btn-vintage-outline text-xs flex items-center gap-1.5"
          title="Service technician entry for defective unit"
        >
          <Wrench size={13} className="text-[#c5716d]" />
          <span>Report Defect as Shopkeeper</span>
        </button>
      </div>

      {/* Primary Clean Search Bar */}
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
                placeholder="e.g. GT-DEV-00000851, GT-DEV-00000853, or scan barcode..."
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

        {/* Subtle quick test hints for convenience */}
        <div className="pt-2 border-t border-[#e5e5e5] flex flex-wrap items-center gap-2 text-[11px] text-[#666666]">
          <span>Try sample device serials:</span>
          {['GT-DEV-00000851', 'GT-DEV-00000853', 'GT-DEV-00000856', 'GT-DEV-00000860'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSearchInput(s);
                setActiveSearchedSerial(s);
                navigate(`/passport/${s}`, { replace: true });
              }}
              className="px-2 py-0.5 bg-[#faf3dc] border border-[#e5e5e5] hover:border-[#413634] font-mono text-[#c5716d]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* STATE 1: Empty Search Prompt (No data shown before searching) */}
      {!hasSearched && (
        <div className="p-12 vintage-card text-center space-y-3 bg-[#fffcf8]">
          <div className="w-12 h-12 mx-auto rounded-none bg-[#faf3dc] border border-[#e5e5e5] flex items-center justify-center text-[#c5716d]">
            <Search size={22} />
          </div>
          <h3 className="text-base text-[#413634] font-medium">Ready for Passport Query</h3>
          <p className="text-xs text-[#666666] max-w-md mx-auto leading-relaxed">
            Enter a device serial number in the search bar above to fetch its authenticated Digital Product Passport, assembly batch history, and verification certificates.
          </p>
        </div>
      )}

      {/* STATE 2: Searched but Not Found */}
      {hasSearched && !product && (
        <div className="p-8 vintage-card text-center space-y-3 bg-[#fffdf6] border border-[#b84a44]">
          <div className="w-10 h-10 mx-auto rounded-none bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44] flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-base text-[#413634] font-medium">No Passport Found</h3>
          <p className="text-xs text-[#666666]">
            No verified digital passport was found for serial number <strong className="font-mono text-[#b84a44]">"{searchInput}"</strong>. Verify the serial or connect with your backend API.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/shop-portal')}
              className="btn-vintage-outline text-xs"
            >
              Log Defect Report for this Serial as Service Technician
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: Product Found - Clean & Authoritative DPP Card */}
      {hasSearched && product && (
        <div className="space-y-6">
          {/* Active Recall Banner if applicable */}
          {isRecallFlagged && (
            <div className="p-4 bg-[#fdf2f1] border border-[#b84a44] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-[#b84a44] shrink-0" size={18} />
                <div>
                  <span className="font-medium text-sm text-[#413634]">Precision Recall Hold Notice</span>
                  <p className="text-[#666666] mt-0.5">
                    This unit carries a component from defective Batch <strong>ABC</strong>. Selling hold has been requested by corporate QA.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/company-defects')}
                className="btn-vintage-accent shrink-0 text-xs"
              >
                Inspect Batch in Defect Hub
              </button>
            </div>
          )}

          {/* Main Passport Presentation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: QR Code & Core Identity */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 vintage-card text-center space-y-4 bg-[#fffcf8]">
                <div className="p-2 bg-[#faf3dc] border border-[#e5e5e5] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#666666]">{product.productTypeDisplay}</span>
                  <span className="text-[#c5716d]">VERIFIED DPP</span>
                </div>

                {/* QR Code Container */}
                <div className="p-4 bg-white border border-[#413634] inline-block shadow-sm">
                  <QRCodeSVG
                    value={passportUrl}
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div>
                  <h2 className="text-lg text-[#413634] font-normal">{product.productModel}</h2>
                  <div className="text-xs font-mono text-[#c5716d] mt-1">{product.productId}</div>
                  <div className="text-[11px] text-[#666666] font-mono mt-0.5">IMEI: {product.imeiMasked}</div>
                </div>

                <div className="pt-2 border-t border-[#e5e5e5] flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyToClipboard(product.productId)}
                    className="btn-vintage-outline text-xs py-1"
                  >
                    <Copy size={12} />
                    <span>{copied ? 'Copied' : 'Copy Serial'}</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(passportUrl)}
                    className="btn-vintage-outline text-xs py-1"
                  >
                    <ExternalLink size={12} />
                    <span>Copy URL</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Technical Attributes & Batch Lineage */}
            <div className="lg:col-span-7 space-y-4">
              {/* Core Attributes Table */}
              <div className="p-5 vintage-card bg-[#fffcf8] space-y-3">
                <h3 className="text-sm text-[#413634] font-medium border-b border-[#e5e5e5] pb-2 flex items-center justify-between">
                  <span>Manufacturing &amp; Batch Passport Details</span>
                  <span className="text-[10px] text-[#2e6b4d] font-mono flex items-center gap-1">
                    <ShieldCheck size={12} />
                    <span>Ledger Anchored</span>
                  </span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-[#faf3dc] border border-[#e5e5e5]">
                    <span className="text-[10px] text-[#666666] uppercase block">Assembly Date</span>
                    <strong className="text-[#413634] font-mono text-xs">{product.assemblyDate}</strong>
                  </div>
                  <div className="p-2.5 bg-[#faf3dc] border border-[#e5e5e5]">
                    <span className="text-[10px] text-[#666666] uppercase block">Assembly Facility</span>
                    <strong className="text-[#413634] text-xs">{product.assemblyFacility}</strong>
                  </div>
                  <div className="p-2.5 bg-[#faf3dc] border border-[#e5e5e5]">
                    <span className="text-[10px] text-[#666666] uppercase block">Current Lifecycle Status</span>
                    <span className={`inline-block px-1.5 py-0.2 mt-0.5 text-[10px] border ${
                      isRecallFlagged
                        ? 'bg-[#fdf2f1] text-[#b84a44] border-[#b84a44]'
                        : 'bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d]'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#faf3dc] border border-[#e5e5e5]">
                    <span className="text-[10px] text-[#666666] uppercase block">Shipment ID</span>
                    <strong className="text-[#413634] font-mono text-xs">{product.shipmentId || 'GT-SHP-00000326'}</strong>
                  </div>
                </div>
              </div>

              {/* Installed Subsystem Components & Batches */}
              <div className="p-5 vintage-card bg-[#fffcf8] space-y-3">
                <h3 className="text-sm text-[#413634] font-medium border-b border-[#e5e5e5] pb-2">
                  Installed Components &amp; Linked Batches
                </h3>

                <div className="divide-y divide-[#e5e5e5] text-xs">
                  {Object.entries(product.installedComponents).map(([compName, compSerial]) => {
                    const isDefectiveBatch = compSerial.startsWith('ABC-') || compSerial.includes('ABC');
                    return (
                      <div key={compName} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="text-[#413634] font-medium">{compName}</div>
                          <div className="text-[11px] text-[#666666] font-mono">{compSerial}</div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 text-[10px] border ${
                            isDefectiveBatch
                              ? 'bg-[#fdf2f1] text-[#b84a44] border-[#b84a44]'
                              : 'bg-[#faf3dc] text-[#413634] border-[#e5e5e5]'
                          }`}>
                            Batch: {compSerial.split('-')[0]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
