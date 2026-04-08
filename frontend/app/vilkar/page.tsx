"use client";
import TopBar from "../components/TopBar";
import Link from "next/link";

export default function VilkarPage() {
  return (
    <>
      <TopBar showBack title="Vilkår" />
      <main className="pt-28 pb-40 px-6 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Brukervilkår
        </h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8">
          Sist oppdatert: April 2026
        </p>

        <Section title="1. Om tjenesten">
          <p>
            S-TAG er et digitalt register for sikring, sporing og eierskifte av dine eiendeler.
            Tjenesten tilbys som en web-app og mobil-app.
          </p>
        </Section>

        <Section title="2. Konto">
          <p>
            Du må være 15 år eller eldre for å opprette konto. Du er ansvarlig for å beskytte
            passordet ditt og for all aktivitet på kontoen din. Kontakt oss umiddelbart hvis du
            mistenker uautorisert tilgang.
          </p>
        </Section>

        <Section title="3. Bruk av tjenesten">
          <p>
            Du forplikter deg til å bruke tjenesten i samsvar med norsk lov. Du får ikke:
          </p>
          <ul>
            <li>Registrere gjenstander du ikke eier eller har rett til å registrere</li>
            <li>Forsøke å omgå sikkerhetsmekanismer eller tilgangskontroll</li>
            <li>Bruke tjenesten til å trakassere, true eller forfølge andre personer</li>
            <li>Laste opp ulovlig, krenkende eller villedende innhold</li>
          </ul>
        </Section>

        <Section title="4. S-TAG chip">
          <p>
            S-TAG chip er et fysisk NFC/BLE-tag som kan pares med en registrert gjenstand. Chip-en
            sender posisjonsdata når den er i nærheten av en kompatibel gateway. Vi garanterer ikke
            at chip-en alltid er dekket av gateway-nettverket.
          </p>
        </Section>

        <Section title="5. Eierskifte">
          <p>
            Når du overfører eierskap til en annen S-TAG bruker blir den nye eieren ansvarlig for
            gjenstanden. Tidligere eier mister tilgang til sporingsdata og historikk.
          </p>
        </Section>

        <Section title="6. Ansvarsfraskrivelse">
          <p>
            S-TAG er et hjelpemiddel og erstatter ikke forsikring eller politianmeldelse. Vi
            fraskriver oss ansvar for tap av eiendeler, feilaktige posisjonsdata eller konsekvenser
            av bruk utenfor tjenestens tiltenkte formål, så langt loven tillater.
          </p>
        </Section>

        <Section title="7. Oppsigelse">
          <p>
            Du kan slette kontoen din når som helst fra Innstillinger → Mine data. Vi kan stenge
            kontoer som bryter disse vilkårene, med eller uten forhåndsvarsel.
          </p>
        </Section>

        <Section title="8. Endringer">
          <p>
            Vi kan endre vilkårene med 30 dagers varsel. Fortsatt bruk etter at endringene trer i
            kraft regnes som aksept av de nye vilkårene.
          </p>
        </Section>

        <Section title="9. Lovvalg">
          <p>
            Disse vilkårene reguleres av norsk lov. Tvister skal behandles ved Oslo tingrett.
          </p>
        </Section>

        <div className="mt-12 text-center">
          <Link href="/personvern" className="text-[#0f2a5c] font-bold hover:underline">
            ← Les personvernerklæringen
          </Link>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="text-slate-600 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
