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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#60433D] pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-[#E8D8CE] flex items-center gap-2">
            <Blocks className="text-[#C1A094]" size={22} />
            <span>Merkle-DAG &amp; Blockchain Audit Explorer</span>
          </h1>
          <p className="text-xs text-[#C1A094] font-serif mt-1">
            Decentralized identity commitments, batch anchoring checkpoints, and immutable audit proofs.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#60433D] border border-[#60433D] text-xs font-serif text-[#E8D8CE]">
          <span className="w-2 h-2 rounded-full bg-[#86D6A6]" />
          <span>Demo Network: EVM-Sepolia (ChainID: 11155111)</span>
        </div>
      </div>

      {/* Distinction Alert Banner */}
      <div className="p-4 vintage-card flex items-start gap-3 text-xs text-[#E8D8CE] bg-[#60433D]">
        <Info size={18} className="text-[#C1A094] shrink-0 mt-0.5" />
        <div className="space-y-1 font-serif">
          <span className="font-bold text-[#E8D8CE]">Cryptographic Layer Architecture Distinction</span>
          <p className="text-[#C1A094] leading-relaxed">
            GeneaTrace strictly separates <strong>Event Hash Calculation</strong> (local unit execution), <strong>Merkle-DAG Integrity Verification</strong> (parent hash graphs), and <strong>Blockchain Checkpoint Anchoring</strong> (state commitments). This demo uses an EVM smart contract interface representation clearly marked for demonstration audit.
          </p>
        </div>
      </div>

      {/* Network Health Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-serif">
        <div className="p-4 vintage-card">
          <span className="text-[#916B60]">Committed Checkpoints:</span>
          <p className="text-xl font-normal font-serif text-[#E8D8CE] mt-1">1,849,502</p>
          <span className="text-[11px] text-[#86D6A6] font-serif">100% Integrity Confirmed</span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-[#916B60]">Validator Consensus:</span>
          <p className="text-xl font-normal font-serif text-[#E8D8CE] mt-1">12/12 Nodes</p>
          <span className="text-[11px] text-[#916B60]">PoA Enterprise Consortium</span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-[#916B60]">Average Anchor Latency:</span>
          <p className="text-xl font-normal font-serif text-[#86D6A6] mt-1 font-mono">2.1 sec</p>
          <span className="text-[11px] text-[#916B60]">Sub-block commitment</span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-[#916B60]">Smart Contract:</span>
          <p className="text-xs font-mono font-bold text-[#E8D8CE] mt-2 truncate">0x9812A...E901</p>
          <span className="text-[11px] text-[#916B60]">GeneaTraceAnchor.sol</span>
        </div>
      </div>

      {/* Merkle Blocks Table */}
      <div className="p-5 vintage-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#60433D] pb-2">
          <h3 className="text-sm font-normal font-serif text-[#E8D8CE]">Recent Immutable Ledger Checkpoints</h3>
          <span className="text-xs font-serif text-[#916B60]">Showing recent anchored blocks</span>
        </div>

        <div className="overflow-x-auto border border-[#60433D]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#60433D] text-[#C1A094] border-b border-[#60433D] font-serif text-[11px] uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#60433D] bg-[#211B1A]">
              {blocks.map(b => (
                <tr key={b.blockNumber} className="hover:bg-[#60433D]/50 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-[#C1A094]">#{b.blockNumber}</td>
                  <td className="py-2.5 px-4 text-[#E8D8CE] font-serif">{b.entityType}</td>
                  <td className="py-2.5 px-4 font-bold text-[#E8D8CE] truncate max-w-[180px]">{b.entityId}</td>
                  <td className="py-2.5 px-4 text-[#C1A094]">
                    <button
                      onClick={() => handleCopy(b.txHash)}
                      className="hover:underline flex items-center gap-1 font-mono hover:text-[#E8D8CE]"
                      title="Copy TX Hash"
                    >
                      <span>{formatAddress(b.txHash, 6)}</span>
                      <Copy size={11} />
                    </button>
                  </td>
                  <td className="py-2.5 px-4 text-[#C1A094] font-mono">{formatAddress(b.merkleRoot, 6)}</td>
                  <td className="py-2.5 px-4 text-[#916B60] text-[11px] truncate max-w-[140px] font-mono">{b.validatorNode}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="px-2 py-0.5 text-[10px] bg-[#60433D] text-[#86D6A6] font-bold border border-[#60433D]">
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
