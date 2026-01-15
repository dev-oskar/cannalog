import { getLocale } from "astro-i18n-aut";
import { defaultLang, ui, showDefaultLang, languages } from "./ui";
import type { Lang, TranslationKey } from "./ui";

/**
 * Comprehensive i18n utility module - consolidates all i18n logic
 *
 * Usage contexts:
 * - Astro components/pages: const i18n = useI18n(Astro);
 * - Middleware/utilities: const t = createTranslationFunction(lang);
 */

interface I18nUtils {
  lang: Lang;
  t: (key: TranslationKey) => string;
  translatePath: (path: string, targetLang?: string) => string;
  getUntranslatedPath: (pathname?: string) => string;
  languages: typeof languages;
  isDefaultLang: boolean;
}

/**
 * Extract language from URL pathname
 * @param url - URL object to parse
 * @returns Language code if found in URL, otherwise default language
 */
export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

/**
 * Create a translation function for a given language
 * @param lang - Language code
 * @returns Function that translates dot-notation keys to strings
 */
export function createTranslationFunction(lang: Lang | undefined) {
  const currentLang = lang && ui[lang] ? lang : defaultLang;

  return function t(key: TranslationKey): string {
    const keys = key.split(".");
    const text = keys.reduce(
      (obj: any, currentKey: string) => obj?.[currentKey],
      ui[currentLang]
    );
    return typeof text === "string" ? text : key;
  };
}

/**
 * Legacy alias for createTranslationFunction for backwards compatibility
 * @deprecated Use createTranslationFunction instead
 */
export function useTranslations(lang: Lang | undefined) {
  return createTranslationFunction(lang);
}

/**
 * Create a path translator function for language-prefixed URLs
 * @param lang - Current language code
 * @returns Function that translates paths with appropriate language prefix
 */
export function createPathTranslator(lang: Lang) {
  return function translatePath(
    path: string,
    targetLang: string = lang
  ): string {
    const langCode = targetLang as Lang;
    const isHash = path.startsWith("#");

    if (!showDefaultLang && langCode === defaultLang) {
      if (isHash) return `/${path}`;
      const finalPath = path === "/" ? "" : path;
      return finalPath === "" ? "/" : finalPath;
    } else {
      const langPrefix = `/${langCode}`;
      if (isHash) return `${langPrefix}${path}`;
      const finalPath = path === "/" ? "" : path;
      return `${langPrefix}${finalPath}`;
    }
  };
}

/**
 * Legacy wrapper for createPathTranslator for backwards compatibility
 * @deprecated Use createPathTranslator instead
 */
export function useTranslatedPath(lang: keyof typeof ui) {
  return createPathTranslator(lang);
}

/**
 * Strip language prefix from pathname
 * @param pathname - Full pathname potentially with language prefix
 * @param lang - Current language code
 * @returns Pathname without language prefix
 */
export function getPathWithoutLang(pathname: string, lang: Lang): string {
  if (lang === defaultLang) {
    return pathname;
  }
  const langPrefix = `/${lang}`;
  if (pathname.startsWith(langPrefix)) {
    return pathname.substring(langPrefix.length) || "/";
  }
  return pathname;
}

/**
 * Comprehensive i18n hook for Astro components/pages
 * Requires Astro context with access to the current URL
 * @param url - URL object to parse
 * @returns I18n utilities object with lang, t, translatePath, etc.
 */
export function useI18n(url: URL): I18nUtils {
  const lang = getLangFromUrl(url);
  const t = createTranslationFunction(lang);
  const translatePath = createPathTranslator(lang);
  const isDefaultLang = lang === defaultLang;

  return {
    lang,
    t,
    translatePath,
    getUntranslatedPath: (customPathname?: string) => {
      const pathname = customPathname || url.pathname;
      return getPathWithoutLang(pathname, lang);
    },
    languages,
    isDefaultLang,
  };
}
