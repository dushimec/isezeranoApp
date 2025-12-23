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
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

// Updated translation function with variable support
export function t(key: string, varsOrOpts: Record<string, any> | { lang?: Locale } = {}, maybeOpts?: { lang?: Locale }) {
  let vars: Record<string, any> = {};
  let lang: Locale | undefined;

  if (maybeOpts) {
    vars = (varsOrOpts as Record<string, any>) || {};
    lang = maybeOpts.lang;
  } else if ((varsOrOpts as any) && typeof (varsOrOpts as any).lang !== 'undefined') {
    lang = (varsOrOpts as any).lang;
  } else {
    vars = (varsOrOpts as Record<string, any>) || {};
  }

  const localeToUse = lang || currentLocale;
  let text = getNested(translations[localeToUse], key) || key;

  // Replace {variable} placeholders with actual values
  if (typeof text === "string") {
    Object.entries(vars).forEach(([k, v]) => {
      const regex = new RegExp(`\\{${k}\\}`, "g");
      text = text.replace(regex, String(v));
    });
  }

  return text;
}
