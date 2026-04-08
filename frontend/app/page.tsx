"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "./lib/auth-context";

const features = [
  {
    icon: "security",
    title: "Sikring",
    desc: "Fest en S-TAG-chip på sykkelen, laptopen eller kameraet. Registrer den i appen — den er nå din, digitalt og juridisk.",
  },
  {
    icon: "location_on",
    title: "Live sporing",
    desc: "Når noe forsvinner, ser du det i sanntid på kartet. Chip-en rapporterer posisjon så lenge den har signal.",
  },
  {
    icon: "swap_horiz",
    title: "Eierskifte",
    desc: "Selger du noe brukt? Overfør eierskapet digitalt på sekunder. Kjøper får bekreftet at gjenstanden ikke er stjålet.",
  },
  {
    icon: "verified_user",
    title: "Nasjonalt register",
    desc: "Alle S-TAG-merkede gjenstander er søkbare. Finner du noe med en S-TAG? Skann og se om den er meldt savnet.",
  },
];

const steps = [
  { n: "01", title: "Bestill S-TAG-chip", desc: "Få en fysisk NFC-chip sendt hjem i posten." },
  { n: "02", title: "Fest og skann", desc: "Lim chippen på gjenstanden og skann den med mobilen." },
  { n: "03", title: "Du er sikret", desc: "Gjenstanden er registrert, sporbar og eier-verifisert." },
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
            <a href="#priser" className="hover:text-slate-900 transition">Priser</a>
            <a href="#faq" className="hover:text-slate-900 transition">FAQ</a>
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
              ● Lansert i Norge
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6">
              Dine eiendeler,
              <br />
              <span className="bg-gradient-to-r from-[#0f2a5c] to-[#2563eb] bg-clip-text text-transparent">
                digitalt sikret.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Registrer, spor og overfør eierskap av dine verdier med én chip.
              Norges nye standard for eierskap og sporing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={user ? "/hjem" : "/registrer"}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#0f2a5c] text-white text-base font-bold hover:bg-[#1a3d7c] transition shadow-lg shadow-[#0f2a5c]/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                {user ? "Åpne mitt dashboard" : "Kom i gang gratis"}
              </Link>
              <a
                href="#slik-fungerer-det"
                className="w-full sm:w-auto px-8 py-4 rounded-full border-2 border-slate-200 text-slate-700 text-base font-bold hover:bg-slate-50 transition"
              >
                Se hvordan det fungerer
              </a>
            </div>
            <p className="mt-6 text-xs text-slate-400 tracking-wide">
              Ingen kredittkort påkrevd · Tilgjengelig på iOS, Android og Windows
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
          <div className="grid md:grid-cols-2 gap-6">
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
              Fra boks til beskyttet på 2 minutter
            </h2>
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

      {/* Pricing */}
      <section id="priser" className="py-24 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-[#0f2a5c]">Priser</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-3">
              Enkelt og rettferdig
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-10 border border-slate-200">
              <h3 className="text-2xl font-black mb-1">Gratis</h3>
              <p className="text-slate-500 mb-6">For å komme i gang</p>
              <div className="text-5xl font-black mb-6">0 kr</div>
              <ul className="space-y-3 text-slate-600 mb-8">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600">check</span>Opptil 3 gjenstander</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600">check</span>Digital eierskap</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600">check</span>Eierskifte</li>
              </ul>
              <Link href="/registrer" className="block w-full py-3 text-center rounded-full border-2 border-slate-200 font-bold hover:bg-slate-50 transition">
                Kom i gang
              </Link>
            </div>
            <div className="bg-[#0f2a5c] text-white rounded-3xl p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-widest uppercase">Anbefalt</div>
              <h3 className="text-2xl font-black mb-1">Premium</h3>
              <p className="text-white/70 mb-6">For deg med verdier</p>
              <div className="text-5xl font-black mb-6">49 kr<span className="text-lg font-medium text-white/70">/mnd</span></div>
              <ul className="space-y-3 text-white/90 mb-8">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-300">check</span>Ubegrenset antall gjenstander</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-300">check</span>Live chip-sporing</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-300">check</span>Varsler ved bevegelse</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-300">check</span>Prioritert støtte</li>
              </ul>
              <Link href="/registrer" className="block w-full py-3 text-center rounded-full bg-white text-[#0f2a5c] font-bold hover:bg-slate-100 transition">
                Start gratis prøveperiode
              </Link>
            </div>
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
              { q: "Hva er en S-TAG-chip?", a: "En liten NFC/BLE-chip som festes på gjenstander. Den kan skannes med mobilen og rapporterer posisjon." },
              { q: "Hva hvis noen stjeler chippen?", a: "Chippen er tamper-resistant og kan ikke paret med en annen eier uten gammel eiers godkjenning." },
              { q: "Koster chippen ekstra?", a: "Du bestiller fysiske chips fra oss. Førsteeksemplar er gratis ved registrering." },
              { q: "Er det GDPR-kompatibelt?", a: "Ja. All data lagres i Norge, kryptert. Du eier dine data og kan slette konto når som helst." },
              { q: "Fungerer det uten nett?", a: "Chippen lagrer siste posisjon. Så snart en gateway eller mobilbruker er innenfor rekkevidde, oppdateres den." },
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
            Opprett en gratis konto på under ett minutt.
          </p>
          <Link
            href="/registrer"
            className="inline-block px-10 py-5 rounded-full bg-white text-[#0f2a5c] text-lg font-black hover:bg-slate-100 transition shadow-2xl"
          >
            Kom i gang gratis
          </Link>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
