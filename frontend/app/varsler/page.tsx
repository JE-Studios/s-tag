"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import TopBar from "../components/TopBar";
import { notifications as notificationsApi, Notification } from "../lib/api";
import { useToast } from "../components/Toast";
import { useTranslation } from "../lib/i18n";

const KIND_ICON: Record<string, string> = {
  item_lost: "location_off",
  found_report: "person_pin_circle",
  transfer_received: "swap_horiz",
  chip_offline: "signal_disconnected",
  welcome: "celebration",
};

const KIND_COLOR: Record<string, string> = {
  item_lost: "text-red-600 bg-red-50",
  found_report: "text-emerald-700 bg-emerald-50",
  transfer_received: "text-blue-700 bg-blue-50",
  chip_offline: "text-amber-700 bg-amber-50",
  welcome: "text-violet-700 bg-violet-50",
};

export default function VarslerPage() {
  const { t } = useTranslation();
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  function timeAgo(iso: string) {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return t("time.now");
    if (diff < 3600) return t("time.minutesAgo", Math.floor(diff / 60));
    if (diff < 86400) return t("time.hoursAgo", Math.floor(diff / 3600));
    if (diff < 604800) return t("time.daysAgo", Math.floor(diff / 86400));
    return d.toLocaleDateString("nb-NO");
  }

  const load = async () => {
    try {
      const data = await notificationsApi.list();
      setList(data);
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke hente varsler");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setList((l) => l.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      toast.success(t("varsler.markedAllRead"));
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke oppdatere");
    }
  };

  const unread = list.filter((n) => !n.readAt).length;

  return (
    <>
      <TopBar showBack title={t("varsler.title")} />
      <main className="pt-28 pb-40 px-6 max-w-2xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-end justify-between gap-4"
        >
          <div>
            <h1 className="font-extrabold text-4xl text-slate-900 tracking-tight mb-1">{t("varsler.title")}</h1>
            <p className="text-slate-500 text-sm font-medium">
              {unread > 0 ? t("varsler.unread", unread) : t("varsler.allRead")}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-bold text-[#0f2a5c] hover:underline whitespace-nowrap"
            >
              {t("varsler.markAllRead")}
            </button>
          )}
        </motion.section>

        {loading && (
          <div className="py-20 text-center text-slate-400">{t("common.loading")}</div>
        )}

        {!loading && list.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
            <span className="material-symbols-outlined text-6xl text-slate-300">notifications_off</span>
            <h3 className="mt-4 text-xl font-bold text-slate-700">{t("varsler.emptyTitle")}</h3>
            <p className="text-slate-500 mt-1 text-sm">
              {t("varsler.emptySub")}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {list.map((n) => {
            const icon = KIND_ICON[n.kind] || "notifications";
            const color = KIND_COLOR[n.kind] || "text-slate-700 bg-slate-100";
            const unread = !n.readAt;
            const content = (
              <div
                className={`flex gap-4 p-4 rounded-2xl border transition ${
                  unread
                    ? "bg-white border-slate-200 shadow-sm"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-sm leading-snug ${
                        unread ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                      }`}
                    >
                      {n.title}
                    </h3>
                    {unread && (
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                  {n.body && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.body}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
              </div>
            );
            return n.itemId ? (
              <Link key={n.id} href={`/kartotek/detalj?id=${n.itemId}`}>
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      </main>
    </>
  );
}
