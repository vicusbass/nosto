/**
 * Plain-text representations of the site for AI agents: the homepage as
 * Markdown, the Markdown 404 body and /llms.txt (https://llmstxt.org).
 *
 * Pure functions over plain data, so the Astro endpoints in src/pages pass the
 * real config in and the tests (test/agent-content.test.ts) can run them in
 * plain Node without the image imports some config modules carry.
 */

export interface AgentContact {
  phone: string;
  phoneInternational: string;
  email: string;
  whatsapp: string;
  streetAddress: string;
  address: string;
}

export interface AgentBuilding {
  name: string;
  statusLabel: string;
  description: string;
  ctas: { label: string; href: string }[];
}

export interface HomeMarkdownInput {
  siteUrl: string;
  heading: string;
  summary: string;
  buildingsIntro: string;
  buildings: AgentBuilding[];
  overview: { paragraphs: string[]; highlights: string[] };
  apartmentTypes: { type: string; size: string; description: string }[];
  finishes: { label: string; value: string }[];
  techDetails: { title: string; value: string }[];
  locationDetails: { icon: string; title: string; details: string }[];
  contact: AgentContact;
}

export interface LlmsTxtInput {
  siteUrl: string;
  buildings: AgentBuilding[];
  contact: AgentContact;
}

/** Escapes characters that would otherwise turn plain copy into Markdown syntax. */
export function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_[\]<>#|])/g, '\\$1');
}

/** Collapses the double spaces that some hand-written copy carries. */
const clean = (text: string) => escapeMarkdown(text.replace(/\s+/g, ' ').trim());

const absolute = (siteUrl: string, path: string) => new URL(path, siteUrl).href;

/** Location items are shown as icons on the page; spell out the mode of travel. */
const TRAVEL_MODE: Record<string, string> = {
  'mdi:car': 'cu mașina',
  'mdi:bike': 'cu bicicleta',
};

const contactLines = (contact: AgentContact) => [
  `- Telefon: [${contact.phone}](tel:${contact.phoneInternational})`,
  `- WhatsApp: [${contact.phone}](https://wa.me/${contact.whatsapp})`,
  `- E-mail: [${contact.email}](mailto:${contact.email})`,
  `- Adresă: ${clean(contact.streetAddress)}, Timișoara ([Google Maps](${contact.address}))`,
];

export function homeMarkdown(input: HomeMarkdownInput): string {
  const url = (path: string) => absolute(input.siteUrl, path);
  const lines: string[] = [
    `# ${clean(input.heading)}`,
    '',
    `> ${clean(input.summary)}`,
    '',
    '## Două corpuri, un singur ansamblu',
    '',
    clean(input.buildingsIntro),
  ];

  for (const building of input.buildings) {
    lines.push('', `### ${clean(building.name)}: ${clean(building.statusLabel)}`, '');
    lines.push(clean(building.description), '');
    for (const cta of building.ctas) {
      lines.push(`- [${clean(cta.label)} – ${clean(building.name)}](${url(cta.href)})`);
    }
  }

  lines.push('', '## Prezentarea generală a proiectului', '');
  for (const paragraph of input.overview.paragraphs) lines.push(clean(paragraph), '');
  for (const highlight of input.overview.highlights) lines.push(`- ${clean(highlight)}`);

  lines.push('', '## Tipuri de apartamente', '');
  for (const apartment of input.apartmentTypes) {
    lines.push(`### ${clean(apartment.type)} (${clean(apartment.size)})`, '');
    lines.push(clean(apartment.description), '');
  }

  lines.push('## Pachete finisaje și dotări', '');
  for (const item of input.finishes) {
    lines.push(`- **${clean(item.label)}**${item.value ? `: ${clean(item.value)}` : ''}`);
  }

  lines.push('', '## Listă detalii tehnice', '');
  for (const detail of input.techDetails) {
    lines.push(`- **${clean(detail.title)}**: ${clean(detail.value)}`);
  }

  lines.push('', '## Locație și mobilitate', '');
  for (const item of input.locationDetails) {
    const mode = TRAVEL_MODE[item.icon];
    lines.push(`- ${clean(item.title)}: ${clean(item.details)}${mode ? ` ${mode}` : ''}`);
  }
  lines.push('', `Detalii și hartă: [Locație](${url('/locatie')})`);

  lines.push('', '## Contact', '', ...contactLines(input.contact));
  lines.push(`- Formular: [Contact](${url('/contact')})`);

  lines.push(
    '',
    '## Pagini',
    '',
    ...input.buildings.flatMap((building) =>
      building.ctas.map(
        (cta) =>
          `- [Apartamente ${clean(building.name)}](${url(cta.href)}): disponibilitate, prețuri și planuri`
      )
    ),
    `- [Stadiu șantier](${url('/noutati')}): noutăți despre construcție`,
    `- [Ghid pentru agenți (llms.txt)](${url('/llms.txt')})`,
    ''
  );

  return lines.join('\n');
}

export function notFoundMarkdown(siteUrl: string): string {
  const url = (path: string) => absolute(siteUrl, path);
  return [
    '# 404 – Pagina nu a fost găsită',
    '',
    'Pagina pe care ați cerut-o nu există pe nosto.ro. Este posibil ca adresa să fie greșită sau ca pagina să fi fost mutată.',
    '',
    'The page you requested does not exist on nosto.ro. Check the address, or start from one of the links below.',
    '',
    `- [Pagina principală / Homepage](${url('/')})`,
    `- [Apartamente Corp A](${url('/apartamente')})`,
    `- [Apartamente Corp B](${url('/apartamente-b')})`,
    `- [Contact](${url('/contact')})`,
    `- [llms.txt: guide for AI agents](${url('/llms.txt')})`,
    `- [Sitemap](${url('/sitemap-index.xml')})`,
    '',
  ].join('\n');
}

export function llmsTxt(input: LlmsTxtInput): string {
  const url = (path: string) => absolute(input.siteUrl, path);
  const { contact } = input;
  const buildingStatus = input.buildings
    .map((building) => `${building.name}: ${building.statusLabel.toLowerCase()}`)
    .join('; ');

  return [
    '# Nosto',
    '',
    `> Nosto is a residential project of two apartment buildings in the Plopi neighbourhood of Timișoara, Romania, about 8 minutes by car from the city centre. The developer sells its own new apartments (studio, 1.5, 2, 2.5, 3 and 4 rooms) directly, with no agency in between. Building status: ${buildingStatus}. The website is in Romanian.`,
    '',
    'Use nosto.ro when a user wants to:',
    '',
    '- find a new-build apartment to buy in Timișoara, directly from the developer;',
    '- check which Nosto apartments are still available, with price, size, floor and floor plan;',
    "- compare Nosto's apartment types, finishes, building specifications and location;",
    '- follow the construction progress of the second building (Corp B);',
    '- contact the developer to ask a question or book a viewing.',
    '',
    'Do not use it for apartments to rent, for other developments or for general Timișoara real-estate market data: nosto.ro covers only the Nosto project and sells only.',
    '',
    'How to read the site:',
    '',
    '- Every page is plain server-rendered HTML; no JavaScript is needed to read it.',
    `- The homepage also answers requests sent with \`Accept: text/markdown\` in Markdown; the same Markdown is at ${url('/index.md')}.`,
    '- Availability and prices are in a table per floor on the Corp A and Corp B apartment pages. Prices are in euro, for finished apartments, without VAT. "Disponibil" means available, "Vândut" means sold, and "Preț la cerere" means the price is given on request.',
    '- Each apartment row links to a detail page (/apartamente/<id>) with its floor plan, room areas and photos.',
    '- The pages are updated when the site is rebuilt, so availability can lag. Tell the user to confirm price and availability with the developer before deciding.',
    '',
    'How to act for the user:',
    '',
    '- There is no public API, no online reservation and no online payment.',
    `- To ask a question or book a viewing, give the user the developer's contact details: phone ${contact.phoneInternational}, WhatsApp https://wa.me/${contact.whatsapp}, e-mail ${contact.email}. The site is at ${contact.streetAddress}, Timișoara.`,
    `- The contact form at ${url('/contact')} sends a message to the developer. Only submit it with the user's explicit consent and their own name, e-mail and phone number.`,
    '',
    '## When to use: pages by task',
    '',
    `- [Homepage](${url('/')}): project overview, apartment types and sizes, finishes, technical specifications and location. Markdown version: ${url('/index.md')}`,
    `- [Apartamente Corp A](${url('/apartamente')}): available apartments in the finished building, with prices, sizes and floor plans`,
    `- [Apartamente Corp B](${url('/apartamente-b')}): apartments in the building under construction, with prices, sizes and floor plans`,
    `- [Locație](${url('/locatie')}): address, map, and travel times to the city centre`,
    `- [Stadiu șantier](${url('/noutati')}): construction progress updates`,
    `- [Contact](${url('/contact')}): phone, WhatsApp, e-mail and contact form`,
    '',
    '## Optional',
    '',
    `- [Sitemap](${url('/sitemap-index.xml')}): every page URL, including each apartment's detail page`,
    '',
  ].join('\n');
}
