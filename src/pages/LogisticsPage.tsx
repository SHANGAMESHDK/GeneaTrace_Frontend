import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Droplets,
  ExternalLink,
  Search,
  PackageCheck,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { ShipmentRecord } from '../types';

export const LogisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || 'GT-SHP-00000326';

  const [shipments, setShipments] = useState<ShipmentRecord[]>(GeneaTraceStore.getShipments());
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(initialSearch);
  const [searchTerm, setSearchTerm] = useState('');

  const activeShipment = useMemo(() => {
    return (
      shipments.find(s => s.shipmentId.toUpperCase() === selectedShipmentId.toUpperCase()) ||
      shipments[0]
    );
  }, [shipments, selectedShipmentId]);

  const filteredShipments = useMemo(() => {
    if (!searchTerm) return shipments;
    return shipments.filter(
      s =>
        s.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.carrier.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shipments, searchTerm]);

  const handleSimulateNextScan = () => {
    if (!activeShipment) return;
    const pendingIdx = activeShipment.checkpoints.findIndex(c => c.status === 'Pending');
    if (pendingIdx !== -1) {
      activeShipment.checkpoints[pendingIdx].status = 'Completed';
      activeShipment.checkpoints[pendingIdx].timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
      GeneaTraceStore.saveState();
      setShipments([...GeneaTraceStore.getShipments()]);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] flex items-center justify-center text-[#120a07] font-bold shadow-md shadow-[#b85d38]/20">
              <Truck size={20} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
                <span>Global Logistics &amp; Custody Traceability</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#cbb5aa] mt-0.5">
                End-to-end custody transfer from cleanroom packaging to intermodal transit checkpoints and authorized retail handovers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-[#e89d7b]/15 border border-[#d9825b]/30 text-xs font-semibold text-[#f7d5c5] rounded-full font-mono flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{shipments.length} Active Cargo Stream</span>
          </span>
        </div>
      </div>

      {/* Visual Lifecycle Banner */}
      <div className="p-5 bg-[#140c08]/85 backdrop-blur-md border border-[#d9825b]/25 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs">
          <span className="text-[#e89d7b] font-mono font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Layers size={14} />
            <span>End-to-End Custody Transfer Flow</span>
          </span>
          <span className="text-[#a69489] font-mono text-[11px]">ISO 28000 &amp; GS1 EPCIS Verified</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center text-xs">
          <div className="p-3 bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl">
            <div className="text-[10px] text-[#a69489] font-mono uppercase">1. Factory</div>
            <div className="text-white font-semibold mt-0.5">Packed Units</div>
          </div>
          <div className="p-3 bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl">
            <div className="text-[10px] text-[#a69489] font-mono uppercase">2. Warehouse</div>
            <div className="text-white font-semibold mt-0.5">Scan &amp; Record</div>
          </div>
          <div className="p-3 bg-[#e89d7b]/15 border border-[#d9825b]/30 rounded-2xl text-[#f7d5c5]">
            <div className="text-[10px] text-[#e89d7b] font-mono font-bold uppercase">3. Intermodal</div>
            <div className="text-white font-bold mt-0.5">In Transit Cargo</div>
          </div>
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-200">
            <div className="text-[10px] text-amber-400 font-mono font-bold uppercase">4. Air Cargo</div>
            <div className="text-white font-bold mt-0.5">Incheon Transit</div>
          </div>
          <div className="p-3 bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl">
            <div className="text-[10px] text-[#a69489] font-mono uppercase">5. Retailer</div>
            <div className="text-white font-semibold mt-0.5">Indiranagar Hub</div>
          </div>
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-200">
            <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">6. Customer</div>
            <div className="text-white font-bold mt-0.5">Vikram Malhotra</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Shipments List & Selected Shipment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shipment Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-[#140c08]/85 backdrop-blur-md border border-[#d9825b]/25 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shipment ID or destination..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#120a07] border border-[#d9825b]/30 rounded-xl text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#e89d7b] focus:ring-1 focus:ring-[#e89d7b]/40 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-[#a69489] absolute left-3 top-3" />
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredShipments.map(s => {
                const isSelected = activeShipment?.shipmentId === s.shipmentId;
                const carriesShowcase = s.productIds.includes('AAA12345678') || s.productIds.includes('GT-DEV-00000851');

                return (
                  <motion.div
                    key={s.shipmentId}
                    whileHover={{ y: -1 }}
                    onClick={() => setSelectedShipmentId(s.shipmentId)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#d9825b]/25 to-[#b85d38]/20 border-[#e89d7b] shadow-md shadow-[#b85d38]/20'
                        : 'bg-[#1c120d]/80 border-[#d9825b]/15 hover:bg-[#251812] hover:border-[#d9825b]/35'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white">{s.shipmentId}</span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-mono ${
                          s.currentStatus === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {s.currentStatus}
                      </span>
                    </div>

                    <p className="text-xs text-[#cbb5aa] mt-1.5 truncate">{s.destination}</p>

                    <div className="mt-2 text-[11px] text-[#a69489] flex items-center justify-between">
                      <span>{s.carrier.split(' ')[0]} Air Express</span>
                      <span className="font-mono text-[#f7d5c5]">{s.productIds.length} Unit</span>
                    </div>

                    {carriesShowcase && (
                      <div className="mt-2 text-[10px] text-[#f0a887] bg-[#e89d7b]/15 px-2.5 py-1 rounded-lg border border-[#e89d7b]/30 font-mono font-semibold">
                        Showcase: AAA12345678 (Samsung A55)
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Shipment Detail & Custody Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {activeShipment && (
            <>
              {/* Shipment Header Card */}
              <div className="p-6 bg-[#140c08]/85 backdrop-blur-md border border-[#d9825b]/25 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-serif font-bold text-white">{activeShipment.shipmentId}</h2>
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold font-mono">
                        {activeShipment.currentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#cbb5aa] mt-1">
                      Carrier: <strong className="text-white">{activeShipment.carrier}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSimulateNextScan}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d9825b] to-[#b85d38] hover:from-[#e89d7b] hover:to-[#c67651] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#b85d38]/20 transition-all cursor-pointer"
                    >
                      <PackageCheck size={14} />
                      <span>Simulate Transit Scan</span>
                    </motion.button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 bg-[#1c120d]/80 rounded-2xl border border-white/10">
                    <span className="text-[#a69489] font-medium">Origin:</span>
                    <p className="text-white font-semibold mt-0.5 truncate">{activeShipment.origin}</p>
                  </div>
                  <div className="p-3.5 bg-[#1c120d]/80 rounded-2xl border border-white/10">
                    <span className="text-[#a69489] font-medium">Destination:</span>
                    <p className="text-white font-semibold mt-0.5 truncate">{activeShipment.destination}</p>
                  </div>
                  <div className="p-3.5 bg-[#1c120d]/80 rounded-2xl border border-white/10">
                    <span className="text-[#a69489] font-medium">Telemetry Temp:</span>
                    <p className="text-emerald-400 font-bold mt-0.5 flex items-center gap-1 font-mono">
                      <Thermometer size={14} />
                      <span>{activeShipment.temperature || '21.4 °C'}</span>
                    </p>
                  </div>
                  <div className="p-3.5 bg-[#1c120d]/80 rounded-2xl border border-white/10">
                    <span className="text-[#a69489] font-medium">Humidity:</span>
                    <p className="text-[#38bdf8] font-bold mt-0.5 flex items-center gap-1 font-mono">
                      <Droplets size={14} />
                      <span>{activeShipment.humidity || '44% RH'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkpoints Timeline */}
              <div className="p-6 bg-[#140c08]/85 backdrop-blur-md border border-[#d9825b]/25 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-4">
                <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#e89d7b]" />
                  <span>Cryptographic Checkpoint Scan History</span>
                </h3>

                <div className="space-y-2.5">
                  {activeShipment.checkpoints.map((cp, idx) => (
                    <motion.div
                      key={cp.id}
                      whileHover={{ scale: 1.005 }}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-mono transition-all ${
                        cp.status === 'Completed'
                          ? 'bg-[#1c120d]/80 border-white/10'
                          : cp.status === 'Current'
                          ? 'bg-amber-500/15 border-amber-400/40 text-amber-200 shadow-sm'
                          : 'bg-[#120a07]/50 border-white/5 text-[#a69489]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          cp.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : cp.status === 'Current'
                            ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                            : 'bg-white/5 text-[#a69489]'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-white font-sans text-sm">{cp.name}</span>
                          <div className="text-[11px] text-[#cbb5aa] font-sans mt-0.5">{cp.location}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-semibold ${
                            cp.status === 'Completed'
                              ? 'text-emerald-400'
                              : cp.status === 'Current'
                              ? 'text-amber-300'
                              : 'text-[#a69489]'
                          }`}
                        >
                          {cp.status}
                        </span>
                        <div className="text-[10px] text-[#a69489] font-sans">{cp.timestamp}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Associated Products Inside */}
              <div className="p-6 bg-[#140c08]/85 backdrop-blur-md border border-[#d9825b]/25 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-3">
                <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-[#e89d7b]" />
                  <span>Products In Cargo Manifest ({activeShipment.productIds.length} unit)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeShipment.productIds.map(pid => (
                    <motion.button
                      key={pid}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/passport/${pid}`)}
                      className="px-3.5 py-2 rounded-xl border border-[#d9825b]/30 font-mono text-xs flex items-center gap-2 transition-all bg-[#1c120d]/80 text-[#f7d5c5] font-bold hover:bg-[#251812] hover:border-[#e89d7b]/50 cursor-pointer"
                    >
                      <span>{pid}</span>
                      <ExternalLink size={12} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
