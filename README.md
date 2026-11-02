# GeneaTrace – frontend (React)

The web app for GeneaTrace, a blockchain product passport for everything: consumer verification, the partner console, the process scanner, retail desk, service cases and ledger explorer.

- React 18 + Vite + Tailwind
- Talks to the GeneaTrace backend (Next.js, repository `GeneaTrace_Backend`) over `/api/...`
- `VITE_API_URL` sets the backend address (`.env.production` points to `https://geneatrace-api.azurewebsites.net`); in development Vite proxies `/api` to `http://localhost:8080`

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Demo sign-ins (username / password) are shown on the sign-in page when the backend runs with `DEMO_MODE=true`.
