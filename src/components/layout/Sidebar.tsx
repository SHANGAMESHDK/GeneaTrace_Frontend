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
        background: 'linear-gradient(180deg, #023859 0%, #064A67 52%, #011C40 100%)'
      }}
      className={`fixed top-0 left-0 h-screen z-40 border-r border-[#155477] transition-all duration-300 flex flex-col font-serif-vintage ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#155477] bg-transparent">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-sm bg-[#073451] border border-[#155477] flex items-center justify-center text-[#A7EBF2] shrink-0 shadow-sm">
            <Feather size={18} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-normal text-lg tracking-wide text-[#D9F5F7]">
                GeneaTrace
              </span>
              <span className="text-[11px] font-normal text-[#86BFCF] tracking-wider uppercase">
                Digital Passport
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-sm text-[#86BFCF] hover:text-[#D9F5F7] hover:bg-[#064A67]/60 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Environment Indicator */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-sm bg-[#062B49]/80 border border-[#155477] text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#54ACBF] animate-pulse" />
              <span className="text-[#D9F5F7] tracking-wider uppercase font-normal text-[10px]">
                Demo Network
              </span>
            </div>
            <span className="text-[#86BFCF] font-mono text-[10px]">EVM-Sepolia</span>
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
                    ? 'bg-[#54ACBF]/15 text-[#D9F5F7] border-l-2 border-[#54ACBF] shadow-[0_0_12px_rgba(84,172,191,0.22)] font-medium'
                    : 'text-[#86BFCF] hover:text-[#D9F5F7] hover:bg-[#064A67]/40'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-[#A7EBF2]' : 'text-[#86BFCF]'
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
                              ? 'bg-[#073451] text-[#A7EBF2] border-[#54ACBF]'
                              : 'bg-[#062B49] text-[#86BFCF] border-[#155477]')
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
      <div className="p-3 border-t border-[#155477] bg-transparent">
        <div className="flex items-center gap-3 px-2 py-2 rounded-sm bg-[#062B49]/70 border border-[#155477]">
          <div className="w-7 h-7 rounded-sm bg-[#073451] border border-[#155477] flex items-center justify-center text-xs text-[#A7EBF2] shrink-0 font-medium">
            GT
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-[#D9F5F7] truncate">Lead QA Architect</span>
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
