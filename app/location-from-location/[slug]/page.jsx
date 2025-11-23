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

// Constants moved outside component
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const WEATHER_API_KEY = '953d1012b9ab5d4722d58e46be4305f7';

// Utility functions
const toRad = (degrees) => degrees * Math.PI / 180;
const kmToMiles = (km) => km * 0.621371;
const kmToNauticalMiles = (km) => km * 0.539957;
const calculateFlightTime = (km) => (km / 800).toFixed(1);

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
      question: `What’s the best way to plan a trip between ${fromCity} and ${toCity}?`,
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
  const [destinationWeather, setDestinationWeather] =
    useState(initialWeatherState);
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

  // ---- Fetch helpers - FIXED: Remove next: { revalidate } ----
  // In your page component, update the fetchCountryData function:
const fetchCountryData = useCallback(async (lat, lon) => {
  try {
    const res = await fetch(
      `/api/reverse-geocode?lat=${lat}&lon=${lon}`
    );
    
    const geoData = await res.json();
    
    if (geoData.error) {
      return { currency: 'N/A', language: 'N/A' };
    }

    const countryCode = geoData.country_code;
    if (!countryCode) return { currency: 'N/A', language: 'N/A' };

    const [currency, language] = await Promise.all([
      fetchCurrency(countryCode),
      fetchLanguage(countryCode),
    ]);

    return { currency, language };
  } catch {
    return { currency: 'N/A', language: 'N/A' };
  }
}, []);

  const fetchCurrency = useCallback(async (countryCode) => {
    try {
      const res = await fetch(
        `https://restcountries.com/v3.1/alpha/${countryCode}`
      );
      const data = await res.json();
      if (data[0]?.currencies) {
        const code = Object.keys(data[0].currencies)[0];
        return `${code}`;
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  }, []);

  const fetchLanguage = useCallback(async (countryCode) => {
    try {
      const res = await fetch(
        `https://restcountries.com/v3.1/alpha/${countryCode}`
      );
      const data = await res.json();
      if (data[0]?.languages) {
        return Object.values(data[0].languages)[0];
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  }, []);

  const fetchWeatherData = useCallback(
    async (src, dest) => {
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

        if (!sourceWeatherRes.ok || !destWeatherRes.ok)
          throw new Error('Weather API failed');

        const sourceData = await sourceWeatherRes.json();
        const destData = await destWeatherRes.json();

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
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    },
    [fetchCountryData]
  );

  // ---- Distance calculation ----
  const calculateDistance = useCallback((src, dest) => {
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

  // ---- Effects - FIXED: Remove next: { revalidate } ----
  // In your page component, replace the fetchLocations function:
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

  // ---- Loading screen ----
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
        </div>
      </div>
    );
  }
  // ---- Render ----
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
        tabIndex={-1}  // Prevent focus
        onMouseDown={(e) => e.preventDefault()} // Additional prevention
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setActiveFAQ(prev => {
            const newValue = prev === index ? null : index;
            console.log('Setting FAQ from', prev, 'to', newValue);
            return newValue;
          });
          // Force maintain scroll position
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
            overflowAnchor: 'none' // Prevent scroll anchoring
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




