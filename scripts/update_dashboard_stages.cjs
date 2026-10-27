const fs = require('fs');
const path = 'src/pages/DashboardPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const startMarker = '{/* ─────────────────────────────────────────────────────────────\n          5. INTERACTIVE DEMONSTRATION FLOW';
const endMarker = '{/* ─────────────────────────────────────────────────────────────\n          6. DISPATCHED MOBILES';

// Normalize line endings to \n
content = content.replace(/\r\n/g, '\n');

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacementStr = `{/* ─────────────────────────────────────────────────────────────
          5. INTERACTIVE DEMONSTRATION FLOW (Complete 6-Stage Sequential Workflow from Git)
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="p-6 bg-[#140c08]/90 border border-[#d9825b]/25 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl"
      >
        <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-serif font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-[#e89d7b]" />
              <span>Full Project Lifecycle Walkthrough (Interactive Jury Flow)</span>
            </h3>
            <p className="text-xs text-[#cbb5aa] mt-0.5 font-sans">
              Click any stage below to demonstrate the end-to-end workflow live to the jury.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#e89d7b]/15 text-[#f0a887] border border-[#e89d7b]/30 font-mono self-start sm:self-auto">
            6 Sequential Stages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 font-sans">
          {/* Stage 1: Manufacturer Batch Creation */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/batches')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Batch AAA &amp; Serial Init</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              Manufacturer assigns Batch <strong className="text-white">AAA</strong>. Cryptographic Blockchain serial <strong className="text-white">AAA12345678</strong> is created (null container ready).
            </p>
          </motion.div>

          {/* Stage 2: Scanner Stage Ingestion */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/scanner')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Mobile /scanner Stages</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              Every stage (SMT-01, DISP-04, SEC-02, AOI-01) pushes timestamp &amp; machine attestation hash.
            </p>
          </motion.div>

          {/* Stage 3: Digital Product Passport */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/passport/GT-DEV-00000851')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  3
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Digital Product Passport (DPP)</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              Inspect the consumer-facing passport and trigger instant cryptographic verification against the EVM root.
            </p>
          </motion.div>

          {/* Stage 4: Retail Customer Sale */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/shopkeeper-portal')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  4
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Retail Customer Sale</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              Retailer uploads customer selling details (<strong className="text-white">Vikram Malhotra</strong>, invoice INV-8812) into the DPP.
            </p>
          </motion.div>

          {/* Stage 5: Defect RMA, Backtrace & Recall */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/recalls')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  5
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Backtrace &amp; Batch Recall</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              Customer issue returned ➔ Manufacturer backtraces to Machine <strong className="text-white">DISP-04</strong> ➔ Recalls Batch AAA ➔ Sends repaired unit to retail.
            </p>
          </motion.div>

          {/* Stage 6: 3rd Party Tamper Lockout */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/security')}
            className="p-4 bg-[#1c120d]/80 hover:bg-[#251812] border border-[#d9825b]/20 hover:border-[#e89d7b]/40 rounded-2xl cursor-pointer transition-all space-y-1.5 group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#e89d7b] to-[#b85d38] text-[#120a07] flex items-center justify-center text-xs font-bold font-mono">
                  6
                </span>
                <span className="group-hover:text-[#f7d5c5] transition-colors">Anti-Tamper Lockout</span>
              </span>
              <ChevronRight size={16} className="text-[#a69489] group-hover:text-[#e89d7b] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-xs text-[#cbb5aa] leading-relaxed pl-8">
              3rd-party shop swaps in counterfeit screen (<strong className="text-white">FAKE-DISP-9999</strong>). When connected to internet, attestation engine triggers remote lock!
            </p>
          </motion.div>
        </div>
      </motion.div>

      `;

  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  fs.writeFileSync(path, before + replacementStr + after, 'utf8');
  console.log('Successfully replaced 4-step flow with 6-stage sequential workflow!');
} else {
  console.error('Markers not found! startIndex:', startIndex, 'endIndex:', endIndex);
}

