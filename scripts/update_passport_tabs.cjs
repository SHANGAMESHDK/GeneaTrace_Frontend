const fs = require('fs');
let c = fs.readFileSync('src/pages/PassportPage.tsx', 'utf8');

c = c.replace(/\r\n/g, '\n');

const tabMarkerStart = '<div className="flex flex-wrap items-center gap-1.5">';
const tabMarkerEnd = '{/* TAB 1: Genesis & Null Container (Steps 1–3) */}';

const startIndex = c.indexOf(tabMarkerStart);
const endIndex = c.indexOf(tabMarkerEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `<div className="flex flex-wrap items-center gap-2 font-sans">
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
              </div>
            </div>
          </div>

          `;

  c = c.substring(0, startIndex) + replacement + c.substring(endIndex);
  fs.writeFileSync('src/pages/PassportPage.tsx', c, 'utf8');
  console.log('Successfully updated workflow tab buttons with dark luxury bronze theme!');
} else {
  console.error('Could not find tab buttons markers!');
}

