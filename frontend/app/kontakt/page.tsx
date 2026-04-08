"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import TopBar from "../components/TopBar";
import { useAuth } from "../lib/auth-context";
import { auth as authApi, User } from "../lib/api";
import { useToast } from "../components/Toast";
import { hasGeoConsent, setGeoConsent } from "../lib/use-geolocation";

type SectionId = "profile" | "address" | "insurance" | "notifications" | "privacy" | "security" | "data";

const SECTIONS: { id: SectionId; label: string; icon: string }[] = [
  { id: "profile", label: "Profil", icon: "person" },
  { id: "address", label: "Adresse", icon: "home" },
  { id: "insurance", label: "Forsikring", icon: "shield" },
  { id: "notifications", label: "Varsler", icon: "notifications" },
  { id: "privacy", label: "Personvern", icon: "lock" },
  { id: "security", label: "Sikkerhet", icon: "key" },
  { id: "data", label: "Mine data", icon: "folder_managed" },
];

export default function InnstillingerPage() {
  const { user, logout, refreshUser, setUser } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState<SectionId | null>("profile");

  if (!user) {
    return (
      <>
        <TopBar showBack title="Innstillinger" />
        <main className="pt-28 pb-40 px-6 max-w-2xl mx-auto text-center">
          <p className="text-slate-500">Laster …</p>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar showBack title="Innstillinger" />
      <main className="pt-28 pb-40 px-6 max-w-2xl mx-auto">
        {/* Profil-header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0f2a5c] text-white font-black text-2xl flex items-center justify-center flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-xl text-slate-900 truncate">{user.name}</h2>
              <p className="text-sm text-slate-500 truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                {user.plan === "free" ? "Gratis" : "Premium"}
              </span>
            </div>
          </div>
        </motion.section>

        {/* Seksjoner */}
        <div className="space-y-3">
          {SECTIONS.map((s) => {
            const isOpen = open === s.id;
            return (
              <div key={s.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#0f2a5c]">{s.icon}</span>
                  </div>
                  <span className="flex-1 text-left font-bold text-slate-900">{s.label}</span>
                  <span
                    className={`material-symbols-outlined text-slate-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 pt-1 border-t border-slate-100">
                    {s.id === "profile" && (
                      <ProfileSection user={user} setUser={setUser} refreshUser={refreshUser} toast={toast} />
                    )}
                    {s.id === "address" && (
                      <AddressSection user={user} setUser={setUser} toast={toast} />
                    )}
                    {s.id === "insurance" && (
                      <InsuranceSection user={user} setUser={setUser} toast={toast} />
                    )}
                    {s.id === "notifications" && (
                      <NotificationsSection user={user} setUser={setUser} toast={toast} />
                    )}
                    {s.id === "privacy" && (
                      <PrivacySection user={user} setUser={setUser} toast={toast} />
                    )}
                    {s.id === "security" && <SecuritySection toast={toast} />}
                    {s.id === "data" && <DataSection toast={toast} logout={logout} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Politiet / nødlenker */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10"
        >
          <h2 className="font-bold text-lg text-slate-900 mb-3">Har du opplevd et tap?</h2>
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
                <p className="font-bold text-slate-900">Anmeld til politiet</p>
                <p className="text-xs text-slate-500">Digitalt anmeldelsesskjema på politiet.no</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-400">open_in_new</span>
          </a>
        </motion.section>

        {/* Logg ut */}
        <button
          onClick={logout}
          className="mt-8 w-full py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
        >
          Logg ut
        </button>

        {/* Footer-lenker */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link href="/personvern" className="hover:text-slate-900">Personvern</Link>
          <span>·</span>
          <Link href="/vilkar" className="hover:text-slate-900">Vilkår</Link>
        </div>
      </main>
    </>
  );
}

// ----------------------------------------------------------------------------
// Seksjoner
// ----------------------------------------------------------------------------

type ToastApi = ReturnType<typeof useToast>;
type UpdateUser = (u: User) => void;

async function save(patch: Partial<User>, toast: ToastApi, setUser: UpdateUser) {
  try {
    const { user: updated } = await authApi.updateProfile(patch);
    setUser(updated);
    toast.success("Lagret");
  } catch (err: any) {
    toast.error(err.message || "Kunne ikke lagre");
  }
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
      />
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-4 py-3 cursor-pointer">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-sm">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex w-11 h-6 rounded-full transition flex-shrink-0 ${
          checked ? "bg-[#0f2a5c]" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition ${
            checked ? "translate-x-5" : "translate-x-0.5"
          } translate-y-0.5`}
        />
      </button>
    </label>
  );
}

function ProfileSection({
  user,
  setUser,
  refreshUser,
  toast,
}: {
  user: User;
  setUser: UpdateUser;
  refreshUser: () => Promise<void>;
  toast: ToastApi;
}) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");

  return (
    <div className="space-y-4 pt-3">
      <Field label="Fullt navn" value={name} onChange={setName} placeholder="Fornavn Etternavn" />
      <Field label="Telefon" value={phone} onChange={setPhone} type="tel" placeholder="+47 …" />
      <p className="text-xs text-slate-400">
        E-post: <span className="font-mono">{user.email}</span> (kan ikke endres)
      </p>
      <button
        onClick={async () => {
          if (!name.trim()) {
            toast.error("Navn kan ikke være tomt");
            return;
          }
          await save({ name: name.trim(), phone: phone.trim() || null }, toast, setUser);
          refreshUser();
        }}
        className="w-full py-3 rounded-xl bg-[#0f2a5c] text-white font-bold hover:bg-[#1e40af] transition"
      >
        Lagre profil
      </button>
    </div>
  );
}

function AddressSection({ user, setUser, toast }: { user: User; setUser: UpdateUser; toast: ToastApi }) {
  const [address, setAddress] = useState(user.address || "");
  const [postalCode, setPostalCode] = useState(user.postalCode || "");
  const [city, setCity] = useState(user.city || "");

  return (
    <div className="space-y-4 pt-3">
      <Field label="Gateadresse" value={address} onChange={setAddress} placeholder="Storgata 1" />
      <div className="grid grid-cols-[1fr_2fr] gap-3">
        <Field label="Postnr" value={postalCode} onChange={setPostalCode} placeholder="0155" />
        <Field label="Poststed" value={city} onChange={setCity} placeholder="Oslo" />
      </div>
      <button
        onClick={() =>
          save(
            {
              address: address.trim() || null,
              postalCode: postalCode.trim() || null,
              city: city.trim() || null,
            },
            toast,
            setUser
          )
        }
        className="w-full py-3 rounded-xl bg-[#0f2a5c] text-white font-bold hover:bg-[#1e40af] transition"
      >
        Lagre adresse
      </button>
    </div>
  );
}

function InsuranceSection({ user, setUser, toast }: { user: User; setUser: UpdateUser; toast: ToastApi }) {
  const [company, setCompany] = useState(user.insuranceCompany || "");
  const [policy, setPolicy] = useState(user.insurancePolicy || "");

  return (
    <div className="space-y-4 pt-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        Lagre forsikringsinformasjonen din for rask tilgang ved tap eller skade. Informasjonen er privat og
        vises kun for deg.
      </p>
      <Field
        label="Forsikringsselskap"
        value={company}
        onChange={setCompany}
        placeholder="Navn på ditt selskap"
      />
      <Field label="Polisenummer" value={policy} onChange={setPolicy} placeholder="Polise-ID" />
      <button
        onClick={() =>
          save(
            {
              insuranceCompany: company.trim() || null,
              insurancePolicy: policy.trim() || null,
            },
            toast,
            setUser
          )
        }
        className="w-full py-3 rounded-xl bg-[#0f2a5c] text-white font-bold hover:bg-[#1e40af] transition"
      >
        Lagre forsikring
      </button>
    </div>
  );
}

function NotificationsSection({
  user,
  setUser,
  toast,
}: {
  user: User;
  setUser: UpdateUser;
  toast: ToastApi;
}) {
  return (
    <div className="divide-y divide-slate-100">
      <Toggle
        label="E-post varsler"
        description="Få varsler på e-post når noe skjer med gjenstandene dine."
        checked={user.notifyEmail !== false}
        onChange={(v) => save({ notifyEmail: v }, toast, setUser)}
      />
      <Toggle
        label="Push-varsler"
        description="Umiddelbare varsler i appen."
        checked={user.notifyPush !== false}
        onChange={(v) => save({ notifyPush: v }, toast, setUser)}
      />
      <Toggle
        label="Markedsføring"
        description="Nyheter om S-TAG og tilbud. Helt frivillig."
        checked={!!user.notifyMarketing}
        onChange={(v) => save({ notifyMarketing: v }, toast, setUser)}
      />
    </div>
  );
}

function PrivacySection({ user, setUser, toast }: { user: User; setUser: UpdateUser; toast: ToastApi }) {
  const [geoConsent, setGeoConsentState] = useState(() =>
    typeof window !== "undefined" ? hasGeoConsent() : false
  );

  const toggleGeo = (v: boolean) => {
    if (v) {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setGeoConsent(true);
            setGeoConsentState(true);
            save({ consentLocation: true }, toast, setUser);
          },
          (err) => {
            toast.error(err.message || "Posisjon ble avslått");
          }
        );
      }
    } else {
      setGeoConsent(false);
      setGeoConsentState(false);
      save({ consentLocation: false }, toast, setUser);
    }
  };

  return (
    <div className="divide-y divide-slate-100">
      <Toggle
        label="Personvern og vilkår"
        description={
          user.consentPrivacy
            ? "Du har godtatt vår personvernerklæring."
            : "Godta for å lagre og bruke dine data."
        }
        checked={!!user.consentPrivacy}
        onChange={(v) =>
          save({ consentPrivacy: v, consentVersion: "2026-04" }, toast, setUser)
        }
      />
      <Toggle
        label="Dele posisjon"
        description="Tillat appen å hente din posisjon for nøyaktig sporing og funnet-rapporter."
        checked={geoConsent || !!user.consentLocation}
        onChange={toggleGeo}
      />
      <div className="py-3">
        <Link
          href="/personvern"
          className="flex items-center justify-between text-sm font-bold text-[#0f2a5c] hover:underline"
        >
          Les personvernerklæringen
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}

function SecuritySection({ toast }: { toast: ToastApi }) {
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const change = async () => {
    if (newPassword.length < 8) {
      toast.error("Nytt passord må være minst 8 tegn");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Passordene stemmer ikke overens");
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      toast.success("Passord oppdatert");
      setOld("");
      setNew("");
      setConfirm("");
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke endre passord");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-3">
      <Field label="Gammelt passord" type="password" value={oldPassword} onChange={setOld} />
      <Field label="Nytt passord" type="password" value={newPassword} onChange={setNew} />
      <Field label="Bekreft nytt passord" type="password" value={confirm} onChange={setConfirm} />
      <button
        onClick={change}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#0f2a5c] text-white font-bold hover:bg-[#1e40af] transition disabled:opacity-50"
      >
        {loading ? "Endrer …" : "Endre passord"}
      </button>
    </div>
  );
}

function DataSection({ toast, logout }: { toast: ToastApi; logout: () => void }) {
  const [deleting, setDeleting] = useState(false);

  const exportData = async () => {
    try {
      const blob = await authApi.exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `s-tag-eksport-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dine data er eksportert");
    } catch (err: any) {
      toast.error(err.message || "Eksport feilet");
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Er du helt sikker? Kontoen og alle gjenstandene dine vil slettes permanent.")) return;
    if (!confirm("Siste sjanse. Denne handlingen kan IKKE angres. Fortsette?")) return;
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      toast.success("Kontoen er slettet");
      logout();
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke slette");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-3 pt-3">
      <p className="text-xs text-slate-500 leading-relaxed">
        I henhold til GDPR har du rett til innsyn, dataportabilitet og sletting av alle dine data.
      </p>
      <button
        onClick={exportData}
        className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-xl">download</span>
        Last ned alle mine data
      </button>
      <button
        onClick={deleteAccount}
        disabled={deleting}
        className="w-full py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-xl">delete_forever</span>
        {deleting ? "Sletter …" : "Slett konto permanent"}
      </button>
    </div>
  );
}
