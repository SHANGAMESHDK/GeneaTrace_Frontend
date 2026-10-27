const fs = require('fs');
const path = require('path');

const pagesDir = 'src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

let totalReplacements = 0;

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace parchment cream backgrounds with dark bronze glass cards
  content = content.replace(/bg-\[#fffcf8\]/g, 'bg-[#140c08]/92 border border-[#d9825b]/25 rounded-3xl');
  content = content.replace(/bg-\[#faf3dc\]/g, 'bg-[#1c120d]/80 border border-[#d9825b]/20 rounded-2xl');
  content = content.replace(/bg-\[#fffdf6\]/g, 'bg-[#160e0a] border border-[#d9825b]/20 rounded-xl');
  
  // Replace light borders with warm copper/bronze borders
  content = content.replace(/border-\[#e5e5e5\]/g, 'border-[#d9825b]/20');
  
  // Replace dark brown text with white or muted champagne
  content = content.replace(/text-\[#413634\]/g, 'text-white');
  content = content.replace(/text-\[#666666\]/g, 'text-[#cbb5aa]');
  content = content.replace(/text-\[#8b6c58\]/g, 'text-[#e89d7b]');
  content = content.replace(/text-\[#c5716d\]/g, 'text-[#f0a887]');
  
  // Replace old green / red text codes
  content = content.replace(/text-\[#2e6b4d\]/g, 'text-emerald-400');
  content = content.replace(/text-\[#b84a44\]/g, 'text-rose-400');
  content = content.replace(/border-\[#2e6b4d\]/g, 'border-emerald-500/30');
  content = content.replace(/border-\[#b84a44\]/g, 'border-rose-500/30');
  
  // Replace status tints
  content = content.replace(/bg-\[#edf6f0\]/g, 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-xl');
  content = content.replace(/bg-\[#fdf2f1\]/g, 'bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl');
  content = content.replace(/bg-\[#e0f2fe\]/g, 'bg-[#e89d7b]/15 text-[#f0a887] border border-[#e89d7b]/30 rounded-xl');
  content = content.replace(/bg-\[#fef7ec\]/g, 'bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xl');
  
  // Replace vintage buttons with modern warm sunset/glass buttons
  content = content.replace(/btn-vintage-accent/g, 'btn-sunset');
  content = content.replace(/btn-vintage-outline/g, 'btn-glass');

  // Clean duplicate border classes
  content = content.replace(/border border-\[#d9825b\]\/20 border border-\[#d9825b\]\/20/g, 'border border-[#d9825b]/20');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Polished palette in ${file}`);
    totalReplacements++;
  }
});

console.log(`Total files updated: ${totalReplacements}`);

