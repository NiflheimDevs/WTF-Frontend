export const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toAsciiDigits(value) {
  return String(value).replace(/[۰-۹٠-٩]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
    return char;
  });
}

export function toLocaleDigits(value, locale = "en") {
  if (locale !== "fa") return String(value);
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

function getLocaleTag(locale) {
  return locale === "fa" ? "fa-IR" : "en-GB";
}

export function formatNumber(num, locale = "en") {
  const n = Number(num);
  if (Number.isNaN(n)) return toLocaleDigits("0", locale);
  return toLocaleDigits(n.toLocaleString(getLocaleTag(locale)), locale);
}

export function formatDateTime(date, locale = "en", options) {
  const formatted = new Date(date).toLocaleString(getLocaleTag(locale), options);
  return toLocaleDigits(formatted, locale);
}
