import React from 'react';
import { NavLink } from 'react-router-dom';
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
  LogIn
} from 'lucide-react';
import { GeneaTraceStore } from '../../services/dataStore';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const store = GeneaTraceStore.getState();
  const currentUser = GeneaTraceStore.getCurrentUser();
  const hasActiveRecall = store.recallCase.status !== 'Resolved';
  const defectReportsCount = store.defectReports?.length || 0;

  const isShopkeeper = currentUser.role === 'shopkeeper';

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

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-white/95 backdrop-blur-md border-r border-slate-200/80 transition-all duration-300 ease-in-out flex flex-col font-sans shadow-xs ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20"
          >
            <Zap size={20} className="fill-white/20" />
          </motion.div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                GeneaTrace
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">PRO</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-normal">
                Digital Product Passport
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Network Badge */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-700 font-medium text-[11px]">
                EVM Checkpoint
              </span>
            </div>
            <span className="text-slate-500 font-mono text-[10px]">Sepolia Live</span>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Core Showcase Journeys */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
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
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
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
                          item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
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

        {/* System Operations */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
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
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
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
      </nav>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/70 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-xs">
            {isShopkeeper ? 'SK' : 'QA'}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-slate-900 truncate font-semibold">
                {currentUser.name}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <ShieldCheck size={11} />
                <span className="truncate">{isShopkeeper ? 'Shop Center' : 'Corporate QA Admin'}</span>
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-1">
            <NavLink
              to="/login"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <LogIn size={11} />
              <span>Change Account</span>
            </NavLink>
            <span className="font-mono text-[10px]">v1.2-prod</span>
          </div>
        )}
      </div>
    </aside>
  );
};
