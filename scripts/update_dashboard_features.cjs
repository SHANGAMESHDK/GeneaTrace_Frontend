const fs = require('fs');
let c = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

c = c.replace(/\r\n/g, '\n');

// 1. Add icons to lucide-react import
c = c.replace(
  "  Target\n} from 'lucide-react';",
  "  Target,\n  Download,\n  Store,\n  FileSpreadsheet,\n  Compass\n} from 'lucide-react';"
);

// 2. Add downloadLineageCSV logic & track state inside DashboardPage component
const insertAfterStoreLocations = `  // Dispatched Mobiles Store Geolocation Matrix (matching original content)
  const storeLocations = [`;

const logicSnippet = `  const [quickTrackQuery, setQuickTrackQuery] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickTrackQuery.trim() || showcaseProduct?.productId || 'GT-DEV-00000851';
    navigate(\`/traceability?query=\${encodeURIComponent(q)}\`);
  };

  const downloadLineageCSV = () => {
    const products = store.products || [];
    const headers = [
      'Product ID',
      'Model',
      'Masked IMEI',
      'Status',
      'Installed Display Module',
      'Source Batch',
      'Active Shipment',
      'Store Incident',
      'Blockchain EVM Block',
      'Verification Status'
    ];

    const rows = products.map((p) => [
      p.productId,
      \`"\${p.productModel || 'Galaxy S25 Ultra Titanium Edition'}"\`,
      p.imeiMasked || '356789123456780',
      p.status || 'Recall Flagged',
      (p.installedComponents && p.installedComponents['Display Module']) || 'Serial ABC-0042',
      'Batch ABC (Adhesive Micro-Delamination)',
      'GT-SHP-00000326 (Munich Gateway)',
      'REP-2026-001 (iFix Hub Bangalore)',
      'Block #1849340',
      'SHA-256 Merkle-DAG Verified'
    ]);

    const storeRows = [
      '',
      '--- DISPATCHED STORES GEOLOCATION MATRIX ---',
      'Device Serial,Model,Store Location,City,Shelf Status',
      ...storeLocations.map((s) => [s.serial, \`"\${s.model}"\`, \`"\${s.location}"\`, \`"\${s.city}"\`, \`"\${s.status}"\`].join(','))
    ];

    const csvData = [headers.join(','), ...rows.map((r) => r.join(',')), ...storeRows].join('\\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`GeneaTrace_Manufacturing_Lineage_\${new Date().toISOString().slice(0, 10)}.csv\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };
`;

const stateInsertIndex = c.indexOf(insertAfterStoreLocations);
if (stateInsertIndex !== -1) {
  c = c.substring(0, stateInsertIndex) + logicSnippet + '\n' + c.substring(stateInsertIndex);
}

// 3. Update Executive Header Action Buttons
const oldHeaderButtons = `<div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/traceability')}
            className="btn-glass text-xs py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer group"
          >
            <Search size={14} className="text-[#e89d7b] group-hover:scale-110 transition-transform" />
            <span>Traceability Explorer</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/passport')}
            className="btn-sunset text-xs py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer font-bold"
          >
            <QrCode size={14} />
            <span>Showcase Passport</span>
          </motion.button>
        </div>`;

const newHeaderButtons = `<div className="flex flex-wrap items-center gap-2 font-sans">
          {/* Download CSV Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={downloadLineageCSV}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-[#f7d5c5] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#e89d7b]/50"
            title="Download complete manufacturing lineage report as CSV file"
          >
            <Download size={14} className="text-[#e89d7b]" />
            <span>{downloadSuccess ? 'Downloaded CSV!' : 'Download CSV'}</span>
          </motion.button>

          {/* Track Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/traceability')}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#e89d7b]/50"
            title="Trace product and component Merkle tree"
          >
            <Compass size={14} className="text-[#e89d7b]" />
            <span>Track Option</span>
          </motion.button>

          {/* Shopkeeper Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/shopkeeper-portal')}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#e89d7b]/50"
            title="Open Shopkeeper retail handover & intake portal"
          >
            <Store size={14} className="text-[#34d399]" />
            <span>Shopkeeper Portal</span>
          </motion.button>

          {/* Showcase Passport */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/passport')}
            className="btn-sunset text-xs py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer font-bold"
          >
            <QrCode size={14} />
            <span>DPP Passport</span>
          </motion.button>
        </div>`;

if (c.includes(oldHeaderButtons)) {
  c = c.replace(oldHeaderButtons, newHeaderButtons);
  console.log('Successfully updated executive header buttons with Download CSV, Track Option, and Shopkeeper Portal!');
} else {
  console.warn('Old header buttons not found directly; check exact lines.');
}

// 4. In Showcase Card: Add Quick Track Search Bar
const oldShowcaseHeaderButtons = `<div className="flex items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(\`/passport/\${showcaseProduct?.productId}\`)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Verify DPP</span>
              <ShieldCheck size={14} className="text-emerald-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(\`/traceability?query=\${showcaseProduct?.productId}\`)}
              className="btn-sunset text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <span>Trace Lineage</span>
              <ArrowRight size={14} />
            </motion.button>
          </div>`;

const newShowcaseHeaderButtons = `<div className="flex flex-wrap items-center gap-2 font-sans">
            {/* Quick Track Input form */}
            <form onSubmit={handleQuickTrack} className="flex items-center gap-1.5 bg-[#120a07] border border-[#d9825b]/30 rounded-xl px-2.5 py-1 focus-within:border-[#e89d7b]">
              <Search size={13} className="text-[#a69489]" />
              <input
                type="text"
                placeholder="Track serial / IMEI..."
                value={quickTrackQuery}
                onChange={(e) => setQuickTrackQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-white placeholder-[#7d6b62] focus:outline-hidden w-28 sm:w-36 font-mono"
              />
              <button
                type="submit"
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#e89d7b]/20 hover:bg-[#e89d7b]/30 text-[#f0a887] cursor-pointer transition-colors"
              >
                Track
              </button>
            </form>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/shopkeeper-portal')}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open Shopkeeper Portal"
            >
              <Store size={13} className="text-[#34d399]" />
              <span>Shopkeeper</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={downloadLineageCSV}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-[#f7d5c5] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download Lineage CSV"
            >
              <Download size={13} className="text-[#e89d7b]" />
              <span>CSV</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(\`/passport/\${showcaseProduct?.productId}\`)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-[#d9825b]/30 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Verify DPP</span>
              <ShieldCheck size={13} className="text-emerald-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(\`/traceability?query=\${showcaseProduct?.productId}\`)}
              className="btn-sunset text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <span>Trace Lineage</span>
              <ArrowRight size={13} />
            </motion.button>
          </div>`;

if (c.includes(oldShowcaseHeaderButtons)) {
  c = c.replace(oldShowcaseHeaderButtons, newShowcaseHeaderButtons);
  console.log('Successfully updated showcase card header with Quick Track, Shopkeeper, and CSV download!');
} else {
  console.warn('Old showcase header buttons not found directly; check exact lines.');
}

fs.writeFileSync('src/pages/DashboardPage.tsx', c, 'utf8');
console.log('DashboardPage.tsx successfully updated!');

