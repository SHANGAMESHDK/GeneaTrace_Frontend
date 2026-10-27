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
  Boxes,
  AlertOctagon,
  FileText,
  UserCheck,
  Lock,
  Sparkles,
  Smartphone,
  Radio,
  Clock,
  ChevronRight,
  RotateCcw,
  Download
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { ProductRecord, ShopkeeperDefectReport } from '../types';
import { api } from '../services/apiClient';

export const PassportPage: React.FC = () => {
  const { productId: paramProductId } = useParams();
  const navigate = useNavigate();

  // Search input state (defaults to showcase unit Samsung A55 - AAA12345678)
  const defaultShowcaseId = 'AAA12345678';
  const initialSerial = paramProductId || defaultShowcaseId;
  const [searchInput, setSearchInput] = useState(initialSerial);
  const [activeSearchedSerial, setActiveSearchedSerial] = useState<string | null>(initialSerial);
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [defectReport, setDefectReport] = useState<ShopkeeperDefectReport | null>(null);
  const [hasSearched, setHasSearched] = useState(true);

  // Active Workflow Tab
  const [activeTab, setActiveTab] = useState<'customer' | 'stages' | 'logistics' | 'defect' | 'components' | 'batch'>('customer');
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
    navigate('/passport', { replace: true });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Resolve Batch ID & Batch Locations
  const primaryBatchId = defectReport?.batchId ||
    (product?.installedComponents ? Object.values(product.installedComponents)[0]?.split('-')[0] : 'AAA');

  const batchLocations = primaryBatchId ? GeneaTraceStore.getBatchLocations(primaryBatchId) : null;

  // Download Pictorial DPP Label (PNG)
  const downloadPictorialLabel = () => {
    const serial = product?.productId || activeSearchedSerial || 'AAA12345678';
    const model = product?.productModel || 'Samsung Galaxy A55 5G (Enterprise Edition)';
    const batch = primaryBatchId || 'AAA';
    const merkle = product?.merkleRoot || '0x9f3b8a1c4e72d05f88b14a2c91e3f706';
    const qrSvg = document.getElementById('passport-qr-svg') as SVGSVGElement | null;
    if (!qrSvg) return;

    const svgXml = new XMLSerializer().serializeToString(qrSvg);
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 740;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Vintage Parchment Industrial Background
      ctx.fillStyle = '#fffdf6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer border
      ctx.strokeStyle = '#413634';
      ctx.lineWidth = 6;
      ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

      // Inner thin border
      ctx.strokeStyle = '#c5716d';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

      // Header Band
      ctx.fillStyle = '#413634';
      ctx.fillRect(24, 24, canvas.width - 48, 64);

      // Header Text
      ctx.fillStyle = '#fffdf6';
      ctx.font = 'bold 17px serif';
      ctx.textAlign = 'center';
      ctx.fillText('GENEATRACE DIGITAL PRODUCT PASSPORT', canvas.width / 2, 52);
      ctx.font = '11px monospace';
      ctx.fillText('EU DPP DIRECTIVE (ESPR) • IMMUTABLE MERKLE ANCHOR', canvas.width / 2, 72);

      // Product Title
      ctx.fillStyle = '#413634';
      ctx.font = 'bold 19px serif';
      ctx.fillText(model, canvas.width / 2, 126);

      // Batch & Container Serial Banner
      ctx.fillStyle = '#faf3dc';
      ctx.fillRect(40, 142, canvas.width - 80, 52);
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 142, canvas.width - 80, 52);

      ctx.fillStyle = '#c5716d';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`CRYPTOGRAPHIC SERIAL NO: ${serial}`, canvas.width / 2, 164);
      ctx.fillStyle = '#413634';
      ctx.font = '12px serif';
      ctx.fillText(`Assigned Batch: ${batch}  •  Facility: Samsung Mega-Hub 4, Gumi`, canvas.width / 2, 182);

      // Draw QR Code
      const qrSize = 250;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 210;

      // QR Background Plate
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      ctx.strokeStyle = '#413634';
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Cryptographic Lineage Details below QR
      ctx.fillStyle = '#413634';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`MERKLE DAG: ${merkle.slice(0, 32)}...`, canvas.width / 2, 502);

      ctx.font = '11px serif';
      ctx.fillStyle = '#2e6b4d';
      ctx.fillText('✔ CRYPTOGRAPHIC BLOCKCHAIN CONTAINER SEALED (STEP 2 & 6)', canvas.width / 2, 526);

      // Simulated Barcode Lines
      const barcodeY = 550;
      const barcodeWidth = canvas.width - 120;
      const startX = 60;
      ctx.fillStyle = '#413634';
      for (let x = 0; x < barcodeWidth; x += 4) {
        if ((x * 17) % 7 !== 0) {
          ctx.fillRect(startX + x, barcodeY, (x % 3 === 0 ? 2.5 : 1.5), 36);
        }
      }

      ctx.font = '10px monospace';
      ctx.fillStyle = '#666666';
      ctx.fillText(`*${serial}*`, canvas.width / 2, 604);

      // Footer
      ctx.fillStyle = '#8b6c58';
      ctx.font = '10px serif';
      ctx.fillText('Scan with GeneaTrace Edge Station or any standard QR scanner to verify DPP.', canvas.width / 2, 642);
      ctx.fillText('https://geneatrace.vercel.app/passport/' + serial, canvas.width / 2, 658);

      // Trigger file download
      const link = document.createElement('a');
      link.download = `GeneaTrace_${batch}_${serial}_Pictorial_Label.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgXml)));
  };

  return (
    <div className="space-y-6 font-serif-vintage max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl text-[#413634] flex items-center gap-2">
            <QrCode className="text-[#c5716d]" size={22} />
            <span>Digital Product Passport (DPP) &amp; Lineage Engine</span>
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Query cryptographic product lineage, batch assignment, stage station ingestion, logistics, and retail handovers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/scanner')}
            className="btn-vintage-outline text-xs flex items-center gap-1.5"
            title="Scan QR Code or Push Assembly Stage"
          >
            <Smartphone size={13} className="text-[#2e6b4d]" />
            <span>Assembly Station Scanner</span>
          </button>
          <button
            onClick={() => navigate('/shop-portal')}
            className="btn-vintage-outline text-xs flex items-center gap-1.5"
          >
            <Wrench size={13} className="text-[#c5716d]" />
            <span>Retail Hub Portal</span>
          </button>
        </div>
      </div>

      {/* Clean Search Input Form */}
      <div className="p-6 vintage-card bg-[#fffcf8] space-y-3">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <label className="block text-xs font-medium text-[#413634]">
            Enter Device Serial Number / IMEI / Cryptographic Container ID:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                autoFocus
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="e.g. AAA12345678, GT-DEV-00000851, GT-EVB-00094120..."
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
          <span>Showcase product:</span>
          {[
            { s: 'AAA12345678', label: 'Samsung Galaxy A55 5G (Batch AAA)' },
            { s: 'GT-DEV-00000851', label: 'Showcase Device 851' },
            { s: 'GT-EVB-00094120', label: 'EV Battery Pack' },
            { s: 'GT-MED-00041289', label: 'Medical Implant' }
          ].map(item => (
            <button
              key={item.s}
              type="button"
              onClick={() => {
                setSearchInput(item.s);
                setActiveSearchedSerial(item.s);
                navigate(`/passport/${item.s}`, { replace: true });
              }}
              className="px-2.5 py-0.5 bg-[#faf3dc] border border-[#e5e5e5] hover:border-[#413634] font-mono text-[#c5716d]"
              title={item.label}
            >
              <strong>{item.s}</strong> ({item.label})
            </button>
          ))}
        </div>
      </div>

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

      {/* FOUND: Digital Product Passport View */}
      {hasSearched && (product || defectReport) && (
        <div className="space-y-6">
          {/* Master Certificate & Container Overview Banner */}
          <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#2e6b4d]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#2e6b4d] font-bold">
                    Official EU DPP Directive (ESPR)
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-[#edf6f0] border border-[#2e6b4d] text-[#2e6b4d] font-mono">
                    Cryptographically Sealed
                  </span>
                </div>
                <h2 className="text-2xl text-[#413634] font-medium">
                  {product?.productModel || defectReport?.productModel || 'Samsung Galaxy A55 5G'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#666666] pt-1">
                  <span>Blockchain Serial / Container: <strong className="font-mono text-[#c5716d]">{product?.productId || activeSearchedSerial}</strong></span>
                  <span>Batch: <strong className="font-mono text-[#413634]">{primaryBatchId}</strong></span>
                  <span>Facility: <strong>{product?.assemblyFacility || 'Samsung Smart Mega-Hub 4, Gumi'}</strong></span>
                </div>
              </div>

              {/* QR Code Anchor & Pictorial Download */}
              <div className="flex items-center gap-3 bg-[#faf3dc] p-3 border border-[#e5e5e5]">
                <QRCodeSVG
                  id="passport-qr-svg"
                  value={`https://geneatrace.vercel.app/passport/${product?.productId || activeSearchedSerial}`}
                  size={68}
                  level="M"
                />
                <div className="text-[10px] space-y-1">
                  <div className="font-bold text-[#413634]">Live DPP QR</div>
                  <button
                    onClick={() => copyToClipboard(`https://geneatrace.vercel.app/passport/${product?.productId || activeSearchedSerial}`)}
                    className="flex items-center gap-1 text-[#c5716d] hover:underline"
                  >
                    <Copy size={11} />
                    <span>{copied ? 'Copied URL!' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={downloadPictorialLabel}
                    className="flex items-center gap-1 text-[#2e6b4d] font-bold hover:underline"
                    title="Download newly generated cryptographic serial no. as PNG pictorial label"
                  >
                    <Download size={11} />
                    <span>Download Label (PNG)</span>
                  </button>
                  <div className="text-[#666666] font-mono text-[9px]">Merkle Anchored</div>
                </div>
              </div>
            </div>

            {/* Cryptographic Container & Merkle Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#faf3dc] p-3.5 border border-[#e5e5e5]">
              <div>
                <span className="text-[10px] text-[#666666] uppercase block">Merkle Root Hash</span>
                <span className="font-mono text-[11px] text-[#413634] break-all">
                  {product?.merkleRoot || '0x9f3b8a1c4e72d05f88b14a2c91e3f706'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] uppercase block">Blockchain Anchor Tx</span>
                <span className="font-mono text-[11px] text-[#2e6b4d] break-all">
                  {product?.blockchainTx || '0xa45b98cf120194bc87123985'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] uppercase block">Hardware Lock / Tamper Status</span>
                <span className={`font-mono font-medium ${product?.isLocked ? 'text-[#b84a44]' : 'text-[#2e6b4d]'}`}>
                  {product?.isLocked ? 'LOCKED (Tamper Triggered)' : 'Genuine OEM Attested'}
                </span>
              </div>
            </div>

            {/* 15-Step Workflow Horizontal Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#e5e5e5]">
              <button
                onClick={() => setActiveTab('customer')}
                className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  activeTab === 'customer'
                    ? 'bg-[#413634] text-white border-[#413634]'
                    : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#413634]'
                }`}
              >
                <UserCheck size={13} />
                <span>1. Customer Sale &amp; Retail Handover</span>
              </button>

              <button
                onClick={() => setActiveTab('stages')}
                className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  activeTab === 'stages'
                    ? 'bg-[#413634] text-white border-[#413634]'
                    : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#413634]'
                }`}
              >
                <Smartphone size={13} />
                <span>2. Assembly Stations Ingestion</span>
              </button>

              <button
                onClick={() => setActiveTab('logistics')}
                className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  activeTab === 'logistics'
                    ? 'bg-[#413634] text-white border-[#413634]'
                    : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#413634]'
                }`}
              >
                <Truck size={13} />
                <span>3. Logistics &amp; Custody</span>
              </button>

              <button
                onClick={() => setActiveTab('defect')}
                className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  activeTab === 'defect'
                    ? 'bg-[#b84a44] text-white border-[#b84a44]'
                    : 'bg-[#fdf2f1] text-[#b84a44] border-[#b84a44] hover:bg-[#b84a44] hover:text-white'
                }`}
              >
                <AlertOctagon size={13} />
                <span>4. Defect Backtrace &amp; Recall</span>
              </button>

              <button
                onClick={() => setActiveTab('components')}
                className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  activeTab === 'components'
                    ? 'bg-[#413634] text-white border-[#413634]'
                    : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#413634]'
                }`}
              >
                <Cpu size={13} />
                <span>5. Anti-Tamper &amp; Parts</span>
              </button>

              <button
                onClick={() => setActiveTab('batch')}
                className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  activeTab === 'batch'
                    ? 'bg-[#413634] text-white border-[#413634]'
                    : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#413634]'
                }`}
              >
                <Layers size={13} />
                <span>6. Batch Distribution</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Customer Sale & Retail Handover (Steps 8, 9, 15) */}
          {activeTab === 'customer' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#413634] animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <div>
                  <h3 className="text-base text-[#413634] font-medium flex items-center gap-2">
                    <UserCheck size={18} className="text-[#2e6b4d]" />
                    <span>Customer Sale &amp; Retail Handover Details (Steps 8, 9, 15)</span>
                  </h3>
                  <p className="text-xs text-[#666666]">
                    Uploaded directly by the authorized retailer upon delivery &amp; consumer purchase.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs border bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d] font-mono">
                  {product?.customerSale?.status || 'Active Customer Ownership'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                  <span className="text-[10px] text-[#666666] uppercase block font-semibold">Customer Personal Info</span>
                  <div className="text-base text-[#413634] font-medium">
                    {product?.customerSale?.customerName || 'Vikram Malhotra'}
                  </div>
                  <div className="text-xs text-[#666666] font-mono">
                    Phone: {product?.customerSale?.phone || '+91 98765 43210'}
                  </div>
                  <div className="text-xs text-[#666666]">
                    Billing Address: Indiranagar 100ft Road, Bangalore, Karnataka
                  </div>
                </div>

                <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                  <span className="text-[10px] text-[#666666] uppercase block font-semibold">Retail Sale Record</span>
                  <div className="text-xs text-[#413634]">
                    Retail Store: <strong>{product?.customerSale?.retailerShop || 'Apex Retail & Service Hub - Indiranagar'}</strong>
                  </div>
                  <div className="text-xs text-[#413634] font-mono">
                    Invoice No: <strong>{product?.customerSale?.invoiceNo || 'INV-BLR-2026-8812'}</strong>
                  </div>
                  <div className="text-xs text-[#666666]">
                    Sale Date: <strong className="font-mono">{product?.customerSale?.saleDate || '2026-10-15'}</strong>
                  </div>
                </div>
              </div>

              {/* Step 15: Re-Delivery Status if unit underwent repair */}
              <div className="p-4 bg-[#edf6f0] border border-[#2e6b4d] flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-medium text-[#2e6b4d] flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    <span>Step 15: Customer Handover Re-Delivery Protocol Active</span>
                  </div>
                  <p className="text-[#666666]">
                    If a repaired unit is received from manufacturer, retailer contacts customer Vikram Malhotra for verified return handover.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/shop-portal')}
                  className="btn-vintage-outline text-xs flex items-center gap-1"
                >
                  <span>Open Retailer Hub</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Assembly Stations Ingestion (Steps 4, 5, 6) */}
          {activeTab === 'stages' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#2e6b4d] animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <div>
                  <h3 className="text-base text-[#413634] font-medium flex items-center gap-2">
                    <Smartphone size={18} className="text-[#2e6b4d]" />
                    <span>Assembly Station Ingestion (Steps 4, 5, 6)</span>
                  </h3>
                  <p className="text-xs text-[#666666]">
                    Null container initialized at manufacturer login; timestamp, machine ID, and process pushed upon scanning each station.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/scanner')}
                  className="btn-vintage-accent text-xs flex items-center gap-1.5"
                >
                  <span>Simulate Next Station Ingestion</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Station Pipeline View */}
              <div className="space-y-3">
                {(product?.assemblyStages || [
                  {
                    stageIndex: 1,
                    name: 'SMT PCB Solder & Flux Printing',
                    machineId: 'SMT-01',
                    timestamp: '2026-10-02 08:30:14 UTC',
                    operator: 'Rajesh V.',
                    status: 'Completed',
                    hash: '0x1a8f9c4b220194bc'
                  },
                  {
                    stageIndex: 2,
                    name: 'Super AMOLED Display Module Lamination',
                    machineId: 'DISP-04',
                    timestamp: '2026-10-02 09:12:45 UTC',
                    operator: 'Elena Rostova',
                    status: 'Flagged (Thermal Variance Detected)',
                    hash: '0x2b7e6d5a88194c71'
                  },
                  {
                    stageIndex: 3,
                    name: 'Motherboard & Secure Enclave Cryptographic Binding',
                    machineId: 'SEC-02',
                    timestamp: '2026-10-02 10:05:22 UTC',
                    operator: 'Kenji Sato',
                    status: 'Completed',
                    hash: '0x3c6d5e4f440285a2'
                  },
                  {
                    stageIndex: 4,
                    name: 'Automated Optical Inspection (AOI) Quality Gate',
                    machineId: 'AOI-01',
                    timestamp: '2026-10-02 10:45:00 UTC',
                    operator: 'Automated Gate',
                    status: 'Sealed & Merkle Root Anchored',
                    hash: '0x4d5c6b7a993184ef'
                  }
                ]).map((stage) => {
                  const isFlagged = stage.status.includes('Flagged') || stage.machineId === 'DISP-04';
                  return (
                    <div
                      key={stage.stageIndex}
                      className={`p-4 border text-xs space-y-2 ${
                        isFlagged
                          ? 'bg-[#fdf2f1] border-[#b84a44]'
                          : 'bg-[#faf3dc] border-[#e5e5e5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 flex items-center justify-center font-bold font-mono text-[11px] ${
                            isFlagged ? 'bg-[#b84a44] text-white' : 'bg-[#413634] text-white'
                          }`}>
                            {stage.stageIndex}
                          </span>
                          <strong className="text-sm text-[#413634]">{stage.name}</strong>
                          {isFlagged && (
                            <span className="px-1.5 py-0.2 bg-[#b84a44] text-white text-[9px] font-mono">
                              ROOT CAUSE STAGE
                            </span>
                          )}
                        </div>
                        <span className={`font-mono text-[10px] px-2 py-0.5 border ${
                          isFlagged
                            ? 'bg-white text-[#b84a44] border-[#b84a44]'
                            : 'bg-white text-[#2e6b4d] border-[#2e6b4d]'
                        }`}>
                          {stage.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-[#666666]">
                        <div>
                          Machine ID: <strong className="font-mono text-[#413634]">{stage.machineId}</strong>
                        </div>
                        <div>
                          Operator: <strong className="text-[#413634]">{stage.operator}</strong>
                        </div>
                        <div>
                          Timestamp: <strong className="font-mono text-[#413634]">{stage.timestamp}</strong>
                        </div>
                        <div>
                          Stage Hash: <strong className="font-mono text-[#413634]">{stage.hash?.slice(0, 10) || '0x9f3b...'}...</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Logistics Custody Chain (Step 7) */}
          {activeTab === 'logistics' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#b87428] animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <div>
                  <h3 className="text-base text-[#413634] font-medium flex items-center gap-2">
                    <Truck size={18} className="text-[#b87428]" />
                    <span>Logistics Custody Chain (Step 7: Packing ➔ Warehouse ➔ Dispatched ➔ Retail)</span>
                  </h3>
                  <p className="text-xs text-[#666666]">
                    Step 7 logistics custody checkpoints anchored immutably to the blockchain shipment manifest.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/logistics')}
                  className="btn-vintage-outline text-xs flex items-center gap-1"
                >
                  <span>Open Full Logistics Hub</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5] space-y-1">
                  <div className="text-[10px] text-[#666666] uppercase font-semibold">1. Factory Packing</div>
                  <strong className="text-[#413634] block">Packaging &amp; Seal</strong>
                  <div className="text-[10px] text-[#8b6c58]">Gumi Mega-Hub Cleanroom</div>
                  <span className="inline-block mt-1 px-1.5 py-0.2 bg-[#edf6f0] text-[#2e6b4d] font-mono text-[9px]">
                    COMPLETED
                  </span>
                </div>

                <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5] space-y-1">
                  <div className="text-[10px] text-[#666666] uppercase font-semibold">2. Factory Warehouse</div>
                  <strong className="text-[#413634] block">Outbound Clearance</strong>
                  <div className="text-[10px] text-[#8b6c58]">Gumi Logistics Bay 2</div>
                  <span className="inline-block mt-1 px-1.5 py-0.2 bg-[#edf6f0] text-[#2e6b4d] font-mono text-[9px]">
                    CLEARED
                  </span>
                </div>

                <div className="p-3 bg-[#faf3dc] border border-[#e5e5e5] space-y-1">
                  <div className="text-[10px] text-[#666666] uppercase font-semibold">3. Dispatched</div>
                  <strong className="text-[#413634] block">Air Freight Corridor</strong>
                  <div className="text-[10px] text-[#8b6c58]">DHL Express Supply Chain</div>
                  <span className="inline-block mt-1 px-1.5 py-0.2 bg-[#edf6f0] text-[#2e6b4d] font-mono text-[9px]">
                    ARRIVED BLR
                  </span>
                </div>

                <div className="p-3 bg-[#edf6f0] border border-[#2e6b4d] space-y-1">
                  <div className="text-[10px] text-[#2e6b4d] uppercase font-semibold">4. Retail Store</div>
                  <strong className="text-[#413634] block">Delivered to Retail</strong>
                  <div className="text-[10px] text-[#2e6b4d]">Indiranagar Hub, Bangalore</div>
                  <span className="inline-block mt-1 px-1.5 py-0.2 bg-[#2e6b4d] text-white font-mono text-[9px]">
                    DELIVERED (STEP 8)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Defect Backtrace & Recall (Steps 10, 11, 12, 13, 14) */}
          {activeTab === 'defect' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#b84a44] animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="text-[#b84a44]" size={20} />
                  <div>
                    <h3 className="text-base text-[#413634] font-medium">
                      Customer Defect Backtrace &amp; Batch Recall (Steps 10-14)
                    </h3>
                    <p className="text-xs text-[#666666]">
                      End-to-end backtracing from customer symptom to assembly machine root cause.
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 text-xs border bg-[#fdf2f1] text-[#b84a44] border-[#b84a44] font-mono">
                  {defectReport?.status || 'Defect Incident Logged'}
                </span>
              </div>

              {/* 2 Primary Informations Given by the Shopkeeper */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. What is the Reported Defect */}
                <div className="p-4 bg-[#fdf2f1] border border-[#b84a44] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#b84a44] font-semibold flex items-center gap-1.5">
                      <AlertTriangle size={14} />
                      <span>Step 10: Reported Defect (Symptoms)</span>
                    </span>
                    <span className="text-[10px] text-[#666666]">Retail Technician Log</span>
                  </div>
                  <p className="text-xs text-[#413634] leading-relaxed font-medium">
                    {defectReport?.problemDescription ||
                      'Customer Vikram Malhotra reported display flickering and green vertical line after 2 weeks of normal usage. Touch matrix sluggish.'}
                  </p>
                  <div className="text-[11px] text-[#8b6c58] pt-1 border-t border-[#f5c6cb]">
                    Category: <strong>{defectReport?.problemCategory || 'Screen & Display'}</strong> • Serial: <span className="font-mono">{product?.productId}</span>
                  </div>
                </div>

                {/* 2. What May Be the Cause (Suspected Cause) */}
                <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#b87428] font-semibold flex items-center gap-1.5">
                      <Wrench size={14} />
                      <span>Step 11 &amp; 12: Suspected Root Cause &amp; RMA</span>
                    </span>
                    <span className="text-[10px] text-[#666666]">Backtrace Analysis</span>
                  </div>
                  <p className="text-xs text-[#413634] leading-relaxed italic">
                    "{defectReport?.suspectedCause ||
                      'Stage 2 Machine DISP-04 thermal lamination thermocouple drift (+8.2°C) resulting in micro-delamination of Super AMOLED polarizer.'}"
                  </p>
                  <div className="text-[11px] text-[#8b6c58] pt-1 border-t border-[#e5e5e5]">
                    RMA Docket: <strong className="font-mono text-[#c5716d]">RMA-BLR-AAA12345678</strong> • Sent to Gumi Hub
                  </div>
                </div>
              </div>

              {/* Steps 13 & 14 Actions */}
              <div className="p-4 bg-[#fffdf6] border border-[#e5e5e5] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#413634]">
                    Step 13 &amp; 14: Batch Recall &amp; Manufacturer Re-Delivery Pipeline
                  </span>
                  <button
                    onClick={() => navigate('/company-defects')}
                    className="btn-vintage-accent text-xs flex items-center gap-1"
                  >
                    <span>Manage Batch AAA Recall Hub</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-[#faf3dc] border border-[#e5e5e5]">
                    <span className="text-[10px] text-[#666666] uppercase block">Sister Devices in Batch</span>
                    <strong className="text-sm text-[#c5716d] font-mono">Batch AAA (All Units Recalled)</strong>
                  </div>
                  <div className="p-2.5 bg-[#faf3dc] border border-[#e5e5e5]">
                    <span className="text-[10px] text-[#666666] uppercase block">Manufacturer Action</span>
                    <strong className="text-sm text-[#2e6b4d]">Laser Display Module Replaced</strong>
                  </div>
                  <div className="p-2.5 bg-[#faf3dc] border border-[#e5e5e5]">
                    <span className="text-[10px] text-[#666666] uppercase block">Step 14: Redelivery to Retail</span>
                    <strong className="text-sm text-[#413634]">Apex Retail Hub, Indiranagar</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Components & Anti-Tamper Lock (Step 16) */}
          {activeTab === 'components' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#c5716d] animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3">
                <div>
                  <h3 className="text-base text-[#413634] font-medium flex items-center gap-2">
                    <Cpu size={18} className="text-[#c5716d]" />
                    <span>Cryptographic BOM &amp; Anti-Tamper Attestation (Step 16)</span>
                  </h3>
                  <p className="text-xs text-[#666666]">
                    If customer visits a 3rd party repair center and replaces OEM parts with fake components, connecting to internet executes automated cryptographic lock.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/security')}
                  className="btn-vintage-outline text-xs flex items-center gap-1.5"
                >
                  <Lock size={13} className="text-[#b84a44]" />
                  <span>Test Hardware Lock Engine</span>
                </button>
              </div>

              {/* Component Serial Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(product?.installedComponents || {
                  'Display Module': 'AAA-0042',
                  'Motherboard SoC': 'EXYNOS-1480-8812',
                  'Secure Enclave': 'SEC-ENC-0091'
                }).map(([partName, partSerial]) => {
                  const isFake = partSerial.includes('FAKE');
                  const isRecallBatch = partSerial.startsWith('AAA-') || partSerial.includes('AAA');
                  return (
                    <div
                      key={partName}
                      className={`p-3.5 border text-xs space-y-1.5 ${
                        isFake
                          ? 'bg-[#fdf2f1] border-[#b84a44]'
                          : isRecallBatch
                          ? 'bg-[#faf3dc] border-[#b87428]'
                          : 'bg-[#faf3dc] border-[#e5e5e5]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#666666] text-[10px] uppercase font-bold">{partName}</span>
                        <span className={`text-[9px] px-1 font-mono ${
                          isFake ? 'bg-[#b84a44] text-white' : 'bg-[#edf6f0] text-[#2e6b4d]'
                        }`}>
                          {isFake ? 'COUNTERFEIT FAKE' : 'GENUINE OEM'}
                        </span>
                      </div>
                      <div className="font-mono font-bold text-[#413634] text-xs">
                        {partSerial}
                      </div>
                      <div className="text-[10px] text-[#8b6c58]">
                        Batch: <span className="font-mono">{partSerial.split('-')[0]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cryptographic Lock Banner */}
              <div className="p-4 bg-[#fdf2f1] border border-[#b84a44] text-xs space-y-1">
                <div className="font-semibold text-[#b84a44] flex items-center gap-1.5">
                  <Lock size={14} />
                  <span>Step 16: Automated Cryptographic Lockdown Engine</span>
                </div>
                <p className="text-[#413634] leading-relaxed">
                  Upon internet heartbeat or scanner probe, if the hardware component signature doesn't match the cryptographic blockchain passport, the secure enclave locks the device firmware instantly to prevent fake component operation.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: Batch Multi-Location Distribution */}
          {activeTab === 'batch' && batchLocations && (
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

              {/* Batch Summary */}
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

              {/* Distribution Table */}
              <div className="border border-[#e5e5e5] overflow-x-auto text-xs">
                <table className="w-full text-left divide-y divide-[#e5e5e5]">
                  <thead className="bg-[#faf3dc] text-[#666666] font-normal uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Specific Location</th>
                      <th className="p-2.5">Facility Type</th>
                      <th className="p-2.5">Carrier / Shipment ID</th>
                      <th className="p-2.5">Hold Mandate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5] bg-[#fffdf6] text-[11px]">
                    <tr className="hover:bg-[#faf3dc]">
                      <td className="p-2.5 font-medium text-[#413634]">Gumi Mega-Hub Cleanroom Quarantine</td>
                      <td className="p-2.5 text-[#2e6b4d]">Company Manufacturing Plant</td>
                      <td className="p-2.5 font-mono text-[#666666]">PLANT-HOLD-01</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.2 text-[10px] bg-[#edf6f0] text-[#2e6b4d] border border-[#2e6b4d]">
                          LOCKED AT FACTORY
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#faf3dc]">
                      <td className="p-2.5 font-medium text-[#413634]">Incheon Cargo Air Terminal Warehouse</td>
                      <td className="p-2.5 text-[#b87428]">Transit Gateway</td>
                      <td className="p-2.5 font-mono text-[#666666]">GT-SHP-00000326 (DHL)</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.2 text-[10px] bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44]">
                          STOP-DISPATCH HOLD
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#faf3dc]">
                      <td className="p-2.5 font-medium text-[#413634]">Apex Retail &amp; Service Hub - Indiranagar</td>
                      <td className="p-2.5 text-[#b84a44]">Authorized Retailer Shop</td>
                      <td className="p-2.5 font-mono text-[#666666]">Direct Retail Dispatch</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.2 text-[10px] bg-[#fdf2f1] text-[#b84a44] border border-[#b84a44]">
                          RECALL NOTIFIED
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
