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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[#413634] flex items-center gap-2">
            <ShieldAlert className="text-[#c5716d]" size={22} />
            <span>Hardware Tamper Detection &amp; Automated Device Security</span>
          </h1>
          <p className="text-xs text-[#666666] font-serif mt-1">
            Component signature attestation, unauthorized swap detection, and simulated MDM auto-lock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-serif px-3 py-1.5 bg-[#faf3dc] border border-[#e5e5e5] text-[#413634]">
            Target: <strong className="font-mono text-[#c5716d] font-bold">{product.productId}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Control Panel (Left) & Simulated Smartphone Screen (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Security Status & Policy Automation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Security Overview Card */}
          <div
            className={`p-5 vintage-card transition-all ${
              isLocked || isTampered
                ? 'bg-[#fdf2f1] border-[#f5c6cb]'
                : 'bg-[#fffcf8] border-[#e5e5e5]'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e5e5]">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 border ${
                    isLocked || isTampered
                      ? 'bg-[#fdf2f1] border-[#f5c6cb] text-[#b84a44]'
                      : 'bg-[#edf6f0] border-[#c3e6cb] text-[#2e6b4d]'
                  }`}
                >
                  {isLocked ? <Lock size={20} /> : isTampered ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-normal font-serif text-[#413634]">{product.productId}</span>
                    <span
                      className={`text-xs px-2 py-0.5 font-serif uppercase tracking-wider border ${
                        isLocked
                          ? 'bg-[#b84a44] text-white border-[#b84a44] animate-pulse'
                          : isTampered
                          ? 'bg-[#fdf2f1] text-[#b84a44] border-[#f5c6cb]'
                          : 'bg-[#edf6f0] text-[#2e6b4d] border-[#c3e6cb]'
                      }`}
                    >
                      {isLocked ? 'DEVICE LOCKED' : securityStatus.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#666666] font-serif mt-0.5">
                    Model: {product.productModel} • Identifier: {product.imeiMasked}
                  </p>
                </div>
              </div>

              {/* Status recovery button */}
              {(isLocked || isTampered) && (
                <button
                  onClick={handleRecoverDevice}
                  className="px-3 py-1.5 bg-[#faf3dc] hover:bg-[#eee4d5] text-xs font-serif text-[#2e6b4d] border border-[#413634] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
                >
                  <Unlock size={13} />
                  <span>Authorized Clear</span>
                </button>
              )}
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-serif">
              <div className="p-3 bg-[#fffdf6] border border-[#e5e5e5]">
                <span className="text-[#8b6c58]">Hardware Commitment:</span>
                <p className={`font-bold mt-1 ${securityStatus.hardwareHashMatches ? 'text-[#2e6b4d]' : 'text-[#b84a44]'}`}>
                  {securityStatus.hardwareHashMatches ? '✓ Matches DPP Root' : '✗ Commitment Drift'}
                </p>
              </div>
              <div className="p-3 bg-[#fffdf6] border border-[#e5e5e5]">
                <span className="text-[#8b6c58]">Device Signature:</span>
                <p className={`font-bold mt-1 ${securityStatus.signatureValid ? 'text-[#2e6b4d]' : 'text-[#b84a44]'}`}>
                  {securityStatus.signatureValid ? '✓ Valid Enclave Key' : '✗ Invalid Signature'}
                </p>
              </div>
              <div className="p-3 bg-[#fffdf6] border border-[#e5e5e5]">
                <span className="text-[#8b6c58]">Components Authentic:</span>
                <p className={`font-bold mt-1 ${securityStatus.componentsAuthentic ? 'text-[#2e6b4d]' : 'text-[#b84a44]'}`}>
                  {securityStatus.componentsAuthentic ? '✓ All Modules Factory' : '✗ Unverified Display'}
                </p>
              </div>
            </div>

            {/* Anomaly Details if detected */}
            {isTampered && (
              <div className="mt-4 p-3.5 bg-[#fdf2f1] border border-[#f5c6cb] text-xs text-[#b84a44] space-y-1 font-serif">
                <div className="flex items-center gap-2 font-bold text-[#b84a44]">
                  <AlertTriangle size={15} />
                  <span>Tampering Detected (Display Serial / Root Mismatch)</span>
                </div>
                <p className="text-[11px] text-[#b84a44]/90">{securityStatus.anomalyDetails}</p>
              </div>
            )}
          </div>

          {/* Simulation Action Triggers */}
          <div className="p-5 vintage-card space-y-4">
            <h3 className="text-sm font-normal font-serif text-[#413634]">Interactive Simulation Controls</h3>
            <p className="text-xs text-[#666666] font-serif">
              Test how GeneaTrace attestation engine reacts when an unauthorized component is swapped or spoofed.
            </p>

            <div className="flex flex-wrap gap-3">
              {!isTampered && !isLocked ? (
                <button
                  onClick={handleTriggerTampering}
                  disabled={isSimulating}
                  className="btn-vintage-accent text-xs py-2.5 px-4 flex items-center gap-2 uppercase tracking-wider"
                >
                  <AlertTriangle size={14} />
                  <span>Simulate Component Replacement Tamper</span>
                </button>
              ) : null}

              {isTampered && !isLocked ? (
                <button
                  onClick={handleExecuteLockCommand}
                  disabled={isSimulating}
                  className="btn-vintage-accent text-xs py-2.5 px-4 flex items-center gap-2 animate-pulse uppercase tracking-wider"
                >
                  <Lock size={14} />
                  <span>Execute Signed Auto-Lock Command via MDM</span>
                </button>
              ) : null}

              {isLocked || isTampered ? (
                <button
                  onClick={handleRecoverDevice}
                  className="px-4 py-2.5 bg-[#faf3dc] hover:bg-[#eee4d5] border border-[#413634] text-[#413634] text-xs font-serif flex items-center gap-2 transition-colors uppercase tracking-wider"
                >
                  <RefreshCw size={13} />
                  <span>Reset / Authorized Technician Unlock</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Audit Log Stream */}
          <div className="p-5 vintage-card space-y-3 font-serif text-xs">
            <div className="flex items-center justify-between text-[#413634] border-b border-[#e5e5e5] pb-2">
              <span className="font-normal flex items-center gap-2">
                <Terminal size={14} className="text-[#c5716d]" />
                <span>Security Engine Attestation Audit Trail</span>
              </span>
              <span className="text-[11px] text-[#8b6c58] font-mono">{securityStatus.simulatedAuditLogs.length} Events</span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {securityStatus.simulatedAuditLogs.map((log, idx) => (
                <div key={idx} className="p-2.5 bg-[#fffdf6] border border-[#e5e5e5] space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#c5716d] font-mono font-bold">{log.actor}</span>
                    <span className="text-[#8b6c58] font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-[#413634] text-xs">{log.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Smartphone Test Frame */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="text-center mb-3">
            <span className="text-xs font-serif uppercase tracking-wider text-[#8b6c58]">
              Live Managed Device Screen State
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="relative w-[280px] h-[560px] rounded-[44px] bg-[#1a1716] border-4 border-[#413634] shadow-2xl p-3 flex flex-col justify-between overflow-hidden ring-1 ring-[#e5e5e5]">
            {/* Top Speaker / Dynamic Island */}
            <div className="w-24 h-4 rounded-full bg-black mx-auto mt-1 z-20 shrink-0" />

            {/* Screen Content */}
            {isLocked ? (
              // LOCKED SCREEN STATE
              <div className="flex-1 rounded-[32px] bg-[#2a0e0e] border border-[#c5716d]/50 flex flex-col items-center justify-center p-6 text-center text-white space-y-4 my-2 z-10 animate-fade-in shadow-inner">
                <div className="w-16 h-16 rounded-full bg-[#c5716d]/30 border border-[#c5716d] flex items-center justify-center text-[#c5716d] animate-pulse">
                  <Lock size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-normal font-serif uppercase tracking-wider text-[#faf3dc]">
                    Device Automatically Locked
                  </h4>
                  <p className="text-[11px] text-[#fdf2f1] leading-relaxed font-serif">
                    This device has been locked due to unauthorized hardware tampering.
                  </p>
                  <p className="text-[10px] text-[#faf3dc]/70 font-serif">
                    Display serial mismatch verified against GeneaTrace Merkle DAG. Please contact an authorized service center.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] font-mono text-[#fdf2f1] bg-[#413634]/80 px-2 py-1 rounded border border-[#c5716d]/30">
                    MDM_POLICY_TAMPER_KILL_0x44
                  </span>
                </div>
              </div>
            ) : isTampered ? (
              // WARNING SCREEN STATE
              <div className="flex-1 rounded-[32px] bg-[#3a200a] border border-[#b87428]/50 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 my-2 z-10">
                <AlertTriangle size={36} className="text-[#f8dc68] animate-bounce" />
                <h4 className="text-xs font-normal font-serif text-[#faf3dc] uppercase">Hardware Anomaly Alert</h4>
                <p className="text-[11px] text-[#fef7ec] leading-relaxed font-serif">
                  Attestation failed: Installed screen does not match factory DPP cryptographic fingerprint.
                </p>
                <span className="text-[9px] font-mono text-[#f8dc68]">Lock Command Pending Authorization</span>
              </div>
            ) : (
              // NORMAL SECURE STATE
              <div className="flex-1 rounded-[32px] bg-gradient-to-b from-[#2a2422] to-[#1a1716] flex flex-col items-center justify-between p-6 text-center text-white my-2 z-10 border border-[#413634]">
                <div className="space-y-1 pt-4">
                  <span className="text-[10px] font-mono text-[#faf3dc]">SECURE ENCLAVE ACTIVE</span>
                  <h4 className="text-base font-normal font-serif text-[#fffdf6]">Galaxy S24 Ultra</h4>
                  <span className="text-[11px] text-[#faf3dc]/70 font-mono">GT-DEV-00000851</span>
                </div>

                <div className="w-20 h-20 rounded-full bg-[#c5716d]/20 border border-[#c5716d]/40 flex items-center justify-center text-[#c5716d] shadow-lg">
                  <ShieldCheck size={36} />
                </div>

                <div className="space-y-1 pb-4">
                  <div className="flex items-center justify-center gap-1.5 text-[#2e6b4d] text-xs font-serif font-bold">
                    <CheckCircle2 size={13} />
                    <span>GeneaTrace DPP Verified</span>
                  </div>
                  <p className="text-[10px] text-[#faf3dc]/60 font-mono">All 7 Modules Factory Signed</p>
                </div>
              </div>
            )}

            {/* Bottom Home Indicator */}
            <div className="w-32 h-1 rounded-full bg-[#666666] mx-auto mb-1 z-20 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
