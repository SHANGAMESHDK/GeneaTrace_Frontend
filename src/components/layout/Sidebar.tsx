import React from 'react';
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
  Feather
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
      badgeColor: 'bg-[rgba(248,113,113,0.18)] text-[#F87171] border border-[#F87171]/40'
    },
    { label: 'Logistics Tracking', path: '/logistics', icon: Truck },
    { label: 'Device Security', path: '/security', icon: ShieldAlert },
    { label: 'Blockchain Audit', path: '/audit', icon: Blocks },
    { label: 'Settings & Integrations', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        background: 'linear-gradient(180deg, #211B1A 0%, #382A28 52%, #211B1A 100%)'
      }}
      className={`fixed top-0 left-0 h-screen z-40 border-r border-[#60433D] transition-all duration-300 flex flex-col font-serif-vintage ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#60433D] bg-transparent">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-sm bg-[#60433D] border border-[#60433D] flex items-center justify-center text-[#C1A094] shrink-0 shadow-sm">
            <Feather size={18} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-normal text-lg tracking-wide text-[#E8D8CE]">
                GeneaTrace
              </span>
              <span className="text-[11px] font-normal text-[#C1A094] tracking-wider uppercase">
                Digital Passport
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-sm text-[#C1A094] hover:text-[#E8D8CE] hover:bg-[#382A28]/60 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Environment Indicator */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-sm bg-[#382A28]/80 border border-[#60433D] text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#916B60] animate-pulse" />
              <span className="text-[#E8D8CE] tracking-wider uppercase font-normal text-[10px]">
                Demo Network
              </span>
            </div>
            <span className="text-[#C1A094] font-mono text-[10px]">EVM-Sepolia</span>
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
                `flex items-center gap-3 px-3 py-2 rounded-sm text-xs transition-all group ${
                  isActive
                    ? 'bg-[#916B60]/15 text-[#E8D8CE] border-l-2 border-[#C1A094] shadow-[0_0_12px_rgba(193,160,148,0.22)] font-medium'
                    : 'text-[#C1A094] hover:text-[#E8D8CE] hover:bg-[#382A28]/40'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-[#E8D8CE]' : 'text-[#916B60]'
                    }`}
                  />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-sm uppercase font-normal border ${
                            item.badgeColor ||
                            (isActive
                              ? 'bg-[#60433D] text-[#C1A094] border-[#916B60]'
                              : 'bg-[#382A28] text-[#C1A094] border-[#60433D]')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-[#60433D] bg-transparent">
        <div className="flex items-center gap-3 px-2 py-2 rounded-sm bg-[#382A28]/70 border border-[#60433D]">
          <div className="w-7 h-7 rounded-sm bg-[#60433D] border border-[#60433D] flex items-center justify-center text-xs text-[#C1A094] shrink-0 font-medium">
            GT
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-[#E8D8CE] truncate">Lead QA Architect</span>
              <div className="flex items-center gap-1 text-[10px] text-[#34D399]">
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
