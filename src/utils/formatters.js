export const formatters = {
  date: {
    short: (date) =>
      new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    relative: (date) => {
      const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    },
    full: (date) => new Date(date).toLocaleString(),
  },

  number: {
    compact: (num) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    },
    withCommas: (num) => num.toLocaleString(),
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
