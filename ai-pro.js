let originalCode = "";
let ghostDecorations = [];

window.ask = async (prompt) => {
  const key = sessionStorage.getItem("nebula_key");
  if (!key) {
    printTerminal("[ERR] AI Key missing. Check AI Engine tab.", "error");
    throw "key_missing";
  }

  const PROXY = "https://corsproxy.io/?";
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

  try {
    const r = await fetch(PROXY + encodeURIComponent(URL), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const d = await r.json();
    return d.candidates[0].content.parts[0].text;
  } catch (e) {
    printTerminal("[ERR] AI Handshake failed.", "error");
    return "";
  }
};

window.fixCodeWithAI = async () => {
    const code = window.editor.getValue();
    printTerminal("[AI] Requesting Ghost Fix via Proxy...", "info");
    const suggestion = await window.ask(`Act as an expert. Fix this code. Return ONLY code, no markdown: \n\n${code}`);
    if(!suggestion) return;
    originalCode = code;
    document.getElementById('ghost-ui').style.display = 'flex';
    window.editor.setValue(suggestion.trim());
    const lineCount = window.editor.getModel().getLineCount();
    ghostDecorations = window.editor.deltaDecorations([], [{
        range: new monaco.Range(1, 1, lineCount, 1),
        options: { isWholeLine: true, inlineClassName: 'ghost-text-decoration' }
    }]);
    printTerminal("[AI] Ghost Suggestion Loaded.", "success");
};

window.acceptGhostCode = () => {
    ghostDecorations = window.editor.deltaDecorations(ghostDecorations, []);
    document.getElementById('ghost-ui').style.display = 'none';
    printTerminal("[SYS] Suggestion accepted.", "success");
};

window.discardGhostCode = () => {
    window.editor.setValue(originalCode);
    ghostDecorations = window.editor.deltaDecorations(ghostDecorations, []);
    document.getElementById('ghost-ui').style.display = 'none';
    printTerminal("[SYS] Suggestion discarded.", "info");
};

window.openPromptLibrary = () => document.getElementById('prompt-overlay').style.display = 'flex';

window.applySuggestedPrompt = async (text) => {
    document.getElementById('prompt-overlay').style.display = 'none';
    printTerminal(`[AI] Generating: ${text}`, "info");
    const res = await window.ask(`Task: ${text}. Return ONLY code.`);
    const selection = window.editor.getSelection();
    window.editor.executeEdits("ai-insert", [{ range: selection, text: res, forceMoveMarkers: true }]);
};

const saveBtn = document.getElementById("save-key");
if(saveBtn) {
    saveBtn.onclick = () => {
        sessionStorage.setItem("nebula_key", document.getElementById("ai-key").value);
        printTerminal("[SYS] AI Auth Success.", "success");
    };
}
