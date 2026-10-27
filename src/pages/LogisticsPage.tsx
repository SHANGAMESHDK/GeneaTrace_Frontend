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
  ShieldCheck
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="text-blue-600" size={26} />
            <span>Global Logistics &amp; Custody Traceability</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            End-to-end custody transfer from manufacturing packaging to transit checkpoints and retail handovers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 rounded-full">
            {shipments.length} Active Cargo Stream
          </span>
        </div>
      </div>

      {/* Visual Lifecycle Banner */}
      <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
          <span className="text-blue-600 font-bold uppercase tracking-wider text-[11px]">End-to-End Custody Transfer Flow</span>
          <span className="text-slate-400 font-medium">ISO 28000 Verified</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">1. Factory</div>
            <div className="text-slate-900 font-semibold mt-0.5">Packed Units</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">2. Warehouse</div>
            <div className="text-slate-900 font-semibold mt-0.5">Scan &amp; Record</div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
            <div className="text-[10px] text-blue-600 font-bold uppercase">3. Intermodal</div>
            <div className="text-blue-900 font-bold mt-0.5">In Transit Cargo</div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
            <div className="text-[10px] text-amber-600 font-bold uppercase">4. Checkpoint</div>
            <div className="text-amber-900 font-bold mt-0.5">Munich Gateway</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">5. Retailer</div>
            <div className="text-slate-900 font-semibold mt-0.5">Frankfurt Depot</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">6. Customer</div>
            <div className="text-slate-900 font-semibold mt-0.5">Scan Passport</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Shipments List & Selected Shipment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shipment Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shipment ID or destination..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto">
              {filteredShipments.map(s => {
                const isSelected = activeShipment?.shipmentId === s.shipmentId;
                const carriesFlagged = s.productIds.includes('GT-DEV-00000851');

                return (
                  <motion.div
                    key={s.shipmentId}
                    whileHover={{ y: -1 }}
                    onClick={() => setSelectedShipmentId(s.shipmentId)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                        : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{s.shipmentId}</span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-mono ${
                          s.currentStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {s.currentStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 truncate">{s.destination}</p>

                    <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{s.carrier.split(' ')[0]} Air Express</span>
                      <span className="font-mono">{s.productIds.length} Unit</span>
                    </div>

                    {carriesFlagged && (
                      <div className="mt-2 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 font-mono font-semibold">
                        Contains Flagged GT-DEV-00000851
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
              <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900">{activeShipment.shipmentId}</h2>
                      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                        {activeShipment.currentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Carrier: <strong className="text-slate-800">{activeShipment.carrier}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSimulateNextScan}
                      className="btn-modern-accent text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
                    >
                      <PackageCheck size={14} />
                      <span>Simulate Transit Scan</span>
                    </motion.button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 font-medium">Origin:</span>
                    <p className="text-slate-900 font-semibold mt-0.5 truncate">{activeShipment.origin}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 font-medium">Destination:</span>
                    <p className="text-slate-900 font-semibold mt-0.5 truncate">{activeShipment.destination}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 font-medium">Telemetry Temp:</span>
                    <p className="text-emerald-600 font-bold mt-0.5 flex items-center gap-1 font-mono">
                      <Thermometer size={14} />
                      <span>{activeShipment.temperature || '21.4 °C'}</span>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-slate-400 font-medium">Humidity:</span>
                    <p className="text-blue-600 font-bold mt-0.5 flex items-center gap-1 font-mono">
                      <Droplets size={14} />
                      <span>{activeShipment.humidity || '44% RH'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkpoints Timeline */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Cryptographic Checkpoint Scan History
                </h3>
                <div className="space-y-2.5">
                  {activeShipment.checkpoints.map((cp, idx) => (
                    <motion.div
                      key={cp.id}
                      whileHover={{ scale: 1.005 }}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                        cp.status === 'Completed'
                          ? 'bg-slate-50/70 border-slate-200/80'
                          : cp.status === 'Current'
                          ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-xs'
                          : 'bg-white border-slate-200/50 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          cp.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cp.status === 'Current'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900 font-sans text-sm">{cp.name}</span>
                          <div className="text-[11px] text-slate-500 font-sans mt-0.5">{cp.location}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-semibold ${
                            cp.status === 'Completed'
                              ? 'text-emerald-600'
                              : cp.status === 'Current'
                              ? 'text-amber-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {cp.status}
                        </span>
                        <div className="text-[10px] text-slate-400 font-sans">{cp.timestamp}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Associated Products Inside */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Products In Cargo Manifest ({activeShipment.productIds.length} unit)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeShipment.productIds.map(pid => (
                    <motion.button
                      key={pid}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/passport/${pid}`)}
                      className="px-3.5 py-2 rounded-xl border font-mono text-xs flex items-center gap-2 transition-all bg-rose-50 border-rose-200 text-rose-700 font-bold hover:bg-rose-100"
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
