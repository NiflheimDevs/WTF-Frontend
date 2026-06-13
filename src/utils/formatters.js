import { getDateLocale, getLocale, translate as t } from "../i18n";

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
    format: (phone) => {
      if (!phone) return "";
      const cleaned = phone.replace(/\D/g, "");
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
      }
      return phone;
    },
    validate: (phone) => {
      const cleaned = phone.replace(/\D/g, "");
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
