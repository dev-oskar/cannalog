import type { Lang, TranslationKey } from "../i18n/ui";

/**
 * Type definitions for the useI18n utility
 */
export interface I18nUtils {
  /** Current language code */
  lang: Lang;
  /** Translation function - t('key.path') */
  t: (key: TranslationKey) => string;
  /** Path translation function - translatePath('/path') */
  translatePath: (path: string, lang?: string) => string;
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
