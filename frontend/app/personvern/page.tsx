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
            S-TAG er behandlingsansvarlig for behandlingen av personopplysninger i Tjenesten.
            Selskapet er under formell stiftelse og registrering i Brønnøysundregistrene.
            Firmanavn, organisasjonsnummer og forretningsadresse vil oppdateres her så snart
            registrering er gjennomført, og før offentlig lansering — jf. e-handelsloven §8.
          </p>
          <p>
            Kontakt personvern:{" "}
            <a href="mailto:support@s-tag.no" className="text-[#0f2a5c] font-bold">
              support@s-tag.no
            </a>
            . Henvendelser om innsyn, retting, sletting og klager håndteres av Marianne som
            personvernkontakt. S-TAG har ikke plikt til å utnevne personvernombud (DPO)
            etter GDPR art. 37 i nåværende fase.
          </p>
        </Section>

        <Section title="2. Hvilke personopplysninger vi behandler">
          <ul>
            <li>
              <strong>Kontodata:</strong> navn, e-postadresse, hashet passord (aldri lagret i
              klartekst), opprettelsestidspunkt, språkvalg.
            </li>
            <li>
              <strong>Profildata (valgfritt):</strong> telefonnummer, adresse, postnummer, by,
              profilbilde, forsikringsselskap og polisenummer.
            </li>
            <li>
              <strong>Gjenstandsdata:</strong> navn, beskrivelse, kategori, merke, modell,
              serienummer, farge, verdi, kjøpsdato, bilder og eventuell offentlig kode.
            </li>
            <li>
              <strong>Chip- og posisjonsdata:</strong> unik chip-ID, siste registrerte
              posisjon (bredde-/lengdegrad), batterinivå, tidspunkt for siste ping.
            </li>
            <li>
              <strong>Aktivitetslogg:</strong> hendelser knyttet til gjenstanden, som
              registrering, oppdatering, markering som mistet/funnet og eierskifte.
            </li>
            <li>
              <strong>Samtykker:</strong> om du har akseptert vilkår, personvern, posisjons-
              og markedsføringssamtykker, samt versjonen som ble akseptert.
            </li>
            <li>
              <strong>Funnet-rapporter fra publikum:</strong> finners navn/kontakt (valgfritt),
              melding og posisjon ved innmelding.
            </li>
            <li>
              <strong>Tilbakemeldinger:</strong> henvendelser og meldinger du sender via
              tilbakemeldings- eller kontakt­funksjonen.
            </li>
            <li>
              <strong>Tekniske data:</strong> IP-adresse, tidsstempler og user-agent benyttes
              for sikkerhet, feilsøking og misbruks­forebygging.
            </li>
          </ul>
        </Section>

        <Section title="3. Formål og rettslig grunnlag">
          <ul>
            <li>
              <strong>Levere Tjenesten og oppfylle avtalen</strong> — GDPR art. 6 nr. 1 bokstav b.
            </li>
            <li>
              <strong>Posisjonsdata og markedsføring</strong> — ditt samtykke, art. 6 nr. 1
              bokstav a. Samtykke kan når som helst trekkes tilbake.
            </li>
            <li>
              <strong>Sikkerhet, feilsøking og misbruksforebygging</strong> — berettiget
              interesse, art. 6 nr. 1 bokstav f.
            </li>
            <li>
              <strong>Oppfylle rettslige forpliktelser</strong> (f.eks. regnskap, svar på
              rettskrav) — art. 6 nr. 1 bokstav c.
            </li>
          </ul>
        </Section>

        <Section title="4. Mottakere og databehandlere">
          <p>
            Vi benytter utvalgte databehandlere som leverer infrastruktur og drift. Alle er
            bundet av databehandler­avtale etter GDPR art. 28:
          </p>
          <ul>
            <li>
              <strong>Hosting av backend og database:</strong> Railway Corp. (EU-region,
              Amsterdam). Drifter API-server og Postgres-database.
            </li>
            <li>
              <strong>Hosting av frontend:</strong> Vercel Inc. (EU-region, Frankfurt).
              Serverer webappen.
            </li>
            <li>
              <strong>BankID-signering:</strong> Criipto ApS / Idura (EU, Danmark) —
              leverandør av Criipto Verify som formidler BankID-pålogging og -signering.
              Behandler navn, personidentifikator og signaturbevis kun i signerings­øyeblikket.
            </li>
            <li>
              <strong>Autentisering via Google/Apple (valgfritt):</strong> dersom du velger å
              logge inn med Google eller Apple, behandles e-post og navn fra den aktuelle
              leverandøren for å opprette eller matche kontoen din.
            </li>
          </ul>
          <p>
            Vi selger ikke personopplysninger og deler dem ikke med tredjepart for
            markedsføringsformål.
          </p>
        </Section>

        <Section title="5. Overføring utenfor EU/EØS">
          <p>
            Personopplysninger lagres primært innenfor EU/EØS (Railway: Amsterdam, Vercel:
            Frankfurt, Criipto: Danmark).
          </p>
          <p>
            Dersom du bruker valgfri innlogging med <strong>Google</strong> eller{" "}
            <strong>Apple</strong>, vil en begrenset mengde autentiserings­data (e-post, navn
            og OAuth-token) behandles av Google LLC / Apple Inc. i USA. Overføringen skjer
            på grunnlag av EU-kommisjonens standard­personvernbestemmelser (SCC, art. 46 nr.
            2 bokstav c), supplert med tekniske og organisatoriske tiltak som kreves av GDPR
            kap. V og Schrems II. Begge leverandørene er sertifisert under EU-US Data
            Privacy Framework.
          </p>
          <p>
            Du kan når som helst velge å bruke e-post + passord i stedet for Google eller
            Apple hvis du ikke ønsker denne overføringen.
          </p>
        </Section>

        <Section title="6. Lagringstid">
          <p>
            Vi lagrer personopplysninger så lenge du har en aktiv konto. Når du sletter
            kontoen, slettes eller anonymiseres data normalt innen 30 dager. Enkelte data kan
            oppbevares lenger dersom det er pålagt ved lov (f.eks. bokføringsloven) eller
            nødvendig for å forsvare rettskrav. Logger for sikkerhet og misbruks­forebygging
            slettes innen 12 måneder.
          </p>
        </Section>

        <Section title="7. Dine rettigheter">
          <ul>
            <li>
              <strong>Innsyn:</strong> Du kan be om innsyn i hvilke opplysninger vi behandler
              om deg.
            </li>
            <li>
              <strong>Retting:</strong> Du kan rette opplysninger selv via profilsiden, eller
              kontakte oss.
            </li>
            <li>
              <strong>Sletting:</strong> Du kan slette kontoen og dine data fra Innstillinger →
              Mine data.
            </li>
            <li>
              <strong>Begrensning og innsigelse:</strong> Du kan be om at behandlingen
              begrenses, og gjøre innsigelse mot behandling basert på berettiget interesse.
            </li>
            <li>
              <strong>Dataportabilitet:</strong> Du kan laste ned dine data i et strukturert
              format (JSON) fra Innstillinger → Mine data.
            </li>
            <li>
              <strong>Tilbakekalling av samtykke:</strong> Du kan når som helst trekke tilbake
              samtykker du har gitt, uten at det påvirker lovligheten av behandling før
              tilbake­kallingen.
            </li>
            <li>
              <strong>Klage:</strong> Du kan klage til Datatilsynet (datatilsynet.no) dersom
              du mener behandlingen er i strid med personvern­regelverket.
            </li>
          </ul>
        </Section>

        <Section title="8. Sikkerhet">
          <p>
            Passord hashes med scrypt. All trafikk går over TLS. Data lagres kryptert i hvile
            hos vår hosting-leverandør. Tilgang er begrenset til autorisert personell og
            logges. Vi gjennomfører jevnlige sikkerhetsvurderinger og utbedrer avvik så raskt
            som mulig.
          </p>
        </Section>

        <Section title="9. Posisjonsdata">
          <p>
            S-TAG-chipen er passiv og sender ikke posisjon selv. Posisjonsdata kommer
            fra din enhet når du registrerer, skanner eller rapporterer en gjenstand,
            og fra en finners enhet dersom vedkommende velger å rapportere funn.
          </p>
          <p>
            Vi spør om posisjonssamtykke én gang ved registrering, og behandler
            posisjonsdata kun dersom samtykke er gitt. Rettslig grunnlag: samtykke,
            jf. GDPR art. 6 nr. 1 bokstav a. Du kan når som helst trekke samtykket
            tilbake i Innstillinger → Personvern uten begrunnelse, og uten at det
            påvirker lovligheten av tidligere behandling.
          </p>
          <p>
            Posisjon brukes til: (i) å vise dine gjenstander og hjem-område på kart,
            (ii) å knytte siste kjente posisjon til en gjenstand ved registrering,
            (iii) å dokumentere funnrapporter når noen finner en merket gjenstand.
            Posisjonsdata selges aldri videre og deles ikke med andre brukere utover
            det som er strengt nødvendig for eierskifte- eller funnflyten.
          </p>
        </Section>

        <Section title="10. Informasjonskapsler og lokal lagring">
          <p>
            S-TAG bruker ikke sporings- eller markedsførings-cookies fra tredjepart. Vi lagrer
            kun strengt nødvendige tekniske data i <code>localStorage</code>, herunder
            innlogging­stoken og samtykke-preferanser.
          </p>
        </Section>

        <Section title="11. Barn">
          <p>
            Tjenesten er ikke rettet mot barn under 13 år. Blir vi gjort oppmerksomme på at
            slike kontoer er opprettet uten samtykke fra foresatt, vil de slettes.
          </p>
        </Section>

        <Section title="12. Automatiserte avgjørelser">
          <p>
            Vi foretar ikke automatiserte individuelle avgjørelser eller profilering med
            rettsvirkning for deg.
          </p>
        </Section>

        <Section title="13. Endringer i erklæringen">
          <p>
            Ved vesentlige endringer varsles du i appen eller på e-post. Du må godta ny versjon
            før du fortsetter å bruke Tjenesten dersom endringene krever nytt samtykke.
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
