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

export const PassportPage: React.FC = () => {
  const { productId: paramProductId } = useParams();
  const navigate = useNavigate();
  const productId = paramProductId || 'GT-DEV-00000851';

  const [viewMode, setViewMode] = useState<'internal' | 'public'>('internal');
  const [copied, setCopied] = useState(false);

  const product = GeneaTraceStore.getProduct(productId) || GeneaTraceStore.getProduct('GT-DEV-00000851')!;
  const events = GeneaTraceStore.getEventsForEntity(product.productId);

  const passportUrl = `${window.location.origin}/passport/${productId}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRecallFlagged = product.status === 'Recall Flagged';

  const sectorPresets = [
    { id: 'GT-DEV-00000851', label: '📱 Smartphone (Galaxy S24)', sector: 'Consumer Electronics' },
    { id: 'GT-EVB-00094120', label: '🚗 800V EV Battery (EU Battery DPP)', sector: 'Automotive & EV Battery' },
    { id: 'GT-MED-00041289', label: '🩺 Cardiac Implant (FDA UDI)', sector: 'Medical Technology' },
    { id: 'GT-AVN-00018902', label: '🛰️ Avionics Controller (FAA DO-254)', sector: 'Industrial & Aerospace' },
  ];

  return (
    <div className="space-y-6 font-serif-vintage">
      {/* Top Banner if Recalled */}
      {isRecallFlagged && (
        <div className="p-4 bg-[#2D1C22] border border-[#5A2C35] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-[#F08C8A] shrink-0" size={18} />
            <div>
              <span className="font-normal text-sm text-[#E2DDE7]">DPP Precision Recall Flag Active</span>
              <p className="text-xs text-[#AAA2B3]">
                This unit carries Display serial <strong className="font-mono text-[#F08C8A]">{product.installedComponents['Display Module']}</strong> from defective Batch ABC.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/recalls')}
            className="btn-vintage-accent"
          >
            Inspect Recall Action
          </button>
        </div>
      )}

      {/* Cross-Sector Showcase Switcher */}
      <div className="p-3 vintage-card-secondary flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wider text-[#AAA2B3]">
          Multi-Industry DPP Showcase:
        </span>
        <div className="flex flex-wrap gap-2">
          {sectorPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => navigate(`/passport/${preset.id}`)}
              className={`px-3 py-1.5 text-xs transition-all ${
                product.productId === preset.id
                  ? 'btn-vintage-accent'
                  : 'btn-vintage-outline'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header and View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#45404F]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl text-[#E2DDE7] flex items-center gap-2">
              <QrCode className="text-[#AAA2B3]" size={22} />
              <span>Digital Product Passport (DPP)</span>
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono bg-[#292531] text-[#E2DDE7] border border-[#45404F]">
              {product.sector}
            </span>
          </div>
          <p className="text-xs text-[#AAA2B3] mt-0.5">
            Cryptographic identity, immutable component lineage, and lifecycle passport.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-0.5 bg-[#292531] border border-[#45404F] text-xs">
          <button
            onClick={() => setViewMode('internal')}
            className={`px-3 py-1 transition-all ${
              viewMode === 'internal'
                ? 'bg-[#E2DDE7] text-[#17151C] font-medium'
                : 'text-[#AAA2B3] hover:text-[#E2DDE7]'
            }`}
          >
            Authorized Engineering View
          </button>
          <button
            onClick={() => setViewMode('public')}
            className={`px-3 py-1 transition-all ${
              viewMode === 'public'
                ? 'bg-[#E2DDE7] text-[#17151C] font-medium'
                : 'text-[#AAA2B3] hover:text-[#E2DDE7]'
            }`}
          >
            Public Consumer View
          </button>
        </div>
      </div>

      {/* Main Grid: Left Showcase & QR, Right Lineage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Device Card & QR Code */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 vintage-card text-center space-y-4">
            <div className="p-2.5 bg-[#292531] border border-[#45404F] flex items-center justify-between text-xs font-mono">
              <span className="text-[#AAA2B3]">{product.productTypeDisplay}</span>
              <span className="text-[#E2DDE7]">PASSPORT v2.4</span>
            </div>

            {/* Photo / Graphic Container */}
            <div className="relative mx-auto w-44 h-56 border border-[#45404F] bg-[#17151C] flex flex-col items-center justify-center p-3 group overflow-hidden">
              {product.sector === 'Consumer Electronics' ? (
                <img
                  src="/s24ultra.jpg"
                  alt={product.productModel}
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : product.sector === 'Automotive & EV Battery' ? (
                <div className="flex flex-col items-center justify-center text-[#E8BC7A] space-y-3">
                  <BatteryCharging size={48} />
                  <span className="text-xs font-mono text-[#E2DDE7] text-center">800V 96kWh PACK</span>
                  <span className="text-[10px] text-[#716879] font-mono">EU Battery 2023/1542</span>
                </div>
              ) : product.sector === 'Medical Technology' ? (
                <div className="flex flex-col items-center justify-center text-[#86D6A6] space-y-3">
                  <HeartPulse size={48} />
                  <span className="text-xs font-mono text-[#E2DDE7] text-center">CardioPulse Implant</span>
                  <span className="text-[10px] text-[#716879] font-mono">FDA UDI Class III Sterile</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-[#9FBAD8] space-y-3">
                  <Plane size={48} />
                  <span className="text-xs font-mono text-[#E2DDE7] text-center">Avionics DO-254</span>
                  <span className="text-[10px] text-[#716879] font-mono">Flight Controller DAL-A</span>
                </div>
              )}
            </div>

            {/* QR Code Section */}
            <div className="p-4 bg-[#292531] border border-[#45404F] flex flex-col items-center justify-center space-y-3">
              <div className="p-2 bg-white border border-[#45404F]">
                <QRCodeSVG value={passportUrl} size={120} level="H" includeMargin />
              </div>
              <div className="text-center">
                <span className="text-xs text-[#E2DDE7]">Scan for Official Proof</span>
                <p className="text-[10px] text-[#716879] font-mono mt-0.5">{product.productId}</p>
              </div>
              <button
                onClick={() => copyToClipboard(passportUrl)}
                className="btn-vintage-outline w-full justify-center"
              >
                <Copy size={12} />
                <span>{copied ? 'URL Copied!' : 'Copy Shareable Link'}</span>
              </button>
            </div>

            {/* Quick Specs */}
            <div className="p-3 bg-[#292531] border border-[#45404F] text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-[#AAA2B3]">Unique ID:</span>
                <span className="text-[#E2DDE7]">{product.productId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAA2B3]">Identifier / UDI:</span>
                <span className="text-[#E2DDE7] truncate max-w-[170px]">{product.imeiMasked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAA2B3]">Assembly Hub:</span>
                <span className="text-[#E2DDE7] truncate max-w-[170px]">{product.assemblyFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAA2B3]">Shipment ID:</span>
                <button
                  onClick={() => navigate(`/logistics?search=${product.shipmentId}`)}
                  className="text-[#E8BC7A] hover:underline flex items-center gap-1"
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
          <div className="p-5 vintage-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#45404F]">
              <h3 className="text-sm text-[#E2DDE7] flex items-center gap-2">
                <Award className="text-[#AAA2B3]" size={16} />
                <span>Regulatory Compliance &amp; Sustainability Passport</span>
              </h3>
              <span className="text-xs font-mono text-[#86D6A6]">{product.esgScore}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
              <div className="p-3 bg-[#292531] border border-[#45404F]">
                <span className="text-[#AAA2B3] flex items-center gap-1">
                  <Leaf size={12} className="text-[#86D6A6]" />
                  <span>Carbon Footprint:</span>
                </span>
                <p className="text-sm text-[#E2DDE7] mt-1">{product.carbonFootprintKg} kg CO₂e</p>
                <span className="text-[10px] text-[#716879]">Scope 1-3 Assessed</span>
              </div>

              <div className="p-3 bg-[#292531] border border-[#45404F]">
                <span className="text-[#AAA2B3] flex items-center gap-1">
                  <Scale size={12} className="text-[#AAA2B3]" />
                  <span>Recycled Content:</span>
                </span>
                <p className="text-sm text-[#E2DDE7] mt-1">{product.recycledContentPct}% Verified</p>
                <span className="text-[10px] text-[#716879]">Secondary Materials</span>
              </div>

              {product.batteryChemistry && (
                <div className="p-3 bg-[#292531] border border-[#45404F]">
                  <span className="text-[#AAA2B3]">Chemistry:</span>
                  <p className="text-sm text-[#E8BC7A] mt-1 truncate">{product.batteryChemistry}</p>
                  <span className="text-[10px] text-[#716879]">Health: {product.stateOfHealth}% SoH</span>
                </div>
              )}

              <div className="p-3 bg-[#292531] border border-[#45404F]">
                <span className="text-[#AAA2B3]">Compliance Standards:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.complianceStandards?.map(std => (
                    <span key={std} className="px-1.5 py-0.2 bg-[#17151C] text-[#E2DDE7] text-[9px] border border-[#45404F]">
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Installed Components BOM */}
          <div className="p-5 vintage-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#45404F]">
              <div>
                <h3 className="text-sm text-[#E2DDE7]">Bill of Materials (BOM) Component Lineage</h3>
                <p className="text-xs text-[#AAA2B3]">
                  Every sub-assembly is registered with its source batch and individual unit serial number.
                </p>
              </div>
              <span className="text-xs font-mono text-[#AAA2B3]">{Object.keys(product.installedComponents).length} Modules</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              {Object.entries(product.installedComponents).map(([moduleName, serial]) => {
                const isDefectiveDisplay = serial === 'ABC-0042' || serial.startsWith('ABC-');
                return (
                  <div
                    key={moduleName}
                    className={`p-3 border transition-all ${
                      isDefectiveDisplay
                        ? 'bg-[#2D1C22] border-[#5A2C35]'
                        : 'bg-[#292531] border-[#45404F] hover:border-[#AAA2B3]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[#AAA2B3]">
                      <span>{moduleName}</span>
                      <span className={`text-[10px] ${isDefectiveDisplay ? 'text-[#F08C8A] font-bold' : 'text-[#86D6A6]'}`}>
                        {isDefectiveDisplay ? 'Flagged Batch ABC' : 'Verified'}
                      </span>
                    </div>
                    <div className="text-sm text-[#E2DDE7] mt-1">{serial}</div>
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#45404F] text-[10px] text-[#716879]">
                      <span>Ledger Anchor</span>
                      <button
                        onClick={() => navigate(`/traceability?query=${serial}`)}
                        className="text-[#E2DDE7] hover:underline flex items-center gap-0.5"
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
            <div className="p-5 vintage-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#45404F]">
                <div>
                  <h3 className="text-sm text-[#E2DDE7]">Assembly &amp; Quality Inspection Ledger</h3>
                  <p className="text-xs text-[#AAA2B3]">
                    Chronological verification events recorded by MES &amp; SCADA gateways.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#86D6A6] flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>100% Operations Logged</span>
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {events.map(e => (
                  <div
                    key={e.eventId}
                    className="p-3 bg-[#292531] border border-[#45404F] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-1.5 py-0.5 bg-[#17151C] text-[#E2DDE7] text-[10px] border border-[#45404F]">{e.operationId}</span>
                      <div>
                        <span className="text-[#E2DDE7] font-normal">{e.operationName}</span>
                        <div className="text-[#716879] text-[11px] mt-0.5">
                          Station: {e.machineId} • Operator: {e.operator}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[#86D6A6]">{e.result}</span>
                      <div className="text-[10px] text-[#AAA2B3]">{e.completionTimestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cryptographic Proof Verification Block */}
          <div className="p-5 vintage-card space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-[#E2DDE7] pb-2 border-b border-[#45404F]">
              <span className="flex items-center gap-2">
                <Blocks size={14} className="text-[#AAA2B3]" />
                <span>Merkle-DAG Integrity &amp; Demo Ledger Anchor</span>
              </span>
              <span className="text-[11px] text-[#716879]">EVM Smart Contract</span>
            </div>
            <div className="p-3 bg-[#292531] border border-[#45404F] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#AAA2B3]">Root Merkle Hash:</span>
                <span className="text-[#E2DDE7] truncate max-w-[280px] sm:max-w-none">{product.merkleRoot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAA2B3]">Transaction ID:</span>
                <span className="text-[#AAA2B3] truncate max-w-[280px] sm:max-w-none">{product.blockchainTx}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAA2B3]">Consensus Verification:</span>
                <span className="text-[#86D6A6]">12/12 Enterprise Validator Nodes Confirmed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
