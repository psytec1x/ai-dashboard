# Clone this repo, then:

1. Copy `.env.example` to `.env` and add your Clerk key
2. Install: `npm ci`
3. Dev: `npm run dev`
4. Build: `npm run build`
5. Smoke test: `npm run smoke` (verifies production output)

## Deploy to Cloudflare Pages

### Option A — Cloudflare Dashboard (no CLI)
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create
2. Connect to GitHub → select `psytec1x/ai-dashboard`
3. Build command: `npm run build` | Output: `dist`
4. Under **Settings → Environment Variables**, add:
   - `VITE_CLERK_PUBLISHABLE_KEY` = your Clerk key
5. Deploy → your app at `ai-dashboard.pages.dev`

### Option B — Wrangler CLI (local)
```bash
wrangler login
wrangler pages deploy --project-name ai-dashboard --commit-hash main --output-dir dist
```

### Option C — GitHub Actions (auto on push)
1. In Cloudflare, create a API Token (`account:read`, `workers:write`, `pages:read`, `pages:write`)
2. In GitHub repo → Settings → Secrets → Variables:
   - `CLOUDFLARE_API_TOKEN` = your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` = your Cloudflare account ID
   - `VITE_CLERK_PUBLISHABLE_KEY` = your Clerk key
3. Push to `main` → workflow auto-deploys

## Clerk Setup (required)
1. [dashboard.clerk.com](https://dashboard.clerk.com) → Create Application → Test
2. Copy the **Publishable Key**
3. Add to `.env` or Cloudflare Pages → Settings → Environment Variables

## Quick Start
```bash
git clone https://github.com/psytec1x/ai-dashboard.git
cd ai-dashboard
cp .env.example .env
# Edit .env → add VITE_CLERK_PUBLISHABLE_KEY
npm ci && npm run dev
```
