"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TopBar from "../components/TopBar";
import { useAuth } from "../lib/auth-context";
import { feedback as feedbackApi } from "../lib/api";
import { useToast } from "../components/Toast";
import { useTranslation } from "../lib/i18n";

type Kind = "bug" | "feature" | "question" | "other";

export default function KontaktPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();

  const KIND_OPTIONS: { id: Kind; label: string; icon: string }[] = [
    { id: "question", label: t("contact.kindQuestion"), icon: "help" },
    { id: "bug", label: t("contact.kindBug"), icon: "bug_report" },
    { id: "feature", label: t("contact.kindFeature"), icon: "lightbulb" },
    { id: "other", label: t("contact.kindOther"), icon: "chat" },
  ];

  const [kind, setKind] = useState<Kind>("question");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      toast.error(t("contact.emptyMessage"));
      return;
    }
    if (!user && !email.trim()) {
      toast.error(t("contact.needEmailError"));
      return;
    }
    setSending(true);
    try {
      await feedbackApi.send({
        kind,
        subject: subject.trim() || null,
        message: message.trim(),
        name: user ? null : name.trim() || null,
        email: user ? null : email.trim().toLowerCase() || null,
        path: "/kontakt",
      });
      setSent(true);
      setMessage("");
      setSubject("");
      toast.success(t("contact.sent"));
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke sende meldingen");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <TopBar showBack title={t("contact.title")} />
      <main className="pt-28 pb-40 px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            {t("contact.heading")}
          </h1>
          <p className="text-slate-500 mb-10 leading-relaxed">
            {t("contact.intro")}
          </p>

          {/* Direkte kontakt */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="font-bold text-slate-900 mb-4">{t("contact.directContact")}</h2>
            <div className="space-y-3">
              <ContactRow
                icon="mail"
                label={t("contact.email")}
                value="support@s-tag.no"
                href="mailto:support@s-tag.no"
              />
              <ContactRow
                icon="schedule"
                label={t("contact.responseTime")}
                value={t("contact.responseValue")}
              />
              <ContactRow
                icon="public"
                label={t("contact.languages")}
                value={t("contact.languageValue")}
              />
            </div>
          </section>

          {/* Kontaktskjema */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="font-bold text-slate-900 mb-1">{t("contact.sendMessage")}</h2>
            <p className="text-xs text-slate-500 mb-5">
              {user
                ? t("contact.loggedInAs", user.email)
                : t("contact.needEmail")}
            </p>

            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-emerald-600 text-3xl">
                    check_circle
                  </span>
                </div>
                <p className="font-bold text-slate-900 mb-1">{t("contact.sentTitle")}</p>
                <p className="text-sm text-slate-500 mb-5">
                  {t("contact.sentBody")}
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-sm font-bold text-[#0f2a5c] hover:underline"
                >
                  {t("contact.sendAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                {/* Type */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    {t("contact.whatAbout")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {KIND_OPTIONS.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => setKind(k.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition ${
                          kind === k.id
                            ? "border-[#0f2a5c] bg-[#0f2a5c]/5 text-[#0f2a5c]"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">{k.icon}</span>
                        {k.label}
                      </button>
                    ))}
                  </div>
                </div>

                {!user && (
                  <>
                    <Field label={t("found.yourName")}>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ola Nordmann"
                        className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                      />
                    </Field>
                    <Field label={t("common.email")}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="din@epost.no"
                        required
                        className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                      />
                    </Field>
                  </>
                )}

                <Field label={t("contact.subject")}>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t("contact.subjectPlaceholder")}
                    maxLength={200}
                    className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                  />
                </Field>

                <Field label={t("contact.message")}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("contact.messagePlaceholder")}
                    rows={6}
                    maxLength={4000}
                    required
                    className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition resize-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400 text-right">
                    {message.length} / 4000
                  </p>
                </Field>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 rounded-2xl bg-[#0f2a5c] text-white font-bold text-lg hover:bg-[#1a3d7c] transition disabled:opacity-50 shadow-lg shadow-[#0f2a5c]/20"
                >
                  {sending ? t("contact.sending") : t("contact.send")}
                </button>
              </form>
            )}
          </section>

          {/* Nødhjelp / politiet */}
          <section className="mb-8">
            <h2 className="font-bold text-slate-900 mb-3">{t("contact.lostSomething")}</h2>
            <a
              href="https://www.politiet.no"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:bg-white hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0f2a5c]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#0f2a5c]">policy</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t("contact.reportPolice")}</p>
                  <p className="text-xs text-slate-500">{t("contact.reportPoliceSub")}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">open_in_new</span>
            </a>
          </section>

          {/* Lenker */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <Link href="/personvern" className="hover:text-slate-900">
              {t("contact.privacy")}
            </Link>
            <span>·</span>
            <Link href="/vilkar" className="hover:text-slate-900">
              {t("contact.terms")}
            </Link>
            <span>·</span>
            <Link href="/" className="hover:text-slate-900">
              {t("contact.home")}
            </Link>
          </div>
        </motion.div>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-[#0f2a5c]">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <p className={`text-sm ${href ? "text-[#0f2a5c] font-bold" : "text-slate-700"} truncate`}>
          {value}
        </p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:bg-slate-50 -mx-2 px-2 py-1 rounded-lg transition">
      {content}
    </a>
  ) : (
    <div className="py-1">{content}</div>
  );
}
