import React, { useState, useEffect } from 'react';
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
  Plane,
  Server,
  Activity,
  RefreshCw
} from 'lucide-react';
import { GeneaTraceStore } from '../../services/dataStore';
import { api, BackendHealth, BACKEND_ROOT } from '../../services/apiClient';

interface TopbarProps {
  collapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  // Live Backend Connection Status
  const [backendStatus, setBackendStatus] = useState<{
    status: 'checking' | 'connected' | 'error';
    latencyMs?: number;
    health?: any;
    readiness?: BackendHealth | null;
    lastPing?: string;
  }>({ status: 'checking', readiness: null });

  const pingBackend = async () => {
    setBackendStatus(prev => ({ ...prev, status: 'checking' }));
    const start = performance.now();
    try {
      const health = await api.getHealth();
      let readiness: BackendHealth | null = null;
      try {
        readiness = await api.getReadiness();
      } catch {
        // optional readiness probe
      }
      const latency = Math.round(performance.now() - start);
      setBackendStatus({
        status: 'connected',
        latencyMs: latency,
        health,
        readiness,
        lastPing: new Date().toLocaleTimeString()
      });
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      setBackendStatus({
        status: 'error',
        latencyMs: latency,
        health: { error: err.message },
        readiness: null,
        lastPing: new Date().toLocaleTimeString()
      });
    }
  };

  useEffect(() => {
    pingBackend();
    const interval = setInterval(pingBackend, 45000);
    return () => clearInterval(interval);
  }, []);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Precision Recall Advisory: Display Batch ABC',
      desc: '100 units flagged. 87 assembled finished phones traced across 14 carrier shipments.',
      type: 'critical',
      time: '12m ago',
      path: '/recalls'
    },
    {
      id: 'notif-2',
      title: 'Logistics Manifest Alert: GT-SHP-00000326',
      desc: 'Carries 4 affected units. Current location: Munich Rail Gateway.',
      type: 'warning',
      time: '24m ago',
      path: '/logistics'
    },
    {
      id: 'notif-3',
      title: 'Device Hardware Security Status Active',
      desc: 'Attestation identity commitment verified on ledger for GT-DEV-00000851.',
      type: 'info',
      time: '1h ago',
      path: '/security'
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim();
    setShowSearchDropdown(false);

    if (query.toUpperCase().startsWith('GT-DEV')) {
      navigate(`/passport/${query.toUpperCase()}`);
    } else if (['ABC', 'BTR', 'PCB', 'CAM', 'SPK', 'FRM'].includes(query.toUpperCase())) {
      navigate(`/batches?search=${query}`);
    } else if (query.toUpperCase().startsWith('GT-SHP')) {
      navigate(`/logistics?search=${query}`);
    } else {
      navigate(`/traceability?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[#fffdf6] border-b border-[#e5e5e5] z-30 transition-all duration-300 flex items-center justify-between px-6 font-serif-vintage ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Manufacturing Lineage Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#faf3dc] border border-[#e5e5e5] text-xs">
          <Layers size={14} className="text-[#c5716d]" />
          <span className="font-medium text-[#413634] hidden sm:inline">
            GeneaTrace — Unified Manufacturing Lineage &amp; DPP
          </span>
          <span className="text-[10px] px-1.5 py-0.2 bg-[#edf6f0] border border-[#2e6b4d] text-[#2e6b4d] font-mono font-medium">
            Production
          </span>
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
                  navigate('/passport/GT-DEV-00000852');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-[#faf3dc] rounded-none cursor-pointer flex items-center justify-between text-[#413634]"
              >
                <span>GT-DEV-00000852 (Galaxy S24 Ultra - Black)</span>
                <span className="text-[10px] text-[#49627d] uppercase">Electronics</span>
              </div>
              <div
                onClick={() => {
                  navigate('/passport/GT-DEV-00000853');
                  setShowSearchDropdown(false);
                }}
                className="px-2 py-1.5 hover:bg-[#faf3dc] rounded-none cursor-pointer flex items-center justify-between text-[#413634]"
              >
                <span>GT-DEV-00000853 (Galaxy S24 Ultra - Amber)</span>
                <span className="text-[10px] text-[#8b6c58] uppercase">Electronics</span>
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

        {/* Live Backend API Connection Status */}
        <div className="relative">
          <button
            onClick={() => setShowApiModal(!showApiModal)}
            className={`px-2.5 py-1.5 text-xs border flex items-center gap-2 transition-all ${
              backendStatus.status === 'connected'
                ? 'bg-[#edf6f0] border-[#2e6b4d] text-[#2e6b4d]'
                : backendStatus.status === 'checking'
                ? 'bg-[#faf3dc] border-[#b87428] text-[#b87428]'
                : 'bg-[#fdf2f1] border-[#b84a44] text-[#b84a44]'
            }`}
            title="Azure Backend API Status (click to test/view details)"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              backendStatus.status === 'connected'
                ? 'bg-[#2e6b4d] animate-pulse'
                : backendStatus.status === 'checking'
                ? 'bg-[#b87428]'
                : 'bg-[#b84a44]'
            }`} />
            <span className="font-mono text-[11px] font-semibold hidden md:inline">
              {backendStatus.status === 'connected'
                ? `Backend: Live (${backendStatus.latencyMs}ms)`
                : backendStatus.status === 'checking'
                ? 'Backend: Connecting...'
                : 'Backend: Offline'}
            </span>
          </button>

          {showApiModal && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-[#fffcf8] border border-[#413634] shadow-xl z-50 p-4 space-y-3 font-serif-vintage">
              <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
                <div className="flex items-center gap-1.5">
                  <Server size={15} className="text-[#c5716d]" />
                  <span className="text-xs uppercase font-medium text-[#413634] tracking-wide">
                    Azure Backend API Link
                  </span>
                </div>
                <button onClick={() => setShowApiModal(false)} className="text-[#666666] hover:text-[#413634]">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#666666]">Host:</span>
                  <a
                    href={BACKEND_ROOT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[#c5716d] flex items-center gap-1 hover:underline truncate max-w-[220px]"
                  >
                    <span>{BACKEND_ROOT}</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#666666]">Liveness Check:</span>
                  <span className="font-mono font-medium">
                    {backendStatus.status === 'connected' ? '200 OK (Healthy)' : backendStatus.status === 'checking' ? 'Testing...' : 'Unreachable'}
                  </span>
                </div>
                {backendStatus.latencyMs !== undefined && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#666666]">Round-Trip Latency:</span>
                    <span className="font-mono text-[#2e6b4d] font-bold">{backendStatus.latencyMs} ms</span>
                  </div>
                )}
                {backendStatus.readiness?.relational_database && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#666666]">Database:</span>
                    <span className="font-mono text-[#2e6b4d]">{backendStatus.readiness.relational_database.database || 'Connected'}</span>
                  </div>
                )}
                {backendStatus.readiness?.blockchain && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#666666]">Blockchain Adapter:</span>
                    <span className="font-mono text-[#413634]">{backendStatus.readiness.blockchain.status}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#e5e5e5] flex gap-2">
                <button
                  onClick={pingBackend}
                  disabled={backendStatus.status === 'checking'}
                  className="flex-1 btn-vintage-accent text-xs flex items-center justify-center gap-1.5 py-1.5"
                >
                  <RefreshCw size={12} className={backendStatus.status === 'checking' ? 'animate-spin' : ''} />
                  <span>Send Test Ping to Backend</span>
                </button>
              </div>
              <p className="text-[10px] text-[#8b6c58] text-center">
                Open browser DevTools (Inspect $\rightarrow$ Network tab) to inspect requests live.
              </p>
            </div>
          )}
        </div>

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
