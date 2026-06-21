import en from "./locales/en";
import fa from "./locales/fa";
import { toLocaleDigits } from "../utils/localeDigits";

export const LOCALES = {
  en: { label: "English", dir: "ltr", code: "en" },
  fa: { label: "فارسی", dir: "rtl", code: "fa" },
};

export const DEFAULT_LOCALE = "fa";

const localeMessages = { en, fa };

let currentLocale = DEFAULT_LOCALE;

export function getLocale() {
  return currentLocale;
}

export function setGlobalLocale(locale) {
  if (localeMessages[locale]) {
    currentLocale = locale;
  }
}

export function getInitialLocale() {
  const saved = localStorage.getItem("locale");
  if (saved === "en" || saved === "fa") return saved;
  return DEFAULT_LOCALE;
}

function getNestedValue(obj, key) {
  return key.split(".").reduce((acc, part) => acc?.[part], obj);
}

const PERSIAN_DIGIT_PARAMS = new Set([
  "count",
  "from",
  "to",
  "total",
  "min",
  "max",
  "time",
]);

export function translate(key, params = {}, locale = currentLocale) {
  const template = getNestedValue(localeMessages[locale], key);
  if (typeof template !== "string") return key;

  return template.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    if (params[name] === undefined) return "";
    const value = String(params[name]);
    if (locale === "fa" && PERSIAN_DIGIT_PARAMS.has(name)) {
      return toLocaleDigits(value, locale);
    }
    return value;
  });
}

export function t(key, params) {
  return translate(key, params);
}

export function getLocaleConfig(locale = currentLocale) {
  return LOCALES[locale] ?? LOCALES[DEFAULT_LOCALE];
}

export function getDateLocale(locale = currentLocale) {
  return locale === "fa" ? "fa-IR" : "en-GB";
}
