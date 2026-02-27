window.ask = async (prompt) => {
  const key = sessionStorage.getItem("nebula_key");
  if (!key) {
    printTerminal("[ERR] No API Key found in AI Engine tab.", "error");
    throw "err";
  }

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${key}`, {
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

const saveKeyBtn = document.getElementById("save-key");
if (saveKeyBtn) {
  saveKeyBtn.onclick = () => {
    const k = document.getElementById("ai-key").value;
    sessionStorage.setItem("nebula_key", k);
    printTerminal("[SYS] Authorized for Gemini 3 Flash.", "success");
  };
}