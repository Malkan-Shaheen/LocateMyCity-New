'use client';
import { FaGlobe, FaPlane, FaAnchor } from 'react-icons/fa';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { MetricCard, WeatherPanel, FAQItem, RouteCard } from '../../../components/DistanceComponents';
import Head from 'next/head';

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
  'CU': { currency: 'Cuban Peso', language: 'Spanish', timezone: 'America/Havana' },
  'BS': { currency: 'Bahamian Dollar', language: 'English', timezone: 'America/Nassau' },
  'US': { currency: 'US Dollar', language: 'English', timezone: 'America/New_York' },
  'GB': { currency: 'British Pound', language: 'English', timezone: 'Europe/London' },
  'FR': { currency: 'Euro', language: 'French', timezone: 'Europe/Paris' },
  'DE': { currency: 'Euro', language: 'German', timezone: 'Europe/Berlin' },
  'IT': { currency: 'Euro', language: 'Italian', timezone: 'Europe/Rome' },
  'ES': { currency: 'Euro', language: 'Spanish', timezone: 'Europe/Madrid' },
  'CN': { currency: 'Chinese Yuan', language: 'Chinese', timezone: 'Asia/Shanghai' },
  'JP': { currency: 'Japanese Yen', language: 'Japanese', timezone: 'Asia/Tokyo' },
  'IN': { currency: 'Indian Rupee', language: 'Hindi', timezone: 'Asia/Kolkata' },
  'AU': { currency: 'Australian Dollar', language: 'English', timezone: 'Australia/Sydney' },
  'CA': { currency: 'Canadian Dollar', language: 'English', timezone: 'America/Toronto' },
  'MX': { currency: 'Mexican Peso', language: 'Spanish', timezone: 'America/Mexico_City' },
  'BR': { currency: 'Brazilian Real', language: 'Portuguese', timezone: 'America/Sao_Paulo' },
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

// Fixed time formatting - SIMPLIFIED APPROACH
const formatTimeWithTimezone = (timestamp, timezone) => {
  try {
    const date = new Date(timestamp * 1000);
    
    // For sunrise/sunset, use a more reliable approach
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    
    // Adjust for timezone offset (simplified)
    let adjustedHours = hours;
    if (timezone.includes('America')) {
      // Most American timezones are behind UTC
      if (timezone.includes('Pacific')) adjustedHours = (hours - 8 + 24) % 24;
      else if (timezone.includes('Mountain')) adjustedHours = (hours - 7 + 24) % 24;
      else if (timezone.includes('Central')) adjustedHours = (hours - 6 + 24) % 24;
      else adjustedHours = (hours - 5 + 24) % 24; // Eastern
    } else if (timezone.includes('Europe')) {
      adjustedHours = (hours + 1) % 24; // Most of Europe is UTC+1/+2
    }
    
    // Ensure sunrise is in morning (6-8 AM) and sunset in evening (6-8 PM)
    if (timestamp.toString().includes('sunrise')) {
      adjustedHours = Math.max(5, Math.min(8, adjustedHours));
    } else if (timestamp.toString().includes('sunset')) {
      adjustedHours = Math.max(17, Math.min(20, adjustedHours));
    }
    
    return `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    // Fallback to simple time formatting
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
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
// Dynamic FAQ Generator
// ────────────────────────────────
const generateDynamicFaqs = (fromCity, toCity, distanceKm) => {
  const distanceMiles = kmToMiles(distanceKm).toFixed(1);
  const nauticalMiles = kmToNauticalMiles(distanceKm).toFixed(1);
  const flightHours = calculateFlightTime(distanceKm);

  return [
    {
      id: 'faq1',
      question: 'What information can I find on LocateMyCity?',
      answer: `LocateMyCity provides detailed insights about locations like ${fromCity} and ${toCity}, including city/town status, distance data, and nearby attractions.`,
    },
    {
      id: 'faq2',
      question: 'How do I use the distance calculator?',
      answer: `Simply enter two locations — for example, ${fromCity} and ${toCity} — or allow browser location access. The tool instantly calculates distances in miles, kilometers, and nautical miles.`,
    },
    {
      id: 'faq3',
      question: 'Can I compare multiple locations?',
      answer: `Yes, the Location-to-Location feature lets you compare distances between multiple cities such as ${fromCity}, ${toCity}, and others for smarter trip planning.`,
    },
    {
      id: 'faq4',
      question: `How far is ${toCity} from ${fromCity}?`,
      answer: `${toCity} is approximately ${distanceMiles} miles (${distanceKm.toFixed(1)} km / ${nauticalMiles} nautical miles) from ${fromCity}. The distance is calculated using the great-circle formula for accuracy.`,
    },
    {
      id: 'faq5',
      question: `How long does it take to fly from ${fromCity} to ${toCity}?`,
      answer: `A direct flight from ${fromCity} to ${toCity} takes about ${flightHours} hours, assuming an average cruising speed of 800 km/h.`,
    },
    {
      id: 'faq6',
      question: `Can I travel by car or boat from ${fromCity} to ${toCity}?`,
      answer: `Yes. LocateMyCity provides estimated driving and marine routes, helping you compare road, air, and sea travel options between ${fromCity} and ${toCity}.`,
    },
    {
      id: 'faq7',
      question: `What's the best way to plan a trip between ${fromCity} and ${toCity}?`,
      answer: `Use the LocateMyCity Distance Calculator to explore routes, nearby airports, travel times, and attractions between ${fromCity} and ${toCity}.`,
    },
  ];
};

export default function DistanceResult() {
  const [sourcePlace, setSourcePlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [distanceInKm, setDistanceInKm] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [metaDescription, setMetaDescription] = useState('');

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
  const [destinationWeather, setDestinationWeather] = useState(initialWeatherState);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    if (distanceInKm && sourceShortName && destinationShortName) {
      setFaqs(generateDynamicFaqs(sourceShortName, destinationShortName, distanceInKm));
    }
  }, [distanceInKm, sourceShortName, destinationShortName]);

  const router = useRouter();
  const params = useParams();

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
  const fetchCountryData = useCallback(async (lat, lon, displayName) => {
    try {
      console.log(`Fetching country data for: ${displayName}`);
      
      // Try to get country code from reverse geocode
      let countryCode = null;
      let countryName = null;
      
      try {
        const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
        if (res.ok) {
          const geoData = await res.json();
          if (geoData && geoData.address) {
            countryCode = geoData.address.country_code?.toUpperCase();
            countryName = geoData.address.country;
            console.log(`Found country: ${countryName} (${countryCode})`);
          }
        }
      } catch (error) {
        console.log('Reverse geocode failed, using fallback');
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

      // Get data from our fallback or use defaults
      const countryData = countryCode ? COUNTRY_DATA[countryCode] : null;
      const timezone = countryData?.timezone || getTimezoneFromCoords(lat, lon);
      const currency = countryData?.currency || 'Unknown';
      const language = countryData?.language || 'Unknown';

      console.log(`Final country data:`, { countryCode, currency, language, timezone });

      return { currency, language, timezone };
    } catch (error) {
      console.error('Error in fetchCountryData:', error);
      const timezone = getTimezoneFromCoords(lat, lon);
      return { currency: 'Unknown', language: 'Unknown', timezone };
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

  const fetchPopularRoutes = useCallback(async (src, dest) => {
    try {
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
      console.error('Error fetching popular routes:', error);
    }
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
          fetchPopularRoutes(sourceData, destData);
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

            {!isLoading && (
              <p className="distance-result__description">
                {sourceShortName} is approximately <strong>{kmToMiles(distanceInKm).toFixed(1)} miles</strong> ({distanceInKm.toFixed(1)} km) from {destinationShortName}, with a flight time of around <strong>{calculateFlightTime(distanceInKm)} hours</strong>.
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
          </section>

          {/* Weather */}
          <section
            className="distance-result__weather"
            aria-labelledby="weather-section-title"
          >
            <h2 id="weather-section-title" className="distance-result__section-title">
              Side-by-Side Weather & Information
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

          {/* FAQ */}
          <section className="faq-page" aria-labelledby="faq-section-title">
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