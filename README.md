# S-TAG

Nasjonalt register for sikring og sporing av eiendeler. Chip-basert tyveriforebygging og digitalt eierskifte.

## Struktur

```
backend/    Express + Postgres API (deployer til Railway)
frontend/   Next.js 16 + Tailwind v4 (deployer til Vercel)
mobile/     Capacitor wrapper for iOS/Android app stores
```

## Lokal utvikling

```bash
# Backend
cd backend && npm install && node server.js
# Kjører på http://localhost:4000 med JSON-fil som store (ingen DB påkrevd)

# Frontend (i nytt terminal-vindu)
cd frontend && npm install && npm run dev
# Kjører på http://localhost:3000
```

## Lansering

Se [LAUNCH.md](./LAUNCH.md) for full deploy-guide til Vercel + Railway + Google Play + App Store.

## Arkitektur

- **Auth**: JWT (HS256, Node crypto, ingen eksterne deps), scrypt password hashing, OAuth-login
- **Database**: Postgres i prod (via `DATABASE_URL`), JSON-fallback lokalt
- **API**: REST under `/api/*` med Bearer token
- **Chip**: Klart for NFC/BLE — bytt mock-UID i `frontend/app/kartotek/detalj/page.tsx` mot `@capacitor-community/nfc` når hardware er klar

## Status

- [x] Backend med auth, items, transfers, chip-endepunkter
- [x] Landingsside + login + registrering + hjem-dashboard
- [x] OAuth-login, innstillinger, personvern, vilkår, varsler, funnet-melding
- [x] Sporing med kart (react-leaflet)
- [x] Eierskifte med signatur-callback
- [x] Static export for mobile wrapper
- [x] Android-plattform + ikon/splash generert
- [x] Deploy til Vercel — [s-tag-hazel.vercel.app](https://s-tag-hazel.vercel.app)
- [ ] Deploy til Railway (venter på konto)
- [ ] Domene
- [ ] iOS-plattform (venter på Xcode + Apple Developer)
