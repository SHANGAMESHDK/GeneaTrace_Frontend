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
      className={`fixed top-0 right-0 h-16 bg-[#011C40] border-b border-[#155477] z-30 transition-all duration-300 flex items-center justify-between px-6 font-serif-vintage ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Sector Selector Pill */}
      <div className="flex items-center gap-2">
        <div className="flex items-center p-0.5 rounded-sm bg-[#062B49] border border-[#155477] text-xs">
          {sectors.map(sec => {
            const Icon = sec.icon;
            const isSelected = activeSector === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => handleSectorChange(sec.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm transition-all ${
                  isSelected
                    ? 'bg-[#A7EBF2] text-[#011C40] font-semibold shadow-sm'
                    : 'text-[#86BFCF] hover:text-[#D9F5F7] hover:bg-[#073451]'
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
        <div className="hidden 2xl:flex items-center gap-1 text-[11px] text-[#86BFCF]">
          <span className="text-[#155477]">|</span>
          <button
            onClick={() => navigate('/passport/GT-DEV-00000851')}
            className="hover:text-[#A7EBF2] px-1.5 py-0.5 transition-colors"
          >
            Smartphone
          </button>
          <button
            onClick={() => navigate('/passport/GT-EVB-00094120')}
            className="hover:text-[#A7EBF2] px-1.5 py-0.5 transition-colors"
          >
            EV Battery
          </button>
          <button
            onClick={() => navigate('/passport/GT-MED-00041289')}
            className="hover:text-[#A7EBF2] px-1.5 py-0.5 transition-colors"
          >
            Medical
          </button>
          <button
            onClick={() => navigate('/passport/GT-AVN-00018902')}
            className="hover:text-[#A7EBF2] px-1.5 py-0.5 transition-colors"
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
              className="w-44 sm:w-64 lg:w-80 pl-8 pr-4 py-1.5 bg-[#062B49] border border-[#155477] rounded-sm text-xs text-[#D9F5F7] placeholder-[#86BFCF]/70 focus:outline-none focus:border-[#54ACBF] transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-[#86BFCF] absolute left-2.5 top-2.5" />
          </form>

          {/* Quick Suggestions Dropdown */}
          {showSearchDropdown && searchQuery.length > 0 && (
            <div className="absolute top-10 left-0 right-0 bg-[#062B49] border border-[#155477] rounded-sm shadow-xl p-2 z-50 text-xs">
              <div className="flex items-center justify-between px-2 py-1 text-[#86BFCF] border-b border-[#155477] mb-1">
                <span className="text-[10px] uppercase tracking-wider font-serif">Quick Suggestions</span>
                <button onClick={() => setShowSearchDropdown(false)} className="text-[#86BFCF] hover:text-[#D9F5F7]">
                  <X size={12} />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    navigate('/recalls');
                    setShowSearchDropdown(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#073451] text-[#F87171] font-serif flex items-center justify-between"
                >
                  <span>Flagged Display Batch ABC</span>
                  <span className="text-[10px] font-mono text-[#86BFCF]">Recall Center</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/passport/GT-DEV-00000851');
                    setShowSearchDropdown(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#073451] text-[#D9F5F7] font-mono text-xs flex items-center justify-between"
                >
                  <span>GT-DEV-00000851</span>
                  <span className="text-[10px] font-serif text-[#86BFCF]">Finished Product</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/logistics?search=GT-SHP-00000326');
                    setShowSearchDropdown(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-[#073451] text-[#FBBF24] font-mono text-xs flex items-center justify-between"
                >
                  <span>GT-SHP-00000326</span>
                  <span className="text-[10px] font-serif text-[#86BFCF]">In-Transit</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Demo Reset */}
        <button
          onClick={handleResetData}
          title="Reset Demo Data"
          className="p-2 rounded-sm text-[#86BFCF] hover:text-[#D9F5F7] hover:bg-[#062B49] transition-colors border border-transparent hover:border-[#155477]"
        >
          <RotateCcw size={15} />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-sm text-[#86BFCF] hover:text-[#D9F5F7] hover:bg-[#062B49] transition-colors relative border border-transparent hover:border-[#155477]"
            title="System Alerts"
          >
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F87171]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-[#062B49] border border-[#155477] rounded-sm shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#155477] mb-2 font-serif">
                <span className="text-xs uppercase tracking-wider text-[#D9F5F7]">Industrial Event Notifications</span>
                <button onClick={() => setShowNotifications(false)} className="text-[#86BFCF] hover:text-[#D9F5F7]">
                  <X size={13} />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      navigate(n.path);
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-sm bg-[#073451] hover:bg-[#064A67] border border-[#155477] cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-normal font-serif text-[#D9F5F7] truncate">{n.title}</span>
                      <span className="text-[10px] font-mono text-[#86BFCF] shrink-0 ml-2">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#86BFCF] font-serif line-clamp-2 leading-relaxed">{n.desc}</p>
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
