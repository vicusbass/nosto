import type { ImageMetadata } from 'astro';
import corpAReal from '../assets/corp-a-real.jpeg';
import corpABSantier from '../assets/corp-a-corp-b-santier.jpg';
import { formatLongDate } from '../utils/formatDate.ts';

export type BuildingStatus = 'finalizat' | 'in-constructie';

export interface Building {
  name: string;
  status: BuildingStatus;
  statusLabel: string;
  description: string;
  /** Completion deadline (ISO `YYYY-MM-DD`) of a building still under construction. */
  completionDate?: string;
  /** Links shown under the description; the first one is the primary action. */
  ctas: { label: string; href: string }[];
  image: ImageMetadata;
  imageAlt: string;
  /** CSS `object-position` used when the image is cropped to the panel ratio. */
  imagePosition: string;
}

/** When the works on the project began; quoted on /noutati. */
export const worksStarted = 'iunie 2025';

/**
 * Corp B's completion deadline. The one source for every place that quotes it: the homepage
 * panel, /noutati (text and meta description) and llms.txt.
 */
export const corpBCompletionDate = '2027-11-30';

export const buildingsIntro =
  'Proiectul se dezvoltă în două etape: Corp A este finalizat, iar Corp B se află în construcție.';

export const buildings: Building[] = [
  {
    name: 'Corp A',
    status: 'finalizat',
    statusLabel: 'Finalizat',
    description:
      'Construcția este finalizată. Apartamentele pot fi vizionate la fața locului și se vând direct de la dezvoltator.',
    ctas: [{ label: 'Vezi apartamentele', href: '/apartamente' }],
    image: corpAReal,
    imageAlt: 'Corp A finalizat – fațada clădirii cu balcoane, văzută peste spațiul verde amenajat',
    imagePosition: '50% 15%',
  },
  {
    name: 'Corp B',
    status: 'in-constructie',
    statusLabel: 'În construcție',
    description: `Lucrările la al doilea corp sunt în desfășurare, pe terenul alăturat, cu termen de finalizare ${formatLongDate(corpBCompletionDate)}.`,
    completionDate: corpBCompletionDate,
    ctas: [{ label: 'Vezi apartamentele', href: '/apartamente-b' }],
    image: corpABSantier,
    imageAlt: 'Vedere aeriană: Corp A finalizat în stânga, șantierul Corp B cu macara în dreapta',
    imagePosition: '50% 80%',
  },
];
