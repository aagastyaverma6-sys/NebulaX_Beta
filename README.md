# NebulaX Beta

NebulaX is a browser-based IDE experiment with Monaco editor, runtime execution, and AI workflows.

## What's improved in this update

- Better syntax highlighting behavior using filename-extension detection.
- Expanded AI feature set (summarize, test generation, transform workflows).
- New **Power Tools** ribbon with a command palette and 40+ built-in tools.
- File operations: create, rename, delete, export.
- UX improvements: status bar, keyboard shortcuts, richer terminal commands.

## Quick start (local)

1. Serve the folder:
   ```bash
   python3 -m http.server 4173
   ```
2. Open `http://localhost:4173`.
3. Add your Gemini key in **AI Engine** tab for AI features.

## Deploy (GitHub Pages)

The repo includes automatic Pages deployment via:

- `.github/workflows/deploy-pages.yml`

### One-time setup

1. Open your repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment**, choose **Source: GitHub Actions**.

### Publish steps

1. Push to any branch.
2. Wait for workflow **Deploy NebulaX to GitHub Pages** to finish.
3. Open the Pages URL shown in the deploy job (`steps.deployment.outputs.page_url`).

### Live URL format

- Most repos: `https://<github-username>.github.io/<repo-name>/`
- User/org site repo named `<username>.github.io`: `https://<username>.github.io/`

### If it still isn't live

- Verify the Pages source is **GitHub Actions** (not Deploy from branch).
- Check Actions tab for failed workflow runs.
- Re-run workflow manually from **Actions → Deploy NebulaX to GitHub Pages → Run workflow**.

## Keyboard shortcuts

- `Ctrl/Cmd + S`: Save workspace to localStorage
- `Ctrl/Cmd + P`: Open command palette
- `Esc`: Close command palette
