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

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[#fffdf6] border-b border-[#e5e5e5] z-30 transition-all duration-300 flex items-center justify-between px-6 font-serif-vintage ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Sector Selector Pill */}
      <div className="flex items-center gap-2">
        <div className="flex items-center p-0.5 rounded-none bg-[#faf3dc] border border-[#e5e5e5] text-xs">
          {sectors.map(sec => {
            const Icon = sec.icon;
            const isSelected = activeSector === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => handleSectorChange(sec.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none transition-all ${
                  isSelected
                    ? 'bg-[#c5716d] text-[#fffdf6] font-normal shadow-sm'
                    : 'text-[#413634] hover:text-[#c5716d] hover:bg-[#fffdf6]'
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
        <div className="hidden 2xl:flex items-center gap-1 text-[11px] text-[#666666]">
          <span className="text-[#e5e5e5]">|</span>
          <button
            onClick={() => navigate('/passport/GT-DEV-00000851')}
            className="hover:text-[#c5716d] px-1.5 py-0.5"
          >
            Smartphone
          </button>
          <button
            onClick={() => navigate('/passport/GT-EVB-00094120')}
            className="hover:text-[#c5716d] px-1.5 py-0.5"
          >
            EV Battery
          </button>
          <button
            onClick={() => navigate('/passport/GT-MED-00041289')}
            className="hover:text-[#c5716d] px-1.5 py-0.5"
          >
            Medical
          </button>
          <button
            onClick={() => navigate('/passport/GT-AVN-00018902')}
            className="hover:text-[#c5716d] px-1.5 py-0.5"
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
              className="w-44 sm:w-64 lg:w-80 pl-8 pr-4 py-1.5 bg-[#fffcf8] border border-[#e5e5e5] rounded-none text-xs text-[#413634] placeholder-[#8b6c58]/60 focus:outline-none focus:border-[#413634]"
            />
            <Search className="w-3.5 h-3.5 text-[#666666] absolute left-2.5 top-2.5" />
          </form>

          {/* Quick Suggestions Dropdown */}
          {showSearchDropdown && searchQuery.length > 0 && (
            <div className="absolute top-10 left-0 right-0 bg-[#fffcf8] border border-[#413634] rounded-none shadow-md p-2 z-50 text-xs">
              <div className="flex items-center justify-between px-2 py-1 text-[#666666] border-b border-[#e5e5e5] mb-1">
                <span className="text-[10px] uppercase tracking-wider">Quick Suggestions</span>
                <button onClick={() => setShowSearchDropdown(false)} className="text-[#413634]">
                  <X size={12} />
                </button>
              </div>
              <div
                onClick={() => {
                  navigate('/passport/GT-DEV-00000851');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-[#faf3dc] rounded-none cursor-pointer flex items-center justify-between text-[#413634]"
              >
                <span>GT-DEV-00000851 (Galaxy S24 Ultra)</span>
                <span className="text-[10px] text-[#c5716d] uppercase">Electronics</span>
              </div>
              <div
                onClick={() => {
                  navigate('/passport/GT-EVB-00094120');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-[#faf3dc] rounded-none cursor-pointer flex items-center justify-between text-[#413634]"
              >
                <span>GT-EVB-00094120 (800V EV Battery Pack)</span>
                <span className="text-[10px] text-[#b87428] uppercase">EV Battery</span>
              </div>
              <div
                onClick={() => {
                  navigate('/passport/GT-MED-00041289');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-[#faf3dc] rounded-none cursor-pointer flex items-center justify-between text-[#413634]"
              >
                <span>GT-MED-00041289 (Cardiac Implant)</span>
                <span className="text-[10px] text-[#2e6b4d] uppercase">Medical</span>
              </div>
              <div
                onClick={() => {
                  navigate('/batches');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-[#faf3dc] rounded-none cursor-pointer flex items-center justify-between text-[#413634]"
              >
                <span>Batch ABC (Defective Display Batch)</span>
                <span className="text-[10px] text-[#b84a44] uppercase">Batch</span>
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetData}
          className="btn-vintage-outline"
          title="Reset All Mock Data to Default"
        >
          <RotateCcw size={12} className="text-[#8b6c58]" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-none bg-[#fffcf8] border border-[#e5e5e5] text-[#413634] hover:bg-[#faf3dc] transition-colors relative"
            title="Notifications"
          >
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#c5716d]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-[#fffcf8] border border-[#413634] rounded-none shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e5e5e5] bg-[#faf3dc]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#413634] font-normal uppercase tracking-wide">
                    Manufacturing Alerts
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#c5716d] text-[#fffdf6]">
                    {notifications.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#413634] hover:text-[#c5716d]"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#e5e5e5]">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      navigate(n.path);
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-[#faf3dc] cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      {n.type === 'critical' ? (
                        <AlertOctagon className="w-4 h-4 text-[#b84a44] shrink-0 mt-0.5" />
                      ) : n.type === 'warning' ? (
                        <ShieldAlert className="w-4 h-4 text-[#b87428] shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#2e6b4d] shrink-0 mt-0.5" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs text-[#413634] truncate">{n.title}</span>
                          <span className="text-[10px] text-[#666666] shrink-0 font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#666666] mt-0.5 line-clamp-2">{n.desc}</p>
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
