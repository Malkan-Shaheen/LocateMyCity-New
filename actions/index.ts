'use server';

// Import JSON data directly
import rockCitiesData from '@/data/rock_cities.json';
import springCitiesData from '@/data/spring_cities.json';
import colorCitiesData from '@/data/color_cities.json';

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

// Server action to get unique states from any dataset
export async function getUniqueStates(dataset: 'rock' | 'spring' | 'color'): Promise<string[]> {
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
export async function getLocationStats(dataset: 'rock' | 'spring' | 'color'): Promise<{
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
  dataset: 'rock' | 'spring' | 'color', 
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
  dataset: 'rock' | 'spring' | 'color',
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
}> {
  try {
    const [rockStats, springStats, colorStats] = await Promise.all([
      getLocationStats('rock'),
      getLocationStats('spring'),
      getLocationStats('color')
    ]);
    
    return {
      rock: { total: rockStats.total, states: rockStats.states },
      spring: { total: springStats.total, states: springStats.states },
      color: { total: colorStats.total, states: colorStats.states }
    };
  } catch (error) {
    console.error('Error getting all datasets info:', error);
    throw new Error('Failed to get datasets information');
  }
}