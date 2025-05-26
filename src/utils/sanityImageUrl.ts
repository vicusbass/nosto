import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from 'sanity:client'; 
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'; 

const clientConfig = sanityClient.config();
const projectId = clientConfig.projectId;
const dataset = clientConfig.dataset;

let builder: ReturnType<typeof imageUrlBuilder> | null = null;

if (projectId && dataset) {
  builder = imageUrlBuilder({ projectId, dataset });
} else {
  console.warn(
    'Sanity `projectId` or `dataset` not found in `sanityClient` configuration. ' +
    'This is usually configured in `astro.config.mjs` via the Sanity integration ' +
    'and relies on environment variables (e.g., SANITY_STUDIO_PROJECT_ID). ' +
    'Image URLs will not be generated. ' +
    'Current config from sanityClient:', clientConfig
  );
}

export default function urlForImage(source: SanityImageSource | undefined | null) {
  if (!builder || !source || typeof source !== 'object' || !('asset' in source) || !source.asset) {
    return null;
  }
  try {
    return builder.image(source);
  } catch (error) {
    console.error('Error building image with sanityImageUrl utility:', error, 'Source was:', source);
    return null;
  }
}
