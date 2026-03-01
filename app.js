let __files = JSON.parse(localStorage.getItem('nebula_v2_files')) || [
  { id: 1, name: 'index.html', content: '<h1>Nebula Ready</h1>' }
];
let __activeId = 1;

window.switchRibbon = (tabId, event) => {
  document.querySelectorAll('.tool-group').forEach(g => g.classList.remove('show'));
  const group = document.getElementById(`group-${tabId}`);
  if(group) group.classList.add('show');
  document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
  event.currentTarget.classList.add('active');
};

const idToMode = (id) => {
    const map = { "html":"html", "63":"javascript", "71":"python", "54":"cpp", "62":"java", "51":"csharp", "73":"rust", "60":"go" };
    return map[id] || "plaintext";
};

function renderTabs() {
  const wrap = document.getElementById('file-tabs');
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
  if(!f || !window.editor) return;
  window.editor.setValue(f.content);
}

// Fixed relative path for GitHub Pages
require.config({ paths: { vs: './vs' } });

require(['vs/editor/editor.main'], function () {
  window.editor = monaco.editor.create(document.getElementById('editor'), {
    theme: 'vs-dark', automaticLayout: true, fontSize: 14, minimap: { enabled: false }
  });
  renderTabs(); loadToEditor();
});

document.getElementById('lang-select').onchange = (e) => {
    const val = e.target.value;
    monaco.editor.setModelLanguage(window.editor.getModel(), idToMode(val));
    if(window.starterSnippets[val]) window.editor.setValue(window.starterSnippets[val]);
};

document.getElementById('new-file').onclick = () => {
  const name = prompt("Filename:");
  if (name) {
    const id = Date.now();
    __files.push({ id, name, content: '' });
    __activeId = id;
    renderTabs(); loadToEditor();
  }
};

document.getElementById('save-disk').onclick = () => {
  saveActive();
  localStorage.setItem('nebula_v2_files', JSON.stringify(__files));
  printTerminal("[SYS] Workspace committed to disk.", "success");
};
