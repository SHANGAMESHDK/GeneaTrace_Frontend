const fs = require('fs');
let c = fs.readFileSync('src/pages/PassportPage.tsx', 'utf8');

c = c.replace(/\r\n/g, '\n');

// 1. Top container
c = c.replace(
  'className="space-y-6 font-serif-vintage max-w-5xl mx-auto pb-12"',
  'className="space-y-6 font-sans max-w-6xl mx-auto pb-12 text-white select-none"'
);

// 2. Header
c = c.replace('border-b border-[#e5e5e5]', 'border-b border-[#d9825b]/20');
c = c.replace('text-2xl text-[#413634]', 'text-2xl font-serif font-bold text-white tracking-tight');
c = c.replace('text-[#c5716d]', 'text-[#e89d7b]');
c = c.replace('text-xs text-[#666666] mt-0.5', 'text-xs text-[#cbb5aa] mt-1');
c = c.replace('btn-vintage-outline text-xs flex items-center gap-1.5', 'btn-glass text-xs flex items-center gap-1.5 cursor-pointer');

// 3. Search Card
c = c.replace(
  'className="p-6 vintage-card bg-[#fffcf8] space-y-3"',
  'className="p-6 bg-[#140c08]/92 border border-[#d9825b]/25 rounded-3xl shadow-xl space-y-4 backdrop-blur-2xl"'
);
c = c.replace('text-xs font-medium text-[#413634]', 'text-xs font-semibold text-[#f7d5c5] uppercase tracking-wider font-mono');
c = c.replace(
  'className="w-full pl-9 pr-4 py-2.5 bg-[#fffdf6] border border-[#413634] text-sm text-[#413634] font-mono placeholder-[#8b6c58]/60 focus:outline-none"',
  'className="w-full pl-9 pr-4 py-2.5 bg-[#120a07] border border-[#d9825b]/30 rounded-xl text-sm text-white font-mono placeholder-[#7d6b62] focus:border-[#e89d7b] focus:outline-none"'
);
c = c.replace('text-[#666666] absolute left-3 top-3', 'text-[#e89d7b] absolute left-3 top-3');
c = c.replace('btn-vintage-accent px-6 py-2.5 text-xs font-medium flex items-center gap-2', 'btn-sunset px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer');
c = c.replace('btn-vintage-outline px-4 py-2.5 text-xs', 'btn-glass px-4 py-2.5 text-xs cursor-pointer');
c = c.replace('border-t border-[#e5e5e5] flex flex-wrap items-center gap-2 text-[11px] text-[#666666]', 'border-t border-white/10 flex flex-wrap items-center gap-2 text-[11px] text-[#cbb5aa]');
c = c.replace(
  /className="px-2\.5 py-0\.5 bg-\[#faf3dc\] border border-\[#e5e5e5\] hover:border-\[#413634\] font-mono text-\[#c5716d\]"/g,
  'className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-[#d9825b]/25 hover:border-[#e89d7b]/50 rounded-lg font-mono text-[#f0a887] cursor-pointer transition-all"'
);

// 4. Master DPP Card
c = c.replace(
  'className="p-6 vintage-card bg-[#fffcf8] space-y-5 border-l-4 border-l-[#2e6b4d]"',
  'className="p-6 bg-[#140c08]/92 border border-[#d9825b]/30 rounded-3xl shadow-2xl space-y-6 backdrop-blur-2xl glow-copper"'
);
c = c.replace('text-[#2e6b4d] font-bold', 'text-emerald-400 font-bold');
c = c.replace('bg-[#edf6f0] border border-[#2e6b4d] text-[#2e6b4d]', 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full');
c = c.replace('text-2xl text-[#413634] font-medium', 'text-2xl font-serif font-bold text-white tracking-tight');
c = c.replace('text-[#413634]', 'text-white');
c = c.replace('text-xs text-[#666666] pt-1', 'text-xs text-[#cbb5aa] pt-1');
c = c.replace('flex items-center gap-3 bg-[#faf3dc] p-3 border border-[#e5e5e5]', 'flex items-center gap-3 bg-[#1c120d] p-3 border border-[#d9825b]/30 rounded-2xl');

// 5. Cryptographic Container Banner
const oldCryptoBox = `<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#faf3dc] p-3.5 border border-[#e5e5e5]">
              <div>
                <span className="text-[10px] text-[#666666] uppercase block">Merkle Root Hash</span>
                <span className="font-mono text-[11px] text-[#413634] break-all">
                  {product?.merkleRoot || '0x9f3b8a1c4e72d05f88b14a2c91e3f706'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] uppercase block">Blockchain Anchor Tx</span>
                <span className="font-mono text-[11px] text-[#2e6b4d] break-all">
                  {product?.blockchainTx || '0xa45b98cf120194bc87123985'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#666666] uppercase block">Hardware Lock / Tamper Status</span>
                <span className={\`font-mono font-medium \${product?.isLocked ? 'text-[#b84a44]' : 'text-[#2e6b4d]'}\`}>
                  {product?.isLocked ? 'LOCKED (Tamper Triggered)' : 'Genuine OEM Attested'}
                </span>
              </div>
            </div>`;

const newCryptoBox = `<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#160e0a]/90 p-4 border border-[#d9825b]/25 rounded-2xl">
              <div>
                <span className="text-[10px] text-[#e89d7b] font-mono font-bold uppercase block">Merkle Root Hash</span>
                <span className="font-mono text-[11px] text-white break-all">
                  {product?.merkleRoot || '0x9f3b8a1c4e72d05f88b14a2c91e3f706'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#e89d7b] font-mono font-bold uppercase block">Blockchain Anchor Tx</span>
                <span className="font-mono text-[11px] text-emerald-400 break-all">
                  {product?.blockchainTx || '0xa45b98cf120194bc87123985'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#e89d7b] font-mono font-bold uppercase block">Hardware Lock / Tamper Status</span>
                <span className={\`font-mono font-bold \${product?.isLocked ? 'text-rose-400' : 'text-emerald-400'}\`}>
                  {product?.isLocked ? 'LOCKED (Tamper Triggered)' : '● Genuine OEM Attested'}
                </span>
              </div>
            </div>`;

if (c.includes(oldCryptoBox)) {
  c = c.replace(oldCryptoBox, newCryptoBox);
  console.log('Successfully replaced Cryptographic Container Banner!');
} else {
  console.warn('Crypto box not matched directly');
}

// 6. Replace all remaining instances of vintage classes/colors:
c = c.replace(/bg-\[#fffcf8\]/g, 'bg-[#140c08]/92 border border-[#d9825b]/25 rounded-3xl');
c = c.replace(/bg-\[#faf3dc\]/g, 'bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl');
c = c.replace(/bg-\[#fffdf6\]/g, 'bg-[#160e0a] border border-[#d9825b]/20 rounded-xl');
c = c.replace(/border-\[#e5e5e5\]/g, 'border-[#d9825b]/20');
c = c.replace(/text-\[#413634\]/g, 'text-white');
c = c.replace(/text-\[#666666\]/g, 'text-[#cbb5aa]');
c = c.replace(/text-\[#8b6c58\]/g, 'text-[#e89d7b]');
c = c.replace(/text-\[#c5716d\]/g, 'text-[#f0a887]');
c = c.replace(/text-\[#2e6b4d\]/g, 'text-emerald-400');
c = c.replace(/text-\[#b84a44\]/g, 'text-rose-400');
c = c.replace(/border-\[#2e6b4d\]/g, 'border-emerald-500/30');
c = c.replace(/border-\[#b84a44\]/g, 'border-rose-500/30');
c = c.replace(/bg-\[#edf6f0\]/g, 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl');
c = c.replace(/bg-\[#fdf2f1\]/g, 'bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl');
c = c.replace(/bg-\[#e0f2fe\]/g, 'bg-[#e89d7b]/15 text-[#f0a887] border border-[#e89d7b]/30 rounded-xl');
c = c.replace(/btn-vintage-accent/g, 'btn-sunset');
c = c.replace(/btn-vintage-outline/g, 'btn-glass');

// 7. Workflow 7 tabs buttons styling (make them sleek rounded-xl with dark theme):
const oldTabButtons = `<div className="flex flex-wrap items-center gap-1.5">
                {/* 1. Genesis & Null Container */}
                <button
                  onClick={() => setActiveTab('genesis')}
                  className={\`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all \${
                    activeTab === 'genesis'
                      ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-xs'
                      : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#0284c7]'
                  }\`}
                >
                  <Layers size={13} />
                  <span>1. Genesis &amp; Null Container (Steps 1–3)</span>
                </button>

                {/* 2. Assembly Station Ingestion */}
                <button
                  onClick={() => setActiveTab('assembly')}
                  className={\`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all \${
                    activeTab === 'assembly'
                      ? 'bg-[#2e6b4d] text-white border-[#2e6b4d] shadow-xs'
                      : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#2e6b4d]'
                  }\`}
                >
                  <Smartphone size={13} />
                  <span>2. Assembly Stations Ingestion (Steps 4–6)</span>
                </button>

                {/* 3. Logistics & Factory Custody */}
                <button
                  onClick={() => setActiveTab('logistics')}
                  className={\`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all \${
                    activeTab === 'logistics'
                      ? 'bg-[#b87428] text-white border-[#b87428] shadow-xs'
                      : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#b87428]'
                  }\`}
                >
                  <Truck size={13} />
                  <span>3. Logistics &amp; Custody (Step 7)</span>
                </button>

                {/* 4. Retail Handover & Customer Sale */}
                <button
                  onClick={() => setActiveTab('retail_sale')}
                  className={\`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all \${
                    activeTab === 'retail_sale'
                      ? 'bg-[#413634] text-white border-[#413634] shadow-xs'
                      : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#413634]'
                  }\`}
                >
                  <UserCheck size={13} />
                  <span>4. Retail Handover &amp; Customer Sale (Steps 8–9)</span>
                </button>

                {/* 5. Defect Backtrace */}
                <button
                  onClick={() => setActiveTab('rma_backtrace')}
                  className={\`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all \${
                    activeTab === 'rma_backtrace'
                      ? 'bg-[#b84a44] text-white border-[#b84a44] shadow-xs'
                      : 'bg-[#fdf2f1] text-[#b84a44] border-[#b84a44] hover:bg-[#b84a44] hover:text-white'
                  }\`}
                >
                  <AlertOctagon size={13} />
                  <span>5. Customer Return &amp; Defect Backtrace (Steps 10–12)</span>
                </button>

                {/* 6. Batch Recall & Customer Re-Delivery */}
                <button
                  onClick={() => setActiveTab('recall_redelivery')}
                  className={\`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all \${
                    activeTab === 'recall_redelivery'
                      ? 'bg-[#b84a44] text-white border-[#b84a44] shadow-xs'
                      : 'bg-[#fffdf6] text-[#413634] border-[#e5e5e5] hover:border-[#b84a44]'
                  }\`}
                >
                  <RotateCcw size={13} />
                  <span>6. Batch AAA Recall &amp; Re-Delivery (Steps 13–15)</span>
                </button>

                {/* 7. Third-Party Fake Part Lock */}
                <button
                  onClick={() => setActiveTab('antitamper_lock')}
                  className={\`px-3 py-1.5 text-xs font-medium border flex items-center gap-1.5 transition-all \${
                    activeTab === 'antitamper_lock'
                      ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-xs'
                      : 'bg-[#fffdf6] text-[#7c3aed] border-[#e5e5e5] hover:border-[#7c3aed]'
                  }\`}
                >
                  <Lock size={13} />
                  <span>7. Third-Party Fake Part Auto-Lock (Security)</span>
                </button>
              </div>`;

const newTabButtons = `<div className="flex flex-wrap items-center gap-2 font-sans">
                {[
                  { id: 'genesis', label: '1. Genesis & Null Container (Steps 1–3)', icon: Layers },
                  { id: 'assembly', label: '2. Assembly Stations Ingestion (Steps 4–6)', icon: Smartphone },
                  { id: 'logistics', label: '3. Logistics & Custody (Step 7)', icon: Truck },
                  { id: 'retail_sale', label: '4. Retail Handover & Customer Sale (Steps 8–9)', icon: UserCheck },
                  { id: 'rma_backtrace', label: '5. Customer Return & Defect Backtrace (Steps 10–12)', icon: AlertOctagon },
                  { id: 'recall_redelivery', label: '6. Batch AAA Recall & Re-Delivery (Steps 13–15)', icon: RotateCcw },
                  { id: 'antitamper_lock', label: '7. Third-Party Fake Part Auto-Lock (Security)', icon: Lock },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={\`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer \${
                        isActive
                          ? 'bg-gradient-to-r from-[#e89d7b] to-[#c67651] text-[#120a07] shadow-lg shadow-[#c67651]/30 font-bold border border-[#e89d7b]'
                          : 'bg-[#160e0a]/90 text-[#cbb5aa] border border-[#d9825b]/25 hover:text-white hover:border-[#e89d7b]/50 hover:bg-[#20140e]'
                      }\`}
                    >
                      <Icon size={14} className={isActive ? 'text-[#120a07]' : 'text-[#e89d7b]'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>`;

if (c.includes(oldTabButtons)) {
  c = c.replace(oldTabButtons, newTabButtons);
  console.log('Successfully replaced 7-step workflow tab buttons with unified dark bronze styling!');
} else {
  console.warn('Tab buttons block not matched directly');
}

fs.writeFileSync('src/pages/PassportPage.tsx', c, 'utf8');
console.log('PassportPage.tsx successfully converted to dark luxury bronze theme!');

