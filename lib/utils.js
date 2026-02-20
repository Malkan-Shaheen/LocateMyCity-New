/**
 * Parse slug into display city names for titles and H1.
 * Handles "how-far-is-{from}-from-{to}" and "{from}-from-{to}" formats.
 * @param {string} slug - URL slug (e.g. "how-far-is-miami-from-new-york")
 * @returns {{ city1: string, city2: string }}
 */
export function parseCitiesFromSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return { city1: 'Here', city2: 'There' };
  }
  const withoutPrefix = slug.replace(/^how-far-is-/, '');
  const parts = withoutPrefix.split('-from-');
  const city1 = (parts[0] || '').trim();
  const city2 = (parts[1] || '').trim();

  const formatCity = (str) =>
    (str || '')
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  return {
    city1: formatCity(city1),
    city2: formatCity(city2),
  };
}
