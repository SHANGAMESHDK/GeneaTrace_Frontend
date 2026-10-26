import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Droplets,
  ExternalLink,
  ShieldCheck,
  Search,
  ArrowRight,
  PackageCheck
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="text-amber-400" size={24} />
            <span>Global Logistics &amp; Custody Traceability</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Post-manufacturing product lifecycle from packing to transit checkpoints and retail handovers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            {shipments.length} Active Shipments Tracked
          </span>
        </div>
      </div>

      {/* Visual Lifecycle Banner (Infographic Section 10) */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 text-xs font-mono">
          <span className="text-amber-400 uppercase font-semibold">End-to-End Custody Transfer Flow</span>
          <span className="text-slate-500">ISO 28000 Verified</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">1. Factory</div>
            <div className="font-bold text-slate-200 mt-0.5">Packed Units</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">2. Warehouse</div>
            <div className="font-bold text-slate-200 mt-0.5">Scan &amp; Record</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/50 text-amber-200">
            <div className="text-[10px] text-amber-400">3. Intermodal</div>
            <div className="font-bold mt-0.5">In Transit Cargo</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">4. Checkpoint</div>
            <div className="font-bold text-slate-200 mt-0.5">Munich Gateway</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">5. Retailer</div>
            <div className="font-bold text-slate-200 mt-0.5">Distributor POS</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] text-slate-500">6. Customer</div>
            <div className="font-bold text-slate-200 mt-0.5">Scan Authenticity</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Shipments List & Selected Shipment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shipment Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shipment ID or destination..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto">
              {filteredShipments.map(s => {
                const isSelected = activeShipment?.shipmentId === s.shipmentId;
                const carriesFlagged = s.productIds.includes('GT-DEV-00000851');

                return (
                  <div
                    key={s.shipmentId}
                    onClick={() => setSelectedShipmentId(s.shipmentId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500/80 shadow-md shadow-amber-950/30'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white">{s.shipmentId}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                          s.currentStatus === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {s.currentStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 truncate">{s.destination}</p>

                    <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between font-mono">
                      <span>{s.carrier.split(' ')[0]} Priority</span>
                      <span>{s.productIds.length} Products</span>
                    </div>

                    {carriesFlagged && (
                      <div className="mt-2 text-[10px] text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30 font-mono">
                        Contains Flagged GT-DEV-00000851
                      </div>
                    )}
                  </div>
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
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white font-mono">{activeShipment.shipmentId}</h2>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                        {activeShipment.currentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Carrier: <strong className="text-slate-200">{activeShipment.carrier}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSimulateNextScan}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <PackageCheck size={14} />
                      <span>Simulate Transit Scan</span>
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500">Origin Facility:</span>
                    <p className="text-white font-medium mt-0.5">{activeShipment.origin}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Destination Hub:</span>
                    <p className="text-white font-medium mt-0.5">{activeShipment.destination}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Temperature Sensor:</span>
                    <p className="text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                      <Thermometer size={13} />
                      <span>{activeShipment.temperature || '21.4 °C'}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Humidity Sensor:</span>
                    <p className="text-cyan-400 font-bold mt-0.5 flex items-center gap-1">
                      <Droplets size={13} />
                      <span>{activeShipment.humidity || '44% RH'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkpoints Timeline */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white">Cryptographic Checkpoint Scan History</h3>
                <div className="space-y-3">
                  {activeShipment.checkpoints.map((cp, idx) => (
                    <div
                      key={cp.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                        cp.status === 'Completed'
                          ? 'bg-slate-950/60 border-slate-800'
                          : cp.status === 'Current'
                          ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                          : 'bg-slate-950/30 border-slate-800/40 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white">{cp.name}</span>
                          <div className="text-[11px] text-slate-400 mt-0.5">{cp.location}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-semibold ${
                            cp.status === 'Completed'
                              ? 'text-emerald-400'
                              : cp.status === 'Current'
                              ? 'text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {cp.status}
                        </span>
                        <div className="text-[10px] text-slate-500">{cp.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Associated Products Inside */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-semibold text-white">
                  Smartphones Carried in Cargo Manifest ({activeShipment.productIds.length} units)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeShipment.productIds.map(pid => (
                    <button
                      key={pid}
                      onClick={() => navigate(`/passport/${pid}`)}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-1.5 transition-colors ${
                        pid === 'GT-DEV-00000851'
                          ? 'bg-red-950/40 border-red-500/50 text-red-200 font-bold hover:bg-red-900/50'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{pid}</span>
                      <ExternalLink size={10} />
                    </button>
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
