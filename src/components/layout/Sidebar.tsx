import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  QrCode,
  AlertTriangle,
  Building2,
  Truck,
  Layers,
  ShieldAlert,
  Blocks,
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  LogIn,
  Lock,
  ScanLine,
  FileCheck2,
  ArrowRightLeft
} from 'lucide-react';
import { GeneaTraceStore, defaultUsers } from '../../services/dataStore';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const store = GeneaTraceStore.getState();
  const currentUser = GeneaTraceStore.getCurrentUser();
  const hasActiveRecall = store.recallCase.status !== 'Resolved';
  const defectReportsCount = store.defectReports?.length || 0;

  const isShopkeeper = currentUser.role === 'shopkeeper';

  // Navigation for Company / QA Personnel (Full Access)
  const primaryNavItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    {
      label: 'Traceability Explorer',
      path: '/traceability',
      icon: Search,
      badge: 'Merkle DAG',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: 'Digital Passport',
      path: '/passport',
      icon: QrCode,
      badge: 'Live',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      label: 'Precision Recall',
      path: '/recalls',
      icon: AlertTriangle,
      badge: hasActiveRecall ? 'Active Hold' : undefined,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      label: 'Defect Incident Hub',
      path: '/company-defects',
      icon: Building2,
      badge: defectReportsCount > 0 ? `${defectReportsCount} Report` : undefined,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    { label: 'Logistics Manifest', path: '/logistics', icon: Truck },
  ];

  const secondaryNavItems = [
    { label: 'Batch Management', path: '/batches', icon: Layers },
    { label: 'Device Security', path: '/security', icon: ShieldAlert },
    { label: 'Blockchain Audit', path: '/audit', icon: Blocks },
    { label: 'Shopkeeper Portal', path: '/shop-portal', icon: Wrench },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  // Restricted Navigation for Shopkeeper / Retail Service Technician
  const shopkeeperNavItems = [
    {
      label: 'Scan Barcode & Log Defect',
      path: '/shop-portal',
      icon: ScanLine,
      badge: 'Write-Only',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      label: 'Product Verification DPP',
      path: '/passport',
      icon: QrCode,
      badge: 'Public View',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
  ];

  const handleRoleToggle = () => {
    if (isShopkeeper) {
      GeneaTraceStore.setCurrentUser(defaultUsers.company_qa);
      navigate('/');
    } else {
      GeneaTraceStore.setCurrentUser(defaultUsers.shopkeeper);
      navigate('/shop-portal');
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[#0b0705]/94 backdrop-blur-2xl border-r border-[#d9825b]/20 transition-all duration-300 ease-in-out flex flex-col font-sans shadow-2xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] flex items-center justify-center text-[#120a07] shrink-0 shadow-lg shadow-[#c67651]/30"
          >
            <Zap size={20} className="fill-[#120a07] text-[#120a07]" />
          </motion.div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                GeneaTrace
                <span className="text-[10px] font-sans font-semibold px-1.5 py-0.2 rounded-full bg-[#e89d7b]/20 text-[#f0a887] border border-[#e89d7b]/30">
                  {isShopkeeper ? 'SHOP' : 'OEM PRO'}
                </span>
              </span>
              <span className="text-[11px] font-medium text-[#a69489] truncate">
                {isShopkeeper ? 'Service Tech Portal' : 'Manufacturing Lineage'}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#a69489] hover:text-white hover:bg-white/10 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Network Badge */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#160e0a]/80 border border-[#d9825b]/15 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-slate-300 font-medium text-[11px]">
                {isShopkeeper ? 'Cryptographic Ledger' : 'EVM Checkpoint'}
              </span>
            </div>
            <span className="text-emerald-400 font-mono text-[10px]">
              {isShopkeeper ? 'SHA-256 Armed' : 'Sepolia Live'}
            </span>
          </div>
        </div>
      )}

      {/* Restricted Mode Notice for Shopkeeper */}
      {!collapsed && isShopkeeper && (
        <div className="mx-3 my-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-200">
            <Lock size={12} className="text-amber-400" />
            <span>Technician Restricted Access</span>
          </div>
          <p className="text-[10.5px] leading-relaxed text-amber-300/80">
            Internal plant BOM, costs, and recall command consoles are locked. You have write-only permission to scan barcodes and log defect incidents.
          </p>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {isShopkeeper ? (
          /* SHOPKEEPER NAVIGATION (RESTRICTED TO DEFECT ENTRY & VERIFICATION ONLY) */
          <div className="space-y-1.5">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-[#a69489] font-bold">
                Authorized Actions
              </div>
            )}
            {shopkeeperNavItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#e89d7b]/20 to-[#c26842]/10 text-[#f0a887] border border-[#e89d7b]/30 shadow-sm shadow-[#c67651]/20 font-semibold'
                        : 'text-[#a69489] hover:text-white hover:bg-white/5'
                    }`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-medium border ${
                            item.badgeColor || 'bg-white/10 text-slate-300 border-white/15'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ) : (
          /* COMPANY / CORPORATE QA NAVIGATION (FULL ACCESS) */
          <>
            <div className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-[#a69489] font-bold">
                  Core Journey
                </div>
              )}
              {primaryNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-[#e89d7b]/20 to-[#c26842]/10 text-[#f0a887] border border-[#e89d7b]/30 shadow-sm shadow-[#c67651]/20 font-semibold'
                          : 'text-[#a69489] hover:text-white hover:bg-white/5'
                      }`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-[#e89d7b]" />
                    {!collapsed && (
                      <div className="flex items-center justify-between w-full overflow-hidden">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-medium border ${
                              item.badgeColor || 'bg-white/10 text-slate-300 border-white/15'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="space-y-1 pt-2 border-t border-white/10">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-[#a69489] font-bold">
                  System Operations
                </div>
              )}
              {secondaryNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-[#e89d7b]/20 to-[#c26842]/10 text-[#f0a887] border border-[#e89d7b]/30 shadow-sm shadow-[#c67651]/20 font-semibold'
                          : 'text-[#a69489] hover:text-white hover:bg-white/5'
                      }`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-105" />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* Footer / User Profile & Role Switcher */}
      <div className="p-3 border-t border-white/10 bg-[#0e0906]/90 space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#160e0a]/80 border border-[#d9825b]/20 shadow-sm">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-[#120a07] shadow-md ${
            isShopkeeper ? 'bg-[#d9825b]' : 'bg-gradient-to-tr from-[#e89d7b] to-[#b85d38]'
          }`}>
            {isShopkeeper ? 'SK' : 'QA'}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs text-white truncate font-semibold">
                {currentUser.name}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-medium truncate">
                {isShopkeeper ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <Lock size={10} />
                    Shop Service Center
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={10} />
                    Corporate QA Admin
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Role Switcher Pill */}
        {!collapsed && (
          <button
            onClick={handleRoleToggle}
            className="w-full py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#d9825b]/20 text-[11px] font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            title="Switch between Shopkeeper (Restricted) and Company QA (Full Access)"
          >
            <ArrowRightLeft size={12} className="text-[#e89d7b]" />
            <span>
              {isShopkeeper ? 'Switch to Company QA' : 'Switch to Shopkeeper'}
            </span>
          </button>
        )}

        {!collapsed && (
          <div className="flex items-center justify-between text-[11px] text-[#a69489] pt-1 px-1">
            <NavLink
              to="/login"
              className="flex items-center gap-1 text-[#e89d7b] hover:text-[#f0a887] font-medium transition-colors"
            >
              <LogIn size={11} />
              <span>Change Account</span>
            </NavLink>
            <span className="font-mono text-[10px] text-[#a69489]">v1.2-secure</span>
          </div>
        )}
      </div>
    </aside>
  );
};
