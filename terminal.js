const termInput = document.getElementById('term-input');
const termContent = document.getElementById('term-content');

window.printTerminal = (text, type = "default") => {
  const d = document.createElement('div');
  const colors = { error: "#ff6b6b", success: "#51cf66", info: "#58a6ff" };
  d.style.color = colors[type] || "#d1d5db";
  d.textContent = text;
  termContent.appendChild(d);
  termContent.scrollTop = termContent.scrollHeight;
};

window.clearTerminal = () => termContent.innerHTML = '';

termInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const raw = termInput.value.trim();
    if (!raw) return;
    printTerminal(`nebula@root:~$ ${raw}`);
    termInput.value = "";
    const [cmd, ...args] = raw.split(' ');

    switch (cmd.toLowerCase()) {
      case 'ls': printTerminal("index.html  main.js  Gdevlop/  node_modules/"); break;
      case 'npm':
        printTerminal(`[SYS] Fetching ${args[1] || 'package'}...`, "info");
        setTimeout(() => printTerminal(`+ ${args[1] || 'package'}@latest`, "success"), 1000);
        break;
      case 'ai':
        const res = await window.ask(args.join(' '));
        printTerminal(`[AI]: ${res}`, "success");
        break;
      case 'clear': clearTerminal(); break;
      default: printTerminal(`bash: ${cmd}: command not found`, "error");
    }
  }
});
