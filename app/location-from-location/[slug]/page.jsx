'use client';
import { FaGlobe, FaPlane, FaAnchor } from 'react-icons/fa';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { MetricCard, WeatherPanel, FAQItem, RouteCard } from '../../../components/DistanceComponents';
import Head from 'next/head';

// Debug: Check if components exist
console.log('=== DEBUG: Component Import Status ===');
console.log('Header:', Header ? 'Loaded' : 'Missing');
console.log('Footer:', Footer ? 'Loaded' : 'Missing');
console.log('DistanceComponents:', MetricCard ? 'Loaded' : 'Missing');

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

// Constants moved outside component
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const WEATHER_API_KEY = '953d1012b9ab5d4722d58e46be4305f7';

// Utility functions
const toRad = (degrees) => degrees * Math.PI / 180;
const kmToMiles = (km) => km * 0.621371;
const kmToNauticalMiles = (km) => km * 0.539957;
const calculateFlightTime = (km) => (km / 800).toFixed(1);

const faqs = [
  {
    id: 'faq1',
    question: 'What information can I find on LocateMyCity?',
    answer:
      'LocateMyCity provides detailed insights about locations, including city/town status, distance measurements, and unique geographical traits.',
  },
  {
    id: 'faq2',
    question: 'How do I use the distance calculator?',
    answer:
      'Either allow location access or manually enter locations to calculate real-time distances in miles or kilometers.',
  },
  {
    id: 'faq3',
    question: 'Can I compare multiple locations?',
    answer:
      'Yes, our Location to Location tool lets you compare multiple destinations for effective trip planning.',
  },
  {
    id: 'faq4',
    question: 'How current is the location data?',
    answer:
      'We update weekly using verified sources including satellite imagery and government data.',
  },
  {
    id: 'faq5',
    question: 'What makes LocateMyCity different?',
    answer:
      'We highlight unique natural features and cover both abandoned and active locations with faster search and data accuracy than traditional tools.',
  },
];

export default function DistanceResult() {
  const [sourcePlace, setSourcePlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [distanceInKm, setDistanceInKm] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [metaDescription, setMetaDescription] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);
  
  // Use ref to track initial render and prevent infinite loops
  const isInitialRender = useRef(true);
  const debugLogRef = useRef([]);

  // Safe debug function that doesn't cause re-renders
  const addDebugInfo = useCallback((message, data = null) => {
    const timestamp = new Date().toISOString();
    const debugMessage = `[${timestamp}] ${message}`;
    console.log(debugMessage, data);
    
    // Only update state if not in initial render to prevent loops
    if (!isInitialRender.current) {
      setDebugInfo(prev => [...prev.slice(-9), { message: debugMessage, data }]);
    } else {
      // Store in ref during initial render
      debugLogRef.current.push({ message: debugMessage, data });
    }
  }, []);

  const sourceShortName = sourcePlace?.display_name?.split(',')[0];
  const destinationShortName = destinationPlace?.display_name?.split(',')[0];

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
  const [destinationWeather, setDestinationWeather] =
    useState(initialWeatherState);

  const router = useRouter();
  const params = useParams();

  // Move debug calls inside useEffect to prevent infinite re-renders
  useEffect(() => {
    addDebugInfo('Params received:', params);
  }, [params, addDebugInfo]);

  const slug = Array.isArray(params.slug) ? params.slug : [params.slug];
  const [sourceName, destinationName] =
    Array.isArray(slug) && slug.length === 1
      ? slug[0].replace('how-far-is-', '').split('-from-')
      : [null, null];

  // Move debug calls inside useEffect
  useEffect(() => {
    if (sourceName && destinationName) {
      addDebugInfo('Parsed source and destination:', { sourceName, destinationName });
    }
  }, [sourceName, destinationName, addDebugInfo]);

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

  // Fetch helpers
  const fetchCountryData = useCallback(async (lat, lon) => {
    addDebugInfo('Fetching country data for coordinates:', { lat, lon });
    
    try {
      const apiUrl = `/api/reverse-geocode?lat=${lat}&lon=${lon}`;
      addDebugInfo('Making API request to:', apiUrl);
      
      const res = await fetch(apiUrl);
      
      addDebugInfo('API response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const geoData = await res.json();
      addDebugInfo('Country data received:', geoData);
      
      if (geoData.error) {
        addDebugInfo('Country data error:', geoData.error);
        return { currency: 'N/A', language: 'N/A' };
      }

      const countryCode = geoData.country_code;
      if (!countryCode) {
        addDebugInfo('No country code found in response');
        return { currency: 'N/A', language: 'N/A' };
      }

      addDebugInfo('Country code found:', countryCode);
      const [currency, language] = await Promise.all([
        fetchCurrency(countryCode),
        fetchLanguage(countryCode),
      ]);

      addDebugInfo('Currency and language fetched:', { currency, language });
      return { currency, language };
    } catch (error) {
      addDebugInfo('Error fetching country data:', error.message);
      return { currency: 'N/A', language: 'N/A' };
    }
  }, [addDebugInfo]);

  const fetchCurrency = useCallback(async (countryCode) => {
    try {
      addDebugInfo('Fetching currency for country:', countryCode);
      const res = await fetch(
        `https://restcountries.com/v3.1/alpha/${countryCode}`
      );
      addDebugInfo('Currency API response status:', res.status);
      
      const data = await res.json();
      if (data[0]?.currencies) {
        const code = Object.keys(data[0].currencies)[0];
        addDebugInfo('Currency found:', code);
        return `${code}`;
      }
      addDebugInfo('No currency found');
      return 'N/A';
    } catch (error) {
      addDebugInfo('Error fetching currency:', error.message);
      return 'N/A';
    }
  }, [addDebugInfo]);

  const fetchLanguage = useCallback(async (countryCode) => {
    try {
      addDebugInfo('Fetching language for country:', countryCode);
      const res = await fetch(
        `https://restcountries.com/v3.1/alpha/${countryCode}`
      );
      addDebugInfo('Language API response status:', res.status);
      
      const data = await res.json();
      if (data[0]?.languages) {
        const language = Object.values(data[0].languages)[0];
        addDebugInfo('Language found:', language);
        return language;
      }
      addDebugInfo('No language found');
      return 'N/A';
    } catch (error) {
      addDebugInfo('Error fetching language:', error.message);
      return 'N/A';
    }
  }, [addDebugInfo]);

  const fetchWeatherData = useCallback(
    async (src, dest) => {
      addDebugInfo('Starting weather data fetch for:', { src, dest });
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
          fetchCountryData(src.lat, src.lon),
          fetchCountryData(dest.lat, dest.lon),
        ]);

        addDebugInfo('Weather API responses:', {
          sourceStatus: sourceWeatherRes.status,
          destStatus: destWeatherRes.status
        });

        if (!sourceWeatherRes.ok || !destWeatherRes.ok)
          throw new Error('Weather API failed');

        const sourceData = await sourceWeatherRes.json();
        const destData = await destWeatherRes.json();
        addDebugInfo('Weather data received successfully');

        setSourceWeather({
          temp: `${Math.round(sourceData.main.temp)}°C`,
          wind: `${Math.round(sourceData.wind.speed * 3.6)} km/h`,
          sunrise: new Date(sourceData.sys.sunrise * 1000).toLocaleTimeString(
            [],
            { hour: '2-digit', minute: '2-digit' }
          ),
          sunset: new Date(sourceData.sys.sunset * 1000).toLocaleTimeString(
            [],
            { hour: '2-digit', minute: '2-digit' }
          ),
          localtime: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          coordinates: `${parseFloat(src.lat).toFixed(4)}, ${parseFloat(
            src.lon
          ).toFixed(4)}`,
          currency: sourceCountryData.currency,
          language: sourceCountryData.language,
        });

        setDestinationWeather({
          temp: `${Math.round(destData.main.temp)}°C`,
          wind: `${Math.round(destData.wind.speed * 3.6)} km/h`,
          sunrise: new Date(destData.sys.sunrise * 1000).toLocaleTimeString(
            [],
            { hour: '2-digit', minute: '2-digit' }
          ),
          sunset: new Date(destData.sys.sunset * 1000).toLocaleTimeString(
            [],
            { hour: '2-digit', minute: '2-digit' }
          ),
          localtime: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          coordinates: `${parseFloat(dest.lat).toFixed(4)}, ${parseFloat(
            dest.lon
          ).toFixed(4)}`,
          currency: destCountryData.currency,
          language: destCountryData.language,
        });

        addDebugInfo('Weather state updated successfully');
      } catch (error) {
        addDebugInfo('Error fetching weather data:', error.message);
        console.error('Error fetching weather data:', error);
      }
    },
    [fetchCountryData, addDebugInfo]
  );

  // Distance calculation
  const calculateDistance = useCallback((src, dest) => {
    addDebugInfo('Calculating distance between:', { src, dest });
    const lat1 = parseFloat(src.lat);
    const lon1 = parseFloat(src.lon);
    const lat2 = parseFloat(dest.lat);
    const lon2 = parseFloat(dest.lon);

    const R = 6371;
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
    addDebugInfo('Distance calculated:', `${distance.toFixed(2)} km`);
  }, [addDebugInfo]);

  const fetchPopularRoutes = useCallback(async (src, dest) => {
    try {
      addDebugInfo('Setting popular routes');
      setPopularRoutes([
        {
          id: 'route1',
          source: src.display_name?.split(',')[0] || 'Source',
          destination: dest.display_name?.split(',')[0] || 'Destination',
        },
        { id: 'route2', source: 'New York', destination: 'London' },
        { id: 'route3', source: 'Tokyo', destination: 'Sydney' },
        { id: 'route4', source: 'Paris', destination: 'Rome' },
      ]);
    } catch (error) {
      addDebugInfo('Error fetching popular routes:', error.message);
      console.error('Error fetching popular routes:', error);
    }
  }, [addDebugInfo]);

  // Main effect for fetching locations
  useEffect(() => {
    if (!sourceName || !destinationName) {
      addDebugInfo('Missing source or destination name', { sourceName, destinationName });
      return;
    }

    const fetchLocations = async () => {
      setIsLoading(true);
      addDebugInfo('Starting location fetch process');
      
      try {
        const sourceQuery = encodeURIComponent(sourceName.replace(/-/g, ' '));
        const destQuery = encodeURIComponent(destinationName.replace(/-/g, ' '));
        
        const sourceApiUrl = `/api/geocode?query=${sourceQuery}`;
        const destApiUrl = `/api/geocode?query=${destQuery}`;
        
        addDebugInfo('Making geocode API requests:', { sourceApiUrl, destApiUrl });

        const [sourceResponse, destResponse] = await Promise.all([
          fetch(sourceApiUrl),
          fetch(destApiUrl),
        ]);

        addDebugInfo('Geocode API responses:', {
          sourceStatus: sourceResponse.status,
          sourceUrl: sourceResponse.url,
          destStatus: destResponse.status,
          destUrl: destResponse.url
        });

        // Check if responses are OK before parsing JSON
        if (!sourceResponse.ok) {
          throw new Error(`Source geocode failed: ${sourceResponse.status}`);
        }
        if (!destResponse.ok) {
          throw new Error(`Destination geocode failed: ${destResponse.status}`);
        }

        const [sourceData, destData] = await Promise.all([
          sourceResponse.json(),
          destResponse.json(),
        ]);

        addDebugInfo('Geocode data received:', { sourceData, destData });

        // Check for API errors in response data
        if (sourceData.error || destData.error) {
          throw new Error(sourceData.error || destData.error);
        }

        if (sourceData && destData) {
          addDebugInfo('Setting place data');
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
          fetchPopularRoutes(sourceData, destData);
        } else {
          addDebugInfo('No data received, redirecting');
          router.push('/');
        }
      } catch (error) {
        addDebugInfo('Error in location fetch process:', error.message);
        console.error('Error fetching location data:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
        addDebugInfo('Location fetch process completed');
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
    addDebugInfo
  ]);

  useEffect(() => {
    if (distanceMetrics && sourceShortName && destinationShortName) {
      setMetaDescription(
        `The distance from ${sourceShortName} to ${destinationShortName} is ${distanceMetrics.miles} miles (${distanceMetrics.km} km / ${distanceMetrics.nauticalMiles} nautical miles). Use LocateMyCity to instantly calculate distances, compare locations, and explore nearby attractions worldwide.`
      );
    }
  }, [distanceMetrics, sourceShortName, destinationShortName]);

  const navigateToRoute = useCallback(
    (source, destination) => {
      const formatForUrl = (str) => str.toLowerCase().replace(/\s+/g, '-');
      router.push(
        `/location-from-location/how-far-is-${formatForUrl(
          destination
        )}-from-${formatForUrl(source)}`
      );
    },
    [router]
  );

  // Mark initial render as complete after first render
  useEffect(() => {
    isInitialRender.current = false;
    // Transfer any debug logs from ref to state
    if (debugLogRef.current.length > 0) {
      setDebugInfo(debugLogRef.current.slice(-9));
    }
  }, []);

  // Loading screen
  if (!sourcePlace || !destinationPlace) {
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
          
          {/* Debug Info Display */}
          {/* <div className="mt-8 p-4 bg-gray-100 rounded-lg max-w-2xl mx-auto text-left">
            <h3 className="font-bold mb-2">Debug Information:</h3>
            <pre className="text-xs whitespace-pre-wrap">
              {debugInfo.map((info, index) => (
                <div key={index}>{info.message}</div>
              ))}
            </pre>
          </div> */}
        </div>
      </div>
    );
  }

  // Render
  return (
    <>
      <Header />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="static-content" style={{ display: 'none' }}>
        <h1>Distance from {sourceName} to {destinationName}</h1>
        <p>Calculate the distance between {sourceName} and {destinationName} using our accurate distance calculator.</p>
        <p>Results include measurements in miles, kilometers, and nautical miles with estimated travel times.</p>
        
        <h2>About Our Distance Calculator</h2>
        <p>Our tool uses the haversine formula to calculate great-circle distances between any two locations worldwide.</p>
        <p>We provide accurate results with additional information like weather data and travel insights.</p>
      </div>

      <main id="main-content" role="main">
        {/* Debug panel - remove in production */}
        <details className="debug-panel bg-yellow-100 p-4 mb-4 rounded">
          <summary className="cursor-pointer font-bold">Debug Information</summary>
          <pre className="text-xs whitespace-pre-wrap mt-2">
            {JSON.stringify({
              sourceName,
              destinationName,
              sourcePlace: sourcePlace ? 'Set' : 'Not set',
              destinationPlace: destinationPlace ? 'Set' : 'Not set',
              isLoading,
              debugInfo: debugInfo.slice(-5)
            }, null, 2)}
          </pre>
        </details>

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

            {!isLoading && (
              <p className="distance-result__description">
                {sourceShortName} is approximately <strong>{kmToMiles(distanceInKm).toFixed(1)} miles</strong> ({distanceInKm.toFixed(1)} km) from {destinationShortName}, with a flight time of around <strong>{calculateFlightTime(distanceInKm)} hours</strong>.
              </p>
            )}
          </div>
        </section>

        {/* ... rest of your JSX remains the same ... */}
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
                value={distanceMetrics?.km || '0.0'}
                unit="km"
                variant="blue"
              />
              <MetricCard
                icon={<FaGlobe aria-hidden="true" />}
                title="Miles"
                value={distanceMetrics?.miles || '0.0'}
                unit="mi"
                variant="green"
              />
              <MetricCard
                icon={<FaAnchor aria-hidden="true" />}
                title="Nautical Miles"
                value={distanceMetrics?.nauticalMiles || '0.0'}
                unit="nmi"
                variant="purple"
              />
              <MetricCard
                icon={<FaPlane aria-hidden="true" />}
                title="Flight Time"
                value={distanceMetrics?.flightTime || '0.0'}
                unit="hours"
                variant="red"
              />
            </div>
          </section>

          {/* Weather */}
          <section
            className="distance-result__weather"
            aria-labelledby="weather-section-title"
          >
            <h2 id="weather-section-title" className="distance-result__section-title">
              Side-by-Side Weather
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

          <section className="faq-page" aria-labelledby="faq-section-title">
            <h2 id="faq-section-title" className="faq-title">Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className={`faq-card ${activeFAQ === index ? 'open' : ''}`}
                  role="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveFAQ(prev => {
                      const newValue = prev === index ? null : index;
                      return newValue;
                    });
                    requestAnimationFrame(() => window.scrollTo(0, window.scrollY));
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
                    style={{
                      overflowAnchor: 'none'
                    }}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Routes */}
          <section
            className="distance-result__routes"
            role="region"
            aria-labelledby="routes-section-title"
          >
            <h2 id="routes-section-title" className="distance-result__section-title">
              Most Popular Routes
            </h2>
            <div className="distance-result__routes-grid">
              {popularRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  source={route.source}
                  destination={route.destination}
                  onClick={() => navigateToRoute(route.source, route.destination)}
                />
              ))}
            </div>
          </section>
        </section>
      </main>

      <Footer role="contentinfo" />
    </>
  );
}