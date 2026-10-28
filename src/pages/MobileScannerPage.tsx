import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  ShieldCheck,
  AlertTriangle,
  Lock,
  RefreshCw,
  Zap,
  Radio,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Layers,
  Sparkles,
  PlusCircle,
  Cpu
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { api } from '../services/apiClient';

interface ScanResult {
  targetId: string;
  verdict: 'GENUINE_PRODUCT' | 'GENUINE_COMPONENT' | 'TAMPERED' | 'UNKNOWN';
  title: string;
  subtitle: string;
  hash: string;
  timestamp: string;
  isValid: boolean;
}

export const MobileScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [edgeConnected, setEdgeConnected] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastEdgeTimestampRef = useRef<number>(0);
  const readerElementId = 'geneatrace-mobile-camera-reader';

  const extractCleanId = (raw: string): string => {
    let clean = raw.trim();
    if (clean.includes('/passport/')) {
      clean = clean.split('/passport/')[1].split('?')[0].split('/')[0];
    } else if (clean.includes('/scanner') && clean.includes('target=')) {
      clean = clean.split('target=')[1].split('&')[0];
    } else if (clean.includes('target=')) {
      clean = clean.split('target=')[1].split('&')[0];
    } else if (clean.includes('id=')) {
      clean = clean.split('id=')[1].split('&')[0];
    }
    return clean.trim();
  };

  const evaluateCode = (decodedText: string): ScanResult => {
    const cleanId = extractCleanId(decodedText);
    const upper = cleanId.toUpperCase();
    const now = new Date().toLocaleTimeString();

    // 1. Counterfeit / Tampered Component
    if (upper.includes('FAKE') || upper.includes('TAMPER') || upper.includes('UNAUTH') || upper.includes('UNREGISTERED')) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([300, 100, 300, 100, 400]);
      }
      GeneaTraceStore.simulateTampering('AAA12345678', true);

      return {
        targetId: cleanId,
        verdict: 'TAMPERED',
        title: 'ALERT: HARDWARE TAMPERING DETECTED',
        subtitle: 'Unregistered replacement module. Mismatch with DPP Merkle Root.',
        hash: '0x00000000000000000000000000000000',
        timestamp: now,
        isValid: false,
      };
    }

    // 2. Check in Central GeneaTrace Store for Finished Product
    const foundProduct = GeneaTraceStore.getProduct(cleanId);
    if (foundProduct && (foundProduct.productId.toUpperCase() === upper || upper.includes('AAA') || upper.includes('A55') || upper.includes('851') || upper.includes('12345678') || upper.includes('GT-DEV'))) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 40, 80]);
      }
      GeneaTraceStore.recoverDevice(foundProduct.productId);

      return {
        targetId: foundProduct.productId,
        verdict: 'GENUINE_PRODUCT',
        title: `VERIFIED: ${foundProduct.productModel.toUpperCase()}`,
        subtitle: `Batch ${foundProduct.installedBatches?.['Display Module'] || 'AAA'} Container Verified. Anchored on EVM Block #1849340.`,
        hash: foundProduct.merkleRoot || '0x9f3b8a1c4e72d05f88b14a2c91e3f706',
        timestamp: now,
        isValid: true,
      };
    }

    // 3. Check in Central Store for Registered Component
    const foundComponent = GeneaTraceStore.getComponentBySerial(cleanId);
    if (foundComponent) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 30, 60]);
      }
      return {
        targetId: foundComponent.serialNumber,
        verdict: 'GENUINE_COMPONENT',
        title: `VERIFIED: ${foundComponent.type.toUpperCase()} (BATCH ${foundComponent.batchId})`,
        subtitle: `Authorized ${foundComponent.type} component linked to ${foundComponent.supplier} (${foundComponent.location}). Status: ${foundComponent.status}.`,
        hash: foundComponent.cryptographicHash || '0x4e72d05f88b14a2c91e3f7069f3b8a1c',
        timestamp: now,
        isValid: true,
      };
    }

    // 4. Check if code matches an existing Batch
    const foundBatch = GeneaTraceStore.getBatch(cleanId);
    if (foundBatch) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 30, 60]);
      }
      return {
        targetId: foundBatch.batchId,
        verdict: 'GENUINE_COMPONENT',
        title: `VERIFIED: BATCH ${foundBatch.batchId} (${foundBatch.componentType.toUpperCase()})`,
        subtitle: `Registered manufacturing batch with ${foundBatch.batchSize} allocated serials. Facility: ${foundBatch.facility}.`,
        hash: foundBatch.blockchainCheckpointTx || '0x4e72d05f88b14a2c91e3f7069f3b8a1c',
        timestamp: now,
        isValid: true,
      };
    }

    // 5. Check if part of Batch prefix (e.g. AAA-0042, ABC-0042, etc.)
    if (upper.includes('0042') || upper.includes('CMP-DIS') || upper.startsWith('AAA-') || upper.startsWith('ABC-') || upper.startsWith('BTR-') || upper.startsWith('PCB-')) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 30, 60]);
      }
      return {
        targetId: cleanId,
        verdict: 'GENUINE_COMPONENT',
        title: 'VERIFIED: SUPER AMOLED DISPLAY (BATCH AAA)',
        subtitle: 'Authorized display module linked to Machine DISP-04 stage.',
        hash: '0x4e72d05f88b14a2c91e3f7069f3b8a1c',
        timestamp: now,
        isValid: true,
      };
    }

    // 6. Default Unknown - Offer one-click registration
    return {
      targetId: cleanId,
      verdict: 'UNKNOWN',
      title: 'UNREGISTERED IDENTIFIER',
      subtitle: `Scanned code: ${cleanId}. Not yet registered in the GeneaTrace registry. Click below to register and anchor on-chain.`,
      hash: '0xunknown000000000000000000000000',
      timestamp: now,
      isValid: false,
    };
  };

  const handleRegisterScanned = (targetId: string) => {
    try {
      const regComp = GeneaTraceStore.registerComponent({
        serialNumber: targetId,
        type: 'Display',
        supplier: 'Apex Cleanroom Technologies',
        location: 'Cleanroom Complex Alpha Line 3'
      });
      // Try async sync to backend API
      api.registerComponent({
        component_serial: targetId,
        component_type: 'DISPLAY',
        batch_id: regComp.batchId,
        manufacturer_id: 'SUP-DEFAULT',
        supplier_id: 'SUP-DEFAULT',
        facility_id: 'FAC-FAB-01'
      }).catch(e => console.warn('Backend sync note for registerComponent:', e));

      setScanResult({
        targetId: regComp.serialNumber,
        verdict: 'GENUINE_COMPONENT',
        title: `SUCCESSFULLY REGISTERED: ${regComp.type.toUpperCase()} (BATCH ${regComp.batchId})`,
        subtitle: `Component ${regComp.serialNumber} officially anchored into GeneaTrace Registry. Status: Registered.`,
        hash: regComp.cryptographicHash,
        timestamp: new Date().toLocaleTimeString(),
        isValid: true,
      });
    } catch (err: any) {
      alert(`Error registering component: ${err?.message || 'Unknown error'}`);
    }
  };

  // Sync with local Edge Station on port 8765 if running
  useEffect(() => {
    let active = true;
    const pollEdge = async () => {
      try {
        const res = await fetch('http://localhost:8765', { mode: 'cors' });
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          setEdgeConnected(true);
          if (data && data.timestamp && data.timestamp > lastEdgeTimestampRef.current && data.target_id) {
            lastEdgeTimestampRef.current = data.timestamp;
            const evaluated = evaluateCode(data.target_id);
            setScanResult(evaluated);
          }
        } else {
          if (active) setEdgeConnected(false);
        }
      } catch {
        if (active) setEdgeConnected(false);
      }
    };
    const interval = setInterval(pollEdge, 1500);
    pollEdge();
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);


  const startScanner = async () => {
    if (isStartingRef.current || !isMountedRef.current) return;
    isStartingRef.current = true;
    setCameraError(null);

    try {
      // Safely tear down existing instance if any
      const existing = html5QrCodeRef.current;
      if (existing) {
        try {
          if (existing.isScanning) {
            await existing.stop();
          }
          existing.clear();
        } catch {}
      }

      const html5QrCode = new Html5Qrcode(readerElementId);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 20,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' }, // Rear camera
        config,
        (decodedText) => {
          if (!isMountedRef.current) return;
          const result = evaluateCode(decodedText);
          setScanResult(result);
        },
        () => {
          // Frame scanned without QR, suppress error
        }
      );

      // In case component unmounted during start() await
      if (!isMountedRef.current) {
        try {
          if (html5QrCode.isScanning) {
            await html5QrCode.stop();
          }
          html5QrCode.clear();
        } catch {}
        return;
      }

      setIsScanning(true);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      console.warn('Camera start error:', err);
      setCameraError(err?.message || 'Could not access camera. Please allow camera permissions or test via station buttons below.');
      setIsScanning(false);
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopScanner = async () => {
    const scanner = html5QrCodeRef.current;
    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
        scanner.clear();
      } catch (e) {
        console.debug('Error stopping camera (ignored):', e);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    startScanner();

    return () => {
      isMountedRef.current = false;
      const scanner = html5QrCodeRef.current;
      if (scanner) {
        try {
          if (scanner.isScanning) {
            const p = scanner.stop();
            if (p && typeof p.catch === 'function') {
              p.catch(() => {}).finally(() => {
                try { scanner.clear(); } catch {}
              });
            }
          } else {
            try { scanner.clear(); } catch {}
          }
        } catch (e) {
          // Suppress synchronous "Cannot stop, scanner is not running or paused."
          console.debug('Suppressed scanner unmount exception:', e);
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Mobile App Header */}
      <header className="px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            GT
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
              <span>GeneaTrace Edge</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Mobile Gate
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">AOI Optical Inspection Station</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {edgeConnected && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              EDGE:8765
            </span>
          )}
          {isScanning ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE
            </span>
          ) : (
            <button
              onClick={startScanner}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              Restart
            </button>
          )}
        </div>
      </header>

      {/* Main Camera Viewfinder Zone */}
      <main className="flex-1 relative flex flex-col items-center justify-center bg-black overflow-hidden">
        {/* The HTML5 QR code video container */}
        <div id={readerElementId} className="w-full max-w-md h-full object-cover" />

        {/* HUD Scanner Reticle Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
          {/* Target Reticle Box */}
          <div className="relative w-64 h-64 border-2 border-dashed border-emerald-500/50 rounded-3xl flex items-center justify-center shadow-2xl">
            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

            {/* Scanning Laser Line Animation */}
            <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

            {/* Center crosshair */}
            <div className="w-4 h-4 border border-emerald-500/40 rounded-full" />
          </div>

          <p className="mt-6 text-xs font-mono text-emerald-400/90 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30">
            ALIGN QR TOKEN IN VIEWFINDER
          </p>
        </div>

        {/* Camera Permission / Access Error */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4 z-40">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Camera size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">Camera Permission Needed</h2>
              <p className="text-xs text-slate-400 max-w-xs">{cameraError}</p>
            </div>
            <button
              onClick={startScanner}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw size={14} />
              <span>Retry Camera</span>
            </button>
          </div>
        )}
      </main>

      {/* Bottom Result & Telemetry Card */}
      <footer className="p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 space-y-3 z-50">
        {scanResult ? (
          <div
            className={`p-4 rounded-2xl border transition-all ${
              scanResult.isValid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200 animate-pulse'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    scanResult.isValid
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  }`}
                >
                  {scanResult.isValid ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold">{scanResult.targetId}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${
                        scanResult.isValid
                          ? 'bg-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/30 text-rose-300'
                      }`}
                    >
                      {scanResult.verdict}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-0.5">{scanResult.title}</h3>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400">{scanResult.timestamp}</span>
            </div>

            <p className="text-xs text-slate-300/90 mt-2.5 leading-relaxed">{scanResult.subtitle}</p>

            {/* Quick Actions based on verdict */}
            {scanResult.verdict === 'UNKNOWN' && (
              <button
                onClick={() => handleRegisterScanned(scanResult.targetId)}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all pointer-events-auto"
              >
                <PlusCircle size={15} />
                <span>Register &amp; Anchor Component in Registry</span>
              </button>
            )}

            {scanResult.verdict === 'GENUINE_PRODUCT' && (
              <button
                onClick={() => navigate(`/passport/${scanResult.targetId}`)}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 pointer-events-auto transition-all"
              >
                <ExternalLink size={14} />
                <span>View Digital Product Passport ({scanResult.targetId})</span>
              </button>
            )}

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Merkle: {scanResult.hash.slice(0, 14)}...</span>
              <span className="text-emerald-400">Latency: &lt;11ms</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              <span>Ready to Scan Physical Device or Component</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Point your camera at QR Tokens (AAA12345678, AAA-0042, or FAKE-DISP-9999).
            </p>
          </div>
        )}


        {/* Assembly Line Process Ingestion Controls (Steps 4 & 5) */}
        {(() => {
          const activeTargetId = (scanResult?.verdict === 'GENUINE_PRODUCT' ? scanResult.targetId : 'AAA12345678');
          return (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Layers size={13} />
                  <span>Assembly Line Station Ingestion (Push to Container)</span>
                </span>
                <span className="text-slate-400 font-bold">Target: {activeTargetId}</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <button
                  onClick={() => {
                    GeneaTraceStore.pushAssemblyStage(activeTargetId, {
                      name: 'SMT PCB Solder & Flux Printing',
                      machineId: 'SMT-01',
                      operator: 'Rajesh V.',
                      status: 'Completed & Signed'
                    });
                    setScanResult({
                      targetId: activeTargetId,
                      verdict: 'GENUINE_PRODUCT',
                      title: 'STAGE 1 INGESTED: SMT-01',
                      subtitle: `Timestamp & SMT-01 machine ID pushed to ${activeTargetId}. Merkle Root recalculated.`,
                      hash: '0x1a8f9c4b220194bc',
                      timestamp: new Date().toLocaleTimeString(),
                      isValid: true
                    });
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left truncate"
                >
                  + Stage 1 (SMT-01)
                </button>

                <button
                  onClick={() => {
                    GeneaTraceStore.pushAssemblyStage(activeTargetId, {
                      name: 'Super AMOLED Display Module Lamination',
                      machineId: 'DISP-04',
                      operator: 'Elena Rostova',
                      status: 'Flagged (Thermal Variance)'
                    });
                    setScanResult({
                      targetId: activeTargetId,
                      verdict: 'GENUINE_PRODUCT',
                      title: 'STAGE 2 INGESTED: DISP-04',
                      subtitle: `Timestamp & DISP-04 pushed. Thermal profile logged to ${activeTargetId}.`,
                      hash: '0x2b7e6d5a88194c71',
                      timestamp: new Date().toLocaleTimeString(),
                      isValid: true
                    });
                  }}
                  className="py-1.5 px-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/50 text-left truncate"
                >
                  + Stage 2 (DISP-04)
                </button>

                <button
                  onClick={() => {
                    GeneaTraceStore.pushAssemblyStage(activeTargetId, {
                      name: 'Motherboard & Secure Enclave Cryptographic Binding',
                      machineId: 'SEC-02',
                      operator: 'Kenji Sato',
                      status: 'Completed'
                    });
                    setScanResult({
                      targetId: activeTargetId,
                      verdict: 'GENUINE_PRODUCT',
                      title: 'STAGE 3 INGESTED: SEC-02',
                      subtitle: `Hardware Enclave bound to Blockchain serial ${activeTargetId}.`,
                      hash: '0x3c6d5e4f440285a2',
                      timestamp: new Date().toLocaleTimeString(),
                      isValid: true
                    });
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left truncate"
                >
                  + Stage 3 (SEC-02)
                </button>

                <button
                  onClick={() => {
                    GeneaTraceStore.pushAssemblyStage(activeTargetId, {
                      name: 'Automated Optical Inspection Quality Gate',
                      machineId: 'AOI-01',
                      operator: 'Automated Gate',
                      status: 'Sealed & Merkle Anchored'
                    });
                    setScanResult({
                      targetId: activeTargetId,
                      verdict: 'GENUINE_PRODUCT',
                      title: 'STAGE 4: SEALED & ANCHORED',
                      subtitle: `Final Quality Gate passed. Container ${activeTargetId} sealed on EVM block #1849340.`,
                      hash: '0x4d5c6b7a993184ef',
                      timestamp: new Date().toLocaleTimeString(),
                      isValid: true
                    });
                  }}
                  className="py-1.5 px-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 text-left truncate"
                >
                  + Stage 4 (AOI Gate)
                </button>
              </div>
            </div>
          );
        })()}


        {/* Quick Demo Test Buttons for Immediate Simulation */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={() => setScanResult(evaluateCode('AAA12345678'))}
            className="flex-1 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 text-center"
          >
            Scan Samsung A55
          </button>
          <button
            onClick={() => setScanResult(evaluateCode('FAKE-DISP-9999'))}
            className="flex-1 py-2 px-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-[11px] font-medium border border-rose-800/50 text-center"
          >
            Simulate Tampered
          </button>
        </div>
      </footer>
    </div>
  );
};
