let __files = JSON.parse(localStorage.getItem('nebula_v2_files')) || [
  { id: 1, name: 'index.html', content: '<h1>Nebula Ready</h1>' }
];
let __activeId = __files[0]?.id || 1;

const layoutDefaults = {
  previewWidth: 45,
  terminalHeight: 180,
  zenMode: false,
  minimap: false,
  previewVisible: false
};

const layoutState = {
  ...layoutDefaults,
  ...(JSON.parse(localStorage.getItem('nebula_layout_v1') || '{}'))
};

window.switchRibbon = (tabId, event) => {
  document.querySelectorAll('.tool-group').forEach(g => g.classList.remove('show'));
  const group = document.getElementById(`group-${tabId}`);
  if (group) group.classList.add('show');
  document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
  event.currentTarget.classList.add('active');
};

const judgeToMonacoMode = {
  html: 'html', 63: 'javascript', 71: 'python', 54: 'cpp', 62: 'java', 51: 'csharp', 73: 'rust', 60: 'go',
  50: 'c', 68: 'php', 72: 'ruby', 74: 'typescript', 80: 'r', 78: 'sql', 45: 'asm', 47: 'vb', 59: 'fortran'
};

const extensionToMode = {
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  py: 'python', java: 'java', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', c: 'c',
  cs: 'csharp', rs: 'rust', go: 'go', php: 'php', rb: 'ruby',
  html: 'html', htm: 'html', css: 'css', json: 'json', md: 'markdown', xml: 'xml',
  yml: 'yaml', yaml: 'yaml', sh: 'shell', sql: 'sql', txt: 'plaintext'
};

const setStatus = (text) => {
  const s = document.getElementById('status-bar');
  if (s) s.textContent = text;
};

const persistLayout = () => localStorage.setItem('nebula_layout_v1', JSON.stringify(layoutState));

const applyLayoutState = () => {
  const preview = document.getElementById('preview-panel');
  const terminal = document.querySelector('.terminal-container');
  const body = document.body;
  if (preview) {
    preview.style.width = `${layoutState.previewWidth}%`;
    preview.classList.toggle('preview-hidden', !layoutState.previewVisible);
  }
  if (terminal) terminal.style.height = `${layoutState.terminalHeight}px`;
  body.classList.toggle('zen-mode', !!layoutState.zenMode);
  if (window.editor) {
    window.editor.updateOptions({ minimap: { enabled: !!layoutState.minimap } });
    window.editor.layout();
  }
};

const initResizablePanels = () => {
  const vertical = document.getElementById('vertical-resizer');
  const horizontal = document.getElementById('horizontal-resizer');
  const container = document.querySelector('.editor-container');
  const terminal = document.querySelector('.terminal-container');

  if (vertical && container) {
    vertical.onmousedown = (e) => {
      if (document.getElementById('preview-panel').classList.contains('preview-hidden')) return;
      e.preventDefault();
      vertical.classList.add('active');
      const rect = container.getBoundingClientRect();

      const onMove = (moveEvent) => {
        const raw = ((rect.right - moveEvent.clientX) / rect.width) * 100;
        layoutState.previewWidth = Math.max(25, Math.min(65, raw));
        applyLayoutState();
      };

      const onUp = () => {
        vertical.classList.remove('active');
        persistLayout();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };
  }

  if (horizontal && terminal) {
    horizontal.onmousedown = (e) => {
      e.preventDefault();
      horizontal.classList.add('active');

      const onMove = (moveEvent) => {
        const raw = window.innerHeight - moveEvent.clientY - 30;
        layoutState.terminalHeight = Math.max(120, Math.min(420, raw));
        applyLayoutState();
      };

      const onUp = () => {
        horizontal.classList.remove('active');
        persistLayout();
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };
  }
};

window.togglePreview = () => {
  layoutState.previewVisible = !layoutState.previewVisible;
  applyLayoutState();
  persistLayout();
  setStatus(layoutState.previewVisible ? 'Preview opened' : 'Preview hidden');
};

window.toggleZenMode = () => {
  layoutState.zenMode = !layoutState.zenMode;
  applyLayoutState();
  persistLayout();
  setStatus(layoutState.zenMode ? 'Zen mode enabled' : 'Zen mode disabled');
};

window.resetLayout = () => {
  Object.assign(layoutState, layoutDefaults);
  applyLayoutState();
  persistLayout();
  setStatus('Layout reset to defaults');
};

window.toggleMinimap = () => {
  layoutState.minimap = !layoutState.minimap;
  applyLayoutState();
  persistLayout();
  setStatus(layoutState.minimap ? 'Minimap enabled' : 'Minimap disabled');
};

const getActiveFile = () => __files.find(x => x.id === __activeId);

const getModeForFile = (name) => {
  const ext = (name.split('.').pop() || '').toLowerCase();
  return extensionToMode[ext] || 'plaintext';
};

const applyEditorLanguage = () => {
  if (!window.editor?.getModel()) return;
  const active = getActiveFile();
  const fallbackMode = judgeToMonacoMode[document.getElementById('lang-select')?.value] || 'plaintext';
  const mode = active ? getModeForFile(active.name) : fallbackMode;
  monaco.editor.setModelLanguage(window.editor.getModel(), mode);
  setStatus(`Mode: ${mode} | File: ${active?.name || 'none'}`);
};

function renderTabs() {
  const wrap = document.getElementById('file-tabs');
  wrap.innerHTML = '';
  __files.forEach(f => {
    const el = document.createElement('div');
    el.className = `file-tab ${f.id === __activeId ? 'active' : ''}`;
    el.textContent = f.name;
    el.onclick = () => {
      saveActive();
      __activeId = f.id;
      loadToEditor();
      renderTabs();
      applyEditorLanguage();
    };
    wrap.appendChild(el);
  });
}

function saveActive() {
  const f = getActiveFile();
  if (f && window.editor) f.content = window.editor.getValue();
}

function loadToEditor() {
  const f = getActiveFile();
  if (!f || !window.editor) return;
  window.editor.setValue(f.content);
}

require.config({ paths: { vs: './vs' } });

require(['vs/editor/editor.main'], function () {
  window.editor = monaco.editor.create(document.getElementById('editor'), {
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: false },
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    bracketPairColorization: { enabled: true },
    guides: { indentation: true, bracketPairs: true },
    wordWrap: 'on',
    formatOnType: true,
    formatOnPaste: true
  });
  window.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => openCommandPalette());
  window.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    saveActive();
    localStorage.setItem('nebula_v2_files', JSON.stringify(__files));
    setStatus('Saved workspace');
    printTerminal('[SYS] Saved via keyboard shortcut.', 'success');
  });
  renderTabs();
  loadToEditor();
  applyEditorLanguage();
  initResizablePanels();
  applyLayoutState();
});

document.getElementById('lang-select').onchange = (e) => {
  const val = e.target.value;
  const mode = judgeToMonacoMode[val] || 'plaintext';
  monaco.editor.setModelLanguage(window.editor.getModel(), mode);
  if (window.starterSnippets[val]) window.editor.setValue(window.starterSnippets[val]);
  setStatus(`Runtime target: ${val} | Editor mode: ${mode}`);
};

document.getElementById('new-file').onclick = () => {
  const name = prompt('Filename:');
  if (name) {
    const id = Date.now();
    __files.push({ id, name, content: '' });
    __activeId = id;
    renderTabs();
    loadToEditor();
    applyEditorLanguage();
    setStatus(`Created ${name}`);
  }
};

document.getElementById('rename-file').onclick = () => {
  const f = getActiveFile();
  if (!f) return;
  const rename = prompt('New filename:', f.name);
  if (!rename) return;
  f.name = rename;
  renderTabs();
  applyEditorLanguage();
  setStatus(`Renamed to ${rename}`);
};

document.getElementById('delete-file').onclick = () => {
  if (__files.length <= 1) {
    printTerminal('[WARN] Keep at least one file in workspace.', 'info');
    return;
  }
  const f = getActiveFile();
  if (!f || !confirm(`Delete ${f.name}?`)) return;
  __files = __files.filter(x => x.id !== f.id);
  __activeId = __files[0].id;
  renderTabs();
  loadToEditor();
  applyEditorLanguage();
  setStatus(`Deleted ${f.name}`);
};

document.getElementById('save-disk').onclick = () => {
  saveActive();
  localStorage.setItem('nebula_v2_files', JSON.stringify(__files));
  printTerminal('[SYS] Workspace committed to disk.', 'success');
  setStatus('Workspace committed');
};

const getSelectionText = () => window.editor.getModel().getValueInRange(window.editor.getSelection());
const replaceSelection = (text) => window.editor.executeEdits('tool-edit', [{ range: window.editor.getSelection(), text, forceMoveMarkers: true }]);
const replaceDocument = (text) => window.editor.setValue(text);
const pad = () => printTerminal("[TIP] Use Ctrl/Cmd + P to open command palette quickly.", 'info');

const toolDefs = [
  { id: 'format-document', name: 'Format Document', run: () => window.editor.getAction('editor.action.formatDocument').run() },
  { id: 'sort-lines', name: 'Sort Selected Lines', run: () => replaceSelection(getSelectionText().split('\n').sort().join('\n')) },
  { id: 'uppercase', name: 'Uppercase Selection', run: () => replaceSelection(getSelectionText().toUpperCase()) },
  { id: 'lowercase', name: 'Lowercase Selection', run: () => replaceSelection(getSelectionText().toLowerCase()) },
  { id: 'trim-trailing', name: 'Trim Trailing Spaces', run: () => replaceDocument(window.editor.getValue().replace(/[ \t]+$/gm, '')) },
  { id: 'duplicate-line', name: 'Duplicate Current Line', run: () => window.editor.getAction('editor.action.copyLinesDownAction').run() },
  { id: 'toggle-comment', name: 'Toggle Line Comment', run: () => window.editor.getAction('editor.action.commentLine').run() },
  { id: 'word-wrap', name: 'Toggle Word Wrap', run: () => window.editor.getAction('editor.action.toggleWordWrap').run() },
  { id: 'find-references', name: 'Go to References Widget', run: () => window.editor.getAction('editor.action.referenceSearch.trigger').run() },
  { id: 'open-settings-json', name: 'Create settings.json', run: () => { __files.push({ id: Date.now(), name: 'settings.json', content: '{\n  "theme": "nebula-dark",\n  "autosave": true\n}' }); renderTabs(); } },
  { id: 'insert-console-log', name: 'Insert Console Log', run: () => replaceSelection('console.log("debug:", value);') },
  { id: 'insert-fetch-template', name: 'Insert Fetch Template', run: () => replaceSelection('fetch("/api")\n  .then(r => r.json())\n  .then(console.log)\n  .catch(console.error);') },
  { id: 'insert-react-component', name: 'Insert React Component', run: () => replaceSelection('export default function Component(){\n  return <div>Hello Nebula</div>;\n}') },
  { id: 'insert-node-server', name: 'Insert Node HTTP Server', run: () => replaceSelection('const http = require("http");\nhttp.createServer((req,res)=>{res.end("ok")}).listen(3000);') },
  { id: 'insert-python-main', name: 'Insert Python Main Guard', run: () => replaceSelection('def main():\n    print("Nebula")\n\nif __name__ == "__main__":\n    main()') },
  { id: 'insert-gitignore', name: 'Insert .gitignore Starter', run: () => replaceSelection('node_modules/\ndist/\n.env\n.DS_Store') },
  { id: 'insert-readme', name: 'Insert README Starter', run: () => replaceSelection('# Project\n\n## Setup\n\n## Run\n\n## Deploy') },
  { id: 'insert-license', name: 'Insert MIT License Header', run: () => replaceSelection('MIT License\n\nCopyright (c) YEAR NAME') },
  { id: 'insert-test-js', name: 'Insert JS Test Skeleton', run: () => replaceSelection('describe("feature", () => {\n  it("works", () => {\n    expect(true).toBe(true);\n  });\n});') },
  { id: 'insert-test-py', name: 'Insert Pytest Skeleton', run: () => replaceSelection('def test_feature():\n    assert True') },
  { id: 'ai-fix', name: 'AI Fix Current File', run: () => window.fixCodeWithAI() },
  { id: 'ai-explain', name: 'AI Explain Selected Code', run: () => window.runAITransform('Explain this code for a developer in concise bullets:', false) },
  { id: 'ai-optimize', name: 'AI Optimize Selected Code', run: () => window.runAITransform('Optimize this code for performance and readability. Return code only:', true) },
  { id: 'ai-docstrings', name: 'AI Add Doc Comments', run: () => window.runAITransform('Add concise doc comments to this code. Return code only:', true) },
  { id: 'ai-security', name: 'AI Security Audit', run: () => window.runAITransform('Audit this code for security risks. Return bullet list with severity:', false) },
  { id: 'ai-refactor', name: 'AI Refactor', run: () => window.runAITransform('Refactor this code with clean architecture. Return code only:', true) },
  { id: 'ai-tests', name: 'AI Generate Tests', run: () => window.generateTestsWithAI() },
  { id: 'ai-summary', name: 'AI Summarize File', run: () => window.summarizeCodeWithAI() },
  { id: 'ai-api-review', name: 'AI API Contract Review', run: () => window.runAITransform('Review this API implementation and suggest contract improvements:', false) },
  { id: 'ai-ux-copy', name: 'AI UX Microcopy', run: () => window.runAITransform('Generate better UI microcopy for this text:', false) },
  { id: 'timestamp-now', name: 'Insert ISO Timestamp', run: () => replaceSelection(new Date().toISOString()) },
  { id: 'json-prettify', name: 'Prettify JSON Selection', run: () => { try { replaceSelection(JSON.stringify(JSON.parse(getSelectionText()), null, 2)); } catch { printTerminal('[ERR] Invalid JSON selection.', 'error'); } } },
  { id: 'json-minify', name: 'Minify JSON Selection', run: () => { try { replaceSelection(JSON.stringify(JSON.parse(getSelectionText()))); } catch { printTerminal('[ERR] Invalid JSON selection.', 'error'); } } },
  { id: 'html-minify-lite', name: 'Minify HTML (Lite)', run: () => replaceDocument(window.editor.getValue().replace(/>\s+</g, '><').trim()) },
  { id: 'line-stats', name: 'Show Line/Word Stats', run: () => { const v = window.editor.getValue(); printTerminal(`[STATS] Lines: ${v.split('\n').length}, Words: ${v.trim().split(/\s+/).filter(Boolean).length}`, 'info'); } },
  { id: 'insert-todo', name: 'Insert TODO Comment', run: () => replaceSelection('// TODO: implement') },
  { id: 'insert-fixme', name: 'Insert FIXME Comment', run: () => replaceSelection('// FIXME: edge cases') },
  { id: 'save-workspace', name: 'Save Workspace Snapshot', run: () => document.getElementById('save-disk').click() },
  { id: 'export-active-file', name: 'Export Active File', run: () => { const f = getActiveFile(); if (!f) return; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([window.editor.getValue()], { type: 'text/plain' })); a.download = f.name; a.click(); setStatus(`Exported ${f.name}`); } },
  { id: 'focus-terminal', name: 'Focus Terminal', run: () => document.getElementById('term-input').focus() },
  { id: 'tips', name: 'Show Productivity Tips', run: () => { pad(); printTerminal('[TIP] Rename files with extension for accurate syntax highlighting.', 'info'); } },
  { id: 'toggle-preview-pane', name: 'Toggle Preview Pane', run: () => window.togglePreview() },
  { id: 'zen-mode', name: 'Zen Mode (Quick Toggle)', run: () => window.toggleZenMode() },
  { id: 'toggle-zen-mode', name: 'Toggle Zen Mode', run: () => window.toggleZenMode() },
  { id: 'toggle-minimap', name: 'Toggle Minimap', run: () => window.toggleMinimap() },
  { id: 'reset-layout', name: 'Reset Layout', run: () => window.resetLayout() },
  { id: 'duplicate-active-file', name: 'Duplicate Active File', run: () => {
    const f = getActiveFile();
    if (!f) return;
    const clone = { id: Date.now(), name: `${f.name}.copy`, content: window.editor.getValue() };
    __files.push(clone);
    __activeId = clone.id;
    renderTabs();
    loadToEditor();
    applyEditorLanguage();
    setStatus(`Duplicated ${f.name}`);
  } },
  { id: 'workspace-summary', name: 'Workspace Summary', run: () => {
    const totalChars = __files.reduce((acc, file) => acc + (file.content || '').length, 0);
    printTerminal(`[WORKSPACE] Files: ${__files.length}, Total chars: ${totalChars}`, 'info');
  } }
];

window.runToolById = (id) => {
  const t = toolDefs.find(x => x.id === id);
  if (!t) return;
  t.run();
  setStatus(`Ran tool: ${t.name}`);
};

const renderPalette = (query = '') => {
  const list = document.getElementById('palette-list');
  const q = query.toLowerCase().trim();
  const filtered = toolDefs.filter(t => t.name.toLowerCase().includes(q) || t.id.includes(q));
  list.innerHTML = '';
  filtered.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'palette-item';
    btn.textContent = `${t.name} (${t.id})`;
    btn.onclick = () => {
      runToolById(t.id);
      closeCommandPalette();
    };
    list.appendChild(btn);
  });
};

window.openCommandPalette = () => {
  const overlay = document.getElementById('palette-overlay');
  overlay.style.display = 'flex';
  const input = document.getElementById('palette-input');
  input.value = document.getElementById('tool-search').value || '';
  renderPalette(input.value);
  input.focus();
};

window.closeCommandPalette = () => {
  document.getElementById('palette-overlay').style.display = 'none';
};

document.getElementById('tool-search').addEventListener('input', (e) => renderPalette(e.target.value));
document.getElementById('palette-input').addEventListener('input', (e) => renderPalette(e.target.value));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCommandPalette();
});
