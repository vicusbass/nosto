/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  readonly SANITY_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Globals defined by the inline tag scripts in src/layouts/Layout.astro. */
interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  __onFirstInteraction: (callback: () => void) => void;
  __consent: { stored: boolean; analytics: boolean; marketing: boolean };
}
