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
      // Force @nhost/nhost-js to be bundled into the SSR build (noExternal)
      // This ensures Vite transforms the CommonJS modules properly for the Netlify Functions environment
      noExternal: ["@nhost/nhost-js", "@nhost/nhost-js/session"],
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
