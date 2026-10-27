const fs = require('fs');
let c = fs.readFileSync('src/pages/PassportPage.tsx', 'utf8');

c = c.replace(/\r\n/g, '\n');

// Replace all blue #0284c7 with warm copper #d9825b or #e89d7b
c = c.replace(/border-l-\[#0284c7\]/g, 'border-l-[#e89d7b]');
c = c.replace(/bg-\[#0284c7\]/g, 'bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07]');
c = c.replace(/text-\[#0284c7\]/g, 'text-[#e89d7b]');
c = c.replace(/border-\[#0284c7\]/g, 'border-[#d9825b]/40');

// Step 3 payload badge
c = c.replace(
  'className="text-xs px-2 py-0.5 bg-white text-[#e89d7b] border border-[#d9825b]/40 font-mono font-bold inline-block"',
  'className="text-xs px-2.5 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-lg font-mono font-bold inline-block"'
);

// Demonstration token card
c = c.replace('bg-slate-900 border border-slate-800', 'bg-[#160e0a] border border-[#d9825b]/30 shadow-2xl');
c = c.replace('bg-sky-500/20 text-sky-400 font-mono text-[10px] font-bold uppercase border border-sky-500/30', 'bg-[#e89d7b]/15 text-[#f0a887] font-mono text-[10px] font-bold uppercase border border-[#e89d7b]/30');
c = c.replace('px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all', 'btn-sunset text-xs flex items-center gap-2');
c = c.replace('px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 border border-slate-700 transition-all', 'btn-glass text-xs flex items-center gap-1.5');
c = c.replace('className="bg-white p-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 text-slate-950"', 'className="bg-[#1c120d] p-4 rounded-2xl border border-[#d9825b]/30 shadow-2xl flex flex-col items-center gap-2 text-white"');

// Clean duplicate classes
c = c.replace(/border border-\[#d9825b\]\/20 border border-\[#d9825b\]\/20/g, 'border border-[#d9825b]/20');
c = c.replace(/vintage-card /g, '');

// Clean Tab 2, 3, 4, 5, 6, 7 colored cards
c = c.replace(/border-l-\[#2e6b4d\]/g, 'border-l-emerald-500');
c = c.replace(/border-l-\[#b87428\]/g, 'border-l-amber-500');
c = c.replace(/border-l-\[#413634\]/g, 'border-l-[#e89d7b]');
c = c.replace(/border-l-\[#b84a44\]/g, 'border-l-rose-500');
c = c.replace(/border-l-\[#7c3aed\]/g, 'border-l-purple-500');

fs.writeFileSync('src/pages/PassportPage.tsx', c, 'utf8');
console.log('Successfully polished PassportPage palette!');

