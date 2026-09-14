# AI Dashboard

Modularer, webbasierter Hub für **KI-Tools, Agenten, APIs, Chatbots, Code und eigene HTML-Apps** —
mit React 19, Vite, Tailwind CSS v4, Clerk-Auth und Cloudflare-Pages-Deployment.

![Stack](https://img.shields.io/badge/React-19-5e6ad2) ![Vite](https://img.shields.io/badge/Vite-8-5e6ad2)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-5e6ad2) ![Clerk](https://img.shields.io/badge/Auth-Clerk-5e6ad2)

## Features

| Bereich | Was geht |
|---|---|
| 💬 **Chat** | OpenAI (GPT-4o, o1-mini …) + Anthropic Claude mit **Streaming**, Sessions, Verlauf — BYOK |
| 🔗 **Workflows** | Prompt-Ketten mit `{{prev}}`-Piping: Plan → Execute → Review |
| 💻 **Code** | JS-Runner in Sandbox-Worker mit Output-Capture + History |
| 🌐 **API Playground** | REST-Tester (alle Methoden, Header, Body, Auth-Keys, Verlauf) |
| 🧩 **Plugins** | 7 Built-ins + eigene Instanzen: LLM, Chain-Agent, REST-Caller, **Custom-HTML-Apps** (Sandbox-Iframe), Webhook |
| ⌘ **Command Palette** | `Ctrl/⌘ + K` Navigation & Aktionen |
| 🔐 **Auth** | Clerk Sign-In, geschützte Routen |
| 💾 **Persistenz** | Alles in localStorage — kein Backend nötig |

**Eigene Tools einfügen:** Plugins → z. B. *Custom HTML App* → HTML/CSS/JS einkleben → als Instanz speichern → im Dashboard nutzen.
API-Keys bleiben im Browser (BYOK), Requests gehen direkt an den Provider.

## Schnellstart

```bash
npm install
cp .env.example .env   # VITE_CLERK_PUBLISHABLE_KEY von dashboard.clerk.com eintragen
npm run dev
```

Ohne Key zeigt die App einen Setup-Screen mit Anleitung.

## Build & Deploy (Cloudflare Pages)

```bash
npm run build   # → dist/
```

**Option A — Git-Integration (empfohlen):**
1. Repo zu GitHub pushen
2. Cloudflare Dashboard → Pages → *Create* → Repo verbinden
3. Build command: `npm run build`, Output: `dist`
4. Env var: `VITE_CLERK_PUBLISHABLE_KEY` (Production-Key) → Deploy

**Option B — Direct Upload:** `dist/` als ZIP in Pages hochladen.
SPA-Routing wird via `public/_redirects` (`/* → /index.html 200`) abgedeckt.

## Projektstruktur

```
src/
  components/ui/      Design-System (Button, Card, Dialog, Dropdown, Tabs …)
  components/layout/  Sidebar, Header, Layout
  pages/              Dashboard, Chat, Workflows, Code, API, Plugins, Settings
  plugins/registry.ts Built-in Plugin-Manifeste
  lib/api.ts          OpenAI/Anthropic-Client (Streaming)
  store/              Zustand-State mit Persistenz
  types/              Plugin-, Chat-, Workflow-Typen
marketing/            Instagram-Assets + Captions
```

## Marketing

Assets + Captions (DE/EN, Hashtags) liegen in `marketing/`.
