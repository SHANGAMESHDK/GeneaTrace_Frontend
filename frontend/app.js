/* ================================================================
   GENATRACE  -  Frontend Application Logic
================================================================ */

// PAGE MAP
const pageMap = {
  dashboard:'Dashboard', erp:'ERP System', mes:'MES System',
  scada:'SCADA System', lineage:'Lineage Graph',
  recall:'Recall Engine', passport:'Product Passport'
};

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  const nav  = document.getElementById('nav-' + id);
  if (page) page.classList.remove('hidden');
  if (nav)  nav.classList.add('active');
  document.getElementById('breadcrumb-current').textContent = pageMap[id] || id;
  if (id === 'erp')     initERPData();
  if (id === 'mes')     initMESData();
  if (id === 'scada')   initSCADAData();
  if (id === 'lineage') setTimeout(runTrace, 80);
}

document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); showPage(el.dataset.page); });
});

document.querySelectorAll('.mobile-nav-item').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.mobile-nav-item').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
  });
});

const hb = document.getElementById('hamburger');
if (hb) {
  hb.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

function updateClock() {
  const clk = document.getElementById('dashboard-clock');
  if (clk) {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    clk.textContent = day + ', ' + date + ' ' + month + ' ' + year + ' | ' + hours + ':' + minutes + ' ' + ampm;
  }
}
setInterval(updateClock, 1000);
updateClock();

function executeTopSearch(val) {
  if (!val) return;
  const q = val.trim().toUpperCase();
  if (q.includes('S24') || q.includes('SM-') || q.includes('SN') || q.includes('PASSPORT') || q.includes('00841')) {
    showPage('passport');
    loadPassport(val.trim());
  } else if (q.includes('BAT') || q.includes('PO-') || q.includes('MAT')) {
    showPage('erp');
    toast('Searching ERP for ' + val, 'info');
  } else if (q.includes('WO-') || q.includes('LINE')) {
    showPage('mes');
    toast('Searching MES for ' + val, 'info');
  } else if (q.includes('SEN-') || q.includes('TEMP') || q.includes('MCH')) {
    showPage('scada');
    toast('Searching SCADA for ' + val, 'info');
  } else {
    showPage('passport');
    loadPassport(val.trim());
  }
}

function switchSCADAMachine(machineId) {
  const readings = {
    m3: { temp: '28.4 °C', vib: '0.32 mm/s', press: '4.8 bar', hum: '45.2 %' },
    m1: { temp: '24.1 °C', vib: '0.18 mm/s', press: '5.1 bar', hum: '42.0 %' },
    m2: { temp: '26.8 °C', vib: '0.24 mm/s', press: '4.9 bar', hum: '44.5 %' },
    m4: { temp: '68.2 °C', vib: '0.85 mm/s', press: '6.2 bar', hum: '58.4 %' }
  };
  const r = readings[machineId] || readings.m3;
  const tempEl = document.getElementById('scada-val-temp');
  const vibEl = document.getElementById('scada-val-vib');
  const pressEl = document.getElementById('scada-val-press');
  const humEl = document.getElementById('scada-val-hum');
  if (tempEl) tempEl.textContent = r.temp;
  if (vibEl) vibEl.textContent = r.vib;
  if (pressEl) pressEl.textContent = r.press;
  if (humEl) humEl.textContent = r.hum;
  toast('Switched to ' + machineId.toUpperCase() + ' telemetry stream', 'info');
}

function switchERPSubtab(el, tab) {
  document.querySelectorAll('#page-erp .gt-subtab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  toast('ERP View: ' + tab.toUpperCase(), 'info');
}

function switchMESTab(el, tab) {
  document.querySelectorAll('#page-mes .gt-subtab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  toast('MES View: ' + tab.toUpperCase(), 'info');
}

function switchPassportTab(el, tabName) {
  document.querySelectorAll('.passport-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');

  // Hide all passport view containers
  ['overview', 'batch', 'location', 'sensor', 'docs'].forEach(view => {
    const vEl = document.getElementById('pp-view-' + view);
    if (vEl) vEl.style.display = 'none';
  });

  if (tabName === 'overview') {
    const v = document.getElementById('pp-view-overview');
    if (v) v.style.display = 'grid';
  } else if (tabName === 'lineage') {
    showPage('lineage');
    toast('Navigated to full cryptographic Merkle-DAG lineage graph', 'info');
  } else {
    const target = document.getElementById('pp-view-' + tabName);
    if (target) target.style.display = 'block';
  }
}

function handleGlobalSearchInput(val) {
  const dropdown = document.getElementById('search-suggestions-dropdown');
  if (!dropdown) return;
  if (!val || val.trim().length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  const q = val.trim().toLowerCase();
  const suggestions = [
    { title: 'Galaxy S24 Ultra (512GB)', sub: 'Serial: S24U123456789 · Chennai Store', type: 'passport', id: 'S24U123456789' },
    { title: 'Galaxy S24 Ultra (Titanium Gray)', sub: 'Serial: SM-S928-IND-00841 · BKC Mumbai Store #101', type: 'passport', id: 'SM-S928-IND-00841' },
    { title: 'BAT-2024-X49 (Samsung SDI 5000mAh)', sub: 'Battery Cell Lot · Flagged in SEN-T-010', type: 'recall', id: 'BAT-2024-X49' },
    { title: 'WO-4587 (Galaxy S24 Ultra SMT Run)', sub: 'Active MES Work Order · Line 1 Assembly', type: 'mes', id: 'WO-4587' },
    { title: 'PO-1081 (Samsung SDI Battery Cell)', sub: 'ERP Purchase Order · Delivered', type: 'erp', id: 'PO-1081' },
    { title: 'SEN-T-010 (Reflow Zone 4 Thermal Sensor)', sub: 'SCADA Telemetry · Drift Warning', type: 'scada', id: 'm4' }
  ].filter(s => s.title.toLowerCase().includes(q) || s.sub.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));

  if (suggestions.length === 0) {
    dropdown.innerHTML = '<div style="padding:10px 16px;color:#94A3B8;font-size:12px">No matching serials or batches found</div>';
    dropdown.style.display = 'block';
    return;
  }

  dropdown.innerHTML = suggestions.map(s => {
    return '<div class="search-sugg-item" onclick="selectSuggestion(\'' + s.type + '\', \'' + s.id + '\')" style="padding:8px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #F1F5F9;font-size:12px">' +
      '<div><div style="font-weight:600;color:#0F172A">' + s.title + '</div><div style="font-size:10.5px;color:#64748B">' + s.sub + '</div></div>' +
      '<span class="status-pill in-progress">' + s.type.toUpperCase() + '</span>' +
    '</div>';
  }).join('');
  dropdown.style.display = 'block';
}

function selectSuggestion(type, id) {
  const dropdown = document.getElementById('search-suggestions-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  const sInput = document.getElementById('global-search-input');
  if (sInput) sInput.value = id;
  if (type === 'passport') {
    showPage('passport');
    loadPassport(id);
  } else if (type === 'recall') {
    showPage('recall');
    const bInput = document.getElementById('recall-batch-id');
    if (bInput) bInput.value = id;
    runRecall();
  } else if (type === 'erp') {
    showPage('erp');
  } else if (type === 'mes') {
    showPage('mes');
  } else if (type === 'scada') {
    showPage('scada');
    switchSCADAMachine(id);
  }
}

document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('search-suggestions-dropdown');
  const searchInput = document.getElementById('global-search-input');
  if (dropdown && e.target !== searchInput && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

function downloadPassportCertificate() {
  const serial = (document.getElementById('pp-serial-display') || {}).textContent || 'S24U123456789';
  const content =
    '========================================================================\n' +
    'GENATRACE — OFFICIAL DIGITAL PRODUCT PASSPORT (DPP) CERTIFICATE\n' +
    'Conformity with EU DPP Directive & Cryptographic Merkle-DAG Ledger\n' +
    '========================================================================\n\n' +
    'DEVICE IDENTIFICATION:\n' +
    'Model: Samsung Galaxy S24 Ultra · 512GB Titanium Gray\n' +
    'Serial Number: ' + serial + '\n' +
    'IMEI: 358941092847190\n' +
    'Batch Number: B-2504-17 (Battery Lot: BAT-2024-X49)\n' +
    'Assembly Started: 2024-10-10 08:14:22 IST\n' +
    'Assembly Completed: 2024-10-10 16:45:10 IST\n' +
    'Current Retail Location: Chennai Store - ELC001\n\n' +
    'CRYPTOGRAPHIC PROOF:\n' +
    'Merkle State Root: 0xf1d489c2a3b710de9481b7e0a294817cb209148d90184b2e8\n' +
    'Digital Signature: Ed25519 Verified by GeneaTrace Root Authority\n' +
    'Timestamp: ' + new Date().toISOString() + '\n' +
    '========================================================================\n';
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'GeneaTrace_Product_Passport_' + serial + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast('Passport Certificate downloaded for ' + serial, 'success');
}

function animateCount(el, target, duration) {
  duration = duration || 1200;
  const start = performance.now();
  const update = function(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function toast(msg, type, dur) {
  type = type || 'info'; dur = dur || 3500;
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  const icons = { success:'✓', warn:'⚠', error:'✕', info:'ℹ' };
  t.innerHTML = '<span style="font-size:15px">' + (icons[type]||'ℹ') + '</span><span>' + msg + '</span>';
  c.appendChild(t);
  setTimeout(function() { t.style.animation = 'slide-in .3s ease reverse'; setTimeout(function(){ t.remove(); }, 300); }, dur);
}

document.querySelectorAll('.tab-bar').forEach(function(bar) {
  bar.addEventListener('click', function(e) {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    bar.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    tab.classList.add('active');
    const tabId = tab.dataset.tab;
    const parent = bar.closest('.page');
    parent.querySelectorAll('.tab-content').forEach(function(c) { c.classList.add('hidden'); });
    const target = document.getElementById(tabId);
    if (target) target.classList.remove('hidden');
  });
});

/* ── UNIVERSAL TRACE RESOLVER (Dashboard Hero) ── */
const UNIVERSAL_LOOKUP = {
  'SM-S928-IND-00841': {
    title: 'SM-S928-IND-00841 · Galaxy S24 Ultra (512GB Titanium Gray)',
    sys: 'DPP / MES / ERP Unified Passport',
    batch: 'BAT-2024-X49 (Samsung SDI 5000mAh Dual-Cell)',
    wo: 'WO-SMT-2024-1841 · Cleanroom SMT Line 03',
    sensor: 'Reflow Zone 4: 242.4 °C · Ultrasonic Weld: 38.5 J',
    serial: 'SM-S928-IND-00841',
    status: 'ACTIVE ON RETAIL SHELF',
    statusClass: 'gt-pill-active',
    storeLoc: 'Samsung Flagship BKC Store, Mumbai (Store #101)',
    sisterCount: '287 Sister Mobiles in Batch BAT-2024-X49',
    mfgTime: 'Started: 2024-10-10 08:14 IST · Finished: 16:45 IST',
    hash: '0xf1d489c2...7e0a',
    erpPO: 'PO-SDI-2024-912'
  },
  'BAT-2024-X49': {
    title: 'BAT-2024-X49 · Samsung SDI 5000mAh Battery Cell Lot',
    sys: 'ERP Component Supply (Samsung SDI Co.)',
    batch: 'BAT-2024-X49',
    wo: 'WO-SMT-2024-1841 (SMT Line 3)',
    sensor: 'SEN-T-010 Quenching & Thermal Cycling: 68.2 °C (DRIFT ALERT)',
    serial: 'SM-S928-IND-00841',
    status: 'FLAGGED FOR PRECISION RECALL',
    statusClass: 'gt-pill-danger',
    storeLoc: 'Distributed to 4 Stores (Mumbai, Bengaluru, Delhi, Hyderabad) + 1 Logistics Hub',
    sisterCount: '287 Mobiles Assembled (92.5% Narrowed Blast Radius)',
    mfgTime: 'Received: 2024-09-14 · Tested: 2024-09-15',
    hash: '0xa3f7c1d9...b22e',
    erpPO: 'PO-SDI-2024-912'
  },
  'WO-SMT-2024-1841': {
    title: 'WO-SMT-2024-1841 · Cleanroom SMT Placement & Battery Assembly',
    sys: 'MES (Station: SMT-002 Pick-and-Place & Ultrasonic Cell)',
    batch: 'BAT-2024-X49',
    wo: 'WO-SMT-2024-1841',
    sensor: 'AOI Solder Coplanarity: 0.02 mm · Nitrogen O2: 14 ppm',
    serial: 'SM-S928-IND-00841',
    status: 'COMPLETED & SEALED',
    statusClass: 'gt-pill-active',
    storeLoc: 'Dispatched to Western Distribution Channel',
    sisterCount: '500 Mobiles in Work Order Run',
    mfgTime: 'Shift A · Lead Tech Ravi Shankar',
    hash: '0xc4a12e87...d91f',
    erpPO: 'PO-SDI-2024-912'
  },
  'SEN-T-010': {
    title: 'SEN-T-010 · Reflow Zone 4 & Battery Thermal Sensor',
    sys: 'SCADA (OPC-UA High-Frequency Telemetry)',
    batch: 'BAT-2024-X49',
    wo: 'WO-SMT-2024-1841',
    sensor: 'SEN-T-010 Peak: 68.2 °C (Threshold Limit: 60.0 °C Exceeded)',
    serial: 'SM-S928-IND-00841',
    status: 'ALARM FLAGGED FOR DEFECT RECALL',
    statusClass: 'gt-pill-danger',
    storeLoc: 'Linked to 287 Mobiles in Retail Transit',
    sisterCount: 'Triggering Root Cause in Merkle DAG',
    mfgTime: 'Sampled at 10 Hz IEC 61850 Stream',
    hash: '0xb8c93fa1...7f3c',
    erpPO: 'PO-SDI-2024-912'
  },
  'BATCH-2024-0192': {
    title: 'BATCH-2024-0192 · AISI 4340 Alloy Steel / Chassis Lot',
    sys: 'ERP (Titanium Frame Lot TSL-0192)',
    batch: 'BAT-2024-X49',
    wo: 'WO-SMT-2024-1841',
    sensor: 'SEN-T-001: 218.3 °C (Normal)',
    serial: 'SM-S928-IND-00841',
    status: 'ACTIVE IN PRODUCTION',
    statusClass: 'gt-pill-active',
    storeLoc: 'Samsung Flagship Store BKC, Mumbai',
    sisterCount: '287 Sister Mobiles',
    mfgTime: '2024-09-14 Receipt',
    hash: '0xa3f7c1d9...b22e',
    erpPO: 'PO-2024-0841'
  },
  'FG-SN-2024-00841': {
    title: 'SM-S928-IND-00841 · Galaxy S24 Ultra (512GB Titanium Gray)',
    sys: 'DPP (Product Passport)',
    batch: 'BAT-2024-X49',
    wo: 'WO-SMT-2024-1841',
    sensor: 'All Sensors Verified within Merkle DAG',
    serial: 'SM-S928-IND-00841',
    status: 'INTEGRITY VERIFIED',
    statusClass: 'gt-pill-active',
    storeLoc: 'Samsung Flagship BKC Store, Mumbai',
    sisterCount: '287 Sister Mobiles in Batch',
    mfgTime: '2024-10-10 Assembly Complete',
    hash: '0xf1d489c2...7e0a',
    erpPO: 'PO-2024-0841'
  }
};

function handleUniversalSearch(val) {
  if (!val) { closeUniversalPreview(); return; }
  const clean = val.trim().toUpperCase();
  const found = Object.keys(UNIVERSAL_LOOKUP).find(function(k) { return k.includes(clean) || clean.includes(k); });
  if (found) renderUniversalPreview(UNIVERSAL_LOOKUP[found]);
}

function quickSelectTrace(id) {
  const input = document.getElementById('gt-universal-search');
  if (input) input.value = id;
  const targetId = UNIVERSAL_LOOKUP[id] ? id : (id === 'FG-SN-2024-00841' ? 'SM-S928-IND-00841' : (id === 'BATCH-2024-0192' ? 'BAT-2024-X49' : 'SM-S928-IND-00841'));
  if (UNIVERSAL_LOOKUP[targetId]) renderUniversalPreview(UNIVERSAL_LOOKUP[targetId]);
}

function executeUniversalSearch() {
  const input = document.getElementById('gt-universal-search');
  const val = input ? input.value.trim().toUpperCase() : '';
  if (!val) { quickSelectTrace('SM-S928-IND-00841'); return; }
  const found = Object.keys(UNIVERSAL_LOOKUP).find(function(k) { return k.includes(val) || val.includes(k); }) || 'SM-S928-IND-00841';
  renderUniversalPreview(UNIVERSAL_LOOKUP[found]);
}

function renderUniversalPreview(data) {
  const card = document.getElementById('gt-search-preview');
  if (!card) return;
  card.classList.remove('hidden');
  document.getElementById('gt-sp-title').innerHTML = data.title + ' <span class="gt-pill ' + data.statusClass + '" style="margin-left:8px">' + data.status + '</span>';
  document.getElementById('gt-sp-grid').innerHTML =
    '<div class="gt-sp-item"><span class="gt-sp-key">Origin Subsystem</span><span class="gt-sp-val" style="color:var(--lineage)">' + data.sys + '</span></div>' +
    '<div class="gt-sp-item"><span class="gt-sp-key">Component Battery Lot</span><span class="gt-sp-val" style="color:var(--erp);cursor:pointer" onclick="jumpToERP(\'' + data.batch + '\')">' + data.batch + '</span></div>' +
    '<div class="gt-sp-item"><span class="gt-sp-key">Manufacturing Timeline</span><span class="gt-sp-val" style="color:var(--text);font-family:var(--mono);font-size:11px">' + (data.mfgTime || '2024-10-10') + '</span></div>' +
    '<div class="gt-sp-item"><span class="gt-sp-key">MES Cleanroom Work Order</span><span class="gt-sp-val" style="color:var(--mes);cursor:pointer" onclick="jumpToMES(\'' + data.batch + '\')">' + data.wo + '</span></div>' +
    '<div class="gt-sp-item"><span class="gt-sp-key">Current Store / Retail Location</span><span class="gt-sp-val" style="color:var(--lineage);font-weight:700">' + (data.storeLoc || 'Samsung BKC Flagship Experience Center, Mumbai') + '</span></div>' +
    '<div class="gt-sp-item"><span class="gt-sp-key">Sister Units in Same Batch</span><span class="gt-sp-val" style="color:var(--recall);font-weight:700">' + (data.sisterCount || '287 Mobiles Across 4 Stores') + '</span></div>';
  document.getElementById('gt-sp-actions').innerHTML =
    '<button class="btn btn-sm btn-outline" onclick="showPage(\'lineage\')">View in Lineage DAG</button>' +
    '<button class="btn btn-sm btn-primary" onclick="loadPassportFromId(\'' + data.serial + '\')">Inspect Digital Passport &amp; Store Map</button>' +
    '<button class="btn btn-sm btn-danger" onclick="jumpToRecallDefect(\'BAT-2024-X49\')">Run Targeted Recall Analysis</button>';
}

function loadPassportFromId(id) {
  showPage('passport');
  const inp1 = document.getElementById('passport-serial');
  const inp2 = document.getElementById('passport-serial-input');
  if (inp1) inp1.value = id;
  if (inp2) inp2.value = id;
  loadPassport(id);
}

function closeUniversalPreview() {
  const card = document.getElementById('gt-search-preview');
  if (card) card.classList.add('hidden');
}

function filterStoreMatrix(filter) {
  toast('Store Matrix Filter: ' + filter + ' active (48 retail locations synchronized)', 'info');
}

/* ── MOCK DATA ── */
const SUPPLIERS = [
  {name:'Tata Steel Ltd',id:'SUP-001',batches:184,orders:42,rating:5},
  {name:'JSW Materials',id:'SUP-002',batches:97,orders:28,rating:4},
  {name:'Hindalco Alloys',id:'SUP-003',batches:213,orders:61,rating:5},
  {name:'SAIL Forging',id:'SUP-004',batches:56,orders:14,rating:3},
  {name:'Vedanta Metals',id:'SUP-005',batches:79,orders:22,rating:4},
  {name:'Minda Industries',id:'SUP-006',batches:121,orders:33,rating:5}
];

const PO_DATA = [
  {po:'PO-2024-0841',sup:'Tata Steel Ltd',mat:'AISI 4340 Steel',qty:2400,unitPrice:125,date:'2024-09-12',batch:'BATCH-2024-0192',status:'Purchase Order',stage:'po',conf:1.0},
  {po:'PO-2024-0722',sup:'Hindalco Alloys',mat:'Al 6061-T6',qty:800,unitPrice:280,date:'2024-09-08',batch:'BATCH-2024-0174',status:'Received',stage:'done',conf:0.95},
  {po:'PO-2024-0698',sup:'JSW Materials',mat:'SS 316L Sheet',qty:350,unitPrice:340,date:'2024-08-30',batch:'BATCH-2024-0161',status:'To Approve',stage:'approve',conf:0.82},
  {po:'PO-2024-0654',sup:'SAIL Forging',mat:'EN24 Alloy',qty:1100,unitPrice:165,date:'2024-08-22',batch:'BATCH-2024-0148',status:'Purchase Order',stage:'po',conf:0.95},
  {po:'PO-2024-0620',sup:'Vedanta Metals',mat:'Titanium Grade 5',qty:120,unitPrice:1450,date:'2024-08-15',batch:'BATCH-2024-0139',status:'RFQ Sent',stage:'sent',conf:0.72},
  {po:'PO-2024-0589',sup:'Minda Industries',mat:'Bearing Steel SUJ2',qty:600,unitPrice:190,date:'2024-08-08',batch:'BATCH-2024-0121',status:'Received',stage:'done',conf:1.0},
  {po:'PO-2024-0541',sup:'Tata Steel Ltd',mat:'CK45 Carbon Steel',qty:1800,unitPrice:95,date:'2024-07-29',batch:'BATCH-2024-0108',status:'Draft RFQ',stage:'draft',conf:0.91}
];

const BATCH_DATA = [
  {id:'BAT-2024-X49',mat:'Samsung SDI 5000mAh Battery Cell',lot:'SDI-L240912-X49',recv:'2024-09-14',qty:5000,qc:'Pass',hash:'0xa3f7c1d9...b22e'},
  {id:'DISP-QHD-882',mat:'Dynamic AMOLED 2X 120Hz LTPO',lot:'SDC-L240910-A',recv:'2024-09-10',qty:2500,qc:'Pass',hash:'0xb8e4a912...cc31'},
  {id:'AP-8GEN3-LOT9',mat:'Snapdragon 8 Gen 3 for Galaxy (4nm)',lot:'QCOM-L240830-4NM',recv:'2024-09-01',qty:4000,qc:'Pass',hash:'0xd1293fe0...7a1b'},
  {id:'CHAS-TI-042',mat:'Aerospace Grade 5 Titanium Frame',lot:'TI-L240822-C',recv:'2024-08-24',qty:3000,qc:'Pass',hash:'0xf4b67c3a...9012'},
  {id:'BATCH-2024-0192',mat:'AISI 4340 Alloy Frame Batch',lot:'TSL-L240912-A',recv:'2024-09-14',qty:2400,qc:'Pass',hash:'0xa3f7c1d9...b22e'}
];

const GRN_DATA = [
  {grn:'GRN-2024-0312',po:'PO-2024-0841',by:'Rajesh Kumar',date:'2024-09-14',items:3,status:'Accepted'},
  {grn:'GRN-2024-0298',po:'PO-2024-0722',by:'Priya Nair',date:'2024-09-10',items:1,status:'Accepted'},
  {grn:'GRN-2024-0281',po:'PO-2024-0698',by:'Arjun Mehta',date:'2024-09-01',items:2,status:'Rejected'},
  {grn:'GRN-2024-0270',po:'PO-2024-0654',by:'Sathish T',date:'2024-08-24',items:4,status:'Accepted'}
];

const WO_DATA = [
  {wo:'WO-SMT-2024-1841',prod:'Galaxy S24 Ultra (512GB Titanium)',batch:'BAT-2024-X49',machine:'SMT-002',start:'2024-10-10 08:14',end:'2024-10-10 16:45',op:'Ravi Shankar',status:'Completed'},
  {wo:'WO-SMT-2024-1837',prod:'Galaxy S24+ (256GB Sapphire)',batch:'DISP-QHD-882',machine:'REFLOW-001',start:'2024-10-11 09:15',end:'',op:'Karthik M',status:'In Progress'},
  {wo:'WO-SMT-2024-1829',prod:'Galaxy S24 Base (128GB Onyx)',batch:'AP-8GEN3-LOT9',machine:'AOI-001',start:'2024-10-09 07:00',end:'2024-10-09 15:00',op:'Siva R',status:'Completed'},
  {wo:'WO-SMT-2024-1812',prod:'Galaxy Z Fold 6 (Crafted Black)',batch:'CHAS-TI-042',machine:'WELD-001',start:'2024-10-08 10:00',end:'',op:'Deepak N',status:'Paused'},
  {wo:'WO-SMT-2024-1798',prod:'Galaxy Z Flip 6 (Mint)',batch:'BAT-2024-X49',machine:'PACK-001',start:'2024-10-12 06:30',end:'',op:'Anand P',status:'In Progress'}
];

const OPS_LOG = [
  {time:'08:14:22',wo:'WO-SMT-2024-1841',op:'Laser Stencil Solder Printing',machine:'PRNT-001',dur:360,result:'Pass'},
  {time:'10:23:14',wo:'WO-SMT-2024-1841',op:'High-Speed SMT Chip Placement',machine:'SMT-002',dur:1240,result:'Pass'},
  {time:'12:45:02',wo:'WO-SMT-2024-1841',op:'10-Zone Nitrogen Reflow Soldering',machine:'REFLOW-001',dur:1800,result:'Pass'},
  {time:'14:12:38',wo:'WO-SMT-2024-1841',op:'Ultrasonic Battery Dual-Tab Welder',machine:'WELD-001',dur:480,result:'Pass'},
  {time:'15:30:22',wo:'WO-SMT-2024-1841',op:'5G Sub-6 & mmWave RF Calibration',machine:'TEST-001',dur:720,result:'Pass'}
];

const REWORK = [
  {id:'RW-2024-0041',title:'Gear Hobbing Dimension Out of Spec',wo:'WO-2024-1829',machine:'HOBB-001',detected:'2024-10-09 14:12',root:'Worn tool cutter - replaced',action:'Re-hob with fresh cutter; re-inspect CMM'},
  {id:'RW-2024-0038',title:'Surface Roughness Failure on Shaft',wo:'WO-2024-1799',machine:'GRIND-002',detected:'2024-10-07 11:30',root:'Coolant contamination detected',action:'Flush coolant system; re-grind surface'}
];

const OEE_DATA = [
  {machine:'CNC-001',oee:91.2,avail:96,perf:95,qual:99},
  {machine:'LATHE-003',oee:87.4,avail:92,perf:96,qual:98},
  {machine:'VMC-007',oee:83.1,avail:89,perf:94,qual:99},
  {machine:'HOBB-001',oee:74.8,avail:84,perf:90,qual:98},
  {machine:'GRIND-002',oee:88.6,avail:93,perf:96,qual:99},
  {machine:'CNC-004',oee:79.3,avail:87,perf:92,qual:98}
];

const SENSORS = [
  {id:'SEN-T-001',name:'SMT Reflow Zone 1 Pre-heat',val:168.2,unit:'°C',pct:68,status:'ok'},
  {id:'SEN-T-002',name:'SMT Reflow Zone 4 Peak Liquidus',val:242.4,unit:'°C',pct:82,status:'ok'},
  {id:'SEN-P-003',name:'SMT Vacuum Pick & Place Nozzle',val:-88.4,unit:'kPa',pct:88,status:'ok'},
  {id:'SEN-W-004',name:'Ultrasonic Battery Welder Energy',val:38.5,unit:'J',pct:72,status:'ok'},
  {id:'SEN-C-005',name:'Cleanroom ISO Class 5 Particles',val:28.0,unit:'ct/m³',pct:28,status:'ok'},
  {id:'SEN-N-006',name:'Nitrogen Chamber Inerting O2',val:14.2,unit:'ppm',pct:35,status:'ok'},
  {id:'SEN-U-007',name:'Dispenser Underfill UV Curing',val:82.1,unit:'°C',pct:70,status:'ok'},
  {id:'SEN-T-010',name:'Battery Thermal Cycling & Quench',val:68.2,unit:'°C',pct:95,status:'alarm'},
  {id:'SEN-O-009',name:'3D AOI Solder Joint Coplanarity',val:0.02,unit:'mm',pct:40,status:'ok'},
  {id:'SEN-R-010',name:'5G Sub-6/mmWave RF Calibration',val:-94.2,unit:'dBm',pct:85,status:'ok'}
];

const ALARMS = [
  {type:'critical',icon:'\u{1F534}',title:'Battery Thermal Cycling Exceeded (>60.0°C)',detail:'SEN-T-010 | 68.2°C > 60.0°C Threshold | Battery Lot BAT-2024-X49 Flagged for Recall',time:'2 min ago'},
  {type:'warning',icon:'\u{1F7E1}',title:'SMT Reflow Zone 4 Peak Gradient High',detail:'SEN-T-002 | 242.4°C approaching 250°C window | SMT Line 03',time:'11 min ago'},
  {type:'warning',icon:'\u{1F7E1}',title:'Cleanroom Bay 2 Humidity at 54% RH',detail:'Cleanroom Air Handling Unit | Target: 45-50% RH | Nitrogen Purge Active',time:'19 min ago'},
  {type:'info',icon:'\u{1F535}',title:'Battery Ultrasonic Welder Calibration Verified',detail:'SEN-W-004 | 38.5 J nominal bond confirmed for Lot BAT-2024-X49',time:'38 min ago'},
  {type:'info',icon:'\u{1F535}',title:'Automated Optical Inspection 100% Passed',detail:'AOI-001 | 500/500 units zero solder bridging | SMT Line 03',time:'1 hr ago'}
];

const MACHINES = [
  {name:'High-Speed SMT Chip Shooter',id:'SMT-002',temp:34,speed:42000,load:78,status:'Running'},
  {name:'Heller 1913 Nitrogen Reflow Oven',id:'REFLOW-001',temp:242,speed:120,load:85,status:'Running'},
  {name:'Koh Young 3D In-Line AOI Vision',id:'AOI-001',temp:28,speed:1500,load:62,status:'Running'},
  {name:'Branson Ultrasonic Battery Tab Welder',id:'WELD-001',temp:41,speed:480,load:91,status:'Warning'},
  {name:'Rohde & Schwarz 5G RF Chamber',id:'TEST-001',temp:24,speed:3600,load:70,status:'Running'},
  {name:'Fanuc Cleanroom SCARA Robotic Cell',id:'PACK-001',temp:29,speed:2400,load:55,status:'Running'}
];

const ACTIVITIES = [
  {color:'#10B981',msg:'Batch BATCH-2024-0192 resolved via Tier-1 exact match',meta:'Entity Resolver | ERP to MES | Conf: 1.00'},
  {color:'#38BDF8',msg:'Lineage hash verified for FG-SN-2024-00841',meta:'Merkle-DAG | 7 nodes traversed | 14ms'},
  {color:'#F59E0B',msg:'PO-2024-0541 received at GRN dock, awaiting QC',meta:'ERP Module | Supplier: Tata Steel Ltd'},
  {color:'#8B5CF6',msg:'SEN-T-010 alarm triggered - Quenching Bath Temp 58C',meta:'SCADA | HOBB-001 | Auto-escalated'},
  {color:'#EF4444',msg:'Rework event RW-2024-0041 created for WO-2024-1829',meta:'MES | HOBB-001 | Root cause: worn cutter'},
  {color:'#10B981',msg:'WO-2024-1841 completed - GEAR-BOX-7A serialized SN-2024-00841',meta:'MES | CNC-001 | OEE: 91.2%'},
  {color:'#38BDF8',msg:'Backward trace completed for RMA-2024-0018',meta:'Recall Engine | 3 lots identified | 82ms'}
];

const CONF_DATA = [
  {name:'BATCH-2024-0192 (ERP to MES)',val:1.00,color:'#10B981'},
  {name:'BATCH-2024-0174 (ERP to MES)',val:0.95,color:'#10B981'},
  {name:'BATCH-2024-0161 (ERP to SCADA)',val:0.82,color:'#F59E0B'},
  {name:'BATCH-2024-0148 (MES to ERP)',val:0.95,color:'#10B981'},
  {name:'BATCH-2024-0139 (ERP to MES)',val:0.72,color:'#EF4444'}
];

/* ── DASHBOARD ── */
function initDashboard() {
  document.querySelectorAll('.kpi-value[data-count]').forEach(function(el) {
    animateCount(el, parseInt(el.dataset.count));
  });
  const al = document.getElementById('activity-list');
  al.innerHTML = ACTIVITIES.map(function(a) {
    return '<div class="activity-item"><span class="activity-dot" style="background:' + a.color + '"></span><div class="activity-body"><div class="activity-msg">' + a.msg + '</div><div class="activity-meta">' + a.meta + '</div></div></div>';
  }).join('');
  const cb = document.getElementById('confidence-bars');
  cb.innerHTML = CONF_DATA.map(function(c) {
    return '<div class="conf-item"><div class="conf-header"><span class="conf-name">' + c.name + '</span><span class="conf-val">' + c.val.toFixed(2) + '</span></div><div class="conf-track"><div class="conf-bar" style="width:0%;background:' + c.color + '" data-w="' + (c.val*100) + '"></div></div></div>';
  }).join('');
  setTimeout(function() {
    document.querySelectorAll('.conf-bar').forEach(function(b) { b.style.width = b.dataset.w + '%'; });
  }, 100);
}

/* ================================================================
   GENATRACE UNIFIED INDUSTRIAL CONTROLLER ENGINE
   ERP · MES · SCADA Integration with Cross-System Intelligence
   ================================================================ */

/* ── GENATRACE ERP ENGINE (Materials, Provenance & Batch Registry) ── */
let erpInitialized = false;
let currentERPView = 'list';

function initERPData() {
  if (erpInitialized) return;
  erpInitialized = true;
  renderERPPOTable(PO_DATA);
  renderERPPOKanban();
  renderERPBatches();
  renderERPSuppliers();
  renderERPGRN();
}

function getERPStatusBadge(status) {
  const map = {
    'Draft RFQ': '<span class="gt-pill gt-pill-info">Draft RFQ</span>',
    'RFQ Sent': '<span class="gt-pill gt-pill-info">RFQ Sent</span>',
    'To Approve': '<span class="gt-pill gt-pill-warn">To Approve</span>',
    'Purchase Order': '<span class="gt-pill gt-pill-active">Purchase Order</span>',
    'Received': '<span class="gt-pill gt-pill-active">Received &amp; QC Passed</span>'
  };
  return map[status] || '<span class="gt-pill gt-pill-active">' + status + '</span>';
}

function renderERPPOTable(data) {
  const tbody = document.getElementById('erp-po-body') || document.getElementById('odoo-po-body');
  if (!tbody) return;
  function confClass(v) { return v >= 0.95 ? 'conf-high' : v >= 0.70 ? 'conf-med' : 'conf-low'; }
  tbody.innerHTML = data.map(function(r) {
    const total = (r.qty * (r.unitPrice || 120)).toLocaleString('en-IN');
    return '<tr>' +
      '<td><input type="checkbox" /></td>' +
      '<td class="mono" style="color:var(--erp);font-weight:700">' + r.po + '</td>' +
      '<td style="font-weight:600">' + r.sup + '</td>' +
      '<td>' + r.mat + '</td>' +
      '<td style="text-align:right;font-weight:600">' + r.qty.toLocaleString('en-IN') + ' kg</td>' +
      '<td style="text-align:right">₹ ' + (r.unitPrice || 120) + '</td>' +
      '<td style="text-align:right;font-weight:700;color:var(--mes)">₹ ' + total + '</td>' +
      '<td style="color:var(--text-muted)">' + r.date + '</td>' +
      '<td class="mono"><span style="cursor:pointer;text-decoration:underline;color:var(--lineage)" onclick="jumpToMES(\'' + r.batch + '\')" title="Click to view work orders in MES">' + r.batch + '</span></td>' +
      '<td>' + getERPStatusBadge(r.status) + '</td>' +
      '<td><span class="conf-chip ' + confClass(r.conf) + '">' + r.conf.toFixed(2) + '</span></td>' +
      '<td><button class="btn btn-sm btn-outline" style="padding:3px 8px;font-size:11px" onclick="jumpToMES(\'' + r.batch + '\')">Trace in MES →</button></td>' +
    '</tr>';
  }).join('');
  const countBadge = document.getElementById('erp-badge-po-count') || document.getElementById('odoo-badge-po-count');
  if (countBadge) countBadge.textContent = data.length;
}

function renderERPPOKanban() {
  const groups = { draft: [], approve: [], po: [], done: [] };
  PO_DATA.forEach(function(r) {
    const s = r.stage || (r.status === 'Draft RFQ' ? 'draft' : r.status === 'To Approve' ? 'approve' : r.status === 'Received' ? 'done' : 'po');
    if (groups[s]) groups[s].push(r);
    else groups.po.push(r);
  });
  function cardHtml(r) {
    const total = (r.qty * (r.unitPrice || 120)).toLocaleString('en-IN');
    return '<div class="gt-kcard" onclick="toast(\'Viewing ' + r.po + ' material spec\', \'info\')">' +
      '<div class="gt-kcard-header"><span class="mono" style="color:var(--erp);font-weight:700">' + r.po + '</span>' + getERPStatusBadge(r.status) + '</div>' +
      '<div class="gt-kcard-title">' + r.mat + '</div>' +
      '<div class="gt-kcard-sub">' + r.sup + ' · ' + r.qty.toLocaleString() + ' kg</div>' +
      '<div class="gt-kcard-footer">' +
        '<span style="color:var(--mes);font-weight:700">₹ ' + total + '</span>' +
        '<span class="mono">' + r.batch + '</span>' +
      '</div>' +
    '</div>';
  }
  ['draft', 'approve', 'po', 'done'].forEach(function(st) {
    const col = document.getElementById('kcol-' + st);
    const cnt = document.getElementById('kcount-' + st);
    if (col) col.innerHTML = groups[st].map(cardHtml).join('') || '<div style="color:var(--text-dim);font-size:12px;text-align:center;padding:24px 0">No orders</div>';
    if (cnt) cnt.textContent = groups[st].length;
  });
}

function renderERPBatches() {
  const bbody = document.getElementById('erp-batch-body') || document.getElementById('odoo-batch-body');
  if (!bbody) return;
  function qcPill(s) { return s === 'Pass' ? 'gt-pill-active' : 'gt-pill-danger'; }
  bbody.innerHTML = BATCH_DATA.map(function(r) {
    return '<tr>' +
      '<td><input type="checkbox" /></td>' +
      '<td class="mono" style="font-weight:700;color:var(--erp);cursor:pointer;text-decoration:underline" onclick="inspectBatch(\'' + r.id + '\')" title="Click to view chemical & heat ledger">' + r.id + '</td>' +
      '<td style="font-weight:600">' + r.mat + '</td>' +
      '<td class="mono">' + r.lot + '</td>' +
      '<td style="color:var(--text-muted)">' + r.recv + '</td>' +
      '<td style="text-align:right;font-weight:700">' + r.qty.toLocaleString('en-IN') + ' kg</td>' +
      '<td><span class="gt-pill ' + qcPill(r.qc) + '">' + r.qc + '</span></td>' +
      '<td class="mono" style="font-size:11px;color:var(--lineage)">' + r.hash + '</td>' +
      '<td><button class="btn btn-sm btn-outline" style="padding:3px 8px;font-size:11px" onclick="jumpToMES(\'' + r.id + '\')">View in MES →</button></td>' +
    '</tr>';
  }).join('');
}

function inspectBatch(batchId) {
  const b = BATCH_DATA.find(function(item) { return item.id === batchId; }) || BATCH_DATA[0];
  const modal = document.getElementById('erp-batch-modal');
  if (!modal) return;
  const isBattery = b.id === 'BAT-2024-X49';
  document.getElementById('erp-bm-title').textContent = b.id + ' — Component Provenance & Material Ledger';
  document.getElementById('erp-bm-body').innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Component / Material Specification</span><span class="gt-sp-val" style="color:var(--erp)">' + b.mat + '</span></div>' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Supplier Lot #</span><span class="gt-sp-val">' + b.lot + '</span></div>' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Dock Receipt Date</span><span class="gt-sp-val">' + b.recv + '</span></div>' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Lot Quantity</span><span class="gt-sp-val">' + b.qty.toLocaleString() + ' Units</span></div>' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Quality Inspection Certificate</span><span class="gt-sp-val" style="color:' + (b.qc==='Pass'?'var(--mes)':'var(--recall)') + '">' + b.qc.toUpperCase() + ' (MTC 3.1 Certified)</span></div>' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Assembled Sister Mobiles</span><span class="gt-sp-val" style="color:var(--recall);font-weight:700">' + (isBattery ? '287 Quarantined Mobiles' : '1,000 Nominal Mobiles') + '</span></div>' +
    '</div>' +
    '<div style="margin-top:14px;padding:12px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">' +
      '<div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px">' + (isBattery ? 'Battery Cell Chemistry & Cathode Composition' : 'Chemical Metallurgy Verification') + '</div>' +
      '<div style="font-size:12px;color:var(--text);font-family:var(--mono)">' + (isBattery ? 'NMC 811 (LiNiMnCoO2) · Nominal: 3.88V · Capacity: 5000mAh · Energy Density: 740 Wh/L' : 'C: 0.41% · Cr: 0.82% · Ni: 1.83% · Mo: 0.26% · Hardness: 285 HBW') + '</div>' +
    '</div>' +
    '<div style="margin-top:10px;padding:10px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">' +
      '<div style="font-size:10px;font-weight:600;color:var(--text-dim);margin-bottom:4px">Cryptographic Merkle Leaf Hash</div>' +
      '<div class="mono" style="font-size:11px;color:var(--lineage);word-break:break-all">' + b.hash + 'a9f20e8b13c4</div>' +
    '</div>';
  document.getElementById('erp-bm-footer').innerHTML =
    '<button class="btn btn-outline" onclick="closeBatchModal()">Close</button>' +
    '<button class="btn btn-mes" onclick="closeBatchModal();jumpToMES(\'' + b.id + '\')">Trace in MES Work Orders →</button>' +
    '<button class="btn btn-danger" onclick="closeBatchModal();jumpToRecallDefect(\'' + b.id + '\')">Simulate Targeted Store Recall →</button>';
  modal.classList.remove('hidden');
}

function closeBatchModal() {
  const modal = document.getElementById('erp-batch-modal');
  if (modal) modal.classList.add('hidden');
}

function renderERPSuppliers() {
  const sgrid = document.getElementById('erp-supplier-grid') || document.getElementById('odoo-supplier-grid');
  if (!sgrid) return;
  sgrid.innerHTML = SUPPLIERS.map(function(s) {
    const initials = s.name.split(' ').map(function(w) { return w[0]; }).slice(0, 2).join('');
    return '<div class="gt-vendor-card">' +
      '<div class="gt-vc-top">' +
        '<div class="gt-vc-avatar">' + initials + '</div>' +
        '<div>' +
          '<div class="gt-vc-name">' + s.name + '</div>' +
          '<div class="gt-vc-code">' + s.id + ' · Certified Supplier</div>' +
        '</div>' +
      '</div>' +
      '<div style="color:var(--erp);font-size:13px;letter-spacing:1px">' + '★'.repeat(s.rating) + '☆'.repeat(5 - s.rating) + '</div>' +
      '<div class="gt-vc-stats">' +
        '<div class="gt-vc-stat"><span>Delivered Batches</span><strong>' + s.batches + '</strong></div>' +
        '<div class="gt-vc-stat"><span>Active POs</span><strong>' + s.orders + '</strong></div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function renderERPGRN() {
  const gbody = document.getElementById('erp-grn-body') || document.getElementById('odoo-grn-body');
  if (!gbody) return;
  function grnPill(s) { return s === 'Accepted' ? 'gt-pill-active' : 'gt-pill-danger'; }
  gbody.innerHTML = GRN_DATA.map(function(r) {
    return '<tr>' +
      '<td><input type="checkbox" /></td>' +
      '<td class="mono" style="font-weight:700;color:var(--erp)">' + r.grn + '</td>' +
      '<td class="mono">' + r.po + '</td>' +
      '<td style="font-weight:600">' + r.by + '</td>' +
      '<td style="color:var(--text-muted)">' + r.date + '</td>' +
      '<td style="font-weight:700">' + r.items + ' Line Items</td>' +
      '<td><span class="gt-pill ' + grnPill(r.status) + '">' + r.status + '</span></td>' +
    '</tr>';
  }).join('');
}

function switchERPTab(tabId) {
  document.querySelectorAll('#page-erp .gt-tab, #page-erp .odoo-tab').forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('#page-erp .gt-tab-content, #page-erp .odoo-tab-content').forEach(function(c) {
    c.classList.toggle('hidden', c.id !== tabId);
    c.classList.toggle('active', c.id === tabId);
  });
}

function switchERPView(mode) {
  currentERPView = mode;
  const btnList = document.getElementById('erp-btn-list') || document.getElementById('odoo-btn-list');
  const btnKanban = document.getElementById('erp-btn-kanban') || document.getElementById('odoo-btn-kanban');
  const listView = document.getElementById('erp-po-list-view') || document.getElementById('odoo-po-list-view');
  const kanbanView = document.getElementById('erp-po-kanban-view') || document.getElementById('odoo-po-kanban-view');
  if (btnList) btnList.classList.toggle('active', mode === 'list');
  if (btnKanban) btnKanban.classList.toggle('active', mode === 'kanban');
  if (listView) listView.classList.toggle('hidden', mode !== 'list');
  if (kanbanView) kanbanView.classList.toggle('hidden', mode !== 'kanban');
}

function handleERPSearch(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    renderERPPOTable(PO_DATA);
    return;
  }
  const filtered = PO_DATA.filter(function(r) {
    return r.po.toLowerCase().includes(q) ||
           r.sup.toLowerCase().includes(q) ||
           r.mat.toLowerCase().includes(q) ||
           r.batch.toLowerCase().includes(q);
  });
  renderERPPOTable(filtered);
}

function showNewPOModal() {
  const modal = document.getElementById('erp-po-modal') || document.getElementById('odoo-po-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeNewPOModal() {
  const modal = document.getElementById('erp-po-modal') || document.getElementById('odoo-po-modal');
  if (modal) modal.classList.add('hidden');
}

function submitNewPO() {
  const vendor = document.getElementById('m-po-vendor').value;
  const material = document.getElementById('m-po-material').value || 'Standard Alloy';
  const qty = parseInt(document.getElementById('m-po-qty').value) || 1000;
  const price = parseInt(document.getElementById('m-po-price').value) || 120;
  const date = document.getElementById('m-po-date').value || new Date().toISOString().slice(0, 10);
  const stage = document.getElementById('m-po-stage').value || 'Purchase Order';
  
  const poNum = 'PO-2024-0' + Math.floor(850 + Math.random() * 150);
  const batchNum = 'BATCH-2024-0' + Math.floor(200 + Math.random() * 90);
  const stageCode = stage === 'Draft RFQ' ? 'draft' : stage === 'To Approve' ? 'approve' : 'po';

  const newPO = {
    po: poNum,
    sup: vendor,
    mat: material,
    qty: qty,
    unitPrice: price,
    date: date,
    batch: batchNum,
    status: stage,
    stage: stageCode,
    conf: 0.99
  };

  PO_DATA.unshift(newPO);
  renderERPPOTable(PO_DATA);
  renderERPPOKanban();
  closeNewPOModal();
  toast('Created ' + poNum + ' (Batch ' + batchNum + '). Merkle DAG root updated!', 'success', 5000);
}

function exportERPCSV() {
  let csv = 'PO Number,Vendor,Material,Quantity(KG),UnitPrice(INR),Total(INR),Date,BatchID,Status,Confidence\n';
  PO_DATA.forEach(function(r) {
    csv += [r.po, '"' + r.sup + '"', '"' + r.mat + '"', r.qty, r.unitPrice, (r.qty * r.unitPrice), r.date, r.batch, r.status, r.conf].join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'GeneaTrace_ERP_Orders_' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast('Material orders exported to CSV', 'success');
}

// Cross-system navigation helper: Jump to MES for a specific batch
function jumpToMES(batchId) {
  showPage('mes');
  const searchInput = document.getElementById('mes-search-box');
  if (searchInput) {
    searchInput.value = batchId;
    handleMESSearch(batchId);
  }
  toast('Navigated to MES: Filtered for ' + batchId, 'info');
}


/* ── GENATRACE MES ENGINE (Shop Floor Work Orders & Machining Pipeline) ── */
let mesInitialized = false;
let currentMESView = 'list';

function initMESData() {
  if (mesInitialized) return;
  mesInitialized = true;
  renderMESWOTable(WO_DATA);
  renderMESWOKanban();
  renderMESOpsLog();
  renderMESRework();
  renderMESOEE();
}

function getMESStatusBadge(status) {
  if (status === 'Completed') return '<span class="gt-pill gt-pill-active">● Completed</span>';
  if (status === 'In Progress') return '<span class="gt-pill gt-pill-info">● In Progress</span>';
  if (status === 'Paused') return '<span class="gt-pill gt-pill-warn">❚❚ Paused</span>';
  return '<span class="gt-pill gt-pill-info">' + status + '</span>';
}

function renderMESWOTable(data) {
  const tbody = document.getElementById('mes-wo-body') || document.getElementById('zebra-wo-body');
  if (!tbody) return;
  tbody.innerHTML = data.map(function(r) {
    const endStr = r.end || '<span style="color:var(--mes);font-weight:600">Active Machining...</span>';
    const hash = '0x' + (r.wo.replace(/\D/g, '') * 987654321).toString(16).substring(0, 10) + '...';
    return '<tr>' +
      '<td><input type="checkbox" /></td>' +
      '<td class="mono" style="color:var(--mes);font-weight:700">' + r.wo + '</td>' +
      '<td style="font-weight:600">' + r.prod + '</td>' +
      '<td class="mono"><span style="cursor:pointer;text-decoration:underline;color:var(--erp)" onclick="jumpToERP(\'' + r.batch + '\')" title="Click to view material provenance in ERP">' + r.batch + '</span></td>' +
      '<td class="mono" style="font-weight:600;color:var(--scada)"><span style="cursor:pointer;text-decoration:underline" onclick="jumpToSCADAMachine(\'' + r.machine + '\')" title="Click to inspect machine sensors in SCADA">' + r.machine + '</span></td>' +
      '<td style="color:var(--text-muted);font-size:12px">' + r.start + '</td>' +
      '<td style="font-size:12px">' + endStr + '</td>' +
      '<td style="font-weight:500">' + r.op + '</td>' +
      '<td>' + getMESStatusBadge(r.status) + '</td>' +
      '<td class="mono" style="font-size:11px;color:var(--lineage)">' + hash + '</td>' +
      '<td><button class="btn btn-sm btn-outline" style="padding:3px 8px;font-size:11px" onclick="jumpToSCADAMachine(\'' + r.machine + '\')">Sensors →</button></td>' +
    '</tr>';
  }).join('');
  const badge = document.getElementById('mes-badge-wo-count') || document.getElementById('zebra-badge-wo-count');
  if (badge) badge.textContent = data.length;
}

function renderMESWOKanban() {
  const stations = { st1: [], st2: [], st3: [], st4: [] };
  WO_DATA.forEach(function(r) {
    const m = (r.machine || '').toUpperCase();
    if (m.includes('LATHE')) stations.st1.push(r);
    else if (m.includes('HOBB')) stations.st3.push(r);
    else if (m.includes('GRIND')) stations.st4.push(r);
    else stations.st2.push(r);
  });
  function cardHtml(r) {
    return '<div class="gt-kcard" onclick="toast(\'Inspecting WO ' + r.wo + ' on ' + r.machine + '\', \'info\')">' +
      '<div class="gt-kcard-header"><span class="mono" style="color:var(--mes);font-weight:700">' + r.wo + '</span>' + getMESStatusBadge(r.status) + '</div>' +
      '<div class="gt-kcard-title">' + r.prod + '</div>' +
      '<div class="gt-kcard-sub">Station: <strong>' + r.machine + '</strong></div>' +
      '<div class="gt-kcard-sub">Supply Batch: <span class="mono" style="color:var(--erp)">' + r.batch + '</span></div>' +
      '<div class="gt-kcard-footer">' +
        '<span>Op: ' + r.op + '</span>' +
        '<span style="color:var(--scada);font-weight:600">OPC-UA Stream</span>' +
      '</div>' +
    '</div>';
  }
  ['st1', 'st2', 'st3', 'st4'].forEach(function(st) {
    const col = document.getElementById('zkcol-' + st);
    const cnt = document.getElementById('zcount-' + st);
    if (col) col.innerHTML = stations[st].map(cardHtml).join('') || '<div style="color:var(--text-dim);font-size:12px;text-align:center;padding:24px 0">Cell Idle</div>';
    if (cnt) cnt.textContent = stations[st].length;
  });
}

function renderMESOpsLog() {
  const tbody = document.getElementById('mes-ops-body') || document.getElementById('zebra-ops-body');
  if (!tbody) return;
  tbody.innerHTML = OPS_LOG.map(function(r) {
    const resBadge = r.result === 'Pass'
      ? '<span class="gt-pill gt-pill-active">✓ Pass (Tolerances Met)</span>'
      : '<span class="gt-pill gt-pill-danger">✕ Fail (CMM Re-Inspect)</span>';
    return '<tr>' +
      '<td><input type="checkbox" /></td>' +
      '<td class="mono" style="font-weight:600">' + r.time + '</td>' +
      '<td class="mono" style="color:var(--mes);font-weight:700">' + r.wo + '</td>' +
      '<td style="font-weight:600">' + r.op + '</td>' +
      '<td class="mono" style="color:var(--scada)">' + r.machine + '</td>' +
      '<td style="font-weight:700">' + r.dur + ' sec</td>' +
      '<td>' + resBadge + '</td>' +
    '</tr>';
  }).join('');
}

function renderMESRework() {
  const container = document.getElementById('mes-rework-cards') || document.getElementById('zebra-rework-cards');
  if (!container) return;
  container.innerHTML = REWORK.map(function(r) {
    return '<div class="rework-card">' +
      '<div class="rework-id">' + r.id + '</div>' +
      '<div class="rework-title">' + r.title + '</div>' +
      '<div class="rework-meta">' +
        '<span>Work Order: <strong>' + r.wo + '</strong> · Machine: <strong>' + r.machine + '</strong></span>' +
        '<span>Detected: ' + r.detected + '</span>' +
        '<span style="color:var(--recall)">Root Cause: ' + r.root + '</span>' +
        '<span style="color:var(--mes)">Corrective Action: ' + r.action + '</span>' +
      '</div>' +
      '<div class="rework-actions">' +
        '<button class="btn btn-sm btn-outline" onclick="jumpToRecallDefect(\'BATCH-2024-0192\')">Trace Blast Radius →</button>' +
        '<button class="btn btn-sm btn-mes" onclick="toast(\'NCR ' + r.id + ' resolved. Corrective Merkle leaf registered.\', \'success\')">Mark Resolved</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function renderMESOEE() {
  const container = document.getElementById('mes-oee-grid') || document.getElementById('zebra-oee-grid');
  if (!container) return;
  container.innerHTML = OEE_DATA.map(function(m) {
    const r = 36, c = 2 * Math.PI * r, dash = c * (m.oee / 100), gap = c - dash;
    const strokeCol = m.oee >= 85 ? '#10B981' : m.oee >= 75 ? '#F59E0B' : '#EF4444';
    return '<div class="oee-card">' +
      '<div class="oee-machine">' + m.machine + '</div>' +
      '<div class="oee-donut-wrap">' +
        '<svg width="80" height="80" viewBox="0 0 80 80">' +
          '<circle cx="40" cy="40" r="' + r + '" fill="none" stroke="var(--border)" stroke-width="6"/>' +
          '<circle cx="40" cy="40" r="' + r + '" fill="none" stroke="' + strokeCol + '" stroke-width="6" stroke-dasharray="' + dash.toFixed(1) + ' ' + gap.toFixed(1) + '" stroke-linecap="round"/>' +
        '</svg>' +
        '<div class="oee-donut-center" style="font-size:15px">' + m.oee + '%</div>' +
      '</div>' +
      '<div class="oee-label">' + m.machine + ' CNC Cell</div>' +
      '<div class="oee-sub">Avail:' + m.avail + '% · Perf:' + m.perf + '% · Qual:' + m.qual + '%</div>' +
    '</div>';
  }).join('');
}

function switchMESTab(tabId) {
  document.querySelectorAll('#page-mes .gt-tab, #page-mes .zebra-tab').forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('#page-mes .gt-tab-content, #page-mes .zebra-tab-content').forEach(function(c) {
    c.classList.toggle('hidden', c.id !== tabId);
    c.classList.toggle('active', c.id === tabId);
  });
}

function switchMESView(mode) {
  currentMESView = mode;
  const btnList = document.getElementById('mes-btn-list') || document.getElementById('zebra-btn-list');
  const btnKanban = document.getElementById('mes-btn-kanban') || document.getElementById('zebra-btn-kanban');
  const listView = document.getElementById('mes-wo-list-view') || document.getElementById('zebra-wo-list-view');
  const kanbanView = document.getElementById('mes-wo-kanban-view') || document.getElementById('zebra-wo-kanban-view');
  if (btnList) btnList.classList.toggle('active', mode === 'list');
  if (btnKanban) btnKanban.classList.toggle('active', mode === 'kanban');
  if (listView) listView.classList.toggle('hidden', mode !== 'list');
  if (kanbanView) kanbanView.classList.toggle('hidden', mode !== 'kanban');
}

function handleMESSearch(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    renderMESWOTable(WO_DATA);
    return;
  }
  const filtered = WO_DATA.filter(function(r) {
    return r.wo.toLowerCase().includes(q) ||
           r.prod.toLowerCase().includes(q) ||
           r.batch.toLowerCase().includes(q) ||
           r.machine.toLowerCase().includes(q) ||
           r.op.toLowerCase().includes(q);
  });
  renderMESWOTable(filtered);
}

function showNewWOModal() {
  const modal = document.getElementById('mes-wo-modal') || document.getElementById('zebra-wo-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeNewWOModal() {
  const modal = document.getElementById('mes-wo-modal') || document.getElementById('zebra-wo-modal');
  if (modal) modal.classList.add('hidden');
}

function submitNewWO() {
  const prod = document.getElementById('m-wo-prod').value || 'GEAR-BOX-7A';
  const batch = document.getElementById('m-wo-batch').value;
  const machine = document.getElementById('m-wo-machine').value;
  const operator = document.getElementById('m-wo-operator').value || 'Certified Tech';
  
  const woNum = 'WO-2024-' + Math.floor(1850 + Math.random() * 100);
  const now = new Date();
  const startStr = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);

  const newWO = {
    wo: woNum,
    prod: prod,
    batch: batch,
    machine: machine,
    start: startStr,
    end: '',
    op: operator,
    status: 'In Progress'
  };

  WO_DATA.unshift(newWO);
  renderMESWOTable(WO_DATA);
  renderMESWOKanban();
  closeNewWOModal();
  toast('Dispatched ' + woNum + ' to ' + machine + '. Linked to ' + batch + '!', 'success', 5000);
}

function jumpToERP(batchId) {
  showPage('erp');
  const searchInput = document.getElementById('erp-search-box');
  if (searchInput) {
    searchInput.value = batchId;
    handleERPSearch(batchId);
  }
  toast('Navigated to ERP: Showing material lot for ' + batchId, 'info');
}

function jumpToSCADAMachine(machineId) {
  showPage('scada');
  toast('Navigated to SCADA: Streaming live telemetry for ' + machineId, 'info');
}

function jumpToRecallDefect(batchId) {
  showPage('recall');
  const batchInput = document.getElementById('recall-batch-id');
  if (batchInput) batchInput.value = batchId;
  runRecall();
}


/* ── GENATRACE SCADA ENGINE (Real-Time Sensor Telemetry & Anomaly Stack) ── */
let scadaInitialized = false;

function initSCADAData() {
  if (scadaInitialized) return;
  scadaInitialized = true;
  renderSCADASensors();
  renderSCADAAlarms();
  renderSCADASparklines();
  renderSCADAMachines();

  // High frequency sensor simulator (every 2 seconds)
  setInterval(function() {
    SENSORS.forEach(function(s, idx) {
      const delta = (Math.random() - 0.49) * 0.03 * s.val;
      s.val = Math.round((s.val + delta) * 10) / 10;
      const valEl = document.getElementById('scada-val-' + s.id);
      const barEl = document.getElementById('scada-bar-' + s.id);
      if (valEl) valEl.textContent = s.val;
      if (barEl) {
        const pct = Math.min(100, Math.max(10, Math.round((s.val / (s.val * 1.3)) * 100)));
        barEl.style.width = pct + '%';
      }
    });
  }, 2000);
}

function renderSCADASensors() {
  const grid = document.getElementById('scada-sensor-grid');
  if (!grid) return;
  grid.innerHTML = SENSORS.map(function(s) {
    const statPill = s.status === 'ok'
      ? '<span class="gt-pill gt-pill-active">Normal</span>'
      : s.status === 'warn'
      ? '<span class="gt-pill gt-pill-warn">Warning</span>'
      : '<span class="gt-pill gt-pill-danger">CRITICAL ALARM</span>';
    const barCol = s.status === 'alarm' ? 'var(--recall)' : s.status === 'warn' ? 'var(--erp)' : 'linear-gradient(90deg, var(--scada), #8B5CF6)';
    
    // Generate mini sparkline SVG path
    const p1 = 20 + Math.floor(Math.random() * 8);
    const p2 = 14 + Math.floor(Math.random() * 12);
    const p3 = 22 + Math.floor(Math.random() * 8);
    const p4 = 10 + Math.floor(Math.random() * 15);
    const svgPath = 'M 0 ' + p1 + ' Q 30 ' + p2 + ' 60 ' + p3 + ' T 120 ' + p4 + ' T 180 16';
    const strokeCol = s.status === 'alarm' ? '#EF4444' : s.status === 'warn' ? '#F59E0B' : '#00E5FF';

    return '<div class="gt-scada-tile" onclick="inspectSensor(\'' + s.id + '\')" style="cursor:pointer">' +
      '<div class="gt-scada-top">' +
        '<div>' +
          '<div class="gt-scada-id">' + s.id + ' <span style="font-size:10px;color:var(--text-dim)">[Click to Inspect]</span></div>' +
          '<div class="gt-scada-name">' + s.name + '</div>' +
        '</div>' +
        statPill +
      '</div>' +
      '<div class="gt-scada-val-wrap">' +
        '<span class="gt-scada-val" id="scada-val-' + s.id + '">' + s.val + '</span>' +
        '<span class="gt-scada-unit">' + s.unit + '</span>' +
      '</div>' +
      '<div style="height:32px;margin:6px 0">' +
        '<svg width="100%" height="32" viewBox="0 0 180 32" fill="none" preserveAspectRatio="none">' +
          '<path d="' + svgPath + '" stroke="' + strokeCol + '" stroke-width="2" stroke-linecap="round" fill="none"/>' +
        '</svg>' +
      '</div>' +
      '<div class="gt-scada-track">' +
        '<div class="gt-scada-bar" id="scada-bar-' + s.id + '" style="width:' + s.pct + '%;background:' + barCol + '"></div>' +
      '</div>' +
      '<div class="gt-scada-footer">' +
        '<span>IEC 61850 Stream</span>' +
        '<span style="color:var(--scada);font-weight:600">● 100ms Ping</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

function inspectSensor(sensorId) {
  const s = SENSORS.find(function(item) { return item.id === sensorId; }) || SENSORS[0];
  const modal = document.getElementById('scada-sensor-modal');
  if (!modal) return;
  document.getElementById('scada-m-title').textContent = s.name + ' (' + s.id + ') — Telemetry Inspector';
  document.getElementById('scada-m-body').innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Live Current Reading</span><span class="gt-sp-val" style="color:var(--scada);font-size:18px">' + s.val + ' ' + s.unit + '</span></div>' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Status Threshold</span><span class="gt-sp-val" style="color:' + (s.status==='alarm'?'var(--recall)':s.status==='warn'?'var(--erp)':'var(--mes)') + '">' + (s.status==='alarm'?'CRITICAL EXCEEDED (>60°C)':s.status==='warn'?'NEAR LIMIT':'NOMINAL IN-TOLERANCE') + '</span></div>' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Connected Electronics Machine</span><span class="gt-sp-val">SMT-002 (Siemens Siplace TX &amp; Heller 1913)</span></div>' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Associated Cleanroom Work Order</span><span class="gt-sp-val" style="color:var(--mes)">WO-SMT-2024-1841</span></div>' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Active Component Lot</span><span class="gt-sp-val" style="color:var(--erp)">BAT-2024-X49 (Samsung SDI 5000mAh)</span></div>' +
      '<div class="gt-sp-item"><span class="gt-sp-key">Dispatched Sister Units</span><span class="gt-sp-val" style="color:var(--recall);font-weight:700">287 Mobiles Across 4 Stores</span></div>' +
    '</div>' +
    '<div style="margin-top:14px;padding:12px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">' +
      '<div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px">Cryptographic Merkle Ingestion Seal</div>' +
      '<div class="mono" style="font-size:11px;color:var(--lineage);word-break:break-all">0x7d94f2e810cb992147ae5b41098ef3214876b291a13488f</div>' +
    '</div>';
  document.getElementById('scada-m-footer').innerHTML =
    '<button class="btn btn-outline" onclick="closeSensorModal()">Close</button>' +
    '<button class="btn btn-mes" onclick="closeSensorModal();jumpToMES(\'BAT-2024-X49\')">Trace in MES →</button>' +
    (s.status === 'alarm' ? '<button class="btn btn-danger" onclick="closeSensorModal();jumpToRecallDefect(\'BAT-2024-X49\')">Launch Targeted Store Recall →</button>' : '');
  modal.classList.remove('hidden');
}

function closeSensorModal() {
  const modal = document.getElementById('scada-sensor-modal');
  if (modal) modal.classList.add('hidden');
}

function renderSCADAAlarms() {
  const container = document.getElementById('scada-alarm-list');
  if (!container) return;
  container.innerHTML = ALARMS.map(function(a, idx) {
    return '<div class="alarm-item alarm-' + a.type + '" id="scada-alarm-item-' + idx + '">' +
      '<div class="alarm-icon">' + a.icon + '</div>' +
      '<div class="alarm-body">' +
        '<div class="alarm-title">' + a.title + '</div>' +
        '<div class="alarm-detail">' + a.detail + '</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<div class="alarm-time">' + a.time + '</div>' +
        '<button class="btn btn-sm btn-outline" onclick="acknowledgeAlarm(' + idx + ')">Ack</button>' +
        '<button class="btn btn-sm btn-outline" style="border-color:var(--scada);color:var(--scada)" onclick="inspectSensor(\'SEN-T-010\')">Inspect</button>' +
        '<button class="btn btn-sm btn-danger" onclick="jumpToRecallDefect(\'BATCH-2024-0192\')">Trace Recall</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function acknowledgeAlarm(idx) {
  const el = document.getElementById('scada-alarm-item-' + idx);
  if (el) {
    el.style.opacity = '0.5';
    const btn = el.querySelector('button');
    if (btn) {
      btn.textContent = 'Acknowledged';
      btn.disabled = true;
    }
  }
  toast('Alarm #' + idx + ' acknowledged by Operator', 'info');
}

function renderSCADASparklines() {
  const container = document.getElementById('scada-sparklines');
  if (!container) return;
  container.innerHTML = SENSORS.slice(0, 5).map(function(s) {
    return '<div class="sparkline-item">' +
      '<div class="sparkline-header">' +
        '<span class="sparkline-name">' + s.name + ' (' + s.id + ')</span>' +
        '<span class="sparkline-val mono">' + s.val + ' ' + s.unit + '</span>' +
      '</div>' +
      '<canvas class="sparkline-canvas" width="600" height="42"></canvas>' +
    '</div>';
  }).join('');
  document.querySelectorAll('.sparkline-canvas').forEach(drawSparkline);
}

function renderSCADAMachines() {
  const grid = document.getElementById('scada-machine-grid');
  if (!grid) return;
  grid.innerHTML = MACHINES.map(function(m) {
    const sc = m.status === 'Running' ? 'var(--mes)' : m.status === 'Warning' ? 'var(--erp)' : 'var(--text-dim)';
    return '<div class="machine-card" style="display:flex;flex-direction:column;gap:12px">' +
      '<div class="machine-header">' +
        '<div>' +
          '<div class="machine-name">' + m.name + '</div>' +
          '<div class="machine-id">' + m.id + ' · Siemens S7-1500 PLC</div>' +
        '</div>' +
        '<span class="status-pill" style="background:rgba(255,255,255,.05);color:' + sc + '">● ' + m.status + '</span>' +
      '</div>' +
      '<div class="machine-params">' +
        '<div class="machine-param"><span>Core Temp</span><strong>' + m.temp + ' °C</strong></div>' +
        '<div class="machine-param"><span>Spindle Speed</span><strong>' + m.speed + ' RPM</strong></div>' +
        '<div class="machine-param"><span>Current Load</span><strong style="color:' + (m.load>80?'var(--recall)':m.load>60?'var(--erp)':'var(--mes)') + '">' + m.load + '%</strong></div>' +
        '<div class="machine-param"><span>Protocol</span><strong style="color:var(--scada)">OPC-UA v1.04</strong></div>' +
      '</div>' +
      '<div style="margin-top:auto;padding-top:10px;border-top:1px solid var(--border);display:flex;gap:8px">' +
        '<button class="btn btn-sm btn-outline w-full" onclick="jumpToMES(\'BATCH-2024-0192\')">Active Job: WO-2024-1841 →</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function switchSCADATab(tabId) {
  document.querySelectorAll('#page-scada .gt-tab, #page-scada .scada-tab').forEach(function(t) {
    t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
  });
  document.querySelectorAll('#page-scada .gt-tab-content, #page-scada .scada-tab-content').forEach(function(c) {
    c.classList.toggle('hidden', c.id !== tabId);
    c.classList.toggle('active', c.id === tabId);
  });
}

function drawSparkline(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const pts = Array.from({length: 28}, function() { return 0.25 + Math.random() * 0.55; });
  ctx.clearRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#00E5FF');
  grad.addColorStop(0.5, '#38BDF8');
  grad.addColorStop(1, '#818CF8');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  pts.forEach(function(v, i) {
    const x = (i / (pts.length - 1)) * w;
    const y = h - (v * h * 0.8) - h * 0.1;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

// Backward-compatibility aliases
window.switchOdooTab = switchERPTab;
window.switchOdooView = switchERPView;
window.handleOdooSearch = handleERPSearch;
window.switchZebraMESTab = switchMESTab;
window.switchZebraWOView = switchMESView;
window.handleZebraWOSearch = handleMESSearch;


/* ── LINEAGE (Cryptographic Merkle-DAG Engine) ── */
const DAG_NODES = {
  'BATCH-2024-0192': {
    type: 'raw',
    label: 'BATCH-2024-0192',
    name: 'AISI 4340 Alloy Steel',
    sys: 'ERP',
    supplier: 'Tata Steel Ltd',
    lot: 'TSL-L240912-A',
    qty: '2,400 kg',
    hash: 'a3f7c1d9e2b840fc81219b22e',
    sig: 'Ed25519 Verified',
    status: 'QC Pass',
    children: ['WO-2024-1841']
  },
  'WO-2024-1841': {
    type: 'mes',
    label: 'WO-2024-1841',
    name: 'Rough Turn & Finish Mill',
    sys: 'MES',
    machine: 'CNC-001 (Fanuc 0i-MF)',
    operator: 'Ravi Shankar',
    duration: '8h 30m',
    hash: 'c4a12e87d3b041e793910d91f',
    sig: 'Ed25519 Verified',
    status: 'Completed',
    children: ['SCADA-CNC-001', 'ASM-0041']
  },
  'SCADA-CNC-001': {
    type: 'scada',
    label: 'SCADA-CNC-001',
    name: 'Machining Sensor Suite',
    sys: 'SCADA',
    sensors: 'Temp: 218.4°C · Vib: 2.8mm/s · Flow: 18L/m',
    telemetryRate: '100ms OPC-UA',
    hash: 'b8c93fa1e4d120e819a327f3c',
    sig: 'Ed25519 Verified',
    status: 'Nominal',
    children: ['ASM-0041']
  },
  'BATCH-2024-0174': {
    type: 'raw',
    label: 'BATCH-2024-0174',
    name: 'Al 6061-T6 Billet',
    sys: 'ERP',
    supplier: 'Hindalco Alloys',
    lot: 'HND-240908-C',
    qty: '800 kg',
    hash: 'b8e4a912d09341fae0182cc31',
    sig: 'Ed25519 Verified',
    status: 'QC Pass',
    children: ['WO-2024-1837']
  },
  'WO-2024-1837': {
    type: 'mes',
    label: 'WO-2024-1837',
    name: 'Shaft Precision Turning',
    sys: 'MES',
    machine: 'LATHE-003 (Mazak QT)',
    operator: 'Karthik M',
    duration: '6h 15m',
    hash: 'd2f91b03e8724aa0b182148ec',
    sig: 'Ed25519 Verified',
    status: 'Completed',
    children: ['ASM-0041']
  },
  'ASM-0041': {
    type: 'asm',
    label: 'ASM-0041',
    name: 'Sub-Assembly & Splining',
    sys: 'MES',
    cell: 'Robotic Cell 2',
    inspector: 'Deepak N',
    torque: '142.5 Nm Verified',
    hash: 'e7b23c4190ba41ef88219a82d',
    sig: 'Ed25519 Verified',
    status: 'Passed QC',
    children: ['FG-SN-2024-00841']
  },
  'FG-SN-2024-00841': {
    type: 'fin',
    label: 'FG-SN-2024-00841',
    name: 'GEAR-BOX-7A Final',
    sys: 'DPP',
    dispatch: 'Tata Motors EV Div',
    rootHash: 'f1d489c2a3b710de9481b7e0a',
    sig: 'Ed25519 Cryptographically Sealed',
    status: 'Passport Sealed',
    children: []
  }
};

const NODE_COLORS = {
  raw: '#F59E0B',
  mes: '#10B981',
  scada: '#00E5FF',
  asm: '#38BDF8',
  fin: '#818CF8',
  flag: '#EF4444'
};

let dagZoom = 1.0;
let dagParticlesActive = true;
let dagAnimFrame = null;
let currentDAGRoot = 'BATCH-2024-0192';
let dagPositions = {};
let dagParticles = [];

function setLineageTarget(id) {
  const inp = document.getElementById('lineage-search-id');
  if (inp) inp.value = id;
  runTrace();
}

function zoomDAG(factor) {
  dagZoom = Math.max(0.6, Math.min(2.0, dagZoom * factor));
  const canvas = document.getElementById('lineage-canvas');
  if (canvas) drawDAG(canvas, currentDAGRoot);
}

function resetDAGZoom() {
  dagZoom = 1.0;
  const canvas = document.getElementById('lineage-canvas');
  if (canvas) drawDAG(canvas, currentDAGRoot);
}

function toggleDAGParticles() {
  dagParticlesActive = !dagParticlesActive;
  const btn = document.getElementById('btn-toggle-particles');
  if (btn) btn.textContent = 'Flow: ' + (dagParticlesActive ? 'ON' : 'OFF');
  if (!dagParticlesActive && dagAnimFrame) {
    cancelAnimationFrame(dagAnimFrame);
    dagAnimFrame = null;
  }
}

function runTrace() {
  const id = (document.getElementById('lineage-search-id') || {}).value.trim() || 'BATCH-2024-0192';
  currentDAGRoot = id;
  const ph = document.getElementById('canvas-placeholder');
  if (ph) ph.style.display = 'none';
  const canvas = document.getElementById('lineage-canvas');
  const wrap = document.getElementById('lineage-canvas-wrap');
  if (!canvas || !wrap) return;
  canvas.width = wrap.offsetWidth || 800;
  canvas.height = wrap.offsetHeight || 560;
  initDAGParticles();
  drawDAG(canvas, id);
  if (DAG_NODES[id]) showNodeDetail(id, DAG_NODES[id]);
  else showNodeDetail(id, { label: id, name: 'Queried Entity', sys: 'DAG Node', hash: 'e3b0c44298fc...ba', sig: 'Ed25519 Verified', status: 'Active', children: [] });
  toast('Topological trace completed for ' + id, 'success');
}

function initDAGParticles() {
  dagParticles = [];
  for (let i = 0; i < 24; i++) {
    dagParticles.push({
      edgeIdx: i % 8,
      progress: Math.random(),
      speed: 0.005 + Math.random() * 0.008
    });
  }
}

function drawDAG(canvas, rootId) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const W = canvas.width, H = canvas.height;

  // Build DAG layers
  const levels = [];
  const visited = new Set();
  function bfs(id, level) {
    if (visited.has(id) || !DAG_NODES[id]) return;
    visited.add(id);
    if (!levels[level]) levels[level] = [];
    levels[level].push(id);
    (DAG_NODES[id].children || []).forEach(function(c) { bfs(c, level + 1); });
  }

  // Include parallel branches if root is BATCH-2024-0192 or finished good
  bfs(rootId, 0);
  if (rootId === 'BATCH-2024-0192' && !visited.has('BATCH-2024-0174')) {
    bfs('BATCH-2024-0174', 0);
  }

  dagPositions = {};
  const numLevels = Math.max(levels.length, 3);
  const lh = H / (numLevels + 1);

  levels.forEach(function(lvl, li) {
    const lw = W / (lvl.length + 1);
    lvl.forEach(function(id, ii) {
      dagPositions[id] = {
        x: lw * (ii + 1),
        y: lh * (li + 1)
      };
    });
  });

  // Collect edges
  const edges = [];
  Object.keys(dagPositions).forEach(function(id) {
    const n = DAG_NODES[id];
    if (!n) return;
    (n.children || []).forEach(function(c) {
      if (dagPositions[c]) edges.push({ from: dagPositions[id], to: dagPositions[c], fromId: id, toId: c });
    });
  });

  // Draw Spline Edges
  edges.forEach(function(e) {
    const grad = ctx.createLinearGradient(e.from.x, e.from.y, e.to.x, e.to.y);
    const c1 = NODE_COLORS[(DAG_NODES[e.fromId] || {}).type] || '#38BDF8';
    const c2 = NODE_COLORS[(DAG_NODES[e.toId] || {}).type] || '#818CF8';
    grad.addColorStop(0, c1 + '66');
    grad.addColorStop(1, c2 + 'AA');

    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2 * dagZoom;
    ctx.beginPath();
    const midY = (e.from.y + e.to.y) / 2;
    ctx.moveTo(e.from.x, e.from.y);
    ctx.bezierCurveTo(e.from.x, midY, e.to.x, midY, e.to.x, e.to.y);
    ctx.stroke();
    ctx.restore();
  });

  // Draw Animated Particles
  if (dagParticlesActive && edges.length > 0) {
    ctx.save();
    dagParticles.forEach(function(p) {
      const e = edges[p.edgeIdx % edges.length];
      if (!e) return;
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;
      const t = p.progress;
      const midY = (e.from.y + e.to.y) / 2;
      // Cubic Bezier interpolation
      const bx = Math.pow(1 - t, 3) * e.from.x + 3 * Math.pow(1 - t, 2) * t * e.from.x + 3 * (1 - t) * Math.pow(t, 2) * e.to.x + Math.pow(t, 3) * e.to.x;
      const by = Math.pow(1 - t, 3) * e.from.y + 3 * Math.pow(1 - t, 2) * t * midY + 3 * (1 - t) * Math.pow(t, 2) * midY + Math.pow(t, 3) * e.to.y;

      ctx.beginPath();
      ctx.arc(bx, by, 3.5 * dagZoom, 0, Math.PI * 2);
      ctx.fillStyle = '#00E5FF';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 8;
      ctx.fill();
    });
    ctx.restore();
  }

  // Draw Nodes
  Object.entries(dagPositions).forEach(function(entry) {
    const id = entry[0], pos = entry[1];
    const n = DAG_NODES[id] || { type: 'raw', name: id, sys: 'ERP' };
    const col = NODE_COLORS[n.type] || '#38BDF8';
    const cardW = 160 * dagZoom, cardH = 58 * dagZoom;
    const cx = pos.x - cardW / 2, cy = pos.y - cardH / 2;

    ctx.save();
    // Shadow glow
    ctx.shadowColor = col;
    ctx.shadowBlur = 14;
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;

    // Rounded rectangle
    const r = 8 * dagZoom;
    ctx.beginPath();
    ctx.moveTo(cx + r, cy);
    ctx.lineTo(cx + cardW - r, cy);
    ctx.quadraticCurveTo(cx + cardW, cy, cx + cardW, cy + r);
    ctx.lineTo(cx + cardW, cy + cardH - r);
    ctx.quadraticCurveTo(cx + cardW, cy + cardH, cx + cardW - r, cy + cardH);
    ctx.lineTo(cx + r, cy + cardH);
    ctx.quadraticCurveTo(cx, cy + cardH, cx, cy + cardH - r);
    ctx.lineTo(cx, cy + r);
    ctx.quadraticCurveTo(cx, cy, cx + r, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left accent pill
    ctx.fillStyle = col;
    ctx.fillRect(cx, cy + r, 4 * dagZoom, cardH - 2 * r);

    // Text labels
    ctx.shadowBlur = 0;
    ctx.fillStyle = col;
    ctx.font = 'bold ' + Math.max(9, Math.floor(10 * dagZoom)) + 'px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('[' + (n.sys || 'DAG') + '] ' + n.type.toUpperCase(), cx + 12 * dagZoom, cy + 18 * dagZoom);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold ' + Math.max(10, Math.floor(11 * dagZoom)) + 'px Inter';
    ctx.fillText(n.label || id, cx + 12 * dagZoom, cy + 34 * dagZoom);

    ctx.fillStyle = '#94A3B8';
    ctx.font = Math.max(8, Math.floor(9 * dagZoom)) + 'px JetBrains Mono';
    const subtext = n.name ? (n.name.length > 20 ? n.name.slice(0, 18) + '..' : n.name) : (n.hash ? n.hash.slice(0, 14) + '..' : '');
    ctx.fillText(subtext, cx + 12 * dagZoom, cy + 48 * dagZoom);

    ctx.restore();
  });

  // Canvas interaction
  canvas.onclick = function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    Object.entries(dagPositions).forEach(function(entry) {
      const id = entry[0], pos = entry[1];
      const cardW = 160 * dagZoom, cardH = 58 * dagZoom;
      if (mx >= pos.x - cardW / 2 && mx <= pos.x + cardW / 2 && my >= pos.y - cardH / 2 && my <= pos.y + cardH / 2) {
        showNodeDetail(id, DAG_NODES[id] || { label: id, sys: 'ERP' });
      }
    });
  };

  // Continuous loop if particles active
  if (dagParticlesActive && !dagAnimFrame) {
    dagAnimFrame = requestAnimationFrame(function() {
      dagAnimFrame = null;
      const c = document.getElementById('lineage-canvas');
      if (c && !document.getElementById('page-lineage').classList.contains('hidden')) {
        drawDAG(c, currentDAGRoot);
      }
    });
  }
}

function showNodeDetail(id, node) {
  if (!node) return;
  const body = document.getElementById('lineage-detail-body');
  if (!body) return;
  const col = NODE_COLORS[node.type] || '#38BDF8';
  const rows = [
    ['Entity ID', id],
    ['Subsystem', node.sys || 'ERP'],
    ['Description', node.name || node.label || id],
    ['QC / Execution', node.status || 'Verified'],
    ['Merkle Root', (node.hash || node.rootHash || 'a3f7c1d9...b22e')],
    ['Signature', (node.sig || 'Ed25519 Verified')],
    ['Downstream Links', (node.children || []).length + ' Entities']
  ];

  body.innerHTML =
    '<div style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">' +
      '<span class="gt-node-inspector-badge" style="background:' + col + '22;color:' + col + ';border:1px solid ' + col + '">[' + (node.sys || 'DAG') + '] ' + (node.type || 'RAW').toUpperCase() + '</span>' +
      '<span style="font-size:10px;font-family:var(--mono);color:var(--mes)">● Tamper-Proof</span>' +
    '</div>' +
    rows.map(function(r) {
      return '<div class="node-detail-row"><span class="node-detail-key">' + r[0] + '</span><span class="node-detail-value">' + r[1] + '</span></div>';
    }).join('') +
    '<div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">' +
      (node.sys === 'ERP' ? '<button class="btn btn-sm btn-outline" onclick="jumpToERP(\'' + id + '\')">Inspect in ERP Material Lots →</button>' : '') +
      (node.sys === 'MES' ? '<button class="btn btn-sm btn-outline" onclick="jumpToMES(\'' + id + '\')">Inspect in MES Work Orders →</button>' : '') +
      (node.sys === 'SCADA' ? '<button class="btn btn-sm btn-outline" onclick="showPage(\'scada\')">Stream SCADA Telemetry →</button>' : '') +
      (node.sys === 'DPP' ? '<button class="btn btn-sm btn-primary" onclick="loadPassportFromId(\'' + id + '\')">Open Digital Product Passport →</button>' : '') +
      '<button class="btn btn-sm btn-danger" onclick="jumpToRecallDefect(\'' + id + '\')">Inject Defect &amp; Test Recall →</button>' +
    '</div>';
}

function showNodeDetail(id, node) {
  if (!node) return;
  const body = document.getElementById('lineage-detail-body');
  const col = NODE_COLORS[node.type] || '#94A3B8';
  const rows = [['ID',id],['System',node.sys],['Label',node.label],['Merkle Hash',node.hash],['Children',(node.children||[]).length]];
  body.innerHTML = '<div style="margin-bottom:12px"><span class="status-pill" style="background:' + col + '22;color:' + col + ';border:1px solid ' + col + '">' + node.type.toUpperCase() + '</span></div>' +
    rows.map(function(r) { return '<div class="node-detail-row"><span class="node-detail-key">' + r[0] + '</span><span class="node-detail-value">' + r[1] + '</span></div>'; }).join('');
}

function verifyAllHashes() {
  toast('Verifying all Merkle hashes...', 'info');
  setTimeout(function() { toast('All 56,193 nodes verified. No tampering detected.', 'success', 5000); }, 350);
}

/* ── RECALL ENGINE ── */
/* ── RECALL ENGINE (Store-by-Store Targeted Quarantine) ── */
function runRecall() {
  const batchId  = (document.getElementById('recall-batch-id') || {}).value || 'BAT-2024-X49';
  const scrapVal = parseInt((document.getElementById('recall-scrap-value') || {}).value) || 55000;
  const btn = document.getElementById('run-recall-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Analysing Merkle DAG...'; }
  toast('Running BFS traversal on DAG for ' + batchId + '...', 'info');
  setTimeout(function() {
    const blanketUnits = 3842, precisionUnits = 287;
    const blanketCost  = blanketUnits * scrapVal;
    const precisionCost= precisionUnits * scrapVal;
    const saved        = blanketCost - precisionCost;
    const latency      = Math.floor(68 + Math.random()*24);
    const blanketH = 140, precH = Math.round(140*(precisionCost/blanketCost));
    const affectedRows = [
      ['SM-S928-IND-00841','Galaxy S24 Ultra (512GB)','WO-SMT-2024-1841','SMT-002','Store #101 · BKC Mumbai','Quarantined (On Shelf)'],
      ['SM-S928-IND-00862','Galaxy S24 Ultra (512GB)','WO-SMT-2024-1841','SMT-002','Store #204 · Bengaluru Hub','Quarantined (On Shelf)'],
      ['SM-S928-IND-00924','Galaxy S24 Ultra (512GB)','WO-SMT-2024-1841','SMT-002','Store #305 · Delhi Opera','Quarantined (On Shelf)'],
      ['SM-S928-IND-00980','Galaxy S24 Ultra (512GB)','WO-SMT-2024-1841','SMT-002','Store #412 · Hyderabad','Quarantined (On Shelf)'],
      ['SM-S928-IND-01045','Galaxy S24 Ultra (512GB)','WO-SMT-2024-1841','SMT-002','Bhiwandi Logistics Hub','Halted In-Transit']
    ];
    const resultsContainer = document.getElementById('recall-results');
    if (resultsContainer) {
      resultsContainer.innerHTML =
        '<div style="background:rgba(239,68,68,0.12);border:1px solid var(--recall);border-radius:var(--radius);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px">' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:8px">' +
              '<span class="gt-status-dot gt-dot-warn"></span>' +
              '<strong style="color:var(--recall);font-size:14px">TARGETED STORE QUARANTINE DIRECTIVE #SQD-2024-089 ACTIVE</strong>' +
              '<span class="gt-pill gt-pill-danger">Precision Blast Radius</span>' +
            '</div>' +
            '<p style="color:var(--text-muted);font-size:12px;margin-top:4px">Target Defective Batch: <strong>' + batchId + '</strong> · Root Cause: SCADA SEN-T-010 Battery Thermal Cycling Exceeded (>60.0°C)</p>' +
          '</div>' +
          '<div style="display:flex;gap:10px">' +
            '<button class="btn btn-sm btn-outline" style="border-color:var(--scada);color:var(--scada)" onclick="showPage(\'scada\')">Stream SCADA Drift →</button>' +
            '<button class="btn btn-sm btn-danger" onclick="downloadRecallNotice(\'' + batchId + '\')">Download Store Directive (.txt)</button>' +
          '</div>' +
        '</div>' +

        '<div class="recall-kpi-row">' +
          '<div class="recall-kpi"><div class="recall-kpi-label">Affected Sister Mobiles</div><div class="recall-kpi-value" style="color:var(--recall)">' + precisionUnits.toLocaleString('en-IN') + ' Units</div></div>' +
          '<div class="recall-kpi"><div class="recall-kpi-label">DAG Resolution Latency</div><div class="recall-kpi-value" style="color:var(--lineage)">' + latency + ' ms</div></div>' +
          '<div class="recall-kpi"><div class="recall-kpi-label">Root Supplier Lot</div><div class="recall-kpi-value" style="color:var(--erp)">SDI-L240912-X49</div></div>' +
          '<div class="recall-kpi"><div class="recall-kpi-label">Blast Radius Containment</div><div class="recall-kpi-value" style="color:var(--mes)">92.5% Narrowed</div></div>' +
        '</div>' +

        '<div class="cost-comparison card"><div class="card-header"><h3>Financial Impact: Blanket Product Recall vs. GeneaTrace Precision Store Quarantine</h3></div>' +
        '<div style="padding:20px"><div class="cost-bars">' +
          '<div class="cost-bar-wrap"><div class="cost-bar-amount" style="color:var(--recall)">₹ ' + (blanketCost/10000000).toFixed(2) + ' Crores</div><div class="cost-bar-col cost-bar-col-recall" style="height:' + blanketH + 'px"></div><div class="cost-bar-label">Blanket Market Recall<br>' + blanketUnits.toLocaleString() + ' Mobiles (All 48 Stores)</div></div>' +
          '<div class="cost-bar-wrap"><div class="cost-bar-amount" style="color:var(--mes)">₹ ' + (precisionCost/10000000).toFixed(2) + ' Crores</div><div class="cost-bar-col cost-bar-col-precision" style="height:' + precH + 'px"></div><div class="cost-bar-label">GeneaTrace Precision Quarantine<br>' + precisionUnits.toLocaleString() + ' Mobiles (Targeted Stores Only)</div></div>' +
          '<div class="cost-bar-wrap" style="justify-content:center;align-items:center;border:1px dashed var(--mes);border-radius:8px;padding:16px"><div class="cost-saved-badge" style="width:100%"><div class="saved-val">₹ ' + (saved/10000000).toFixed(2) + ' Crores</div><div class="saved-label">Direct Corporate Capital Preserved</div></div></div>' +
        '</div></div></div>' +

        '<div class="recall-affected-table"><div class="card-header" style="background:var(--card);border:1px solid var(--border);border-bottom:none;border-radius:10px 10px 0 0"><h3>Affected Sister Smartphone Manifest by Retail Destination</h3><span class="card-badge">Displaying Top 5 of ' + precisionUnits + '</span></div>' +
        '<div class="data-table-wrap" style="border-radius:0 0 10px 10px"><table class="data-table"><thead><tr><th>Serial Number</th><th>Smartphone Model</th><th>Work Order</th><th>SMT Line</th><th>Current Retail Location</th><th>Quarantine Status</th><th>Passport Action</th></tr></thead><tbody>' +
        affectedRows.map(function(r) {
          return '<tr><td class="mono" style="color:var(--recall);font-weight:700">' + r[0] + '</td><td>' + r[1] + '</td><td class="mono">' + r[2] + '</td><td class="mono">' + r[3] + '</td><td style="font-weight:600">' + r[4] + '</td><td><span class="gt-pill gt-pill-danger">' + r[5] + '</span></td><td><button class="btn btn-sm btn-outline" onclick="loadPassportFromId(\'' + r[0] + '\')">Inspect Passport →</button></td></tr>';
        }).join('') +
        '</tbody></table></div></div>';
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Run Targeted Recall Analysis'; }
    toast('Targeted recall complete: Isolated 287 sister mobiles in ' + latency + 'ms. Saved ₹ ' + (saved/10000000).toFixed(2) + ' Crores!', 'success', 6000);
  }, 350);
}

function downloadRecallNotice(batchId) {
  const content =
    '========================================================================\n' +
    '  GENEATRACE SMARTPHONE STORE QUARANTINE DIRECTIVE #SQD-2024-089\n' +
    '========================================================================\n' +
    'Target Defective Batch ID: ' + batchId + '\n' +
    'Subsystem Root Cause: SCADA Battery Thermal Cycling Suite SEN-T-010\n' +
    'Anomaly Reading: 68.2 C (Threshold Limit: 60.0 C Exceeded)\n' +
    'Affected Smartphone Model: Samsung Galaxy S24 Ultra (512GB Titanium)\n' +
    'Total Mobiles Produced in Production Week: 3,842\n' +
    'Targeted Sister Mobiles Quarantined: 287 (92.5% Containment Narrowing)\n' +
    'Corporate Capital Preserved: INR 19,55,25,000 (19.55 Crores)\n' +
    '\n' +
    'RETAIL STORE QUARANTINE DISPATCH MANIFEST:\n' +
    '------------------------------------------------------------------------\n' +
    '1. Store #101 · Samsung Flagship BKC, Mumbai:\n' +
    '   - Allocated Serials: SM-S928-IND-00800 to 00841 (42 Units)\n' +
    '   - Action: Lock 31 Units on Shelf immediately; Notify 11 Registered Users\n' +
    '\n' +
    '2. Store #204 · Samsung SmartCafe Indiranagar, Bengaluru:\n' +
    '   - Allocated Serials: SM-S928-IND-00842 to 00909 (68 Units)\n' +
    '   - Action: Lock 54 Units on Shelf; Notify 14 Registered Users\n' +
    '\n' +
    '3. Store #305 · Samsung Opera House Connaught Place, Delhi:\n' +
    '   - Allocated Serials: SM-S928-IND-00910 to 00964 (55 Units)\n' +
    '   - Action: Lock 47 Units on Shelf; Notify 8 Registered Users\n' +
    '\n' +
    '4. Store #412 · Cyber Hub Retail, HITEC City, Hyderabad:\n' +
    '   - Allocated Serials: SM-S928-IND-00965 to 01002 (38 Units)\n' +
    '   - Action: Lock 33 Units on Shelf; Notify 5 Registered Users\n' +
    '\n' +
    '5. Central Western Logistics Hub, Bhiwandi Transit:\n' +
    '   - Allocated Serials: SM-S928-IND-01003 to 01086 (84 Units)\n' +
    '   - Action: Quarantine shipment in transit, halt regional truck dispatch\n' +
    '------------------------------------------------------------------------\n' +
    'Cryptographic Merkle Root: 0xf1d489c2a3b710de9481b7e0a294817cb209148d90184b2e8\n' +
    'Public Key Witness: Ed25519 Certified by GeneaTrace Root Authority\n' +
    'Timestamp: ' + new Date().toISOString() + '\n' +
    '========================================================================\n';
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'GeneaTrace_Store_Quarantine_Directive_' + batchId + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast('Store Quarantine Directive downloaded for ' + batchId, 'success');
}

function quarantineItem(serial) {
  toast('Quarantine confirmed for ' + serial, 'warn');
}

function loadPassport(serial) {
  if (!serial || typeof serial !== 'string') {
    const inputEl = document.getElementById('passport-serial-input') || document.getElementById('passport-serial');
    serial = (inputEl && inputEl.value) ? inputEl.value.trim() : 'S24U123456789';
  }
  serial = serial.trim();

  const displaySerial = document.getElementById('pp-serial-display');
  const infoSerial = document.getElementById('pp-info-serial');
  const lineageFinished = document.getElementById('pp-lineage-finished');
  const locationDisplay = document.getElementById('pp-location-display');
  const infoLoc = document.getElementById('pp-info-loc');
  const infoBatch = document.getElementById('pp-info-batch');
  const serialInput = document.getElementById('passport-serial-input');

  if (serialInput) serialInput.value = serial;
  if (displaySerial) displaySerial.textContent = serial;
  if (infoSerial) infoSerial.textContent = serial;
  if (lineageFinished) lineageFinished.textContent = serial;

  if (serial.includes('00841') || serial.includes('BKC') || serial.includes('MUM')) {
    if (locationDisplay) locationDisplay.textContent = 'Samsung Flagship BKC, Mumbai · Store #101';
    if (infoLoc) infoLoc.textContent = 'Samsung Flagship BKC, Mumbai (Store #101)';
    if (infoBatch) infoBatch.textContent = 'BAT-2024-X49';
  } else {
    if (locationDisplay) locationDisplay.textContent = 'Chennai Store - ELC001';
    if (infoLoc) infoLoc.textContent = 'Chennai Store - ELC001';
    if (infoBatch) infoBatch.textContent = 'B-2504-17';
  }

  // Generate mini SVG QR Code for visual authenticity
  const qrSvg =
    '<svg width="96" height="96" viewBox="0 0 90 90" fill="#0A0D14" style="background:#FFFFFF;border-radius:6px;padding:6px;box-shadow:0 0 16px rgba(0,229,255,0.25)">' +
      '<rect x="8" y="8" width="22" height="22" fill="#0A0D14"/>' +
      '<rect x="12" y="12" width="14" height="14" fill="#FFFFFF"/>' +
      '<rect x="15" y="15" width="8" height="8" fill="#0A0D14"/>' +
      '<rect x="60" y="8" width="22" height="22" fill="#0A0D14"/>' +
      '<rect x="64" y="12" width="14" height="14" fill="#FFFFFF"/>' +
      '<rect x="67" y="15" width="8" height="8" fill="#0A0D14"/>' +
      '<rect x="8" y="60" width="22" height="22" fill="#0A0D14"/>' +
      '<rect x="12" y="64" width="14" height="14" fill="#FFFFFF"/>' +
      '<rect x="15" y="67" width="8" height="8" fill="#0A0D14"/>' +
      '<rect x="36" y="12" width="6" height="6" fill="#0A0D14"/>' +
      '<rect x="46" y="20" width="6" height="6" fill="#0A0D14"/>' +
      '<rect x="36" y="36" width="16" height="16" fill="#0A0D14"/>' +
      '<rect x="60" y="44" width="8" height="8" fill="#0A0D14"/>' +
      '<rect x="74" y="56" width="8" height="8" fill="#0A0D14"/>' +
      '<rect x="44" y="66" width="10" height="10" fill="#0A0D14"/>' +
    '</svg>';

  const displayEl = document.getElementById('passport-display');
  if (displayEl) {
    displayEl.innerHTML =
      '<div class="passport-doc">' +
        '<div class="passport-doc-header">' +
          '<div style="display:flex;align-items:center;gap:18px">' +
            qrSvg +
            '<div>' +
              '<div class="passport-product-name">Samsung Galaxy S24 Ultra · 512GB Titanium Gray</div>' +
              '<div style="margin-top:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
                '<span class="passport-serial-chip">' + serial + '</span>' +
                '<span class="gt-pill" style="font-family:var(--mono);background:var(--card);color:var(--text);border:1px solid var(--border)">IMEI: 358941092847190</span>' +
                '<span class="gt-pill gt-pill-active">EU DPP Compliance Verified</span>' +
                '<span class="gt-pill" style="background:rgba(56,189,248,0.15);color:var(--lineage);border:1px solid rgba(56,189,248,0.3)">Merkle Root Sealed</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<div class="passport-integrity integrity-ok"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 2L14 5v4c0 3-3 5-6 6-3-1-6-3-6-6V5L8 2Z"/><polyline points="5,8 7.5,10.5 11,6" stroke-linecap="round"/></svg> Integrity Cryptographically Verified</div>' +
            '<div style="font-size:10px;font-family:var(--mono);color:var(--text-dim);margin-top:4px">Ed25519 Signed · Root Block #1,492,028</div>' +
          '</div>' +
        '</div>' +

        '<div class="passport-sections">' +
          makeSection('MES — Cleanroom Manufacturing & SMT Assembly Details','var(--mes)',[
            ['Manufacturing Started','2024-10-10 08:14:22 IST (SMT Line 03 · Cleanroom Bay 2)'],
            ['Manufacturing Completed','2024-10-10 16:45:10 IST (Robotic Packaging Line 1)'],
            ['Work Order Number','WO-SMT-2024-1841 (Lot Run: 500 units)'],
            ['Surface-Mount Station','High-Speed Chip Shooter SMT-002 (Siemens Siplace TX)'],
            ['Lead Certified Operator','Ravi Shankar (Level 3 SMT Master Technician)'],
            ['Quality Assurance Gate','100% 3D Automated Optical Inspection (AOI) Passed'],
            ['RF & 5G Calibration','Sub-6GHz & mmWave Passed (-94.2 dBm Sensitivity)']
          ]) +

          makeSection('ERP — Sub-Component Batches & Raw Material Provenance','var(--erp)',[
            ['Battery Cell Batch ID','BAT-2024-X49 · Samsung SDI 5000mAh Dual-Cell (MTC 3.1 Pass)'],
            ['AMOLED Display Panel','DISP-QHD-882 · Samsung Display M13 Dynamic AMOLED 2X 120Hz LTPO'],
            ['Application Processor (SoC)','AP-8GEN3-LOT9 · Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm TSMC)'],
            ['Chassis Frame Batch','CHAS-TI-042 · Aerospace Grade 5 Titanium Frame'],
            ['Camera Subsystem','CAM-200MP-LOT4 · ISOCELL HP2 200MP OIS Sensor Module'],
            ['Cryptographic Merkle Leaf Hash','0xa3f7c1d9e2b840fc8912efc40192d8b22e']
          ]) +

          makeSection('SCADA — High-Frequency Sensor Telemetry (Manufacturing Run)','var(--scada)',[
            ['SMT Reflow Oven Zone 4 Peak Temp','242.4 °C (Limit: 250.0 °C · In-Tolerance Profile)'],
            ['Battery Ultrasonic Welder Force','38.5 J (Limit: 45.0 J · Optimal Bond Formed)'],
            ['Cleanroom ISO Class 5 Particle Count','28 count/m³ (Limit: <3,520 count/m³)'],
            ['Dispenser Underfill UV Curing Temp','82.1 °C (Limit: 85.0 °C)'],
            ['Nitrogen Inerting Chamber O2 Level','14 ppm (Limit: <25 ppm)'],
            ['Process Anomaly Detected in Batch','SEN-T-010 Thermal Cycling Warning flagged for Lot BAT-2024-X49']
          ]) +

          '<div class="passport-section" style="border-color:var(--lineage)">' +
            '<div class="passport-section-header" style="background:rgba(56,189,248,0.12)">' +
              '<span style="width:10px;height:10px;border-radius:50%;background:var(--lineage);flex-shrink:0"></span>' +
              '<h4>Sister Devices Distribution &amp; Retail Store Geolocation (Batch BAT-2024-X49)</h4>' +
              '<span class="gt-pill" style="background:var(--recall-dim);color:var(--recall);border:1px solid var(--recall);font-size:10px">287 Sister Mobiles Located</span>' +
            '</div>' +
            '<div class="passport-section-body">' +
              '<div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">' +
                'This mobile (<strong>' + serial + '</strong>) belongs to battery batch <strong>BAT-2024-X49</strong>. If a defect is confirmed, GeneaTrace isolates only the 287 sister devices manufactured in this exact lot across 4 flagship stores and 1 transit corridor:' +
              '</div>' +
              '<div class="data-table-wrap" style="margin-bottom:14px">' +
                '<table class="data-table">' +
                  '<thead><tr><th>Destination Store</th><th>Dispatched Range</th><th>Stock Status</th><th>Action</th></tr></thead>' +
                  '<tbody>' +
                    '<tr><td><strong>Store #101 · Samsung Flagship BKC, Mumbai</strong><br><span style="font-size:11px;color:var(--text-muted)">Current Location of ' + serial + '</span></td><td class="mono">00800 → 00841 (42 Units)</td><td><span class="gt-stock-badge gt-stock-quarantined">31 on Shelf · 11 Sold</span></td><td><button class="btn btn-sm btn-outline" onclick="quarantineItem(\'Store 101\')">Lock Store Stock</button></td></tr>' +
                    '<tr><td><strong>Store #204 · Samsung SmartCafé, Bengaluru</strong><br><span style="font-size:11px;color:var(--text-muted)">Indiranagar 100ft Road Hub</span></td><td class="mono">00842 → 00909 (68 Units)</td><td><span class="gt-stock-badge gt-stock-quarantined">54 on Shelf · 14 Sold</span></td><td><button class="btn btn-sm btn-outline" onclick="quarantineItem(\'Store 204\')">Lock Store Stock</button></td></tr>' +
                    '<tr><td><strong>Store #305 · Samsung Opera House, Delhi</strong><br><span style="font-size:11px;color:var(--text-muted)">Connaught Place Central Hub</span></td><td class="mono">00910 → 00964 (55 Units)</td><td><span class="gt-stock-badge gt-stock-quarantined">47 on Shelf · 8 Sold</span></td><td><button class="btn btn-sm btn-outline" onclick="quarantineItem(\'Store 305\')">Lock Store Stock</button></td></tr>' +
                    '<tr><td><strong>Store #412 · Cyber Hub Retail, Hyderabad</strong><br><span style="font-size:11px;color:var(--text-muted)">HITEC City Tech Center</span></td><td class="mono">00965 → 01002 (38 Units)</td><td><span class="gt-stock-badge gt-stock-quarantined">33 on Shelf · 5 Sold</span></td><td><button class="btn btn-sm btn-outline" onclick="quarantineItem(\'Store 412\')">Lock Store Stock</button></td></tr>' +
                    '<tr><td><strong>Central Western Logistics Hub, Bhiwandi</strong><br><span style="font-size:11px;color:var(--text-muted)">Distribution In-Transit</span></td><td class="mono">01003 → 01086 (84 Units)</td><td><span class="gt-stock-badge gt-stock-quarantined">84 Units Halted</span></td><td><button class="btn btn-sm btn-danger" onclick="downloadRecallNotice(\'BAT-2024-X49\')">Halt Dispatch</button></td></tr>' +
                  '</tbody>' +
                '</table>' +
              '</div>' +
              '<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);padding:10px 14px;border-radius:6px">' +
                '<span style="font-size:12px;color:var(--recall);font-weight:600">Zero Blanket Recall: 3,555 non-affected mobiles remain in market untouched.</span>' +
                '<button class="btn btn-sm btn-danger" onclick="showPage(\'recall\')">Open Targeted Recall Engine →</button>' +
              '</div>' +
            '</div>' +
          '</div>' +

          makeSection('Cryptographic State Proof & Merkle DAG Consensus','var(--lineage)',[
            ['Merkle State Root','0xf1d489c2a3b710de9481b7e0a294817cb209148d90184b2e8'],
            ['Public Key Witness Signature','Ed25519 Certified by GeneaTrace DPP Authority'],
            ['EU Digital Product Passport Directive','Conformity Attested under Regulation (EU) 2024/1781'],
            ['Resolution Latency','64 ms Topological Traversal across ERP + MES + SCADA']
          ]) +
        '</div>' +
      '</div>';
  }
  toast('Digital Product Passport & Store Distribution loaded for ' + serial, 'success');
}

function makeSection(title, color, rows) {
  return '<div class="passport-section"><div class="passport-section-header"><span style="width:10px;height:10px;border-radius:50%;background:' + color + ';flex-shrink:0"></span><h4>' + title + '</h4></div><div class="passport-section-body">' +
    rows.map(function(r) { return '<div class="passport-row"><span class="passport-key">' + r[0] + '</span><span class="passport-val' + (r[0].includes('Hash')||r[0].includes('Root')?' hash-val':'') + '">' + r[1] + '</span></div>'; }).join('') +
    '</div></div>';
}

function verifyPassport() {
  toast('Recomputing Merkle inclusion proofs across all 7 DAG nodes...', 'info');
  setTimeout(function() { toast('All 7 Merkle hashes match the state root. Passport is 100% tamper-proof.', 'success', 5000); }, 350);
}

/* ── KEYBOARD ── */
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey||e.metaKey) && e.key==='k') {
    e.preventDefault();
    document.getElementById('global-search-input').focus();
  }
});

/* ── SCADA ANOMALY & BATCH TRANSIT LOCATOR ── */
function switchRecallSubtab(tab) {
  const btnTracker = document.getElementById('btn-recall-subtab-tracker');
  const btnFinance = document.getElementById('btn-recall-subtab-finance');
  const viewTracker = document.getElementById('recall-view-tracker');
  const viewFinance = document.getElementById('recall-view-finance');

  if (tab === 'tracker') {
    if (btnTracker) btnTracker.classList.add('active');
    if (btnFinance) btnFinance.classList.remove('active');
    if (viewTracker) viewTracker.classList.remove('hidden');
    if (viewFinance) viewFinance.classList.add('hidden');
  } else {
    if (btnTracker) btnTracker.classList.remove('active');
    if (btnFinance) btnFinance.classList.add('active');
    if (viewTracker) viewTracker.classList.add('hidden');
    if (viewFinance) viewFinance.classList.remove('hidden');
    runRecall();
  }
}

function openBatchTracker(batchNo, date, time, sensor) {
  showPage('recall');
  switchRecallSubtab('tracker');
  const bInput = document.getElementById('tracker-batch-no');
  const dInput = document.getElementById('tracker-batch-date');
  const tInput = document.getElementById('tracker-batch-time');
  const sInput = document.getElementById('tracker-sensor-station');

  if (bInput && batchNo) bInput.value = batchNo;
  if (dInput && date) dInput.value = date;
  if (tInput && time) tInput.value = time;
  if (sInput && sensor) sInput.value = sensor;

  locateBatchUnits();
}

function loadIncidentPreset(batchNo, date, time, sensor) {
  const bInput = document.getElementById('tracker-batch-no');
  const dInput = document.getElementById('tracker-batch-date');
  const tInput = document.getElementById('tracker-batch-time');
  const sInput = document.getElementById('tracker-sensor-station');

  if (bInput) bInput.value = batchNo;
  if (dInput) dInput.value = date;
  if (tInput) tInput.value = time;
  if (sInput) sInput.value = sensor;

  locateBatchUnits();
}

function locateBatchUnits() {
  const batchNo = ((document.getElementById('tracker-batch-no') || {}).value || 'B-2504-17').trim().toUpperCase();
  const dateVal = (document.getElementById('tracker-batch-date') || {}).value || '2025-04-12';
  const timeVal = (document.getElementById('tracker-batch-time') || {}).value || '14:32';

  toast('Correlating SCADA telemetry for Batch ' + batchNo + ' at ' + timeVal + '...', 'info');

  let modelName = 'Samsung Galaxy S24 Ultra (512GB Titanium)';
  let totalUnits = 1000;
  let whUnits = 150;
  let hubUnits = 350;
  let shopUnits = 500;
  let sensorVal = '64.8 °C';
  let sensorLimit = 'Limit: 55.0 °C';
  let defectRisk = '94.2%';
  let riskNote = 'Internal Lithium-Ion Thermal Delamination Risk';
  let serialPrefix = 'S24U123456';

  if (batchNo.includes('2305-11')) {
    modelName = 'Samsung Galaxy S24+ (256GB Onyx Black)';
    totalUnits = 800;
    whUnits = 200;
    hubUnits = 280;
    shopUnits = 320;
    sensorVal = '3.2 bar';
    sensorLimit = 'Limit: 4.5 bar min';
    defectRisk = '88.5%';
    riskNote = 'Inadequate Ultrasonic Housing Weld Ingress Risk';
    serialPrefix = 'S24P982341';
  } else if (batchNo.includes('2305-14')) {
    modelName = 'Samsung Galaxy Z Fold 5 (512GB Phantom Black)';
    totalUnits = 500;
    whUnits = 80;
    hubUnits = 180;
    shopUnits = 240;
    sensorVal = '68.5 %';
    sensorLimit = 'Limit: 45.0 % max';
    defectRisk = '76.4%';
    riskNote = 'Cleanroom Humidity Drift During Display Bonding';
    serialPrefix = 'ZFD589120';
  } else if (batchNo.includes('2305-15')) {
    modelName = 'Samsung Galaxy Buds Pro (Silver)';
    totalUnits = 400;
    whUnits = 50;
    hubUnits = 150;
    shopUnits = 200;
    sensorVal = '1.82 mm/s';
    sensorLimit = 'Limit: 0.8 mm/s';
    defectRisk = '81.0%';
    riskNote = 'SMT Axis High Frequency Vibration Jitter';
    serialPrefix = 'BDS330192';
  }

  // Update SCADA Hero Banner
  const diagTitle = document.getElementById('diag-title');
  const diagSub = document.getElementById('diag-subtitle');
  const diagSensor = document.getElementById('diag-sensor-val');
  const diagRisk = document.getElementById('diag-defect-risk');
  const diagTotal = document.getElementById('diag-total-units');

  if (diagTitle) diagTitle.textContent = 'SCADA SENSOR ANOMALY CORRELATED — ' + defectRisk + ' DEFECT PROBABILITY';
  if (diagSub) diagSub.innerHTML = 'Batch <strong>' + batchNo + '</strong> (' + modelName + ') manufactured on <strong>' + dateVal + '</strong> at <strong>' + timeVal + ' IST</strong> flagged by telemetry. ' + riskNote + '.';
  if (diagSensor) diagSensor.textContent = sensorVal;
  if (diagRisk) diagRisk.textContent = defectRisk;
  if (diagTotal) diagTotal.textContent = totalUnits.toLocaleString('en-IN');

  // Update 3-Way Location Cards
  const whPct = Math.round((whUnits / totalUnits) * 100);
  const hubPct = Math.round((hubUnits / totalUnits) * 100);
  const shopPct = 100 - whPct - hubPct;

  const elWh = document.getElementById('loc-wh-count');
  const elHub = document.getElementById('loc-hub-count');
  const elShops = document.getElementById('loc-shops-count');
  const barWh = document.getElementById('loc-wh-bar');
  const barHub = document.getElementById('loc-hub-bar');
  const barShops = document.getElementById('loc-shops-bar');

  if (elWh) elWh.innerHTML = whUnits.toLocaleString('en-IN') + ' <span style="font-size:14px;font-weight:500;color:var(--text-muted)">Units (' + whPct + '%)</span>';
  if (elHub) elHub.innerHTML = hubUnits.toLocaleString('en-IN') + ' <span style="font-size:14px;font-weight:500;color:var(--text-muted)">Units (' + hubPct + '%)</span>';
  if (elShops) elShops.innerHTML = shopUnits.toLocaleString('en-IN') + ' <span style="font-size:14px;font-weight:500;color:var(--text-muted)">Units (' + shopPct + '%)</span>';

  if (barWh) barWh.style.width = whPct + '%';
  if (barHub) barHub.style.width = hubPct + '%';
  if (barShops) barShops.style.width = shopPct + '%';

  // Update Pipeline Stepper
  const pipe1 = document.getElementById('pipe-step-1');
  const pipe2 = document.getElementById('pipe-step-2');
  const pipe3 = document.getElementById('pipe-step-3');
  const pipe4 = document.getElementById('pipe-step-4');
  const scStatus = document.getElementById('sc-flow-status');

  if (pipe1) pipe1.textContent = totalUnits.toLocaleString('en-IN');
  if (pipe2) pipe2.textContent = whUnits.toLocaleString('en-IN');
  if (pipe3) pipe3.textContent = hubUnits.toLocaleString('en-IN');
  if (pipe4) pipe4.textContent = shopUnits.toLocaleString('en-IN');
  if (scStatus) scStatus.textContent = 'Total Batch: ' + totalUnits.toLocaleString('en-IN') + ' Units · 100% Tracked';

  // Update Dynamic Unit Manifest Table
  const tbody = document.getElementById('unit-manifest-tbody');
  if (tbody) {
    const rows = [
      { id: serialPrefix + '789', model: modelName, loc: 'Chennai Store — ELC001', status: 'Retail Stockroom', statusClass: 'warning', directive: 'POS Barcode Blacklisted', dirClass: 'danger' },
      { id: serialPrefix + '790', model: modelName, loc: 'Chennai Store — ELC001', status: 'Sold to Customer (IMEI Active)', statusClass: 'danger', directive: 'Direct SMS Recall Sent', dirClass: 'danger' },
      { id: serialPrefix + '812', model: modelName, loc: 'Bengaluru Store — BLR004', status: 'Retail Vault 2', statusClass: 'warning', directive: 'POS Barcode Blacklisted', dirClass: 'danger' },
      { id: serialPrefix + '825', model: modelName, loc: 'Hyderabad Store — HYD002', status: 'Retail Display Shelf', statusClass: 'warning', directive: 'POS Barcode Blacklisted', dirClass: 'danger' },
      { id: serialPrefix + '945', model: modelName, loc: 'Chennai Central Logistics Hub (DC-01)', status: 'Inbound Dock 07', statusClass: 'info', directive: 'Transit Intercepted', dirClass: 'warning' },
      { id: serialPrefix + '102', model: modelName, loc: 'Sriperumbudur Factory Central Hub', status: 'Warehouse Bay W-04', statusClass: 'warning', directive: 'Outbound Gate Blocked', dirClass: 'danger' }
    ];

    tbody.innerHTML = rows.map(function(r) {
      return '<tr>' +
        '<td class="mono" style="color:var(--brand-blue);font-weight:700">' + r.id + '</td>' +
        '<td>' + r.model + '</td>' +
        '<td class="mono">' + batchNo + '</td>' +
        '<td style="font-weight:600">' + r.loc + '</td>' +
        '<td><span class="status-pill ' + r.statusClass + '">' + r.status + '</span></td>' +
        '<td><span class="status-pill ' + r.dirClass + '">' + r.directive + '</span></td>' +
        '<td><button class="btn btn-sm btn-outline" onclick="loadPassportFromId(\'' + r.id + '\')">Inspect DPP Passport →</button></td>' +
        '</tr>';
    }).join('');
  }

  toast('Supply chain status updated: ' + whUnits + ' in warehouse, ' + hubUnits + ' at city hub, ' + shopUnits + ' in stores.', 'success', 5000);
}

function broadcastStorePOSLock() {
  toast('Lockdown signal broadcasted to 48 store POS terminals! Blacklisted barcodes cannot be billed.', 'error', 6000);
}

function downloadTransitManifest() {
  const batchNo = ((document.getElementById('tracker-batch-no') || {}).value || 'B-2504-17').trim().toUpperCase();
  const dateVal = (document.getElementById('tracker-batch-date') || {}).value || '2025-04-12';
  const timeVal = (document.getElementById('tracker-batch-time') || {}).value || '14:32';

  const manifestContent =
    '========================================================================\n' +
    'GENATRACE POST-DISPATCH SUPPLY CHAIN AUDIT & RECALL MANIFEST\n' +
    'Automated SCADA Sensor Anomaly Correlation Engine\n' +
    '========================================================================\n\n' +
    'AUDIT PARAMETERS:\n' +
    'Target Batch: ' + batchNo + '\n' +
    'Shift Date: ' + dateVal + '\n' +
    'Incident Timestamp: ' + timeVal + ' IST\n' +
    'Sensor Telemetry: Station #3 (SEN-T-010 Thermal Chamber) Exceeded Tolerance (>55.0 C)\n' +
    'Defect Probability: 94.2% (Cell Delamination Risk)\n\n' +
    'PHYSICAL INVENTORY LOCATION BREAKDOWN (1,000 UNITS TOTAL):\n' +
    '------------------------------------------------------------------------\n' +
    '1. Central Factory Warehouse (Sriperumbudur):\n' +
    '   - Held in Storage: 150 Units (15%)\n' +
    '   - Location: Bay W-04, Pallet Racks 12-14\n' +
    '   - Directive: Outbound Barcode Gate Blocked\n\n' +
    '2. Regional Logistics DC (Chennai Metro Sorting Hub):\n' +
    '   - Held in Transit: 350 Units (35%)\n' +
    '   - Location: Inbound Dock 07\n' +
    '   - Directive: Dispatch to Retail Vans Halted\n\n' +
    '3. Retail Flagship Stores:\n' +
    '   - Shipped to Stores: 500 Units (50%)\n' +
    '     * Store #ELC001 (Chennai Express Avenue): 200 Units (172 on shelf, 28 sold)\n' +
    '     * Store #BLR004 (Bengaluru Indiranagar): 180 Units (158 in vault, 22 sold)\n' +
    '     * Store #HYD002 (Hyderabad Hitech City): 120 Units (109 on shelf, 11 sold)\n' +
    '   - Directive: POS Remote Register Freeze Broadcasted\n' +
    '------------------------------------------------------------------------\n' +
    'Cryptographic Merkle Proof: 0x9e248b10f83726a1928374d9e8\n' +
    'Generated at: ' + new Date().toISOString() + '\n' +
    '========================================================================\n';

  const blob = new Blob([manifestContent], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'GeneaTrace_SupplyChain_Manifest_' + batchNo + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast('Supply chain manifest exported for Batch ' + batchNo, 'success');
}

function filterManifestTable(query) {
  query = (query || '').toLowerCase().trim();
  const rows = document.querySelectorAll('#unit-manifest-tbody tr');
  rows.forEach(function(row) {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

/* ── GENEATRACE MASTER IDEA ARCHITECTURE DEMO HANDLERS ── */

function runAncestralIntersectionDemo() {
  const container = document.getElementById('dash-interactive-result');
  if (!container) return;

  toast('Executing Merkle-DAG Ancestral Intersection A(101) ∩ A(102) ∩ A(103)...', 'info');

  container.style.display = 'block';
  container.innerHTML = `
    <div class="demo-result-card">
      <div class="demo-header-row">
        <div>
          <div class="demo-header-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline></svg>
            <span>RESOLVED IN 18.2 ms (In-Memory Merkle-DAG)</span>
          </div>
          <h3 style="font-size:16px;font-weight:700;color:var(--text-heading);margin-top:6px">Ancestral Intersection Root Cause: Adhesive Lot 40 &amp; Curing Machine 2</h3>
          <p style="font-size:12px;color:var(--text-muted);margin-top:2px">
            Correlated 3 customer RMA returns (<strong>Phone_SN_101</strong>, <strong>Phone_SN_102</strong>, <strong>Phone_SN_103</strong> with screen delamination).
          </p>
        </div>
        <button class="btn btn-sm btn-outline" onclick="closeInteractiveDemo()" title="Close Demo View">✕ Close</button>
      </div>

      <!-- Mathematical Intersection Box -->
      <div style="background:#F2F5F6;border:1px solid #9BA8AB;border-radius:var(--radius-md);padding:12px 16px;margin:10px 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <span style="font-size:11px;font-weight:700;color:#4A5C6A;text-transform:uppercase;letter-spacing:0.5px">DAG Graph Intersection Formula</span>
          <div style="font-family:var(--mono);font-size:13px;font-weight:600;color:#1B242B;margin-top:3px">
            A(Phone_101) ∩ A(Phone_102) ∩ A(Phone_103) = { Adhesive Lot 40 [ERP] ∧ Dispenser 1 [MES] ∧ Curing M2 [MES] }
          </div>
        </div>
        <span class="status-pill active" style="background:#4A5C6A;color:#FFFFFF;border:none">Exact Root Cause Identified</span>
      </div>

      <!-- SCADA Telemetry Anomaly Correlation -->
      <div style="background:rgba(239, 68, 68, 0.06);border:1px solid #FECACA;border-radius:var(--radius-md);padding:12px 16px;margin:10px 0;">
        <div style="display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;color:#991B1B">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>SCADA High-Frequency Physical Telemetry Anomaly Confirmed</span>
        </div>
        <p style="font-size:12px;color:#7F1D1D;margin-top:4px">
          Machine 2 Curing Stage experienced a <strong>+12°C thermal excursion</strong> during curing (nominal 52°C exceeded to 64.8°C), causing chemical embrittlement in Adhesive Lot 40.
        </p>
      </div>

      <!-- Surgical Recall vs Blanket Recall Comparison Grid -->
      <div class="demo-stats-grid">
        <div class="demo-stat-box">
          <div class="demo-stat-title">Traditional Blanket Recall</div>
          <div class="demo-stat-val" style="color:#DC2626">50,000 Units</div>
          <p style="font-size:11px;color:var(--text-muted);margin-top:2px">Cost: $25,000,000 &amp; Brand Crisis</p>
        </div>
        <div class="demo-stat-box highlight">
          <div class="demo-stat-title">GeneaTrace Blast Radius</div>
          <div class="demo-stat-val" style="color:#4A5C6A">142 Units Isolated</div>
          <p style="font-size:11px;color:#4A5C6A;margin-top:2px">Cost: $71,000 (<strong>$24,929,000 Saved</strong>)</p>
        </div>
        <div class="demo-stat-box">
          <div class="demo-stat-title">Recall Containment Reduction</div>
          <div class="demo-stat-val" style="color:#16A34A">99.7% Precision</div>
          <p style="font-size:11px;color:var(--text-muted);margin-top:2px">Zero innocent inventory discarded</p>
        </div>
        <div class="demo-stat-box">
          <div class="demo-stat-title">Resolution Speed</div>
          <div class="demo-stat-val" style="color:#4A5C6A">18.2 ms</div>
          <p style="font-size:11px;color:var(--text-muted);margin-top:2px">vs 12,450 ms SQL CTE (~690x faster)</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap">
        <button class="btn btn-sm btn-primary" onclick="locateBlastRadiusUnits()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>Locate All 142 Units in Stores &amp; Warehouses</span>
        </button>
        <button class="btn btn-sm btn-outline" onclick="loadPassport('SM-S928-IND-00841')">
          <span>Inspect Merkle Root &amp; Digital Passport →</span>
        </button>
      </div>
    </div>
  `;

  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  toast('Ancestral DAG intersection resolved in 18.2 ms: 142 units isolated ($24.9M saved)', 'success');
}

function simulateTamperInjection() {
  const container = document.getElementById('dash-interactive-result');
  if (!container) return;

  toast('Simulating database tampering: Modifying Historical Curing Temperature (85°C → 65°C)...', 'warning');

  container.style.display = 'block';
  container.innerHTML = `
    <div class="demo-result-card tamper-mode">
      <div class="demo-header-row">
        <div>
          <div class="demo-header-badge tamper">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>CRYPTOGRAPHIC TAMPER DETECTED IN 3.1 ms</span>
          </div>
          <h3 style="font-size:16px;font-weight:700;color:#991B1B;margin-top:6px">Unauthorized Historical Record Mutation Detected</h3>
          <p style="font-size:12px;color:#7F1D1D;margin-top:2px">
            SCADA historical temperature on Curing Machine 2 was modified by an unauthorized database update.
          </p>
        </div>
        <button class="btn btn-sm btn-outline" onclick="closeInteractiveDemo()" title="Close Demo View">✕ Close</button>
      </div>

      <!-- Hash Comparison -->
      <div class="demo-hash-box">
        <div>// Merkle Root Verification Engine (SHA-256)</div>
        <div class="valid-line">EXPECTED ANCHOR ROOT: 0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069 [POLYGON POS #61902411]</div>
        <div class="tampered-line">COMPUTED LEAF ROOT:   0xd41d8cd98f00b204e9800998ecf8427e  [MISMATCH AT NODE #18 - Curing Temp 65°C != 85.4°C]</div>
        <div class="tampered-line">ED25519 SIGNATURE:     INVALID_SIGNATURE (Verification aborted in 3.1 ms)</div>
      </div>

      <!-- Details Grid -->
      <div class="demo-stats-grid">
        <div class="demo-stat-box danger">
          <div class="demo-stat-title">Integrity Status</div>
          <div class="demo-stat-val" style="color:#DC2626">Tampered</div>
          <p style="font-size:11px;color:#991B1B;margin-top:2px">Merkle chaining broken at step 4</p>
        </div>
        <div class="demo-stat-box">
          <div class="demo-stat-title">Original Value</div>
          <div class="demo-stat-val" style="color:var(--text-heading)">85.4°C (Excursion)</div>
          <p style="font-size:11px;color:var(--text-muted);margin-top:2px">Captured by SCADA RTU Sensor 4B</p>
        </div>
        <div class="demo-stat-box danger">
          <div class="demo-stat-title">Falsified Value</div>
          <div class="demo-stat-val" style="color:#DC2626">65.0°C (Forged)</div>
          <p style="font-size:11px;color:#991B1B;margin-top:2px">Attempted compliance spoofing</p>
        </div>
        <div class="demo-stat-box">
          <div class="demo-stat-title">Tamper Detection Time</div>
          <div class="demo-stat-val" style="color:#4A5C6A">3.1 ms</div>
          <p style="font-size:11px;color:var(--text-muted);margin-top:2px">Instant rejection by GeneaTrace</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap">
        <button class="btn btn-sm btn-primary" onclick="restoreCryptographicState()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
          <span>Restore Immutable State &amp; Re-Anchor Root</span>
        </button>
        <button class="btn btn-sm btn-outline" onclick="closeInteractiveDemo()">Dismiss</button>
      </div>
    </div>
  `;

  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  toast('🚨 Tamper Alert: Merkle root mismatch detected in 3.1 ms!', 'error');
}

function restoreCryptographicState() {
  const container = document.getElementById('dash-interactive-result');
  if (!container) return;

  toast('Re-anchoring cryptographic state against Polygon PoS anchor block #61,902,411...', 'info');

  container.innerHTML = `
    <div class="demo-result-card">
      <div class="demo-header-row">
        <div>
          <div class="demo-header-badge success">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
            <span>STATE RESTORED &amp; CRYPTOGRAPHICALLY RE-SEALED</span>
          </div>
          <h3 style="font-size:16px;font-weight:700;color:var(--text-heading);margin-top:6px">Historical SCADA Telemetry Restored to Ground Truth</h3>
          <p style="font-size:12px;color:var(--text-muted);margin-top:2px">
            True sensor reading (85.4°C) re-established. SHA-256 Merkle root recalculated and verified against on-chain anchor.
          </p>
        </div>
        <button class="btn btn-sm btn-outline" onclick="closeInteractiveDemo()" title="Close Demo View">✕ Close</button>
      </div>

      <div class="demo-hash-box">
        <div class="valid-line">MERKLE ROOT: 0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069 [VALIDATED]</div>
        <div class="valid-line">ED25519 SIGNATURE: 0x94821a8b9... [VERIFIED BY SAMSUNG ENTERPRISE HSM]</div>
        <div style="color:#94A3B8">STATUS: IMMUTABLE LINEAGE PRESERVED · ZERO DATA CORRUPTION</div>
      </div>

      <div style="display:flex;align-items:center;gap:10px;margin-top:14px">
        <button class="btn btn-sm btn-primary" onclick="showPage('passport')">Open Product Passport →</button>
        <button class="btn btn-sm btn-outline" onclick="closeInteractiveDemo()">Done</button>
      </div>
    </div>
  `;

  toast('✅ Cryptographic state verified: Merkle root intact and authenticated', 'success');
}

function locateBlastRadiusUnits() {
  openBatchTracker('B-2504-17', '2025-04-12', '14:32');
  toast('Loading multi-tier warehouse and retail locations for 142 affected units...', 'info');
}

function closeInteractiveDemo() {
  const container = document.getElementById('dash-interactive-result');
  if (container) container.style.display = 'none';
}

/* ── LIVE THEME PALETTE SWITCHER ── */
function setAppTheme(themeName) {
  document.body.classList.remove('theme-brown-gold', 'theme-glacier-uv', 'theme-charcoal-red', 'theme-slate-mist');
  document.querySelectorAll('.theme-pill-btn').forEach(function(b) { b.classList.remove('active'); });

  const activeBtn = document.getElementById('btn-theme-' + themeName);
  if (activeBtn) activeBtn.classList.add('active');

  if (themeName === 'glacier-uv') {
    document.body.classList.add('theme-glacier-uv');
    toast('Palette applied: 2. Glacier Blue, Ultraviolet and Grey', 'info');
  } else if (themeName === 'charcoal-red') {
    document.body.classList.add('theme-charcoal-red');
    toast('Palette applied: 3. Charcoal Grey, Moonlit Silver and Signal Red', 'info');
  } else if (themeName === 'slate-mist') {
    document.body.classList.add('theme-slate-mist');
    toast('Palette applied: Slate & Mist (#4A5C6A, #9BA8AB)', 'info');
  } else {
    document.body.classList.add('theme-brown-gold');
    toast('Palette applied: 1. Brown, Gold and Amber', 'info');
  }
  try {
    localStorage.setItem('geneatrace_selected_theme', themeName);
  } catch(e) {}
}

/* ── INIT ── */
function bootstrap() {
  initDashboard();
  try {
    const savedTheme = localStorage.getItem('geneatrace_selected_theme') || 'slate-mist';
    setAppTheme(savedTheme);
  } catch(e) {
    setAppTheme('slate-mist');
  }
  toast('GeneaTrace DPP Platform loaded', 'success');
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

