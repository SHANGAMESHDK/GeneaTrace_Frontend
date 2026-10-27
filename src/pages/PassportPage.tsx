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
  Download,
  Terminal,
  RefreshCw,
  Zap,
  PackageCheck
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { ProductRecord, ShopkeeperDefectReport } from '../types';
import { api } from '../services/apiClient';

type WorkflowTab =
  | 'genesis'
  | 'assembly'
  | 'logistics'
  | 'retail_sale'
  | 'rma_backtrace'
  | 'recall_redelivery'
  | 'antitamper_lock';

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

  // Active Hierarchical Workflow Tab (Ordered strictly to user's 15-step narrative)
  const [activeTab, setActiveTab] = useState<WorkflowTab>('genesis');
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

  // 1. Download Null Container QR (PNG) - Demonstrates Step 2 & 3 before assembly!
  const downloadNullContainerQr = () => {
    const serial = product?.productId || activeSearchedSerial || 'AAA12345678';
    const batch = primaryBatchId || 'AAA';
    const qrSvg = document.getElementById('null-container-qr-svg') as SVGSVGElement | null;
    if (!qrSvg) return;

    const svgXml = new XMLSerializer().serializeToString(qrSvg);
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 700;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark Industrial Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Card border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

      // Header Banner
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(20, 20, canvas.width - 40, 56);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GENEATRACE • NULL CRYPTOGRAPHIC CONTAINER', canvas.width / 2, 45);
      ctx.font = '11px monospace';
      ctx.fillText('STEPS 1, 2 & 3: BATCH ASSIGNED • CONTAINER INITIALIZED', canvas.width / 2, 65);

      // Subtitle
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText('Samsung Galaxy A55 5G (Enterprise)', canvas.width / 2, 110);

      // Badge
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, 130, canvas.width - 80, 50);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 130, canvas.width - 80, 50);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`SERIAL NO: ${serial}`, canvas.width / 2, 152);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText(`Assigned Batch: ${batch}  •  Status: NULL PAYLOAD (UNSEALED)`, canvas.width / 2, 170);

      // Draw QR Code
      const qrSize = 250;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 210;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Instruction
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('SCAN AT STATION 1 TO BEGIN ASSEMBLY INGESTION', canvas.width / 2, 510);

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText('Scan with Android APK or /scanner route', canvas.width / 2, 535);
      ctx.fillText('Station timestamp, machine ID, and operator will be pushed to this container.', canvas.width / 2, 552);

      // Download
      const link = document.createElement('a');
      link.download = `GeneaTrace_Null_Container_${serial}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgXml)));
  };

  // 2. Download Sealed DPP Label (PNG) - Demonstrates Step 6 & Finished Passport!
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

      // Vintage Parchment Industrial Background
      ctx.fillStyle = '#fffdf6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#413634';
      ctx.lineWidth = 6;
      ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

      ctx.strokeStyle = '#c5716d';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

      ctx.fillStyle = '#413634';
      ctx.fillRect(24, 24, canvas.width - 48, 64);

      ctx.fillStyle = '#fffdf6';
      ctx.font = 'bold 17px serif';
      ctx.textAlign = 'center';
      ctx.fillText('GENEATRACE DIGITAL PRODUCT PASSPORT', canvas.width / 2, 52);
      ctx.font = '11px monospace';
      ctx.fillText('EU DPP DIRECTIVE (ESPR) • IMMUTABLE MERKLE ANCHOR', canvas.width / 2, 72);

      ctx.fillStyle = '#413634';
      ctx.font = 'bold 19px serif';
      ctx.fillText(model, canvas.width / 2, 126);

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

      const qrSize = 250;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 210;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      ctx.strokeStyle = '#413634';
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = '#413634';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`MERKLE DAG: ${merkle.slice(0, 32)}...`, canvas.width / 2, 502);

      ctx.font = '11px serif';
      ctx.fillStyle = '#2e6b4d';
      ctx.fillText('✔ CRYPTOGRAPHIC BLOCKCHAIN CONTAINER SEALED (STEP 6)', canvas.width / 2, 526);

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

      ctx.fillStyle = '#8b6c58';
      ctx.font = '10px serif';
      ctx.fillText('Scan with GeneaTrace Edge Station or any standard QR scanner to verify DPP.', canvas.width / 2, 642);
      ctx.fillText('https://geneatrace.vercel.app/passport/' + serial, canvas.width / 2, 658);

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
            15-Step End-to-End Traceability Workflow: From Genesis Null Container to Assembly, Logistics, Retail, Defect Backtrace, Batch Recall, and Anti-Tamper Lock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/scanner')}
            className="btn-vintage-outline text-xs flex items-center gap-1.5"
            title="Scan QR Code or Push Assembly Stage"
          >
            <Smartphone size={13} className="text-[#2e6b4d]" />
            <span>Station Scanner (/scanner)</span>
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
            No verified digital passport found for serial <strong className="font-mono text-[#b84a44]">"{searchInput}"</strong>.
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
                    Cryptographically Sealed (Step 6)
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

            {/* STRICT HIERARCHICAL 7-STEP WORKFLOW TABS */}
            <div className="space-y-1.5 pt-2 border-t border-[#e5e5e5]">
              <div className="flex items-center justify-between text-[11px] text-[#8b6c58] font-mono">
                <span>EXPLAIN THE JURY ACCORDING TO THIS HIERARCHY:</span>
                <span>STEPS 1 ➔ 16</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* 1. Genesis & Null Container */}
                <button
                  onClick={() => setActiveTab('genesis')}
                  className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    activeTab === 'genesis'
                      ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs'
                      : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#0284c7]'
                  }`}
                >
                  <Layers size={13} />
                  <span>1. Genesis &amp; Null Container (Steps 1–3)</span>
                </button>

                {/* 2. Assembly Station Ingestion */}
                <button
                  onClick={() => setActiveTab('assembly')}
                  className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    activeTab === 'assembly'
                      ? 'bg-[#2e6b4d] text-white border-[#2e6b4d] shadow-xs'
                      : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#2e6b4d]'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>2. Assembly Stations Ingestion (Steps 4–6)</span>
                </button>

                {/* 3. Logistics & Factory Custody */}
                <button
                  onClick={() => setActiveTab('logistics')}
                  className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    activeTab === 'logistics'
                      ? 'bg-[#b87428] text-white border-[#b87428] shadow-xs'
                      : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#b87428]'
                  }`}
                >
                  <Truck size={13} />
                  <span>3. Logistics &amp; Custody (Step 7)</span>
                </button>

                {/* 4. Retail Handover & Customer Sale */}
                <button
                  onClick={() => setActiveTab('retail_sale')}
                  className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    activeTab === 'retail_sale'
                      ? 'bg-[#413634] text-white border-[#413634] shadow-xs'
                      : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#413634]'
                  }`}
                >
                  <UserCheck size={13} />
                  <span>4. Retail Handover &amp; Customer Sale (Steps 8–9)</span>
                </button>

                {/* 5. Defect Backtrace */}
                <button
                  onClick={() => setActiveTab('rma_backtrace')}
                  className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    activeTab === 'rma_backtrace'
                      ? 'bg-[#b84a44] text-white border-[#b84a44] shadow-xs'
                      : 'bg-[#fdf2f1] text-[#b84a44] border-[#b84a44] hover:bg-[#b84a44] hover:text-white'
                  }`}
                >
                  <AlertOctagon size={13} />
                  <span>5. Customer Return &amp; Defect Backtrace (Steps 10–12)</span>
                </button>

                {/* 6. Batch Recall & Customer Re-Delivery */}
                <button
                  onClick={() => setActiveTab('recall_redelivery')}
                  className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    activeTab === 'recall_redelivery'
                      ? 'bg-[#b84a44] text-white border-[#b84a44] shadow-xs'
                      : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#b84a44]'
                  }`}
                >
                  <RotateCcw size={13} />
                  <span>6. Batch AAA Recall &amp; Re-Delivery (Steps 13–15)</span>
                </button>

                {/* 7. Third-Party Fake Part Lock */}
                <button
                  onClick={() => setActiveTab('antitamper_lock')}
                  className={`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    activeTab === 'antitamper_lock'
                      ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-xs'
                      : 'bg-[#fffdf6] text-[#7c3aed] border-[#e5e5e5] hover:border-[#7c3aed]'
                  }`}
                >
                  <Lock size={13} />
                  <span>7. Third-Party Fake Part Auto-Lock (Security)</span>
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: Genesis & Null Container (Steps 1–3) */}
          {activeTab === 'genesis' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-6 border-l-4 border-l-[#0284c7] animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#e0f2fe] text-[#0284c7] text-[10px] font-mono font-bold uppercase">
                      Steps 1, 2 &amp; 3
                    </span>
                    <h3 className="text-lg text-[#413634] font-medium">
                      Manufacturer Login Genesis &amp; Null Container Initialization
                    </h3>
                  </div>
                  <p className="text-xs text-[#666666] mt-1">
                    Done in Manufacturer Login: Batch AAA assigned, cryptographic serial created with a null container.
                  </p>
                </div>

                <button
                  onClick={downloadNullContainerQr}
                  className="btn-vintage-accent text-xs flex items-center gap-1.5 shadow-sm"
                  title="Download Null Container QR code as PNG for scanning demonstration"
                >
                  <Download size={13} />
                  <span>Download Null Container QR (PNG)</span>
                </button>
              </div>

              {/* The 3 Steps Explanatory Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Step 1 */}
                <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <strong className="text-sm text-[#413634]">Step 1: Batch Assigned</strong>
                  </div>
                  <div className="text-base text-[#0284c7] font-mono font-bold">
                    Batch: AAA
                  </div>
                  <p className="text-[#666666] leading-relaxed">
                    Manufacturer registers the production batch (Samsung Display Corp, Cleanroom Complex Alpha Line 3).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <strong className="text-sm text-[#413634]">Step 2: Cryptographic Serial</strong>
                  </div>
                  <div className="text-base text-[#c5716d] font-mono font-bold">
                    AAA12345678
                  </div>
                  <p className="text-[#666666] leading-relaxed">
                    A unique Blockchain Cryptographic serial number is generated to act as the unit's digital identity container.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-[#e0f2fe] border border-[#0284c7] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <strong className="text-sm text-[#0284c7]">Step 3: Container is NULL</strong>
                  </div>
                  <div className="text-xs px-2 py-0.5 bg-white text-[#0284c7] border border-[#0284c7] font-mono font-bold inline-block">
                    PAYLOAD: NULL (UNSEALED)
                  </div>
                  <p className="text-[#413634] leading-relaxed">
                    At this stage before assembly, the container holds no process events. It is primed to receive station scans.
                  </p>
                </div>
              </div>

              {/* High-Resolution Null Container QR Code Plate for Demonstration */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-[10px] font-bold uppercase border border-sky-500/30">
                      Demonstration Token
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Step 3 Pictorial Asset</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    Null Container QR Token ({product?.productId || 'AAA12345678'})
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This QR represents the empty cryptographic container created at manufacturer login. Hold this up to the <strong>Android APK</strong> or <strong>/scanner</strong> station camera to begin pushing manufacturing stages!
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={downloadNullContainerQr}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all"
                    >
                      <Download size={14} />
                      <span>Download Null QR (PNG)</span>
                    </button>
                    <button
                      onClick={() => navigate('/scanner')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                    >
                      <Smartphone size={13} className="text-emerald-400" />
                      <span>Open Station Scanner ➔</span>
                    </button>
                  </div>
                </div>

                {/* Rendered Null QR Image Box */}
                <div className="bg-white p-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 text-slate-950">
                  <QRCodeSVG
                    id="null-container-qr-svg"
                    value={`https://geneatrace.vercel.app/scanner?target=${product?.productId || 'AAA12345678'}`}
                    size={160}
                    level="H"
                  />
                  <div className="font-mono text-[11px] font-bold tracking-wider">
                    {product?.productId || 'AAA12345678'} (NULL)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Assembly Station Ingestion (Steps 4–6) */}
          {activeTab === 'assembly' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#2e6b4d] animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#edf6f0] text-[#2e6b4d] text-[10px] font-mono font-bold uppercase">
                      Steps 4, 5 &amp; 6
                    </span>
                    <h3 className="text-lg text-[#413634] font-medium">
                      Assembly Stations Ingestion &amp; Sealing (/scanner)
                    </h3>
                  </div>
                  <p className="text-xs text-[#666666] mt-1">
                    On every stage after scanning, timestamp, machine ID, operator, and process are pushed to the container. Finally sealed under serial AAA12345678.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/scanner')}
                  className="btn-vintage-accent text-xs flex items-center gap-1.5"
                >
                  <Smartphone size={13} />
                  <span>Scan Next Station at /scanner</span>
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
                              ROOT CAUSE STAGE (MACHINE DISP-04)
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

              {/* Step 6 Callout */}
              <div className="p-3.5 bg-[#edf6f0] border border-[#2e6b4d] text-xs flex items-center justify-between">
                <div>
                  <strong className="text-[#2e6b4d] block font-mono">
                    Step 6 Sealed Container: AAA12345678
                  </strong>
                  <span className="text-[#666666]">
                    Merkle DAG Root Hash: <strong>{product?.merkleRoot || '0x9f3b8a1c4e72d05f88b14a2c91e3f706'}</strong>
                  </span>
                </div>
                <button
                  onClick={downloadPictorialLabel}
                  className="btn-vintage-accent text-xs flex items-center gap-1"
                >
                  <Download size={12} />
                  <span>Download Sealed Label (PNG)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Logistics & Factory Custody (Step 7) */}
          {activeTab === 'logistics' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#b87428] animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#fef7ec] text-[#b87428] text-[10px] font-mono font-bold uppercase">
                      Step 7
                    </span>
                    <h3 className="text-lg text-[#413634] font-medium">
                      Manufacturer Logistics Chain of Custody
                    </h3>
                  </div>
                  <p className="text-xs text-[#666666] mt-1">
                    Done in Manufacturer Login: Packing ➔ Warehouse Clearance ➔ Dispatched Air Corridor ➔ Delivered to Retail.
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
                  <div className="text-[10px] text-[#8b6c58]">Incheon ➔ Bangalore Airport</div>
                  <span className="inline-block mt-1 px-1.5 py-0.2 bg-[#edf6f0] text-[#2e6b4d] font-mono text-[9px]">
                    DISPATCHED
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

          {/* TAB 4: Retail Handover & Customer Sale (Steps 8 & 9) */}
          {activeTab === 'retail_sale' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#413634] animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#faf3dc] text-[#413634] text-[10px] font-mono font-bold uppercase">
                      Steps 8 &amp; 9
                    </span>
                    <h3 className="text-lg text-[#413634] font-medium">
                      Retail Delivery &amp; Customer Selling Details
                    </h3>
                  </div>
                  <p className="text-xs text-[#666666] mt-1">
                    Once delivered to retail, retail login takes over. Selling details uploaded in retail login page.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs border bg-[#edf6f0] text-[#2e6b4d] border-[#2e6b4d] font-mono">
                  {product?.customerSale?.status || 'Active Customer Ownership'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                  <span className="text-[10px] text-[#666666] uppercase block font-semibold">Step 9: Customer Information</span>
                  <div className="text-base text-[#413634] font-medium">
                    {product?.customerSale?.customerName || 'Vikram Malhotra'}
                  </div>
                  <div className="text-xs text-[#666666] font-mono">
                    Phone: {product?.customerSale?.phone || '+91 98765 43210'}
                  </div>
                  <div className="text-xs text-[#666666]">
                    Delivery: 100ft Road, Indiranagar, Bangalore, Karnataka
                  </div>
                </div>

                <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                  <span className="text-[10px] text-[#666666] uppercase block font-semibold">Retail Sale Record (Retailer Login)</span>
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

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[#666666]">
                  Retailers can update customer invoice and sales data via the Retail Portal:
                </span>
                <button
                  onClick={() => navigate('/shop-portal')}
                  className="btn-vintage-outline text-xs flex items-center gap-1"
                >
                  <span>Open Retail Portal (/shop-portal)</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Customer Return & Defect Backtrace (Steps 10–12) */}
          {activeTab === 'rma_backtrace' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#b84a44] animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-3">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="text-[#b84a44]" size={20} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#fdf2f1] text-[#b84a44] text-[10px] font-mono font-bold uppercase">
                        Steps 10, 11 &amp; 12
                      </span>
                      <h3 className="text-lg text-[#413634] font-medium">
                        Customer Return, Retailer RMA &amp; Root Cause Backtrace
                      </h3>
                    </div>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Customer returns device with issue; retailer files report and sends to manufacturer; manufacturer backtraces to Stage 2 Machine DISP-04.
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
                      <span>Step 10: Reported Issue (Symptoms)</span>
                    </span>
                    <span className="text-[10px] text-[#666666]">Customer Return</span>
                  </div>
                  <p className="text-xs text-[#413634] leading-relaxed font-medium">
                    {defectReport?.problemDescription ||
                      'Customer Vikram Malhotra returned device after 2 weeks: Screen flickering and persistent green vertical line post-unboxing.'}
                  </p>
                  <div className="text-[11px] text-[#8b6c58] pt-1 border-t border-[#f5c6cb]">
                    Category: <strong>{defectReport?.problemCategory || 'Screen & Display'}</strong> • Serial: <span className="font-mono">{product?.productId}</span>
                  </div>
                </div>

                {/* 2. What May Be the Cause (Suspected Cause & RMA) */}
                <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#b87428] font-semibold flex items-center gap-1.5">
                      <Wrench size={14} />
                      <span>Step 11 &amp; 12: Root Cause Backtrace</span>
                    </span>
                    <span className="text-[10px] text-[#666666]">Manufacturer Graph Traversal</span>
                  </div>
                  <p className="text-xs text-[#413634] leading-relaxed italic">
                    "{defectReport?.suspectedCause ||
                      'Stage 2 Machine DISP-04 thermal lamination thermocouple drift (+8.2°C) resulting in micro-delamination of Super AMOLED polarizer.'}"
                  </p>
                  <div className="text-[11px] text-[#8b6c58] pt-1 border-t border-[#e5e5e5]">
                    RMA Docket: <strong className="font-mono text-[#c5716d]">RMA-BLR-AAA12345678</strong> • Sent to Gumi Mega-Hub
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Batch Recall & Customer Re-Delivery (Steps 13–15) */}
          {activeTab === 'recall_redelivery' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#b84a44] animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="text-[#b84a44]" size={20} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#fdf2f1] text-[#b84a44] text-[10px] font-mono font-bold uppercase">
                        Steps 13, 14 &amp; 15
                      </span>
                      <h3 className="text-lg text-[#413634] font-medium">
                        Batch AAA Recall, Repair &amp; Customer Re-Delivery
                      </h3>
                    </div>
                    <p className="text-xs text-[#666666] mt-0.5">
                      Manufacturer recalls all phones from Batch AAA; repairs unit and returns it to retailer; retailer delivers back to customer.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/company-defects')}
                  className="btn-vintage-accent text-xs flex items-center gap-1.5"
                >
                  <span>Corporate Recall Command Center</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* 3 Action Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-[#fdf2f1] border border-[#b84a44] space-y-2">
                  <div className="text-[10px] text-[#b84a44] uppercase font-bold">Step 13: Full Batch Recall</div>
                  <div className="text-base font-mono font-bold text-[#b84a44]">
                    Batch AAA Recalled
                  </div>
                  <p className="text-[#413634] leading-relaxed">
                    Manufacturer verified DISP-04 defect signature across all sister units in Batch AAA. Emergency stop-sale transmitted.
                  </p>
                </div>

                <div className="p-4 bg-[#faf3dc] border border-[#e5e5e5] space-y-2">
                  <div className="text-[10px] text-[#2e6b4d] uppercase font-bold">Step 14: Factory Repair</div>
                  <div className="text-base font-mono font-bold text-[#2e6b4d]">
                    Repaired &amp; Reshipped
                  </div>
                  <p className="text-[#413634] leading-relaxed">
                    Display module replaced with certified unit AAA-0042. Shipped back to Apex Retail Hub, Indiranagar.
                  </p>
                </div>

                <div className="p-4 bg-[#edf6f0] border border-[#2e6b4d] space-y-2">
                  <div className="text-[10px] text-[#2e6b4d] uppercase font-bold">Step 15: Customer Handover</div>
                  <div className="text-base font-mono font-bold text-[#2e6b4d]">
                    Re-Delivered to Vikram
                  </div>
                  <p className="text-[#413634] leading-relaxed">
                    Retailer contacts customer Vikram Malhotra (+91 98765 43210) and hands over the verified device.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Third-Party Fake Part Lock (Security Step 16) */}
          {activeTab === 'antitamper_lock' && (
            <div className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#7c3aed] animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="text-[#7c3aed]" size={20} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#f5f3ff] text-[#7c3aed] text-[10px] font-mono font-bold uppercase">
                        Security Rule
                      </span>
                      <h3 className="text-lg text-[#413634] font-medium">
                        Third-Party Repair Counterfeit Lockout
                      </h3>
                    </div>
                    <p className="text-xs text-[#666666] mt-0.5">
                      If customer goes to a 3rd party center and replaces OEM parts with fake components, connecting to internet triggers cryptographic lock immediately.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/security')}
                  className="btn-vintage-outline text-xs flex items-center gap-1.5"
                >
                  <Lock size={13} className="text-[#7c3aed]" />
                  <span>Open Hardware Lock Console</span>
                </button>
              </div>

              {/* Compare Genuine vs Fake */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#edf6f0] border border-[#2e6b4d] space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-[#2e6b4d]">Genuine OEM Screen</strong>
                    <span className="px-1.5 py-0.2 bg-[#2e6b4d] text-white font-mono text-[9px]">
                      VERIFIED PASS
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#413634]">
                    Component Serial: AAA-0042
                  </div>
                  <p className="text-[#666666]">
                    Matches Merkle DAG root. Hardware attestation passes on every internet heartbeat.
                  </p>
                </div>

                <div className="p-4 bg-[#fdf2f1] border border-[#b84a44] space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-[#b84a44]">3rd-Party Fake Screen</strong>
                    <span className="px-1.5 py-0.2 bg-[#b84a44] text-white font-mono text-[9px]">
                      AUTO-LOCK TRIGGERED
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#b84a44]">
                    Component Serial: FAKE-DISP-9999
                  </div>
                  <p className="text-[#b84a44]">
                    Zero hash match! As soon as phone connects to Wi-Fi / 5G, device firmware executes remote cryptographic lock.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
