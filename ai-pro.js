// ai-pro.js - Nebula Pro AI Engine (Gemini 2.5 Flash Edition)

window.ask = async (prompt) => {
  const key = sessionStorage.getItem("nebula_key");
  if (!key) {
    printTerminal("[ERR] No API Key found in AI Engine tab.", "error");
    return "Error: API Key missing.";
  }

  // No-Click Proxy (Bypasses CORS without requiring user activation)
  const proxy = "https://corsproxy.io/?";
  
  // Model version updated to gemini-2.5-flash as requested
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

  printTerminal("[SYS] Contacting Gemini 2.5 Flash...", "info");

  try {
    const response = await fetch(proxy + encodeURIComponent(targetUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("API Error:", errText);
      
      // If 2.5 isn't available for that specific API key, notify the user
      if (response.status === 404) {
          return "[ERR] Model 'gemini-2.5-flash' not found. Try 'gemini-1.5-flash' if your key doesn't have 2.5 access yet.";
      }
      return `[ERR] API Error ${response.status}. Check console for details.`;
    }

    const data = await response.json();
    
    // Extracting the AI response text
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "AI returned a successful but empty response.";
    }

  } catch (e) {
    printTerminal("[ERR] Network failure. Check internet or Proxy status.", "error");
    console.error(e);
    return "Connection error.";
  }
};

const saveKeyBtn = document.getElementById("save-key");
if (saveKeyBtn) {
  saveKeyBtn.onclick = () => {
    const k = document.getElementById("ai-key").value;
    if (!k) return printTerminal("[ERR] Key cannot be empty", "error");
    
    sessionStorage.setItem("nebula_key", k);
    printTerminal("[SYS] Authorized for Gemini 2.5 Flash Engine.", "success");
  };
}
