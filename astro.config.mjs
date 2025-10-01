import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

import tailwindcss from "@tailwindcss/vite";

import { i18n, filterSitemapByDefaultLocale } from "astro-i18n-aut/integration";
import sitemap from "@astrojs/sitemap";

const defaultLocale = "en";
const locales = {
  en: "en-EN",
  pl: "pl-PL",
};

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      // Force @nhost/nhost-js to be treated as external for SSR
      // This prevents Vite from trying to bundle it and causing CommonJS/ESM conflicts
      external: ["@nhost/nhost-js", "@nhost/nhost-js/session"],
    },
  },
  trailingSlash: "never",
  build: {
    format: "file",
  },
  integrations: [
    i18n({
      locales,
      defaultLocale,
      redirectDefaultLocale: true,
    }),
    sitemap({
      i18n: {
        locales,
        defaultLocale,
      },
      filter: filterSitemapByDefaultLocale({ defaultLocale }),
    }),
  ],
  output: "server",
  adapter: netlify(),
});
