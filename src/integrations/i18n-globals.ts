import { getLocale } from "astro-i18n-aut";
import { useTranslations, useTranslatedPath } from "../i18n/utils";
import type { Lang } from "../i18n/ui";
import type { I18nUtils } from "../types/i18n";

/**
 * Senior engineer's solution: One-liner i18n setup
 * Usage: const { lang, t, translatePath } = useI18n(Astro);
 *
 * Benefits:
 * - Eliminates repetitive boilerplate from 3 lines to 1
 * - Maintains full type safety with TypeScript
 * - Zero runtime overhead - just a simple wrapper
 * - Consistent API across all .astro files
 * - Easy to extend with additional utilities if needed
 */
export function useI18n(Astro: any): I18nUtils {
  const lang = getLocale(Astro.url) as Lang;
  const t = useTranslations(lang);
  const translatePath = useTranslatedPath(lang);

  return { lang, t, translatePath };
}

/**
 * Alternative pattern for component-level i18n setup
 * Could be extended with additional utilities like formatters, validators, etc.
 */
export function createI18nContext(Astro: any) {
  const { lang, t, translatePath } = useI18n(Astro);

  return {
    lang,
    t,
    translatePath,
    // Future extensions could go here:
    // formatDate: (date: Date) => formatDate(date, lang),
    // formatCurrency: (amount: number) => formatCurrency(amount, lang),
    // validate: (field: string, value: any) => validateField(field, value, lang)
  };
}
