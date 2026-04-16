# VibeLens — AI Quota Mission Control

Real-time dashboard + VS Code extension for monitoring usage quotas across multiple AI models. Privacy-first, local-only storage.

**Author**: [@May1350](https://github.com/May1350) · Keio Univ. Faculty of Business & Commerce · 2026-

---

## Why

AI coding has become routine, but usage is fragmented:

- Claude / Codex / Gemini quotas reset on different cadences
- IDE-side indicators are hidden inside individual tools (e.g., Antigravity IDE)
- Hitting a quota mid-flow kills momentum

**VibeLens** surfaces quota state in one place so you can pick *which model to use next* at a glance, and catch near-reset windows before switching unnecessarily.

## What it gives you

- **Real-time sync** — bridges Antigravity IDE quota data to a standalone web dashboard
- **Vibe Heatmap** — visualizes daily AI consumption by model, time-of-day, and project
- **Smart Reordering** — surfaces models with imminent resets so you don't over-switch
- **Privacy First** — all data is stored locally in the browser. No cloud, no telemetry
- **Two touchpoints** — web dashboard for overview + VS Code extension for in-editor state

## Stack

| Layer | Tech |
|---|---|
| Web dashboard | Static site (HTML · CSS · JavaScript) — deployable to Vercel / Netlify / GitHub Pages |
| VS Code extension | TypeScript (VSCE package format) |
| Data bridge | Antigravity IDE API → local storage |
| Storage | Browser `localStorage` only. No external DB |

## Quickstart

### Web dashboard (Vercel recommended)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import this repository (or drag-and-drop the folder)
3. Vercel auto-detects the static files and deploys

Alt: push to GitHub Pages via **Settings → Pages → main branch → /root**.

### VS Code extension (personal build)

```bash
cd extension
npm install
npm install -g @vscode/vsce
vsce package
# Install the generated .vsix in VS Code (Extensions → ⋯ → Install from VSIX)
```

## Roadmap

- [ ] Additional providers (Anthropic Claude, OpenAI direct, Gemini CLI)
- [ ] Team-shared snapshot view (opt-in)
- [ ] Weekly burn rate digest (Markdown export)

## Design principles

- **Local first**: your quota data never leaves the browser
- **Low friction**: runs as a static site + lightweight extension, no server required
- **Honest UI**: show what is known, mark what is `unverified`

## License

MIT — see `LICENSE` if present, or contact [@May1350](https://github.com/May1350) for clarification.

---

*Built in spare time as part of an exploration on how an "AI orchestrator" (a person who directs AI to write code rather than writing it from scratch) can ship useful developer tools. See also my other projects focused on the same theme: [life-builder](https://github.com/May1350/life-builder), [Axis_hp](https://github.com/May1350/Axis_hp).*
