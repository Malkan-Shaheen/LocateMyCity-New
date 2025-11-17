// utils/api.js

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Get route coordinates for Leaflet map
export async function getRouteCoordinates(source, destination) {
  try {
    // For demo purposes - replace with actual geocoding service
    const coordinates = {
      'Nassau,Bahamas': { lat: 25.0343, lng: -77.3963, name: 'Nassau' },
      'Eleuthera,Bahamas': { lat: 25.1125, lng: -76.1322, name: 'Eleuthera' }
    };

    return {
      source: coordinates[source] || { lat: 25.0343, lng: -77.3963, name: 'Nassau' },
      destination: coordinates[destination] || { lat: 25.1125, lng: -76.1322, name: 'Eleuthera' },
      distance: 80 // km
    };
  } catch (error) {
    console.error('Error getting route coordinates:', error);
    throw error;
  }
}

// Fetch weather data
export async function fetchWeatherData(location) {
  try {
    // Demo data - replace with actual API call
    const demoData = {
      'Nassau,Bahamas': { 
        temp: '28°C', 
        wind_speed: '15 km/h', 
        visibility: '10 km',
        description: 'Partly Cloudy'
      },
      'Eleuthera,Bahamas': { 
        temp: '27°C', 
        wind_speed: '18 km/h', 
        visibility: '12 km',
        description: 'Sunny'
      }
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return demoData[location] || { 
      temp: '25°C', 
      wind_speed: '10 km/h', 
      visibility: '8 km',
      description: 'Clear'
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return { 
      temp: 'N/A', 
      wind_speed: 'N/A', 
      visibility: 'N/A',
      description: 'Data unavailable'
    };
  }
}

// Fetch route map image
export async function fetchRouteMap(source, destination) {
  try {
    // Return a demo map image URL
    return 'https://via.placeholder.com/600x400/3776AB/FFFFFF?text=Route+Map+Nassau+to+Eleuthera';
  } catch (error) {
    console.error('Error fetching route map:', error);
    return null;
  }
}