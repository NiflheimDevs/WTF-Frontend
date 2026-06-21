import { getDateLocale, getLocale, translate as t } from "../i18n";
import {
  formatDateTime,
  formatNumber,
  toAsciiDigits,
  toLocaleDigits,
} from "./localeDigits";

export { formatNumber, toLocaleDigits, toAsciiDigits };

export const formatters = {
  date: {
    short: (date, locale = getLocale()) =>
      formatDateTime(date, locale, {
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
    full: (date, locale = getLocale()) => formatDateTime(date, locale),
  },

  number: {
    compact: (num, locale = getLocale()) => {
      if (num >= 1000000) {
        return toLocaleDigits(`${(num / 1000000).toFixed(1)}M`, locale);
      }
      if (num >= 1000) {
        return toLocaleDigits(`${(num / 1000).toFixed(1)}K`, locale);
      }
      return formatNumber(num, locale);
    },
    withCommas: (num, locale = getLocale()) => formatNumber(num, locale),
    percentage: (num, total, locale = getLocale()) => {
      const value = total ? `${((num / total) * 100).toFixed(1)}%` : "0%";
      return toLocaleDigits(value, locale);
    },
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
    minutes: (minutes, locale = getLocale()) => {
      if (minutes < 60) return toLocaleDigits(`${minutes}m`, locale);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return toLocaleDigits(`${hours}h ${mins}m`, locale);
    },
  },
};

export const relativeTime = formatters.date.relative;
export const formatPhone = formatters.phone.format;
export const compactNumber = formatters.number.compact;

// Re-export for callers that already use getDateLocale with raw Date APIs.
export { getDateLocale, formatDateTime };
