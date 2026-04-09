# S-TAG — Claude Code Instruksjoner

## Om prosjektet

S-TAG er et nasjonalt register for sikring og sporing av eiendeler. Chip-basert tyveriforebygging og digitalt eierskifte. B2B2C-modell: produsenter embedder chip, brukere parer ikke selv.

## Teknisk stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind v4, react-leaflet, framer-motion, zod
- **Backend:** Express 5, PostgreSQL (pg), JWT auth (HS256, scrypt), dotenv, cors
- **Mobile:** Capacitor (Android ferdig, iOS venter)
- **Deploy:** Vercel (frontend), Railway (backend, venter)
- **Repo:** github.com/JE-Studios/s-tag (privat, branch-beskyttet)

## Filstruktur

```
backend/          Express API + Postgres
  server.js       Alle endepunkter
  db.js           Postgres/JSON-fallback datalag
  schema.sql      Database-skjema (IKKE endre uten eksplisitt godkjenning)
frontend/         Next.js 16 app
  app/            App Router sider og komponenter
  app/lib/        Delte utilities (api.ts, auth-context.tsx)
  app/components/ Gjenbrukbare komponenter (TopBar, BottomNav, OAuthButtons)
mobile/           Capacitor wrapper
```

## Viktige filer (vær ekstra forsiktig med disse)

- `backend/schema.sql` — Database-skjema. Endringer her kan ødelegge eksisterende data.
- `backend/server.js` — Alle API-endepunkter. Endringer påvirker hele appen.
- `frontend/app/lib/api.ts` — API-klient. Brukes av ALLE sider.
- `frontend/app/lib/auth-context.tsx` — Auth state. Hvis denne brytes, kastes alle brukere ut.
- `.env.example` — Env-variabler. Må stemme med produksjonsmiljøet.

## Regler

### Generelt
- Skriv all kode på engelsk, all UI-tekst på norsk (bokmål)
- Bruk TypeScript for alt i frontend
- Ikke installer nye npm-pakker uten god grunn
- Hver endring = én feature branch + én PR. Aldri push direkte til main.

### Sikkerhet
- ALDRI hardkod API-nøkler, secrets eller credentials
- ALDRI commit .env-filer
- Valider all brukerinput på serversiden (backend/server.js)
- Bruk parameteriserte queries mot Postgres (aldri string-concat i SQL)

### Når du endrer kode
- Les ALLTID filen du skal endre FØR du endrer den
- Sjekk om funksjoner/komponenter du fjerner brukes andre steder (grep i kodebasen)
- Ikke slett eller skriv om eksisterende funksjonalitet med mindre det er eksplisitt bedt om
- Behold eksisterende API-kontrakter (response-format, HTTP-metoder, URL-er)
- Test endringene lokalt før du committer

### Commit og PR
- Skriv commit-meldinger på norsk
- En PR per feature/bugfix
- Beskriv HVA du endret og HVORFOR i PR-beskrivelsen

## Lokal utvikling

```bash
# Backend (terminal 1)
cd backend && npm install && node server.js
# Kjører på http://localhost:4000

# Frontend (terminal 2)
cd frontend && npm install && npm run dev
# Kjører på http://localhost:3000
```

## Team

- **Eliah** (@eliahslette) — Grunnlegger, hovedutvikler, godkjenner alle PRs
- **Jonah** (@JonahSlette) — Medgrunnlegger, bidragsyter via Claude Code
