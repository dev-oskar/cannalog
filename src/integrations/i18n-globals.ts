import { getLocale } from "astro-i18n-aut";
import { defaultLang, ui, showDefaultLang, languages } from "../i18n/ui";
import type { Lang, TranslationKey } from "../i18n/ui";

/**
 * Comprehensive i18n utility - Senior Engineer's Solution
 * Usage: const i18n = useI18n(Astro);
 *
 * Provides everything needed for internationalization:
 * - i18n.t('key') - Translation function
 * - i18n.lang - Current language
 * - i18n.translatePath('/path') - Path translation with language prefix
 * - i18n.getUntranslatedPath() - Current path without language prefix
 * - i18n.languages - Available languages object
 * - i18n.isDefaultLang - Boolean check for default language
 *
 * Benefits:
 * - Single import, complete i18n solution
 * - Type-safe with full TypeScript support
 * - Zero runtime overhead
 * - Consistent API across all components
 * - Self-contained with all utilities included
 */

interface I18nUtils {
  lang: Lang;
  t: (key: TranslationKey) => string;
  translatePath: (path: string, targetLang?: string) => string;
  getUntranslatedPath: (pathname?: string) => string;
  languages: typeof languages;
  isDefaultLang: boolean;
}

function createTranslationFunction(lang: Lang) {
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

function createPathTranslator(lang: Lang) {
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

function createUntranslatedPathGetter(lang: Lang, pathname: string) {
  return function getUntranslatedPath(customPathname?: string): string {
    const targetPathname = customPathname || pathname;

    if (lang === defaultLang) {
      return targetPathname;
    }

    const langPrefix = `/${lang}`;
    if (targetPathname.startsWith(langPrefix)) {
      return targetPathname.substring(langPrefix.length) || "/";
    }
    return targetPathname;
  };
}

export function useI18n(Astro: any): I18nUtils {
  const lang = getLocale(Astro.url) as Lang;
  const t = createTranslationFunction(lang);
  const translatePath = createPathTranslator(lang);
  const getUntranslatedPath = createUntranslatedPathGetter(
    lang,
    Astro.url.pathname
  );
  const isDefaultLang = lang === defaultLang;

  return {
    lang,
    t,
    translatePath,
    getUntranslatedPath,
    languages,
    isDefaultLang,
  };
}
