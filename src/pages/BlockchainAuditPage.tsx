import React, { useState } from 'react';
import {
  Blocks,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Search,
  ExternalLink,
  Copy,
  Info,
  Radio,
  Hash
} from 'lucide-react';
import { GeneaTraceStore } from '../services/dataStore';
import { formatAddress } from '../utils/hashing';

export const BlockchainAuditPage: React.FC = () => {
  const store = GeneaTraceStore.getState();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const blocks = store.blockchainBlocks;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(text);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[#413634] flex items-center gap-2">
            <Blocks className="text-[#c5716d]" size={22} />
            <span>Merkle-DAG &amp; Blockchain Audit Explorer</span>
          </h1>
          <p className="text-xs text-[#666666] font-serif mt-1">
            Decentralized identity commitments, batch anchoring checkpoints, and immutable audit proofs.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#faf3dc] border border-[#e5e5e5] text-xs font-serif text-[#413634]">
          <span className="w-2 h-2 rounded-full bg-[#c5716d]" />
          <span>Demo Network: EVM-Sepolia (ChainID: 11155111)</span>
        </div>
      </div>

      {/* Distinction Alert Banner */}
      <div className="p-4 vintage-card flex items-start gap-3 text-xs text-[#413634] bg-[#faf3dc]/60">
        <Info size={18} className="text-[#c5716d] shrink-0 mt-0.5" />
        <div className="space-y-1 font-serif">
          <span className="font-bold text-[#413634]">Cryptographic Layer Architecture Distinction</span>
          <p className="text-[#666666] leading-relaxed">
            GeneaTrace strictly separates <strong>Event Hash Calculation</strong> (local unit execution), <strong>Merkle-DAG Integrity Verification</strong> (parent hash graphs), and <strong>Blockchain Checkpoint Anchoring</strong> (state commitments). This demo uses an EVM smart contract interface representation clearly marked for demonstration audit.
          </p>
        </div>
      </div>

      {/* Network Health Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-serif">
        <div className="p-4 vintage-card">
          <span className="text-[#8b6c58]">Committed Checkpoints:</span>
          <p className="text-xl font-normal font-serif text-[#413634] mt-1">1,849,502</p>
          <span className="text-[11px] text-[#2e6b4d] font-serif">100% Integrity Confirmed</span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-[#8b6c58]">Validator Consensus:</span>
          <p className="text-xl font-normal font-serif text-[#413634] mt-1">12/12 Nodes</p>
          <span className="text-[11px] text-[#8b6c58]">PoA Enterprise Consortium</span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-[#8b6c58]">Average Anchor Latency:</span>
          <p className="text-xl font-normal font-serif text-[#49627d] mt-1 font-mono">2.1 sec</p>
          <span className="text-[11px] text-[#8b6c58]">Sub-block commitment</span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-[#8b6c58]">Smart Contract:</span>
          <p className="text-xs font-mono font-bold text-[#c5716d] mt-2 truncate">0x9812A...E901</p>
          <span className="text-[11px] text-[#8b6c58]">GeneaTraceAnchor.sol</span>
        </div>
      </div>

      {/* Merkle Blocks Table */}
      <div className="p-5 vintage-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2">
          <h3 className="text-sm font-normal font-serif text-[#413634]">Recent Immutable Ledger Checkpoints</h3>
          <span className="text-xs font-serif text-[#8b6c58]">Showing recent anchored blocks</span>
        </div>

        <div className="overflow-x-auto border border-[#e5e5e5]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#faf3dc] text-[#413634] border-b border-[#e5e5e5] font-serif text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-normal">Block #</th>
                <th className="py-3 px-4 font-normal">Entity Type</th>
                <th className="py-3 px-4 font-normal">Entity Reference</th>
                <th className="py-3 px-4 font-normal">Transaction Hash</th>
                <th className="py-3 px-4 font-normal">Merkle Root</th>
                <th className="py-3 px-4 font-normal">Validator Node</th>
                <th className="py-3 px-4 text-right font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] bg-[#fffdf6]">
              {blocks.map(b => (
                <tr key={b.blockNumber} className="hover:bg-[#faf3dc]/50 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-[#49627d]">#{b.blockNumber}</td>
                  <td className="py-2.5 px-4 text-[#413634] font-serif">{b.entityType}</td>
                  <td className="py-2.5 px-4 font-bold text-[#413634] truncate max-w-[180px]">{b.entityId}</td>
                  <td className="py-2.5 px-4 text-[#c5716d]">
                    <button
                      onClick={() => handleCopy(b.txHash)}
                      className="hover:underline flex items-center gap-1 font-mono"
                      title="Copy TX Hash"
                    >
                      <span>{formatAddress(b.txHash, 6)}</span>
                      <Copy size={11} />
                    </button>
                  </td>
                  <td className="py-2.5 px-4 text-[#666666] font-mono">{formatAddress(b.merkleRoot, 6)}</td>
                  <td className="py-2.5 px-4 text-[#666666] text-[11px] truncate max-w-[140px] font-mono">{b.validatorNode}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="px-2 py-0.5 text-[10px] bg-[#faf3dc] text-[#413634] font-bold border border-[#e5e5e5]">
                      {b.status}
                    </span>
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
