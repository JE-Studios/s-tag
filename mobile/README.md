# S-TAG Mobile

Capacitor wrapper som pakker S-TAG web-app for iOS og Android app-stores.

## Forutsetninger
- Node 20+
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (`sudo gem install cocoapods`)

## Første gangs oppsett

```bash
cd mobile
npm install
npm run build:web        # Bygger frontend statisk til ./www
npx cap add ios          # Legger til iOS-plattform
npx cap add android      # Legger til Android-plattform
npx cap sync             # Synker web-innhold inn i plattformene
```

## Daglig bruk

```bash
npm run build:web        # Rebuild web innhold
npm run sync             # Kopier til iOS/Android prosjekter
npm run ios:open         # Åpne Xcode
npm run android:open     # Åpne Android Studio
```

## Miljøvariabler

Backend-URL må settes for produksjonsbuild. Lag `frontend/.env.production`:

```
NEXT_PUBLIC_API_URL=https://api.stag.no
```

Under utvikling mot lokal backend:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## NFC chip-integrasjon (når chippen er klar)

```bash
npm install @capacitor-community/nfc
npx cap sync
```

Så i `frontend/app/kartotek/[id]/page.tsx` kan `chip.pair()` erstattes med:

```ts
import { NFC } from '@capacitor-community/nfc';
const tag = await NFC.startScanSession();
await chip.pair(item.id, tag.id);
```

## App Store lansering

### iOS
1. `npm run ios:open` → Xcode
2. Signing & Capabilities → legg til Apple Developer Team
3. Bundle ID: `no.stag.app`
4. Archive → Distribute → App Store Connect

### Android
1. `npm run android:open` → Android Studio
2. Build → Generate Signed Bundle / APK
3. Last opp `.aab` til Google Play Console
