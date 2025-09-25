import { defineConfig } from "astro/config";
import node from "@astrojs/node";

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
  adapter: node({
    mode: "standalone",
  }),
});
