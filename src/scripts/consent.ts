// Cookie consent banner (vanilla-cookieconsent) wired to Google Consent Mode v2
// and the Meta Pixel.
//
// This module is loaded on demand from Layout.astro: on the first interaction
// for visitors who have not chosen yet, or when "Setări cookie" is clicked.
// Returning visitors never download it. Their stored choice is applied before
// any tag loads by the inline consent-defaults script in Layout.astro, which
// reads the same `cc_cookie` this module writes. Keep the category names
// (`analytics`, `marketing`) in sync with that script.
//
// The stylesheets are imported as URLs and attached only when the banner
// starts. A plain CSS import would be hoisted by Astro into every page's
// inlined styles (~40 KB of HTML per page) for a banner most loads never show.
import libraryCss from 'vanilla-cookieconsent/dist/cookieconsent.css?url';
import themeCss from './consent.css?url';
import * as CookieConsent from 'vanilla-cookieconsent';
import contact from '../config/contact';

function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    // Resolve on error too: an unstyled banner beats no consent prompt.
    link.onload = link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

const state = (granted: boolean) => (granted ? 'granted' : 'denied');

function applyConsent() {
  const analytics = CookieConsent.acceptedCategory('analytics');
  const marketing = CookieConsent.acceptedCategory('marketing');

  window.gtag('consent', 'update', {
    analytics_storage: state(analytics),
    ad_storage: state(marketing),
    ad_user_data: state(marketing),
    ad_personalization: state(marketing),
  });
  window.fbq?.('consent', marketing ? 'grant' : 'revoke');
  window.dataLayer.push({ event: 'consent_update' });
}

let started: Promise<void> | undefined;

/** Initialise the plugin; shows the banner only if no valid choice is stored. */
export function start(): Promise<void> {
  started ??= Promise.all([loadStylesheet(libraryCss), loadStylesheet(themeCss)]).then(() => run());
  return started;
}

/** Open the preferences modal (footer "Setări cookie"). */
export async function showPreferences() {
  await start();
  CookieConsent.showPreferences();
}

function run(): Promise<void> {
  return CookieConsent.run({
    cookie: { name: 'cc_cookie', expiresAfterDays: 182, sameSite: 'Lax' },
    guiOptions: {
      consentModal: { layout: 'box', position: 'bottom left', equalWeightButtons: true },
      preferencesModal: { layout: 'box', equalWeightButtons: true },
    },
    onConsent: applyConsent,
    onChange: applyConsent,
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: {
        autoClear: { cookies: [{ name: /^_ga/ }] },
      },
      marketing: {
        autoClear: { cookies: [{ name: /^_gcl/ }, { name: '_fbp' }, { name: '_fbc' }] },
      },
    },
    language: {
      default: 'ro',
      translations: {
        ro: {
          consentModal: {
            title: 'Folosim cookie-uri',
            description:
              'Folosim cookie-uri strict necesare pentru funcționarea site-ului și, doar cu acordul dumneavoastră, cookie-uri de analiză și de marketing, ca să înțelegem cum este folosit site-ul și să măsurăm eficiența reclamelor. Puteți schimba oricând alegerea din „Setări cookie”, în subsolul paginii.',
            acceptAllBtn: 'Accept toate',
            acceptNecessaryBtn: 'Refuz',
            showPreferencesBtn: 'Setări',
          },
          preferencesModal: {
            title: 'Setări cookie',
            acceptAllBtn: 'Accept toate',
            acceptNecessaryBtn: 'Refuz toate',
            savePreferencesBtn: 'Salvează alegerea',
            closeIconLabel: 'Închide',
            sections: [
              {
                title: 'Cum folosim cookie-urile',
                description:
                  'Cookie-urile sunt fișiere mici salvate în browser. Le folosim pe cele strict necesare întotdeauna, iar pe cele de analiză și marketing doar dacă vă dați acordul.',
              },
              {
                title: 'Strict necesare',
                description:
                  'Necesare pentru funcționarea site-ului și pentru a reține alegerea dumneavoastră privind cookie-urile. Nu pot fi dezactivate.',
                linkedCategory: 'necessary',
                cookieTable: {
                  headers: {
                    name: 'Cookie',
                    provider: 'Furnizor',
                    expiration: 'Durată',
                    description: 'Scop',
                  },
                  body: [
                    {
                      name: 'cc_cookie',
                      provider: 'nosto.ro',
                      expiration: '6 luni',
                      description: 'Reține alegerea privind cookie-urile',
                    },
                  ],
                },
              },
              {
                title: 'Analiză',
                description:
                  'Ne ajută să înțelegem câți vizitatori avem și cum navighează pe site (Google Analytics). Datele sunt agregate și nu vă identifică direct.',
                linkedCategory: 'analytics',
                cookieTable: {
                  headers: {
                    name: 'Cookie',
                    provider: 'Furnizor',
                    expiration: 'Durată',
                    description: 'Scop',
                  },
                  body: [
                    {
                      name: '_ga, _ga_*',
                      provider: 'Google Analytics',
                      expiration: '2 ani',
                      description: 'Statistici de vizitare',
                    },
                  ],
                },
              },
              {
                title: 'Marketing',
                description:
                  'Măsoară eficiența reclamelor noastre pe Google și Meta (Facebook, Instagram) și permit afișarea unor reclame relevante pentru dumneavoastră.',
                linkedCategory: 'marketing',
                cookieTable: {
                  headers: {
                    name: 'Cookie',
                    provider: 'Furnizor',
                    expiration: 'Durată',
                    description: 'Scop',
                  },
                  body: [
                    {
                      name: '_gcl_*',
                      provider: 'Google Ads',
                      expiration: '3 luni',
                      description: 'Atribuirea vizitelor și a solicitărilor reclamelor',
                    },
                    {
                      name: '_fbp, _fbc',
                      provider: 'Meta',
                      expiration: '3 luni',
                      description: 'Măsurarea și afișarea reclamelor',
                    },
                  ],
                },
              },
              {
                title: 'Mai multe informații',
                description: `Pentru întrebări despre cookie-uri și datele dumneavoastră ne puteți scrie la <a href="mailto:${contact.email}">${contact.email}</a>.`,
              },
            ],
          },
        },
      },
    },
  });
}
