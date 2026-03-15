const termInput = document.getElementById('term-input');
const termContent = document.getElementById('term-content');

window.printTerminal = (text, type = 'default') => {
  const d = document.createElement('div');
  const colors = { error: '#ff6b6b', success: '#51cf66', info: '#58a6ff' };
  d.style.color = colors[type] || '#d1d5db';
  d.textContent = text;
  termContent.appendChild(d);
  termContent.scrollTop = termContent.scrollHeight;
};

window.clearTerminal = () => (termContent.innerHTML = '');

termInput.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter') return;
  const raw = termInput.value.trim();
  if (!raw) return;
  printTerminal(`nebula@root:~$ ${raw}`);
  termInput.value = '';
  const [cmd, ...args] = raw.split(' ');

  switch (cmd.toLowerCase()) {
    case 'help':
      printTerminal('Commands: help, ls, npm i <pkg>, ai <prompt>, tools, clear, palette, zen, preview, minimap, resetlayout', 'info');
      break;
    case 'tools':
      printTerminal('[SYS] 40 productivity + AI tools loaded in Power Tools tab.', 'success');
      break;
    case 'palette':
      openCommandPalette();
      break;
    case 'zen':
      if (typeof window.toggleZenMode === 'function') {
        window.toggleZenMode();
      } else {
        printTerminal('[ERR] Zen mode is unavailable right now.', 'error');
      }
      break;
    case 'preview':
      if (typeof window.togglePreview === 'function') {
        window.togglePreview();
      } else {
        printTerminal('[ERR] Preview toggle is unavailable right now.', 'error');
      }
      break;
    case 'minimap':
      if (typeof window.toggleMinimap === 'function') {
        window.toggleMinimap();
      } else {
        printTerminal('[ERR] Minimap toggle is unavailable right now.', 'error');
      }
      break;
    case 'resetlayout':
      if (typeof window.resetLayout === 'function') {
        window.resetLayout();
      } else {
        printTerminal('[ERR] Layout reset is unavailable right now.', 'error');
      }
      break;
    case 'ls':
      printTerminal('index.html  app.js  run.js  ai-pro.js  terminal.js  style.css');
      break;
    case 'npm':
      printTerminal(`[SYS] Fetching ${args[1] || 'package'}...`, 'info');
      setTimeout(() => printTerminal(`+ ${args[1] || 'package'}@latest`, 'success'), 600);
      break;
    case 'ai': {
      const res = await window.ask(args.join(' '));
      printTerminal(`[AI]: ${res}`, 'success');
      break;
    }
    case 'clear':
      clearTerminal();
      break;
    default:
      printTerminal(`bash: ${cmd}: command not found`, 'error');
  }
});
