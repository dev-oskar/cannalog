import type { Lang, TranslationKey } from "../i18n/ui";
import type { languages } from "../i18n/ui";

/**
 * Comprehensive type definitions for the useI18n utility
 */
export interface I18nUtils {
  /** Current language code */
  lang: Lang;
  /** Translation function - t('key.path') */
  t: (key: TranslationKey) => string;
  /** Path translation function - translatePath('/path', targetLang?) */
  translatePath: (path: string, targetLang?: string) => string;
  /** Get current path without language prefix */
  getUntranslatedPath: (pathname?: string) => string;
  /** Available languages object */
  languages: typeof languages;
  /** Check if current language is the default language */
  isDefaultLang: boolean;
}

/**
 * Global Astro object type extension
 */
declare global {
  namespace Astro {
    interface AstroGlobal {
      url: URL;
    }
  }
}
