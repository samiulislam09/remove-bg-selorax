
/**
 * Resolves an image path to a full URL.
 * - Full URLs (http/https) are returned as-is.
 * - S3 filenames are prefixed with the S3 endpoint.
 */
export function getImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${"https://assets.selorax.io"}/${path}`;
}

/**
 * Parses a comma-separated image string (from the SeloraX API)
 * into an array of resolved URLs.
 */
export function parseImages(images: string | null | undefined): string[] {
  if (!images) return [];
  return images
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(getImageUrl);
}

/**
 * Resolves all variant image strings in a product response to full URLs.
 * Call this server-side before sending data to the client.
 */
export function resolveProductImages<
  T extends { variants?: { images?: string | null }[] },
>(product: T): T & { variants?: (T["variants"] extends (infer V)[] ? V & { resolved_images: string[] } : never)[] } {
  if (!product.variants) return product as never;
  return {
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      resolved_images: parseImages(v.images),
    })),
  } as never;
}
