/**
 * Homepage copy that is rendered both as HTML (`src/pages/index.astro`) and as
 * Markdown for agents (`src/pages/index.md.ts`), so the two cannot drift.
 * Kept free of image imports so plain Node (the test suite) can load it.
 */

/** Site-wide summary: the default meta description and the JSON-LD `description`. */
export const siteDescription =
  'Proiect nou în Timișoara, vânzare direct de la dezvoltator: apartamente cu finisaje moderne și de calitate, prețuri competitive, într-o zonă liniștită și verde, preponderent rezidențială.';

/** The page's only <h1>. Visually hidden: the hero logo carries the brand on screen. */
export const homeHeading = 'Nosto – apartamente noi în Timișoara, direct de la dezvoltator';

export const overview = {
  paragraphs: [
    'Proiect NOU in TIMIȘOARA, vânzare direct de la dezvoltator, apartamente cu finisaje moderne si de calitate, preturi competitive, zonă liniștită si verde preponderent rezidențiala. Apartamentele de vânzare din acest proiect se diferențiază prin atenția acordată spațiului de locuit și finisajelor. Fiecare apartament a fost supus unui studiu, în vederea optimizării spațiului și a funcționalității acestuia. Planurile de prezentare vin și cu o propunere concretă de mobilare, ajutând la o mai bună apreciere a spațiului și a măsurii în care acesta corespunde nevoilor dumneavoastră.',
    'Un preț corect și competitiv oferă o valoare excelentă banilor investiți în acest proiect.',
  ],
  highlights: [
    'Calitatea bună a construcției',
    'Finisajele moderne',
    'O zonă liniștită și bine conectată în Timișoara',
  ],
};

export type ApartmentTypeKey = 'studio' | '1.5' | '2' | '2.5' | '3' | '4';

export interface ApartmentType {
  /** Matches a floor-plan image in index.astro. */
  key: ApartmentTypeKey;
  type: string;
  mobileType: string;
  size: string;
  description: string;
}

export const apartmentTypes: ApartmentType[] = [
  {
    key: 'studio',
    type: 'STUDIO',
    mobileType: 'STUDIO',
    size: '45mp',
    description:
      'Apartamentele de 1 cameră le-am transformat în spații de locuit funcționale, în apartamente tip studio, cu delimitarea zonei de zi de zona de noapte prin crearea unei nișe care să îndeplinească funcția de dormitor.',
  },
  {
    key: '1.5',
    type: '1.5 CAMERE',
    mobileType: '1.5 CAM',
    size: '65mp',
    description:
      'Chiar dacă are o suprafața redusă față de standardul apartamentelor de 2 camere acest tip de apartament îndeplinește  cu succes funcțiile unui apartament de 2 camere.',
  },
  {
    key: '2',
    type: '2 CAMERE',
    mobileType: '2 CAM',
    size: '85mp',
    description:
      'Apartamente decomandate, potrivite familiilor care își doresc bucătărie închisă sau care vor camere separate.',
  },
  {
    key: '2.5',
    type: '2.5 CAMERE',
    mobileType: '2.5 CAM',
    size: '85mp',
    description:
      'Acest TIP de apartament permite amenajarea zonei de zi împreună cu bucătăria, obținând astfel a treia încăpere cu funcția de birou sau camera copii / oaspeți.',
  },
  {
    key: '3',
    type: '3 CAMERE',
    mobileType: '3 CAM',
    size: '85mp',
    description:
      'Apartament pentru familii cu copii. Suprafața decentă, cele două băii precum si cămara aferentă bucătăriei satisface nevoile unei familii  cu 3 sau 4 membri.',
  },
  {
    key: '4',
    type: '4 CAMERE',
    mobileType: '4 CAM',
    size: '85mp',
    description:
      'Apartamentele de 4 camere au suprafețe mari și beneficiază de terase generoase, pentru familiile care își doresc și un spațiu exterior tip TERASĂ, nu doar un balcon.',
  },
];
