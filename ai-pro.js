let originalCode = '';
let ghostDecorations = [];

window.ask = async (prompt) => {
  const key = sessionStorage.getItem('nebula_key');
  if (!key) {
    printTerminal('[ERR] AI Key missing. Check AI Engine tab.', 'error');
    throw new Error('key_missing');
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  const proxyBase = sessionStorage.getItem('nebula_ai_proxy')?.trim();
  const requestBody = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });

  const endpoints = [{ label: 'direct', url: apiUrl }];
  if (proxyBase) {
    const separator = proxyBase.includes('?') ? '' : '?';
    endpoints.push({
      label: 'proxy',
      url: `${proxyBase}${separator}${encodeURIComponent(apiUrl)}`
    });
  }

  for (const endpoint of endpoints) {
    try {
      const r = await fetch(endpoint.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody
      });

      if (!r.ok) {
        const details = await r.text();
        printTerminal(`[ERR] AI request failed via ${endpoint.label} (${r.status}).`, 'error');
        if (r.status === 400 || r.status === 401 || r.status === 403) {
          printTerminal('[HINT] Check API key restrictions or use an AI proxy in AI Engine.', 'info');
        }
        if (details) printTerminal(details.slice(0, 240), 'error');
        continue;
      }

      const d = await r.json();
      return d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (e) {
      printTerminal(`[WARN] AI ${endpoint.label} request failed (${e?.message || 'network error'}).`, 'info');
    }
  }

  printTerminal('[ERR] All AI endpoints failed. Add a proxy URL if browser blocks direct Gemini calls.', 'error');
  return '';
};

window.runAITransform = async (instruction, replaceSelectionOnly = true) => {
  const selection = window.editor.getSelection();
  const current = window.editor.getModel().getValueInRange(selection);
  const source = current.trim() ? current : window.editor.getValue();
  if (!source.trim()) {
    printTerminal('[WARN] Empty source for AI operation.', 'info');
    return;
  }

  printTerminal('[AI] Processing transformation...', 'info');
  const output = await window.ask(`${instruction}\n\n${source}`);
  if (!output) return;

  if (replaceSelectionOnly && current.trim()) {
    window.editor.executeEdits('ai-transform', [{ range: selection, text: output, forceMoveMarkers: true }]);
  } else if (replaceSelectionOnly) {
    window.editor.setValue(output);
  } else {
    printTerminal(`[AI RESULT]\n${output}`, 'success');
  }
};

window.fixCodeWithAI = async () => {
  const code = window.editor.getValue();
  printTerminal('[AI] Requesting Ghost Fix...', 'info');
  const suggestion = await window.ask(`Act as an expert. Fix this code. Return ONLY code, no markdown:\n\n${code}`);
  if (!suggestion) return;
  originalCode = code;
  document.getElementById('ghost-ui').style.display = 'flex';
  window.editor.setValue(suggestion.trim());
  const lineCount = window.editor.getModel().getLineCount();
  ghostDecorations = window.editor.deltaDecorations([], [{
    range: new monaco.Range(1, 1, lineCount, 1),
    options: { isWholeLine: true, inlineClassName: 'ghost-text-decoration' }
  }]);
  printTerminal('[AI] Ghost Suggestion Loaded.', 'success');
};

window.summarizeCodeWithAI = async () => {
  await window.runAITransform('Summarize this code in short bullet points for a busy senior engineer:', false);
};

window.generateTestsWithAI = async () => {
  await window.runAITransform('Generate practical tests for this code. Return only the test code.', true);
};

window.acceptGhostCode = () => {
  ghostDecorations = window.editor.deltaDecorations(ghostDecorations, []);
  document.getElementById('ghost-ui').style.display = 'none';
  printTerminal('[SYS] Suggestion accepted.', 'success');
};

window.discardGhostCode = () => {
  window.editor.setValue(originalCode);
  ghostDecorations = window.editor.deltaDecorations(ghostDecorations, []);
  document.getElementById('ghost-ui').style.display = 'none';
  printTerminal('[SYS] Suggestion discarded.', 'info');
};

window.openPromptLibrary = () => (document.getElementById('prompt-overlay').style.display = 'flex');

window.applySuggestedPrompt = async (text) => {
  document.getElementById('prompt-overlay').style.display = 'none';
  printTerminal(`[AI] Generating: ${text}`, 'info');
  const res = await window.ask(`Task: ${text}. Return ONLY code.`);
  const selection = window.editor.getSelection();
  window.editor.executeEdits('ai-insert', [{ range: selection, text: res, forceMoveMarkers: true }]);
};

const saveBtn = document.getElementById('save-key');
if (saveBtn) {
  saveBtn.onclick = () => {
    sessionStorage.setItem('nebula_key', document.getElementById('ai-key').value);
    printTerminal('[SYS] AI Auth Success.', 'success');
  };
}

const saveProxyBtn = document.getElementById('save-proxy');
if (saveProxyBtn) {
  const proxyInput = document.getElementById('ai-proxy');
  const savedProxy = sessionStorage.getItem('nebula_ai_proxy');
  if (proxyInput && savedProxy) proxyInput.value = savedProxy;

  saveProxyBtn.onclick = () => {
    const proxy = proxyInput?.value?.trim();
    if (!proxy) {
      sessionStorage.removeItem('nebula_ai_proxy');
      printTerminal('[SYS] AI Proxy cleared. Using direct Gemini call.', 'info');
      return;
    }

    sessionStorage.setItem('nebula_ai_proxy', proxy);
    printTerminal('[SYS] AI Proxy saved.', 'success');
  };
}
