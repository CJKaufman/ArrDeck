<div align="center">

# ⚡ ArrDeck

### Mission Control for Your *Arr Media Stack

**A Windows desktop dashboard for Sonarr · Radarr · Prowlarr · qBittorrent**

[![Release](https://img.shields.io/github/v/release/CJKaufman/ArrDeck?style=flat-square&color=00bcff&labelColor=0e0f11)](https://github.com/CJKaufman/ArrDeck/releases/latest)
[![Stars](https://img.shields.io/github/stars/CJKaufman/ArrDeck?style=flat-square&color=00bcff&labelColor=0e0f11)](https://github.com/CJKaufman/ArrDeck/stargazers)
[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri%202-00bcff?style=flat-square&labelColor=0e0f11)](https://v2.tauri.app)
[![Status](https://img.shields.io/badge/Status-Heavy%20Development-f59e0b?style=flat-square&labelColor=0e0f11)](#-roadmap)

<br />

> 🚧 **Heavily in development.** A lot is still being added, fixed and refined. Feedback, ideas and criticism are very welcome — that's exactly why this is public.

<br />

[**→ View Landing Page**](https://cjkaufman.github.io/ArrDeck) &nbsp;·&nbsp; [**→ Download Latest**](https://github.com/CJKaufman/ArrDeck/releases/latest) &nbsp;·&nbsp; [**→ Report a Bug**](https://github.com/CJKaufman/ArrDeck/issues)

</div>

---

## 🤔 Why does this exist?

If you run a self-hosted media stack you've probably noticed something: **on mobile you're sorted**. Android has NZB360. iOS has Lookupeer. Both give you a polished, unified interface for your entire *arr suite right in your pocket.

**On Windows desktop? Nothing.** You're stuck juggling five browser tabs — one per service, each with their own UI language, each requiring its own login. It works, but it's not exactly elegant for something you interact with every day.

I couldn't find a native Windows app that solved this, so I decided to try building one myself. I'm not a professional developer — this is very much a **vibe coding project** — but it's been a great excuse to learn Tauri, sharpen my React skills, and end up with something I actually use daily.

If you run a similar stack and want something better than browser tabs, give it a go. And if you have ideas, feature requests, or "this is completely wrong, here's why" feedback — [open an issue](https://github.com/CJKaufman/ArrDeck/issues). Seriously, I want to hear it.

---

## 🚧 Current State

This project is **actively in development**. Core features work, but there are rough edges, known bugs, and a lot still to be built. Do not expect a polished production app — yet.

Things that currently work:
- ✅ Unified dashboard with draggable, resizable widget grid
- ✅ Sonarr & Radarr full library management (grid/list, detail drawer, bulk actions)
- ✅ Prowlarr indexer health monitoring with animated status indicators
- ✅ qBittorrent swarm management — torrents, speed controls, file tree, bulk ops
- ✅ 6 switchable UI themes
- ✅ Unified download queue across all services
- ✅ Windows native toast notifications
- ✅ Auto-update via GitHub Releases

Things still being worked on:
- 🔧 Layout stability at small window sizes
- 🔧 Deeper Prowlarr stats and search integration
- 🔧 Calendar refinements
- 🔧 Complete settings persistence via Tauri store plugin
- 🔧 Lidarr / Readarr support (architecture is pluggable, not yet wired)
- 🔧 First-run onboarding flow
- 🔧 General polish, error state handling, edge cases

---

## ✨ Features

| Feature | Description |
|---|---|
| **Unified Dashboard** | Service health, active downloads, upcoming releases and health alerts on one screen |
| **Drag & Drop Grid** | Rearrange and resize every dashboard widget in edit mode — layout persists |
| **Full Library Management** | Browse Sonarr series and Radarr movies with sort, filter, search and bulk actions |
| **Prowlarr Health Rail** | Animated per-indexer status bars — green/amber/red with cinematic sweep animation |
| **qBittorrent Swarm** | High-density torrent table, detail drawer with file tree, per-torrent speed limits |
| **6 UI Themes** | Minimal · Swizzin · Autobrr · Kyle · Nightwalker · Napster |
| **Native Performance** | ~35MB RAM at idle, <0.5s launch time. Tauri 2 using Edge WebView2 (no bundled Chromium) |
| **Windows Notifications** | Native toast notifications for downloads, health warnings and connection events |

---

## 🛠 Tech Stack

Built with tools I wanted to learn properly:

| Layer | Tech |
|---|---|
| **Shell** | [Tauri 2](https://v2.tauri.app) — Rust-based native Windows wrapper |
| **Frontend** | React 19 + TypeScript + Vite 6 |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **State** | Zustand 5 (UI/settings) + TanStack Query v5 (server state) |
| **HTTP** | Axios — with cookie-jar support for qBittorrent's session auth |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Runtime** | Edge WebView2 (pre-installed on all modern Windows machines) |

---

## 🚀 Getting Started

### Download
Grab the latest `.exe` installer from [**Releases**](https://github.com/CJKaufman/ArrDeck/releases/latest) — no Node.js or Rust required to run it.

### Configure
On first launch, go to **Settings** and enter your service URLs and API keys:

| Service | Default Port | Where to find the API key |
|---|---|---|
| Sonarr | `8989` | Settings → General → Security |
| Radarr | `7878` | Settings → General → Security |
| Prowlarr | `9696` | Settings → General → Security |
| qBittorrent | `8080` | Credentials you set in Web UI settings |

---

## 🧑‍💻 Contributing / Running Locally

```bash
# Prerequisites: Node.js 20+, Rust (stable), Edge WebView2 (pre-installed on Windows 10/11)

git clone https://github.com/CJKaufman/ArrDeck.git
cd ArrDeck
npm install
npm run tauri dev
```

The app hot-reloads on file save. Bug reports, feature ideas and pull requests are all welcome — just keep in mind this is a solo vibe-coding project so review cycles may be slow.

---

## 📋 Roadmap

A rough priority list of what's coming:

- [ ] Stable windowed-mode grid layout for all breakpoints
- [ ] Full Prowlarr search and grab history integration  
- [ ] Lidarr support
- [ ] Readarr support
- [ ] Settings onboarding flow for first-time setup
- [ ] Auto-update UI with release notes
- [ ] Poster image caching improvements
- [ ] Keyboard shortcuts and power-user navigation
- [ ] GitHub release pipeline refinement

---

## 📄 License

MIT — use it, fork it, build on it.

---

<div align="center">

Made by [CJKaufman](https://github.com/CJKaufman) · Inspired by [NZB360](https://nzb360.com) · Built with [Tauri](https://v2.tauri.app)

*Started because I couldn't find what I wanted. Finished when it's actually finished.*

</div>
