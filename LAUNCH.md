# S-TAG lanseringsguide

Alt som må gjøres fra koden er ferdig. Denne guiden er de manuelle stegene — alle krever kontoer/maskiner du må være innlogget på selv.

---

## 1. Backend → Railway (Postgres + Node)

### Engangs-oppsett
1. **Opprett Railway-konto**: https://railway.app (logg inn med GitHub)
2. **Initier git + push til GitHub** (hvis ikke allerede gjort):
   ```bash
   cd "/Users/eliahslette/Library/Mobile Documents/com~apple~CloudDocs/S-Tag"
   git init
   git add .
   git commit -m "Initial S-TAG launch"
   # Lag repo på github.com/new, så:
   git remote add origin https://github.com/DITT-BRUKERNAVN/s-tag.git
   git push -u origin main
   ```
3. **I Railway dashboard**:
   - New Project → Deploy from GitHub repo → velg `s-tag`
   - Velg rot-mappe: `backend`
   - Railway oppdager Node automatisk via `railway.json`
4. **Legg til Postgres**:
   - I samme Railway-prosjekt: + New → Database → Add PostgreSQL
   - Railway lager automatisk `DATABASE_URL` variable og kobler den til backend-tjenesten
5. **Sett environment variables** (Backend service → Variables):
   ```
   JWT_SECRET=<generer med: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
   CORS_ORIGINS=https://stag.no,https://www.stag.no
   ```
   (`DATABASE_URL` settes automatisk)
6. **Deploy** kjører automatisk. Skjemaet kjøres via `initSchema()` ved oppstart.
7. **Få URL-en**: Settings → Networking → Generate Domain → noter `xxxxx.up.railway.app`

### Verifiser
```bash
curl https://xxxxx.up.railway.app/api/health
# Skal returnere: {"status":"ok","store":"postgres",...}
```

---

## 2. Frontend → Vercel

### Engangs-oppsett
1. **Opprett Vercel-konto**: https://vercel.com (logg inn med GitHub)
2. **Import project**:
   - Add New → Project → velg `s-tag` repo
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detektert)
3. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL = https://xxxxx.up.railway.app
   ```
   (bruk Railway-URL-en fra steg 1 — senere byttes til `https://api.stag.no`)
4. **Deploy** — første build tar ~2 min
5. **Få URL-en**: `s-tag-xxx.vercel.app`

### Verifiser
Gå til Vercel-URL → landingside vises → klikk "Kom i gang" → registrer → se at du havner på /hjem.

---

## 3. Domene (stag.no eller hva du eier)

### Hos domeneregistrar (Domeneshop / GoDaddy / etc.)
Legg til DNS-poster:

```
Type    Navn    Verdi                          TTL
A       @       76.76.21.21                    3600   (Vercel apex)
CNAME   www     cname.vercel-dns.com           3600   (Vercel www)
CNAME   api     xxxxx.up.railway.app           3600   (Railway backend)
```

### I Vercel
- Project Settings → Domains → Add → `stag.no` og `www.stag.no`
- Vercel verifiserer DNS automatisk

### I Railway
- Backend service → Settings → Networking → Custom Domain → `api.stag.no`
- Railway gir deg CNAME-verdi (matcher tabellen over)

### Oppdater env vars
- **Vercel**: `NEXT_PUBLIC_API_URL = https://api.stag.no`
- **Railway**: `CORS_ORIGINS = https://stag.no,https://www.stag.no`
- Begge trigger re-deploy automatisk

---

## 4. Android → Google Play

### Engangs
1. **Installer Android Studio**: https://developer.android.com/studio
2. **Opprett Google Play Console-konto** ($25 engangs): https://play.google.com/console

### Bygge signed bundle
```bash
cd "/Users/eliahslette/Library/Mobile Documents/com~apple~CloudDocs/S-Tag/mobile"

# 1. Oppdater frontend env for prod-API
echo 'NEXT_PUBLIC_API_URL=https://api.stag.no' > ../frontend/.env.production

# 2. Bygg web-innholdet statisk
npm run build:web

# 3. Synk inn i Android-prosjektet
npm run sync

# 4. Åpne i Android Studio
npm run android:open
```

I Android Studio:
1. **Build → Generate Signed Bundle / APK → Android App Bundle**
2. Lag en ny keystore første gang (OPPBEVAR TRYGT — tap = du kan aldri oppdatere appen igjen)
3. Build release → `.aab`-fil havner i `mobile/android/app/release/`

### Last opp til Play Console
1. Create app → Internal testing (for første test) → Upload `.aab`
2. Fyll ut Store listing: navn, ikon, beskrivelse, screenshots
3. Production → Review → Submit (Google trenger 1–7 dager for gjennomgang)

---

## 5. iOS → App Store (når Apple Developer-abonnement er kjøpt)

### Forutsetninger
1. **Xcode** fra Mac App Store (`xcode-select: error` nå fordi bare Command Line Tools er installert)
2. **CocoaPods**: `sudo gem install cocoapods`
3. **Apple Developer Program**: $99/år på https://developer.apple.com/programs/

### Legg til iOS-plattform (gjøres én gang)
```bash
cd "/Users/eliahslette/Library/Mobile Documents/com~apple~CloudDocs/S-Tag/mobile"
npx cap add ios
npx capacitor-assets generate --ios
npm run sync
npm run ios:open
```

### I Xcode
1. **Signing & Capabilities** → velg Apple Developer Team → Bundle ID: `no.stag.app`
2. **Product → Archive** → Distribute App → App Store Connect
3. Logg inn på App Store Connect → TestFlight først, så Production

---

## 6. NFC-chip (når hardware er klar)

Ingenting i kodebasen må endres med mindre du bytter ut mock-UID-generatoren:

```bash
cd mobile
npm install @capacitor-community/nfc
npx cap sync
```

I `frontend/app/kartotek/detalj/page.tsx`, bytt:
```ts
const mockUid = "CHIP-" + Math.random().toString(36).slice(2, 10).toUpperCase();
```
med:
```ts
import { NFC } from '@capacitor-community/nfc';
const tag = await NFC.startScanSession();
const mockUid = tag.id;
```

Backend-endepunktet `/api/chip/ping` er allerede klart til å ta imot meldinger fra fysisk chip/gateway. Legg til HMAC-signaturvalidering der før produksjon.

---

## Sjekkliste for lanseringsdag

- [ ] Railway backend svarer på `/api/health` med `"store":"postgres"`
- [ ] Vercel viser landingside på custom domene
- [ ] Registrering + login fungerer mot prod-backend
- [ ] Opprett test-gjenstand → ser den i kartotek + på kart
- [ ] Par mock-chip → status endres
- [ ] Testfly Android APK på egen telefon før Play-opplasting
- [ ] `JWT_SECRET` er byttet fra dev-default
- [ ] `CORS_ORIGINS` er låst til prod-domener
- [ ] `.env*`-filer er ikke committed til git (sjekk `git status`)

---

## Nødkontakter / rollback

- **Vercel**: Deployments-fanen → "Promote" gammel versjon
- **Railway**: Deployments → klikk tidligere → Redeploy
- **Database-backup**: Railway Postgres → Backups (daglig automatisk på betalt plan)
