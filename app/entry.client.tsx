import { RemixBrowser } from "@remix-run/react";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

import { getInitialNamespaces } from "remix-i18next/client";
import { I18nextProvider, initReactI18next } from "react-i18next";

import i18next from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { i18nConfig } from "./locale/i18n.js";

async function hydrate() {
  i18next
    // Use the react-i18next plugin.
    .use(initReactI18next)
    // Setup client-side language detector.
    .use(LanguageDetector)
    // Setup backend.
    .use(Backend)
    .init({
      // Spread configuration.
      ...i18nConfig,
      // Detects the namespaces your routes rendered while SSR use
      // and pass them here to load the translations.
      ns: getInitialNamespaces(),
      backend: {
        requestOptions: { cache: "no-store" },
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },
      detection: {
        // We'll detect the language only server-side with remix-i18next.
        // By using `<html lang>` attribute we communicate to the Client.
        order: ["htmlTag"],
      },
    })
    .then(() => {
      hydrateRoot(
        document,
        <I18nextProvider i18n={i18next}>
          <StrictMode>
            <RemixBrowser />
          </StrictMode>
        </I18nextProvider>
      );
    });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
