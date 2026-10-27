import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';

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
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'geneatrace-mobile-camera-reader';

  const evaluateCode = (decodedText: string): ScanResult => {
    const raw = decodedText.trim();
    const now = new Date().toLocaleTimeString();

    // 1. Counterfeit / Tampered Component
    if (raw.includes('FAKE') || raw.includes('TAMPER') || raw.includes('UNAUTH')) {
      // Haptic Vibration for Alarm
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([300, 100, 300, 100, 400]);
      }
      // Trigger tamper in central store
      GeneaTraceStore.simulateTampering('AAA12345678', true);

      return {
        targetId: raw,
        verdict: 'TAMPERED',
        title: 'ALERT: HARDWARE TAMPERING DETECTED',
        subtitle: 'Unregistered replacement display module. Mismatch with DPP Merkle Root.',
        hash: '0x00000000000000000000000000000000',
        timestamp: now,
        isValid: false,
      };
    }

    // 2. Genuine Smartphone Unit (Samsung Galaxy A55 5G - Batch AAA)
    if (raw.includes('AAA') || raw.includes('A55') || raw.includes('851') || raw.includes('12345678')) {
      // Haptic Vibration for Success
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([80, 40, 80]);
      }
      GeneaTraceStore.recoverDevice('AAA12345678');

      return {
        targetId: 'AAA12345678',
        verdict: 'GENUINE_PRODUCT',
        title: 'VERIFIED: SAMSUNG GALAXY A55 5G',
        subtitle: 'Batch AAA Container Verified. Anchored on EVM Block #1849340.',
        hash: '0x9f3b8a1c4e72d05f88b14a2c91e3f706',
        timestamp: now,
        isValid: true,
      };
    }

    // 3. Genuine Display Component (Batch AAA)
    if (raw.includes('0042') || raw.includes('CMP-DIS')) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 30, 60]);
      }
      return {
        targetId: 'AAA-0042',
        verdict: 'GENUINE_COMPONENT',
        title: 'VERIFIED: SUPER AMOLED DISPLAY (BATCH AAA)',
        subtitle: 'Authorized display module linked to Machine DISP-04 stage.',
        hash: '0x4e72d05f88b14a2c91e3f7069f3b8a1c',
        timestamp: now,
        isValid: true,
      };
    }

    // 4. Default Unknown
    return {
      targetId: raw,
      verdict: 'UNKNOWN',
      title: 'UNREGISTERED IDENTIFIER',
      subtitle: `Scanned code: ${raw}. Not found in GeneaTrace registry.`,
      hash: '0xunknown000000000000000000000000',
      timestamp: now,
      isValid: false,
    };
  };

  const startScanner = async () => {
    try {
      setCameraError(null);
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
          const result = evaluateCode(decodedText);
          setScanResult(result);
        },
        () => {
          // Frame scanned without QR, suppress error
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera start error:', err);
      setCameraError(err?.message || 'Could not access camera. Please allow camera permissions.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
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
              Point your camera at QR Tokens (GT-DEV-00000851, ABC-0042, or FAKE-DISP-9999).
            </p>
          </div>
        )}

        {/* Assembly Line Process Ingestion Controls (Steps 4 & 5) */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Layers size={13} />
              <span>Assembly Line Station Ingestion (Push to Container)</span>
            </span>
            <span className="text-slate-500">Target: AAA12345678</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            <button
              onClick={() => {
                GeneaTraceStore.pushAssemblyStage('AAA12345678', {
                  name: 'SMT PCB Solder & Flux Printing',
                  machineId: 'SMT-01',
                  operator: 'Rajesh V.',
                  status: 'Completed & Signed'
                });
                setScanResult({
                  targetId: 'AAA12345678',
                  verdict: 'GENUINE_PRODUCT',
                  title: 'STAGE 1 INGESTED: SMT-01',
                  subtitle: 'Timestamp & SMT-01 machine ID pushed to container. Merkle Root recalculated.',
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
                GeneaTraceStore.pushAssemblyStage('AAA12345678', {
                  name: 'Super AMOLED Display Module Lamination',
                  machineId: 'DISP-04',
                  operator: 'Elena Rostova',
                  status: 'Flagged (Thermal Variance)'
                });
                setScanResult({
                  targetId: 'AAA12345678',
                  verdict: 'GENUINE_COMPONENT',
                  title: 'STAGE 2 INGESTED: DISP-04',
                  subtitle: 'Timestamp & DISP-04 pushed. Thermal profile logged to Batch AAA.',
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
                GeneaTraceStore.pushAssemblyStage('AAA12345678', {
                  name: 'Motherboard & Secure Enclave Cryptographic Binding',
                  machineId: 'SEC-02',
                  operator: 'Kenji Sato',
                  status: 'Completed'
                });
                setScanResult({
                  targetId: 'AAA12345678',
                  verdict: 'GENUINE_PRODUCT',
                  title: 'STAGE 3 INGESTED: SEC-02',
                  subtitle: 'Hardware Enclave bound to Blockchain serial AAA12345678.',
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
                GeneaTraceStore.pushAssemblyStage('AAA12345678', {
                  name: 'Automated Optical Inspection Quality Gate',
                  machineId: 'AOI-01',
                  operator: 'Automated Gate',
                  status: 'Sealed & Merkle Anchored'
                });
                setScanResult({
                  targetId: 'AAA12345678',
                  verdict: 'GENUINE_PRODUCT',
                  title: 'STAGE 4: SEALED & ANCHORED',
                  subtitle: 'Final Quality Gate passed. Container AAA12345678 sealed on EVM block #1849340.',
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
