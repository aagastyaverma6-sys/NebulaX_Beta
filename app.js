<<<<<<< HEAD
let __files = JSON.parse(localStorage.getItem('nebula_v2_files')) || [
  { id: 1, name: 'index.html', lang: 'html', content: '<h1>Nebula Ready</h1>' }
];
let __activeId = 1;

window.switchRibbon = (tabId, event) => {
  document.querySelectorAll('.tool-group').forEach(g => g.classList.remove('show'));
  document.getElementById(`group-${tabId}`).classList.add('show');
  document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
  event.currentTarget.classList.add('active');
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
  if (f) f.content = window.editor.getValue();
}

function loadToEditor() {
  const f = __files.find(x => x.id === __activeId);
  window.editor.setValue(f.content);
  monaco.editor.setModelLanguage(window.editor.getModel(), f.lang === 'html' ? 'html' : 'javascript');
}

document.getElementById('new-file').onclick = () => {
  const name = prompt("Filename:");
  if (!name) return;
  const id = Date.now();
  __files.push({ id, name, lang: name.endsWith('.html') ? 'html' : 'javascript', content: '' });
  __activeId = id;
  renderTabs(); loadToEditor();
};

document.getElementById('save-disk').onclick = () => {
  saveActive();
  localStorage.setItem('nebula_v2_files', JSON.stringify(__files));
  printTerminal("[SYS] Changes committed to Gdevlop storage.", "success");
};

require.config({ paths: { vs: 'vs' } });
require(['vs/editor/editor.main'], function () {
  window.editor = monaco.editor.create(document.getElementById('editor'), {
    theme: 'vs-dark', automaticLayout: true, fontSize: 14
  });
  renderTabs(); loadToEditor();
=======
let __files = JSON.parse(localStorage.getItem('nebula_v2_files')) || [
  { id: 1, name: 'index.html', lang: 'html', content: '<h1>Nebula Ready</h1>' }
];
let __activeId = 1;

window.switchRibbon = (tabId, event) => {
  document.querySelectorAll('.tool-group').forEach(g => g.classList.remove('show'));
  document.getElementById(`group-${tabId}`).classList.add('show');
  document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
  event.currentTarget.classList.add('active');
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
  if (f) f.content = window.editor.getValue();
}

function loadToEditor() {
  const f = __files.find(x => x.id === __activeId);
  window.editor.setValue(f.content);
  monaco.editor.setModelLanguage(window.editor.getModel(), f.lang === 'html' ? 'html' : 'javascript');
}

document.getElementById('new-file').onclick = () => {
  const name = prompt("Filename:");
  if (!name) return;
  const id = Date.now();
  __files.push({ id, name, lang: name.endsWith('.html') ? 'html' : 'javascript', content: '' });
  __activeId = id;
  renderTabs(); loadToEditor();
};

document.getElementById('save-disk').onclick = () => {
  saveActive();
  localStorage.setItem('nebula_v2_files', JSON.stringify(__files));
  printTerminal("[SYS] Changes committed to Gdevlop storage.", "success");
};

require.config({ paths: { vs: 'vs' } });
require(['vs/editor/editor.main'], function () {
  window.editor = monaco.editor.create(document.getElementById('editor'), {
    theme: 'vs-dark', automaticLayout: true, fontSize: 14
  });
  renderTabs(); loadToEditor();
>>>>>>> 67be66082f05c4287a375987dca4b119437719ef
});