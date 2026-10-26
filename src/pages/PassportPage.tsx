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
  Lock,
  Eye,
  FileText
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { formatAddress } from '../utils/hashing';

export const PassportPage: React.FC = () => {
  const { productId: paramProductId } = useParams();
  const navigate = useNavigate();
  const productId = paramProductId || 'GT-DEV-00000851';

  const [viewMode, setViewMode] = useState<'internal' | 'public'>('internal');
  const [copied, setCopied] = useState(false);

  const product = GeneaTraceStore.getProduct(productId) || GeneaTraceStore.getProduct('GT-DEV-00000851');
  const events = product ? GeneaTraceStore.getEventsForEntity(product.productId) : [];
  const displayEvents = product ? GeneaTraceStore.getEventsForEntity(product.installedComponents.displaySerial) : [];
  const shipment = product ? GeneaTraceStore.getShipment(product.shipmentId) : undefined;

  const passportUrl = `${window.location.origin}/passport/${productId}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!product) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>Product Passport not found for ID: {productId}</p>
        <button
          onClick={() => navigate('/passport/GT-DEV-00000851')}
          className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-semibold"
        >
          View Flagship Passport (GT-DEV-00000851)
        </button>
      </div>
    );
  }

  const isRecallFlagged = product.status === 'Recall Flagged';

  return (
    <div className="space-y-6">
      {/* Top Banner if Recalled */}
      {isRecallFlagged && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-950/40">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400 shrink-0" size={20} />
            <div>
              <span className="font-bold text-sm text-red-200">DPP Recall Flag Active</span>
              <p className="text-xs text-red-300/80">
                This device carries Display serial <strong className="font-mono text-white">{product.installedComponents.displaySerial}</strong> from defective Batch ABC.
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

      {/* Header and View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <QrCode className="text-cyan-400" size={24} />
              <span>Digital Product Passport (DPP)</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Demo Verified
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Cryptographic identity, immutable component lineage, and lifecycle passport.
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
            Public Consumer View
          </button>
        </div>
      </div>

      {/* Flagship Card with QR Code and Hardware Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Device Card & QR Code */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4 shadow-xl">
            {/* Phone Mockup or Photo */}
            <div className="relative mx-auto w-40 h-56 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 flex items-center justify-center group shadow-2xl">
              <img
                src="/s24ultra.jpg"
                alt="Smartphone Device"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback visual if image file not loaded
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2 left-2 right-2 text-left">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">GT-SERIES TITANIUM</span>
                <p className="text-xs font-bold text-white leading-tight">{product.productModel}</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <div className="p-2 rounded-lg bg-white shadow-md">
                <QRCodeSVG value={passportUrl} size={130} level="H" includeMargin />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-white">Scan to Verify Authenticity</span>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Route: /passport/{product.productId}</p>
              </div>
              <button
                onClick={() => copyToClipboard(passportUrl)}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy size={12} />
                <span>{copied ? 'Passport URL Copied!' : 'Copy Verification URL'}</span>
              </button>
            </div>

            {/* Quick Specs */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Product ID:</span>
                <span className="text-white font-bold">{product.productId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IMEI (Protected):</span>
                <span className="text-cyan-400">{product.imeiMasked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assembly Hub:</span>
                <span className="text-slate-300">{product.assemblyFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipment ID:</span>
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
          {/* Installed Components Grid */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Cryptographically Registered Components</h3>
                <p className="text-xs text-slate-400">
                  Every critical module has a dedicated serial and cryptographic commitment.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">7 Sub-systems</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              {/* Display */}
              <div
                className={`p-3 rounded-xl border ${
                  product.installedBatches.displayBatch === 'ABC'
                    ? 'bg-red-950/30 border-red-500/50'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span>Display Module</span>
                  <span className="text-[10px] text-red-400 font-bold">Batch: {product.installedBatches.displayBatch}</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">{product.installedComponents.displaySerial}</div>
                <div className="text-[10px] text-slate-500 mt-1">Samsung OLED 120Hz LTPO 3.0</div>
              </div>

              {/* Battery */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Battery Cell</span>
                  <span className="text-[10px] text-cyan-400">Batch: {product.installedBatches.batteryBatch}</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">{product.installedComponents.batterySerial}</div>
                <div className="text-[10px] text-slate-500 mt-1">ATL 5,000mAh High-Density Li-Po</div>
              </div>

              {/* Main PCB */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Main Motherboard PCB</span>
                  <span className="text-[10px] text-cyan-400">Batch: {product.installedBatches.pcbBatch}</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">{product.installedComponents.pcbSerial}</div>
                <div className="text-[10px] text-slate-500 mt-1">Snapdragon 8 Gen 3 SMT Line 4</div>
              </div>

              {/* Camera Module */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Camera Array (200MP)</span>
                  <span className="text-[10px] text-cyan-400">Batch: {product.installedBatches.cameraBatch}</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">{product.installedComponents.cameraSerial}</div>
                <div className="text-[10px] text-slate-500 mt-1">Sony Semiconductor Quad-OIS</div>
              </div>

              {/* Speaker */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Stereo Speaker</span>
                  <span className="text-[10px] text-cyan-400">Batch: {product.installedBatches.speakerBatch}</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">{product.installedComponents.speakerSerial}</div>
                <div className="text-[10px] text-slate-500 mt-1">AAC Micro-Acoustics SPL 98dB</div>
              </div>

              {/* Frame */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Titanium Frame</span>
                  <span className="text-[10px] text-cyan-400">Batch: {product.installedBatches.frameBatch}</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">{product.installedComponents.frameSerial}</div>
                <div className="text-[10px] text-slate-500 mt-1">Grade 5 Aerospace CNC Anodized</div>
              </div>
            </div>
          </div>

          {/* Manufacturing Operations Timeline */}
          {viewMode === 'internal' && (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Unit Manufacturing Operations Ledger</h3>
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
                {/* Assembly Events */}
                {events.map((e) => (
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
              <span className="text-[11px] text-violet-400">EVM Demo Contract</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Root Merkle Hash:</span>
                <span className="text-slate-300 font-bold">{product.merkleRoot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Anchor Transaction ID:</span>
                <span className="text-cyan-400">{product.blockchainTx}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Consensus:</span>
                <span className="text-emerald-400 font-bold">12/12 Enterprise Validator Nodes Confirmed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
