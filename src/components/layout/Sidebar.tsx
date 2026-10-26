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
      badgeColor: 'bg-[#2D1C22] text-[#F08C8A] border-[#5A2C35]'
    },
    { label: 'Logistics Tracking', path: '/logistics', icon: Truck },
    { label: 'Device Security', path: '/security', icon: ShieldAlert },
    { label: 'Blockchain Audit', path: '/audit', icon: Blocks },
    { label: 'Settings & Integrations', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[#201D27] border-r border-[#45404F] transition-all duration-300 flex flex-col font-serif-vintage ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#45404F] bg-[#17151C]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-none bg-[#292531] border border-[#45404F] flex items-center justify-center text-[#E2DDE7] shrink-0">
            <Feather size={18} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-normal text-lg tracking-wide text-[#E2DDE7]">
                GeneaTrace
              </span>
              <span className="text-[11px] font-normal text-[#716879] tracking-wider uppercase">
                Digital Passport
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-none text-[#AAA2B3] hover:text-[#E2DDE7] hover:bg-[#292531] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Environment Indicator */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-none bg-[#292531] border border-[#45404F] text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#AAA2B3]" />
              <span className="text-[#E2DDE7] tracking-wider uppercase font-normal text-[10px]">
                Demo Network
              </span>
            </div>
            <span className="text-[#716879] font-mono text-[10px]">EVM-Sepolia</span>
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
                `flex items-center gap-3 px-3 py-2 rounded-none text-xs transition-all group ${
                  isActive
                    ? 'bg-[#292531] text-[#E2DDE7] border-l-2 border-[#AAA2B3] font-normal'
                    : 'text-[#AAA2B3] hover:text-[#E2DDE7] hover:bg-[#292531]/60'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
              {!collapsed && (
                <div className="flex items-center justify-between w-full overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-none uppercase font-normal border ${
                        item.badgeColor || 'bg-[#17151C] text-[#AAA2B3] border-[#45404F]'
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
      <div className="p-3 border-t border-[#45404F] bg-[#17151C]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-none bg-[#292531] border border-[#45404F]">
          <div className="w-7 h-7 rounded-none bg-[#17151C] border border-[#45404F] flex items-center justify-center text-xs text-[#E2DDE7] shrink-0 font-normal">
            GT
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-[#E2DDE7] truncate">Lead QA Architect</span>
              <div className="flex items-center gap-1 text-[10px] text-[#86D6A6]">
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
