const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');

c = c.replace(/\r\n/g, '\n');

const marker = '/* ─────────────────────────────────────────────────────────────\n   GLOBAL WARM BRONZE DARK GLASS OVERRIDES';
const endMarker = '/* Global Input & Form Dark Overrides */';

const startIdx = c.indexOf(marker);
const endIdx = c.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `/* ─────────────────────────────────────────────────────────────
   GLOBAL WARM BRONZE DARK GLASS OVERRIDES
───────────────────────────────────────────────────────────── */
.bg-white:not(#null-container-qr-svg *):not(#passport-qr-svg *) {
  background-color: rgba(24, 16, 12, 0.88) !important;
  color: #f9f6f3;
}

/* Vintage light parchment color overrides to Warm Bronze */
[class*="#fffcf8"], [class*="#fffdf6"] {
  background-color: rgba(20, 12, 8, 0.92) !important;
  color: #ffffff !important;
}

[class*="#faf3dc"] {
  background-color: rgba(28, 18, 13, 0.85) !important;
  color: #ffffff !important;
}

[class*="#413634"] {
  color: #ffffff !important;
}

[class*="#666666"] {
  color: #cbb5aa !important;
}

[class*="#e5e5e5"] {
  border-color: rgba(217, 130, 91, 0.22) !important;
}

.bg-slate-50, .bg-slate-50\\/70, .bg-slate-50\\/80, .bg-slate-50\\/90 {
  background-color: rgba(18, 11, 8, 0.72) !important;
}

.bg-slate-100, .bg-slate-100\\/90, .bg-slate-100\\/80 {
  background-color: rgba(255, 255, 255, 0.07) !important;
}

.text-slate-900 {
  color: #ffffff !important;
}

.text-slate-800 {
  color: #f7ede8 !important;
}

.text-slate-700 {
  color: #e2d5ce !important;
}

.text-slate-600 {
  color: #cbb5aa !important;
}

.text-slate-500 {
  color: #a69489 !important;
}

.border-slate-200, .border-slate-100, .border-slate-200\\/80, .border-slate-200\\/60 {
  border-color: rgba(224, 148, 112, 0.18) !important;
}

`;

  c = c.substring(0, startIdx) + replacement + c.substring(endIdx);
  fs.writeFileSync('src/index.css', c, 'utf8');
  console.log('Successfully updated index.css with comprehensive dark bronze overrides!');
} else {
  console.log('Markers not found! startIdx:', startIdx, 'endIdx:', endIdx);
}

