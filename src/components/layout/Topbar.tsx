import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  ExternalLink,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  X,
  Server,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api, BackendHealth, BACKEND_ROOT } from '../../services/apiClient';

interface TopbarProps {
  collapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
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
      desc: 'Display component ABC-0042 isolated. Finished smartphone GT-DEV-00000851 flagged.',
      type: 'critical',
      time: '12m ago',
      path: '/recalls'
    },
    {
      id: 'notif-2',
      title: 'Logistics Manifest Alert: GT-SHP-00000326',
      desc: 'Carries affected unit GT-DEV-00000851. Intercept hold active at Munich Gateway.',
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
      className={`fixed top-0 right-0 h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 z-30 transition-all duration-300 ease-in-out flex items-center justify-between px-6 font-sans ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Platform Title Chip */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/70 text-xs font-medium text-slate-700">
          <Sparkles size={13} className="text-blue-600" />
          <span className="hidden sm:inline">
            GeneaTrace Lineage &amp; Digital Product Passport
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-mono font-semibold">
            v1.2 Active
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
              className="w-48 sm:w-64 lg:w-80 pl-9 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Quick Suggestions Dropdown */}
          <AnimatePresence>
            {showSearchDropdown && searchQuery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-11 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 text-xs"
              >
                <div className="flex items-center justify-between px-2.5 py-1 text-slate-400 border-b border-slate-100 mb-1">
                  <span className="text-[10px] uppercase font-semibold tracking-wider">Quick Suggestions</span>
                  <button onClick={() => setShowSearchDropdown(false)} className="text-slate-400 hover:text-slate-700">
                    <X size={12} />
                  </button>
                </div>
                <div
                  onClick={() => {
                    navigate('/passport/GT-DEV-00000851');
                    setShowSearchDropdown(false);
                  }}
                  className="px-2.5 py-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between text-slate-700 transition-colors"
                >
                  <span className="font-medium text-slate-900">GT-DEV-00000851 (Galaxy S24 Ultra)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">Showcase</span>
                </div>
                <div
                  onClick={() => {
                    navigate('/traceability?query=ABC');
                    setShowSearchDropdown(false);
                  }}
                  className="px-2.5 py-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between text-slate-700 transition-colors"
                >
                  <span className="font-medium text-slate-900">Batch ABC (Display Module)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium">Batch</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Backend API Connection Status */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowApiModal(!showApiModal)}
            className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-2 transition-all font-medium ${
              backendStatus.status === 'connected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : backendStatus.status === 'checking'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
            title="Azure Backend API Status (click to test/view details)"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              backendStatus.status === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : backendStatus.status === 'checking'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`} />
            <span className="font-mono text-[11px] hidden md:inline">
              {backendStatus.status === 'connected'
                ? `API Live (${backendStatus.latencyMs}ms)`
                : backendStatus.status === 'checking'
                ? 'Connecting...'
                : 'Offline'}
            </span>
          </motion.button>

          <AnimatePresence>
            {showApiModal && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3 font-sans"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-blue-600" />
                    <span className="text-xs uppercase font-semibold text-slate-900 tracking-wide">
                      Backend API Gateway
                    </span>
                  </div>
                  <button onClick={() => setShowApiModal(false)} className="text-slate-400 hover:text-slate-700">
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Endpoint:</span>
                    <a
                      href={BACKEND_ROOT}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-blue-600 flex items-center gap-1 hover:underline truncate max-w-[220px]"
                    >
                      <span>{BACKEND_ROOT}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Health Probe:</span>
                    <span className="font-mono font-semibold text-emerald-600">
                      {backendStatus.status === 'connected' ? '200 OK (Healthy)' : backendStatus.status === 'checking' ? 'Testing...' : 'Unreachable'}
                    </span>
                  </div>
                  {backendStatus.latencyMs !== undefined && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Round-Trip Latency:</span>
                      <span className="font-mono text-emerald-700 font-bold">{backendStatus.latencyMs} ms</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={pingBackend}
                    disabled={backendStatus.status === 'checking'}
                    className="flex-1 btn-modern-accent text-xs flex items-center justify-center gap-1.5 py-2 rounded-xl"
                  >
                    <RefreshCw size={12} className={backendStatus.status === 'checking' ? 'animate-spin' : ''} />
                    <span>Ping Azure Endpoint</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200/70 text-slate-700 transition-colors relative"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden font-sans"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                      Live Incident Stream
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500 text-white rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        navigate(n.path);
                        setShowNotifications(false);
                      }}
                      className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'critical' ? (
                          <div className="p-1 rounded-lg bg-rose-50 text-rose-600 mt-0.5">
                            <AlertOctagon className="w-4 h-4" />
                          </div>
                        ) : n.type === 'warning' ? (
                          <div className="p-1 rounded-lg bg-amber-50 text-amber-600 mt-0.5">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-slate-900 truncate">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
