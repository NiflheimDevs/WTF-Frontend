import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  getInitialLocale,
  getLocaleConfig,
  setGlobalLocale,
  translate,
} from "../i18n";

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);

  useEffect(() => {
    setGlobalLocale(locale);
    const { dir, code } = getLocaleConfig(locale);
    document.documentElement.lang = code;
    document.documentElement.dir = dir;
    document.title =
      locale === "fa" ? "سامانه گزارش‌دهی آب" : "Water Supply Reporting System";
    localStorage.setItem("locale", locale);
  }, [locale]);

  const setLocale = useCallback((next) => {
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === "fa" ? "en" : "fa"));
  }, []);

  const t = useCallback(
    (key, params) => translate(key, params, locale),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
      dir: getLocaleConfig(locale).dir,
      isRtl: locale === "fa",
    }),
    [locale, setLocale, toggleLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, locale, dir, isRtl, setLocale, toggleLocale } = useLocale();
  return { t, locale, dir, isRtl, setLocale, toggleLocale };
}

export { DEFAULT_LOCALE };
