"use client";
import TopBar from "../components/TopBar";
import Link from "next/link";

export default function PersonvernPage() {
  return (
    <>
      <TopBar showBack title="Personvern" />
      <main className="pt-28 pb-40 px-6 max-w-2xl mx-auto prose prose-slate">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Personvernerklæring
        </h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8">
          Sist oppdatert: April 2026 · Versjon 2026-04
        </p>

        <Section title="1. Behandlingsansvarlig">
          <p>
            S-TAG er ansvarlig for behandlingen av dine personopplysninger i denne tjenesten.
            Du kan kontakte oss via{" "}
            <Link href="/kontakt" className="text-[#0f2a5c] font-bold">
              innstillinger
            </Link>{" "}
            eller på e-post til <span className="font-mono">personvern@s-tag.no</span>.
          </p>
        </Section>

        <Section title="2. Hvilke data samler vi inn?">
          <ul>
            <li>
              <strong>Kontodata:</strong> e-post, navn, hashet passord (aldri klartekst).
            </li>
            <li>
              <strong>Profildata (valgfritt):</strong> telefon, adresse, forsikringsinfo.
            </li>
            <li>
              <strong>Eiendeler:</strong> navn, merke, modell, serienummer, verdi, bilder du laster opp.
            </li>
            <li>
              <strong>Posisjonsdata:</strong> kun hvis du eksplisitt har gitt samtykke. Brukes til
              sporing av S-TAG chip og funnet-rapporter.
            </li>
            <li>
              <strong>Aktivitetslogg:</strong> hendelser som paring av chip, eierskifte, status­endringer.
            </li>
          </ul>
        </Section>

        <Section title="3. Rettslig grunnlag">
          <p>
            Vi behandler data basert på (i) avtalen du inngår når du oppretter konto, (ii) ditt
            samtykke for posisjons- og markedsføringsdata, og (iii) vår berettigede interesse i
            å forebygge misbruk av tjenesten.
          </p>
        </Section>

        <Section title="4. Dine rettigheter (GDPR)">
          <ul>
            <li>
              <strong>Innsyn:</strong> Du kan til enhver tid se hvilke data vi har om deg.
            </li>
            <li>
              <strong>Dataportabilitet:</strong> Last ned alle dine data som JSON fra Innstillinger → Mine data.
            </li>
            <li>
              <strong>Retting:</strong> Du kan rette opplysninger fra profil-siden.
            </li>
            <li>
              <strong>Sletting:</strong> Du kan slette hele kontoen permanent fra Innstillinger → Mine data.
            </li>
            <li>
              <strong>Begrensning og innsigelse:</strong> Kontakt oss så håndterer vi forespørselen.
            </li>
            <li>
              <strong>Klage:</strong> Du kan klage til Datatilsynet.
            </li>
          </ul>
        </Section>

        <Section title="5. Lagring og sikkerhet">
          <p>
            Data lagres i Postgres hos Railway (EU-region). Passord hashes med scrypt. All
            kommunikasjon går over TLS. Vi deler aldri dine data med tredjepart for markedsføring.
          </p>
        </Section>

        <Section title="6. Posisjonsdata">
          <p>
            Posisjon hentes kun når du eksplisitt aktiverer dette. Du kan når som helst slå det av i
            Innstillinger → Personvern. Posisjon brukes til å vise dine gjenstander på kartet og
            for å vedlegge posisjon når en finder rapporterer funn.
          </p>
        </Section>

        <Section title="7. Informasjonskapsler">
          <p>
            S-TAG lagrer kun tekniske innstillinger i <code>localStorage</code> (innloggings­token
            og samtykke-preferanser). Vi bruker ingen sporings-cookies eller analyse fra tredjepart.
          </p>
        </Section>

        <Section title="8. Endringer">
          <p>
            Vi kan oppdatere denne erklæringen. Vesentlige endringer varsles i appen, og du må
            godta ny versjon før du fortsetter å bruke tjenesten.
          </p>
        </Section>

        <div className="mt-12 text-center">
          <Link href="/vilkar" className="text-[#0f2a5c] font-bold hover:underline">
            Les også brukervilkårene →
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
