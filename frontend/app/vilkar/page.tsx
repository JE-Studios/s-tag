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
          Sist oppdatert: April 2026 · Versjon 2026-04
        </p>

        <Section title="1. Parter og tjenesten">
          <p>
            Disse brukervilkårene («Vilkårene») gjelder mellom deg som bruker («Brukeren», «du»)
            og S-TAG («vi», «oss»). S-TAG leverer en digital tjeneste for registrering,
            sporing, gjenkjenning og eierskifte av gjenstander som er merket med en innebygd
            S-TAG-chip («Tjenesten»), tilgjengelig som web-app og mobilapp. Tjenesten er
            helt gratis å bruke for sluttbrukere.
          </p>
          <p>
            Før offentlig lansering registreres S-TAG som selskap i Brønnøysundregistrene, og
            firmanavn, organisasjonsnummer og forretningsadresse oppdateres her i samsvar med
            e-handelsloven §8.
          </p>
          <p>
            Kontakt:{" "}
            <a href="mailto:marianne@s-tag.no" className="text-[#0f2a5c] font-bold">
              marianne@s-tag.no
            </a>
            .
          </p>
        </Section>

        <Section title="2. Avtaleinngåelse og aksept">
          <p>
            Avtalen inngås når du registrerer en konto og aktivt huker av for aksept av disse
            Vilkårene og vår personvernerklæring. Du må være minst 13 år for å opprette konto.
            Er du under myndighetsalder, bekrefter du at du har samtykke fra foresatt for å
            benytte Tjenesten.
          </p>
        </Section>

        <Section title="3. Konto og sikkerhet">
          <p>
            Du er ansvarlig for å oppgi korrekte opplysninger ved registrering, holde passord og
            innloggingsmidler hemmelige, og varsle oss umiddelbart ved mistanke om uautorisert
            tilgang til kontoen din. Vi kan midlertidig sperre kontoer ved mistanke om misbruk.
          </p>
        </Section>

        <Section title="4. S-TAG-chip og registrering">
          <p>
            S-TAG-chipen er en fysisk NFC/BLE-komponent som støpes eller integreres i produktet
            av produsenten under produksjon. Som sluttbruker parer du ikke chipen selv — du
            registrerer produktet ved å knytte den unike S-TAG-koden (trykket, QR-merket eller
            NFC-lesbar) til din konto i Tjenesten.
          </p>
          <p>
            Chipen rapporterer posisjon når den er innenfor rekkevidde av et kompatibelt S-TAG-
            eller mobil-gateway. Vi garanterer ikke full dekning til enhver tid, ei heller at
            en mistet gjenstand gjenfinnes. Tjenesten erstatter ikke politianmeldelse eller
            forsikring.
          </p>
        </Section>

        <Section title="5. Brukerens plikter">
          <p>Ved bruk av Tjenesten forplikter du deg til å:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kun registrere gjenstander du rettmessig eier eller har fullmakt til å registrere</li>
            <li>Ikke bruke Tjenesten til trakassering, forfølgelse eller ulovlig overvåking av personer</li>
            <li>Ikke laste opp ulovlig, krenkende, villedende eller tredjepartsbeskyttet innhold</li>
            <li>Ikke forsøke å omgå sikkerhets- eller tilgangsmekanismer, reversere kode, eller forstyrre driften</li>
            <li>Ikke bruke Tjenesten til automatisk datainnhenting utover det API-et tillater</li>
          </ul>
          <p>
            Brudd kan medføre stenging av konto og erstatningsansvar etter alminnelige regler.
          </p>
        </Section>

        <Section title="6. Eierskifte">
          <p>
            Du kan overføre eierskap til en annen S-TAG-bruker via Tjenesten. Etter gjennomført
            overføring mister tidligere eier tilgang til gjenstandens sporings­data og historikk.
            S-TAG kontrollerer ikke det underliggende kjøpet mellom partene og er ikke part i
            eventuelle tvister mellom selger og kjøper.
          </p>
        </Section>

        <Section title="7. Pris">
          <p>
            Tjenesten er helt gratis for deg som sluttbruker. Det finnes ingen abonnement,
            ingen betalte versjoner og ingen skjulte gebyrer. Kostnaden for S-TAG-chipen
            dekkes av produsenten som støper den inn i produktet under produksjon.
          </p>
        </Section>

        <Section title="8. Immaterielle rettigheter">
          <p>
            Alle rettigheter til Tjenesten, inkludert kildekode, design, varemerker og innhold
            vi selv publiserer, tilhører S-TAG eller våre lisensgivere. Du får en ikke-eksklusiv,
            ikke-overførbar bruksrett så lenge avtalen består. Innhold du selv laster opp
            beholder du rettighetene til, men gir oss en nødvendig bruksrett til å levere
            Tjenesten.
          </p>
        </Section>

        <Section title="9. Personvern">
          <p>
            Behandling av personopplysninger er beskrevet i vår{" "}
            <Link href="/personvern" className="text-[#0f2a5c] font-bold">
              personvernerklæring
            </Link>
            , som er en integrert del av disse Vilkårene.
          </p>
        </Section>

        <Section title="10. Ansvarsbegrensning">
          <p>
            Tjenesten leveres «som den er». Vi tilstreber stabil drift, men garanterer ikke
            feilfri eller uavbrutt tilgjengelighet, nøyaktighet av posisjonsdata, eller at
            mistede gjenstander gjenfinnes.
          </p>
          <p>
            Siden Tjenesten leveres gratis til sluttbruker, er vårt ansvar – så langt loven
            tillater – begrenset til direkte, påregnelig tap. Vi svarer ikke for indirekte
            tap, herunder tap av data, tapt fortjeneste eller tap som følge av at tredjepart
            har tilegnet seg gjenstanden.
          </p>
          <p>
            Begrensningene gjelder ikke ved grov uaktsomhet eller forsett fra vår side, og
            berører ikke dine ufravikelige rettigheter som forbruker etter norsk lov.
          </p>
        </Section>

        <Section title="11. Mislighold og stenging">
          <p>
            Ved vesentlig brudd på Vilkårene kan vi, etter skriftlig varsel der det er mulig,
            midlertidig eller permanent stenge kontoen din. Ved mistanke om ulovlig aktivitet
            eller fare for andre brukere kan stenging skje uten forhåndsvarsel.
          </p>
        </Section>

        <Section title="12. Oppsigelse">
          <p>
            Du kan når som helst avslutte avtalen ved å slette kontoen din fra Innstillinger →
            Mine data. Sletting er permanent og kan ikke angres. Enkelte opplysninger kan
            lovlig oppbevares kort tid etter sletting av hensyn til regnskap, tvisteløsning
            eller rettskrav.
          </p>
        </Section>

        <Section title="13. Force majeure">
          <p>
            Vi er ikke ansvarlige for manglende eller mangelfull oppfyllelse som skyldes
            forhold utenfor vår rimelige kontroll, herunder strømbrudd, nettverksfeil,
            myndighetspålegg, krig, pandemi eller svikt hos tredjeparts­leverandører.
          </p>
        </Section>

        <Section title="14. Endringer i vilkårene">
          <p>
            Vi kan endre Vilkårene. Vesentlige endringer varsles i appen eller på e-post minst
            30 dager før ikrafttredelse. Fortsatt bruk etter ikrafttredelse regnes som aksept.
            Godtar du ikke endringene, kan du si opp avtalen ved å slette kontoen.
          </p>
        </Section>

        <Section title="15. Klager og tvisteløsning">
          <p>
            Har du en klage, ta kontakt med oss først på{" "}
            <a href="mailto:marianne@s-tag.no" className="text-[#0f2a5c] font-bold">
              marianne@s-tag.no
            </a>
            . Vi tilstreber å svare innen 14 dager. Som forbruker kan du også klage til
            Forbrukertilsynet eller bringe saken inn for Forbruker­klage­utvalget.
          </p>
        </Section>

        <Section title="16. Lovvalg og verneting">
          <p>
            Avtalen reguleres av norsk rett. Tvister søkes løst i minnelighet. Dersom enighet
            ikke oppnås, kan saken bringes inn for de alminnelige domstoler.
          </p>
          <p>
            Er du forbruker, kan du alltid anlegge sak ved ditt eget hjemting i samsvar med
            tvisteloven § 4-4. Vi kan ikke påtvinge forbrukere et annet verneting enn det som
            følger av ufravikelig lov.
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
