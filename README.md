# VibeLens - AI Quota Mission Control

VibeLens is a premium dashboard and browser extension designed to help you monitor your AI model quotas in real-time.

## 🚀 Deployment Guide

### 1. Web Dashboard (Frontend)
The web dashboard is a static site. You can deploy it instantly to **Vercel** or **Netlify**.

**Method A: Vercel (Recommended)**
1. Go to [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import this repository (or drag and drop the folder).
4. Vercel will automatically detect the static files and deploy them.

**Method B: GitHub Pages**
1. Push this code to a GitHub repository.
2. Go to **Settings** -> **Pages**.
3. Select the `main` branch and `/ (root)` folder.

### 2. VS Code Extension (Backend)
To build the extension for personal use:
1. Open the `extension` folder in your terminal.
2. Run `npm install`.
3. Install the VSCE tool: `npm install -g @vscode/vsce`.
4. Run `vsce package` to generate a `.vsix` file.
5. Install the `.vsix` file in VS Code.

## 🛠 Features
- **Real-time Sync**: Bridges Antigravity IDE quota data to the web.
- **Vibe Heatmap**: Visualizes your daily AI consumption.
- **Smart Reordering**: Focuses on models that need reset soon.
- **Privacy First**: All data is stored locally in your browser.

---
Created with ❤️ by VibeLens Team.
