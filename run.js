const runBtn = document.getElementById("run-btn-main");
if (runBtn) {
  runBtn.onclick = async () => {
    const code = window.editor.getValue();
    const langSelect = document.getElementById("lang");
    const langVal = langSelect.value;

    printTerminal(`[RUNTIME] Deploying: ${langVal}`, "info");

    if (langVal === "html") {
      const doc = document.getElementById("web-viewer").contentDocument;
      document.getElementById("preview-panel").classList.remove("preview-hidden");
      doc.open(); doc.write(code); doc.close();
      printTerminal("[RUNTIME] Render Successful.", "success");
      return;
    }

    try {
      const res = await window.runOnJudge0(code, parseInt(langVal));
      if (res.stdout) printTerminal(res.stdout, "success");
      if (res.stderr) {
          printTerminal(res.stderr, "error");
          printTerminal("[SYS] Suggestion: Use 'AI Fix Ghost' to repair errors.", "info");
      }
      printTerminal(`[RUNTIME] Status: ${res.status.description}`);
    } catch (e) {
      printTerminal("[ERR] Runtime Failure.", "error");
    }
  };
}

function togglePreview() {
    document.getElementById("preview-panel").classList.toggle("preview-hidden");
}
