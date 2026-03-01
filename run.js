window.starterSnippets = {
  html: "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Nebula Ready</h1>\n</body>\n</html>",
  63: "console.log('Node Runtime Ready');",
  71: "print('Python Ready')",
  54: "#include <iostream>\nint main() { std::cout << \"C++ Active\"; return 0; }",
  47: "PRINT \"BASIC READY\"\nEND"
};

const runBtn = document.getElementById("run-btn-main");
if (runBtn) {
  runBtn.onclick = async () => {
    const code = window.editor.getValue();
    const langSelect = document.getElementById("lang-select");
    const langVal = langSelect ? langSelect.value : "html";

    printTerminal(`[RUNTIME] Deploying: ${langVal}`, "info");

    if (langVal === "html") {
      const doc = document.getElementById("web-viewer").contentDocument;
      document.getElementById("preview-panel").classList.remove("preview-hidden");
      doc.open(); doc.write(code); doc.close();
      printTerminal("[RUNTIME] Successful render.", "success");
      return;
    }

    try {
      const res = await window.runOnJudge0(code, parseInt(langVal));
      if (res.stdout) printTerminal(res.stdout, "success");
      if (res.stderr) {
          printTerminal(res.stderr, "error");
          printTerminal("[SYS] Use 'AI Fix Ghost' to resolve these errors.", "info");
      }
      printTerminal(`[RUNTIME] Status: ${res.status.description}`);
    } catch (e) {
      printTerminal("[ERR] Runtime Failure.", "error");
    }
  };
}

window.togglePreview = () => document.getElementById("preview-panel").classList.toggle("preview-hidden");
