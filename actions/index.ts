'use server';

// Import JSON data directly
import rockCitiesData from '@/data/rock_cities.json';
import springCitiesData from '@/data/spring_cities.json';
import colorCitiesData from '@/data/color_cities.json';
import newCitiesData from '@/data/cities-with-new-in-name.json';
import beachData from '@/data/beach_json.json';
import fortData from '@/data/fort_json.json';
import riverData from '@/data/river_json.json';
import sanData from '@/data/san_json.json';
import oldData from '@/data/old_location.json';
import cityThemesMetadata from '@/data/city-themes-metadata.json';


// Define types for our data structures
export interface LocationData {
  name: string;
  state: string;
  slug: string;
  population: number;
  lat: number;
  lon: number;
  country: string;
  county: string | null;
  gnis_id: number;
  status?: string;
  feature_class?: string;
}

export interface StateGroupedData {
  [state: string]: LocationData[];
}

// Helper function to flatten state-grouped data
function flattenStateGroupedData(data: StateGroupedData): LocationData[] {
  return Object.keys(data).flatMap(state =>
    data[state].map(item => ({ ...item, state }))
  );
}

// Helper function to normalize location data from JSON arrays
function normalizeLocationData(data: any[]): LocationData[] {
  return data
    .filter(item => item.name && item.state && item.lat && item.lon)
    .map(location => ({
      name: location.name.trim(),
      state: location.state,
      slug: `${location.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}-${location.state.toLowerCase()}`,
      population: location.population || 0,
      lat: location.lat,
      lon: location.lon,
      country: 'US',
      county: location.county || null,
      gnis_id: location.id || location.gnis_id || 0,
      status: 'location',
      feature_class: location.feature_class || 'L'
    }));
}

// Server action to get rock cities data
export async function getRockCities(): Promise<LocationData[]> {
  try {
    // Rock cities data is a flat array, not state-grouped
    if (!Array.isArray(rockCitiesData)) {
      throw new Error('Rock cities data should be an array');
    }
    
    return rockCitiesData.map(location => ({
      name: location.name.trim(), // Remove trailing spaces
      state: location.state,
      slug: `${location.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}-${location.state.toLowerCase()}`,
      population: 0, // Rock cities data doesn't have population
      lat: location.lat,
      lon: location.lon,
      country: 'US', // All rock cities are in US
      county: location.county,
      gnis_id: 0, // Rock cities data doesn't have gnis_id
      status: 'location',
      feature_class: 'L'
    }));
  } catch (error) {
    console.error('Error loading rock cities data:', error);
    throw new Error('Failed to load rock cities data');
  }
}

// Server action to get spring cities data
export async function getSpringCities(): Promise<LocationData[]> {
  try {
    return flattenStateGroupedData(springCitiesData as unknown as StateGroupedData);
  } catch (error) {
    console.error('Error loading spring cities data:', error);
    throw new Error('Failed to load spring cities data');
  }
}

// Server action to get color cities data
export async function getColorCities(): Promise<LocationData[]> {
  try {
    return flattenStateGroupedData(colorCitiesData as unknown as StateGroupedData);
  } catch (error) {
    console.error('Error loading color cities data:', error);
    throw new Error('Failed to load color cities data');
  }
}

// ---------------------------
// NEW: Server action to get "New" cities data
// ---------------------------
export async function getNewCities(): Promise<LocationData[]> {
  try {
    if (!Array.isArray(newCitiesData)) {
      throw new Error('New cities data should be an array');
    }
    
    return newCitiesData.map(location => ({
      name: location.name.trim(),
      state: location.state,
      slug: `${location.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}-${location.state.toLowerCase()}`,
      population: 0,
      lat: location.lat,
      lon: location.lon,
      country: 'US',
      county: location.county ?? null,
      gnis_id: 0,
      status: 'location',
      feature_class: 'L'
    }));
  } catch (error) {
    console.error('Error loading New cities data:', error);
    throw new Error('Failed to load New cities data');
  }
}

// Server action to get beach locations data
export async function getBeachLocations(): Promise<LocationData[]> {
  try {
    if (!Array.isArray(beachData)) {
      throw new Error('Beach data should be an array');
    }
    return normalizeLocationData(beachData);
  } catch (error) {
    console.error('Error loading beach locations data:', error);
    throw new Error('Failed to load beach locations data');
  }
}

// Server action to get fort locations data
export async function getFortLocations(): Promise<LocationData[]> {
  try {
    if (!Array.isArray(fortData)) {
      throw new Error('Fort data should be an array');
    }
    return normalizeLocationData(fortData);
  } catch (error) {
    console.error('Error loading fort locations data:', error);
    throw new Error('Failed to load fort locations data');
  }
}

// Server action to get river locations data
export async function getRiverLocations(): Promise<LocationData[]> {
  try {
    if (!Array.isArray(riverData)) {
      throw new Error('River data should be an array');
    }
    return normalizeLocationData(riverData);
  } catch (error) {
    console.error('Error loading river locations data:', error);
    throw new Error('Failed to load river locations data');
  }
}

// Server action to get san locations data
export async function getSanLocations(): Promise<LocationData[]> {
  try {
    if (!Array.isArray(sanData)) {
      throw new Error('San data should be an array');
    }
    return normalizeLocationData(sanData);
  } catch (error) {
    console.error('Error loading san locations data:', error);
    throw new Error('Failed to load san locations data');
  }
}

// Server action to get old locations data
export async function getOldLocations(): Promise<LocationData[]> {
  try {
    if (!Array.isArray(oldData)) {
      throw new Error('Old data should be an array');
    }
    return normalizeLocationData(oldData);
  } catch (error) {
    console.error('Error loading old locations data:', error);
    throw new Error('Failed to load old locations data');
  }
}

// Placeholder functions for lake and port (if JSON files don't exist)
export async function getLakeLocations(): Promise<LocationData[]> {
  try {
    // If lake_json.json exists, import it and use it
    // For now, return empty array as placeholder
    return [];
  } catch (error) {
    console.error('Error loading lake locations data:', error);
    throw new Error('Failed to load lake locations data');
  }
}

export async function getPortLocations(): Promise<LocationData[]> {
  try {
    // If port_json.json exists, import it and use it
    // For now, return empty array as placeholder
    return [];
  } catch (error) {
    console.error('Error loading port locations data:', error);
    throw new Error('Failed to load port locations data');
  }
}

// Server action to get page metadata for city themes
export async function getCityThemeMetadata(theme: 'beach' | 'fort' | 'lake' | 'new' | 'old' | 'port' | 'river' | 'san' | 'rock' | 'spring') {
  try {
    const metadata = (cityThemesMetadata as any)[theme];
    if (!metadata) {
      throw new Error(`Metadata not found for theme: ${theme}`);
    }
    return metadata;
  } catch (error) {
    console.error(`Error loading metadata for theme ${theme}:`, error);
    throw new Error(`Failed to load metadata for theme: ${theme}`);
  }
}

// Server action to get spring cities grouped by state
export async function getSpringCitiesByState(): Promise<StateGroupedData> {
  try {
    return springCitiesData as unknown as StateGroupedData;
  } catch (error) {
    console.error('Error loading spring cities by state:', error);
    throw new Error('Failed to load spring cities by state');
  }
}

// Server action to get rock cities grouped by state
export async function getRockCitiesByState(): Promise<StateGroupedData> {
  try {
    // Rock cities data is a flat array, so we need to group it by state
    if (!Array.isArray(rockCitiesData)) {
      throw new Error('Rock cities data should be an array');
    }
    
    const groupedData: StateGroupedData = {};
    rockCitiesData.forEach(location => {
      const state = location.state;
      if (!groupedData[state]) {
        groupedData[state] = [];
      }
      groupedData[state].push({
        name: location.name.trim(),
        state: location.state,
        slug: `${location.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}-${location.state.toLowerCase()}`,
        population: 0,
        lat: location.lat,
        lon: location.lon,
        country: 'US',
        county: location.county,
        gnis_id: 0,
        status: 'location',
        feature_class: 'L'
      });
    });
    
    return groupedData;
  } catch (error) {
    console.error('Error loading rock cities by state:', error);
    throw new Error('Failed to load rock cities by state');
  }
}

// Server action to get color cities grouped by state
export async function getColorCitiesByState(): Promise<StateGroupedData> {
  try {
    return colorCitiesData as unknown as StateGroupedData;
  } catch (error) {
    console.error('Error loading color cities by state:', error);
    throw new Error('Failed to load color cities by state');
  }
}

// ---------------------------
// NEW: Server action to get "New" cities grouped by state
// ---------------------------
export async function getNewCitiesByState(): Promise<StateGroupedData> {
  try {
    if (!Array.isArray(newCitiesData)) {
      throw new Error('New cities data should be an array');
    }

    const groupedData: StateGroupedData = {};

    newCitiesData.forEach(location => {
      const state = location.state;

      if (!groupedData[state]) {
        groupedData[state] = [];
      }

      groupedData[state].push({
        name: location.name.trim(),
        state: location.state,
        slug: `${location.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}-${location.state.toLowerCase()}`,
        population: 0,
        lat: location.lat,
        lon: location.lon,
        country: 'US',
        county: location.county ?? null,
        gnis_id: 0,
        status: 'location',
        feature_class: 'L'
      });
    });

    return groupedData;
  } catch (error) {
    console.error('Error loading New cities by state:', error);
    throw new Error('Failed to load New cities by state');
  }
}

// Server action to get unique states from any dataset
export async function getUniqueStates(dataset: 'rock' | 'spring' | 'color' | 'new'): Promise<string[]> {
  try {
    let data: LocationData[];
    
    switch (dataset) {
      case 'rock':
        data = await getRockCities();
        break;
      case 'spring':
        data = await getSpringCities();
        break;
      case 'color':
        data = await getColorCities();
        break;
      case 'new':
        data = await getNewCities();
        break;
      default:
        throw new Error('Invalid dataset specified');
    }
    
    return [...new Set(data.map(item => item.state))].sort();
  } catch (error) {
    console.error('Error getting unique states:', error);
    throw new Error('Failed to get unique states');
  }
}

// Server action to get statistics for any dataset
export async function getLocationStats(dataset: 'rock' | 'spring' | 'color' | 'new'): Promise<{
  total: number;
  states: number;
  commonNames: Array<[string, number]>;
  statesWithMost: Array<[string, number]>;
}> {
  try {
    let data: LocationData[];
    
    switch (dataset) {
      case 'rock':
        data = await getRockCities();
        break;
      case 'spring':
        data = await getSpringCities();
        break;
      case 'color':
        data = await getColorCities();
        break;
      case 'new':
        data = await getNewCities();
        break;
      default:
        throw new Error('Invalid dataset specified');
    }
    
    // Calculate name frequency
    const nameFrequency: { [key: string]: number } = {};
    data.forEach(location => {
      nameFrequency[location.name] = (nameFrequency[location.name] || 0) + 1;
    });
    
    // Calculate state frequency
    const stateFrequency: { [key: string]: number } = {};
    data.forEach(location => {
      stateFrequency[location.state] = (stateFrequency[location.state] || 0) + 1;
    });
    
    const uniqueStates = [...new Set(data.map(item => item.state))];
    
    return {
      total: data.length,
      states: uniqueStates.length,
      commonNames: Object.entries(nameFrequency).sort((a, b) => b[1] - a[1]).slice(0, 10),
      statesWithMost: Object.entries(stateFrequency).sort((a, b) => b[1] - a[1]).slice(0, 10)
    };
  } catch (error) {
    console.error('Error getting location stats:', error);
    throw new Error('Failed to get location statistics');
  }
}

// Server action to get locations by specific state
export async function getLocationsByState(
  dataset: 'rock' | 'spring' | 'color' | 'new', 
  state: string
): Promise<LocationData[]> {
  try {
    let data: LocationData[];
    
    switch (dataset) {
      case 'rock':
        data = await getRockCities();
        break;
      case 'spring':
        data = await getSpringCities();
        break;
      case 'color':
        data = await getColorCities();
        break;
      case 'new':
        data = await getNewCities();
        break;
      default:
        throw new Error('Invalid dataset specified');
    }
    
    return data.filter(location => location.state === state);
  } catch (error) {
    console.error('Error getting locations by state:', error);
    throw new Error('Failed to get locations by state');
  }
}

// Server action to search locations by name
export async function searchLocations(
  dataset: 'rock' | 'spring' | 'color' | 'new',
  searchTerm: string
): Promise<LocationData[]> {
  try {
    let data: LocationData[];
    
    switch (dataset) {
      case 'rock':
        data = await getRockCities();
        break;
      case 'spring':
        data = await getSpringCities();
        break;
      case 'color':
        data = await getColorCities();
        break;
      case 'new':
        data = await getNewCities();
        break;
      default:
        throw new Error('Invalid dataset specified');
    }
    
    const searchLower = searchTerm.toLowerCase();
    return data.filter(location => 
      location.name.toLowerCase().includes(searchLower) ||
      location.state.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching locations:', error);
    throw new Error('Failed to search locations');
  }
}

// Server action to get all available datasets info
export async function getAllDatasetsInfo(): Promise<{
  rock: { total: number; states: number };
  spring: { total: number; states: number };
  color: { total: number; states: number };
  new: { total: number; states: number };
}> {
  try {
    const [rockStats, springStats, colorStats, newStats] = await Promise.all([
      getLocationStats('rock'),
      getLocationStats('spring'),
      getLocationStats('color'),
      getLocationStats('new')
    ]);
    
    return {
      rock: { total: rockStats.total, states: rockStats.states },
      spring: { total: springStats.total, states: springStats.states },
      color: { total: colorStats.total, states: colorStats.states },
      new: { total: newStats.total, states: newStats.states }
    };
  } catch (error) {
    console.error('Error getting all datasets info:', error);
    throw new Error('Failed to get datasets information');
  }
}
