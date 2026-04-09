"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import {
  items as itemsApi,
  transfers as transfersApi,
  signing as signingApi,
  Item,
  Transfer,
} from "../lib/api";
import { useToast } from "../components/Toast";
import { useAuth } from "../lib/auth-context";

const APPLE_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const SOFT_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Tab = "sell" | "inbox";

export default function EierskiftePage() {
  const { user } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>("sell");
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [all, setAll] = useState<Transfer[]>([]);
  const [bankidReady, setBankidReady] = useState(false);

  useEffect(() => {
    itemsApi.list().then(setMyItems).catch(() => {});
    transfersApi.list().then(setAll).catch(() => {});
    signingApi
      .status()
      .then((s) => setBankidReady(s.configured))
      .catch(() => setBankidReady(false));
  }, []);

  const sent = useMemo(
    () => all.filter((t) => t.fromUserId === user?.id),
    [all, user?.id]
  );
  const received = useMemo(
    () => all.filter((t) => user?.email && t.toEmail === user.email),
    [all, user?.email]
  );

  const refresh = async () => {
    try {
      const [items, transfers] = await Promise.all([
        itemsApi.list(),
        transfersApi.list(),
      ]);
      setMyItems(items);
      setAll(transfers);
    } catch {
      /* stille */
    }
  };

  return (
    <>
      <TopBar showBack />
      <main className="pt-28 px-6 max-w-2xl mx-auto pb-40">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: SOFT_EASE }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Eierskifte
          </h1>
          <p className="text-slate-500 font-medium">
            Digital salgskontrakt regulert av kjøpsloven. Begge parter bekrefter
            {bankidReady ? " og signerer med BankID" : " kontrakten i appen"}.
          </p>
        </motion.section>

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: SOFT_EASE, delay: 0.08 }}
          className="bg-slate-100 p-1 rounded-xl flex mb-8 border border-slate-200 relative"
        >
          {(
            [
              { id: "sell", label: "Selg", count: sent.length },
              { id: "inbox", label: "Mottatte", count: received.length },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-colors relative z-10"
            >
              {tab === t.id && (
                <motion.div
                  layoutId="eierskifte-tab"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={`relative flex items-center justify-center gap-2 ${
                  tab === t.id ? "text-slate-900" : "text-slate-500"
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      tab === t.id
                        ? "bg-[#0f2a5c] text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === "sell" ? (
            <motion.div
              key="sell"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: SOFT_EASE }}
            >
              <SellForm
                myItems={myItems}
                user={user}
                bankidReady={bankidReady}
                onCreated={async (createdId) => {
                  await refresh();
                  // Auto-start BankID signing for seller if ready
                  if (bankidReady) {
                    try {
                      const { authUrl } = await signingApi.start(createdId, "seller");
                      window.location.href = authUrl;
                      return;
                    } catch (e: any) {
                      toast.error(e.message || "Kunne ikke starte BankID");
                    }
                  } else {
                    toast.success("Kontrakt sendt til kjøper");
                  }
                }}
              />
              {sent.length > 0 && (
                <div className="mt-12">
                  <SectionHeader>Sendte kontrakter</SectionHeader>
                  <div className="space-y-3">
                    {sent.map((t) => (
                      <TransferCard
                        key={t.id}
                        transfer={t}
                        side="seller"
                        bankidReady={bankidReady}
                        onAction={refresh}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="inbox"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: SOFT_EASE }}
            >
              {received.length === 0 ? (
                <EmptyState
                  icon="inbox"
                  title="Ingen mottatte kontrakter"
                  body="Når noen overfører en S-TAG-merket gjenstand til deg, vises salgskontrakten her."
                />
              ) : (
                <div className="space-y-3">
                  {received.map((t) => (
                    <TransferCard
                      key={t.id}
                      transfer={t}
                      side="buyer"
                      bankidReady={bankidReady}
                      onAction={refresh}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

/* ---------- Sub-components ---------- */

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xs font-black tracking-widest uppercase text-slate-500">
        {children}
      </h2>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: SOFT_EASE }}
      className="text-center py-16 px-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200"
    >
      <div className="mx-auto w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4 border border-slate-200">
        <span className="material-symbols-outlined text-3xl text-slate-400">
          {icon}
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">{body}</p>
    </motion.div>
  );
}

function SellForm({
  myItems,
  user,
  bankidReady,
  onCreated,
}: {
  myItems: Item[];
  user: any;
  bankidReady: boolean;
  onCreated: (transferId: string) => void;
}) {
  const toast = useToast();
  const [itemId, setItemId] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [salePriceNok, setSalePriceNok] = useState<string>("");
  const [conditionNote, setConditionNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [asIs, setAsIs] = useState(true);
  const [note, setNote] = useState("");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);

  const item = useMemo(() => myItems.find((i) => i.id === itemId) || null, [myItems, itemId]);
  const today = new Date().toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId) return toast.error("Velg gjenstand");
    if (!toEmail) return toast.error("Fyll inn kjøpers e-post");
    if (!salePriceNok || Number.isNaN(Number(salePriceNok)))
      return toast.error("Pris må være et tall i NOK");
    if (!accept) return toast.error("Du må bekrefte salgskontrakten");
    setBusy(true);
    try {
      const created = await transfersApi.create({
        itemId,
        toEmail,
        salePriceNok: Math.max(0, Math.round(Number(salePriceNok))),
        conditionNote,
        paymentMethod,
        asIs,
        note,
        confirmContract: true,
      });
      onCreated(created.id);
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke opprette eierskifte");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <Step icon="inventory_2" n={1} title="Gjenstand">
        <select
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#0f2a5c] focus:border-transparent outline-none transition"
        >
          <option value="">— Velg —</option>
          {myItems.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
              {i.brand ? ` · ${i.brand}` : ""}
              {i.model ? ` ${i.model}` : ""}
            </option>
          ))}
        </select>

        <AnimatePresence initial={false}>
          {item && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                transition: {
                  height: { duration: 0.5, ease: APPLE_EASE },
                  opacity: { duration: 0.35, delay: 0.1 },
                },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: {
                  height: { duration: 0.35, ease: APPLE_EASE },
                  opacity: { duration: 0.18 },
                },
              }}
              style={{ overflow: "hidden" }}
            >
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 space-y-1">
                <div><strong>Navn:</strong> {item.name}</div>
                {item.brand && <div><strong>Merke:</strong> {item.brand}</div>}
                {item.model && <div><strong>Modell:</strong> {item.model}</div>}
                {item.serialNumber && <div><strong>Serienummer:</strong> {item.serialNumber}</div>}
                {item.chipUid && (
                  <div>
                    <strong>S-TAG chip-ID:</strong>{" "}
                    <span className="font-mono">{item.chipUid}</span>
                  </div>
                )}
                {item.color && <div><strong>Farge:</strong> {item.color}</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Step>

      <Step icon="person" n={2} title="Kjøper">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
          Kjøpers e-post
        </label>
        <input
          type="email"
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
          placeholder="kjoper@epost.no"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#0f2a5c] focus:border-transparent outline-none transition"
        />
        <p className="mt-2 text-xs text-slate-500">
          Kjøper logger inn på S-TAG og bekrefter kjøpet
          {bankidReady ? " med BankID" : ""} før eierskapet overføres.
        </p>
      </Step>

      <Step icon="payments" n={3} title="Pris og betaling">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Avtalt pris (NOK)
            </label>
            <input
              type="number"
              min="0"
              value={salePriceNok}
              onChange={(e) => setSalePriceNok(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono focus:ring-2 focus:ring-[#0f2a5c] focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Betalingsmåte
            </label>
            <input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Vipps, bank, kontant…"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#0f2a5c] focus:border-transparent outline-none transition"
            />
          </div>
        </div>
      </Step>

      <Step icon="rule" n={4} title="Tilstand og feil">
        <textarea
          value={conditionNote}
          onChange={(e) => setConditionNote(e.target.value)}
          rows={4}
          placeholder="F.eks. 'Lett bruk, mindre riper på ramma, service utført 2025'"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#0f2a5c] focus:border-transparent outline-none resize-none transition"
        />
        <label className="mt-4 flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={asIs}
            onChange={(e) => setAsIs(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f2a5c]"
          />
          <span className="text-xs text-slate-600 leading-relaxed">
            Gjenstanden selges <strong>«som den er»</strong>, jf. kjøpsloven § 19.
            Selger plikter likevel å opplyse om kjente feil og mangler.
          </span>
        </label>
      </Step>

      <Step icon="edit_note" n={5} title="Tilleggsnotat">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Eventuell melding til kjøper (valgfritt)"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#0f2a5c] focus:border-transparent outline-none resize-none transition"
        />
      </Step>

      {/* Kontrakt-sammendrag */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-black tracking-widest uppercase text-[#0f2a5c] mb-3">
          Salgskontrakt · versjon 2026-04
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          Selger <strong>{user?.name || "—"}</strong> ({user?.email || "—"}) overdrar
          eierskapet til <strong>{item?.name || "—"}</strong>
          {item?.chipUid && (
            <> med S-TAG chip-ID <span className="font-mono">{item.chipUid}</span></>
          )}{" "}
          til kjøper <strong>{toEmail || "—"}</strong> for{" "}
          <strong>{salePriceNok ? `${salePriceNok} NOK` : "—"}</strong>.
          Salget reguleres av norsk rett, herunder kjøpsloven. Dato: {today}.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed mb-5">
          S-TAG er ikke part i salget og gir ingen garanti for gjenstandens tilstand,
          betaling eller andre forhold mellom partene.
          {bankidReady && (
            <> Både selger og kjøper må signere kontrakten med BankID.</>
          )}
        </p>

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f2a5c]"
          />
          <span className="text-xs text-slate-700 leading-relaxed">
            Jeg bekrefter at opplysningene er korrekte, at jeg er rettmessig eier,
            og at jeg godtar{" "}
            <Link
              href="/vilkar"
              target="_blank"
              className="text-[#0f2a5c] font-bold underline"
            >
              brukervilkårene
            </Link>
            .
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={busy || !accept}
        className="w-full bg-[#0f2a5c] hover:bg-[#1a3d7c] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#0f2a5c]/20 flex items-center justify-center gap-3 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {bankidReady ? "fingerprint" : "send"}
        </span>
        {busy
          ? "Oppretter…"
          : bankidReady
          ? "Opprett og signer med BankID"
          : "Opprett og send til kjøper"}
      </button>
    </form>
  );
}

function Step({
  icon,
  n,
  title,
  children,
}: {
  icon: string;
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-xl bg-[#0f2a5c]/5 border border-[#0f2a5c]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#0f2a5c] text-lg">
            {icon}
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          <span className="text-slate-400 mr-2">0{n}</span>
          {title}
        </h2>
      </div>
      <div className="pl-11">{children}</div>
    </section>
  );
}

function TransferCard({
  transfer,
  side,
  bankidReady,
  onAction,
}: {
  transfer: Transfer;
  side: "seller" | "buyer";
  bankidReady: boolean;
  onAction: () => void;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const sellerSigned = !!transfer.sellerSignedAt;
  const buyerSigned = !!transfer.buyerSignedAt;
  const accepted = transfer.status === "accepted";

  const acceptAsBuyer = async () => {
    setBusy(true);
    try {
      await transfersApi.accept(transfer.id);
      if (bankidReady) {
        const { authUrl } = await signingApi.start(transfer.id, "buyer");
        window.location.href = authUrl;
        return;
      }
      toast.success("Eierskapet er overført");
      onAction();
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke akseptere");
    } finally {
      setBusy(false);
    }
  };

  const signWithBankId = async (role: "seller" | "buyer") => {
    setBusy(true);
    try {
      const { authUrl } = await signingApi.start(transfer.id, role);
      window.location.href = authUrl;
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke starte BankID");
      setBusy(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: SOFT_EASE }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              accepted
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600"
            }`}
          >
            <span className="material-symbols-outlined">
              {accepted ? "task_alt" : "schedule"}
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 truncate">
              {transfer.itemName}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {side === "seller" ? `Til ${transfer.toEmail}` : `Fra ${transfer.sellerName || "selger"}`}{" "}
              · {transfer.salePriceNok ?? "—"} NOK
            </div>
          </div>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.35, ease: APPLE_EASE }}
          className="material-symbols-outlined text-slate-400"
        >
          expand_more
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.5, ease: APPLE_EASE },
                opacity: { duration: 0.35, delay: 0.12 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.35, ease: APPLE_EASE },
                opacity: { duration: 0.18 },
              },
            }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-5 pt-1 space-y-4 border-t border-slate-100">
              <dl className="text-sm text-slate-700 space-y-1.5">
                <Row label="Status">
                  {accepted ? "Overdratt" : "Venter på kjøper"}
                </Row>
                {transfer.paymentMethod && (
                  <Row label="Betaling">{transfer.paymentMethod}</Row>
                )}
                {transfer.conditionNote && (
                  <Row label="Tilstand">{transfer.conditionNote}</Row>
                )}
                <Row label="«Som den er»">{transfer.asIs ? "Ja" : "Nei"}</Row>
                <Row label="Kontraktversjon">{transfer.contractVersion || "—"}</Row>
              </dl>

              {/* Signature status */}
              <div className="grid grid-cols-2 gap-3">
                <SignatureBadge
                  label="Selger"
                  name={transfer.sellerSignatureName || transfer.sellerName || "—"}
                  signedAt={transfer.sellerSignedAt}
                />
                <SignatureBadge
                  label="Kjøper"
                  name={transfer.buyerSignatureName || transfer.buyerName || "—"}
                  signedAt={transfer.buyerSignedAt}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {side === "buyer" && !accepted && (
                  <button
                    onClick={acceptAsBuyer}
                    disabled={busy}
                    className="w-full py-3 rounded-xl bg-[#0f2a5c] text-white font-bold hover:bg-[#1a3d7c] transition disabled:opacity-60"
                  >
                    {busy
                      ? "Jobber…"
                      : bankidReady
                      ? "Aksepter og signer med BankID"
                      : "Aksepter eierskifte"}
                  </button>
                )}

                {side === "seller" && bankidReady && !sellerSigned && (
                  <button
                    onClick={() => signWithBankId("seller")}
                    disabled={busy}
                    className="w-full py-3 rounded-xl border border-[#0f2a5c] text-[#0f2a5c] font-bold hover:bg-[#0f2a5c]/5 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">
                      fingerprint
                    </span>
                    {busy ? "Starter…" : "Signer som selger med BankID"}
                  </button>
                )}

                {side === "buyer" && bankidReady && accepted && !buyerSigned && (
                  <button
                    onClick={() => signWithBankId("buyer")}
                    disabled={busy}
                    className="w-full py-3 rounded-xl border border-[#0f2a5c] text-[#0f2a5c] font-bold hover:bg-[#0f2a5c]/5 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">
                      fingerprint
                    </span>
                    {busy ? "Starter…" : "Signer som kjøper med BankID"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-500 pt-1">
        {label}
      </dt>
      <dd className="flex-1 text-slate-700">{children}</dd>
    </div>
  );
}

function SignatureBadge({
  label,
  name,
  signedAt,
}: {
  label: string;
  name: string;
  signedAt?: string | null;
}) {
  const signed = !!signedAt;
  return (
    <div
      className={`rounded-xl border p-3 ${
        signed ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`material-symbols-outlined text-base ${
            signed ? "text-emerald-600" : "text-slate-400"
          }`}
          style={{ fontVariationSettings: signed ? "'FILL' 1" : "'FILL' 0" }}
        >
          {signed ? "verified" : "pending"}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {label}
        </span>
      </div>
      <div className="text-xs font-bold text-slate-900 truncate">{name}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">
        {signed
          ? new Date(signedAt!).toLocaleDateString("nb-NO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Ikke signert"}
      </div>
    </div>
  );
}
