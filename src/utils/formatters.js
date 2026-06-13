import { getDateLocale, getLocale, translate as t } from "../i18n";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toAsciiDigits(value) {
  return String(value).replace(/[۰-۹٠-٩]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
    return char;
  });
}

function toLocaleDigits(value, locale = getLocale()) {
  if (locale !== "fa") return value;
  return value.replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

export const formatters = {
  date: {
    short: (date, locale = getLocale()) =>
      new Date(date).toLocaleDateString(getDateLocale(locale), {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    relative: (date, locale = getLocale()) => {
      const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
      if (diff < 60) return t("time.secondsAgo", { count: diff }, locale);
      if (diff < 3600)
        return t("time.minutesAgo", { count: Math.floor(diff / 60) }, locale);
      if (diff < 86400)
        return t("time.hoursAgo", { count: Math.floor(diff / 3600) }, locale);
      return t("time.daysAgo", { count: Math.floor(diff / 86400) }, locale);
    },
    full: (date, locale = getLocale()) =>
      new Date(date).toLocaleString(getDateLocale(locale)),
  },

  number: {
    compact: (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    },
    withCommas: (num, locale = getLocale()) =>
      num.toLocaleString(getDateLocale(locale)),
    percentage: (num, total) =>
      total ? `${((num / total) * 100).toFixed(1)}%` : "0%",
  },

  phone: {
    format: (phone, locale = getLocale()) => {
      if (!phone) return "";
      const cleaned = toAsciiDigits(phone).replace(/\D/g, "");
      const formatted = cleaned.length === 11 ? cleaned : toAsciiDigits(phone);
      return toLocaleDigits(formatted, locale);
    },
    validate: (phone) => {
      const cleaned = toAsciiDigits(phone).replace(/\D/g, "");
      return cleaned.length === 11 && cleaned.startsWith("09");
    },
  },

  duration: {
    minutes: (minutes) => {
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    },
  },
};

export const relativeTime = formatters.date.relative;
export const formatPhone = formatters.phone.format;
export const compactNumber = formatters.number.compact;
