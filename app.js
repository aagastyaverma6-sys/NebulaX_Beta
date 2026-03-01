let __files = JSON.parse(localStorage.getItem('nebula_v2_files')) || [
  { id: 1, name: 'index.html', lang: 'html', content: '<h1>Nebula Ready</h1>' }
];
let __activeId = 1;

window.switchRibbon = (tabId, event) => {
  document.querySelectorAll('.tool-group').forEach(g => g.classList.remove('show'));
  const group = document.getElementById(`group-${tabId}`);
  if(group) group.classList.add('show');
  document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
  event.currentTarget.classList.add('active');
};

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
  if(!f || !window.editor) return;
  window.editor.setValue(f.content);
  const m = f.name.endsWith('.html') ? 'html' : 'javascript';
  monaco.editor.setModelLanguage(window.editor.getModel(), m);
}

// GITHUB PAGES PATH FIX
const isGH = window.location.hostname.includes('github.io');
const repoName = window.location.pathname.split('/')[1];
const finalVsPath = isGH ? `/${repoName}/vs` : 'vs';

require.config({ paths: { vs: finalVsPath } });
require(['vs/editor/editor.main'], function () {
  window.editor = monaco.editor.create(document.getElementById('editor'), {
    theme: 'vs-dark', automaticLayout: true, fontSize: 14, minimap: { enabled: false }
  });
  renderTabs(); loadToEditor();
});

document.getElementById('new-file').onclick = () => {
  const name = prompt("Filename:");
  if (!name) return;
  const id = Date.now();
  __files.push({ id, name, content: '' });
  __activeId = id;
  renderTabs(); loadToEditor();
};

document.getElementById('save-disk').onclick = () => {
  saveActive();
  localStorage.setItem('nebula_v2_files', JSON.stringify(__files));
  printTerminal("[SYS] Changes committed to local storage.", "success");
};
