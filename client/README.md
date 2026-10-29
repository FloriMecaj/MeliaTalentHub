# Meliá Talent Hub

Next.js 16 (App Router) + shadcn/ui (Base UI) + Tailwind 4. No separate backend: data lives in the
browser's `localStorage` and the session in a cookie, so every visitor gets their own demo.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run build && npm start
```

Demo logins: `admin@melia.al / admin123`, `student@melia.al / student123`.
Administrator registration code: `MELIA2026`.

## Deploy to Vercel

This app lives in the `client/` folder of the repository.

1. Push the repo to GitHub and import it in Vercel.
2. **Root Directory: `client`** (Project Settings → General). Framework preset: Next.js (auto-detected).
3. Build command, output directory and install command: leave the defaults. Node 20.9+ (set in `engines`).
4. Optional env var `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-domain.com`) for absolute metadata URLs.
   On Vercel the production URL is picked up automatically.

No other environment variables are required.

### Limits of this demo build
- Data is per-browser (localStorage). Nothing is shared between users or devices.
- WhatsApp sending is simulated; passwords are hashed client-side (demo-grade only).
- Use Admin → Settings to back up, restore or reset the demo data.
