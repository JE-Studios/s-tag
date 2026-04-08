"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "./lib/auth-context";

const features = [
  {
    icon: "memory",
    title: "Innebygd fra fabrikken",
    desc: "Produsenter av sykler, ski, elsparkesykler, verktøy og elektronikk støper S-TAG-chipen inn i produktet under produksjon. Du kan verken miste, bytte eller fjerne den.",
  },
  {
    icon: "qr_code_scanner",
    title: "Registrering på sekunder",
    desc: "Når du kjøper produktet får du en unik S-TAG-kode. Skann den eller skriv den inn i appen, så er eierskapet ditt – digitalt og juridisk.",
  },
  {
    icon: "location_on",
    title: "Live sporing",
    desc: "Hvis sykkelen eller skiene blir borte ser du siste posisjon i sanntid på kartet. Chipen rapporterer så lenge den har signal mot et S-TAG- eller mobil-gateway.",
  },
  {
    icon: "swap_horiz",
    title: "Eierskifte i appen",
    desc: "Selger du brukt? Overfør eierskapet digitalt på sekunder. Kjøper får verifisert at produktet ikke er meldt stjålet før han betaler.",
  },
  {
    icon: "verified_user",
    title: "Nasjonalt register",
    desc: "Alle S-TAG-merkede gjenstander er søkbare. Finner du en etterlatt sykkel med S-TAG? Skann den og varsle eier anonymt via offentlig kode.",
  },
  {
    icon: "handshake",
    title: "For produsenter",
    desc: "Vi leverer chip, API og sertifisering til merkevarer som vil gi sine kunder livstids sikring og gjenkjenning rett ut av boksen.",
  },
];

const steps = [
  {
    n: "01",
    title: "Kjøp et S-TAG-merket produkt",
    desc: "Utvalgte sykler, ski, elsparkesykler, verktøy og elektronikk leveres med en innstøpt S-TAG-chip fra produsenten.",
  },
  {
    n: "02",
    title: "Registrer S-TAG-koden i appen",
    desc: "På kvitteringen, emballasjen eller produktet finner du en unik S-TAG-kode. Legg den inn i appen – du er nå registrert eier.",
  },
  {
    n: "03",
    title: "Spor, rapporter og overfør",
    desc: "Se posisjon, marker som mistet hvis noe forsvinner, eller overfør eierskapet til en kjøper når du selger brukt.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="S-TAG" width={40} height={28} className="object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#funksjoner" className="hover:text-slate-900 transition">Funksjoner</a>
            <a href="#slik-fungerer-det" className="hover:text-slate-900 transition">Slik fungerer det</a>
            <a href="#faq" className="hover:text-slate-900 transition">FAQ</a>
            <a href="#kontakt" className="hover:text-slate-900 transition">Kontakt</a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/hjem"
                className="px-5 py-2 rounded-full bg-[#0f2a5c] text-white text-sm font-bold hover:bg-[#1a3d7c] transition"
              >
                Åpne app
              </Link>
            ) : (
              <>
                <Link href="/logg-inn" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
                  Logg inn
                </Link>
                <Link
                  href="/registrer"
                  className="px-5 py-2 rounded-full bg-[#0f2a5c] text-white text-sm font-bold hover:bg-[#1a3d7c] transition"
                >
                  Kom i gang
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <Image
              src="/logo.png"
              alt="S-TAG"
              width={180}
              height={130}
              priority
              className="object-contain mx-auto"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-widest uppercase mb-6">
              ● Gratis for sluttbrukere
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6">
              Innebygd i produktet.
              <br />
              <span className="bg-gradient-to-r from-[#0f2a5c] to-[#2563eb] bg-clip-text text-transparent">
                Sikret for livet.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              S-TAG-chipen støpes inn i sykler, ski, elsparkesykler, verktøy og elektronikk
              av produsenten. Du registrerer den unike koden i appen – og gjenstanden er
              dokumentert, sporbar og gjenkjennbar for alltid.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={user ? "/hjem" : "/registrer"}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#0f2a5c] text-white text-base font-bold hover:bg-[#1a3d7c] transition shadow-lg shadow-[#0f2a5c]/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                {user ? "Åpne mitt dashboard" : "Opprett konto"}
              </Link>
              <a
                href="#slik-fungerer-det"
                className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-slate-200 text-slate-700 text-base font-bold hover:bg-slate-50 transition"
              >
                Se hvordan det fungerer
              </a>
            </div>
            <p className="mt-6 text-xs text-slate-400 tracking-wide">
              Tilgjengelig på iOS, Android og web · Helt gratis · Ingen kredittkort
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="funksjoner" className="py-24 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-[#0f2a5c]">Funksjoner</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-3">
              Alt du trenger for å beskytte det du eier
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0f2a5c] flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {f.icon}
                  </span>
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="slik-fungerer-det" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-[#0f2a5c]">Slik fungerer det</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-3">
              Fra kassen til beskyttet på under ett minutt
            </h2>
            <p className="mt-4 text-slate-600 max-w-xl mx-auto">
              Chipen er allerede i produktet når du kjøper det. Du trenger ingen skruing,
              pairing eller hardware – bare S-TAG-koden som følger med.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-6xl font-black text-[#0f2a5c]/10 mb-2">{step.n}</div>
                <h3 className="text-xl font-black mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-[#0f2a5c]">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-3">Ofte stilte spørsmål</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Hva er en S-TAG-chip?",
                a: "En liten NFC/BLE-chip som støpes eller integreres inn i produktet under produksjon. Den er usynlig fra utsiden, kan ikke fjernes og lever hele produktets levetid.",
              },
              {
                q: "Hvilke produkter har S-TAG innebygd?",
                a: "Sykler, elsparkesykler, ski, verktøy, elektronikk og andre verdifulle produkter fra produsenter som samarbeider med S-TAG. Se etter S-TAG-merket på emballasjen når du kjøper.",
              },
              {
                q: "Må jeg pare chipen selv?",
                a: "Nei. Du trenger bare den unike S-TAG-koden som fulgte med produktet. Du skriver inn koden i appen, så er du registrert eier – ingen Bluetooth-pairing eller hardware-oppsett.",
              },
              {
                q: "Hva skjer hvis jeg selger produktet?",
                a: "Du overfører eierskapet digitalt i appen. Chipen blir i produktet, men registreringen flyttes til den nye eieren som får full kontroll.",
              },
              {
                q: "Fungerer det uten nett?",
                a: "Chipen lagrer siste posisjon. Så snart et S-TAG- eller mobil-gateway er innenfor rekkevidde, oppdateres den automatisk.",
              },
              {
                q: "Er det GDPR-kompatibelt?",
                a: "Ja. All data lagres kryptert innenfor EU/EØS (Amsterdam og Frankfurt). Du eier dine egne data og kan eksportere eller slette kontoen din når som helst fra Innstillinger → Mine data.",
              },
              {
                q: "Hva koster det?",
                a: "S-TAG er helt gratis for deg som sluttbruker. Ingen abonnement, ingen skjulte gebyrer, ingen betalte versjoner. Chipen følger med produktet fra produsenten – du betaler kun for selve produktet du kjøper.",
              },
              {
                q: "Hvordan kontakter jeg support?",
                a: "Send oss en melding fra Kontakt-siden, eller skriv direkte til marianne@s-tag.no. Vi svarer vanligvis innen én virkedag.",
              },
            ].map((item, i) => (
              <details key={i} className="group bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <summary className="font-bold text-lg cursor-pointer list-none flex items-center justify-between">
                  {item.q}
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="mt-3 text-slate-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#0f2a5c] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Klar til å sikre det du eier?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Opprett en konto på under ett minutt og registrer ditt første S-TAG-merkede produkt.
          </p>
          <Link
            href="/registrer"
            className="inline-block px-10 py-5 rounded-full bg-white text-[#0f2a5c] text-lg font-black hover:bg-slate-100 transition shadow-2xl"
          >
            Opprett konto
          </Link>
        </div>
      </section>

      {/* Kontakt / support */}
      <section id="kontakt" className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold tracking-widest uppercase text-[#0f2a5c]">Kontakt</span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-3 mb-4">
            Spørsmål? Vi er her for å hjelpe.
          </h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Er du sluttbruker som trenger hjelp, produsent som vil integrere S-TAG, eller
            har du bare et spørsmål? Skriv til oss – vi svarer vanligvis innen én virkedag.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:marianne@s-tag.no"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#0f2a5c] text-white font-bold hover:bg-[#1a3d7c] transition shadow-lg shadow-[#0f2a5c]/20"
            >
              <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mail
              </span>
              marianne@s-tag.no
            </a>
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-slate-200 text-slate-700 font-bold hover:bg-white transition"
            >
              Åpne kontaktskjema
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-400 tracking-wide">
            Support · Man–fre 09–16 · Norsk og engelsk
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="S-TAG" width={36} height={26} className="object-contain" />
            <span className="text-sm text-slate-500">© 2026 S-TAG. Alle rettigheter reservert.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/personvern" className="hover:text-slate-900">Personvern</Link>
            <Link href="/vilkar" className="hover:text-slate-900">Vilkår</Link>
            <Link href="/kontakt" className="hover:text-slate-900">Kontakt</Link>
            <a href="mailto:marianne@s-tag.no" className="hover:text-slate-900">
              marianne@s-tag.no
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
