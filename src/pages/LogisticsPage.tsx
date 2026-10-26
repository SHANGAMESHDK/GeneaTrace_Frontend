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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#155477] pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[#D9F5F7] flex items-center gap-2">
            <Truck className="text-[#86BFCF]" size={22} />
            <span>Global Logistics &amp; Custody Traceability</span>
          </h1>
          <p className="text-xs text-[#86BFCF] font-serif mt-1">
            Post-manufacturing product lifecycle from packing to transit checkpoints and retail handovers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-[#073451] border border-[#155477] text-xs font-serif text-[#D9F5F7]">
            {shipments.length} Active Shipments Tracked
          </span>
        </div>
      </div>

      {/* Visual Lifecycle Banner */}
      <div className="p-4 vintage-card">
        <div className="flex items-center justify-between pb-3 border-b border-[#155477] mb-3 text-xs font-serif">
          <span className="text-[#D9F5F7] uppercase tracking-wider">End-to-End Custody Transfer Flow</span>
          <span className="text-[#54ACBF]">ISO 28000 Verified</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-serif">
          <div className="p-2.5 bg-[#011C40] border border-[#155477]">
            <div className="text-[10px] text-[#54ACBF]">1. Factory</div>
            <div className="text-[#D9F5F7] mt-0.5">Packed Units</div>
          </div>
          <div className="p-2.5 bg-[#011C40] border border-[#155477]">
            <div className="text-[10px] text-[#54ACBF]">2. Warehouse</div>
            <div className="text-[#D9F5F7] mt-0.5">Scan &amp; Record</div>
          </div>
          <div className="p-2.5 bg-[#073451] border border-[#86BFCF] text-[#D9F5F7]">
            <div className="text-[10px] text-[#86BFCF]">3. Intermodal</div>
            <div className="text-[#D9F5F7] font-bold mt-0.5">In Transit Cargo</div>
          </div>
          <div className="p-2.5 bg-[#011C40] border border-[#155477]">
            <div className="text-[10px] text-[#54ACBF]">4. Checkpoint</div>
            <div className="text-[#D9F5F7] mt-0.5">Munich Gateway</div>
          </div>
          <div className="p-2.5 bg-[#011C40] border border-[#155477]">
            <div className="text-[10px] text-[#54ACBF]">5. Retailer</div>
            <div className="text-[#D9F5F7] mt-0.5">Distributor POS</div>
          </div>
          <div className="p-2.5 bg-[#011C40] border border-[#155477]">
            <div className="text-[10px] text-[#54ACBF]">6. Customer</div>
            <div className="text-[#D9F5F7] mt-0.5">Scan Authenticity</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Shipments List & Selected Shipment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shipment Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 vintage-card space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search shipment ID or destination..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#011C40] border border-[#155477] rounded-none text-xs text-[#D9F5F7] font-mono focus:outline-none focus:border-[#86BFCF]"
              />
              <Search className="w-3.5 h-3.5 text-[#86BFCF] absolute left-2.5 top-2.5" />
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto">
              {filteredShipments.map(s => {
                const isSelected = activeShipment?.shipmentId === s.shipmentId;
                const carriesFlagged = s.productIds.includes('GT-DEV-00000851');

                return (
                  <div
                    key={s.shipmentId}
                    onClick={() => setSelectedShipmentId(s.shipmentId)}
                    className={`p-3 border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#073451] border-[#86BFCF]'
                        : 'bg-[#062B49] border-[#155477] hover:border-[#86BFCF]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#D9F5F7]">{s.shipmentId}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 border font-mono ${
                          s.currentStatus === 'Delivered'
                            ? 'bg-[#1B2D22] text-[#86D6A6] border-[#2D543B]'
                            : 'bg-[#33281C] text-[#E8BC7A] border-[#5E4826]'
                        }`}
                      >
                        {s.currentStatus}
                      </span>
                    </div>

                    <p className="text-xs text-[#86BFCF] font-serif mt-1 truncate">{s.destination}</p>

                    <div className="mt-2 text-[10px] text-[#54ACBF] flex items-center justify-between font-serif">
                      <span>{s.carrier.split(' ')[0]} Priority</span>
                      <span className="font-mono text-[#86BFCF]">{s.productIds.length} Products</span>
                    </div>

                    {carriesFlagged && (
                      <div className="mt-2 text-[10px] text-[#F08C8A] bg-[#2D1C22] px-2 py-0.5 border border-[#5A2C35] font-mono">
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
              <div className="p-5 vintage-card space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#155477]">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-normal font-serif text-[#D9F5F7]">{activeShipment.shipmentId}</h2>
                      <span className="px-2 py-0.5 bg-[#073451] text-[#D9F5F7] border border-[#155477] text-xs font-serif">
                        {activeShipment.currentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#86BFCF] font-serif mt-1">
                      Carrier: <strong className="text-[#D9F5F7]">{activeShipment.carrier}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSimulateNextScan}
                      className="btn-vintage-accent text-xs py-1.5 px-3 flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      <PackageCheck size={13} />
                      <span>Simulate Transit Scan</span>
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-serif">
                  <div>
                    <span className="text-[#54ACBF]">Origin Facility:</span>
                    <p className="text-[#D9F5F7] mt-0.5">{activeShipment.origin}</p>
                  </div>
                  <div>
                    <span className="text-[#54ACBF]">Destination Hub:</span>
                    <p className="text-[#D9F5F7] mt-0.5">{activeShipment.destination}</p>
                  </div>
                  <div>
                    <span className="text-[#54ACBF]">Temperature Sensor:</span>
                    <p className="text-[#86D6A6] font-bold mt-0.5 flex items-center gap-1 font-mono">
                      <Thermometer size={13} />
                      <span>{activeShipment.temperature || '21.4 °C'}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[#54ACBF]">Humidity Sensor:</span>
                    <p className="text-[#86BFCF] font-bold mt-0.5 flex items-center gap-1 font-mono">
                      <Droplets size={13} />
                      <span>{activeShipment.humidity || '44% RH'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkpoints Timeline */}
              <div className="p-5 vintage-card space-y-4">
                <h3 className="text-sm font-normal font-serif text-[#D9F5F7]">Cryptographic Checkpoint Scan History</h3>
                <div className="space-y-3">
                  {activeShipment.checkpoints.map((cp, idx) => (
                    <div
                      key={cp.id}
                      className={`p-3 border flex items-center justify-between text-xs font-mono transition-all ${
                        cp.status === 'Completed'
                          ? 'bg-[#011C40] border-[#155477]'
                          : cp.status === 'Current'
                          ? 'bg-[#073451] border-[#86BFCF] text-[#D9F5F7]'
                          : 'bg-[#011C40] border-[#155477] text-[#54ACBF]/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-[#073451] border border-[#155477] flex items-center justify-center font-bold text-[10px] text-[#D9F5F7]">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-normal font-serif text-sm text-[#D9F5F7]">{cp.name}</span>
                          <div className="text-[11px] text-[#86BFCF] font-serif mt-0.5">{cp.location}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-semibold ${
                            cp.status === 'Completed'
                              ? 'text-[#86D6A6]'
                              : cp.status === 'Current'
                              ? 'text-[#E8BC7A]'
                              : 'text-[#54ACBF]/60'
                          }`}
                        >
                          {cp.status}
                        </span>
                        <div className="text-[10px] text-[#54ACBF]">{cp.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Associated Products Inside */}
              <div className="p-5 vintage-card space-y-3">
                <h3 className="text-sm font-normal font-serif text-[#D9F5F7]">
                  Products Carried in Cargo Manifest ({activeShipment.productIds.length} units)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeShipment.productIds.map(pid => (
                    <button
                      key={pid}
                      onClick={() => navigate(`/passport/${pid}`)}
                      className={`px-3 py-1.5 border font-mono text-xs flex items-center gap-1.5 transition-colors ${
                        pid === 'GT-DEV-00000851'
                          ? 'bg-[#2D1C22] border-[#5A2C35] text-[#F08C8A] font-bold hover:bg-[#3d232c]'
                          : 'bg-[#011C40] border-[#155477] text-[#D9F5F7] hover:bg-[#073451]'
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
