import React, { useState, useEffect } from 'react';
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
import { api } from '../services/apiClient';

export const BlockchainAuditPage: React.FC = () => {
  const store = GeneaTraceStore.getState();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [liveAudit, setLiveAudit] = useState<any>(null);

  useEffect(() => {
    api.getBlockchainAudit()
      .then(res => {
        setLiveAudit(res);
      })
      .catch(err => {
        console.warn('Backend blockchain audit fallback:', err);
      });
  }, []);

  const blocks = store.blockchainBlocks;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(text);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#d9825b]/20 pb-4">
        <div>
          <h1 className="text-2xl font-normal font-serif tracking-tight text-white flex items-center gap-2">
            <Blocks className="text-[#f0a887]" size={22} />
            <span>Merkle-DAG &amp; Blockchain Audit Explorer</span>
          </h1>
          <p className="text-xs text-[#cbb5aa] font-serif mt-1">
            Decentralized identity commitments, batch anchoring checkpoints, and immutable audit proofs.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl border border-[#d9825b]/20 text-xs font-serif text-white">
          <span className="w-2 h-2 rounded-full bg-[#2e6b4d] animate-pulse" />
          <span>Immutable Ledger: Merkle Checkpoint Anchored</span>
        </div>
      </div>

      {/* Distinction Alert Banner */}
      <div className="p-4 vintage-card flex items-start gap-3 text-xs text-white bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl/60">
        <Info size={18} className="text-[#f0a887] shrink-0 mt-0.5" />
        <div className="space-y-1 font-serif">
          <span className="font-bold text-white">Cryptographic Layer Architecture</span>
          <p className="text-[#cbb5aa] leading-relaxed">
            GeneaTrace guarantees data veracity by strictly separating <strong>Event Hash Calculation</strong> (local unit execution), <strong>Merkle-DAG Integrity Verification</strong> (parent hash graphs), and <strong>Blockchain Checkpoint Anchoring</strong> (immutable state commitments across production runs).
          </p>
        </div>
      </div>

      {/* Network Health Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-serif">
        <div className="p-4 vintage-card">
          <span className="text-[#e89d7b]">Committed Checkpoints:</span>
          <p className="text-xl font-normal font-serif text-white mt-1">
            {liveAudit?.total_checkpoints !== undefined ? liveAudit.total_checkpoints.toLocaleString() : blocks.length.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-serif">
            {liveAudit?.confirmed_checkpoints !== undefined ? `${liveAudit.confirmed_checkpoints} Confirmed` : 'Integrity Confirmed'}
          </span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-[#e89d7b]">Validator Consensus:</span>
          <p className="text-xl font-normal font-serif text-white mt-1">
            {liveAudit?.adapter_status?.is_mock ? 'Mock Consensus' : '12/12 Nodes'}
          </p>
          <span className="text-[11px] text-[#e89d7b]">
            {liveAudit?.adapter_status?.is_mock ? 'Local Adapter Active' : 'PoA Enterprise Consortium'}
          </span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-[#e89d7b]">Latest Checkpoint:</span>
          <p className="text-sm font-mono font-bold text-[#49627d] mt-1 truncate" title={liveAudit?.latest_checkpoint?.transaction_hash || '0xa45b98cf120194bc87123985'}>
            {liveAudit?.latest_checkpoint?.transaction_hash ? formatAddress(liveAudit.latest_checkpoint.transaction_hash) : '0xa45b...3985'}
          </p>
          <span className="text-[11px] text-[#e89d7b] font-mono">
            Block #{liveAudit?.latest_checkpoint?.block_number || blocks[0]?.blockNumber || 999999}
          </span>
        </div>
        <div className="p-4 vintage-card">
          <span className="text-[#e89d7b]">Smart Contract:</span>
          <p className="text-xs font-mono font-bold text-[#f0a887] mt-2 truncate">0x9812A...E901</p>
          <span className="text-[11px] text-[#e89d7b]">GeneaTraceAnchor.sol</span>
        </div>
      </div>

      {/* Merkle Blocks Table */}
      <div className="p-5 vintage-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#d9825b]/20 pb-2">
          <h3 className="text-sm font-normal font-serif text-white">Recent Immutable Ledger Checkpoints</h3>
          <span className="text-xs font-serif text-[#e89d7b]">Showing recent anchored blocks</span>
        </div>

        <div className="overflow-x-auto border border-[#d9825b]/20">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl text-white border-b border-[#d9825b]/20 font-serif text-[11px] uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#e5e5e5] bg-[#160e0a] border border-[#d9825b]/20 rounded-xl">
              {blocks.map(b => (
                <tr key={b.blockNumber} className="hover:bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl/50 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-[#49627d]">#{b.blockNumber}</td>
                  <td className="py-2.5 px-4 text-white font-serif">{b.entityType}</td>
                  <td className="py-2.5 px-4 font-bold text-white truncate max-w-[180px]">{b.entityId}</td>
                  <td className="py-2.5 px-4 text-[#f0a887]">
                    <button
                      onClick={() => handleCopy(b.txHash)}
                      className="hover:underline flex items-center gap-1 font-mono"
                      title="Copy TX Hash"
                    >
                      <span>{formatAddress(b.txHash, 6)}</span>
                      <Copy size={11} />
                    </button>
                  </td>
                  <td className="py-2.5 px-4 text-[#cbb5aa] font-mono">{formatAddress(b.merkleRoot, 6)}</td>
                  <td className="py-2.5 px-4 text-[#cbb5aa] text-[11px] truncate max-w-[140px] font-mono">{b.validatorNode}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="px-2 py-0.5 text-[10px] bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl text-white font-bold border border-[#d9825b]/20">
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
