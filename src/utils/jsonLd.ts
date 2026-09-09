/**
 * Serializes a schema.org object for a `<script type="application/ld+json">` tag.
 * `<` is escaped so content can never close the script tag early.
 */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
