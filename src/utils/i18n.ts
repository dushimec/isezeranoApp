import eng from "../i18n/locales/eng";
import rw from "../i18n/locales/rw";

export type Locale = "rw" | "eng";
const translations = { rw, eng };
let currentLocale: Locale = "rw";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

// Helper to get nested value by dot notation
function getNested(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

export function t(key: string) {
  return getNested(translations[currentLocale], key) || key;
}