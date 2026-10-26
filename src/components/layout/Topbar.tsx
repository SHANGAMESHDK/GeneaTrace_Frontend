import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  RotateCcw,
  ExternalLink,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  X
} from 'lucide-react';
import { GeneaTraceStore } from '../../services/dataStore';

interface TopbarProps {
  collapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Precision Recall Alert: Batch ABC (Display)',
      desc: '100 units flagged. 87 assembled finished phones traced across 14 carrier shipments.',
      type: 'critical',
      time: '12m ago',
      path: '/recalls'
    },
    {
      id: 'notif-2',
      title: 'Shipment Alert: GT-SHP-00000326',
      desc: 'Carries 4 affected phones including GT-DEV-00000851. Current location: Munich Rail Gateway.',
      type: 'warning',
      time: '24m ago',
      path: '/logistics'
    },
    {
      id: 'notif-3',
      title: 'Device Security Simulation Ready',
      desc: 'Test hardware tampering detection and simulated remote lock command on GT-DEV-00000851.',
      type: 'info',
      time: '1h ago',
      path: '/security'
    },
    {
      id: 'notif-4',
      title: 'Merkle-DAG Checkpoint Anchored',
      desc: 'Block #1849502 committed with 96,350 manufacturing events verified on demo ledger.',
      type: 'success',
      time: '2h ago',
      path: '/audit'
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim();
    setShowSearchDropdown(false);

    // Smart routing based on query syntax
    if (query.toUpperCase().startsWith('GT-DEV')) {
      navigate(`/passport/${query.toUpperCase()}`);
    } else if (query.toUpperCase() === 'ABC' || query.toUpperCase().startsWith('BTR') || query.toUpperCase().startsWith('PCB')) {
      navigate(`/batches?search=${query}`);
    } else if (query.toUpperCase().startsWith('GT-SHP')) {
      navigate(`/logistics?search=${query}`);
    } else {
      navigate(`/traceability?query=${encodeURIComponent(query)}`);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all GeneaTrace demo data back to default state? This re-generates all batches, products, and recall trees.')) {
      GeneaTraceStore.resetDemoData();
      window.location.reload();
    }
  };

  // Format breadcrumbs
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-30 transition-all duration-300 flex items-center justify-between px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Breadcrumbs & Quick Showcase */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500">geneatrace</span>
          <span>/</span>
          {pathnames.length === 0 ? (
            <span className="text-cyan-400 font-semibold">overview</span>
          ) : (
            pathnames.map((name, index) => (
              <React.Fragment key={name}>
                {index > 0 && <span>/</span>}
                <span className={index === pathnames.length - 1 ? 'text-cyan-400 font-semibold' : 'text-slate-400'}>
                  {name}
                </span>
              </React.Fragment>
            ))
          )}
        </div>

        {/* Quick Showcase Chip */}
        <button
          onClick={() => navigate('/passport/GT-DEV-00000851')}
          className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition-colors"
          title="Open Flagship Smartphone Passport"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="font-mono">Flagship: GT-DEV-00000851</span>
          <ExternalLink size={12} className="text-slate-400" />
        </button>
      </div>

      {/* Middle & Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Search Serial, Batch, Product, Shipment..."
              className="w-48 sm:w-72 lg:w-96 pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Quick Suggestions Dropdown */}
          {showSearchDropdown && searchQuery.length > 0 && (
            <div className="absolute top-10 left-0 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/60 p-2 z-50 text-xs font-mono">
              <div className="flex items-center justify-between px-2 py-1 text-slate-400 border-b border-slate-800 mb-1">
                <span className="text-[10px] uppercase">Quick Match Suggestions</span>
                <button onClick={() => setShowSearchDropdown(false)}>
                  <X size={12} />
                </button>
              </div>
              <div
                onClick={() => {
                  navigate('/batches');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-slate-800 rounded cursor-pointer flex items-center justify-between text-slate-200"
              >
                <span>Batch ABC (Defective Display Batch)</span>
                <span className="text-[10px] text-red-400">BATCH</span>
              </div>
              <div
                onClick={() => {
                  navigate('/passport/GT-DEV-00000851');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-slate-800 rounded cursor-pointer flex items-center justify-between text-slate-200"
              >
                <span>GT-DEV-00000851 (Flagship Phone)</span>
                <span className="text-[10px] text-cyan-400">PRODUCT</span>
              </div>
              <div
                onClick={() => {
                  navigate('/components?search=ABC-0042');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-slate-800 rounded cursor-pointer flex items-center justify-between text-slate-200"
              >
                <span>ABC-0042 (Installed Display Serial)</span>
                <span className="text-[10px] text-emerald-400">SERIAL</span>
              </div>
              <div
                onClick={() => {
                  navigate('/logistics?search=GT-SHP-00000326');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-slate-800 rounded cursor-pointer flex items-center justify-between text-slate-200"
              >
                <span>GT-SHP-00000326 (Munich Gateway)</span>
                <span className="text-[10px] text-amber-400">SHIPMENT</span>
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition-colors"
          title="Reset All Mock Data to Default"
        >
          <RotateCcw size={13} className="text-slate-400" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/80 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-200">Manufacturing Control Center Alerts</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono">
                    {notifications.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      navigate(n.path);
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      {n.type === 'critical' ? (
                        <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      ) : n.type === 'warning' ? (
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs text-slate-200 truncate">{n.title}</span>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
