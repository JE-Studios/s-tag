"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import nb from "./translations/nb";

export type Locale = "nb" | "en" | "de" | "es" | "fr" | "da" | "sv";

export const LOCALE_NAMES: Record<Locale, string> = {
  nb: "Norsk (bokmål)",
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  da: "Dansk",
  sv: "Svenska",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  nb: "🇳🇴",
  en: "🇬🇧",
  de: "🇩🇪",
  es: "🇪🇸",
  fr: "🇫🇷",
  da: "🇩🇰",
  sv: "🇸🇪",
};

type Dict = Record<string, string>;
const STORAGE_KEY = "stag_locale";

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "nb";
  const langs = navigator.languages || [navigator.language];
  for (const l of langs) {
    const code = l.split("-")[0] as Locale;
    if (code in LOCALE_NAMES) return code;
  }
  return "nb";
}

const cache: Partial<Record<Locale, Dict>> = { nb };

async function load(locale: Locale): Promise<Dict> {
  if (cache[locale]) return cache[locale]!;
  let mod: { default: Dict };
  switch (locale) {
    case "en":
      mod = await import("./translations/en");
      break;
    case "de":
      mod = await import("./translations/de");
      break;
    case "es":
      mod = await import("./translations/es");
      break;
    case "fr":
      mod = await import("./translations/fr");
      break;
    case "da":
      mod = await import("./translations/da");
      break;
    case "sv":
      mod = await import("./translations/sv");
      break;
    default:
      return nb;
  }
  cache[locale] = mod.default;
  return mod.default;
}

type I18nCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, ...args: (string | number)[]) => string;
};

const Ctx = createContext<I18nCtx>({
  locale: "nb",
  setLocale: () => {},
  t: (key) => key,
});

export const useTranslation = () => useContext(Ctx);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleRaw] = useState<Locale>("nb");
  const [dict, setDict] = useState<Dict>(nb);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null;
    const initial =
      saved && saved in LOCALE_NAMES ? (saved as Locale) : detectLocale();
    setLocaleRaw(initial);
    load(initial).then(setDict);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleRaw(l);
    localStorage.setItem(STORAGE_KEY, l);
    load(l).then(setDict);
  }, []);

  const t = useCallback(
    (key: string, ...args: (string | number)[]) => {
      let str = dict[key] ?? nb[key] ?? key;
      args.forEach((a, i) => {
        str = str.replaceAll(`{${i}}`, String(a));
      });
      return str;
    },
    [dict],
  );

  return (
    <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>
  );
}
