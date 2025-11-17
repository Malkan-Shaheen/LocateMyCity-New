// utils/api.js

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '2af309b5c874291b51f22ce8eea67bc2';

// Better location mapping with coordinates for fallback
const LOCATION_MAPPING = {
  'nassau': { name: 'Nassau,BS', lat: 25.0343, lon: -77.3963 },
  'eleuthera': { name: 'Rock Sound,BS', lat: 24.9, lon: -76.2 }, // Using Rock Sound instead
  'moscow': { name: 'Moscow,RU', lat: 55.7558, lon: 37.6173 },
  'berlin': { name: 'Berlin,DE', lat: 52.5200, lon: 13.4050 },
  'paris': { name: 'Paris,FR', lat: 48.8566, lon: 2.3522 },
  'london': { name: 'London,GB', lat: 51.5074, lon: -0.1278 }
};

export async function fetchWeatherData(location) {
  console.log('🌤️ [WEATHER API] Fetching for:', location);
  
  try {
    // Normalize location name
    const normalizedLocation = location.toLowerCase().trim();
    const locationInfo = LOCATION_MAPPING[normalizedLocation] || { name: location };
    
    console.log('🔍 [WEATHER API] Using location:', locationInfo.name);
    
    // Try direct API call first
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationInfo.name)}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    console.log('📡 [WEATHER API] Response status:', weatherResponse.status);
    
    if (weatherResponse.ok) {
      const weatherData = await weatherResponse.json();
      console.log('🌤️ [WEATHER API] Success for:', weatherData.name);
      
      return {
        temp: `${Math.round(weatherData.main.temp)}°C`,
        wind_speed: `${Math.round(weatherData.wind.speed * 3.6)} km/h`,
        visibility: `${(weatherData.visibility / 1000).toFixed(1)} km`,
        humidity: `${weatherData.main.humidity}%`,
        description: weatherData.weather[0].description,
        conditions: weatherData.weather[0].main,
        icon: weatherData.weather[0].icon,
        city: weatherData.name
      };
    }
    
    // If direct API fails, try coordinates if available
    if (locationInfo.lat && locationInfo.lon) {
      console.log('🔄 [WEATHER API] Trying coordinates for:', locationInfo.name);
      const coordResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${locationInfo.lat}&lon=${locationInfo.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (coordResponse.ok) {
        const weatherData = await coordResponse.json();
        console.log('🌤️ [WEATHER API] Success via coordinates for:', weatherData.name);
        
        return {
          temp: `${Math.round(weatherData.main.temp)}°C`,
          wind_speed: `${Math.round(weatherData.wind.speed * 3.6)} km/h`,
          visibility: `${(weatherData.visibility / 1000).toFixed(1)} km`,
          humidity: `${weatherData.main.humidity}%`,
          description: weatherData.weather[0].description,
          conditions: weatherData.weather[0].main,
          icon: weatherData.weather[0].icon,
          city: weatherData.name
        };
      }
    }
    
    throw new Error(`Weather API failed: ${weatherResponse.status}`);
    
  } catch (error) {
    console.error('❌ [WEATHER API] Error:', error.message);
    
    // Enhanced fallback data - FIXED: Use normalizedLocation properly
    const fallbackData = {
      'nassau': { 
        temp: '28°C', 
        wind_speed: '15 km/h', 
        visibility: '10 km',
        humidity: '78%',
        description: 'Partly Cloudy',
        conditions: 'Clouds',
        icon: '02d',
        city: 'Nassau'
      },
      'eleuthera': { 
        temp: '27°C', 
        wind_speed: '18 km/h', 
        visibility: '12 km',
        humidity: '75%',
        description: 'Sunny',
        conditions: 'Clear',
        icon: '01d',
        city: 'Eleuthera'
      },
      'moscow': { 
        temp: '5°C', 
        wind_speed: '12 km/h', 
        visibility: '8 km',
        humidity: '65%',
        description: 'Cloudy',
        conditions: 'Clouds',
        icon: '04d',
        city: 'Moscow'
      },
      'berlin': { 
        temp: '8°C', 
        wind_speed: '14 km/h', 
        visibility: '10 km',
        humidity: '70%',
        description: 'Light Rain',
        conditions: 'Rain',
        icon: '10d',
        city: 'Berlin'
      }
    };
    
    // Get the normalized location name for fallback lookup
    const normalizedLocationName = location.toLowerCase().trim();
    return fallbackData[normalizedLocationName] || { 
      temp: '25°C', 
      wind_speed: '10 km/h', 
      visibility: '8 km',
      humidity: '78%',
      description: 'Clear',
      conditions: 'Clear',
      icon: '01d',
      city: location
    };
  }
}

// Rest of your functions remain the same...
export async function getRouteCoordinates(source, destination) {
  try {
    const coordinates = {
      'nassau': { lat: 25.0343, lng: -77.3963, name: 'Nassau' },
      'eleuthera': { lat: 25.1125, lng: -76.1322, name: 'Eleuthera' },
      'moscow': { lat: 55.7558, lng: 37.6173, name: 'Moscow' },
      'berlin': { lat: 52.5200, lng: 13.4050, name: 'Berlin' }
    };

    const sourceKey = source.toLowerCase();
    const destKey = destination.toLowerCase();

    return {
      source: coordinates[sourceKey] || { lat: 25.0343, lng: -77.3963, name: source },
      destination: coordinates[destKey] || { lat: 25.1125, lng: -76.1322, name: destination },
      distance: 80
    };
  } catch (error) {
    console.error('Error getting route coordinates:', error);
    throw error;
  }
}

export async function fetchRouteMap(source, destination) {
  try {
    return `https://via.placeholder.com/600x400/3776AB/FFFFFF?text=Route+${source}+to+${destination}`;
  } catch (error) {
    console.error('Error fetching route map:', error);
    return null;
  }
}