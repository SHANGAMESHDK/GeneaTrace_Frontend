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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#60433D] pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[#E8D8CE] flex items-center gap-2">
            <ShieldAlert className="text-[#F08C8A]" size={22} />
            <span>Hardware Tamper Detection &amp; Automated Device Security</span>
          </h1>
          <p className="text-xs text-[#C1A094] font-serif mt-1">
            Component signature attestation, unauthorized swap detection, and simulated MDM auto-lock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-serif px-3 py-1.5 bg-[#60433D] border border-[#60433D] text-[#E8D8CE]">
            Target: <strong className="font-mono text-[#E8D8CE] font-bold">{product.productId}</strong>
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
                ? 'bg-[#2D1C22] border-[#5A2C35]'
                : 'bg-[#382A28] border-[#60433D]'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#60433D]">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 border ${
                    isLocked || isTampered
                      ? 'bg-[#2D1C22] border-[#5A2C35] text-[#F08C8A]'
                      : 'bg-[#1B2D22] border-[#2D543B] text-[#86D6A6]'
                  }`}
                >
                  {isLocked ? <Lock size={20} /> : isTampered ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-normal font-serif text-[#E8D8CE]">{product.productId}</span>
                    <span
                      className={`text-xs px-2 py-0.5 font-serif uppercase tracking-wider border ${
                        isLocked
                          ? 'bg-[#F08C8A] text-[#211B1A] border-[#F08C8A] animate-pulse font-semibold'
                          : isTampered
                          ? 'bg-[#2D1C22] text-[#F08C8A] border-[#5A2C35]'
                          : 'bg-[#1B2D22] text-[#86D6A6] border-[#2D543B]'
                      }`}
                    >
                      {isLocked ? 'DEVICE LOCKED' : securityStatus.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#C1A094] font-serif mt-0.5">
                    Model: {product.productModel} • Identifier: {product.imeiMasked}
                  </p>
                </div>
              </div>

              {/* Status recovery button */}
              {(isLocked || isTampered) && (
                <button
                  onClick={handleRecoverDevice}
                  className="px-3 py-1.5 bg-[#60433D] hover:bg-[#342f3d] text-xs font-serif text-[#86D6A6] border border-[#60433D] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
                >
                  <Unlock size={13} />
                  <span>Authorized Clear</span>
                </button>
              )}
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-serif">
              <div className="p-3 bg-[#211B1A] border border-[#60433D]">
                <span className="text-[#916B60]">Hardware Commitment:</span>
                <p className={`font-bold mt-1 ${securityStatus.hardwareHashMatches ? 'text-[#86D6A6]' : 'text-[#F08C8A]'}`}>
                  {securityStatus.hardwareHashMatches ? '✓ Matches DPP Root' : '✗ Commitment Drift'}
                </p>
              </div>
              <div className="p-3 bg-[#211B1A] border border-[#60433D]">
                <span className="text-[#916B60]">Device Signature:</span>
                <p className={`font-bold mt-1 ${securityStatus.signatureValid ? 'text-[#86D6A6]' : 'text-[#F08C8A]'}`}>
                  {securityStatus.signatureValid ? '✓ Valid Enclave Key' : '✗ Invalid Signature'}
                </p>
              </div>
              <div className="p-3 bg-[#211B1A] border border-[#60433D]">
                <span className="text-[#916B60]">Components Authentic:</span>
                <p className={`font-bold mt-1 ${securityStatus.componentsAuthentic ? 'text-[#86D6A6]' : 'text-[#F08C8A]'}`}>
                  {securityStatus.componentsAuthentic ? '✓ All Modules Factory' : '✗ Unverified Display'}
                </p>
              </div>
            </div>

            {/* Anomaly Details if detected */}
            {isTampered && (
              <div className="mt-4 p-3.5 bg-[#2D1C22] border border-[#5A2C35] text-xs text-[#F08C8A] space-y-1 font-serif">
                <div className="flex items-center gap-2 font-bold text-[#F08C8A]">
                  <AlertTriangle size={15} />
                  <span>Tampering Detected (Display Serial / Root Mismatch)</span>
                </div>
                <p className="text-[11px] text-[#F08C8A]/90">{securityStatus.anomalyDetails}</p>
              </div>
            )}
          </div>

          {/* Simulation Action Triggers */}
          <div className="p-5 vintage-card space-y-4">
            <h3 className="text-sm font-normal font-serif text-[#E8D8CE]">Interactive Simulation Controls</h3>
            <p className="text-xs text-[#C1A094] font-serif">
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
                  className="btn-vintage-accent text-xs py-2.5 px-4 flex items-center gap-2 animate-pulse uppercase tracking-wider bg-[#F08C8A]! text-[#211B1A]! border-[#F08C8A]!"
                >
                  <Lock size={14} />
                  <span>Execute Signed Auto-Lock Command via MDM</span>
                </button>
              ) : null}

              {isLocked || isTampered ? (
                <button
                  onClick={handleRecoverDevice}
                  className="px-4 py-2.5 bg-[#60433D] hover:bg-[#342f3d] border border-[#60433D] text-[#E8D8CE] text-xs font-serif flex items-center gap-2 transition-colors uppercase tracking-wider"
                >
                  <RefreshCw size={13} />
                  <span>Reset / Authorized Technician Unlock</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Audit Log Stream */}
          <div className="p-5 vintage-card space-y-3 font-serif text-xs">
            <div className="flex items-center justify-between text-[#E8D8CE] border-b border-[#60433D] pb-2">
              <span className="font-normal flex items-center gap-2">
                <Terminal size={14} className="text-[#C1A094]" />
                <span>Security Engine Attestation Audit Trail</span>
              </span>
              <span className="text-[11px] text-[#916B60] font-mono">{securityStatus.simulatedAuditLogs.length} Events</span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {securityStatus.simulatedAuditLogs.map((log, idx) => (
                <div key={idx} className="p-2.5 bg-[#211B1A] border border-[#60433D] space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#E8D8CE] font-mono font-bold">{log.actor}</span>
                    <span className="text-[#916B60] font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-[#C1A094] text-xs">{log.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Smartphone Test Frame */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="text-center mb-3">
            <span className="text-xs font-serif uppercase tracking-wider text-[#916B60]">
              Live Managed Device Screen State
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="relative w-[280px] h-[560px] rounded-[44px] bg-[#211B1A] border-4 border-[#60433D] shadow-2xl p-3 flex flex-col justify-between overflow-hidden ring-1 ring-[#916B60]">
            {/* Top Speaker / Dynamic Island */}
            <div className="w-24 h-4 rounded-full bg-[#60433D] mx-auto mt-1 z-20 shrink-0" />

            {/* Screen Content */}
            {isLocked ? (
              // LOCKED SCREEN STATE
              <div className="flex-1 rounded-[32px] bg-[#2D1C22] border border-[#5A2C35] flex flex-col items-center justify-center p-6 text-center text-white space-y-4 my-2 z-10 animate-fade-in shadow-inner">
                <div className="w-16 h-16 rounded-full bg-[#F08C8A]/20 border border-[#F08C8A] flex items-center justify-center text-[#F08C8A] animate-pulse">
                  <Lock size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-normal font-serif uppercase tracking-wider text-[#F08C8A]">
                    Device Automatically Locked
                  </h4>
                  <p className="text-[11px] text-[#E8D8CE] leading-relaxed font-serif">
                    This device has been locked due to unauthorized hardware tampering.
                  </p>
                  <p className="text-[10px] text-[#C1A094] font-serif">
                    Display serial mismatch verified against GeneaTrace Merkle DAG. Please contact an authorized service center.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-[9px] font-mono text-[#F08C8A] bg-[#211B1A] px-2 py-1 rounded border border-[#5A2C35]">
                    MDM_POLICY_TAMPER_KILL_0x44
                  </span>
                </div>
              </div>
            ) : isTampered ? (
              // WARNING SCREEN STATE
              <div className="flex-1 rounded-[32px] bg-[#33281C] border border-[#5E4826] flex flex-col items-center justify-center p-6 text-center text-white space-y-3 my-2 z-10">
                <AlertTriangle size={36} className="text-[#E8BC7A] animate-bounce" />
                <h4 className="text-xs font-normal font-serif text-[#E8BC7A] uppercase">Hardware Anomaly Alert</h4>
                <p className="text-[11px] text-[#E8D8CE] leading-relaxed font-serif">
                  Attestation failed: Installed screen does not match factory DPP cryptographic fingerprint.
                </p>
                <span className="text-[9px] font-mono text-[#E8BC7A]">Lock Command Pending Authorization</span>
              </div>
            ) : (
              // NORMAL SECURE STATE
              <div className="flex-1 rounded-[32px] bg-gradient-to-b from-[#382A28] to-[#211B1A] flex flex-col items-center justify-between p-6 text-center text-white my-2 z-10 border border-[#60433D]">
                <div className="space-y-1 pt-4">
                  <span className="text-[10px] font-mono text-[#C1A094]">SECURE ENCLAVE ACTIVE</span>
                  <h4 className="text-base font-normal font-serif text-[#E8D8CE]">Galaxy S24 Ultra</h4>
                  <span className="text-[11px] text-[#916B60] font-mono">GT-DEV-00000851</span>
                </div>

                <div className="w-20 h-20 rounded-full bg-[#60433D] border border-[#60433D] flex items-center justify-center text-[#E8D8CE] shadow-lg">
                  <ShieldCheck size={36} />
                </div>

                <div className="space-y-1 pb-4">
                  <div className="flex items-center justify-center gap-1.5 text-[#86D6A6] text-xs font-serif font-bold">
                    <CheckCircle2 size={13} />
                    <span>GeneaTrace DPP Verified</span>
                  </div>
                  <p className="text-[10px] text-[#916B60] font-mono">All 7 Modules Factory Signed</p>
                </div>
              </div>
            )}

            {/* Bottom Home Indicator */}
            <div className="w-32 h-1 rounded-full bg-[#60433D] mx-auto mb-1 z-20 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
