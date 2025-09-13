import pl from "./pl.json";
import en from "./en.json";

export const languages = {
  pl: "Polski",
  en: "English",
};

export const defaultLang = "pl";

export const ui = {
  pl,
  en,
} as const;

// Defines the language keys, e.g., 'pl' | 'en'
export type Lang = keyof typeof ui;

// This is the utility type that reads nested objects
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}` // If it's a nested object, recurse
          : K // Otherwise, it's a valid key
        : never;
    }[keyof T]
  : never;

// Creates a type for all possible translation keys, e.g., "hero.title"
export type TranslationKey = NestedKeyOf<(typeof ui)[typeof defaultLang]>;
