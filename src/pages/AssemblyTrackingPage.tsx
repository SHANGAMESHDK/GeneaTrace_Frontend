import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  BatteryCharging,
  HeartPulse,
  Plane,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { IndustrySector } from '../types';

export const AssemblyTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState<IndustrySector>('Consumer Electronics');
  const products = GeneaTraceStore.getProducts(selectedSector);

  // Sector-Specific Assembly Stages
  const sectorAssemblyLines: Record<IndustrySector, any[]> = {
    'Consumer Electronics': [
      { id: '1', step: 'PCB Assembly', machine: 'SMT-01', eventId: 'EVT-100201', desc: 'Main logic board placement & solder paste reflow', time: '11:00:00', result: 'OK' },
      { id: '2', step: 'Component Mounting', machine: 'AS-02', eventId: 'EVT-100202', desc: 'Display, camera arrays & battery automated robotic mounting', time: '11:12:00', result: 'OK' },
      { id: '3', step: 'Main Assembly', machine: 'AS-03', eventId: 'EVT-100203', desc: 'Internal chassis routing, shielding & acoustic sealing', time: '11:24:00', result: 'OK' },
      { id: '4', step: 'Final Assembly & Sealing', machine: 'FA-01', eventId: 'EVT-100204', desc: 'IP68 waterproof seal, titanium rim screw fastening', time: '11:36:00', result: 'OK' },
      { id: '5', step: 'Functional Test', machine: 'FT-01', eventId: 'EVT-100205', desc: 'Screen color calibration, RF signal BIST & sensor audit', time: '11:48:00', result: 'OK' },
      { id: '6', step: 'Packaging & DPP Laser', machine: 'PK-01', eventId: 'EVT-100206', desc: 'Laser engraving QR code, box sealing & Merkle commit', time: '12:00:00', result: 'OK' },
    ],
    'Automotive & EV Battery': [
      { id: '1', step: 'Ultrasonic Tab Welding', machine: 'WELD-01', eventId: 'EVT-EVB-01', desc: 'Laser and ultrasonic joining of 96 prismatic cell tabs', time: '14:00:00', result: 'OK' },
      { id: '2', step: 'Thermal Barrier Layer', machine: 'INS-02', eventId: 'EVT-EVB-02', desc: 'Aerogel phase-change insulation barrier between modules', time: '14:15:00', result: 'OK' },
      { id: '3', step: 'Cold Plate Pressure Test', machine: 'PR-03', eventId: 'EVT-EVB-03', desc: 'Glycol liquid cooling loop 4.5 Bar helium leak check', time: '14:30:00', result: 'OK' },
      { id: '4', step: 'BMS Wire Harness AOI', machine: 'BMS-04', eventId: 'EVT-EVB-04', desc: 'Optical inspection of cell monitoring sensor harness', time: '14:45:00', result: 'OK' },
      { id: '5', step: '800V Hi-Pot Dielectric Test', machine: 'HIPOT-05', eventId: 'EVT-EVB-05', desc: '2500V DC high-voltage isolation safety attestation', time: '15:00:00', result: 'OK' },
      { id: '6', step: 'EU Battery DPP QR Laser', machine: 'LASER-06', eventId: 'EVT-EVB-06', desc: 'Permanent QR code marking compliant with EU 2023/1542', time: '15:15:00', result: 'OK' },
    ],
    'Medical Technology': [
      { id: '1', step: 'Titanium Feedthrough Weld', machine: 'LASER-M1', eventId: 'EVT-MED-01', desc: 'Hermetic glass-to-metal seal laser micro-welding', time: '09:00:00', result: 'OK' },
      { id: '2', step: 'ASIC Telemetry Wirebond', machine: 'BOND-M2', eventId: 'EVT-MED-02', desc: 'Gold wire bonding for sub-microamp telemetry chip', time: '09:20:00', result: 'OK' },
      { id: '3', step: 'Helium Fine Leak BIST', machine: 'LEAK-M3', eventId: 'EVT-MED-03', desc: 'Mass spectrometer hermetic rate < 10^-9 atm cc/sec', time: '09:40:00', result: 'OK' },
      { id: '4', step: 'Bio-Polymer Encapsulation', machine: 'ENC-M4', eventId: 'EVT-MED-04', desc: 'Medical Grade silicone header attachment & curing', time: '10:00:00', result: 'OK' },
      { id: '5', step: 'EtO Sterilization Validation', machine: 'STER-M5', eventId: 'EVT-MED-05', desc: 'Ethylene oxide exposure cycle & biological indicator', time: '10:30:00', result: 'OK' },
      { id: '6', step: 'FDA UDI Laser Engraving', machine: 'UDI-M6', eventId: 'EVT-MED-06', desc: 'Direct Part Marking of UDI barcode 21 CFR 830', time: '11:00:00', result: 'OK' },
    ],
    'Industrial & Aerospace': [
      { id: '1', step: 'Class 3 IPC-A-610 SMT', machine: 'AERO-SMT1', eventId: 'EVT-AVN-01', desc: 'High-reliability lead-free solder assembly with X-Ray', time: '08:00:00', result: 'OK' },
      { id: '2', step: 'Parylene Conformal Coat', machine: 'COAT-02', eventId: 'EVT-AVN-02', desc: 'Moisture and dielectric vapor deposition coating', time: '08:30:00', result: 'OK' },
      { id: '3', step: 'Thermal Vacuum Cycling', machine: 'TVAC-03', eventId: 'EVT-AVN-03', desc: '-55°C to +125°C 10^-5 Torr chamber burn-in cycle', time: '09:15:00', result: 'OK' },
      { id: '4', step: 'Tri-Axis Random Vibration', machine: 'VIB-04', eventId: 'EVT-AVN-04', desc: 'MIL-STD-810H random vibration sweep 20G RMS', time: '10:00:00', result: 'OK' },
      { id: '5', step: 'DO-254 Hardware BIST', machine: 'TEST-05', eventId: 'EVT-AVN-05', desc: 'Fault injection test on triple-redundant flight logic', time: '10:45:00', result: 'OK' },
      { id: '6', step: 'Flight Proven Seal Laser', machine: 'SEAL-06', eventId: 'EVT-AVN-06', desc: 'Airworthiness certification commitment to ledger', time: '11:30:00', result: 'OK' },
    ]
  };

  const steps = sectorAssemblyLines[selectedSector];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#d9825b]/20 pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-white flex items-center gap-2">
            <Cpu className="text-[#f0a887]" size={22} />
            <span>Industrial Assembly Line Tracking &amp; Work Orders</span>
          </h1>
          <p className="text-xs text-[#cbb5aa] font-serif mt-1">
            Sequential work order execution across Cleanroom &amp; Gigafactory assembly cells. Unit-level event generation for every section.
          </p>
        </div>

        {/* Sector Tabs */}
        <div className="flex flex-wrap items-center border border-[#d9825b]/20 bg-[#160e0a] border border-[#d9825b]/20 rounded-xl text-xs font-serif">
          {(['Consumer Electronics', 'Automotive & EV Battery', 'Medical Technology', 'Industrial & Aerospace'] as IndustrySector[]).map(s => (
            <button
              key={s}
              onClick={() => setSelectedSector(s)}
              className={`px-3 py-1.5 transition-all text-xs border-r border-[#d9825b]/20 last:border-r-0 ${
                selectedSector === s
                  ? 'bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl text-white font-normal shadow-none border-b-2 border-b-[#c5716d]'
                  : 'text-[#cbb5aa] hover:bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl/40'
              }`}
            >
              {s === 'Consumer Electronics' && '📱 Electronics'}
              {s === 'Automotive & EV Battery' && '🚗 EV Battery'}
              {s === 'Medical Technology' && '🩺 Medical'}
              {s === 'Industrial & Aerospace' && '🛰️ Aerospace'}
            </button>
          ))}
        </div>
      </div>

      {/* Assembly Pipeline Visual Cards */}
      <div className="p-5 vintage-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#d9825b]/20 pb-2">
          <h3 className="text-sm font-normal font-serif text-white">
            {selectedSector} — Sequential Assembly Stages &amp; Machine Events
          </h3>
          <span className="text-xs font-mono text-[#e89d7b]">Automated MES Cell Line 4</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className="p-3.5 bg-[#160e0a] border border-[#d9825b]/20 rounded-xl border border-[#d9825b]/20 hover:border-[#413634] transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono pb-1 border-b border-[#d9825b]/20">
                  <span className="text-[#f0a887] font-bold">Stage {idx + 1}</span>
                  <span className="px-1.5 py-0.2 bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl text-white border border-[#d9825b]/20">{step.machine}</span>
                </div>
                <h4 className="font-normal font-serif text-xs text-white mt-2 leading-tight">{step.step}</h4>
                <p className="text-[11px] font-serif text-[#cbb5aa] mt-1 line-clamp-2 leading-normal">{step.desc}</p>
              </div>

              <div className="pt-2 border-t border-[#d9825b]/20 space-y-1 font-mono text-[10px]">
                <div className="flex justify-between text-[#e89d7b]">
                  <span>Event ID:</span>
                  <span className="text-[#49627d]">{step.eventId}</span>
                </div>
                <div className="flex justify-between text-[#e89d7b]">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">{step.result}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracked Products for this Sector */}
      <div className="p-5 vintage-card space-y-4">
        <div className="border-b border-[#d9825b]/20 pb-2">
          <h3 className="text-sm font-normal font-serif text-white">
            {selectedSector} — Assembled Products ({products.length} Tracked)
          </h3>
          <p className="text-xs font-serif text-[#cbb5aa]">
            Each unit links its respective registered sub-assemblies into an immutable Digital Product Passport.
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto border border-[#d9825b]/20">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl text-white sticky top-0 border-b border-[#d9825b]/20 font-serif text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 font-normal">Product ID</th>
                <th className="py-2.5 px-3 font-normal">Product Model</th>
                <th className="py-2.5 px-3 font-normal">Identifier / UDI</th>
                <th className="py-2.5 px-3 font-normal">Assembly Facility</th>
                <th className="py-2.5 px-3 font-normal">Status</th>
                <th className="py-2.5 px-3 font-normal text-right">Digital Passport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] bg-[#160e0a] border border-[#d9825b]/20 rounded-xl">
              {products.map(p => (
                <tr key={p.productId} className="hover:bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl/50 transition-colors">
                  <td className="py-2 px-3 font-bold text-white">{p.productId}</td>
                  <td className="py-2 px-3 text-[#49627d]">{p.productModel}</td>
                  <td className="py-2 px-3 text-[#cbb5aa] truncate max-w-[160px]">{p.imeiMasked}</td>
                  <td className="py-2 px-3 text-white font-serif">{p.assemblyFacility}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 border text-[10px] font-mono ${
                        p.status === 'Recall Flagged'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl text-rose-400 border-[#f5c6cb]'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl text-emerald-400 border-[#c3e6cb]'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => navigate(`/passport/${p.productId}`)}
                      className="text-[#f0a887] hover:underline flex items-center gap-1 ml-auto font-serif text-[11px]"
                    >
                      <span>Open DPP</span>
                      <ExternalLink size={10} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
