import type { ImageMetadata } from 'astro';
import corpATerasa from '../assets/corp-a-terasa.jpg';
import corpABSantier from '../assets/corp-a-corp-b-santier.jpg';

export type BuildingStatus = 'finalizat' | 'in-constructie';

export interface Building {
  name: string;
  status: BuildingStatus;
  statusLabel: string;
  description: string;
  cta: { label: string; href: string };
  image: ImageMetadata;
  imageAlt: string;
  /** CSS `object-position` used when the image is cropped to the panel ratio. */
  imagePosition: string;
}

export const buildingsIntro =
  'Proiectul se dezvoltă în două etape: Corp A este finalizat, iar Corp B se află în construcție.';

export const buildings: Building[] = [
  {
    name: 'Corp A',
    status: 'finalizat',
    statusLabel: 'Finalizat',
    description:
      'Construcția este finalizată. Apartamentele pot fi vizionate la fața locului și se vând direct de la dezvoltator.',
    cta: { label: 'Vezi apartamentele', href: '/apartamente' },
    image: corpATerasa,
    imageAlt: 'Corp A finalizat – terasa de la ultimul etaj, cu vedere spre Timișoara',
    imagePosition: '50% 45%',
  },
  {
    name: 'Corp B',
    status: 'in-constructie',
    statusLabel: 'În construcție',
    description:
      'Lucrările la al doilea corp sunt în desfășurare, pe terenul alăturat. Contactați-ne pentru detalii despre apartamentele disponibile.',
    cta: { label: 'Contactează-ne', href: '/contact' },
    image: corpABSantier,
    imageAlt: 'Vedere aeriană: Corp A finalizat în stânga, șantierul Corp B cu macara în dreapta',
    imagePosition: '50% 80%',
  },
];
