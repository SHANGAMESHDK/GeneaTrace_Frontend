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
  Feather,
  Wrench,
  Building2,
  UserCheck
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

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    {
      label: 'Shop Incident Entry',
      path: '/shop-portal',
      icon: Wrench,
      badge: isShopkeeper ? 'Active Shop' : 'Write-Only',
      badgeColor: 'bg-[#faf3dc] text-[#c5716d] border-[#c5716d]/40'
    },
    {
      label: 'Corporate Defect Hub',
      path: '/company-defects',
      icon: Building2,
      badge: defectReportsCount > 0 ? `${defectReportsCount} Reports` : undefined,
      badgeColor: 'bg-[#fef7ec] text-[#b87428] border-[#b87428]/40'
    },
    { label: 'Manufacturing Lineage', path: '/lineage', icon: GitFork, badge: 'Interactive' },
    { label: 'Component Registry', path: '/components', icon: Cpu },
    { label: 'Batch Management', path: '/batches', icon: Layers, badge: 'Core' },
    { label: 'Assembly Tracking', path: '/assembly', icon: Smartphone },
    { label: 'Digital Product Passport', path: '/passport', icon: QrCode },
    { label: 'Traceability Explorer', path: '/traceability', icon: Search },
    {
      label: 'Recall Management',
      path: '/recalls',
      icon: AlertTriangle,
      badge: hasActiveRecall ? 'Active' : undefined,
      badgeColor: 'bg-[#fdf2f1] text-[#b84a44] border-[#b84a44]/40'
    },
    { label: 'Logistics Tracking', path: '/logistics', icon: Truck },
    { label: 'Device Security', path: '/security', icon: ShieldAlert },
    { label: 'Blockchain Audit', path: '/audit', icon: Blocks },
    { label: 'Settings & Integrations', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[#fffcf8] border-r border-[#e5e5e5] transition-all duration-300 flex flex-col font-serif-vintage ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#e5e5e5] bg-[#fffdf6]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-none bg-[#faf3dc] border border-[#413634] flex items-center justify-center text-[#c5716d] shrink-0">
            <Feather size={18} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-normal text-lg tracking-wide text-[#413634]">
                GeneaTrace
              </span>
              <span className="text-[11px] font-normal text-[#8b6c58] tracking-wider uppercase">
                Digital Passport
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-none text-[#666666] hover:text-[#413634] hover:bg-[#faf3dc] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Environment Indicator */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-none bg-[#faf3dc] border border-[#e5e5e5] text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5716d]" />
              <span className="text-[#413634] tracking-wider uppercase font-normal text-[10px]">
                Demo Network
              </span>
            </div>
            <span className="text-[#8b6c58] font-mono text-[10px]">EVM-Sepolia</span>
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
                    ? 'bg-[#faf3dc] text-[#c5716d] border-l-2 border-[#c5716d] font-normal'
                    : 'text-[#413634] hover:text-[#c5716d] hover:bg-[#faf3dc]/60'
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
                        item.badgeColor || 'bg-[#fffdf6] text-[#c5716d] border-[#c5716d]/40'
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

      {/* Footer / User Profile & Role Switcher */}
      <div className="p-3 border-t border-[#e5e5e5] bg-[#fffdf6] space-y-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-none bg-[#faf3dc] border border-[#e5e5e5]">
          <div className="w-7 h-7 rounded-none bg-[#fffdf6] border border-[#413634] flex items-center justify-center text-xs text-[#c5716d] shrink-0 font-normal">
            {isShopkeeper ? 'SK' : 'QA'}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-[#413634] truncate font-medium">
                {currentUser.name}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-[#2e6b4d]">
                <ShieldCheck size={11} />
                <span className="truncate">{isShopkeeper ? 'Shop Center (Write-Only)' : 'Corporate Admin'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Role Switcher Button */}
        {!collapsed && (
          <div className="flex items-center justify-between text-[10px] text-[#666666] pt-1">
            <span>Switch Persona:</span>
            <button
              onClick={() => {
                const nextRole = isShopkeeper ? 'company_qa' : 'shopkeeper';
                GeneaTraceStore.switchUserRole(nextRole);
                window.location.reload();
              }}
              className="text-[#c5716d] hover:underline font-mono"
            >
              {isShopkeeper ? '→ Switch to Company QA' : '→ Switch to Shopkeeper'}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
