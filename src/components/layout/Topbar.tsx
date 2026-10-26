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
  X,
  Layers,
  Smartphone,
  BatteryCharging,
  HeartPulse,
  Plane
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

  const activeSector = GeneaTraceStore.getActiveSector();

  const sectors = [
    { id: 'All', label: 'All Industries', icon: Layers },
    { id: 'Consumer Electronics', label: 'Electronics', icon: Smartphone, showcase: 'GT-DEV-00000851' },
    { id: 'Automotive & EV Battery', label: 'EV Battery', icon: BatteryCharging, showcase: 'GT-EVB-00094120' },
    { id: 'Medical Technology', label: 'Medical Devices', icon: HeartPulse, showcase: 'GT-MED-00041289' },
    { id: 'Industrial & Aerospace', label: 'Aerospace & IoT', icon: Plane, showcase: 'GT-AVN-00018902' },
  ];

  const notifications = [
    {
      id: 'notif-1',
      title: 'Precision Recall Alert: Display Batch ABC',
      desc: '100 units flagged. 87 assembled finished phones traced across 14 carrier shipments.',
      type: 'critical',
      time: '12m ago',
      path: '/recalls'
    },
    {
      id: 'notif-evb',
      title: 'EU Battery Passport (2023/1542) Audit Passed',
      desc: 'GT-EVB-00094120: Recycled Cobalt/Nickel content 41.2% verified on ledger.',
      type: 'success',
      time: '20m ago',
      path: '/passport/GT-EVB-00094120'
    },
    {
      id: 'notif-2',
      title: 'Shipment Alert: GT-SHP-00000326',
      desc: 'Carries 4 affected units. Current location: Munich Rail Gateway.',
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
    }
  ];

  const handleSectorChange = (sectorId: string) => {
    GeneaTraceStore.setActiveSector(sectorId);
    window.dispatchEvent(new Event('sectorChanged'));
    // If selecting a sector with a flagship product and we are on passport page, navigate
    if (location.pathname.startsWith('/passport')) {
      const target = sectors.find(s => s.id === sectorId);
      if (target?.showcase) {
        navigate(`/passport/${target.showcase}`);
      }
    } else {
      window.location.reload();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim();
    setShowSearchDropdown(false);

    if (query.toUpperCase().startsWith('GT-DEV') || query.toUpperCase().startsWith('GT-EVB') || query.toUpperCase().startsWith('GT-MED') || query.toUpperCase().startsWith('GT-AVN')) {
      navigate(`/passport/${query.toUpperCase()}`);
    } else if (query.toUpperCase() === 'ABC' || query.toUpperCase().startsWith('CELL') || query.toUpperCase().startsWith('BMS')) {
      navigate(`/batches?search=${query}`);
    } else if (query.toUpperCase().startsWith('GT-SHP')) {
      navigate(`/logistics?search=${query}`);
    } else {
      navigate(`/traceability?query=${encodeURIComponent(query)}`);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all GeneaTrace demo data back to default state?')) {
      GeneaTraceStore.resetDemoData();
      window.location.reload();
    }
  };

  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-30 transition-all duration-300 flex items-center justify-between px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Sector Selector Pill */}
      <div className="flex items-center gap-2">
        <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
          {sectors.map(sec => {
            const Icon = sec.icon;
            const isSelected = activeSector === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => handleSectorChange(sec.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  isSelected
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={`Filter by ${sec.label}`}
              >
                <Icon size={13} />
                <span className="hidden xl:inline">{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Showcase Links */}
        <div className="hidden 2xl:flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <span className="text-slate-600">|</span>
          <button
            onClick={() => navigate('/passport/GT-DEV-00000851')}
            className="hover:text-cyan-400 px-1.5 py-0.5 rounded hover:bg-slate-900"
          >
            Smartphone
          </button>
          <button
            onClick={() => navigate('/passport/GT-EVB-00094120')}
            className="hover:text-amber-400 px-1.5 py-0.5 rounded hover:bg-slate-900"
          >
            EV Battery
          </button>
          <button
            onClick={() => navigate('/passport/GT-MED-00041289')}
            className="hover:text-emerald-400 px-1.5 py-0.5 rounded hover:bg-slate-900"
          >
            Medical
          </button>
          <button
            onClick={() => navigate('/passport/GT-AVN-00018902')}
            className="hover:text-indigo-400 px-1.5 py-0.5 rounded hover:bg-slate-900"
          >
            Avionics
          </button>
        </div>
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
              className="w-44 sm:w-64 lg:w-80 pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Quick Suggestions Dropdown */}
          {showSearchDropdown && searchQuery.length > 0 && (
            <div className="absolute top-10 left-0 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl shadow-black/60 p-2 z-50 text-xs font-mono">
              <div className="flex items-center justify-between px-2 py-1 text-slate-400 border-b border-slate-800 mb-1">
                <span className="text-[10px] uppercase">Cross-Industry Quick Matches</span>
                <button onClick={() => setShowSearchDropdown(false)}>
                  <X size={12} />
                </button>
              </div>
              <div
                onClick={() => {
                  navigate('/passport/GT-DEV-00000851');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-slate-800 rounded cursor-pointer flex items-center justify-between text-slate-200"
              >
                <span>GT-DEV-00000851 (Galaxy S24 Ultra)</span>
                <span className="text-[10px] text-cyan-400">ELECTRONICS</span>
              </div>
              <div
                onClick={() => {
                  navigate('/passport/GT-EVB-00094120');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-slate-800 rounded cursor-pointer flex items-center justify-between text-slate-200"
              >
                <span>GT-EVB-00094120 (800V EV Battery Pack)</span>
                <span className="text-[10px] text-amber-400">EV BATTERY</span>
              </div>
              <div
                onClick={() => {
                  navigate('/passport/GT-MED-00041289');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-slate-800 rounded cursor-pointer flex items-center justify-between text-slate-200"
              >
                <span>GT-MED-00041289 (Cardiac Pulse Implant)</span>
                <span className="text-[10px] text-emerald-400">MEDICAL UDI</span>
              </div>
              <div
                onClick={() => {
                  navigate('/passport/GT-AVN-00018902');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-slate-800 rounded cursor-pointer flex items-center justify-between text-slate-200"
              >
                <span>GT-AVN-00018902 (Avionics Controller)</span>
                <span className="text-[10px] text-indigo-400">AEROSPACE</span>
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
                  <span className="font-semibold text-xs text-slate-200">Industrial DPP Alerts</span>
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
