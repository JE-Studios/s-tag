"use client";
import { useState, useEffect, FormEvent, ReactNode, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import { useAuth } from "../lib/auth-context";
import { auth as authApi } from "../lib/api";
import {
  useGeolocation,
  getGeoConsent,
  setGeoConsent,
} from "../lib/use-geolocation";
import { useToast } from "../components/Toast";
import { useTranslation } from "../lib/i18n";

const SOFT_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function InnstillingerPage() {
  const { user, setUser, logout, refreshUser } = useAuth();
  const toast = useToast();
  const { t, locale } = useTranslation();
  const geo = useGeolocation(false);

  // Profil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Samtykker / varsler
  const [locationConsent, setLocationConsent] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);

  // Forsikring
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [insurancePolicy, setInsurancePolicy] = useState("");
  const [savingInsurance, setSavingInsurance] = useState(false);

  // Passord
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  // Farlig
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setInsuranceCompany(user.insuranceCompany || "");
    setInsurancePolicy(user.insurancePolicy || "");
    setLocationConsent(!!user.consentLocation);
    setNotifyEmail(user.notifyEmail !== false);
    setNotifyPush(user.notifyPush !== false);
    setNotifyMarketing(!!user.notifyMarketing);
  }, [user]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { user: updated } = await authApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      });
      setUser(updated);
      toast.success(t("settings.profileUpdated"));
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveInsurance(e: FormEvent) {
    e.preventDefault();
    setSavingInsurance(true);
    try {
      const { user: updated } = await authApi.updateProfile({
        insuranceCompany: insuranceCompany.trim() || null,
        insurancePolicy: insurancePolicy.trim() || null,
      });
      setUser(updated);
      toast.success(t("settings.insuranceUpdated"));
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    } finally {
      setSavingInsurance(false);
    }
  }

  async function toggleLocation(next: boolean) {
    if (next && getGeoConsent() !== "granted") {
      // Må be om faktisk browser-samtykke først.
      await geo.request();
      const granted = getGeoConsent() === "granted";
      if (!granted) {
        toast.error(t("settings.locationDenied"));
        return;
      }
    } else {
      setGeoConsent(next);
    }
    setLocationConsent(next);
    try {
      await authApi.updateProfile({ consentLocation: next });
      await refreshUser();
      toast.success(next ? t("settings.locationEnabled") : t("settings.locationDisabled"));
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    }
  }

  async function toggleNotif(
    field: "notifyEmail" | "notifyPush" | "notifyMarketing",
    next: boolean
  ) {
    // Optimistisk UI
    if (field === "notifyEmail") setNotifyEmail(next);
    if (field === "notifyPush") setNotifyPush(next);
    if (field === "notifyMarketing") setNotifyMarketing(next);
    try {
      await authApi.updateProfile({ [field]: next });
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
      await refreshUser();
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error(t("settings.passwordTooShort"));
      return;
    }
    setChangingPw(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      toast.success(t("settings.passwordChanged"));
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    } finally {
      setChangingPw(false);
    }
  }

  async function exportData() {
    try {
      const blob = await authApi.exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stag-eksport-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("settings.dataExported"));
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      toast.success(t("settings.accountDeleted"));
      logout();
    } catch (err: any) {
      toast.error(err.message || t("common.error"));
      setDeleting(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <TopBar showBack title={t("settings.title")} />
      <main className="pt-24 pb-40 px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: SOFT_EASE }}
          className="space-y-8"
        >
          {/* Profil */}
          <SettingsCard title={t("settings.profile")} subtitle={t("settings.profileSub")}>
            <form onSubmit={saveProfile} className="space-y-4">
              <Field label={t("common.name")}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                />
              </Field>
              <Field label={t("common.email")}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                />
              </Field>
              <Field label={t("settings.phoneOptional")}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+47 …"
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                />
              </Field>
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-4 rounded-2xl bg-[#0f2a5c] text-white font-bold text-lg hover:bg-[#1a3d7c] transition disabled:opacity-50 shadow-lg shadow-[#0f2a5c]/20"
              >
                {savingProfile ? t("common.saving") : t("common.save")}
              </button>
            </form>
          </SettingsCard>

          {/* Forsikring */}
          <InsuranceCard
            t={t}
            locale={locale}
            insuranceCompany={insuranceCompany}
            setInsuranceCompany={setInsuranceCompany}
            insurancePolicy={insurancePolicy}
            setInsurancePolicy={setInsurancePolicy}
            savingInsurance={savingInsurance}
            onSubmit={saveInsurance}
          />

          {/* Personvern og samtykker */}
          <SettingsCard
            title={t("settings.privacy")}
            subtitle={t("settings.privacySub")}
          >
            <div className="space-y-1">
              <ToggleRow
                icon="my_location"
                title={t("settings.location")}
                body={t("settings.locationDesc")}
                value={locationConsent}
                onChange={toggleLocation}
              />
              <ToggleRow
                icon="mail"
                title={t("settings.emailAlerts")}
                body={t("settings.emailAlertsDesc")}
                value={notifyEmail}
                onChange={(v) => toggleNotif("notifyEmail", v)}
              />
              <ToggleRow
                icon="notifications_active"
                title={t("settings.pushAlerts")}
                body={t("settings.pushAlertsDesc")}
                value={notifyPush}
                onChange={(v) => toggleNotif("notifyPush", v)}
              />
              <ToggleRow
                icon="campaign"
                title={t("settings.marketing")}
                body={t("settings.marketingDesc")}
                value={notifyMarketing}
                onChange={(v) => toggleNotif("notifyMarketing", v)}
              />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <button
                type="button"
                onClick={async () => {
                  if (!confirm(t("settings.revokeConfirm"))) return;
                  try {
                    await authApi.updateProfile({
                      consentLocation: false,
                      notifyEmail: false,
                      notifyPush: false,
                      notifyMarketing: false,
                    });
                    setGeoConsent(false);
                    setLocationConsent(false);
                    setNotifyEmail(false);
                    setNotifyPush(false);
                    setNotifyMarketing(false);
                    await refreshUser();
                    toast.success(t("settings.revokedAll"));
                  } catch (err: any) {
                    toast.error(err.message || t("common.error"));
                  }
                }}
                className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
              >
                {t("settings.revokeAll")}
              </button>
              <p className="text-xs text-slate-500">
                {t("settings.gdprNote")}
              </p>
            </div>
            <div className="mt-2 text-xs text-slate-500 space-y-1">
              <p>
                Se full{" "}
                <Link href="/personvern" className="text-[#0f2a5c] font-bold underline">
                  {t("settings.privacyPolicy")}
                </Link>{" "}
                og{" "}
                <Link href="/vilkar" className="text-[#0f2a5c] font-bold underline">
                  {t("settings.termsOfService")}
                </Link>
                .
              </p>
              <p>
                {t("settings.consentVersion", user.consentVersion || "—")}
                {user.consentAcceptedAt && (
                  <>
                    {" "}
                    · {t("settings.consentAccepted", new Date(user.consentAcceptedAt).toLocaleDateString("nb-NO"))}
                  </>
                )}
              </p>
            </div>
          </SettingsCard>

          {/* Passord */}
          <SettingsCard title={t("settings.password")} subtitle={t("settings.passwordSub")}>
            <form onSubmit={changePassword} className="space-y-4">
              <Field label={t("settings.currentPassword")}>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                />
              </Field>
              <Field label={t("settings.newPassword")}>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                />
              </Field>
              <button
                type="submit"
                disabled={changingPw || !oldPassword || !newPassword}
                className="w-full py-3.5 rounded-2xl border border-[#0f2a5c] text-[#0f2a5c] font-bold hover:bg-[#0f2a5c]/5 transition disabled:opacity-50"
              >
                {changingPw ? t("settings.changingPassword") : t("settings.changePassword")}
              </button>
            </form>
          </SettingsCard>

          {/* Logg ut */}
          <button
            onClick={logout}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-700 transition flex items-center justify-center gap-3 shadow-lg"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            {t("settings.logout")}
          </button>

          {/* Data-rettigheter (GDPR) */}
          <SettingsCard
            title={t("settings.yourData")}
            subtitle={t("settings.yourDataSub")}
          >
            <div className="space-y-3">
              <button
                onClick={exportData}
                className="w-full py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">download</span>
                {t("settings.exportData")}
              </button>
            </div>
          </SettingsCard>

          {/* Farlig sone */}
          <SettingsCard
            title={t("settings.deleteAccount")}
            subtitle={t("settings.deleteAccountSub")}
            tone="danger"
          >
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              {t("settings.deleteWarning")}
            </p>
            <AnimatePresence mode="wait" initial={false}>
              {!confirmDelete ? (
                <motion.button
                  key="ask"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-3 rounded-2xl border border-red-200 text-red-700 font-bold hover:bg-red-50 transition"
                >
                  {t("settings.deleteConfirm")}
                </motion.button>
              ) : (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <p className="text-sm font-bold text-red-700 text-center">
                    {t("settings.deleteAreYouSure")}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      onClick={deleteAccount}
                      disabled={deleting}
                      className="py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {deleting ? t("settings.deleting") : t("settings.deleteYes")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SettingsCard>
        </motion.div>
      </main>
    </>
  );
}

function SettingsCard({
  title,
  subtitle,
  children,
  tone,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  tone?: "danger";
}) {
  return (
    <section
      className={`bg-white rounded-2xl border p-6 ${
        tone === "danger" ? "border-red-100" : "border-slate-200"
      }`}
    >
      <h2
        className={`font-extrabold tracking-tight text-lg ${
          tone === "danger" ? "text-red-700" : "text-slate-900"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1 mb-5">{subtitle}</p>
      )}
      {!subtitle && <div className="mb-5" />}
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  body,
  value,
  onChange,
}: {
  icon: string;
  title: string;
  body: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full flex items-start gap-4 py-4 text-left border-b border-slate-100 last:border-b-0"
    >
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[#0f2a5c] text-xl">
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-slate-900 text-sm">{title}</div>
        <div className="text-xs text-slate-500 leading-relaxed mt-0.5">
          {body}
        </div>
      </div>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          value ? "bg-[#0f2a5c]" : "bg-slate-200"
        }`}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow ${
            value ? "right-0.5" : "left-0.5"
          }`}
        />
      </div>
    </button>
  );
}

type Insurer = { name: string; url: string };

const INSURERS_BY_LOCALE: Record<string, Insurer[]> = {
  nb: [
    { name: "If", url: "https://www.if.no" },
    { name: "Gjensidige", url: "https://www.gjensidige.no" },
    { name: "Tryg", url: "https://www.tryg.no" },
    { name: "Fremtind", url: "https://www.fremtind.no" },
    { name: "Storebrand", url: "https://www.storebrand.no" },
    { name: "SpareBank 1", url: "https://www.sparebank1.no/forsikring" },
    { name: "Eika Forsikring", url: "https://www.eika.no/forsikring" },
    { name: "KLP", url: "https://www.klp.no" },
    { name: "DNB Forsikring", url: "https://www.dnb.no/forsikring" },
    { name: "Frende", url: "https://www.frende.no" },
    { name: "Codan", url: "https://www.codan.no" },
    { name: "Protector", url: "https://www.protectorforsikring.no" },
  ],
  sv: [
    { name: "Länsförsäkringar", url: "https://www.lansforsakringar.se" },
    { name: "If", url: "https://www.if.se" },
    { name: "Trygg-Hansa", url: "https://www.trygghansa.se" },
    { name: "Folksam", url: "https://www.folksam.se" },
    { name: "Moderna Försäkringar", url: "https://www.modernaforsakringar.se" },
    { name: "Dina Försäkringar", url: "https://www.dina.se" },
    { name: "ICA Försäkring", url: "https://www.icaforsakring.se" },
    { name: "Gjensidige", url: "https://www.gjensidige.se" },
    { name: "Zurich", url: "https://www.zurich.se" },
  ],
  da: [
    { name: "Tryg", url: "https://www.tryg.dk" },
    { name: "Topdanmark", url: "https://www.topdanmark.dk" },
    { name: "Alm. Brand", url: "https://www.almbrand.dk" },
    { name: "Codan", url: "https://www.codan.dk" },
    { name: "GF Forsikring", url: "https://www.gf-forsikring.dk" },
    { name: "If", url: "https://www.if.dk" },
    { name: "Gjensidige", url: "https://www.gjensidige.dk" },
    { name: "Runa Forsikring", url: "https://www.runaforsikring.dk" },
    { name: "Privatsikring", url: "https://www.privatsikring.dk" },
  ],
  de: [
    { name: "Allianz", url: "https://www.allianz.de" },
    { name: "HUK-Coburg", url: "https://www.huk.de" },
    { name: "DEVK", url: "https://www.devk.de" },
    { name: "Ergo", url: "https://www.ergo.de" },
    { name: "AXA", url: "https://www.axa.de" },
    { name: "Zurich", url: "https://www.zurich.de" },
    { name: "Generali", url: "https://www.generali.de" },
    { name: "R+V Versicherung", url: "https://www.ruv.de" },
    { name: "Württembergische", url: "https://www.wuerttembergische.de" },
  ],
  fr: [
    { name: "AXA", url: "https://www.axa.fr" },
    { name: "MAIF", url: "https://www.maif.fr" },
    { name: "Macif", url: "https://www.macif.fr" },
    { name: "Groupama", url: "https://www.groupama.fr" },
    { name: "Allianz", url: "https://www.allianz.fr" },
    { name: "MMA", url: "https://www.mma.fr" },
    { name: "GMF", url: "https://www.gmf.fr" },
    { name: "MATMUT", url: "https://www.matmut.fr" },
    { name: "Generali", url: "https://www.generali.fr" },
  ],
  es: [
    { name: "Mapfre", url: "https://www.mapfre.es" },
    { name: "Allianz", url: "https://www.allianz.es" },
    { name: "AXA", url: "https://www.axa.es" },
    { name: "Zurich", url: "https://www.zurich.es" },
    { name: "Generali", url: "https://www.generali.es" },
    { name: "Línea Directa", url: "https://www.lineadirecta.com" },
    { name: "Mutua Madrileña", url: "https://www.mutua.es" },
    { name: "Santalucía", url: "https://www.santalucia.es" },
    { name: "Pelayo", url: "https://www.pelayo.com" },
  ],
  en: [
    { name: "Allianz", url: "https://www.allianz.com" },
    { name: "AXA", url: "https://www.axa.com" },
    { name: "Zurich", url: "https://www.zurich.com" },
    { name: "Generali", url: "https://www.generali.com" },
    { name: "AIG", url: "https://www.aig.com" },
    { name: "Aviva", url: "https://www.aviva.com" },
    { name: "Liberty Mutual", url: "https://www.libertymutual.com" },
    { name: "State Farm", url: "https://www.statefarm.com" },
    { name: "Chubb", url: "https://www.chubb.com" },
  ],
};

function InsurerLogo({ url, name, size = 24 }: { url: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const domain = useMemo(() => { try { return new URL(url).hostname; } catch { return null; } }, [url]);
  if (!domain || failed) {
    return (
      <div className="flex items-center justify-center rounded-lg bg-slate-100" style={{ width: size, height: size }}>
        <span className="material-symbols-outlined text-[#0f2a5c]" style={{ fontSize: size * 0.6 }}>shield</span>
      </div>
    );
  }
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=${size * 2}`}
      alt={name}
      width={size}
      height={size}
      className="rounded"
      onError={() => setFailed(true)}
    />
  );
}

function InsuranceCard({
  t,
  locale,
  insuranceCompany,
  setInsuranceCompany,
  insurancePolicy,
  setInsurancePolicy,
  savingInsurance,
  onSubmit,
}: {
  t: (key: string, ...args: (string | number)[]) => string;
  locale: string;
  insuranceCompany: string;
  setInsuranceCompany: (v: string) => void;
  insurancePolicy: string;
  setInsurancePolicy: (v: string) => void;
  savingInsurance: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  const [focused, setFocused] = useState(false);

  const insurers = INSURERS_BY_LOCALE[locale] || INSURERS_BY_LOCALE.en;

  const filtered = useMemo(() => {
    const q = insuranceCompany.trim().toLowerCase();
    if (!q) return focused ? insurers : [];
    return insurers.filter((i) => i.name.toLowerCase().includes(q));
  }, [insuranceCompany, insurers, focused]);

  const selectedInsurer = insurers.find(
    (i) => i.name.toLowerCase() === insuranceCompany.trim().toLowerCase()
  );

  const showDropdown = focused && filtered.length > 0 && !selectedInsurer;

  return (
    <SettingsCard title={t("settings.insurance")} subtitle={t("settings.insuranceSub")}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label={t("settings.insuranceCompany")}>
          <div className="relative">
            <input
              type="text"
              value={insuranceCompany}
              onChange={(e) => setInsuranceCompany(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder={t("settings.insuranceCompanyPlaceholder")}
              autoComplete="off"
              className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
            />
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="max-h-64 overflow-y-auto py-1">
                    {filtered.map((ins) => (
                      <button
                        key={ins.name}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setInsuranceCompany(ins.name);
                          setFocused(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition"
                      >
                        <InsurerLogo url={ins.url} name={ins.name} size={24} />
                        <span className="text-sm font-semibold text-slate-900">{ins.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400">{t("settings.noInsurerMatch")}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Field>

        {selectedInsurer && (
          <a
            href={selectedInsurer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition group"
          >
            <InsurerLogo url={selectedInsurer.url} name={selectedInsurer.name} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{selectedInsurer.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{selectedInsurer.url.replace(/^https?:\/\//, "")}</p>
            </div>
            <div className="flex items-center gap-1 text-[#0f2a5c] opacity-70 group-hover:opacity-100 transition">
              <span className="text-xs font-bold">{t("settings.visitInsurer", "").trim()}</span>
              <span className="material-symbols-outlined text-lg">open_in_new</span>
            </div>
          </a>
        )}

        <Field label={t("settings.insurancePolicy")}>
          <input
            type="text"
            value={insurancePolicy}
            onChange={(e) => setInsurancePolicy(e.target.value)}
            placeholder={t("settings.insurancePolicyPlaceholder")}
            className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
          />
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {t("settings.policyHelp")}
          </p>
        </Field>
        <button
          type="submit"
          disabled={savingInsurance}
          className="w-full py-4 rounded-2xl bg-[#0f2a5c] text-white font-bold text-lg hover:bg-[#1a3d7c] transition disabled:opacity-50 shadow-lg shadow-[#0f2a5c]/20"
        >
          {savingInsurance ? t("common.saving") : t("common.save")}
        </button>
      </form>
    </SettingsCard>
  );
}
