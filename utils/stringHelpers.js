// utils/stringHelpers.js
export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatCityName(city) {
  const exceptions = {
    'nyc': 'New York City',
    'la': 'Los Angeles',
    'sf': 'San Francisco',
    'dc': 'Washington DC'
  };
  
  return exceptions[city.toLowerCase()] || capitalizeFirst(city);
}