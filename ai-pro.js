let originalCode = "";
let ghostDecorations = [];

window.ask = async (prompt) => {
  const key = sessionStorage.getItem("nebula_key");
  if (!key) {
    printTerminal("[ERR] No API Key found. Go to AI Engine tab.", "error");
    throw "err";
  }

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const d = await r.json();
    return d.candidates[0].content.parts[0].text;
  } catch (e) {
    printTerminal("[ERR] AI Handshake failed.", "error");
    return "Error connecting to Gemini.";
  }
};

// GHOST CODE FIXER
window.fixCodeWithAI = async () => {
    const code = window.editor.getValue();
    const lang = document.getElementById('lang').value;
    printTerminal("[AI] Analyzing code for bugs...", "info");

    const prompt = `Fix or optimize this ${lang} code. Return ONLY the code, no markdown backticks, no explanations: \n\n${code}`;
    
    try {
        const suggestion = await window.ask(prompt);
        originalCode = code;
        
        // Show Ghost UI
        document.getElementById('ghost-ui').style.display = 'flex';
        window.editor.setValue(suggestion.trim());
        
        // Add Ghost Styling
        const lineCount = window.editor.getModel().getLineCount();
        ghostDecorations = window.editor.deltaDecorations([], [
            {
                range: new monaco.Range(1, 1, lineCount, 1),
                options: { isWholeLine: true, inlineClassName: 'ghost-text-decoration' }
            }
        ]);
        printTerminal("[AI] Ghost suggestion applied. Review changes.", "success");
    } catch (e) {
        printTerminal("[ERR] Could not generate fix.", "error");
    }
};

window.acceptGhostCode = () => {
    ghostDecorations = window.editor.deltaDecorations(ghostDecorations, []);
    document.getElementById('ghost-ui').style.display = 'none';
    printTerminal("[SYS] Changes accepted.", "success");
};

window.discardGhostCode = () => {
    window.editor.setValue(originalCode);
    ghostDecorations = window.editor.deltaDecorations(ghostDecorations, []);
    document.getElementById('ghost-ui').style.display = 'none';
    printTerminal("[SYS] Changes discarded.", "info");
};

// PROMPT LIBRARY
window.openPromptLibrary = () => document.getElementById('prompt-overlay').style.display = 'flex';

window.applySuggestedPrompt = async (text) => {
    document.getElementById('prompt-overlay').style.display = 'none';
    printTerminal(`[AI] Generating: ${text}`, "info");
    
    const res = await window.ask(`Context: ${document.getElementById('lang').value}. Task: ${text}. Return ONLY code.`);
    const selection = window.editor.getSelection();
    window.editor.executeEdits("ai-insert", [{ range: selection, text: res, forceMoveMarkers: true }]);
};

const saveKeyBtn = document.getElementById("save-key");
if (saveKeyBtn) {
  saveKeyBtn.onclick = () => {
    sessionStorage.setItem("nebula_key", document.getElementById("ai-key").value);
    printTerminal("[SYS] AI Auth Successful.", "success");
  };
}
