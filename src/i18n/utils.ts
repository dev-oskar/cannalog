import { defaultLang, ui, showDefaultLang } from "./ui";
import type { Lang, TranslationKey } from "./ui";

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    const langCode = l as Lang;
    const isHash = path.startsWith('#');

    if (!showDefaultLang && langCode === defaultLang) {
      // Default language logic
      if (isHash) {
        return `/${path}`; // Returns /#about
      }
      const finalPath = path === "/" ? "" : path;
      return finalPath === "" ? "/" : finalPath;
    } else {
      // Non-default language logic
      const langPrefix = `/${langCode}`;
      if (isHash) {
        return `${langPrefix}${path}`; // Returns /pl#about
      }
      const finalPath = path === "/" ? "" : path;
      return `${langPrefix}${finalPath}`; // Returns /pl or /pl/about
    }
  };
}

export function getPathWithoutLang(pathname: string, lang: Lang) {
  if (lang === defaultLang) {
    return pathname;
  }
  const langPrefix = `/${lang}`;
  if (pathname.startsWith(langPrefix)) {
    return pathname.substring(langPrefix.length) || "/";
  }
  return pathname;
}

export function useTranslations(lang: Lang | undefined) {
  // Fallback to the default language if the current one is not found
  const currentLang = lang && ui[lang] ? lang : defaultLang;

  return function t(key: TranslationKey) {
    // 1. Split the key by dots, e.g., 'hero.title' -> ['hero', 'title']
    const keys = key.split(".");

    // 2. Use reduce to walk through the nested JSON object
    // It starts with the full translation object for the current language
    // and drills down one key at a time.
    const text = keys.reduce(
      (obj: any, currentKey: string) => {
        // If obj is not null/undefined and has the key, return the nested value
        return obj?.[currentKey];
      },
      ui[currentLang] // Initial value is the entire language object (e.g., ui.pl)
    );

    // 3. If the text is found, return it. Otherwise, return the key as a fallback.
    return typeof text === "string" ? text : key;
  };
}