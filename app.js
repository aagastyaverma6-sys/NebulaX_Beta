let __files = JSON.parse(localStorage.getItem('nebula_v2_files')) || [
  { id: 1, name: 'index.html', lang: 'html', content: '<h1>Nebula Cloud</h1>' }
];
let __activeId = 1;

window.switchRibbon = (tabId, event) => {
  document.querySelectorAll('.tool-group').forEach(g => g.classList.remove('show'));
  document.getElementById(`group-${tabId}`).classList.add('show');
  document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
  event.currentTarget.classList.add('active');
};

require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
  window.editor = monaco.editor.create(document.getElementById('editor'), {
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    // VS CODE GHOST TEXT & SUGGESTIONS
    inlineSuggest: { enabled: true },
    suggestOnTriggerCharacters: true,
    quickSuggestions: { other: true, comments: true, strings: true },
    parameterHints: { enabled: true },
    formatOnPaste: true,
    formatOnType: true
  });
  
  loadToEditor();
  renderTabs();
});

function renderTabs() {
  const wrap = document.getElementById('file-tabs');
  if(!wrap) return;
  wrap.innerHTML = '';
  __files.forEach(f => {
    const el = document.createElement('div');
    el.className = `file-tab ${f.id === __activeId ? 'active' : ''}`;
    el.textContent = f.name;
    el.onclick = () => { saveActive(); __activeId = f.id; loadToEditor(); renderTabs(); };
    wrap.appendChild(el);
  });
}

function saveActive() {
  const f = __files.find(x => x.id === __activeId);
  if (f && window.editor) f.content = window.editor.getValue();
}

function loadToEditor() {
  const f = __files.find(x => x.id === __activeId);
  if(window.editor && f) {
    window.editor.setValue(f.content);
    // Auto-detect language for syntax highlighting
    const lang = f.name.endsWith('.html') ? 'html' : f.name.endsWith('.js') ? 'javascript' : 'python';
    monaco.editor.setModelLanguage(window.editor.getModel(), lang);
  }
}

// Resizer logic
const splitter = document.getElementById('splitter');
const preview = document.getElementById('preview-panel');
const workspace = document.querySelector('.workspace');
let isDragging = false;

if (splitter) {
  splitter.onmousedown = () => { isDragging = true; document.body.style.cursor = 'col-resize'; };
  document.onmouseup = () => { isDragging = false; document.body.style.cursor = 'default'; };
  document.onmousemove = (e) => {
    if (!isDragging) return;
    const workRect = workspace.getBoundingClientRect();
    const newWidth = workRect.right - e.clientX;
    if (newWidth > 0 && newWidth < workRect.width - 200) {
      preview.style.width = newWidth + 'px';
      if (window.editor) window.editor.layout();
    }
  };
}

window.togglePreview = () => {
  preview.classList.toggle('preview-hidden');
  if (window.editor) window.editor.layout();
};
