import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Truck,
  AlertTriangle,
  Blocks,
  Copy,
  ExternalLink,
  CheckCircle2,
  BatteryCharging,
  HeartPulse,
  Plane,
  Leaf,
  Scale,
  Award
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { formatAddress } from '../utils/hashing';

export const PassportPage: React.FC = () => {
  const { productId: paramProductId } = useParams();
  const navigate = useNavigate();
  const productId = paramProductId || 'GT-DEV-00000851';

  const [viewMode, setViewMode] = useState<'internal' | 'public'>('internal');
  const [copied, setCopied] = useState(false);

  const product = GeneaTraceStore.getProduct(productId) || GeneaTraceStore.getProduct('GT-DEV-00000851')!;
  const events = GeneaTraceStore.getEventsForEntity(product.productId);
  const shipment = GeneaTraceStore.getShipment(product.shipmentId);

  const passportUrl = `${window.location.origin}/passport/${productId}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRecallFlagged = product.status === 'Recall Flagged';

  // Sector preset buttons
  const sectorPresets = [
    { id: 'GT-DEV-00000851', label: '📱 Smartphone (Galaxy S24)', sector: 'Consumer Electronics' },
    { id: 'GT-EVB-00094120', label: '🚗 800V EV Battery Pack (EU Battery DPP)', sector: 'Automotive & EV Battery' },
    { id: 'GT-MED-00041289', label: '🩺 Cardiac Implant (FDA UDI)', sector: 'Medical Technology' },
    { id: 'GT-AVN-00018902', label: '🛰️ Avionics Controller (FAA DO-254)', sector: 'Industrial & Aerospace' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner if Recalled */}
      {isRecallFlagged && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-950/40">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400 shrink-0" size={20} />
            <div>
              <span className="font-bold text-sm text-red-200">DPP Precision Recall Flag Active</span>
              <p className="text-xs text-red-300/80">
                This unit carries Display serial <strong className="font-mono text-white">{product.installedComponents['Display Module']}</strong> from defective Batch ABC.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/recalls')}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
          >
            Inspect Recall Action
          </button>
        </div>
      )}

      {/* Cross-Sector Showcase Switcher */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
          Multi-Industry DPP Showcase:
        </span>
        <div className="flex flex-wrap gap-2">
          {sectorPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => navigate(`/passport/${preset.id}`)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                product.productId === preset.id
                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header and View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <QrCode className="text-cyan-400" size={24} />
              <span>Digital Product Passport (DPP)</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {product.sector}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Immutable blockchain-linked passport compliant with European ESPR, Battery Regulation, and FDA UDI standards.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setViewMode('internal')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'internal'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Authorized Engineering View
          </button>
          <button
            onClick={() => setViewMode('public')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'public'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Public Consumer / Customs View
          </button>
        </div>
      </div>

      {/* Main Grid: Left Device Showcase & QR, Right Passport Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Device Card & QR Code */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4 shadow-xl">
            {/* Visual Header / Sector Badge */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">{product.productTypeDisplay}</span>
              <span className="text-cyan-400 font-bold">DPP PASS #24</span>
            </div>

            {/* Photo / Graphic */}
            <div className="relative mx-auto w-44 h-56 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 flex flex-col items-center justify-center p-3 group shadow-2xl">
              {product.sector === 'Consumer Electronics' ? (
                <img
                  src="/s24ultra.jpg"
                  alt={product.productModel}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : product.sector === 'Automotive & EV Battery' ? (
                <div className="flex flex-col items-center justify-center text-amber-400 space-y-3">
                  <BatteryCharging size={54} className="animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white text-center">800V 96kWh PACK</span>
                  <span className="text-[10px] text-amber-300 font-mono">EU Battery Passport 2023/1542</span>
                </div>
              ) : product.sector === 'Medical Technology' ? (
                <div className="flex flex-col items-center justify-center text-emerald-400 space-y-3">
                  <HeartPulse size={54} className="animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white text-center">CardioPulse Implant</span>
                  <span className="text-[10px] text-emerald-300 font-mono">FDA UDI Class III Sterile</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-indigo-400 space-y-3">
                  <Plane size={54} className="animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white text-center">Avionics DO-254</span>
                  <span className="text-[10px] text-indigo-300 font-mono">Flight Controller DAL-A</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 text-left pointer-events-none">
                <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">{product.sector}</span>
                <p className="text-xs font-bold text-white leading-tight truncate">{product.productModel}</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <div className="p-2 rounded-lg bg-white shadow-md">
                <QRCodeSVG value={passportUrl} size={130} level="H" includeMargin />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-white">Scan for Official Blockchain Proof</span>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{product.productId}</p>
              </div>
              <button
                onClick={() => copyToClipboard(passportUrl)}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy size={12} />
                <span>{copied ? 'URL Copied!' : 'Copy DPP Shareable URL'}</span>
              </button>
            </div>

            {/* Quick Identification */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Unique ID:</span>
                <span className="text-white font-bold">{product.productId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Identifier / UDI:</span>
                <span className="text-cyan-400 truncate max-w-[170px]">{product.imeiMasked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assembly Hub:</span>
                <span className="text-slate-300 truncate max-w-[170px]">{product.assemblyFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipment Ref:</span>
                <button
                  onClick={() => navigate(`/logistics?search=${product.shipmentId}`)}
                  className="text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>{product.shipmentId}</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Comprehensive Lineage Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          {/* ESG & Compliance Metric Banner */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Award className="text-cyan-400" size={16} />
                <span>Regulatory Compliance &amp; Sustainability Passport (ESPR &amp; EU Battery Directive)</span>
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">{product.esgScore}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 flex items-center gap-1">
                  <Leaf size={12} className="text-emerald-400" />
                  <span>Carbon Footprint:</span>
                </span>
                <p className="text-sm font-bold text-white mt-1">{product.carbonFootprintKg} kg CO₂e</p>
                <span className="text-[10px] text-slate-500">Lifecycle Scope 1-3</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 flex items-center gap-1">
                  <Scale size={12} className="text-cyan-400" />
                  <span>Recycled Content:</span>
                </span>
                <p className="text-sm font-bold text-cyan-400 mt-1">{product.recycledContentPct}% Verified</p>
                <span className="text-[10px] text-slate-500">Critical Raw Materials</span>
              </div>

              {product.batteryChemistry && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500">Chemistry:</span>
                  <p className="text-sm font-bold text-amber-400 mt-1 truncate">{product.batteryChemistry}</p>
                  <span className="text-[10px] text-slate-500">State of Health: {product.stateOfHealth}%</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Compliance Directives:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.complianceStandards?.map(std => (
                    <span key={std} className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 text-[9px] border border-slate-800">
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Installed Components BOM with Serial Numbers */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Bill of Materials (BOM) Component Lineage</h3>
                <p className="text-xs text-slate-400">
                  Every sub-assembly is registered with its source batch and individual unit serial number.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">{Object.keys(product.installedComponents).length} Modules</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              {Object.entries(product.installedComponents).map(([moduleName, serial]) => {
                const isDefectiveDisplay = serial === 'ABC-0042' || serial.startsWith('ABC-');
                return (
                  <div
                    key={moduleName}
                    className={`p-3 rounded-xl border transition-all ${
                      isDefectiveDisplay
                        ? 'bg-red-950/30 border-red-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span>{moduleName}</span>
                      <span className={`text-[10px] font-bold ${isDefectiveDisplay ? 'text-red-400' : 'text-cyan-400'}`}>
                        {isDefectiveDisplay ? 'Flagged Batch ABC' : 'Verified'}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1">{serial}</div>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
                      <span>Cryptographic Attestation</span>
                      <button
                        onClick={() => navigate(`/traceability?query=${serial}`)}
                        className="text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Trace</span>
                        <ExternalLink size={9} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manufacturing Operations Timeline */}
          {viewMode === 'internal' && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Assembly &amp; Quality Inspection Ledger</h3>
                  <p className="text-xs text-slate-400">
                    Chronological verification events recorded by MES &amp; SCADA gateways.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>100% Operations Logged</span>
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {events.map(e => (
                  <div
                    key={e.eventId}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px]">{e.operationId}</span>
                      <div>
                        <span className="font-bold text-white">{e.operationName}</span>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Station: {e.machineId} • Operator: {e.operator}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">{e.result}</span>
                      <div className="text-[10px] text-slate-500">{e.completionTimestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cryptographic Proof Verification Block */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-2">
                <Blocks size={15} className="text-violet-400" />
                <span>Merkle-DAG Integrity &amp; Demo Ledger Anchor</span>
              </span>
              <span className="text-[11px] text-violet-400">EVM Smart Contract</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Root Merkle Hash:</span>
                <span className="text-slate-300 font-bold truncate max-w-[280px] sm:max-w-none">{product.merkleRoot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Anchor Transaction ID:</span>
                <span className="text-cyan-400 truncate max-w-[280px] sm:max-w-none">{product.blockchainTx}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consensus Verification:</span>
                <span className="text-emerald-400 font-bold">12/12 Enterprise Validator Nodes Confirmed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
