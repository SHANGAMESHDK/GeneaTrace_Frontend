import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { PhoneViewer3D } from '../components/3d/PhoneViewer3D';
import {
  Search,
  QrCode,
  AlertTriangle,
  Truck,
  Building2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Server,
  ChevronRight,
  AlertOctagon,
  Sparkles,
  ExternalLink,
  Layers,
  Cpu,
  MapPin,
  Clock,
  Radio,
  CheckCircle2,
  Box,
  Target,
  Download,
  Store,
  FileSpreadsheet,
  Compass
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { api, DashboardSummary } from '../services/apiClient';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut'
    }
  }
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const store = GeneaTraceStore.getState();

  // Live Backend Stats
  const [backendSummary, setBackendSummary] = useState<DashboardSummary | null>(null);
  const [loadingBackend, setLoadingBackend] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getDashboardSummary()
      .then(data => {
        if (isMounted) {
          setBackendSummary(data);
          setLoadingBackend(false);
        }
      })
      .catch(err => {
        console.warn('Backend summary fallback:', err);
        if (isMounted) setLoadingBackend(false);
      });
    return () => { isMounted = false; };
  }, []);

  const showcaseProduct = store.products[0] || {
    productId: 'GT-DEV-00000851',
    productModel: 'Galaxy S25 Ultra Titanium DPP Edition',
    imeiMasked: '356789123456780',
    installedComponents: { 'Display Module': 'ABC-0042' }
  };

  const [quickTrackQuery, setQuickTrackQuery] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickTrackQuery.trim() || showcaseProduct?.productId || 'GT-DEV-00000851';
    navigate(`/traceability?query=${encodeURIComponent(q)}`);
  };

  const downloadLineageCSV = () => {
    const products = store.products || [];
    const headers = [
      'Product ID',
      'Model',
      'Masked IMEI',
      'Status',
      'Installed Display Module',
      'Source Batch',
      'Active Shipment',
      'Store Incident',
      'Blockchain EVM Block',
      'Verification Status'
    ];

    const rows = products.map((p) => [
      p.productId,
      `"${p.productModel || 'Galaxy S25 Ultra Titanium Edition'}"`,
      p.imeiMasked || '356789123456780',
      p.status || 'Recall Flagged',
      (p.installedComponents && p.installedComponents['Display Module']) || 'Serial ABC-0042',
      'Batch ABC (Adhesive Micro-Delamination)',
      'GT-SHP-00000326 (Munich Gateway)',
      'REP-2026-001 (iFix Hub Bangalore)',
      'Block #1849340',
      'SHA-256 Merkle-DAG Verified'
    ]);

    const storeRows = [
      '',
      '--- DISPATCHED STORES GEOLOCATION MATRIX ---',
      'Device Serial,Model,Store Location,City,Shelf Status',
      ...storeLocations.map((s) => [s.serial, `"${s.model}"`, `"${s.location}"`, `"${s.city}"`, `"${s.status}"`].join(','))
    ];

    const csvData = [headers.join(','), ...rows.map((r) => r.join(',')), ...storeRows].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GeneaTrace_Manufacturing_Lineage_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  // Dispatched Mobiles Store Geolocation Matrix (matching original content)
  const storeLocations = [
    {
      serial: 'SM-S928-IND-00841',
      model: 'Galaxy S25 Ultra (512GB)',
      location: 'BKC Mumbai Store #101',
      city: 'Mumbai, MH',
      status: 'Quarantined (On Shelf)',
      statusColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    },
    {
      serial: 'SM-S928-IND-00862',
      model: 'Galaxy S25 Ultra (512GB)',
      location: 'Bengaluru Hub #204',
      city: 'Bangalore, KA',
      status: 'Quarantined (On Shelf)',
      statusColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    },
    {
      serial: 'SM-S928-IND-00924',
      model: 'Galaxy S25 Ultra (512GB)',
      location: 'Delhi Opera Store #305',
      city: 'New Delhi, DL',
      status: 'Quarantined (On Shelf)',
      statusColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    },
    {
      serial: 'SM-S928-IND-00980',
      model: 'Galaxy S25 Ultra (512GB)',
      location: 'Hyderabad Store #412',
      city: 'Hyderabad, TS',
      status: 'Quarantined (On Shelf)',
      statusColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    },
    {
      serial: 'SM-S928-IND-01045',
      model: 'Galaxy S25 Ultra (512GB)',
      location: 'Munich Gateway Hub',
      city: 'Munich, DE',
      status: 'Halted In-Transit',
      statusColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30'
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 font-sans max-w-[1540px] mx-auto text-white select-none"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. CLEAN EXECUTIVE HEADER (Original Content & Logic)
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d9825b]/20"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              GeneaTrace Command Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Network</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#cbb5aa] mt-1 font-normal">
            Unit-level cryptographic provenance, Merkle-DAG assembly lineage, and precision recall isolation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-sans">
          {/* Download CSV Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadLineageCSV}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-[#f7d5c5] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#e89d7b]/50"
            title="Download complete manufacturing lineage report as CSV file"
          >
            <Download size={14} className="text-[#e89d7b]" />
            <span>{downloadSuccess ? 'Downloaded CSV!' : 'Download CSV'}</span>
          </motion.button>

          {/* Track Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/traceability')}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#e89d7b]/50"
            title="Trace product and component Merkle tree"
          >
            <Compass size={14} className="text-[#e89d7b]" />
            <span>Track Option</span>
          </motion.button>

          {/* Shopkeeper Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/shopkeeper-portal')}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#e89d7b]/50"
            title="Open Shopkeeper retail handover & intake portal"
          >
            <Store size={14} className="text-[#34d399]" />
            <span>Shopkeeper Portal</span>
          </motion.button>

          {/* Showcase Passport */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/passport')}
            className="btn-sunset text-xs py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer font-bold"
          >
            <QrCode size={14} />
            <span>DPP Passport</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          2. PLATFORM & BLOCKCHAIN HEALTH STRIP (Original Logic)
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="p-3.5 bg-[#140c08]/85 border border-[#d9825b]/20 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-xl"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#e89d7b]/15 text-[#e89d7b] border border-[#e89d7b]/25 flex items-center justify-center shrink-0">
            <Server size={15} />
          </div>
          <span className="font-semibold text-white">Platform Status:</span>
          {loadingBackend ? (
            <span className="text-[#a69489] font-mono text-[11px]">Connecting to backend services...</span>
          ) : backendSummary ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-medium text-[11px]">
                Live Cloud Connected (FastAPI + Supabase + EVM Anchor)
              </span>
            </div>
          ) : (
            <span className="text-emerald-300 font-medium text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Operational (Cryptographic Verification Engine)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[#f7d5c5] font-medium border border-[#d9825b]/20">
            EVM Checkpoint: Block #1849340
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span>SHA-256 Merkle-DAG Active</span>
          </span>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          3. HERO SHOWCASE CARD (S25 Ultra 3D Pedestal & Provenance Pipeline)
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -2 }}
        className="p-6 bg-[#140c08]/92 border border-[#d9825b]/30 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-2xl glow-copper"
      >
        {/* Warm Ambient Atmosphere */}
        <div className="absolute top-0 right-0 w-[550px] h-[350px] bg-gradient-to-bl from-[#c67651]/20 via-[#e89d7b]/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Top Header of Showcase */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] flex items-center justify-center text-[#120a07] shadow-lg shadow-[#c67651]/30 font-bold shrink-0">
              <QrCode size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
                  {showcaseProduct?.productModel || 'Galaxy S25 Ultra Titanium DPP Edition'}
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>Recall Flagged</span>
                </span>
              </div>
              <p className="text-xs text-[#cbb5aa] font-mono mt-0.5">
                Product ID: <strong className="text-white">{showcaseProduct?.productId}</strong> • Masked IMEI: {showcaseProduct?.imeiMasked}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-sans">
            {/* Quick Track Input form */}
            <form onSubmit={handleQuickTrack} className="flex items-center gap-1.5 bg-[#120a07] border border-[#d9825b]/30 rounded-xl px-2.5 py-1 focus-within:border-[#e89d7b]">
              <Search size={13} className="text-[#a69489]" />
              <input
                type="text"
                placeholder="Track serial / IMEI..."
                value={quickTrackQuery}
                onChange={(e) => setQuickTrackQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-white placeholder-[#7d6b62] focus:outline-hidden w-28 sm:w-36 font-mono"
              />
              <button
                type="submit"
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#e89d7b]/20 hover:bg-[#e89d7b]/30 text-[#f0a887] cursor-pointer transition-colors"
              >
                Track
              </button>
            </form>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/shopkeeper-portal')}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open Shopkeeper Portal"
            >
              <Store size={13} className="text-[#34d399]" />
              <span>Shopkeeper</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={downloadLineageCSV}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-[#f7d5c5] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download Lineage CSV"
            >
              <Download size={13} className="text-[#e89d7b]" />
              <span>CSV</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/passport/${showcaseProduct?.productId}`)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Verify DPP</span>
              <ShieldCheck size={13} className="text-emerald-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/traceability?query=${showcaseProduct?.productId}`)}
              className="btn-sunset text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <span>Trace Lineage</span>
              <ArrowRight size={13} />
            </motion.button>
          </div>
        </div>

        {/* Center Grid: Left 4 Provenance Pipeline Cards + Right Standing S25 Ultra on 3D Pedestal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Column (8 cols): 4 Provenance Pipeline Cards (Exact Original Content) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div
              onClick={() => navigate('/traceability?query=ABC')}
              className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl space-y-1.5 cursor-pointer transition-all group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#e89d7b] uppercase font-mono font-bold tracking-wider block">
                  Source Batch
                </span>
                <ChevronRight size={14} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-mono text-sm text-white font-semibold block">
                Batch ABC (Display)
              </span>
              <span className="text-xs text-rose-400 font-medium block">
                Adhesive Micro-Delamination
              </span>
            </div>

            <div
              onClick={() => navigate('/components')}
              className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl space-y-1.5 cursor-pointer transition-all group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#e89d7b] uppercase font-mono font-bold tracking-wider block">
                  Installed Display
                </span>
                <ChevronRight size={14} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-mono text-sm text-white font-semibold block">
                Serial ABC-0042
              </span>
              <span className="text-xs text-emerald-400 font-medium block">
                8 Manufacturing Steps Hashed
              </span>
            </div>

            <div
              onClick={() => navigate('/logistics')}
              className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl space-y-1.5 cursor-pointer transition-all group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#e89d7b] uppercase font-mono font-bold tracking-wider block">
                  Active Shipment
                </span>
                <ChevronRight size={14} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-mono text-sm text-white font-semibold block">
                GT-SHP-00000326
              </span>
              <span className="text-xs text-amber-400 font-medium block">
                Munich Gateway (Carrier Hold)
              </span>
            </div>

            <div
              onClick={() => navigate('/company-defects')}
              className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl space-y-1.5 cursor-pointer transition-all group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#e89d7b] uppercase font-mono font-bold tracking-wider block">
                  Store Incident
                </span>
                <ChevronRight size={14} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-mono text-sm text-white font-semibold block">
                REP-2026-001
              </span>
              <span className="text-xs text-[#cbb5aa] font-medium block">
                iFix Hub (Bangalore, KA)
              </span>
            </div>
          </div>

          {/* Right Column (4 cols): Real-time 3D WebGL Galaxy Ultra + S-Pen Showcase */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative">
            <PhoneViewer3D
              className="w-full"
              onClick={() => navigate(`/passport/${showcaseProduct?.productId}`)}
            />
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          4. FOUR CORE VALUE METRIC CARDS (Exact Original Content & Subheadings)
          Formatted in the Structured Rising Bar Chart Design
      ───────────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Traversal Latency */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-[#140c08]/85 backdrop-blur-xl border border-[#d9825b]/25 shadow-xl flex items-center justify-between gap-4 relative overflow-hidden"
        >
          <div className="flex flex-col z-10 space-y-1">
            <span className="text-xs uppercase font-mono font-bold text-[#e89d7b] flex items-center gap-1.5">
              <Zap size={14} className="text-emerald-400" />
              <span>Traversal Latency</span>
            </span>
            <div className="text-2xl sm:text-3xl text-white font-bold font-mono tracking-tight">
              &lt; 12 ms
            </div>
            <p className="text-xs text-[#cbb5aa]">
              Instant recursive sub-graph DAG traversal.
            </p>
          </div>

          {/* Graduated Rising Vertical Bar Chart Graphic */}
          <div className="w-16 h-10 shrink-0 z-10 flex items-end justify-end">
            <svg viewBox="0 0 60 40" className="w-full h-full overflow-visible">
              <rect x="0" y="28" width="5" height="12" rx="1.5" fill="#e89d7b" fillOpacity="0.5" />
              <rect x="10" y="23" width="5" height="17" rx="1.5" fill="#e89d7b" fillOpacity="0.6" />
              <rect x="20" y="18" width="5" height="22" rx="1.5" fill="#e89d7b" fillOpacity="0.7" />
              <rect x="30" y="13" width="5" height="27" rx="1.5" fill="#e89d7b" fillOpacity="0.8" />
              <rect x="40" y="7" width="5" height="33" rx="1.5" fill="#e89d7b" fillOpacity="0.9" />
              <rect x="50" y="0" width="5" height="40" rx="1.5" fill="#34d399" />
            </svg>
          </div>
        </motion.div>

        {/* Precision Recall */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-[#140c08]/85 backdrop-blur-xl border border-[#d9825b]/25 shadow-xl flex items-center justify-between gap-4 relative overflow-hidden"
        >
          <div className="flex flex-col z-10 space-y-1">
            <span className="text-xs uppercase font-mono font-bold text-[#e89d7b] flex items-center gap-1.5">
              <AlertOctagon size={14} className="text-rose-400" />
              <span>Precision Recall</span>
            </span>
            <div className="text-2xl sm:text-3xl text-white font-bold font-mono tracking-tight">
              1 Device
            </div>
            <p className="text-xs text-[#cbb5aa]">
              Zero false positives; zero mass-recalls.
            </p>
          </div>

          <div className="w-16 h-10 shrink-0 z-10 flex items-end justify-end">
            <svg viewBox="0 0 60 40" className="w-full h-full overflow-visible">
              <rect x="0" y="30" width="5" height="10" rx="1.5" fill="#d9825b" fillOpacity="0.5" />
              <rect x="10" y="24" width="5" height="16" rx="1.5" fill="#d9825b" fillOpacity="0.6" />
              <rect x="20" y="19" width="5" height="21" rx="1.5" fill="#d9825b" fillOpacity="0.7" />
              <rect x="30" y="14" width="5" height="26" rx="1.5" fill="#d9825b" fillOpacity="0.8" />
              <rect x="40" y="8" width="5" height="32" rx="1.5" fill="#e89d7b" fillOpacity="0.9" />
              <rect x="50" y="0" width="5" height="40" rx="1.5" fill="#f87171" />
            </svg>
          </div>
        </motion.div>

        {/* Digital Passport */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-[#140c08]/85 backdrop-blur-xl border border-[#d9825b]/25 shadow-xl flex items-center justify-between gap-4 relative overflow-hidden"
        >
          <div className="flex flex-col z-10 space-y-1">
            <span className="text-xs uppercase font-mono font-bold text-[#e89d7b] flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#38bdf8]" />
              <span>Digital Passport</span>
            </span>
            <div className="text-2xl sm:text-3xl text-white font-bold font-mono tracking-tight">
              Verified
            </div>
            <p className="text-xs text-[#cbb5aa]">
              EU ESPR &amp; DPP directive compliant.
            </p>
          </div>

          <div className="w-16 h-10 shrink-0 z-10 flex items-end justify-end">
            <svg viewBox="0 0 60 40" className="w-full h-full overflow-visible">
              <rect x="0" y="26" width="5" height="14" rx="1.5" fill="#d9825b" fillOpacity="0.5" />
              <rect x="10" y="21" width="5" height="19" rx="1.5" fill="#d9825b" fillOpacity="0.6" />
              <rect x="20" y="16" width="5" height="24" rx="1.5" fill="#d9825b" fillOpacity="0.7" />
              <rect x="30" y="11" width="5" height="29" rx="1.5" fill="#e89d7b" fillOpacity="0.8" />
              <rect x="40" y="6" width="5" height="34" rx="1.5" fill="#e89d7b" fillOpacity="0.9" />
              <rect x="50" y="0" width="5" height="40" rx="1.5" fill="#38bdf8" />
            </svg>
          </div>
        </motion.div>

        {/* Logistics Custody */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-[#140c08]/85 backdrop-blur-xl border border-[#d9825b]/25 shadow-xl flex items-center justify-between gap-4 relative overflow-hidden"
        >
          <div className="flex flex-col z-10 space-y-1">
            <span className="text-xs uppercase font-mono font-bold text-[#e89d7b] flex items-center gap-1.5">
              <Truck size={14} className="text-amber-400" />
              <span>Logistics Custody</span>
            </span>
            <div className="text-2xl sm:text-3xl text-white font-bold font-mono tracking-tight">
              Munich Hold
            </div>
            <p className="text-xs text-[#cbb5aa]">
              Intercepted in transit before delivery.
            </p>
          </div>

          <div className="w-16 h-10 shrink-0 z-10 flex items-end justify-end">
            <svg viewBox="0 0 60 40" className="w-full h-full overflow-visible">
              <rect x="0" y="28" width="5" height="12" rx="1.5" fill="#d9825b" fillOpacity="0.5" />
              <rect x="10" y="23" width="5" height="17" rx="1.5" fill="#d9825b" fillOpacity="0.6" />
              <rect x="20" y="17" width="5" height="23" rx="1.5" fill="#d9825b" fillOpacity="0.7" />
              <rect x="30" y="12" width="5" height="28" rx="1.5" fill="#e89d7b" fillOpacity="0.8" />
              <rect x="40" y="6" width="5" height="34" rx="1.5" fill="#e89d7b" fillOpacity="0.9" />
              <rect x="50" y="0" width="5" height="40" rx="1.5" fill="#fbbf24" />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          5. INTERACTIVE DEMONSTRATION FLOW (Complete 6-Stage Sequential Workflow from Git)
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="p-6 bg-[#140c08]/90 border border-[#d9825b]/25 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl"
      >
        <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-serif font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-[#e89d7b]" />
              <span>Full Project Lifecycle Walkthrough (Interactive Jury Flow)</span>
            </h3>
            <p className="text-xs text-[#cbb5aa] mt-0.5 font-sans">
              Click any stage below to demonstrate the end-to-end workflow live to the jury.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#e89d7b]/15 text-[#f0a887] border border-[#e89d7b]/30 font-mono self-start sm:self-auto">
            6 Sequential Stages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 font-sans">
          {/* Stage 1: Manufacturer Batch Creation */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/batches')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Batch AAA &amp; Serial Init</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              Manufacturer assigns Batch <strong className="text-white">AAA</strong>. Cryptographic Blockchain serial <strong className="text-white">AAA12345678</strong> is created (null container ready).
            </p>
          </motion.div>

          {/* Stage 2: Scanner Stage Ingestion */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/scanner')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Mobile /scanner Stages</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              Every stage (SMT-01, DISP-04, SEC-02, AOI-01) pushes timestamp &amp; machine attestation hash.
            </p>
          </motion.div>

          {/* Stage 3: Digital Product Passport */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/passport/GT-DEV-00000851')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  3
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Digital Product Passport (DPP)</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              Inspect the consumer-facing passport and trigger instant cryptographic verification against the EVM root.
            </p>
          </motion.div>

          {/* Stage 4: Retail Customer Sale */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/shopkeeper-portal')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  4
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Retail Customer Sale</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              Retailer uploads customer selling details (<strong className="text-white">Vikram Malhotra</strong>, invoice INV-8812) into the DPP.
            </p>
          </motion.div>

          {/* Stage 5: Defect RMA, Backtrace & Recall */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/recalls')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  5
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Backtrace &amp; Batch Recall</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              Customer issue returned ➔ Manufacturer backtraces to Machine <strong className="text-white">DISP-04</strong> ➔ Recalls Batch AAA ➔ Sends repaired unit to retail.
            </p>
          </motion.div>

          {/* Stage 6: 3rd Party Tamper Lockout */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/security')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  6
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Anti-Tamper Lockout</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              3rd-party shop swaps in counterfeit screen (<strong className="text-white">FAKE-DISP-9999</strong>). When connected to internet, attestation engine triggers remote lock!
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          6. DISPATCHED MOBILES — MULTI-STORE GEOLOCATION MATRIX
          (Original Table from frontend/index.html with Structured Luxury Bronze UI)
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="p-6 bg-[#140c08]/90 border border-[#d9825b]/25 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-serif font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 size={16} className="text-[#e89d7b]" />
              <span>Dispatched Mobiles — Multi-Store Geolocation Matrix</span>
            </h3>
            <p className="text-xs text-[#cbb5aa] mt-0.5">
              Real-time inventory and shelf positioning across flagship retail store locations.
            </p>
          </div>
          <button
            onClick={() => navigate('/passport')}
            className="btn-glass text-xs py-1.5 px-3.5 rounded-xl cursor-pointer self-start sm:self-auto"
          >
            <span>Open Digital Product Passport →</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-mono font-bold uppercase text-[#e89d7b] tracking-wider">
                <th className="py-3 px-3">Device Serial</th>
                <th className="py-3 px-3">Product Model</th>
                <th className="py-3 px-3">Store Location</th>
                <th className="py-3 px-3">City</th>
                <th className="py-3 px-3">Shelf Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {storeLocations.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                  <td className="py-3 px-3 font-mono font-bold text-white group-hover:text-[#f7d5c5]">
                    {item.serial}
                  </td>
                  <td className="py-3 px-3 text-[#dcd0c8]">
                    {item.model}
                  </td>
                  <td className="py-3 px-3 text-[#cbb5aa] flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#e89d7b]" />
                    <span>{item.location}</span>
                  </td>
                  <td className="py-3 px-3 text-[#a69489] font-mono">
                    {item.city}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(`/passport/GT-DEV-00000851`)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-[#d9825b]/25 text-[#f0a887] text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      Inspect DPP →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
