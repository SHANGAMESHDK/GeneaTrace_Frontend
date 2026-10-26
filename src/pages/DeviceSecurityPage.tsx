import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Smartphone,
  Cpu,
  Activity,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Radio,
  ExternalLink
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { SecurityStatus } from '../types';

export const DeviceSecurityPage: React.FC = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>(
    GeneaTraceStore.getState().securityStatus
  );
  const [isSimulating, setIsSimulating] = useState(false);

  const product = GeneaTraceStore.getProduct(securityStatus.productId) || GeneaTraceStore.getProduct('GT-DEV-00000851')!;

  const handleTriggerTampering = () => {
    setIsSimulating(true);
    setTimeout(() => {
      GeneaTraceStore.simulateTampering(product.productId, true);
      setSecurityStatus({ ...GeneaTraceStore.getState().securityStatus });
      setIsSimulating(false);
    }, 800);
  };

  const handleExecuteLockCommand = () => {
    setIsSimulating(true);
    setTimeout(() => {
      GeneaTraceStore.executeLockCommand(product.productId);
      setSecurityStatus({ ...GeneaTraceStore.getState().securityStatus });
      setIsSimulating(false);
    }, 900);
  };

  const handleRecoverDevice = () => {
    GeneaTraceStore.recoverDevice(product.productId);
    setSecurityStatus({ ...GeneaTraceStore.getState().securityStatus });
  };

  const isTampered = securityStatus.status === 'Confirmed Tampering';
  const isLocked = securityStatus.lockCommandStatus === 'Executed (Simulated)';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="text-red-400" size={24} />
            <span>Hardware Tamper Detection &amp; Automated Device Security</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Component signature attestation, unauthorized swap detection, and simulated MDM auto-lock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            Target: <strong className="text-cyan-400 font-bold">{product.productId}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Control Panel (Left) & Simulated Smartphone Screen (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Security Status & Policy Automation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Security Overview Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isLocked || isTampered
                ? 'bg-red-950/20 border-red-500/60 shadow-xl shadow-red-950/30'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    isLocked || isTampered
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {isLocked ? <Lock size={22} /> : isTampered ? <AlertTriangle size={22} /> : <ShieldCheck size={22} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white font-mono">{product.productId}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase ${
                        isLocked
                          ? 'bg-red-600 text-white animate-pulse'
                          : isTampered
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isLocked ? 'DEVICE LOCKED' : securityStatus.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Model: {product.productModel} • IMEI: {product.imeiMasked}
                  </p>
                </div>
              </div>

              {/* Status recovery button */}
              {(isLocked || isTampered) && (
                <button
                  onClick={handleRecoverDevice}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                >
                  <Unlock size={14} />
                  <span>Authorized Clear</span>
                </button>
              )}
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500">Hardware Commitment:</span>
                <p className={`font-bold mt-1 ${securityStatus.hardwareHashMatches ? 'text-emerald-400' : 'text-red-400'}`}>
                  {securityStatus.hardwareHashMatches ? '✓ Matches DPP Root' : '✗ Commitment Drift'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500">Device Cryptographic Sig:</span>
                <p className={`font-bold mt-1 ${securityStatus.signatureValid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {securityStatus.signatureValid ? '✓ Valid Enclave Key' : '✗ Invalid Signature'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-500">Components Authentic:</span>
                <p className={`font-bold mt-1 ${securityStatus.componentsAuthentic ? 'text-emerald-400' : 'text-red-400'}`}>
                  {securityStatus.componentsAuthentic ? '✓ All Modules Factory' : '✗ Unverified Display'}
                </p>
              </div>
            </div>

            {/* Anomaly Details if detected */}
            {isTampered && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-red-400">
                  <AlertTriangle size={15} />
                  <span>Tampering Detected (Display Serial / IMEI Mismatch)</span>
                </div>
                <p className="text-[11px] text-red-300">{securityStatus.anomalyDetails}</p>
              </div>
            )}
          </div>

          {/* Simulation Action Triggers */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white">Interactive Simulation Controls</h3>
            <p className="text-xs text-slate-400">
              Test how GeneaTrace attestation engine reacts when an unauthorized component is swapped or spoofed.
            </p>

            <div className="flex flex-wrap gap-3">
              {!isTampered && !isLocked ? (
                <button
                  onClick={handleTriggerTampering}
                  disabled={isSimulating}
                  className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-red-950 transition-all"
                >
                  <AlertTriangle size={15} />
                  <span>Simulate Component Replacement Tamper</span>
                </button>
              ) : null}

              {isTampered && !isLocked ? (
                <button
                  onClick={handleExecuteLockCommand}
                  disabled={isSimulating}
                  className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-red-950 animate-pulse transition-all"
                >
                  <Lock size={15} />
                  <span>Execute Signed Auto-Lock Command via MDM</span>
                </button>
              ) : null}

              {isLocked || isTampered ? (
                <button
                  onClick={handleRecoverDevice}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
                >
                  <RefreshCw size={14} />
                  <span>Reset / Authorized Service Technician Unlock</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Audit Log Stream */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-2">
                <Terminal size={15} className="text-cyan-400" />
                <span>Security Engine Attestation Audit Trail</span>
              </span>
              <span className="text-[11px] text-slate-500">{securityStatus.simulatedAuditLogs.length} Events</span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {securityStatus.simulatedAuditLogs.map((log, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-cyan-400 font-bold">{log.actor}</span>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-xs">{log.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Smartphone Test Frame */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="text-center mb-3">
            <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
              Live Managed Device Screen State
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="relative w-[280px] h-[560px] rounded-[44px] bg-black border-4 border-slate-700 shadow-2xl p-3 flex flex-col justify-between overflow-hidden ring-1 ring-slate-800">
            {/* Top Speaker / Dynamic Island */}
            <div className="w-24 h-4 rounded-full bg-slate-900 mx-auto mt-1 z-20 shrink-0" />

            {/* Screen Content */}
            {isLocked ? (
              // LOCKED SCREEN STATE (Section 9 in infographic)
              <div className="flex-1 rounded-[32px] bg-red-950/90 border border-red-600/50 flex flex-col items-center justify-center p-6 text-center text-white space-y-4 my-2 z-10 animate-fade-in shadow-inner">
                <div className="w-16 h-16 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center text-red-500 animate-pulse">
                  <Lock size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-red-200">
                    Device Automatically Locked
                  </h4>
                  <p className="text-[11px] text-red-300/90 leading-relaxed font-sans">
                    This device has been locked due to unauthorized hardware tampering.
                  </p>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Display serial mismatch verified against GeneaTrace Merkle DAG. Please contact an authorized service center.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] font-mono text-red-400/80 bg-red-900/40 px-2 py-1 rounded border border-red-500/30">
                    MDM_POLICY_TAMPER_KILL_0x44
                  </span>
                </div>
              </div>
            ) : isTampered ? (
              // WARNING SCREEN STATE
              <div className="flex-1 rounded-[32px] bg-amber-950/80 border border-amber-600/50 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 my-2 z-10">
                <AlertTriangle size={36} className="text-amber-400 animate-bounce" />
                <h4 className="text-xs font-bold text-amber-200 uppercase">Hardware Anomaly Alert</h4>
                <p className="text-[11px] text-amber-300/90 leading-relaxed font-sans">
                  Attestation failed: Installed screen does not match factory DPP cryptographic fingerprint.
                </p>
                <span className="text-[9px] font-mono text-amber-400">Lock Command Pending Authorization</span>
              </div>
            ) : (
              // NORMAL SECURE STATE
              <div className="flex-1 rounded-[32px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 flex flex-col items-center justify-between p-6 text-center text-white my-2 z-10 border border-slate-800">
                <div className="space-y-1 pt-4">
                  <span className="text-[10px] font-mono text-cyan-400">SECURE ENCLAVE ACTIVE</span>
                  <h4 className="text-base font-bold">Galaxy S24 Ultra</h4>
                  <span className="text-[11px] text-slate-400 font-mono">GT-DEV-00000851</span>
                </div>

                <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
                  <ShieldCheck size={36} />
                </div>

                <div className="space-y-1 pb-4">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 size={13} />
                    <span>GeneaTrace DPP Verified</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">All 7 Modules Factory Signed</p>
                </div>
              </div>
            )}

            {/* Bottom Home Indicator */}
            <div className="w-32 h-1 rounded-full bg-slate-700 mx-auto mb-1 z-20 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
