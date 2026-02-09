# VibeLens: Your AI Quota Command Center

VibeLens is a zero-latency bridge that connects your Antigravity IDE's local AI usage data to a premium web dashboard. It solves one simple problem: **"How many Claude/Gemini tokens do I have left, and when do they reset?"**

## 🏗️ Core Architecture (How it works)
VibeLens is NOT a cloud-based tracker. It is a **Privacy-First Local Bridge**:
1. **Local Collection**: The extension captures your IDE's internal quota data via a local bridge (`127.0.0.1`).
2. **Local Storage**: Your usage history (Heatmap) and account keys are stored ONLY in your browser's `LocalStorage`.
3. **No Database**: We don't have a central server. Your data never leaves your machine.

## 🔌 UX Flow (30-Second Setup)
![VibeLens UX Flow](https://raw.githubusercontent.com/May1350/vibelens/main/extension/resources/flow_diagram.png)

1. **Activate**: Click the VibeLens icon in your VS Code Activity Bar.
2. **Key**: Copy your unique **Dashboard Sync Key** from the sidebar.
3. **Link**: Click 'Open Live Dashboard' and paste the key. 
4. **Done**: Your quotas and heatmaps are now live on the web.

## 🎯 Key Features
- **Live Sync**: Real-time numerical tracking of Gemini and Claude models.
- **Vibe Heatmap**: Visualizes your daily AI interaction peaks.
- **Smart Folding**: Automatically hides 100% full models to reduce UI clutter.
- **Zero Configuration**: No passwords or cloud accounts required. The extension IS your identity.

## 🌐 Mission Control
[Launch Live Dashboard](https://vibelens-fxnro0ske-may1350s-projects.vercel.app/)

---
*VibeLens is designed for developers who value privacy as much as productivity.*
