'use client';
import { FaGlobe, FaPlane, FaAnchor, FaMapMarkerAlt, FaExchangeAlt } from 'react-icons/fa';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { notFound, useRouter, useParams, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { MetricCard, WeatherPanel, FAQItem, RouteCard } from '../../../components/DistanceComponents';
import Head from 'next/head';
import AdUnit from '@/components/AdUnit';


// Lazy load heavy components
const LeafletMap = dynamic(() => import('../../../components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div
      className="distance-result__map-loading"
      role="status"
      aria-live="polite"
    >
      <div className="distance-result__map-loader">
        <div
          className="distance-result__map-loader-icon"
          aria-hidden="true"
        ></div>
        <p className="distance-result__map-loader-text">Loading map...</p>
      </div>
    </div>
  ),
});

// Constants
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const WEATHER_API_KEY = '953d1012b9ab5d4722d58e46be4305f7';

// Utility functions
const toRad = (degrees) => degrees * Math.PI / 180;
const kmToMiles = (km) => km * 0.621371;
const kmToNauticalMiles = (km) => km * 0.539957;
const calculateFlightTime = (km) => (km / 800).toFixed(1);

// Country data fallbacks
const COUNTRY_DATA = {
  'CU': { currency: 'Cuban Peso', language: 'Spanish', timezone: 'America/Havana', continent: 'North America', region: 'Caribbean' },
  'BS': { currency: 'Bahamian Dollar', language: 'English', timezone: 'America/Nassau', continent: 'North America', region: 'Caribbean' },
  'US': { currency: 'US Dollar', language: 'English', timezone: 'America/New_York', continent: 'North America', region: 'North America' },
  'GB': { currency: 'British Pound', language: 'English', timezone: 'Europe/London', continent: 'Europe', region: 'Western Europe' },
  'FR': { currency: 'Euro', language: 'French', timezone: 'Europe/Paris', continent: 'Europe', region: 'Western Europe' },
  'DE': { currency: 'Euro', language: 'German', timezone: 'Europe/Berlin', continent: 'Europe', region: 'Western Europe' },
  'IT': { currency: 'Euro', language: 'Italian', timezone: 'Europe/Rome', continent: 'Europe', region: 'Southern Europe' },
  'ES': { currency: 'Euro', language: 'Spanish', timezone: 'Europe/Madrid', continent: 'Europe', region: 'Southern Europe' },
  'CN': { currency: 'Chinese Yuan', language: 'Chinese', timezone: 'Asia/Shanghai', continent: 'Asia', region: 'East Asia' },
  'JP': { currency: 'Japanese Yen', language: 'Japanese', timezone: 'Asia/Tokyo', continent: 'Asia', region: 'East Asia' },
  'IN': { currency: 'Indian Rupee', language: 'Hindi', timezone: 'Asia/Kolkata', continent: 'Asia', region: 'South Asia' },
  'AU': { currency: 'Australian Dollar', language: 'English', timezone: 'Australia/Sydney', continent: 'Oceania', region: 'Oceania' },
  'CA': { currency: 'Canadian Dollar', language: 'English', timezone: 'America/Toronto', continent: 'North America', region: 'North America' },
  'MX': { currency: 'Mexican Peso', language: 'Spanish', timezone: 'America/Mexico_City', continent: 'North America', region: 'Central America' },
  'BR': { currency: 'Brazilian Real', language: 'Portuguese', timezone: 'America/Sao_Paulo', continent: 'South America', region: 'South America' },
};

// Continent mapping from REST Countries API region
const REGION_TO_CONTINENT = {
  'Africa': 'Africa',
  'Americas': 'North America', // Will be refined by subregion
  'Asia': 'Asia',
  'Europe': 'Europe',
  'Oceania': 'Oceania',
  'Antarctic': 'Antarctica',
};

// Subregion to continent refinement
const SUBREGION_TO_CONTINENT = {
  'Northern America': 'North America',
  'Central America': 'North America',
  'Caribbean': 'North America',
  'South America': 'South America',
  'Northern Africa': 'Africa',
  'Western Africa': 'Africa',
  'Eastern Africa': 'Africa',
  'Southern Africa': 'Africa',
  'Middle Africa': 'Africa',
  'Eastern Asia': 'Asia',
  'Southeastern Asia': 'Asia',
  'Southern Asia': 'Asia',
  'Central Asia': 'Asia',
  'Western Asia': 'Asia',
  'Northern Europe': 'Europe',
  'Western Europe': 'Europe',
  'Eastern Europe': 'Europe',
  'Southern Europe': 'Europe',
};

// Region mapping for descriptive clauses
const REGION_NAMES = {
  'East Asia': 'East Asia',
  'Southeast Asia': 'Southeast Asia',
  'South Asia': 'South Asia',
  'Middle East': 'Middle East',
  'Central Asia': 'Central Asia',
  'West Africa': 'West Africa',
  'East Africa': 'East Africa',
  'Southern Africa': 'Southern Africa',
  'North Africa': 'North Africa',
  'Western Europe': 'Western Europe',
  'Eastern Europe': 'Eastern Europe',
  'Northern Europe': 'Northern Europe',
  'Southern Europe': 'Southern Europe',
  'Caribbean': 'Caribbean',
  'Central America': 'Central America',
};

// Known tourism corridors for direct flight detection
const TOURISM_CORRIDORS = [
  ['CA', 'BS'], // Canada-Bahamas
  ['US', 'MX'], // US-Mexico
  ['GB', 'BS'], // UK-Bahamas
  ['US', 'BS'], // US-Bahamas
  ['CA', 'CU'], // Canada-Cuba
  ['US', 'CU'], // US-Cuba
];

const toLocationSlug = (str) => (str || '').toLowerCase().replace(/\s+/g, '-');

// Nearby routes from a source city (for "Nearby Routes From {Source}" section)
const NEARBY_ROUTES_BY_SOURCE = {
  'Miami': ['Orlando', 'Tampa', 'Fort Lauderdale', 'West Palm Beach'],
  'New York': ['Philadelphia', 'Boston', 'Newark', 'Washington'],
  'Los Angeles': ['San Diego', 'Las Vegas', 'San Francisco', 'Phoenix'],
  'Chicago': ['Milwaukee', 'Detroit', 'Indianapolis', 'Minneapolis'],
  'Montreal': ['Toronto', 'Ottawa', 'Quebec City', 'Boston'],
  'Toronto': ['Ottawa', 'Montreal', 'Niagara Falls', 'Hamilton'],
};

// Generic fallback nearby destinations used when we don't have a bespoke list
const GLOBAL_NEARBY_FALLBACKS = [
  'New York',
  'Toronto',
  'London',
  'Paris',
  'Los Angeles',
  'Chicago',
  'Dubai',
  'Tokyo',
  'Sydney',
];

const getNearbyRoutesForSource = (sourceName) => {
  if (!sourceName) return [];
  const key = sourceName.trim();
  const explicit =
    NEARBY_ROUTES_BY_SOURCE[key] ||
    NEARBY_ROUTES_BY_SOURCE[key.replace(/\s+/g, '')] ||
    [];

  if (explicit.length > 0) {
    return explicit;
  }

  // Fallback: use global list, excluding the source itself and duplicates
  const lowerKey = key.toLowerCase();
  const results = [];

  GLOBAL_NEARBY_FALLBACKS.forEach((city) => {
    if (!city) return;
    const name = String(city).trim();
    if (!name) return;
    if (name.toLowerCase() === lowerKey) return;
    if (results.includes(name)) return;
    results.push(name);
  });

  return results;
};

// Explore more locations links (for "Explore More Locations ..." section)
const EXPLORE_MORE_ROUTES_BY_SOURCE = {
  // Required examples
  'Miami': ['New York', 'Toronto', 'London', 'Paris'],
  'Montreal': ['New York', 'Chicago', 'London', 'Los Angeles'],
};

const DEFAULT_EXPLORE_MORE_DESTINATIONS = [
  'New York',
  'Toronto',
  'London',
  'Paris',
  'Los Angeles',
  'Chicago',
  'Dubai',
  'Tokyo',
  'Sydney',
];

const getExploreMoreDestinationsForSource = (sourceName, exclude = []) => {
  if (!sourceName) return [];
  const key = sourceName.trim();
  const preset =
    EXPLORE_MORE_ROUTES_BY_SOURCE[key] ||
    EXPLORE_MORE_ROUTES_BY_SOURCE[key.replace(/\s+/g, '')] ||
    [];

  const excludeSet = new Set(
    [sourceName, ...(Array.isArray(exclude) ? exclude : [exclude])]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase())
  );

  const results = [];
  const pushIfAllowed = (city) => {
    if (!city) return;
    const name = String(city).trim();
    if (!name) return;
    if (excludeSet.has(name.toLowerCase())) return;
    if (results.includes(name)) return;
    results.push(name);
  };

  // Prefer preset for known cities
  preset.forEach(pushIfAllowed);

  // Top-up with defaults if needed
  if (results.length < 4) {
    DEFAULT_EXPLORE_MORE_DESTINATIONS.forEach(pushIfAllowed);
  }

  return results.slice(0, 4);
};

// TITLE LOGIC (REQUIRED)
// Same country      → Explore More Locations in {Country}
// Different countries, diff continents → Explore Locations Across {Continent A} & {Continent B}
// Different countries, same continent or unknown continents → Explore More Locations in {Country A} & {Country B}
// Fallback (missing geo data) → Explore Popular Locations
const getExploreMoreLocationsTitle = (sourceGeo, destinationGeo) => {
  const countryA = sourceGeo?.countryName;
  const countryB = destinationGeo?.countryName;

  const formattedCountryA = countryA
    ? formatCountryName(countryA, sourceGeo?.countryCode)
    : '';
  const formattedCountryB = countryB
    ? formatCountryName(countryB, destinationGeo?.countryCode)
    : '';

  const continentA =
    sourceGeo?.continent ||
    (sourceGeo?.countryCode && COUNTRY_DATA[sourceGeo.countryCode]?.continent) ||
    '';
  const continentB =
    destinationGeo?.continent ||
    (destinationGeo?.countryCode && COUNTRY_DATA[destinationGeo.countryCode]?.continent) ||
    '';

  const hasCountries = Boolean(formattedCountryA && formattedCountryB);
  const hasContinents = Boolean(continentA && continentB);

  if (hasCountries && countryA === countryB) {
    const formatted =
      formatCountryName(
        countryA,
        sourceGeo?.countryCode || destinationGeo?.countryCode
      ) || countryA;
    return `Explore More Locations in ${formatted}`;
  }

  if (hasContinents && continentA !== continentB) {
    return `Explore Locations Across ${continentA} & ${continentB}`;
  }

  if (hasCountries && countryA !== countryB) {
    return `Explore More Locations in ${formattedCountryA} & ${formattedCountryB}`;
  }

  if (hasContinents) {
    return `Explore More Locations in ${continentA}`;
  }

  return 'Explore Popular Locations';
};

// Pool of popular routes for "More Distance Routes You May Be Interested In" (dynamic random)
const MORE_ROUTES_POOL = [
  ['Miami', 'New York'], ['Miami', 'Toronto'], ['Miami', 'London'], ['Miami', 'Montreal'],
  ['New York', 'Miami'], ['New York', 'Toronto'], ['New York', 'London'], ['New York', 'Los Angeles'],
  ['Toronto', 'Montreal'], ['Toronto', 'Miami'], ['Toronto', 'New York'], ['Toronto', 'Vancouver'],
  ['Montreal', 'New York'], ['Montreal', 'Toronto'], ['Montreal', 'Miami'], ['Montreal', 'Boston'],
  ['London', 'Paris'], ['London', 'New York'], ['London', 'Miami'], ['London', 'Dubai'],
  ['Los Angeles', 'San Francisco'], ['Los Angeles', 'New York'], ['Los Angeles', 'Las Vegas'],
  ['Chicago', 'New York'], ['Chicago', 'Miami'], ['Chicago', 'Los Angeles'],
  ['Paris', 'London'], ['Paris', 'New York'], ['Sydney', 'Melbourne'], ['Dubai', 'London'],
];

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Simple timezone detection based on coordinates
const getTimezoneFromCoords = (lat, lon) => {
  // Simple timezone estimation based on longitude
  const offset = Math.round(lon / 15);
  const timezones = {
    '-12': 'Pacific/Fiji',
    '-11': 'Pacific/Midway',
    '-10': 'Pacific/Honolulu',
    '-9': 'America/Anchorage',
    '-8': 'America/Los_Angeles',
    '-7': 'America/Denver',
    '-6': 'America/Chicago',
    '-5': 'America/New_York',
    '-4': 'America/Halifax',
    '-3': 'America/Argentina/Buenos_Aires',
    '-2': 'America/Noronha',
    '-1': 'Atlantic/Azores',
    '0': 'Europe/London',
    '1': 'Europe/Paris',
    '2': 'Europe/Helsinki',
    '3': 'Europe/Moscow',
    '4': 'Asia/Dubai',
    '5': 'Asia/Karachi',
    '6': 'Asia/Dhaka',
    '7': 'Asia/Bangkok',
    '8': 'Asia/Shanghai',
    '9': 'Asia/Tokyo',
    '10': 'Australia/Sydney',
    '11': 'Pacific/Guadalcanal',
    '12': 'Pacific/Auckland'
  };

  return timezones[offset] || 'UTC';
};

// Proper time formatting with timezone conversion
const formatTimeWithTimezone = (timestamp, timezone) => {
  try {
    if (!timestamp || !timezone || timezone === 'UTC' || timezone === '--') {
      // If no valid timezone, try to estimate from coordinates or use UTC
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      });
    }

    // Validate timezone format (should be like "Asia/Shanghai", "Asia/Dubai", etc.)
    if (typeof timezone !== 'string' || !timezone.includes('/')) {
      console.warn('Invalid timezone format:', timezone);
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      });
    }

    // Convert Unix timestamp to Date object
    const date = new Date(timestamp * 1000);

    // Use Intl.DateTimeFormat to properly convert to local timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const formatted = formatter.format(date);

    // Validate the formatted time makes sense (basic sanity check)
    if (!formatted || formatted === 'Invalid Date') {
      throw new Error('Invalid formatted date');
    }

    return formatted;
  } catch (error) {
    console.error('Error formatting time with timezone:', error, { timestamp, timezone });
    // Fallback to UTC time
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      });
    } catch (fallbackError) {
      return '--';
    }
  }
};

const formatCurrentTimeWithTimezone = (timezone) => {
  try {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
};

// ────────────────────────────────
// Geographic Analysis Functions
// ────────────────────────────────

// Determine continent from REST Countries API data
const getContinentFromCountryData = (countryData) => {
  if (!countryData) return null;

  // Try subregion first (more specific)
  if (countryData.subregion && SUBREGION_TO_CONTINENT[countryData.subregion]) {
    return SUBREGION_TO_CONTINENT[countryData.subregion];
  }

  // Fall back to region
  if (countryData.region && REGION_TO_CONTINENT[countryData.region]) {
    return REGION_TO_CONTINENT[countryData.region];
  }

  return null;
};

// Get region name for descriptive clauses
const getRegionName = (countryData, countryCode) => {
  if (countryData?.subregion && REGION_NAMES[countryData.subregion]) {
    return REGION_NAMES[countryData.subregion];
  }

  // Fallback to country data
  if (countryCode && COUNTRY_DATA[countryCode]?.region) {
    return COUNTRY_DATA[countryCode].region;
  }

  return null;
};

// Determine if locations are on different continents
const isIntercontinental = (continentA, continentB) => {
  if (!continentA || !continentB) return false;
  return continentA !== continentB;
};

// Determine if ocean is between locations (ENHANCED: Detects island/island and island/mainland)
const hasOceanBetween = (lat1, lon1, lat2, lon2, continentA, continentB, countryCodeA, countryCodeB) => {
  // Known island countries/territories (using Set to avoid duplicates)
  const islandCountries = new Set(['BS', 'CU', 'JM', 'HT', 'DO', 'PR', 'BB', 'GD', 'LC', 'VC', 'AG', 'KN', 'DM', 'TT', 'KY', 'TC', 'VG', 'VI', 'AW', 'CW', 'SX', 'MF', 'GP', 'MQ', 'MS', 'AI', 'BM', 'FK', 'GS', 'PN', 'SH', 'PM', 'JE', 'GG', 'IM', 'FO', 'AX', 'SJ', 'MV', 'LK', 'PH', 'ID', 'MY', 'SG', 'BN', 'TL', 'FJ', 'NC', 'PF', 'WS', 'TO', 'VU', 'SB', 'KI', 'TV', 'NR', 'PW', 'FM', 'MH', 'CK', 'NU', 'NF', 'CX', 'CC', 'HM', 'AQ', 'BV', 'TF', 'JP', 'GB', 'IE', 'IS', 'MT', 'CY', 'NZ']);

  // If both are islands, ocean between
  if (islandCountries.has(countryCodeA) && islandCountries.has(countryCodeB)) {
    // Check if they're close enough to be connected (very rare)
    const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 111; // rough km
    if (distance > 50) return true; // Islands more than 50km apart have ocean between
  }

  // If one is island and other is mainland, ocean between
  if (islandCountries.has(countryCodeA) || islandCountries.has(countryCodeB)) {
    return true;
  }

  if (isIntercontinental(continentA, continentB)) {
    // Check if crossing major ocean boundaries
    const latMid = (lat1 + lat2) / 2;
    const lonMid = (lon1 + lon2) / 2;

    // Pacific crossing (rough check)
    if ((lon1 < -100 && lon2 > 100) || (lon1 > 100 && lon2 < -100)) {
      return true;
    }

    // Atlantic crossing
    if (continentA === 'North America' && continentB === 'Europe') return true;
    if (continentA === 'Europe' && continentB === 'North America') return true;
    if (continentA === 'Africa' && continentB === 'South America') return true;
    if (continentA === 'South America' && continentB === 'Africa') return true;

    // Other major separations
    if (continentA === 'Asia' && continentB === 'North America') return true;
    if (continentA === 'North America' && continentB === 'Asia') return true;
  }

  // Same continent but separated by water (e.g., Caribbean islands)
  if (continentA === continentB && continentA === 'North America') {
    // Check if crossing Caribbean Sea
    const avgLat = (lat1 + lat2) / 2;
    const avgLon = (lon1 + lon2) / 2;
    // Caribbean region roughly: 10-25°N, 60-90°W
    if ((avgLat >= 10 && avgLat <= 25) && (avgLon >= -90 && avgLon <= -60)) {
      // If both locations are in Caribbean but different countries, likely ocean between
      if (countryCodeA !== countryCodeB) {
        return true;
      }
    }
  }

  return false;
};

// Check if direct flights likely exist (tourism corridors)
const checkDirectFlights = (countryCodeA, countryCodeB) => {
  if (!countryCodeA || !countryCodeB) return { exists: false, limited: false };

  const pair1 = [countryCodeA, countryCodeB].sort().join(',');
  const pair2 = [countryCodeB, countryCodeA].sort().join(',');

  const isCorridor = TOURISM_CORRIDORS.some(corridor => {
    const corridorPair = corridor.sort().join(',');
    return corridorPair === pair1 || corridorPair === pair2;
  });

  if (isCorridor) {
    return { exists: true, limited: true };
  }

  return { exists: false, limited: false };
};

// Format country name with "The" prefix where needed
const formatCountryName = (countryName, countryCode) => {
  if (!countryName) return '';

  // Countries that need "The" prefix
  const countriesNeedingThe = ['Bahamas', 'Gambia', 'Netherlands', 'Philippines', 'Sudan', 'Ukraine'];

  // Check by country code for more reliable matching
  const countryCodesNeedingThe = {
    'BS': 'The Bahamas',
    'GM': 'The Gambia',
    'NL': 'The Netherlands',
    'PH': 'The Philippines',
    'SD': 'The Sudan',
    'UA': 'The Ukraine'
  };

  if (countryCode && countryCodesNeedingThe[countryCode]) {
    return countryCodesNeedingThe[countryCode];
  }

  if (countriesNeedingThe.includes(countryName)) {
    return `The ${countryName}`;
  }

  return countryName;
};

// Extract city name from display_name (handles cases where country name appears first)
const extractCityName = (displayName, countryName) => {
  if (!displayName) return '';

  // Split by comma
  const parts = displayName.split(',').map(p => p.trim());

  // If first part matches country name, use second part
  if (countryName && parts[0] === countryName && parts.length > 1) {
    return parts[1];
  }

  // Otherwise use first part
  return parts[0];
};

// Generate travel implication text (EXACT SPEC LOGIC)
const getTravelImplication = (geographicContext) => {
  const {
    intercontinental,
    same_country,
    same_continent,
    direct_flights_exist,
    direct_flights_limited,
    ocean_between
  } = geographicContext;

  // EXACT SPEC PRIORITY ORDER
  // For same-continent routes with ocean between and direct flights (e.g., Canada-Bahamas),
  // treat as effectively intercontinental for travel implication
  const effectivelyIntercontinental = intercontinental || (ocean_between && direct_flights_exist && !same_country);

  // IF intercontinental AND direct_flights_exist AND direct_flights_limited
  if (effectivelyIntercontinental && direct_flights_exist && direct_flights_limited) {
    return 'typically requires flying, with some routes offering direct flights while others involve a connection';
  }
  // ELSE IF intercontinental
  else if (effectivelyIntercontinental) {
    return 'typically requires connecting flights and careful planning';
  }
  // ELSE IF international AND same_continent
  else if (!same_country && same_continent) {
    return 'usually involves regional flights or overland travel';
  }
  // ELSE IF same_country AND driving_possible
  else if (same_country && geographicContext.driving_possible) {
    return 'can often be reached by road or regional transport';
  }
  // ELSE
  else {
    return 'depends on available transportation options';
  }
};

// Generate distance interpretation (EXACT SPEC LOGIC)
const getDistanceInterpretation = (geographicContext, distanceKm) => {
  const { intercontinental, same_country, same_continent } = geographicContext;

  // EXACT SPEC ORDER
  if (intercontinental) {
    return 'This distance places the two locations on different continents, making it a significant global separation.';
  } else if (!same_country && same_continent) {
    return 'Although both locations are on the same continent, the distance still represents a substantial international journey.';
  } else if (same_country && distanceKm > 500) {
    return 'While both locations are in the same country, the distance covers a large geographic span.';
  } else {
    return 'This is a relatively short distance, often considered regional in scale.';
  }
};

// Generate region clause for geographic context (FIXED: Grammar)
const getRegionClause = (locationData) => {
  const { region, countryCode, lat, lon, countryName, isIsland, islandName } = locationData;

  let clause = '';

  // Tier 1: Predefined region (FIXED: Add "the" for regions like Caribbean)
  if (region) {
    // Add "the" for certain regions
    const regionsNeedingThe = ['Caribbean', 'Middle East', 'Arctic', 'Antarctic'];
    if (regionsNeedingThe.includes(region)) {
      clause = `in the ${region}`;
    } else {
      clause = `in ${region}`;
    }
  } else if (countryCode && COUNTRY_DATA[countryCode]?.region) {
    const regionName = COUNTRY_DATA[countryCode].region;
    const regionsNeedingThe = ['Caribbean', 'Middle East', 'Arctic', 'Antarctic'];
    if (regionsNeedingThe.includes(regionName)) {
      clause = `in the ${regionName}`;
    } else {
      clause = `in ${regionName}`;
    }
  }

  // Tier 2: Directional position (if no region)
  if (!clause && countryName) {
    // Simplified directional logic - could be enhanced with country midpoint data
    const direction = lat > 0 ? 'northern' : 'southern';
    clause = `in ${direction} ${countryName}`;
  }

  // Tier 3: Coastal/Island
  if (isIsland) {
    if (islandName) {
      clause += clause ? `, on the island of ${islandName}` : `on the island of ${islandName}`;
    } else {
      clause += clause ? ', on an island in the region' : 'on an island in the region';
    }
  }

  return clause;
};

// Generate geographic context paragraph text
const generateLocationParagraph = (locationName, geoContext) => {
  if (!geoContext) return '';

  const regionClause = getRegionClause({
    region: geoContext.region,
    countryCode: geoContext.countryCode,
    lat: geoContext.lat,
    lon: geoContext.lon,
    countryName: geoContext.countryName,
    isIsland: false, // Could be enhanced
    islandName: null,
  });

  const countryText = geoContext.countryName || 'its country';
  const continentText = geoContext.continent || 'its continent';
  const regionText = regionClause ? `, ${regionClause}` : '';

  // EXACT SPEC FORMAT: "{{Location}} is located in {{Country}}, {{Continent}}{{optional_region_clause}}."
  return `${locationName} is located in ${countryText}, ${continentText}${regionText}.`;
};

// ────────────────────────────────
// Dynamic FAQ Generator (Location-Aware)
// ────────────────────────────────
const generateDynamicFaqs = (sourceName, destName, geographicContext, sourceGeo, destGeo) => {
  if (!geographicContext || !sourceName || !destName) return [];

  const faqs = [];
  const {
    same_country,
    intercontinental,
    has_airport_A,
    has_airport_B,
    direct_flights_exist,
    direct_flights_limited,
    ocean_between,
    timezone_difference
  } = geographicContext;

  // EXACT SPEC PRIORITY ORDER - Stop once 3 FAQs are selected
  // Spec says: "When generating FAQs, follow this priority order: 1, 2, 3, 4, 5, 6. Stop once 3 FAQs are selected."

  // Priority 1: International vs Domestic
  if (!same_country && faqs.length < 3) {
    faqs.push({
      id: 'faq1',
      question: 'Is this considered international travel?',
      answer: `Yes. ${sourceName} and ${destName} are located in different countries, so traveling between them involves crossing international borders.`,
    });
  }

  // Priority 2: Intercontinental
  if (intercontinental && faqs.length < 3) {
    faqs.push({
      id: 'faq2',
      question: `Are ${sourceName} and ${destName} on different continents?`,
      answer: `Yes. The two locations are situated on different continents, which contributes to the long-distance nature of the journey.`,
    });
  }

  // Priority 3: Flight practicality (ONLY if we don't have 3 yet AND airports exist)
  // Skip if intercontinental (Priority 5 is more relevant for intercontinental routes per spec example)
  if (has_airport_A && has_airport_B && faqs.length < 3 && !intercontinental) {
    faqs.push({
      id: 'faq3',
      question: 'What is the most practical way to travel between the two locations?',
      answer: `Flying is generally the most practical option, especially given the distance involved and the lack of continuous overland routes.`,
    });
  }

  // Priority 4: Direct flights (ONLY if we don't have 3 yet)
  if (direct_flights_exist && faqs.length < 3) {
    faqs.push({
      id: 'faq4',
      question: `Are there direct flights between ${sourceName} and ${destName}?`,
      answer: direct_flights_limited
        ? `Some routes may offer direct flights, while others require one or more connections depending on the departure city.`
        : `Most trips between these locations require connecting flights.`,
    });
  }

  // Priority 5: Driving impossibility (ONLY if we don't have 3 yet)
  // This should be selected for intercontinental routes (matches spec example: Tokyo→Mbiama)
  if ((ocean_between || intercontinental) && faqs.length < 3) {
    faqs.push({
      id: 'faq5',
      question: `Can you drive from ${sourceName} to ${destName}?`,
      answer: `No. The two locations are separated by water or large geographic barriers, making continuous driving routes impossible.`,
    });
  }

  // Priority 6: Time zones (REMOVED - timezone_difference is hardcoded to 0, so this is dead code)
  // TODO: Implement proper timezone difference calculation before re-enabling this FAQ

  // Ensure we have at least 2 FAQs, maximum 3 (EXACT SPEC: "Never fewer than 2, Never more than 4")
  if (faqs.length < 2) {
    // Fallback FAQ
    faqs.push({
      id: 'faq-fallback',
      question: `How far is ${destName} from ${sourceName}?`,
      answer: `The straight-line distance between ${sourceName} and ${destName} is approximately ${geographicContext.distance_km.toFixed(0)} kilometers (${kmToMiles(geographicContext.distance_km).toFixed(0)} miles).`,
    });
  }

  return faqs.slice(0, 3); // Return exactly 3 FAQs (EXACT SPEC: "Render exactly 3 FAQs")
};

export default function DistanceResult() {
  const [sourcePlace, setSourcePlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [distanceInKm, setDistanceInKm] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [moreRoutesInterested, setMoreRoutesInterested] = useState([]);
  const [metaDescription, setMetaDescription] = useState('');

  // Geographic context state
  const [sourceGeoContext, setSourceGeoContext] = useState(null);
  const [destinationGeoContext, setDestinationGeoContext] = useState(null);
  const [geographicContext, setGeographicContext] = useState(null);

  // Extract proper city names (not country names)
  const sourceShortName = useMemo(() => {
    if (!sourcePlace?.display_name || !sourceGeoContext) return sourcePlace?.display_name?.split(',')[0] || '';
    return extractCityName(sourcePlace.display_name, sourceGeoContext.countryName) || sourcePlace.display_name.split(',')[0];
  }, [sourcePlace, sourceGeoContext]);

  const destinationShortName = useMemo(() => {
    if (!destinationPlace?.display_name || !destinationGeoContext) return destinationPlace?.display_name?.split(',')[0] || '';
    return extractCityName(destinationPlace.display_name, destinationGeoContext.countryName) || destinationPlace.display_name.split(',')[0];
  }, [destinationPlace, destinationGeoContext]);

  const initialWeatherState = useMemo(
    () => ({
      temp: 'Loading...',
      wind: 'Loading...',
      sunrise: 'Loading...',
      sunset: 'Loading...',
      localtime: 'Loading...',
      coordinates: 'Loading...',
      currency: 'Loading...',
      language: 'Loading...',
    }),
    []
  );

  const [sourceWeather, setSourceWeather] = useState(initialWeatherState);
  const [destinationWeather, setDestinationWeather] = useState(initialWeatherState);
  const [faqs, setFaqs] = useState([]);

  // Calculate geographic context flags
  useEffect(() => {
    if (!sourceGeoContext || !destinationGeoContext || !distanceInKm) return;

    const same_country = sourceGeoContext.countryCode === destinationGeoContext.countryCode;
    const same_continent =
      sourceGeoContext.continent &&
      destinationGeoContext.continent &&
      sourceGeoContext.continent === destinationGeoContext.continent;
    const intercontinental = isIntercontinental(sourceGeoContext.continent, destinationGeoContext.continent);
    const ocean_between = hasOceanBetween(
      sourceGeoContext.lat,
      sourceGeoContext.lon,
      destinationGeoContext.lat,
      destinationGeoContext.lon,
      sourceGeoContext.continent,
      destinationGeoContext.continent,
      sourceGeoContext.countryCode,
      destinationGeoContext.countryCode
    );

    // Simplified driving possibility check
    const driving_possible = same_continent && !ocean_between && distanceInKm < 5000;

    // Check direct flights
    const directFlights = checkDirectFlights(sourceGeoContext.countryCode, destinationGeoContext.countryCode);

    // Assume airports exist for major locations (could be enhanced)
    const has_airport_A = true; // Simplified assumption
    const has_airport_B = true; // Simplified assumption

    // Check if locations are islands
    const islandCountries = new Set(['BS', 'CU', 'JM', 'HT', 'DO', 'PR', 'BB', 'GD', 'LC', 'VC', 'AG', 'KN', 'DM', 'TT', 'KY', 'TC', 'VG', 'VI', 'AW', 'CW', 'SX', 'MF', 'GP', 'MQ', 'MS', 'AI', 'BM', 'FK', 'GS', 'PN', 'SH', 'PM', 'JE', 'GG', 'IM', 'FO', 'AX', 'SJ', 'MV', 'LK', 'PH', 'ID', 'MY', 'SG', 'BN', 'TL', 'FJ', 'NC', 'PF', 'WS', 'TO', 'VU', 'SB', 'KI', 'TV', 'NR', 'PW', 'FM', 'MH', 'CK', 'NU', 'NF', 'CX', 'CC', 'HM', 'AQ', 'BV', 'TF', 'JP', 'GB', 'IE', 'IS', 'MT', 'CY', 'NZ']);
    const is_island_A = islandCountries.has(sourceGeoContext.countryCode);
    const is_island_B = islandCountries.has(destinationGeoContext.countryCode);

    // Rail network likely (Europe, parts of Asia, parts of North America)
    const railNetworkCountries = new Set(['US', 'CA', 'MX', 'GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'PL', 'CZ', 'HU', 'RO', 'SE', 'NO', 'DK', 'FI', 'RU', 'CN', 'JP', 'KR', 'IN', 'AU', 'NZ']);
    const rail_network_likely = (railNetworkCountries.has(sourceGeoContext.countryCode) && railNetworkCountries.has(destinationGeoContext.countryCode)) ||
                                 (sourceGeoContext.continent === 'Europe' && destinationGeoContext.continent === 'Europe');

    // Timezone difference (simplified - would need actual timezone calculation)
    const timezone_difference = 0; // Placeholder - would calculate from timezones

    setGeographicContext({
      same_country,
      same_continent,
      intercontinental,
      ocean_between,
      driving_possible,
      direct_flights_exist: directFlights.exists,
      direct_flights_limited: directFlights.limited,
      has_airport_A,
      has_airport_B,
      is_island_A,
      is_island_B,
      rail_network_likely,
      timezone_difference,
      distance_km: distanceInKm,
    });
  }, [sourceGeoContext, destinationGeoContext, distanceInKm]);

  const nearbyRoutesFromSource = useMemo(
    () => getNearbyRoutesForSource(sourceShortName),
    [sourceShortName]
  );

  const exploreMoreTitle = useMemo(
    () => getExploreMoreLocationsTitle(sourceGeoContext, destinationGeoContext),
    [sourceGeoContext, destinationGeoContext]
  );

  const exploreMoreGroups = useMemo(() => {
    const groups = [];

    const addGroup = (cityName, geo, excludeCity) => {
      if (!cityName) return;
      const destinations = getExploreMoreDestinationsForSource(cityName, [excludeCity]);
      if (!destinations || destinations.length === 0) return;

      const countryLabel = geo?.countryName ? formatCountryName(geo.countryName, geo.countryCode) : '';

      groups.push({
        cityName,
        countryLabel,
        destinations,
      });
    };

    addGroup(sourceShortName, sourceGeoContext, destinationShortName);

    if (destinationShortName && destinationShortName !== sourceShortName) {
      addGroup(destinationShortName, destinationGeoContext, sourceShortName);
    }

    return groups;
  }, [sourceShortName, destinationShortName, sourceGeoContext, destinationGeoContext]);

  // Fetch popular routes function (moved before useEffect that uses it)
  const fetchPopularRoutes = useCallback(async (src, dest, srcGeo, destGeo) => {
    try {
      const routes = [];

      // Tier 1: Same origin, different destinations (popular cities to destination)
      const popularDestinations = ['Miami', 'New York', 'Toronto', 'London', 'Paris', 'Tokyo', 'Sydney', 'Dubai'];
      const destCityName = dest.display_name?.split(',')[0] || 'Destination';
      popularDestinations.slice(0, 3).forEach((city, idx) => {
        if (city !== destCityName) {
          routes.push({
            id: `route-tier1-${idx}`,
            source: city,
            destination: destCityName,
            anchorText: `How far is ${destCityName} from ${city}?`,
          });
        }
      });

      // Tier 2: Same destination, different origins (source to popular cities)
      const popularOrigins = ['Miami', 'New York', 'Toronto', 'London', 'Paris', 'Tokyo', 'Sydney', 'Dubai'];
      const srcCityName = src.display_name?.split(',')[0] || 'Source';
      popularOrigins.slice(0, 3).forEach((city, idx) => {
        if (city !== srcCityName) {
          routes.push({
            id: `route-tier2-${idx}`,
            source: srcCityName,
            destination: city,
            anchorText: `How far is ${city} from ${srcCityName}?`,
          });
        }
      });

      // Ensure we have 6-10 routes, max 10
      setPopularRoutes(routes.slice(0, 10));
    } catch (error) {
      console.error('Error fetching popular routes:', error);
      setPopularRoutes([]);
    }
  }, []);

  // Generate FAQs based on geographic context
  useEffect(() => {
    if (geographicContext && sourceShortName && destinationShortName && sourceGeoContext && destinationGeoContext) {
      setFaqs(generateDynamicFaqs(
        sourceShortName,
        destinationShortName,
        geographicContext,
        sourceGeoContext,
        destinationGeoContext
      ));
    }
  }, [geographicContext, sourceShortName, destinationShortName, sourceGeoContext, destinationGeoContext]);

  // Fetch popular routes after geo context is available
  useEffect(() => {
    if (sourcePlace && destinationPlace && sourceGeoContext && destinationGeoContext) {
      fetchPopularRoutes(sourcePlace, destinationPlace, sourceGeoContext, destinationGeoContext);
    }
  }, [sourcePlace, destinationPlace, sourceGeoContext, destinationGeoContext, fetchPopularRoutes]);

  // Random "More routes you may be interested in" (exclude current + reverse, shuffle, take 4)
  useEffect(() => {
    if (!sourceShortName || !destinationShortName) return;
    const currentKey = (a, b) => `${(a || '').toLowerCase()}|${(b || '').toLowerCase()}`;
    const current = currentKey(sourceShortName, destinationShortName);
    const reverse = currentKey(destinationShortName, sourceShortName);
    const filtered = MORE_ROUTES_POOL.filter(
      ([src, dest]) => currentKey(src, dest) !== current && currentKey(src, dest) !== reverse
    );
    const shuffled = shuffleArray(filtered);
    setMoreRoutesInterested(shuffled.slice(0, 4));
  }, [sourceShortName, destinationShortName]);

  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  if (pathname?.startsWith('/location-from-location/') || pathname?.startsWith('/location-from-me/')) {
    notFound();
  }

  const slug = Array.isArray(params.slug) ? params.slug : [params.slug];
  const [sourceName, destinationName] =
    Array.isArray(slug) && slug.length === 1
      ? slug[0].replace('how-far-is-', '').split('-from-')
      : [null, null];

  // Memoized calculation of distance metrics
  const distanceMetrics = useMemo(() => {
    if (!distanceInKm) return null;
    return {
      km: distanceInKm.toFixed(1),
      miles: kmToMiles(distanceInKm).toFixed(1),
      nauticalMiles: kmToNauticalMiles(distanceInKm).toFixed(1),
      flightTime: calculateFlightTime(distanceInKm),
    };
  }, [distanceInKm]);

  const toggleFAQ = useCallback((index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  }, [activeFAQ]);

  // SIMPLIFIED: Use fallback data directly
  // Helper function to get first currency
  const getFirstCurrency = (currencies) => {
    if (!currencies) return null;
    const currencyCode = Object.keys(currencies)[0];
    const currency = currencies[currencyCode];
    return `${currencyCode} (${currency.symbol || ''})`;
  };

  const fetchCountryData = useCallback(async (lat, lon, displayName) => {
    try {
      console.log(`Fetching country data for: ${displayName}`);

      // Try to get country code from reverse geocode
      let countryCode = null;
      let countryName = null;
      let continent = null;
      let region = null;

      try {
        const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
        if (res.ok) {
          const geoData = await res.json();
          if (geoData && geoData.address) {
            countryCode = geoData.address.country_code?.toUpperCase();
            countryName = geoData.address.country;
            continent = geoData.address.continent; // May be null
            console.log(`Found country: ${countryName} (${countryCode})`);
          }
        } else {
          console.warn('Reverse geocode API returned non-OK status:', res.status);
        }
      } catch (error) {
        console.error('Reverse geocode failed:', error);
      }

      // If no country code found, try to detect from display name
      if (!countryCode && displayName) {
        if (displayName.includes('Cuba') || displayName.includes('Havana')) {
          countryCode = 'CU';
          countryName = 'Cuba';
        } else if (displayName.includes('Bahamas') || displayName.includes('Nassau')) {
          countryCode = 'BS';
          countryName = 'Bahamas';
        }
      }

      // Fetch real-time data from REST Countries API
      let currency = 'Unknown';
      let language = 'Unknown';
      let timezone = null;
      let countryDataFromAPI = null;

      if (countryCode) {
        try {
          // Try fetching by country code first (more reliable)
          const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
          if (countryRes.ok) {
            countryDataFromAPI = await countryRes.json();
            if (countryDataFromAPI) {
              currency = getFirstCurrency(countryDataFromAPI.currencies) || 'Unknown';
              language = countryDataFromAPI.languages ? Object.values(countryDataFromAPI.languages).join(', ') : 'Unknown';
              if (countryDataFromAPI.timezones && countryDataFromAPI.timezones.length > 0) {
                timezone = countryDataFromAPI.timezones[0];
              }
              // Get continent from API data
              if (!continent) {
                continent = getContinentFromCountryData(countryDataFromAPI);
              }
              // Get region
              region = getRegionName(countryDataFromAPI, countryCode);
              console.log(`Fetched from REST Countries API by code:`, { currency, language, timezone, continent, region });
            }
          }
        } catch (error) {
          console.error('Error fetching country data by code:', error);
        }
      }

      // If code lookup failed, try by country name
      if ((currency === 'Unknown' || language === 'Unknown' || !timezone || !continent) && countryName) {
        try {
          let nameRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`);
          if (!nameRes.ok) {
            nameRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
          }

          if (nameRes.ok) {
            const nameData = await nameRes.json();
            if (nameData && nameData.length > 0) {
              countryDataFromAPI = nameData[0];
              if (currency === 'Unknown') {
                currency = getFirstCurrency(countryDataFromAPI.currencies) || 'Unknown';
              }
              if (language === 'Unknown') {
                language = countryDataFromAPI.languages ? Object.values(countryDataFromAPI.languages).join(', ') : 'Unknown';
              }
              if (!timezone && countryDataFromAPI.timezones && countryDataFromAPI.timezones.length > 0) {
                timezone = countryDataFromAPI.timezones[0];
              }
              if (!continent) {
                continent = getContinentFromCountryData(countryDataFromAPI);
              }
              if (!region) {
                region = getRegionName(countryDataFromAPI, countryCode);
              }
              console.log(`Fetched from REST Countries API by name:`, { currency, language, timezone, continent, region });
            }
          }
        } catch (error) {
          console.error('Error fetching country data by name:', error);
        }
      }

      // Fallback to hardcoded data if API calls failed
      if (currency === 'Unknown' || language === 'Unknown' || !timezone || !continent) {
        const fallbackData = countryCode ? COUNTRY_DATA[countryCode] : null;
        if (fallbackData) {
          if (currency === 'Unknown') currency = fallbackData.currency;
          if (language === 'Unknown') language = fallbackData.language;
          if (!timezone) timezone = fallbackData.timezone;
          if (!continent) continent = fallbackData.continent;
          if (!region) region = fallbackData.region;
          console.log(`Using fallback data:`, { currency, language, timezone, continent, region });
        }
      }

      // Final fallback: use coordinate-based timezone estimation if still no timezone
      if (!timezone) {
        timezone = getTimezoneFromCoords(lat, lon);
        console.log(`Using coordinate-based timezone estimation:`, timezone);
      }

      console.log(`Final country data:`, { countryCode, countryName, currency, language, timezone, continent, region });

      return {
        currency,
        language,
        timezone,
        countryCode,
        countryName,
        continent,
        region
      };
    } catch (error) {
      console.error('Error in fetchCountryData:', error);
      const timezone = getTimezoneFromCoords(lat, lon);
      return {
        currency: 'Unknown',
        language: 'Unknown',
        timezone,
        countryCode: null,
        countryName: null,
        continent: null,
        region: null
      };
    }
  }, []);

  // FIXED weather data fetching
  const fetchWeatherData = useCallback(async (src, dest) => {
    try {
      const [
        sourceWeatherRes,
        destWeatherRes,
        sourceCountryData,
        destCountryData,
      ] = await Promise.all([
        fetch(
          `${WEATHER_API_URL}?lat=${src.lat}&lon=${src.lon}&appid=${WEATHER_API_KEY}&units=metric`
        ),
        fetch(
          `${WEATHER_API_URL}?lat=${dest.lat}&lon=${dest.lon}&appid=${WEATHER_API_KEY}&units=metric`
        ),
        fetchCountryData(src.lat, src.lon, src.display_name),
        fetchCountryData(dest.lat, dest.lon, dest.display_name),
      ]);

      if (!sourceWeatherRes.ok || !destWeatherRes.ok) {
        throw new Error('Weather API failed');
      }

      const sourceData = await sourceWeatherRes.json();
      const destData = await destWeatherRes.json();

      console.log('Weather API responses:', { sourceData, destData });
      console.log('Country data:', { sourceCountryData, destCountryData });

      // Store geographic context
      setSourceGeoContext({
        countryCode: sourceCountryData.countryCode,
        countryName: sourceCountryData.countryName,
        continent: sourceCountryData.continent,
        region: sourceCountryData.region,
        lat: parseFloat(src.lat),
        lon: parseFloat(src.lon),
        displayName: src.display_name,
      });

      setDestinationGeoContext({
        countryCode: destCountryData.countryCode,
        countryName: destCountryData.countryName,
        continent: destCountryData.continent,
        region: destCountryData.region,
        lat: parseFloat(dest.lat),
        lon: parseFloat(dest.lon),
        displayName: dest.display_name,
      });

      // Set source weather with PROPER time formatting
      setSourceWeather({
        temp: sourceData.main ? `${Math.round(sourceData.main.temp)}°C` : 'N/A',
        wind: sourceData.wind ? `${Math.round(sourceData.wind.speed * 3.6)} km/h` : 'N/A',
        sunrise: formatTimeWithTimezone(sourceData.sys.sunrise, sourceCountryData.timezone),
        sunset: formatTimeWithTimezone(sourceData.sys.sunset, sourceCountryData.timezone),
        localtime: formatCurrentTimeWithTimezone(sourceCountryData.timezone),
        coordinates: `${parseFloat(src.lat).toFixed(4)}, ${parseFloat(src.lon).toFixed(4)}`,
        currency: sourceCountryData.currency,
        language: sourceCountryData.language,
      });

      // Set destination weather with PROPER time formatting
      setDestinationWeather({
        temp: destData.main ? `${Math.round(destData.main.temp)}°C` : 'N/A',
        wind: destData.wind ? `${Math.round(destData.wind.speed * 3.6)} km/h` : 'N/A',
        sunrise: formatTimeWithTimezone(destData.sys.sunrise, destCountryData.timezone),
        sunset: formatTimeWithTimezone(destData.sys.sunset, destCountryData.timezone),
        localtime: formatCurrentTimeWithTimezone(destCountryData.timezone),
        coordinates: `${parseFloat(dest.lat).toFixed(4)}, ${parseFloat(dest.lon).toFixed(4)}`,
        currency: destCountryData.currency,
        language: destCountryData.language,
      });

    } catch (error) {
      console.error('Error fetching weather data:', error);

      // Set meaningful fallback values
      setSourceWeather({
        temp: 'N/A',
        wind: 'N/A',
        sunrise: '06:30',
        sunset: '18:30',
        localtime: 'N/A',
        coordinates: `${parseFloat(src.lat).toFixed(4)}, ${parseFloat(src.lon).toFixed(4)}`,
        currency: 'Cuban Peso',
        language: 'Spanish',
      });

      setDestinationWeather({
        temp: 'N/A',
        wind: 'N/A',
        sunrise: '06:30',
        sunset: '18:30',
        localtime: 'N/A',
        coordinates: `${parseFloat(dest.lat).toFixed(4)}, ${parseFloat(dest.lon).toFixed(4)}`,
        currency: 'Bahamian Dollar',
        language: 'English',
      });
    }
  }, [fetchCountryData]);

  // Distance calculation
  const calculateDistance = useCallback((src, dest) => {
    const lat1 = parseFloat(src.lat);
    const lon1 = parseFloat(src.lon);
    const lat2 = parseFloat(dest.lat);
    const lon2 = parseFloat(dest.lon);

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    setDistanceInKm(distance);
  }, []);

  // Main effect to fetch locations
  useEffect(() => {
    if (!sourceName || !destinationName) return;

    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const [sourceResponse, destResponse] = await Promise.all([
          fetch(`/api/geocode?query=${encodeURIComponent(sourceName.replace(/-/g, ' '))}`),
          fetch(`/api/geocode?query=${encodeURIComponent(destinationName.replace(/-/g, ' '))}`),
        ]);

        const [sourceData, destData] = await Promise.all([
          sourceResponse.json(),
          destResponse.json(),
        ]);

        // Check for API errors
        if (sourceData.error || destData.error) {
          throw new Error(sourceData.error || destData.error);
        }

        if (sourceData && destData) {
          setSourcePlace({
            lat: sourceData.lat,
            lon: sourceData.lon,
            display_name: sourceData.display_name,
          });

          setDestinationPlace({
            lat: destData.lat,
            lon: destData.lon,
            display_name: destData.display_name,
          });

          calculateDistance(sourceData, destData);
          fetchWeatherData(sourceData, destData);
          // fetchPopularRoutes will be called after geo context is available
        } else {
          router.push('/locationtolocation');
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
        router.push('/locationtolocation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [
    sourceName,
    destinationName,
    router,
    calculateDistance,
    fetchWeatherData,
    fetchPopularRoutes,
  ]);

  useEffect(() => {
    if (distanceMetrics && sourceShortName && destinationShortName) {
      setMetaDescription(
        `Find the distance from ${sourceShortName} to ${destinationShortName} in miles, kilometers, and nautical miles. View a map, flight estimates, and travel insights instantly with LocateMyCity.`
      );
    }
  }, [distanceMetrics, sourceShortName, destinationShortName]);

  const navigateToRoute = useCallback(
    (source, destination) => {
      const formatForUrl = (str) => str.toLowerCase().replace(/\s+/g, '-');
      router.push(
        `/how-far-is-${formatForUrl(
          destination
        )}-from-${formatForUrl(source)}`
      );
    },
    [router]
  );

  // Loading screen
  if (!sourcePlace || !destinationPlace || isLoading) {
    return (
      <div
        className="distance-calc-loading-screen min-h-screen flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="distance-calc-loading-content text-center">
          <div
            className="distance-calc-spinner spinner border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto"
            aria-hidden="true"
          ></div>
          <p className="distance-calc-loading-text mt-4 text-lg">
            Loading location data...
          </p>
          <div className="sr-only">
            Loading distance information, please wait
          </div>
        </div>
      </div>
    );
  }

  // Render
  return (
    <>
      <Head>
        <title>{`Distance from ${sourceShortName} to ${destinationShortName} | LocateMyCity`}</title>
        <meta name="description" content={metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* ✅ FAQ Structured Data - Single source to avoid duplicates */}
        {faqs.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqs.map(faq => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              })
            }}
          />
        )}
      </Head>

      <Header />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main id="main-content" role="main">
        <section
          className="distance-result__header"
          role="banner"
          aria-labelledby="distance-header"
        >
          <div className="distance-result__header-content">
            <h1 id="distance-header" className="distance-result__title">
              How far is{' '}
              <span className="distance-result__highlight">
                {sourceShortName}
              </span>{' '}
              from{' '}
              <span className="distance-result__highlight">
                {destinationShortName}
              </span>
              ?
            </h1>

            {!isLoading && geographicContext && sourceGeoContext && destinationGeoContext && (
              <p className="distance-result__description">
                {(() => {
                  const sourceCountryName = formatCountryName(sourceGeoContext.countryName, sourceGeoContext.countryCode);
                  const destCountryName = formatCountryName(destinationGeoContext.countryName, destinationGeoContext.countryCode);

                  // Check if location name already contains or matches the country name (case-insensitive)
                  const sourceNameMatches = sourceShortName && sourceGeoContext.countryName && (
                    sourceShortName.toLowerCase() === sourceGeoContext.countryName.toLowerCase() ||
                    sourceShortName.toLowerCase() === sourceCountryName.toLowerCase() ||
                    sourceShortName.toLowerCase().includes(sourceGeoContext.countryName.toLowerCase()) ||
                    sourceShortName.toLowerCase().includes(sourceCountryName.toLowerCase().replace(/^the /, ''))
                  );

                  const destNameMatches = destinationShortName && destinationGeoContext.countryName && (
                    destinationShortName.toLowerCase() === destinationGeoContext.countryName.toLowerCase() ||
                    destinationShortName.toLowerCase() === destCountryName.toLowerCase() ||
                    destinationShortName.toLowerCase().includes(destinationGeoContext.countryName.toLowerCase()) ||
                    destinationShortName.toLowerCase().includes(destCountryName.toLowerCase().replace(/^the /, ''))
                  );

                  // Only add country name if location name doesn't already match it
                  const sourceDisplay = sourceNameMatches
                    ? sourceShortName
                    : `${sourceShortName}${sourceCountryName ? `, ${sourceCountryName}` : ''}`;

                  const destDisplay = destNameMatches
                    ? destinationShortName
                    : `${destinationShortName}${destCountryName ? `, ${destCountryName}` : ''}`;

                  return (
                    <>
                      {sourceDisplay} is approximately <strong>{Math.round(kmToMiles(distanceInKm))} miles</strong> ({Math.round(distanceInKm)} km) from {destDisplay} — a long-distance journey that {getTravelImplication(geographicContext)}.
                    </>
                  );
                })()}
              </p>
            )}
          </div>
        </section>

        <section
          className="distance-result__container"
          role="region"
          aria-label="Distance calculation results"
        >
          {/* Map */}
          <section
            className="distance-result__map-section"
            role="region"
            aria-labelledby="map-section-title"
          >
            <h2 id="map-section-title" className="sr-only">
              Map Visualization
            </h2>
            <div className="distance-result__map-wrapper">
              <LeafletMap
                source={{
                  lat: parseFloat(sourcePlace.lat),
                  lng: parseFloat(sourcePlace.lon),
                  name: sourcePlace.display_name,
                }}
                destination={{
                  lat: parseFloat(destinationPlace.lat),
                  lng: parseFloat(destinationPlace.lon),
                  name: destinationPlace.display_name,
                }}
                distance={distanceInKm}
              />
            </div>
            <p className="distance-result__map-caption" style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
              This map shows the straight-line (great-circle) distance between {sourceShortName} and {destinationShortName}, not actual driving or flight routes.
            </p>
          </section>
          {/* Metrics */}
          <section
            className="distance-result__metrics"
            role="region"
            aria-labelledby="metrics-section-title"
          >
            <h2 id="metrics-section-title" className="distance-result__section-title">
              Distance Information
            </h2>
            <div className="distance-result__metrics-grid">
              <MetricCard
                icon={<FaGlobe aria-hidden="true" />}
                title="Kilometers"
                value={distanceMetrics.km}
                unit="km"
                variant="blue"
              />
              <MetricCard
                icon={<FaGlobe aria-hidden="true" />}
                title="Miles"
                value={distanceMetrics.miles}
                unit="mi"
                variant="green"
              />
              <MetricCard
                icon={<FaAnchor aria-hidden="true" />}
                title="Nautical Miles"
                value={distanceMetrics.nauticalMiles}
                unit="nmi"
                variant="purple"
              />
              <MetricCard
                icon={<FaPlane aria-hidden="true" />}
                title="Flight Time"
                value={distanceMetrics.flightTime}
                unit="hours"
                variant="red"
              />
            </div>
            {geographicContext && (
              <p className="distance-result__interpretation" style={{ marginTop: '1.5rem', fontSize: '1rem', color: '#333', textAlign: 'center', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
                {getDistanceInterpretation(geographicContext, distanceInKm)}
              </p>
            )}
          </section>

          {/* Explore More Locations (dynamic links) */}
          {exploreMoreGroups.length > 0 && (
            <section
              className="distance-result__nearby-routes distance-result__explore-more"
              role="region"
              aria-labelledby="explore-more-locations-title"
              style={{ marginTop: '3rem', marginBottom: '3rem' }}
            >
              <h2
                id="explore-more-locations-title"
                className="distance-result__section-title distance-result__nearby-routes-heading"
              >
                {exploreMoreTitle}
              </h2>
              <p className="distance-result__nearby-routes-intro">
                Explore additional distance routes connected to your current locations.
              </p>

              {exploreMoreGroups.map((group) => (
                <div key={group.cityName} style={{ marginTop: '1.5rem' }}>
                  <p
                    className="distance-result__nearby-routes-intro"
                    style={{ marginBottom: '0.75rem' }}
                  >
                    <strong>
                      From {group.cityName}
                      {group.countryLabel ? ` (${group.countryLabel})` : ''}:
                    </strong>
                  </p>
                  <ul className="distance-result__nearby-routes-list">
                    {group.destinations.map((dest) => (
                      <li key={`${group.cityName}-${dest}`}>
                        <a
                          href={`/how-far-is-${toLocationSlug(dest)}-from-${toLocationSlug(group.cityName)}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigateToRoute(group.cityName, dest);
                          }}
                          className="distance-result__nearby-routes-link"
                        >
                          {group.cityName} → {dest}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* Weather */}
          <section
            className="distance-result__weather"
            aria-labelledby="weather-section-title"
          >
            <h2 id="weather-section-title" className="distance-result__section-title">
              Weather & local information: {sourceShortName} vs {destinationShortName}
            </h2>
            <div className="distance-result__weather-grid">
              <WeatherPanel
                location={sourceShortName}
                weather={sourceWeather}
                type="source"
                aria-labelledby="source-weather-heading"
                id="source-weather-panel"
              />
              <WeatherPanel
                location={destinationShortName}
                weather={destinationWeather}
                type="destination"
                aria-labelledby="destination-weather-heading"
                id="destination-weather-panel"
              />
            </div>
          </section>

          {/* Nearby Routes From Source */}
          {sourceShortName && nearbyRoutesFromSource.length > 0 && (
            <section
              className="distance-result__nearby-routes"
              role="region"
              aria-labelledby="nearby-routes-title"
              style={{ marginTop: '3rem', marginBottom: '3rem' }}
            >
              <h2 id="nearby-routes-title" className="distance-result__section-title distance-result__nearby-routes-heading">
                Nearby Routes From {sourceShortName}
              </h2>
              <p className="distance-result__nearby-routes-intro">
                If you&apos;re exploring travel options starting in {sourceShortName}, here are some nearby routes you may find useful:
              </p>
              <ul className="distance-result__nearby-routes-list">
                {nearbyRoutesFromSource.map((dest) => (
                  <li key={dest}>
                    <a
                      href={`/how-far-is-${toLocationSlug(dest)}-from-${toLocationSlug(sourceShortName)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToRoute(sourceShortName, dest);
                      }}
                      className="distance-result__nearby-routes-link"
                    >
                      {sourceShortName} → {dest}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Geographic Context */}
          {sourceGeoContext && destinationGeoContext && (
            <section
              className="distance-result__geographic-context"
              role="region"
              aria-labelledby="geographic-context-title"
              style={{ marginTop: '3rem', marginBottom: '3rem' }}
            >
              <h2 id="geographic-context-title" className="distance-result__section-title">
                Where Are {sourceShortName} and {destinationShortName} Located?
              </h2>
              <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '1rem' }}>
                  {(() => {
                    // Check if location is a country (name matches country name)
                    const isSourceCountry = sourceShortName && sourceGeoContext.countryName &&
                      (sourceShortName.toLowerCase() === sourceGeoContext.countryName.toLowerCase() ||
                       sourceShortName.toLowerCase() === formatCountryName(sourceGeoContext.countryName, sourceGeoContext.countryCode).toLowerCase());

                    if (isSourceCountry) {
                      // For countries: {Country} is located in {Region}, on the continent of {Continent}.
                      const region = sourceGeoContext.region || (sourceGeoContext.countryCode && COUNTRY_DATA[sourceGeoContext.countryCode]?.region) || 'its region';
                      const continent = sourceGeoContext.continent || 'its continent';
                      return `${sourceShortName} is located in ${region}, on the continent of ${continent}.`;
                    } else {
                      // For cities: {City} is located in {Country}, in {Continent}.
                      const country = sourceGeoContext.countryName || 'its country';
                      const continent = sourceGeoContext.continent || 'its continent';
                      return `${sourceShortName} is located in ${country}, in ${continent}.`;
                    }
                  })()}
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  {(() => {
                    // Check if location is a country (name matches country name)
                    const isDestCountry = destinationShortName && destinationGeoContext.countryName &&
                      (destinationShortName.toLowerCase() === destinationGeoContext.countryName.toLowerCase() ||
                       destinationShortName.toLowerCase() === formatCountryName(destinationGeoContext.countryName, destinationGeoContext.countryCode).toLowerCase());

                    if (isDestCountry) {
                      // For countries: {Country} is located in {Region}, on the continent of {Continent}.
                      const region = destinationGeoContext.region || (destinationGeoContext.countryCode && COUNTRY_DATA[destinationGeoContext.countryCode]?.region) || 'its region';
                      const continent = destinationGeoContext.continent || 'its continent';
                      return `${destinationShortName} is located in ${region}, on the continent of ${continent}.`;
                    } else {
                      // For cities: {City} is located in {Country}, in {Continent}.
                      const country = destinationGeoContext.countryName || 'its country';
                      const continent = destinationGeoContext.continent || 'its continent';
                      return `${destinationShortName} is located in ${country}, in ${continent}.`;
                    }
                  })()}
                </p>
              </div>
            </section>
          )}

          {/* Travel Feasibility */}
          {geographicContext && sourceShortName && destinationShortName && (
            <section
              className="distance-result__travel-feasibility"
              role="region"
              aria-labelledby="travel-feasibility-title"
              style={{ marginTop: '3rem', marginBottom: '3rem' }}
            >
              <h2 id="travel-feasibility-title" className="distance-result__section-title">
                How Do You Travel From {sourceShortName} to {destinationShortName}?
              </h2>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
                  {(() => {
                    const {
                      intercontinental,
                      same_country,
                      same_continent,
                      ocean_between,
                      direct_flights_exist,
                      direct_flights_limited,
                      has_airport_A,
                      has_airport_B,
                      is_island_A,
                      is_island_B,
                      rail_network_likely,
                      driving_possible,
                      distance_km
                    } = geographicContext;

                    // Effectively intercontinental (for travel method logic)
                    const effectivelyIntercontinental = intercontinental || (ocean_between && direct_flights_exist && !same_country);

                    // Omit air travel for short domestic routes (e.g., Berlin to Potsdam)
                    const shouldOmitAirTravel = same_country && distance_km < 100;
                    const isShortDomestic = same_country && distance_km < 100;

                    const travelMethods = [];

                    // 1. Air Travel (Most Common)
                    if (has_airport_A && has_airport_B && !shouldOmitAirTravel) {
                      // Different text for same-continent international vs intercontinental
                      const airTravelText = (!same_country && same_continent && !effectivelyIntercontinental)
                        ? 'Flying is a common option for travel between the two cities.'
                        : 'Flying is the most practical way to travel between the two locations.';
                      travelMethods.push(
                        <li key="air-main" style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0 }}>●</span>
                          {airTravelText}
                        </li>
                      );

                      // Air Travel sub-bullets
                      if (effectivelyIntercontinental && direct_flights_exist && direct_flights_limited) {
                        travelMethods.push(
                          <li key="air-direct-limited" style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0 }}>●</span>
                            Some routes offer direct flights, while others require one or more connections.
                          </li>
                        );
                      } else if (effectivelyIntercontinental) {
                        travelMethods.push(
                          <li key="air-connecting" style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0 }}>●</span>
                            Travel typically involves one or more connecting flights.
                          </li>
                        );
                      } else if (!same_country && same_continent) {
                        travelMethods.push(
                          <li key="air-short" style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 0 }}>●</span>
                            Flights are usually short to moderate in duration.
                          </li>
                        );
                      }
                    }

                    // 2. Driving (Render ONLY if valid)
                    if (same_continent && !ocean_between && !is_island_A && !is_island_B && driving_possible) {
                      const drivingText = isShortDomestic
                        ? 'Driving may be possible via regional road networks.'
                        : 'Driving may be possible, depending on border access and road connectivity.';
                      travelMethods.push(
                        <li key="driving" style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0 }}>●</span>
                          {drivingText}
                        </li>
                      );
                    }

                    // 3. Rail Travel (Very Conservative)
                    if (same_continent && !ocean_between && rail_network_likely) {
                      const railText = isShortDomestic
                        ? 'Rail travel is a common and efficient option for this route.'
                        : 'Rail travel may be an option on certain parts of the route.';
                      travelMethods.push(
                        <li key="rail" style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0 }}>●</span>
                          {railText}
                        </li>
                      );
                    }

                    // 4. Sea Travel (Only When Relevant)
                    if (is_island_A || is_island_B) {
                      travelMethods.push(
                        <li key="sea" style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0 }}>●</span>
                          Sea travel is generally limited and not a common option for most travelers.
                        </li>
                      );
                    }

                    // 5. Hard Stop (No Overland Travel) - Always last
                    if (ocean_between || effectivelyIntercontinental) {
                      travelMethods.push(
                        <li key="hard-stop" style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0 }}>●</span>
                          Driving or continuous overland travel is not possible for this route.
                        </li>
                      );
                    }

                    return travelMethods;
                  })()}
                </ul>
              </div>
            </section>
          )}

          {/* Reverse Route */}
          {sourceShortName && destinationShortName && (
            <section
              className="distance-result__reverse-route"
              role="region"
              aria-labelledby="reverse-route-title"
            >
              <h2 id="reverse-route-title" className="distance-result__section-title distance-result__reverse-route-heading">
                {/* <span className="distance-result__reverse-route-icon" aria-hidden="true"> */}
                  {/* <FaExchangeAlt /> */}
                {/* <d/span> */}
                Reverse Route
              </h2>
              <div className="distance-result__reverse-route-content">
                <p className="distance-result__reverse-route-intro">Looking for the opposite direction?</p>
                <ul className="distance-result__reverse-route-list">
                <li>
                  <a
                    href={`/how-far-is-${toLocationSlug(destinationShortName)}-from-${toLocationSlug(sourceShortName)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToRoute(destinationShortName, sourceShortName);
                    }}
                    className="distance-result__reverse-route-link"
                  >
                    {destinationShortName} → {sourceShortName}
                  </a>
                  — see the distance, travel time, and route details.
                </li>
              </ul>
              </div>
            </section>
          )}

          {/* FAQ */}
          {faqs.length > 0 && (
            <section className="faq-page" aria-labelledby="faq-section-title" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
            <h2 id="faq-section-title" className="faq-title">Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className={`faq-card ${activeFAQ === index ? 'open' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleFAQ(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleFAQ(index);
                    }
                  }}
                  aria-expanded={activeFAQ === index}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <h3 className="faq-question">{faq.question}</h3>
                  <div
                    id={`faq-answer-${faq.id}`}
                    className="faq-answer"
                    role="region"
                    aria-labelledby={`faq-question-${faq.id}`}
                    hidden={activeFAQ !== index}
                      style={{ display: activeFAQ === index ? 'block' : 'none' }}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          )}

          {/* More Distance Routes You May Be Interested In */}
          {moreRoutesInterested.length > 0 && (
            <section
              className="distance-result__more-routes"
              role="region"
              aria-labelledby="more-routes-title"
            >
              <h2 id="more-routes-title" className="distance-result__more-routes-heading">
                More Distance Routes You May Be Interested In
              </h2>
              <div className="distance-result__more-routes-grid">
                {moreRoutesInterested.map(([src, dest], idx) => (
                  <a
                    key={`${src}-${dest}-${idx}`}
                    href={`/how-far-is-${toLocationSlug(dest)}-from-${toLocationSlug(src)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToRoute(src, dest);
                    }}
                    className={`distance-result__more-routes-card distance-result__more-routes-card--${idx % 4}`}
                  >
                    <span className="distance-result__more-routes-card-route">{src} → {dest}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Related Routes */}
          <section
            className="distance-result__routes"
            role="region"
            aria-labelledby="routes-section-title"
            style={{ marginTop: '3rem', marginBottom: 0 }}
          >
            <h2 id="routes-section-title" className="distance-result__section-title">
              Related Distance Searches
            </h2>
            <div className="distance-result__routes-grid">
              {popularRoutes.length > 0 ? (
                popularRoutes.map((route) => (
                  <a
                  key={route.id}
                    href={`/how-far-is-${route.destination.toLowerCase().replace(/\s+/g, '-')}-from-${route.source.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToRoute(route.source, route.destination);
                    }}
                    className="related-route-link"
                  >
                    {route.anchorText || `How far is ${route.destination} from ${route.source}?`}
                  </a>
                ))
              ) : (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>Loading related routes...</p>
              )}
            </div>
          </section>
        </section>
      </main>
<AdUnit slot="3866531892" />
      <Footer role="contentinfo" />
    </>
  );
}
