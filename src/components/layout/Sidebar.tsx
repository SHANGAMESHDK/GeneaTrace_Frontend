import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitFork,
  Cpu,
  Layers,
  Smartphone,
  QrCode,
  Search,
  AlertTriangle,
  Truck,
  ShieldAlert,
  Blocks,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { GeneaTraceStore } from '../../services/dataStore';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const store = GeneaTraceStore.getState();
  const hasActiveRecall = store.recallCase.status !== 'Resolved';

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Manufacturing Lineage', path: '/lineage', icon: GitFork, badge: 'Interactive' },
    { label: 'Component Registry', path: '/components', icon: Cpu },
    { label: 'Batch Management', path: '/batches', icon: Layers, badge: 'Core' },
    { label: 'Assembly Tracking', path: '/assembly', icon: Smartphone },
    { label: 'Digital Product Passport', path: '/passport/GT-DEV-00000851', icon: QrCode },
    { label: 'Traceability Explorer', path: '/traceability', icon: Search },
    {
      label: 'Recall Management',
      path: '/recalls',
      icon: AlertTriangle,
      badge: hasActiveRecall ? 'Active' : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40'
    },
    { label: 'Logistics Tracking', path: '/logistics', icon: Truck },
    { label: 'Device Security', path: '/security', icon: ShieldAlert },
    { label: 'Blockchain Audit', path: '/audit', icon: Blocks },
    { label: 'Settings & Integrations', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                GeneaTrace
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-semibold">
                Industrial DPP v2.4
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Environment Pill */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300 font-mono font-medium">DEMO NETWORK</span>
            </div>
            <span className="text-slate-500 font-mono text-[10px]">EVM-Sepolia</span>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && (
                <div className="flex items-center justify-between w-full overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono uppercase font-semibold border ${
                        item.badgeColor || 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
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
      </nav>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-900/50 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-cyan-400 border border-cyan-500/30 shrink-0">
            QC
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">Lead QA Architect</span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <ShieldCheck size={11} />
                <span>Authorized Level 4</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
