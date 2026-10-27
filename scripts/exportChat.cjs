const fs = require('fs');
const path = require('path');

const fullTranscriptPath = 'C:/Users/sudhi/.gemini/antigravity/brain/5fb86c1e-77f8-48b0-b261-defbe649e50a/.system_generated/logs/transcript_full.jsonl';

if (!fs.existsSync(fullTranscriptPath)) {
  console.error('Transcript file not found:', fullTranscriptPath);
  process.exit(1);
}

const lines = fs.readFileSync(fullTranscriptPath, 'utf8').trim().split('\n');

function cleanUserRequest(text) {
  if (!text) return '';
  const match = text.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
  if (match) return match[1].trim();
  return text.trim();
}

function getTurnTitle(req) {
  const firstLine = req.split('\n')[0].trim();
  if (firstLine.length < 50) return firstLine;
  return firstLine.slice(0, 47) + '...';
}

const turns = [];
let currentTurn = null;

lines.forEach((l) => {
  try {
    const obj = JSON.parse(l);
    if (obj.type === 'USER_INPUT') {
      if (currentTurn) {
        turns.push(currentTurn);
      }
      const rawUser = obj.content;
      const cleanUser = cleanUserRequest(rawUser);
      currentTurn = {
        number: turns.length + 1,
        time: obj.created_at || new Date().toISOString(),
        userRaw: rawUser,
        userClean: cleanUser,
        title: getTurnTitle(cleanUser),
        media: obj.media || [],
        assistant: ''
      };
    } else if (obj.type === 'PLANNER_RESPONSE' && obj.content && typeof obj.content === 'string' && obj.content.trim().length > 0) {
      if (currentTurn) {
        currentTurn.assistant = obj.content.trim();
      }
    }
  } catch (e) {
    console.error('Error parsing line:', e);
  }
});

if (currentTurn) {
  turns.push(currentTurn);
}

// For the active turn (requesting the file), add a concise marker
if (turns.length > 0 && !turns[turns.length - 1].assistant) {
  turns[turns.length - 1].assistant = "Exported complete chat history into `docs/CHAT_HISTORY.md` and `docs/CHAT_HISTORY.html`.";
}

console.log(`Extracted ${turns.length} turns.`);

// -------------------------------------------------------------
// 1. GENERATE CHAT_HISTORY.md
// -------------------------------------------------------------
let mdContent = `# GeneaTrace - Pair Programming Chat History\n\n`;
mdContent += `> **Project**: GeneaTrace Digital Passport & Lineage System (SRM-TRP)\n`;
mdContent += `> **Export Date**: ${new Date().toLocaleString()}\n`;
mdContent += `> **Conversation ID**: \`5fb86c1e-77f8-48b0-b261-defbe649e50a\`\n`;
mdContent += `> **Total Interaction Turns**: ${turns.length}\n\n`;

mdContent += `## Table of Contents\n\n`;
turns.forEach(t => {
  const anchor = `turn-${t.number}-${t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
  mdContent += `- [Turn ${t.number}: ${t.title}](#${anchor})\n`;
});
mdContent += `\n---\n\n`;

turns.forEach(t => {
  const anchor = `turn-${t.number}-${t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
  mdContent += `<a id="${anchor}"></a>\n`;
  mdContent += `## Turn ${t.number}: ${t.title}\n\n`;
  mdContent += `*Timestamp: \`${t.time}\`*\n\n`;
  
  mdContent += `### 👤 User Request\n\n`;
  mdContent += `\`\`\`text\n${t.userClean}\n\`\`\`\n\n`;

  if (t.media && t.media.length > 0) {
    mdContent += `**Attached Media:**\n\n`;
    t.media.forEach((m, idx) => {
      mdContent += `- Attachment ${idx + 1} (${m.mime_type}): \`${m.uri}\`\n`;
    });
    mdContent += `\n`;
  }

  mdContent += `### 🤖 Antigravity Assistant Response\n\n`;
  mdContent += `${t.assistant}\n\n`;
  mdContent += `---\n\n`;
});

const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const mdPath = path.join(docsDir, 'CHAT_HISTORY.md');
fs.writeFileSync(mdPath, mdContent, 'utf8');
console.log('Saved Markdown chat history to:', mdPath);

// -------------------------------------------------------------
// 2. GENERATE CHAT_HISTORY.html (Styled Standalone Document)
// -------------------------------------------------------------
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMarkdownToHtml(md) {
  if (!md) return '';
  let html = md;
  
  // Fenced code blocks
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<div class="code-block"><div class="code-header"><span class="lang">${escapeHtml(lang || 'code')}</span></div><pre><code>${escapeHtml(code.trim())}</code></pre></div>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, (match, code) => `<code class="inline-code">${escapeHtml(code)}</code>`);

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Unordered list items
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Line breaks
  html = html.replace(/\n\n/g, '<br><br>');

  return html;
}

let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GeneaTrace - Complete Chat History</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0705;
      --card-bg: #140c08;
      --card-border: rgba(217, 130, 91, 0.25);
      --accent: #e89d7b;
      --accent-copper: #d9825b;
      --accent-champagne: #f7d5c5;
      --text: #f9f6f3;
      --text-muted: #a69489;
      --code-bg: #090503;
      --green: #34d399;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      line-height: 1.65;
      font-size: 14.5px;
      padding: 0;
    }

    header {
      background: rgba(18, 11, 8, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--card-border);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #e89d7b, #b85d38);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #120a07;
      font-size: 18px;
      box-shadow: 0 4px 15px rgba(217, 130, 91, 0.35);
    }

    .brand-text h1 {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      color: #ffffff;
      line-height: 1.2;
    }

    .brand-text span {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--accent);
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .badge-pill {
      background: rgba(52, 211, 153, 0.12);
      border: 1px solid rgba(52, 211, 153, 0.3);
      color: var(--green);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }

    .print-btn {
      background: linear-gradient(135deg, #e89d7b, #c67651);
      color: #120a07;
      border: none;
      padding: 8px 18px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .print-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .layout {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 32px;
      padding: 32px;
    }

    /* Sidebar Navigation */
    .toc-sidebar {
      position: sticky;
      top: 90px;
      height: calc(100vh - 120px);
      overflow-y: auto;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 20px;
    }

    .toc-sidebar h3 {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .toc-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .toc-item a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 12.5px;
      display: block;
      padding: 8px 12px;
      border-radius: 10px;
      transition: all 0.2s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toc-item a:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.05);
      border-left: 2px solid var(--accent);
    }

    /* Main Chat Stream */
    .chat-stream {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .turn-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 22px;
      padding: 28px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      transition: border-color 0.2s;
    }

    .turn-card:hover {
      border-color: rgba(232, 157, 123, 0.45);
    }

    .turn-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 14px;
      margin-bottom: 20px;
    }

    .turn-title {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
    }

    .turn-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--text-muted);
    }

    .message-bubble {
      margin-bottom: 24px;
    }

    .user-bubble {
      background: rgba(217, 130, 91, 0.08);
      border: 1px solid rgba(217, 130, 91, 0.22);
      border-radius: 16px;
      padding: 16px 20px;
    }

    .user-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .user-text {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      color: #ffffff;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .assistant-bubble {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 20px;
    }

    .assistant-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: var(--accent-champagne);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .assistant-body {
      color: var(--text);
      font-size: 14px;
      line-height: 1.7;
    }

    .assistant-body h1, .assistant-body h2, .assistant-body h3 {
      font-family: 'Playfair Display', serif;
      color: #ffffff;
      margin-top: 18px;
      margin-bottom: 8px;
    }

    .assistant-body p {
      margin-bottom: 12px;
    }

    .assistant-body ul {
      margin-left: 20px;
      margin-bottom: 14px;
    }

    .assistant-body li {
      margin-bottom: 4px;
    }

    .inline-code {
      font-family: 'JetBrains Mono', monospace;
      background: rgba(232, 157, 123, 0.15);
      color: #f7d5c5;
      padding: 2px 6px;
      border-radius: 5px;
      font-size: 12px;
      border: 1px solid rgba(232, 157, 123, 0.25);
    }

    .code-block {
      background: var(--code-bg);
      border: 1px solid rgba(217, 130, 91, 0.25);
      border-radius: 14px;
      margin: 16px 0;
      overflow: hidden;
    }

    .code-header {
      background: rgba(255, 255, 255, 0.04);
      padding: 6px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--accent);
      text-transform: uppercase;
    }

    .code-block pre {
      padding: 14px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      color: #e2e8f0;
    }

    blockquote {
      border-left: 3px solid var(--accent);
      padding-left: 14px;
      margin: 12px 0;
      color: var(--accent-champagne);
      font-style: italic;
    }

    @media print {
      header { position: static; }
      .layout { grid-template-columns: 1fr; padding: 0; }
      .toc-sidebar, .print-btn { display: none; }
      body { background: #ffffff; color: #000000; }
      .turn-card { border: 1px solid #ccc; background: #fafafa; color: #000; box-shadow: none; }
      .turn-title, .user-text, .assistant-body { color: #000 !important; }
      .user-bubble { background: #f0f0f0; border-color: #ddd; }
      .assistant-bubble { background: #ffffff; border-color: #eee; }
      .inline-code { background: #eee; color: #333; }
      .code-block { background: #f8f8f8; border-color: #ddd; }
      .code-block pre { color: #222; }
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="brand-icon">GT</div>
      <div class="brand-text">
        <h1>GeneaTrace Digital Passport</h1>
        <span>Conversation Archive • Complete Chat History</span>
      </div>
    </div>
    <div class="header-actions">
      <div class="badge-pill">${turns.length} Dialog Turns</div>
      <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
    </div>
  </header>

  <div class="layout">
    <!-- Left Navigation -->
    <aside class="toc-sidebar">
      <h3>Conversation Index</h3>
      <ul class="toc-list">
`;

turns.forEach(t => {
  const anchor = `turn-${t.number}`;
  htmlContent += `        <li class="toc-item"><a href="#${anchor}">#${t.number}: ${escapeHtml(t.title)}</a></li>\n`;
});

htmlContent += `      </ul>
    </aside>

    <!-- Main Chat Stream -->
    <main class="chat-stream">
`;

turns.forEach(t => {
  const anchor = `turn-${t.number}`;
  htmlContent += `      <article class="turn-card" id="${anchor}">
        <div class="turn-header">
          <div class="turn-title">Turn ${t.number}: ${escapeHtml(t.title)}</div>
          <div class="turn-time">${escapeHtml(t.time)}</div>
        </div>

        <!-- User Message -->
        <div class="message-bubble user-bubble">
          <div class="user-label">
            <span>👤</span>
            <span>User Prompt</span>
          </div>
          <div class="user-text">${escapeHtml(t.userClean)}</div>
        </div>

        <!-- Assistant Message -->
        <div class="message-bubble assistant-bubble">
          <div class="assistant-label">
            <span>🤖</span>
            <span>Antigravity Assistant</span>
          </div>
          <div class="assistant-body">
            ${formatMarkdownToHtml(t.assistant)}
          </div>
        </div>
      </article>
`;
});

htmlContent += `    </main>
  </div>

</body>
</html>
`;

const htmlPath = path.join(docsDir, 'CHAT_HISTORY.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Saved HTML chat history to:', htmlPath);

