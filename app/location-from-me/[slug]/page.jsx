'use client';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Footer from '@/components/Footer';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { 
  FaMapMarkerAlt, 
  FaRoad, 
  FaPlane, 
  FaWalking,
  FaGlobeAmericas as FaGlobe,
  FaMapMarkedAlt,
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaWind,
  FaArrowUp,
  FaArrowDown,
  FaUmbrella,
  FaCloudSun,
  FaBolt,
  FaClock,
  FaMoneyBillWave,
  FaLanguage
} from 'react-icons/fa';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/Header';
import dynamic from 'next/dynamic';

// Lazy load the Map component with no SSR
const Map = dynamic(() => import('@/components/Map-comp'), { 
  ssr: false,
  loading: () => <div className="map-loading">Loading map...</div>
});

// Memoized helper functions
const toRad = (degrees) => degrees * Math.PI / 180;
const kmToMiles = (km) => km * 0.621371;
const formatTime = (timestamp, timezone) => {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getFirstCurrency = (currencies) => {
  if (!currencies) return null;
  const currencyCode = Object.keys(currencies)[0];
  const currency = currencies[currencyCode];
  return `${currencyCode} (${currency.symbol || ''})`;
};

const formatTimezone = (timezone) => {
  if (!timezone) return '--';
  try {
    const offset = new Date().toLocaleString('en', { timeZone: timezone, timeZoneName: 'short' }).split(' ').pop();
    return offset;
  } catch {
    return timezone.split('/').pop() || '--';
  }
};

// Weather icon mapping
const WEATHER_ICONS = {
  clear: { icon: FaSun, color: '#FFD700' },
  clouds: { icon: FaCloud, color: '#A9A9A9' },
  rain: { icon: FaCloudRain, color: '#4682B4' },
  drizzle: { icon: FaUmbrella, color: '#4682B4' },
  thunderstorm: { icon: FaBolt, color: '#9400D3' },
  snow: { icon: FaSnowflake, color: '#E0FFFF' },
  default: { icon: FaCloudSun, color: '#A9A9A9' }
};



export default function DistanceResult() {
  // Lazy-load map for performance
  const [mapVisible, setMapVisible] = useState(false);
  const [mapRequestedByUser, setMapRequestedByUser] = useState(false);
  const mapContainerRef = useRef(null);
  const requestMapRender = useCallback(() => {
    setMapRequestedByUser(true);
    setMapVisible(true);
  }, []);

  // State declarations
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);
  
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const [destinationPlace, setDestinationPlace] = useState(null);
  const [distanceInKm, setDistanceInKm] = useState(0);
  const [unit, setUnit] = useState('km');
  const [currentLocationText, setCurrentLocationText] = useState('');
  const [destinationCoords, setDestinationCoords] = useState('--');
  const [destinationCountry, setDestinationCountry] = useState('--');
  const [sourceName, setSourceName] = useState(null);
  const [destinationName, setDestinationName] = useState('--');
  const [isCalculating, setIsCalculating] = useState(false);
  const [travelTime, setTravelTime] = useState({
    driving: null,
    flying: null,
    walking: null
  });
  const [weather, setWeather] = useState({
    loading: true,
    condition: '',
    description: '',
    temperature: 0,
    feelsLike: 0,
    windSpeed: 0,
    humidity: 0,
    sunrise: '',
    sunset: '',
    icon: ''
  });
  const [countryInfo, setCountryInfo] = useState({
    currency: '--',
    languages: '--',
    timezone: '--'
  });
  const [neighboringCountries, setNeighboringCountries] = useState([]);
  const [loadingNeighbors, setLoadingNeighbors] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const faqs = [
  {
    question: `How does this tool calculate the distance from ${destinationName}?`,
    answer:
      'Our distance calculator uses latitude and longitude coordinates to provide accurate results. You can see the distance in miles, kilometers, and nautical miles.',
  },
  {
    question: `Can I check travel time as well as distance to ${destinationName}?`,
    answer:
      'The calculator shows straight-line distance. For driving, public transit, or flight times, you can use Google Maps or other travel apps alongside this tool.',
  },
  {
    question: `Can I see which cities and towns are close to ${destinationName}?`,
    answer:
      'Yes! We provide a "Places Radius Away" section that lists nearby cities and towns at different distances, including 10, 20, 25, 50, 75, and 100 miles.',
  },
  {
    question: `Does this work on mobile if I use my current location?`,
    answer:
      `Absolutely. Just allow location access on your device, and the calculator will automatically detect where you are to measure the distance to ${destinationName}.`,
  },
];

  // Memoized destination from path
// Memoized destination from path - FIXED VERSION
const destination = useMemo(() => {
  if (pathname) {
    // First check if this is a "from-me" page
    const fromMeMatch = pathname.match(/how-far-is-(.+?)-from-me$/);
    if (fromMeMatch) {
      return decodeURIComponent(fromMeMatch[1]).replace(/-/g, ' ').trim();
    }
    
    // If not a "from-me" page, check for location-to-location
    const pathMatch = pathname.match(/how-far-is-(.+?)-from-(.+)$/);
    if (pathMatch) {
      const rawDestination = pathMatch[1];
      const rawSource = pathMatch[2];
      
      // For location-to-location pages, the destination is the first part
      return decodeURIComponent(rawDestination).replace(/-/g, ' ').trim();
    }
  }
  return null;
}, [pathname]);


  // Clean up URL if needed
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname?.includes('/how-far-is-') && pathname.split('/').length > 3) {
      const cleanPath = pathname.split('/').slice(0, 3).join('/');
      window.history.replaceState(null, '', cleanPath);
    }
  }, [pathname]);

  useEffect(() => {
  if (pathname) {
    // Case 1: from-me
    const fromMeMatch = pathname.match(/how-far-is-(.+?)-from-me$/);
    if (fromMeMatch) {
      const dest = decodeURIComponent(fromMeMatch[1]).replace(/-/g, ' ').trim();
      setDestinationName(dest);
      setSourceName('me');
      return;
    }

    // Case 2: location-to-location
    const pathMatch = pathname.match(/how-far-is-(.+?)-from-(.+)$/);
    if (pathMatch) {
      const rawDestination = pathMatch[1];
      const rawSource = pathMatch[2];

      setDestinationName(
        decodeURIComponent(rawDestination).replace(/-/g, ' ').trim()
      );
      setSourceName(
        decodeURIComponent(rawSource).replace(/-/g, ' ').trim()
      );
      return;
    }
  }
}, [pathname]);



  // Add this useEffect for auto-refresh from FAQ navigation
  useEffect(() => {
    const shouldAutoRefresh = sessionStorage.getItem('shouldAutoRefreshFromFAQ');
    if (shouldAutoRefresh) {
      sessionStorage.removeItem('shouldAutoRefreshFromFAQ');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, []);

  // Reveal map when the container becomes visible (or on user click)
  useEffect(() => {
    if (!mapContainerRef.current || mapRequestedByUser || mapVisible) return;

    let visibilityTimer = null;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        const idle = (window.requestIdleCallback || function(cb){ return setTimeout(cb, 500); });
        visibilityTimer = setTimeout(() => setMapVisible(true), 1200);
        idle(() => setMapVisible(true));
        observer.disconnect();
      }
    }, { rootMargin: '200px' });

    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
      if (visibilityTimer) clearTimeout(visibilityTimer);
    };
  }, [mapRequestedByUser, mapVisible]);

  // Set destination name when destination changes
  useEffect(() => {
    if (destination) {
      setDestinationName(destination);
    }
  }, [destination]);

  // Extract country from display name
  const extractCountryFromDisplayName = useCallback((displayName) => {
    if (!displayName) return '--';
    
    const parts = displayName.split(',');
    // Get the country (usually last part)
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i].trim();
      if (part && part !== 'undefined') {
        return part;
      }
    }
    return '--';
  }, []);

 

  // Fetch place details with debounce
 // Fetch place details with debounce
const getPlaceDetails = useCallback(async (address) => {
  if (!address.trim()) return;

  try {
    // Use your existing API route instead of direct Nominatim call
    const url = `/api/geocode?query=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    
    if (data && data.lat && data.lon) {
      const place = {
        lat: data.lat,
        lon: data.lon,
        display_name: data.display_name
      };
      
      setDestinationPlace(place);
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      
      setDestinationCoords(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
      const country = extractCountryFromDisplayName(place.display_name);
      setDestinationCountry(country);
      
      // Fetch country data for neighboring countries
      if (country && country !== '--') {
        fetchCountryData(country);
      } else {
        setLoadingNeighbors(false);
        setNeighboringCountries([]);
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
}, [extractCountryFromDisplayName]);

  // Debounced version of getPlaceDetails
  useEffect(() => {
    if (!destination) return;
    
    const timer = setTimeout(() => {
      getPlaceDetails(destination);
    }, 300);

    return () => clearTimeout(timer);
  }, [destination, getPlaceDetails]);

  // Calculate distance with memoization
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const R = 6371; // Earth radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      setDistanceInKm(distance);
      calculateTravelTimes(distance);
      setIsCalculating(false);
    }, 500);
  }, []);

  const calculateTravelTimes = useCallback((distance) => {
    setTravelTime({
      driving: `${(distance / 80).toFixed(1)} hours`,
      flying: `${(distance / 800).toFixed(1)} hours`,
      walking: `${(distance / 5).toFixed(1)} hours`
    });
  }, []);

  // Recalculate when both locations are available
  useEffect(() => {
    if (userLatitude && userLongitude && destinationPlace) {
      calculateDistance(
        userLatitude,
        userLongitude,
        parseFloat(destinationPlace.lat),
        parseFloat(destinationPlace.lon)
      );
      fetchWeatherData(
        parseFloat(destinationPlace.lat),
        parseFloat(destinationPlace.lon)
      );
    }
  }, [userLatitude, userLongitude, destinationPlace, calculateDistance]);

  // Optimized weather data fetch
  const fetchWeatherData = useCallback(async (lat, lon) => {
    try {
      setWeather(prev => ({ ...prev, loading: true }));
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=953d1012b9ab5d4722d58e46be4305f7&units=metric`
      );
      const data = await response.json();
      
      if (data.cod === 200) {
        setWeather({
          loading: false,
          condition: data.weather[0].main.toLowerCase(),
          description: data.weather[0].description,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          windSpeed: Math.round(data.wind.speed * 3.6),
          humidity: data.main.humidity,
          sunrise: formatTime(data.sys.sunrise, data.timezone),
          sunset: formatTime(data.sys.sunset, data.timezone),
          icon: data.weather[0].icon
        });
      } else {
        throw new Error(data.message || 'Failed to fetch weather data');
      }
    } catch (error) {
      console.error('Weather API error:', error);
      setWeather(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load weather data'
      }));
    }
  }, []);

  // Add this new function to fetch countries in the same region
  const fetchCountriesInSameRegion = useCallback(async (region, excludeCountryCode) => {
    if (!region) {
      setNeighboringCountries([]);
      setLoadingNeighbors(false);
      return;
    }
    
    try {
      const response = await fetch(`https://restcountries.com/v3.1/region/${region}`);
      if (!response.ok) throw new Error('Failed to fetch regional countries');
      
      const data = await response.json();
      
      // Filter out the current country and get up to 4 neighboring countries
      const regionalCountries = data
        .filter(country => country.cca3 !== excludeCountryCode)
        .slice(0, 4)
        .map(country => ({
          name: country.name.common,
          code: country.cca2
        }));
      
      setNeighboringCountries(regionalCountries);
    } catch (error) {
      console.error('Error fetching regional countries:', error);
      setNeighboringCountries([]);
    } finally {
      setLoadingNeighbors(false);
    }
  }, []);

  // Optimized country data fetch
  const fetchCountryData = useCallback(async (countryName) => {
    if (!countryName || countryName === '--') {
      setLoadingNeighbors(false);
      return;
    }
    
    try {
      const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);
      if (!response.ok) throw new Error('Failed to fetch country data');
      
      const data = await response.json();
      if (data && data.length > 0) {
        const country = data[0];
        setCountryInfo({
          currency: getFirstCurrency(country.currencies) || '--',
          languages: country.languages ? Object.values(country.languages).join(', ') : '--',
          timezone: country.timezones?.[0] ? formatTimezone(country.timezones[0]) : '--'
        });

        if (country.borders && country.borders.length > 0) {
          fetchNeighboringCountries(country.borders, country.cca3, country.region);
        } else {
          // If no borders, try to find countries in the same region
          fetchCountriesInSameRegion(country.region, country.cca3);
        }
      }
    } catch (error) {
      console.error('Error fetching country info:', error);
      setCountryInfo({
        currency: '--',
        languages: '--',
        timezone: '--'
      });
      setNeighboringCountries([]);
      setLoadingNeighbors(false);
    }
  }, []);

  const fetchNeighboringCountries = useCallback(async (borderCodes, countryCode, region) => {
    setLoadingNeighbors(true);
    try {
      const response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${borderCodes.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch neighboring countries');
      
      const data = await response.json();
      
      // Filter out any invalid or null entries
      let validCountries = data.filter(country => 
        country && country.name && country.name.common
      );
      
      // If we have less than 2 neighbors, try to get more from the region
      if (validCountries.length < 2 && region) {
        try {
          const regionResponse = await fetch(`https://restcountries.com/v3.1/region/${region}`);
          if (regionResponse.ok) {
            const regionData = await regionResponse.json();
            
            // Add more countries from the same region (excluding current and existing neighbors)
            const additionalCountries = regionData
              .filter(country => 
                country.cca3 !== countryCode && 
                !validCountries.some(n => n.cca3 === country.cca3)
              )
              .slice(0, 2 - validCountries.length)
              .map(country => ({
                name: country.name.common,
                code: country.cca2
              }));
            
            validCountries = [...validCountries, ...additionalCountries];
          }
        } catch (regionError) {
          console.error('Error fetching regional countries:', regionError);
        }
      }
      
      setNeighboringCountries(validCountries.map(country => ({
        name: country.name.common,
        code: country.cca2
      })));
    } catch (error) {
      console.error('Error fetching neighboring countries:', error);
      
      // Fallback: try to get countries from the same region as the destination
      try {
        const countryResponse = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(destinationCountry)}`);
        if (countryResponse.ok) {
          const countryData = await countryResponse.json();
          if (countryData && countryData.length > 0) {
            const country = countryData[0];
            fetchCountriesInSameRegion(country.region, country.cca3);
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setNeighboringCountries([]);
      }
    } finally {
      setLoadingNeighbors(false);
    }
  }, [destinationCountry]);

  // Optimized geolocation
  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setCurrentLocationText('Geolocation not supported');
      alert('Geolocation is not supported by your browser. Please enter your location manually.');
      return;
    }

    try {
      const permissionResult = await navigator.permissions.query({ name: 'geolocation' });
      if (permissionResult.state === 'denied') {
        setCurrentLocationText('Location permission denied');
        alert('Please enable location permissions to use this feature.');
        return;
      }
    } catch (error) {
      console.log('Permission API not supported, proceeding with geolocation');
    }

    setCurrentLocationText('Detecting your location...');
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setUserLatitude(lat);
      setUserLongitude(lng);
      setCurrentLocationText('Location detected!');
      
      // Reverse geocode in background without blocking
      setTimeout(() => reverseGeocode(lat, lng), 0);
    } catch (error) {
      setCurrentLocationText('Could not detect location');
      alert('Could not detect your location. Please enter it manually.');
    }
  }, []);

 const reverseGeocode = useCallback(async (lat, lng) => {
  try {
    const url = `/api/reverse-geocode?lat=${lat}&lon=${lng}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Reverse geocoding failed');
    }
    
    const data = await response.json();
    if (data.display_name) {
      setCurrentLocationText(data.display_name);
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }
}, []);

 const handleManualLocation = useCallback(async (address) => {
  if (!address.trim()) {
    alert('Please enter a location');
    return;
  }

  try {
    const url = `/api/geocode?query=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Location not found');
    }
    
    const data = await response.json();
    
    if (data && data.lat && data.lon) {
      const place = {
        lat: data.lat,
        lon: data.lon,
        display_name: data.display_name
      };
      
      setUserLatitude(parseFloat(place.lat));
      setUserLongitude(parseFloat(place.lon));
      setCurrentLocationText(place.display_name);
    } else {
      alert('Location not found. Please try a different address.');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    alert(`Error finding location: ${error.message}`);
  }
}, []);

  const handleUnitChange = useCallback((newUnit) => setUnit(newUnit), []);
  
  const capitalizeWords = useCallback((str) => {
    if (!str) return '';
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }, []);

  // Memoized weather icon
  const weatherIcon = useMemo(() => {
    if (weather.loading) return <div className="spinner small"></div>;
    if (weather.error) return <div className="weather-error">{weather.error}</div>;

    const iconStyle = { 
      fontSize: '3rem',
      marginBottom: '10px'
    };

    const { icon, color } = WEATHER_ICONS[weather.condition] || WEATHER_ICONS.default;
    const IconComponent = icon;
    return <IconComponent style={{...iconStyle, color}} />;
  }, [weather]);

  // Memoized coordinates for the map
  const sourceCoords = useMemo(() => userLatitude && userLongitude ? { 
    lat: parseFloat(userLatitude), 
    lng: parseFloat(userLongitude) 
  } : null, [userLatitude, userLongitude]);

  const destCoords = useMemo(() => destinationPlace ? { 
    lat: parseFloat(destinationPlace.lat), 
    lng: parseFloat(destinationPlace.lon) 
  } : null, [destinationPlace]);

  // Memoized distance display
  const distanceDisplay = useMemo(() => {
    if (!sourceCoords) {
      return (
        <div className="empty-distance">
          <span className="empty-value">-- {unit === 'km' ? 'km' : 'mi'}</span>
          <span className="unit-hint"> </span>
        </div>
      );
    }

    if (isCalculating || distanceInKm <= 0) {
      return <div className="spinner"></div>;
    }

    return unit === 'km' 
      ? `${distanceInKm.toFixed(1)} km` 
      : `${kmToMiles(distanceInKm).toFixed(1)} mi`;
  }, [sourceCoords, isCalculating, distanceInKm, unit]);

  // Memoized neighboring countries list
  const neighboringCountriesList = useMemo(() => {
  if (loadingNeighbors) return <div className="spinner small"></div>;
  
  if (destinationCountry === '--' || destinationCountry === 'undefined') {
    return <p>Country information not available for this location.</p>;
  }
  
  if (neighboringCountries.length === 0) {
    const fallbackCountries = [
      { name: "United States", code: "US" },
      { name: "Canada", code: "CA" },
      { name: "Mexico", code: "MX" },
      { name: "United Kingdom", code: "GB" },
      { name: "France", code: "FR" },
      { name: "Germany", code: "DE" },
      { name: "China", code: "CN" },
      { name: "Japan", code: "JP" },
      { name: "Australia", code: "AU" },
      { name: "Brazil", code: "BR" }
    ].slice(0, 4);
    
    return (
      <ul className="routes-list">
        {fallbackCountries.map((country, index) => {
          // FIX: Add null check for destinationName
          const destSlug = destinationName 
            ? destinationName.split(',')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
            : 'unknown-location';
            
          const countrySlug = country.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

          return (
            <li key={index} className="route-item">
              <Link 
                href={`/location-from-location/how-far-is-${countrySlug}-from-${destSlug}`}
                className="route-link"
                prefetch={false}
              >
                How far is {country.name} from {destinationName ? destinationName.split(',')[0] : 'this location'}?
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
  <ul className="routes-list">
    {neighboringCountries.map((country, index) => {
      // FIX: Add null check here too
      const destSlug = destinationName
        ? destinationName.split(',')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : 'unknown-location';
        
      // FIX: Add null check for country.name
      const countrySlug = country.name
        ? country.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : 'unknown-country';

      return (
        <li key={index} className="route-item">
          <Link 
            href={`/location-from-location/how-far-is-${countrySlug}-from-${destSlug}`}
            className="route-link"
            prefetch={false}
          >
            How far is {country.name || 'this country'} from {destinationName ? destinationName.split(',')[0] : 'this location'}?
          </Link>
        </li>
      );
    })}
  </ul>
);
}, [loadingNeighbors, neighboringCountries, destinationName, destinationCountry]);

  // Memoized popular routes
  const popularRoutes = useMemo(() => (
  <ul className="routes-list">
    {[
      'New York',
      'London',
      'Tokyo',
      'Los Angeles'
    ].map((city, index) => {
      // FIX: Add null check
      const destSlug = destinationName
        ? destinationName.split(',')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : 'unknown-location';
        
      const citySlug = city
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      return (
        <li key={index}>
          <Link 
            href={`/location-from-location/how-far-is-${citySlug}-from-${destSlug}`}
            prefetch={false}
          >
            {city} to {destinationName ? destinationName.split(',')[0] : 'this location'}
          </Link>
        </li>
      );
    })}
  </ul>
), [destinationName]);

  return (
    <>
      <Header />
      <Head>
        <title>How far is {capitalizeWords(destinationName)} from me? | LocateMyCity</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        {/* Leaflet CSS is imported inside the map component; external link removed to avoid duplicate work */}
        <meta name="robots" content="index, follow" />
      
      

      <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://locatemycity.com#organization",
        "name": "LocateMyCity",
        "url": "https://locatemycity.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://locatemycity.com/logo.png"
        }
      })
    }}
  />

  {/* ✅ Structured Data - WebApplication */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Distance Calculator",
        "url": "https://locatemycity.com/distance-calculator",
        "operatingSystem": "Web",
        "applicationCategory": "TravelApplication",
        "applicationSubCategory": "Distance calculator",
        "softwareVersion": "1.0.0",
        "isAccessibleForFree": true,
        "featureList": [
          "Geolocation (HTML5)",
          "Nominatim auto-complete",
          "Haversine great-circle distance",
          "Miles/Kilometers/Nautical Miles output",
          "Deep links to result pages"
        ],
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "category": "free"
        },
        "publisher": { "@id": "https://locatemycity.com#organization" },
        "potentialAction": {
          "@type": "FindAction",
          "name": "Calculate distance to destination",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://locatemycity.com/how-far-is-{destination}-from-me",
            "inLanguage": "en",
            "actionPlatform": [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform"
            ]
          },
          "query-input": "required name=destination"
        }
      })
    }}
  />

  {/* ✅ Structured Data - FAQPage */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does the distance calculator work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We calculate straight-line (great-circle) distances using the haversine formula. Driving times can differ based on route and traffic."
            }
          },
          {
            "@type": "Question",
            "name": "Can I use my current location?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Allow location access in your browser or type your city manually in the destination field."
            }
          },
          {
            "@type": "Question",
            "name": "Which units are supported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can view distances in miles, kilometers, and nautical miles."
            }
          },
          {
            "@type": "Question",
            "name": "Does this show routes or travel time?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "This tool focuses on straight-line distance. For turn-by-turn directions and travel time, use your preferred navigation app."
            }
          }
        ]
      })
    }}
  />
</Head>

      <main className="distance-page">
        <div className="page-header">
          <h1>How far is {capitalizeWords(destinationName)} from me?</h1>
          <p className="description">
            Find out exactly how far {capitalizeWords(destinationName)} is from your current location. 
            Use our interactive tool to calculate the distance in miles, kilometers, 
            or nautical miles. Includes weather, nearby places, and travel insights.
          </p>
        </div>

        {/* Source Location Input Box */}
        <div className="source-input-container">
          <div className="source-input-box">
            <input
              type="text"
              placeholder="Enter your location"
              value={currentLocationText}
              onChange={(e) => setCurrentLocationText(e.target.value)}
              className="source-input"
              aria-label="Enter your current location"
            />
            <div className="source-buttons">
              <button 
                className="my-location-btn"
                onClick={getLocation}
                aria-label="Use my current location"
              >
                <FaMapMarkerAlt style={{ marginRight: '8px' }} />
                Use My Location
              </button>
              <button 
                className="calculate-btn"
                onClick={() => handleManualLocation(currentLocationText)}
                aria-label="Set location manually"
              >
                Set Location
              </button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="map-container">
          {!mapVisible && (
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <button onClick={requestMapRender} className="view-map-btn">Load Interactive Map</button>
            </div>
          )}
          <div ref={mapContainerRef}>
            {mapVisible ? (
              <>
                <Map 
                  sourceCoords={sourceCoords}
                  destinationCoords={destCoords}
                  distance={sourceCoords ? distanceInKm : null}
                />
                {!sourceCoords && (
                  <div className="map-overlay-message">
                    <FaMapMarkerAlt className="marker-icon" />
                    <p> calculating...</p>
                  </div>
                )}
              </>
            ) : (
              <div className="map-loading" role="status" aria-live="polite">
                Loading map when visible...
              </div>
            )}
          </div>
        </div>

        <div className="cards-container">
          <div className="info-card">
            <h1>Distance to Destination</h1>
            
            <div className="distance-value" role="status" aria-live="polite">
              {distanceDisplay}
            </div>

            <div className="unit-toggle" role="group" aria-label="Distance unit selection">
              <button 
                className={`unit-btn ${unit === 'km' ? 'active' : ''}`}
                onClick={() => handleUnitChange('km')}
                aria-pressed={unit === 'km'}
              >
                Kilometers
              </button>
              <button 
                className={`unit-btn ${unit === 'mi' ? 'active' : ''}`}
                onClick={() => handleUnitChange('mi')}
                aria-pressed={unit === 'mi'}
              >
                Miles
              </button>
            </div>

            <div className="travel-times">
              <h4>Estimated Travel Times</h4>
              <div className="travel-method">
                <FaRoad className="method-icon" />
                <span>Driving: {sourceCoords ? (travelTime.driving || 'Calculating...') : '--'}</span>
              </div>
              <div className="travel-method">
                <FaPlane className="method-icon" />
                <span>Flying: {sourceCoords ? (travelTime.flying || 'Calculating...') : '--'}</span>
              </div>
              <div className="travel-method">
                <FaWalking className="method-icon" />
                <span>Walking: {sourceCoords ? (travelTime.walking || 'Calculating...') : '--'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Destination info cards */}
        <div className="cards-container">
          {/* Weather Card */}
          <div className="info-card weather-card">
            <h3>Current Weather</h3>
            <div className="weather-display">
              {weatherIcon}
              {!weather.loading && !weather.error && (
                <>
                  <div className="temperature">{weather.temperature}°C</div>
                  <div className="weather-description">{weather.description}</div>
                </>
              )}
            </div>

            <div className="info-card">
              <div className="detail-item">
                <FaSun style={{ color: '#FFA500', fontSize: '1.5rem' }} />
                <div>
                  <h4>Temperature</h4>
                  <p>{weather.temperature}°C (Feels like {weather.feelsLike}°C)</p>
                </div>
              </div>

              <div className="detail-item">
                <FaWind style={{ color: '#4682B4', fontSize: '1.5rem' }} />
                <div>
                  <h4>Wind</h4>
                  <p>{weather.windSpeed} km/h</p>
                </div>
              </div>

              <div className="detail-item">
                <FaUmbrella style={{ color: '#4682B4', fontSize: '1.5rem' }} />
                <div>
                  <h4>Humidity</h4>
                  <p>{weather.humidity}%</p>
                </div>
              </div>

              <div className="detail-item">
                <FaArrowUp style={{ color: '#FFA500', fontSize: '1.5rem' }} />
                <div>
                  <h4>Sunrise</h4>
                  <p>{weather.sunrise}</p>
                </div>
              </div>

              <div className="detail-item">
                <FaArrowDown style={{ color: '#FF6347', fontSize: '1.5rem' }} />
                <div>
                  <h4>Sunset</h4>
                  <p>{weather.sunset}</p>
                </div>
              </div>
            </div>
          </div>

          {/* General Info Card */}
          <div className="info-card">
            <h3>General Information</h3>
            <div className="detail-item">
              <FaMapMarkerAlt className="detail-icon location-icon" />
              <div>
                <h4>Location</h4>
                <p>{destinationName}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaGlobe className="detail-icon globe-icon" />
              <div>
                <h4>Country/Region</h4>
                <p>{destinationCountry}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaMapMarkedAlt className="detail-icon coordinates-icon" />
              <div>
                <h4>GPS Coordinates</h4>
                <p className="coordinates">{destinationCoords}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaClock className="detail-icon timezone-icon" />
              <div>
                <h4>Timezone</h4>
                <p>{countryInfo.timezone}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaMoneyBillWave className="detail-icon currency-icon" />
              <div>
                <h4>Currency</h4>
                <p>{countryInfo.currency}</p>
              </div>
            </div>
            <div className="detail-item">
              <FaLanguage className="detail-icon language-icon" />
              <div>
                <h4>Language</h4>
                <p>{countryInfo.languages}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="faq-page">
  <h1 className="faq-title">Frequently Asked Questions</h1>
  <div className="faq-list">
    {faqs.map((faq, index) => (
      <div
        key={index}
        className={`faq-card ${openIndex === index ? 'open' : ''}`}
        onClick={() => toggleFAQ(index)} // Move onClick here
        role="button" // Add role for accessibility
        tabIndex={0} // Make it focusable
        aria-expanded={openIndex === index}
        aria-controls={`faq-answer-${index}`}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFAQ(index);
          }
        }} // Add keyboard support
      >
        <h2>
          <button 
            className="faq-question"
            // Remove onClick from here
            aria-hidden="true" // Hide from screen readers since parent handles it
            tabIndex={-1} // Remove from tab order
          >
            <span>{faq.question}</span>
          </button>
        </h2>
        <div 
          id={`faq-answer-${index}`}
          className="faq-answer"
          role="region"
        >
          {openIndex === index && <p>{faq.answer}</p>}
        </div>
      </div>
    ))}
  </div>
</section>

        <footer className="page-footer">
          <div className="footer-section">
            <h4>How far is {destinationName.split(',')[0]} from neighboring countries?</h4>
            {neighboringCountriesList}
          </div>
          <div className="footer-section">
            <h4>Popular Routes to {destinationName.split(',')[0]}</h4>
            {popularRoutes}
          </div>
        </footer>
      </main>
      <Footer />
    </>
  );
}