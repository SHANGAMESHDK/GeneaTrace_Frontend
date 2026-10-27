import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Topbar } from './Topbar';
import { GeneaTraceStore } from '../../services/dataStore';
import { Lock, ShieldAlert, ScanLine, ShieldCheck } from 'lucide-react';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = GeneaTraceStore.getCurrentUser();
  const isShopkeeper = currentUser.role === 'shopkeeper';

  // Allowed paths for shopkeeper / retail service technician
  const isShopkeeperAllowedPath =
    location.pathname.startsWith('/shop-portal') ||
    location.pathname.startsWith('/passport') ||
    location.pathname === '/login';

  const isRestrictedForShopkeeper = isShopkeeper && !isShopkeeperAllowedPath;

  return (
    <div className="min-h-screen bg-[#0b0705] text-[#f9f6f3] flex flex-col font-sans selection:bg-[#d9825b]/30 selection:text-[#f7d5c5] relative overflow-x-hidden">
      {/* Ambient Cyber Lighting Gradients - Warm Luxury Bronze & Copper */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-[#d9825b]/16 via-[#8c4728]/8 to-transparent blur-[140px] -mt-20" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#b85d38]/12 blur-[130px]" />
        <div className="absolute bottom-0 left-10 w-[600px] h-[400px] bg-[#633119]/12 blur-[150px]" />
        {/* Subtle high-tech dot matrix pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,220,200,0.035)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      {/* Global Topbar with 3D Mega Menu Navigation */}
      <Topbar />

      <main className="flex-1 transition-all duration-300 ease-in-out pt-20 min-h-screen relative z-10 w-full">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {isRestrictedForShopkeeper ? (
            /* Restricted Access Notice for Shopkeeper */
            <div className="my-10 max-w-2xl mx-auto p-8 bg-[#18100c]/90 border border-[#d9825b]/30 rounded-2xl shadow-2xl backdrop-blur-xl text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#d9825b]/10 text-[#e89d7b] border border-[#d9825b]/30 flex items-center justify-center mx-auto shadow-inner">
                <Lock size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30">
                  Role-Based Access Control (RBAC) Active
                </span>
                <h1 className="text-2xl font-serif font-bold text-white mt-2">
                  Confidential Corporate Console Locked
                </h1>
                <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  You are logged in as <strong className="text-white">{currentUser.name}</strong> ({currentUser.shopName || 'Authorized Service Center'}). Service technicians are strictly authorized to scan product barcodes and record customer defect reports.
                </p>
              </div>

              <div className="p-4 bg-[#140c08]/80 border border-[#d9825b]/20 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-amber-400" />
                  <span>Access Policy Enforcements:</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                  <li>Factory BOM and component costings: <strong className="text-amber-300">Hidden</strong></li>
                  <li>Enterprise Recall broadcast triggers: <strong className="text-rose-400">Locked</strong></li>
                  <li>Multi-facility logistics manifests: <strong className="text-amber-300">Restricted</strong></li>
                  <li>Barcode defect logging &amp; Cryptographic Receipts: <strong className="text-emerald-400">Authorized</strong></li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/shop-portal')}
                  className="btn-sunset w-full sm:w-auto"
                >
                  <ScanLine size={16} />
                  <span>Open Barcode Defect Station</span>
                </button>

                <button
                  onClick={() => {
                    GeneaTraceStore.switchUserRole('company_qa');
                    window.location.reload();
                  }}
                  className="btn-glass w-full sm:w-auto text-xs"
                >
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Switch to Corporate QA (Demo View)</span>
                </button>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.995 }}
                transition={{
                  duration: 0.22,
                  ease: 'easeOut'
                }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
};
