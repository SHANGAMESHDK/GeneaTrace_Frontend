import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Zap, CheckCircle2, QrCode, Barcode, Sparkles, Smartphone } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedValue: string) => void;
  title?: string;
  subtitle?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Scan Mobile QR or Barcode',
  subtitle = 'Point camera at device IMEI barcode, box QR code, or shipping sticker'
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'shopkeeper-barcode-scanner-view';

  // Quick In-Stock Demo Serials for immediate one-click simulation
  const quickInventory = [
    { serial: 'AAA12345678', model: 'Samsung Galaxy A55 5G (Batch AAA)', badge: 'Showcase Unit' },
    { serial: 'GT-DEV-00000851', model: 'Galaxy S25 Ultra Titanium DPP Edition', badge: 'Active Flagged' },
    { serial: 'SM-S928-IND-00841', model: 'Galaxy S25 Ultra 512GB (BKC Store)', badge: 'In Stock' },
    { serial: 'SM-S928-IND-00862', model: 'Galaxy S25 Ultra 512GB (Bangalore Hub)', badge: 'In Stock' }
  ];

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    // Give DOM time to mount reader element then start camera
    const timer = setTimeout(() => {
      startCamera();
    }, 250);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    const el = document.getElementById(readerElementId);
    if (!el) return;

    try {
      setCameraError(null);
      const scanner = new Html5Qrcode(readerElementId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleSuccess(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );

      setIsCameraActive(true);

      // Check flashlight/torch capability
      try {
        const capabilities: any = (scanner as any).getRunningTrackCapabilities?.();
        if (capabilities?.torch) setHasTorch(true);
      } catch {
        // torch not supported
      }
    } catch (err: any) {
      console.warn('Camera failed to start:', err);
      setCameraError(
        err?.message || 'Unable to access camera. Check device camera permissions or use quick barcode tokens below.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      await (scannerRef.current as any).applyVideoConstraints({
        advanced: [{ torch: !torchOn } as any]
      });
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn('Torch toggle error:', err);
    }
  };

  const handleSuccess = (rawCode: string) => {
    // Extract serial number if full URL is scanned (e.g. https://.../passport/AAA12345678)
    let extracted = rawCode.trim();
    if (extracted.includes('/passport/')) {
      extracted = extracted.split('/passport/')[1].split('?')[0];
    } else if (extracted.includes('target=')) {
      extracted = extracted.split('target=')[1].split('&')[0];
    }

    // Trigger haptic vibration if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    stopCamera();
    onScan(extracted);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#140c08] border border-[#d9825b]/30 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden text-white font-sans">
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1a100b]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] flex items-center justify-center text-[#120a07] font-bold shadow-md shadow-[#c67651]/30">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-white tracking-tight flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Live Scanner
                </span>
              </h3>
              <p className="text-xs text-[#cbb5aa] mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#cbb5aa] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewfinder Camera Area */}
        <div className="p-6 space-y-4">
          <div className="relative w-full aspect-square max-h-[290px] mx-auto bg-black rounded-2xl overflow-hidden border-2 border-[#d9825b]/40 shadow-inner flex items-center justify-center">
            {/* html5-qrcode video container */}
            <div id={readerElementId} className="w-full h-full object-cover" />

            {/* Glowing Laser Crosshair Overlay */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-56 h-56 border-2 border-[#e89d7b]/70 rounded-2xl relative">
                  {/* Corner Target Markers */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-[#f5a77f]" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-[#f5a77f]" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-[#f5a77f]" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-[#f5a77f]" />

                  {/* Animated Scanning Laser Line */}
                  <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#f5a77f] to-transparent shadow-[0_0_12px_#f5a77f] animate-[bounce_2s_infinite]" />
                </div>
                <span className="text-[11px] font-mono text-[#f7d5c5] mt-3 bg-[#120a07]/85 px-3 py-1 rounded-full border border-[#d9825b]/40 shadow-md">
                  Align QR Code or 1D Barcode within frame
                </span>
              </div>
            )}

            {/* Camera Error / Permission Fallback */}
            {cameraError && !isCameraActive && (
              <div className="p-5 text-center space-y-2 z-10 max-w-xs">
                <Camera size={32} className="mx-auto text-[#e89d7b] opacity-80" />
                <p className="text-xs text-[#f0a887] font-medium leading-relaxed">
                  Camera stream offline. You can click any in-stock barcode token below to simulate scanning!
                </p>
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-[#d9825b]/30 cursor-pointer"
                >
                  Retry Camera
                </button>
              </div>
            )}

            {/* Torch Toggle Button */}
            {hasTorch && (
              <button
                onClick={toggleTorch}
                className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                  torchOn ? 'bg-amber-500/30 border-amber-400 text-amber-300' : 'bg-black/60 border-white/20 text-white'
                }`}
                title="Toggle Torch"
              >
                <Zap size={14} />
              </button>
            )}
          </div>

          {/* Quick Barcode Tokens for Instant Simulation */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono font-bold uppercase text-[#e89d7b] flex items-center gap-1.5">
                <Barcode size={13} />
                <span>Simulate Retail Box / Barcode Scan:</span>
              </span>
              <span className="text-[10px] text-[#a69489]">Click to scan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickInventory.map((item) => (
                <button
                  key={item.serial}
                  type="button"
                  onClick={() => handleSuccess(item.serial)}
                  className="p-2.5 rounded-xl bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/50 text-left transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-xs font-bold text-white group-hover:text-[#f7d5c5] block truncate">
                      {item.serial}
                    </span>
                    <span className="text-[10px] text-[#cbb5aa] block truncate">
                      {item.model}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#e89d7b]/15 text-[#f0a887] border border-[#e89d7b]/25 text-[9px] font-mono shrink-0">
                    Scan
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BarcodeScannerModal;
