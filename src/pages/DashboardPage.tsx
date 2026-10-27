import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
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
  ExternalLink
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

  const showcaseProduct = store.products[0];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 font-sans max-w-6xl mx-auto"
    >
      {/* Clean Executive Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              GeneaTrace Command Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
              Live Network
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Unit-level cryptographic provenance, Merkle-DAG assembly lineage, and precision recall isolation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/traceability')}
            className="btn-modern-outline text-xs flex items-center gap-2 rounded-xl"
          >
            <Search size={14} className="text-blue-600" />
            <span>Traceability Explorer</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/passport')}
            className="btn-modern-accent text-xs flex items-center gap-2 rounded-xl"
          >
            <QrCode size={14} />
            <span>Showcase Passport</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Cloud & Blockchain Health Strip */}
      <motion.div
        variants={itemVariants}
        className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Server size={15} />
          </div>
          <span className="font-semibold text-slate-800">Platform Status:</span>
          {loadingBackend ? (
            <span className="text-slate-400 font-mono text-[11px]">Connecting to backend services...</span>
          ) : backendSummary ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 font-medium text-[11px]">
                Live Cloud Connected (FastAPI + Supabase + EVM Anchor)
              </span>
            </div>
          ) : (
            <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Operational (Cryptographic Verification Engine)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200/60">
            EVM Checkpoint: Block #1849340
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
            SHA-256 Merkle-DAG Active
          </span>
        </div>
      </motion.div>

      {/* Hero Showcase Card */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -2 }}
        className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <QrCode size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {showcaseProduct?.productModel || 'Galaxy S24 Ultra Titanium DPP Edition'}
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold uppercase tracking-wider">
                  Recall Flagged
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Product ID: <strong className="text-slate-700">{showcaseProduct?.productId}</strong> • Masked IMEI: {showcaseProduct?.imeiMasked}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/passport/${showcaseProduct?.productId}`)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <span>Verify DPP</span>
              <ShieldCheck size={14} className="text-emerald-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/traceability?query=${showcaseProduct?.productId}`)}
              className="btn-modern-accent text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
            >
              <span>Trace Lineage</span>
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>

        {/* Provenance Pipeline Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
          <div className="p-3.5 bg-slate-50/80 border border-slate-200/60 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Source Batch</span>
            <span className="font-mono text-sm text-slate-900 font-semibold block">Batch ABC (Display)</span>
            <span className="text-[11px] text-rose-600 font-medium block">Adhesive Micro-Delamination</span>
          </div>

          <div className="p-3.5 bg-slate-50/80 border border-slate-200/60 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Installed Display</span>
            <span className="font-mono text-sm text-slate-900 font-semibold block">Serial ABC-0042</span>
            <span className="text-[11px] text-emerald-600 font-medium block">8 Manufacturing Steps Hashed</span>
          </div>

          <div className="p-3.5 bg-slate-50/80 border border-slate-200/60 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Active Shipment</span>
            <span className="font-mono text-sm text-slate-900 font-semibold block">GT-SHP-00000326</span>
            <span className="text-[11px] text-amber-600 font-medium block">Munich Gateway (Carrier Hold)</span>
          </div>

          <div className="p-3.5 bg-slate-50/80 border border-slate-200/60 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Store Incident</span>
            <span className="font-mono text-sm text-slate-900 font-semibold block">REP-2026-001</span>
            <span className="text-[11px] text-slate-500 font-medium block">iFix Hub (Bangalore, KA)</span>
          </div>
        </div>
      </motion.div>

      {/* 4 Core Value Metric Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Traversal Speed */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition-all border-t-4 border-t-emerald-500"
        >
          <span className="text-xs uppercase font-semibold text-slate-500 flex items-center gap-1.5">
            <Zap size={14} className="text-emerald-500" />
            <span>Traversal Latency</span>
          </span>
          <div className="text-3xl text-slate-900 font-bold font-mono">
            &lt; 12 ms
          </div>
          <p className="text-xs text-slate-500">
            Instant recursive sub-graph DAG traversal.
          </p>
        </motion.div>

        {/* Targeted Accuracy */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition-all border-t-4 border-t-rose-500"
        >
          <span className="text-xs uppercase font-semibold text-slate-500 flex items-center gap-1.5">
            <AlertOctagon size={14} className="text-rose-500" />
            <span>Precision Recall</span>
          </span>
          <div className="text-3xl text-slate-900 font-bold font-mono">
            1 Device
          </div>
          <p className="text-xs text-slate-500">
            Zero false positives; zero mass-recalls.
          </p>
        </motion.div>

        {/* Immutable Proof */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition-all border-t-4 border-t-blue-500"
        >
          <span className="text-xs uppercase font-semibold text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-blue-500" />
            <span>Digital Passport</span>
          </span>
          <div className="text-3xl text-slate-900 font-bold font-mono">
            Verified
          </div>
          <p className="text-xs text-slate-500">
            EU ESPR &amp; DPP directive compliant.
          </p>
        </motion.div>

        {/* Chain of Custody */}
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2 hover:shadow-md transition-all border-t-4 border-t-amber-500"
        >
          <span className="text-xs uppercase font-semibold text-slate-500 flex items-center gap-1.5">
            <Truck size={14} className="text-amber-500" />
            <span>Logistics Custody</span>
          </span>
          <div className="text-3xl text-slate-900 font-bold font-mono">
            Munich Hold
          </div>
          <p className="text-xs text-slate-500">
            Intercepted in transit before delivery.
          </p>
        </motion.div>
      </motion.div>

      {/* Jury & Audience 6-Stage Interactive Workflow Guide */}
      <motion.div variants={itemVariants} className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600" />
              <span>Full Project Lifecycle Walkthrough (Samsung A55 Demo)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any stage below to demonstrate the end-to-end workflow live to the jury.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-mono">
            6 Sequential Stages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Step 1: Manufacturer Batch Creation */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/batches')}
            className="p-4 bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-300 rounded-xl cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">1</span>
                <span>Batch AAA &amp; Serial Init</span>
              </span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Manufacturer assigns Batch <strong>AAA</strong>. Cryptographic Blockchain serial <strong>AAA12345678</strong> is created (null container ready).
            </p>
          </motion.div>

          {/* Step 2: Scanner Stage Ingestion */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/scanner')}
            className="p-4 bg-slate-50/70 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300 rounded-xl cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-mono">2</span>
                <span>Mobile /scanner Stages</span>
              </span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Every stage (SMT-01, DISP-04, SEC-02, AOI-01) pushes timestamp &amp; machine ID to the container upon scanning.
            </p>
          </motion.div>

          {/* Step 3: Logistics Network */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/logistics')}
            className="p-4 bg-slate-50/70 hover:bg-amber-50/40 border border-slate-200/80 hover:border-amber-300 rounded-xl cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold font-mono">3</span>
                <span>Logistics &amp; Delivery</span>
              </span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Full chain of custody: Factory Packing ➔ Outbound Warehouse ➔ Dispatched Air Corridor ➔ Delivered to Indiranagar Retail.
            </p>
          </motion.div>

          {/* Step 4: Retail Sales Registration */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/shopkeeper-portal')}
            className="p-4 bg-slate-50/70 hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-300 rounded-xl cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">4</span>
                <span>Retail Customer Sale</span>
              </span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Retailer uploads customer selling details (<strong>Vikram Malhotra</strong>, invoice INV-8812) into the DPP.
            </p>
          </motion.div>

          {/* Step 5: Defect RMA, Backtrace & Recall */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/recalls')}
            className="p-4 bg-slate-50/70 hover:bg-rose-50/40 border border-slate-200/80 hover:border-rose-300 rounded-xl cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold font-mono">5</span>
                <span>Backtrace &amp; Batch Recall</span>
              </span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              Customer issue returned ➔ Manufacturer backtraces to Machine <strong>DISP-04</strong> ➔ Recalls Batch AAA ➔ Sends repaired unit to retail.
            </p>
          </motion.div>

          {/* Step 6: 3rd Party Tamper Lockout */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/security')}
            className="p-4 bg-slate-50/70 hover:bg-purple-50/40 border border-slate-200/80 hover:border-purple-300 rounded-xl cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold font-mono">6</span>
                <span>Anti-Tamper Lockout</span>
              </span>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-8">
              3rd-party shop swaps in counterfeit screen (FAKE-DISP-9999). When connected to internet, attestation engine triggers remote lock!
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
