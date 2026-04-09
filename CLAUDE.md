# S-TAG — Claude Code Instruksjoner

## Om prosjektet

S-TAG er et nasjonalt register for sikring og sporing av eiendeler. Chip-basert tyveriforebygging og digitalt eierskifte. B2B2C-modell: produsenter embedder chip, brukere parer ikke selv.

## Teknisk stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind v4, react-leaflet, framer-motion, zod
- **Backend:** Express 5, PostgreSQL (pg), JWT auth (HS256, scrypt), dotenv, cors
- **Mobile:** Capacitor (Android ferdig, iOS venter)
- **E-post:** Resend (midlertidig avsender: onboarding@resend.dev — bytt til s-tag.no etter DNS-verifisering)
- **Deploy:** Vercel (frontend), Railway (backend)
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
- **Oppdater ALLTID denne filen (CLAUDE.md)** hvis du endrer noe som påvirker deploy, miljøvariabler, nye tjenester, nye begrensninger, eller annen info fremtidige agenter trenger

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

## Produksjonsmiljø

| Tjeneste | URL | Plattform |
|----------|-----|-----------|
| Frontend | https://s-tag-ten.vercel.app | Vercel (auto-deploy fra main) |
| Backend  | https://s-tag-production.up.railway.app | Railway (auto-deploy fra main, root: /backend) |
| Database | PostgreSQL | Railway (tilkoblet via DATABASE_URL) |

### Railway miljøvariabler (backend)

| Variabel | Beskrivelse |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (satt av Railway) |
| `JWT_SECRET` | Hemmelig nøkkel for JWT-signering |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (165312962290-...apps.googleusercontent.com) |
| `RESEND_API_KEY` | API-nøkkel for Resend e-posttjeneste |
| `APP_BASE_URL` | Frontend-URL for lenker i e-post (https://s-tag-ten.vercel.app) |
| `CORS_ORIGINS` | Valgfri: ekstra tillatte CORS-domener (kommaseparert, IKKE bruk wildcard *) |
| `FEEDBACK_FROM` | Valgfri: avsender-adresse for e-post (default: onboarding@resend.dev) |

### Vercel miljøvariabler (frontend)

| Variabel | Beskrivelse |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend-URL (https://s-tag-production.up.railway.app) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID (samme som backend) |

### GitHub Actions (auto-deploy)

Backend deployes automatisk til Railway via GitHub Actions (`.github/workflows/deploy-backend.yml`).
Triggeren er push til main med endringer i `backend/**`. Workflowen bruker Railway CLI med `RAILWAY_TOKEN` GitHub Secret.

Railway sin innebygde git-integrasjon fungerer IKKE pålitelig med squash merges (commit SHA finnes ikke i repo). Derfor bruker vi GitHub Actions i stedet.

**GitHub Secret:** `RAILWAY_TOKEN` — Railway API-token med tilgang til prosjektet. Satt opp 2026-04-09.

### Deploy-notater

- **Vercel** deployer automatisk ved push til main (alle filer)
- **Railway** deployes via GitHub Actions ved push til main (kun backend/**-endringer)
- Backend-kode har produksjons-fallbacks: APP_BASE_URL → Vercel-URL, API_BASE → Railway-URL
- CORS tillater ALDRI wildcard * — kun eksplisitte domener + *.vercel.app preview-deploys

### Kjente begrensninger

- **Resend e-post:** onboarding@resend.dev kan kun sende til kontoeier (eliah.slette@gmail.com). Andre brukere får ikke e-post. Krever domene-verifisering i Resend med eget domene.
- **Apple-innlogging:** Ikke konfigurert. Krever Apple Developer Program ($99/år) + ID-verifisering.
- **Branch protection:** Ruleset ID 14845507. Må slås av midlertidig for merge, deretter aktiveres igjen.

### GitHub branch protection (automatisering)

```bash
# Deaktiver
gh api repos/JE-Studios/s-tag/rulesets/14845507 --method PUT --field enforcement=disabled
# Merge PR
gh pr merge <nr> --squash --delete-branch
# Aktiver
gh api repos/JE-Studios/s-tag/rulesets/14845507 --method PUT --field enforcement=active
```

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
