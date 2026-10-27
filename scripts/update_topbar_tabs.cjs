const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Topbar.tsx', 'utf8');

c = c.replace(/\r\n/g, '\n');

// Find the nav element in Topbar.tsx
const navStart = '<nav\n          onMouseLeave={handleMouseLeaveMenu}\n          className="relative hidden lg:flex items-center gap-1.5 bg-[#160e0a]/90 p-1.5 rounded-full border border-[#d9825b]/20 shadow-inner"\n        >';

const newNav = `<nav
          onMouseLeave={handleMouseLeaveMenu}
          className="relative hidden lg:flex items-center gap-1 bg-[#160e0a]/90 p-1.5 rounded-full border border-[#d9825b]/20 shadow-inner font-sans"
        >
          {/* Direct Reference Navigation Tabs */}
          {[
            { label: 'Overview', path: '/' },
            { label: 'Traceability', path: '/traceability' },
            { label: 'Digital Passport', path: '/passport' },
            { label: 'Recall', path: '/recalls' },
            { label: 'Manufacturing', path: '/batches' },
            { label: 'Analytics', path: '/analytics' },
            { label: 'Shopkeeper', path: '/shopkeeper-portal' },
          ].map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              onClick={() => setActiveMenu(null)}
              className={({ isActive }) =>
                \`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap \${
                  isActive && !activeMenu
                    ? 'bg-gradient-to-r from-[#e89d7b] to-[#c67651] text-[#120a07] shadow-md shadow-[#c67651]/30 font-bold'
                    : 'text-[#cbb5aa] hover:text-white hover:bg-white/5'
                }\`
              }
            >
              {tab.label}
            </NavLink>
          ))}

          {/* 'More ▾' Trigger for Advanced Mega Menu */}
          <div
            onMouseEnter={() => handleMouseEnterMenu('more')}
            className="relative"
          >
            <button
              onClick={() => setActiveMenu(activeMenu === 'more' ? null : 'more')}
              className={\`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer \${
                activeMenu === 'more'
                  ? 'bg-white/10 text-[#f7d5c5] shadow-inner'
                  : ['/logistics', '/security', '/assembly', '/components', '/scanner', '/company-defects', '/audit', '/settings'].some(p => location.pathname.startsWith(p))
                  ? 'text-[#e89d7b] bg-[#e89d7b]/10 border border-[#e89d7b]/20'
                  : 'text-[#cbb5aa] hover:text-white hover:bg-white/5'
              }\`}
            >
              <span>More</span>
              <ChevronDown
                size={13}
                className={\`transition-transform duration-200 \${
                  activeMenu === 'more' ? 'rotate-180 text-[#e89d7b]' : 'text-[#a69489]'
                }\`}
              />
            </button>

            {/* Mega Menu Expanded Panel */}
            <AnimatePresence>
              {activeMenu === 'more' && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute top-11 -right-24 w-[920px] bg-[#100a07]/98 backdrop-blur-3xl border border-[#d9825b]/30 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.92)] p-6 z-50 text-left overflow-hidden before:absolute before:-top-4 before:inset-x-0 before:h-4 before:content-['']"
                >
                  <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[#e89d7b]/60 to-transparent" />

                  <div className="grid grid-cols-12 gap-6 items-stretch">
                    {/* Featured 3D Card */}
                    <div className="col-span-4">
                      <Card3D
                        title="Global Operations Hub"
                        subtitle="Full-spectrum industrial telemetry, multi-hub logistics, and attestation security."
                        badge="Subsystem Matrix"
                        gradient="from-[#1c120c] via-[#2a170e] to-[#401e10]"
                        glowColor="rgba(217, 130, 91, 0.4)"
                        icon={<Layers size={18} className="text-[#e89d7b]" />}
                        actionText="Explore Logistics"
                        onAction={() => handleNavClick('/logistics')}
                      />
                    </div>

                    {/* Columns 2 & 3: Detailed Menu Items */}
                    <div className="col-span-8 grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="text-[10.5px] font-mono font-bold tracking-[0.16em] text-[#e89d7b] uppercase pb-1 border-b border-white/10">
                          SUPPLY &amp; DISPATCH
                        </div>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleNavClick('/logistics')}
                            className="w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3 group text-left cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#e89d7b] shrink-0 group-hover:scale-105 transition-transform">
                              <Truck size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-white group-hover:text-[#f7d5c5] transition-colors block">
                                Logistics &amp; Carrier Intercept
                              </span>
                              <span className="text-[11px] text-[#a69489] line-clamp-1">
                                Geolocation tracking, carrier hold &amp; shipment status
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => handleNavClick('/scanner')}
                            className="w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3 group text-left cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#e89d7b] shrink-0 group-hover:scale-105 transition-transform">
                              <QrCode size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-white group-hover:text-[#f7d5c5] transition-colors block">
                                Field Scanner Station
                              </span>
                              <span className="text-[11px] text-[#a69489] line-clamp-1">
                                Mobile QR scanner for factory floor ingestion
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => handleNavClick('/company-defects')}
                            className="w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3 group text-left cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#e89d7b] shrink-0 group-hover:scale-105 transition-transform">
                              <AlertTriangle size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-white group-hover:text-[#f7d5c5] transition-colors block">
                                Corporate Defect Hub (RMA)
                              </span>
                              <span className="text-[11px] text-[#a69489] line-clamp-1">
                                Service center defect intake &amp; RMA workflows
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-[10.5px] font-mono font-bold tracking-[0.16em] text-[#e89d7b] uppercase pb-1 border-b border-white/10">
                          SCADA &amp; CRYPTO GOVERNANCE
                        </div>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleNavClick('/assembly')}
                            className="w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3 group text-left cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#e89d7b] shrink-0 group-hover:scale-105 transition-transform">
                              <Factory size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-white group-hover:text-[#f7d5c5] transition-colors block">
                                Assembly Stages &amp; SCADA
                              </span>
                              <span className="text-[11px] text-[#a69489] line-clamp-1">
                                Modular assembly checkpoints &amp; station sensors
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => handleNavClick('/security')}
                            className="w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3 group text-left cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#e89d7b] shrink-0 group-hover:scale-105 transition-transform">
                              <ShieldCheck size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-white group-hover:text-[#f7d5c5] transition-colors block">
                                Anti-Tamper &amp; Hardware Security
                              </span>
                              <span className="text-[11px] text-[#a69489] line-clamp-1">
                                Counterfeit component detection &amp; remote lockout
                              </span>
                            </div>
                          </button>

                          <button
                            onClick={() => handleNavClick('/audit')}
                            className="w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-start gap-3 group text-left cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#e89d7b] shrink-0 group-hover:scale-105 transition-transform">
                              <Blocks size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-white group-hover:text-[#f7d5c5] transition-colors block">
                                Merkle Audit Trail
                              </span>
                              <span className="text-[11px] text-[#a69489] line-clamp-1">
                                EVM cryptographic block audit &amp; DAG verification
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>`;

// Replace from navStart to the end of </nav>
const navEnd = '</nav>';
const navStartIndex = c.indexOf(navStart);
const navEndIndex = c.indexOf(navEnd, navStartIndex);

if (navStartIndex !== -1 && navEndIndex !== -1) {
  const before = c.substring(0, navStartIndex);
  const after = c.substring(navEndIndex + navEnd.length);
  c = before + newNav + after;
  fs.writeFileSync('src/components/layout/Topbar.tsx', c, 'utf8');
  console.log('Successfully updated Topbar navigation tabs with exact labels!');
} else {
  console.error('nav element not found in Topbar.tsx!');
}

