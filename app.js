let __files = [{ id: 1, name: 'index.html', lang: 'html', content: '<h1>Nebula Cloud</h1>' }];
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
    theme: 'vs-dark', automaticLayout: true, fontSize: 14
  });
  window.editor.setValue(__files[0].content);
});

// RESIZER LOGIC
const splitter = document.getElementById('splitter');
const preview = document.getElementById('preview-panel');
const workspace = document.querySelector('.workspace');

let isMD = false;

splitter.onmousedown = () => { isMD = true; document.body.style.cursor = 'col-resize'; };
document.onmouseup = () => { isMD = false; document.body.style.cursor = 'default'; };

document.onmousemove = (e) => {
  if (!isMD) return;
  const workRect = workspace.getBoundingClientRect();
  const newWidth = workRect.right - e.clientX;
  
  if (newWidth > 50 && newWidth < workRect.width - 200) {
    preview.style.width = newWidth + 'px';
    if (window.editor) window.editor.layout();
  }
};

window.togglePreview = () => {
  preview.classList.toggle('preview-hidden');
  if (window.editor) window.editor.layout();
};
