'use client';
import { useState, useEffect, useMemo, useRef } from "react";
import React from 'react';
import Head from 'next/head';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import WeatherDetails from '../../../../components/WeatherDetails';
import CountryInfoDetails from '../../../../components/CountryInfoDetails';
import RadiusSelector from '../../../../components/RadiusSelector';
import { FaPlane, FaShip, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaTrain } from 'react-icons/fa';
import CarouselMobile from '../../../../components/CarouselMobile';
import Link from 'next/link';
import { getRouteCoordinates, fetchWeatherData, fetchRouteMap } from '../../../../utils/api';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { CheckCircle, Zap, DollarSign, Shield } from 'lucide-react';
import { Crown, Clock, TrendingUp, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Import JSON directly
import allPagesData from '../../../../data/cities_info.json';

export default function HowToGetToPage() {
  const params = useParams();
  const from = params.from; // This will be 'nassau', 'moscow', etc.
  const to = params.to; // This will be 'eleuthera', 'berlin', etc.

  const [pageExists, setPageExists] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  // State to manage the background image
  const [background, setBackground] = React.useState({
    imageUrl: '',
    isLoading: true,
    error: null
  });

  const [routeData, setRouteData] = useState(null);
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);

  // Add these state variables and functions at the top of your component
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const topThings = pageData?.top_things || [];
  const placesToStay = pageData?.places_to_stay || [];

  // Clone the first and last items for seamless looping
  const extendedPlacesToStay = useMemo(() => {
    if (placesToStay.length === 0) return [];
    
    // Add the last item to the beginning and first item to the end
    return [
      placesToStay[placesToStay.length - 1], // Last item
      ...placesToStay,                       // All original items
      placesToStay[0]                        // First item
    ];
  }, [placesToStay]);

  const totalSlides = placesToStay.length;

  const goToSlide = (index) => {
    if (isTransitioning || totalSlides === 0) return;
    
    setIsTransitioning(true);
    setCurrentSlide(index);
    
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: sliderRef.current.clientWidth * index,
        behavior: 'smooth'
      });
    }
    
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNext = () => {
    if (totalSlides === 0 || isTransitioning) return;
    
    const nextSlide = (currentSlide + 1) % totalSlides;
    goToSlide(nextSlide);
  };

  const goToPrevious = () => {
    if (totalSlides === 0 || isTransitioning) return;
    
    const prevSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    goToSlide(prevSlide);
  };

  // Handle scroll to detect current slide
  useEffect(() => {
    const handleScroll = () => {
      if (sliderRef.current && !isTransitioning) {
        const scrollLeft = sliderRef.current.scrollLeft;
        const slideWidth = sliderRef.current.clientWidth;
        const newSlide = Math.round(scrollLeft / slideWidth);
        
        if (newSlide !== currentSlide && newSlide >= 0 && newSlide < totalSlides) {
          setCurrentSlide(newSlide);
        }
      }
    };

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleScroll);
      return () => slider.removeEventListener('scroll', handleScroll);
    }
  }, [isTransitioning, totalSlides, currentSlide]);

  // Initialize slider position
  useEffect(() => {
    if (sliderRef.current && totalSlides > 0) {
      sliderRef.current.scrollTo({
        left: 0,
        behavior: 'instant'
      });
    }
  }, [totalSlides]);

  // Replace popup with dropdown state
  const [openDropdown, setOpenDropdown] = useState(null); // 'plane', 'ferry', 'train' or null

  // Dynamic weather state for both locations
  const [dynamicWeather, setDynamicWeather] = useState({
    source: { 
      temp: 'Loading...', 
      wind_speed: 'Loading...', 
      visibility: 'Loading...',
      humidity: 'Loading...',
      conditions: 'Loading...'
    },
    destination: { 
      temp: 'Loading...', 
      wind_speed: 'Loading...', 
      visibility: 'Loading...',
      humidity: 'Loading...',
      conditions: 'Loading...'
    }
  });

  const [dynamicMap, setDynamicMap] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [openIndex, setOpenIndex] = useState(null);
  
  // Extract destinationName and sourceName from URL parameters
  const [destinationName, setDestinationName] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [loadingNeighbors, setLoadingNeighbors] = useState(false);
  const [neighboringCountries, setNeighboringCountries] = useState([]);
  
  // Set destination country dynamically
  const [destinationCountry, setDestinationCountry] = useState('');

  // Helper function to capitalize first letter
  function capitalizeFirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  useEffect(() => {
    const handleScroll = () => {
      if (sliderRef.current) {
        const scrollLeft = sliderRef.current.scrollLeft;
        const slideWidth = sliderRef.current.clientWidth;
        const newSlide = Math.round(scrollLeft / slideWidth);
        setCurrentSlide(newSlide);
      }
    };

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleScroll);
      return () => slider.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Function to fetch real-time weather data for both locations
  const fetchRealTimeWeather = async () => {
    console.log('🔍 [DEBUG] fetchRealTimeWeather called');
    console.log('🔍 [DEBUG] sourceName:', sourceName);
    console.log('🔍 [DEBUG] destinationName:', destinationName);
    
    // Generate weather locations from URL parameters since JSON doesn't have them
    const sourceLocation = sourceName || capitalizeFirst(from);
    const destinationLocation = destinationName || capitalizeFirst(to);
    
    console.log('🔍 [DEBUG] Generated locations - Source:', sourceLocation, 'Destination:', destinationLocation);
    
    if (!sourceLocation || !destinationLocation) {
      console.error('❌ [ERROR] Cannot generate weather locations - missing source or destination names');
      setDynamicWeather({
        source: { 
          temp: 'N/A', 
          wind_speed: 'N/A', 
          visibility: 'N/A',
          humidity: 'N/A',
          conditions: 'Location not found'
        },
        destination: { 
          temp: 'N/A', 
          wind_speed: 'N/A', 
          visibility: 'N/A',
          humidity: 'N/A',
          conditions: 'Location not found'
        }
      });
      setWeatherLoading(false);
      return;
    }
    
    try {
      setWeatherLoading(true);
      console.log('🔄 [DEBUG] Starting weather API calls...');
      
      // Fetch weather data for both locations simultaneously
      const [sourceWeather, destinationWeather] = await Promise.all([
        fetchWeatherData(sourceLocation),
        fetchWeatherData(destinationLocation)
      ]);

      console.log('📡 [DEBUG] Source weather API response:', sourceWeather);
      console.log('📡 [DEBUG] Destination weather API response:', destinationWeather);

      // Check if API responses are valid
      if (!sourceWeather || !destinationWeather) {
        console.error('❌ [ERROR] Weather API returned null or undefined responses');
        throw new Error('Weather API returned invalid data');
      }

      // Format and update weather data - API already returns formatted strings!
      const formattedWeather = {
        source: {
          temp: sourceWeather.temp || 'N/A',
          wind_speed: sourceWeather.wind_speed || 'N/A',
          visibility: sourceWeather.visibility || 'N/A',
          humidity: sourceWeather.humidity || 'N/A',
          conditions: sourceWeather.description || sourceWeather.conditions || 'No data'
        },
        destination: {
          temp: destinationWeather.temp || 'N/A',
          wind_speed: destinationWeather.wind_speed || 'N/A',
          visibility: destinationWeather.visibility || 'N/A',
          humidity: destinationWeather.humidity || 'N/A',
          conditions: destinationWeather.description || destinationWeather.conditions || 'No data'
        }
      };

      console.log('✅ [DEBUG] Formatted weather data:', formattedWeather);
      setDynamicWeather(formattedWeather);
      setLastUpdated(new Date().toLocaleTimeString());
      console.log('✅ [DEBUG] Weather data successfully updated');
      
    } catch (error) {
      console.error('❌ [ERROR] Error fetching real-time weather:', error);
      

      const fallbackImages = {
  'eleuthera': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'berlin': 'https://images.unsplash.com/photo-1560930950-5cc20e5e10b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  // Add more as needed
};


      // Fallback to static weather data from JSON if API fails
      const fallbackWeather = {
        source: {
          temp: pageData?.weather?.nassau?.temp || pageData?.weather?.moscow?.temp || '26°C',
          wind_speed: pageData?.weather?.nassau?.wind_speed || pageData?.weather?.moscow?.wind_speed || '18 km/h',
          visibility: pageData?.weather?.nassau?.visibility || pageData?.weather?.moscow?.visibility || '16.0 km',
          humidity: '78%',
          conditions: 'Partly Cloudy'
        },
        destination: {
          temp: pageData?.weather?.eleuthera?.temp || pageData?.weather?.berlin?.temp || '27°C',
          wind_speed: pageData?.weather?.eleuthera?.wind_speed || pageData?.weather?.berlin?.wind_speed || '22 km/h',
          visibility: pageData?.weather?.eleuthera?.visibility || pageData?.weather?.berlin?.visibility || '15.5 km',
          humidity: '75%',
          conditions: 'Sunny'
        }
      };
      
      console.log('🔄 [DEBUG] Using fallback weather data:', fallbackWeather);
      setDynamicWeather(fallbackWeather);
    } finally {
      setWeatherLoading(false);
      console.log('🔚 [DEBUG] Weather loading completed');
    }
  };

  // Function to fetch background image
const fetchBackgroundImage = async () => {
  try {
    setBackground(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Get background image from JSON data
    let backgroundImageUrl = '';
    
    // Priority 1: Use the dedicated background_image from JSON
    if (pageData?.background_image) {
      backgroundImageUrl = pageData.background_image;
    }
    // Priority 2: Fallback to about_destination images
    else if (pageData?.about_destination?.images?.length > 0) {
      backgroundImageUrl = pageData.about_destination.images[0];
    }
    // Priority 3: Ultimate fallback
    else {
      const destination = destinationName?.toLowerCase() || '';
   
      
      backgroundImageUrl = fallbackImages[destination] ;
    }
    
    // Simulate loading (remove this in production)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // ✅ CORRECT: Use native JavaScript Image constructor
    await new Promise((resolve, reject) => {
      const img = new window.Image(); // Use native Image constructor
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load background image'));
      img.src = backgroundImageUrl;
    });
    
    setBackground({
      imageUrl: backgroundImageUrl,
      isLoading: false,
      error: null
    });
    
  } catch (error) {
    console.error('Error loading background image:', error);
    
    // Ultimate fallback
    setBackground({
      isLoading: false,
      error: 'Using fallback image'
    });
  }
};
  // Effect to fetch real-time weather data when page data is loaded
  useEffect(() => {
    console.log('🔍 [DEBUG] useEffect triggered - pageData:', pageData);
    
    if (pageData && sourceName && destinationName) {
      console.log('✅ [DEBUG] Conditions met, calling fetchRealTimeWeather');
      fetchRealTimeWeather();
      
      // Set up interval to refresh weather data every 5 minutes
      const weatherInterval = setInterval(fetchRealTimeWeather, 5 * 60 * 1000);
      
      return () => {
        console.log('🧹 [DEBUG] Cleaning up weather interval');
        clearInterval(weatherInterval);
      };
    } else {
      console.log('❌ [DEBUG] Conditions not met for weather fetch:', {
        hasPageData: !!pageData,
        hasSourceName: !!sourceName,
        hasDestinationName: !!destinationName
      });
    }
  }, [pageData, sourceName, destinationName]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Toggle dropdowns
  const toggleDropdown = (type) => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  // Close dropdown when clicking outside (optional)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const neighboringCountriesList = useMemo(() => {
    if (loadingNeighbors) return <div className="spinner small"></div>;
    
    // Fallback countries
    const fallbackCountries = [
      { name: "United States", code: "US" },
      { name: "Cuba", code: "CU" },
      { name: "Dominican Republic", code: "DO" },
      { name: "Jamaica", code: "JM" },
      { name: "Haiti", code: "HT" },
      { name: "Turks and Caicos", code: "TC" },
      { name: "Mexico", code: "MX" },
      { name: "Canada", code: "CA" }
    ].slice(0, 4);

    
    return (
      <ul className="routes-list">
        {fallbackCountries.map((country, index) => {
          const destSlug = destinationName 
            ? destinationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
            : to || 'destination';
            
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
                target="_blank"
              >
                How far is {country.name} from {destinationName || 'Destination'}?
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }, [loadingNeighbors, destinationName, to]);

  // Memoized popular routes
  const popularRoutes = useMemo(() => (
    <ul className="routes-list">
      {[
        'Miami',
        'New York',
        'Toronto',
        'London'
      ].map((city, index) => {
        const destSlug = destinationName
          ? destinationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          : to || 'destination';
          
        const citySlug = city
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        return (
          <li key={index}>
            <Link 
              href={`/location-from-location/how-far-is-${citySlug}-from-${destSlug}`}
              prefetch={false}
              target="_blank"
            >
              {city} to {destinationName || 'Destination'}
            </Link>
          </li>
        );
      })}
    </ul>
  ), [destinationName, to]);

  // Schedule Dropdown Component
  const ScheduleDropdown = ({ type, title, data, icon }) => (
    <div className="dropdown-container mb-6 w-full">
      <br/> <button 
        className={`w-full flex items-center justify-between p-4 hover:cursor-pointer hover:bg-[#eeeaea] rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
          openDropdown === type 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 bg-white hover:border-blue-300'
        }`}
        onClick={() => toggleDropdown(type)}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-lg font-semibold text-gray-800">{title}</span>
        </div>
        <div className={`transform transition-transform duration-300 ${
          openDropdown === type ? 'rotate-180' : ''
        }`}>
          {openDropdown === type ? (
            <FaChevronUp className="text-blue-800" />
          ) : (
            <FaChevronDown className="text-gray-800" />
          )}
        </div>
      </button>

      {/* Dropdown Content */}
      <div 
        className={`dropdown-content w-full ${openDropdown === type ? 'dropdown-open' : 'dropdown-closed'}`} 
      >
        <div className="dropdown-inner w-full">
          {type === 'plane' ? (
            <div className="airlines-container w-full">
              {data.schedule.airlines.map((airline, airlineIndex) => (
                <div key={airlineIndex} className="airline-card w-full">
                  <div className="airline-header">
                    <div className="airline-accent"></div>
                    <div className="airline-info">
                      <h4 className="airline-name">{airline.operator}</h4>
                      <p className="airline-routes">
                        {airline.routes.length} Route{airline.routes.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="routes-grid w-full">
                    {airline.routes.map((route, routeIndex) => (
                      <div key={routeIndex} className="route-card w-full">
                        <div className="route-header">
                          <span className="route-from">{route.from}</span>
                        </div>
                        <div className="departures-list">
                          {route.departures.map((time, timeIndex) => (
                            <div key={timeIndex} className="departure-item">
                              <span className="departure-bullet"></span>
                              <span className="departure-time">{time}</span>
                            </div>
                          ))}
                        </div>
                        <p className="route-days">{route.days}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : type === 'ferry' ? (
            <div className="ferry-routes-container w-full">
              {data.schedule.routes.map((route, routeIndex) => (
                <div key={routeIndex} className="ferry-route-card w-full">
                  <div className="ferry-route-header">
                    <div className="ferry-accent"></div>
                    <div className="ferry-route-info">
                      <h5 className="ferry-route-name">{route.from} to {route.to}</h5>
                      <p className="ferry-route-days">{route.days}</p>
                    </div>
                  </div>
                  
                  <div className="ferry-schedule-grid w-full">
                    <div className="schedule-column">
                      <h5 className="schedule-title">Departures</h5>
                      <div className="schedule-list">
                        {route.departures.map((time, timeIndex) => (
                          <div key={timeIndex} className="schedule-item">
                            <span className="schedule-bullet schedule-bullet-blue"></span>
                            <span className="schedule-time">{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="schedule-column">
                      <h5 className="schedule-title">Return</h5>
                      <div className="schedule-list">
                        <div className="schedule-item">
                          <span className="schedule-bullet schedule-bullet-green"></span>
                          <span className="schedule-time">{route.return}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="train-routes-container w-full">
              {data.schedule.routes.map((route, routeIndex) => (
                <div key={routeIndex} className="train-route-card w-full">
                  <div className="train-route-header">
                    <div className="train-accent"></div>
                    <div className="train-route-info">
                      <h5 className="train-route-name">{route.from} to {route.to}</h5>
                      <p className="train-route-days">{route.days}</p>
                    </div>
                  </div>
                  
                  <div className="train-schedule-grid w-full">
                    <div className="schedule-column">
                      <h5 className="schedule-title">Departures</h5>
                      <div className="schedule-list">
                        {route.departures.map((time, timeIndex) => (
                          <div key={timeIndex} className="schedule-item">
                            <span className="schedule-bullet schedule-bullet-blue"></span>
                            <span className="schedule-time">{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="schedule-column">
                      <h5 className="schedule-title">Arrival</h5>
                      <div className="schedule-list">
                        <div className="schedule-item">
                          <span className="schedule-bullet schedule-bullet-green"></span>
                          <span className="schedule-time">{route.return}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Fallback background image
  const fallbackBackground = 'places_to_stay_a.jpg';
  const backgroundImage = background.imageUrl || fallbackBackground;

  useEffect(() => {
    const loadPageDataFromUrl = () => {
      if (!window.location.pathname) {
        setPageExists(false);
        setIsChecking(false);
        return;
      }

      try {
        setIsChecking(true);

        // Extract the route from the URL, e.g., "how-to-get-to-eleuthera-from-nassau"
        const pathSegments = window.location.pathname.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1]; // get last part
        // Extract "eleuthera" and "nassau"
        const match = lastSegment.match(/how-to-get-to-(.*)-from-(.*)/);

        if (!match) {
          console.log('❌ [DEBUG] URL pattern does not match');
          setPageExists(false);
          return;
        }

        const [, toCity, fromCity] = match;
        
        // Find the matching page in the array
        const pageDataToUse = allPagesData.find(page => 
          page.page.slug === `how-to-get-to-${toCity}-from-${fromCity}` ||
          page.page.slug === `how-to-get-to-${fromCity}-from-${toCity}`
        )?.page;

        if (pageDataToUse) {
          setPageData(pageDataToUse);
          setDestinationName(capitalizeFirst(toCity));
          setSourceName(capitalizeFirst(fromCity));
          setDestinationCountry(pageDataToUse.general_info?.country || '');
          setPageExists(true);
          console.log(`✅ [DEBUG] Found route: ${toCity}-${fromCity}`);
        } else {
          console.log(`❌ [DEBUG] Route not found: ${toCity}-${fromCity}`);
          setPageExists(false);
        }

      } catch (error) {
        console.error('Error loading page data:', error);
        setPageExists(false);
      } finally {
        setIsChecking(false);
        setLoading(false);
      }
    };

    loadPageDataFromUrl();
    fetchBackgroundImage();
  }, []);

  useEffect(() => {
  if (pageData) {
    fetchBackgroundImage();
  }
}, [pageData]);

  // Show 404 if page doesn't exist
  if (!isChecking && !pageExists) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 card5">
        <Header />
        <main className="flex-grow pt-16 flex items-center justify-center card5">
          <div className="text-center card5">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 card5">404 - Page Not Found</h1>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn't find travel information for {from} to {to}.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show loading state
  if (loading || isChecking || !pageData) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading travel information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Destructure from dynamic pageData
  const { 
    title, 
    slug,
    intro, 
    route_overview, 
    general_info, 
    by_plane, 
    by_ferry,
    by_private_charter,
    by_train,
    best_overall_way,
    about_destination,
    top_things,
    places_to_stay,
    faqs,
    button
  } = pageData;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 ">
      <Head>

          <title>{pageData?.title || `How to Get from ${sourceName} to ${destinationName}`}</title>
  <meta name="description" content={intro.description} />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href={`https://yourdomain.com/${slug}`} />
  
  {/* Preload critical resources */}
  <link rel="preload" href={fallbackBackground} as="image" />
  <link rel="preconnect" href="https://images.unsplash.com" />
        
        {/* Inline critical CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical above-the-fold styles */
            .flex { display: flex; }
            .hidden { display: none; }
            .min-h-screen { min-height: 100vh; }
            .bg-gray-50 { background-color: #f9fafb; }
            .pt-16 { padding-top: 4rem; }
            .relative { position: relative; }
            .z-10 { z-index: 10; }
            .w-full { width: 100%; }
            .max-w-6xl { max-width: 72rem; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .absolute { position: absolute; }
            .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
            .object-cover { object-fit: cover; }
            .bg-blue-900\\/40 { background-color: rgba(30, 58, 138, 0.4); }
            .text-white { color: white; }
            .text-3xl { font-size: 1.875rem; }
            .font-extrabold { font-weight: 800; }
            .mb-6 { margin-bottom: 1.5rem; }
            
            /* Non-critical styles loaded after page render */
            .non-critical {
              display: none;
            }
          `
        }} />
        
        {/* Defer non-critical CSS */}
        <link 
          rel="stylesheet" 
          href="/css/c4483bb45b5d37ff.css" 
          media="print" 
          onLoad="this.media='all'" 
        />
        <noscript>
          <link rel="stylesheet" href="/css/c4483bb45b5d37ff.css" />
        </noscript>
      </Head>

      <Header />

      <main className="flex-grow pt-16">


<section 
  className="relative min-h-[70vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: `url(${background.imageUrl || fallbackBackground})`
  }}
>
  {/* Blue overlay */}
  <div className="absolute inset-0 bg-black/40"></div> 
  
  {/* Loading State */}
  {background.isLoading && (
    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-white text-lg">Loading beautiful view...</div>
    </div>
  )}
  
  {/* Error State */}
  {background.error && !background.isLoading && (
    <div className="absolute top-4 left-4 bg-red-100 border text-red-700 px-4 py-2 rounded text-sm">
      {background.error}
    </div>
  )}



          {/* Hero Content Container with proper spacing */}
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center h-full">
            <div className="max-w-2xl bg-opacity-20 rounded-xl p-6 sm:p-8 mx-auto hero1">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight drop-shadow-lg text-left">
                How to Get to <span className="text-yellow-400">{destinationName}</span>  from<span className="block"></span> <span className="text-yellow-400">{sourceName}</span> 
              </h1>

              <p className="text-sm sm:text-base md:text-xl text-gray-200 leading-relaxed max-w-3xl mb-10 drop-shadow-md text-left">
                {intro.description}
              </p><br/>

              <div className="flex flex-wrap gap-4 sm:gap-6 mt-10 sm:mt-16">
                {intro.buttons.map((button, index) => (
                  <button 
                    key={index}
                    className={`rounded-lg px-8 sm:px-16 py-3 sm:py-4 font-extrabold transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-lg ${
                      index === 0 
                        ? 'bg-[#0776d8] text-white hover:bg-blue-700 hover:cursor-pointer hover:scale-105' 
                        : 'bg-transparent text-white border-2 border-white hover:bg-[#0776d8] hover:text-white hover:cursor-pointer hover:border-transparent'
                    }`}
                    onClick={() => {
                      if (button.action.startsWith('.plane-route')) {
                        const element = document.querySelector(button.action);
                        element?.scrollIntoView({ behavior: 'smooth' });
                      } else if (button.text.toLowerCase().includes('route')) {
                        const planeSection = document.querySelector('.by-plane');
                        planeSection?.scrollIntoView({ behavior: 'smooth' });
                      } else if (button.text.toLowerCase().includes('weather')) {
                        const weatherSection = document.querySelector('.weather-route');
                        weatherSection?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    {button.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="bg-transparent container mx-auto py-8 max-w-6xl relative z-20 px-4 sm:px-6">
          
          {/* 🗺️ TRAVEL ROUTE OVERVIEW */}
          <section className="bg-transparent mb-12">
           <div className="compact-journey w-full">
  <div className="journey-header">
    <h2>
        {pageData?.journey_header?.title }
      </h2>
    {pageData?.journey_header?.subtitle}
  </div>

  <div className="options-grid w-full">
    {/* Best Route */}
    <div className="option-card best">
      <div className="card-header card5">
        <div className="icon-wrapper">
          <Crown className="icon" />
        </div>
        <div className="card-title">
          <h3>Best Route</h3>
          <span className="badge">Recommended</span>
        </div>
      </div>
      <p className="card-description">{pageData?.travel_options?.best_route?.description || "Direct flights with:"}</p>
      <div className="tags">
        {pageData?.travel_options?.best_route?.operators?.map((operator, index) => (
          <a key={index} href={operator.url} target="_blank" rel="noopener noreferrer">
            <span className="tag">{operator.name}</span>
          </a>
        ))}
      </div>
    </div>

    {/* Fastest */}
    <div className="option-card fastest">
      <div className="card-header">
        <div className="icon-wrapper">
          <Zap className="icon" />
        </div>
        <div className="card-title">
          <h3>Fastest</h3>
        </div>
      </div>
      <div className="time-display">
        <span className="time-label">
          {pageData?.travel_options?.fastest?.description || `When you travel to ${destinationName} from ${sourceName}, the fastest option is a direct flight, making it the quickest and most reliable way to get there`}
        </span>
      </div>
    </div>

    {/* Cheapest */}
    <div className="option-card cheapest">
      <div className="card-header">
        <div className="icon-wrapper">
          <DollarSign className="icon" />
        </div>
        <div className="card-title">
          <h3>Cheapest</h3>
        </div>
      </div>
      <p className="card-description">
        {pageData?.travel_options?.cheapest?.description || `Here are the top budget-friendly ways to travel to ${destinationName} from ${sourceName}:`}
      </p>
      <div className="ferry-list">
        {pageData?.travel_options?.cheapest?.operators?.map((operator, index) => (
          <a key={index} href={operator.url} target="_blank" rel="noopener noreferrer">
            <span className="tag">{operator.name}</span>
          </a>
        ))}
      </div>
    </div>

    {/* Most Reliable */}
    <div className="option-card reliable">
      <div className="card-header">
        <div className="icon-wrapper">
          <Shield className="icon" />
        </div>
        <div className="card-title">
          <h3>Most Reliable</h3>
        </div>
      </div>
      <div className="reliability-info">
        <p>{pageData?.travel_options?.most_reliable?.description || "Direct flight"}</p>
        <div className="reliability-badge">
          <CheckCircle className="check-icon" />
          <span>{pageData?.travel_options?.most_reliable?.reliability || "99% on-time"}</span>
        </div>
      </div>
    </div>
  </div>
</div>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="overflow-hidden rounded-lg shadow-md">
                {/* Static map from imported image */}
                <img
                  src={route_overview.map}
                  alt={`Route Map from ${sourceName} to ${destinationName}`}
                  className="w-full h-64 object-cover rounded-lg"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              <div className="space-y-6"><br/><br/>
                <div className="bg-transparent">
                  <div className="flex justify-between items-center card2">
                    <div className="flex items-center gap-3">
                      <FaMapMarkerAlt className="text-blue-800 text-xl" />
                      <h3 className="text-lg font-semibold text-blue-800">Distance</h3>
                    </div>
                    <p className="text-blue-800 font-medium">{route_overview.distance}</p>
                  </div>
                </div>

                <br/>
                <div className="bg-transparent">
                  <div className="flex justify-between items-center card2">
                    <div className="flex items-center gap-3">
                      <FaPlane className="text-green-800 text-xl" />
                      <h3 className="text-lg font-semibold text-green-800">Duration</h3>
                    </div>
                    <p className="text-green-800 font-medium text-right">{route_overview.duration}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 🌦️ REAL-TIME WEATHER + INFO CARDS */}
          <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 weather-route">
            <div className="card2 bg-white rounded-2xl border border-gray-100 p-6 transition-all">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span>🌤️</span> Current Weather
                </h3>
                {lastUpdated && (
                  <span className="text-xs text-gray-800 bg-gray-100 px-2 py-1 rounded p1">
                    Updated: {lastUpdated}
                  </span>
                )}
              </div>

              {weatherLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Loading weather...</span>
                </div>
              ) : dynamicWeather.source.temp === 'Loading...' ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">Failed to load weather data</p>
                  <button 
                    onClick={fetchRealTimeWeather}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Retry
                  </button>
                </div>
              ) :(
                <>
                  {/* Top temperature display */}
                  <div className="grid grid-cols-2 text-center mb-6">
                    <div className="border-r border-gray-200 pr-4">
                      <p className="text-3xl font-semibold text-blue-600 mb-1">
                        {dynamicWeather.source.temp}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">{sourceName}</p>
                      <p className="text-xs text-gray-800 mt-1">
                        {dynamicWeather.source.conditions}
                      </p>
                    </div>
                    <div className="pl-4">
                      <p className="text-3xl font-semibold text-green-600 mb-1">
                        {dynamicWeather.destination.temp}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">{destinationName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {dynamicWeather.destination.conditions}
                      </p>
                    </div>
                  </div>

                  {/* Weather details of both cities side by side */}
                  <div className="grid grid-cols-2 gap-6 card5">
                    {/* Source City Weather Details */}
                    <div className="bg-gray-50 rounded-lg p-4 card5">
                      <h4 className="font-semibold text-gray-700 mb-3 text-center">
                        {sourceName} Details
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm card5">
                        <div className="text-gray-800">Wind Speed</div>
                        <div className="text-gray-800 font-bold text-right">
                          {dynamicWeather.source.wind_speed}
                        </div>
                        <div className="text-gray-500">Visibility</div>
                        <div className="text-gray-800 font-bold text-right">
                          {dynamicWeather.source.visibility}
                        </div>
                        <div className="text-gray-500">Humidity</div>
                        <div className="text-gray-800 font-bold text-right">
                          {dynamicWeather.source.humidity}
                        </div>
                      </div>
                    </div>

                    {/* Destination City Weather Details */}
                    <div className="bg-gray-50 rounded-lg p-4 card5">
                      <h4 className="font-semibold text-gray-700 mb-3 text-center">
                        {destinationName} Details
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm card5">
                        <div className="text-gray-500">Wind Speed</div>
                        <div className="text-gray-800 font-bold text-right">
                          {dynamicWeather.destination.wind_speed}
                        </div>
                        <div className="text-gray-500">Visibility</div>
                        <div className="text-gray-800 font-bold text-right">
                          {dynamicWeather.destination.visibility}
                        </div>
                        <div className="text-gray-500">Humidity</div>
                        <div className="text-gray-800 font-bold text-right">
                          {dynamicWeather.destination.humidity}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="card2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>ℹ️</span> General Information
              </h3><br/>

              <div className="grid grid-cols-2 text-sm gap-y-3">
                <div className="text-gray-500">Best Travel Time</div>
                <div className="text-gray-800 font-bold text-right">{general_info.best_travel_time}</div>

                <div className="text-gray-500">Currency</div>
                <div className="text-gray-800 font-bold text-right">{general_info.currency}</div>

                <div className="text-gray-500">Language</div>
                <div className="text-gray-800 font-bold text-right">{general_info.language}</div>

                <div className="text-gray-500">Time Zone</div>
                <div className="text-gray-800 font-bold text-right">{general_info.time_zone}</div>

                <div className="text-gray-500">Main Airport</div>
                <div className="text-gray-800 font-bold text-right">{general_info.main_airport}</div>

                <div className="text-gray-500">Population</div>
                <div className="text-gray-800 font-bold text-right">{general_info.population}</div>
              </div>
            </div>
          </section>

          <div className="mb-12 justify-items-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Top Things to Do in {destinationName}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto justify-items-center  ">
              {topThings.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                    
                    {/* Image */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-64 object-cover"
                    />

                    {/* Content */}
                    <div className="p-4 flex flex-col gap-2">
                      <h3 className=" card5 text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {item.title}
                      </h3>
                      
                      <p className="card5 text-gray-700 text-sm md:text-base">
                        {item.description.split('\n').map((line, index) => (
                          <div key={index} className="flex items-start mb-3 pr-4">
                            <div className="w-2 h-2 bg-gray-600 mr-3 mt-2 flex-shrink-0 bullets"></div>
                            <span>{line.replace(/^- /, ' ')}</span>
                          </div>
                        ))}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div><br/><br/>

          {placesToStay.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                Places to Stay in {destinationName}
              </h2>
              
              {/* Slideshow Container */}
              <div className="relative max-w-6xl mx-auto">
                <div 
                  ref={sliderRef}
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollBehavior: isTransitioning ? 'auto' : 'smooth' }}
                >
                  {placesToStay.map((place, index) => (
                    <a 
                      key={index} 
                      href={place.href}
                      target="_blank"
                      className="flex-shrink-0 w-full snap-center relative rounded-xl overflow-hidden shadow-lg bg-[#0776d8] block cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-black/40"></div> 
                      <img
                        src={place.image}
                        alt={place.title}
                        className="img1 object-cover"
                      />
                      
                      <div className="absolute bottom-10 left-5 right-0 p-4 ">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg mb-2">
                          {place.title}
                        </h3>
                        <p className="text-white max-w-100">{place.subtitle}</p>
                        <br/>
                        <div className="space-y-3 absolute bottom-10 left-180 right-0 p-4">
                          {place.description.map((point, idx) => {
                            const parts = point.split(':');
                            const hasHeading = parts.length > 1;
                            
                            return (
                              <div
                                key={idx}
                                className="flex items-start space-x-3"
                                style={{ lineHeight: '1.6' }}
                              >
                                <div className="text-base sm:text-base text-white opacity-95 drop-shadow-md flex-1">
                                  {hasHeading ? (
                                    <div className="flex flex-col sm:flex-row sm:items-start">
                                      <span className="font-bold text-white opacity-100 sm:w-32 flex-shrink-0">
                                        {parts[0].trim()}:
                                      </span>
                                      <span className="font-normal text-white opacity-90 sm:ml-2 mt-1 sm:mt-0">
                                        {parts.slice(1).join(':').trim()}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-white opacity-90">{point}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                
                {/* Navigation Arrows */}
                <button 
                  onClick={goToPrevious}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white hover:cursor-pointer text-gray-800 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-20 border border-gray-300 hover:border-gray-400"
                  disabled={isTransitioning}
                  aria-label="Previous slide"
                >
                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button 
                  onClick={goToNext}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white hover:cursor-pointer text-gray-800 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-20 border border-gray-300 hover:border-gray-400"
                  disabled={isTransitioning}
                  aria-label="Next slide"
                >
                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Slide Indicators */}
                {totalSlides > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {placesToStay.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-1 h-1 rounded-full transition-all duration-300 b1 ${
                          index === currentSlide 
                            ? 'bg-white scale-125' 
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <br/><br/>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Available Routes & Modes
          </h2>

          {/* ✈️ BY PLANE */}
          {by_plane && (
            <section className="bg-transparent p-4 sm:p-8 mb-8 transition-all plane-route">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Content Section - Comes First */}
                <div className="by-plane order-2 md:order-1">
                  <div className="flex items-center gap-3 mb-6">
                    <FaPlane className="text-blue-800 text-2xl" />
                    <h2 className="text-xl font-semibold text-gray-800">How to get to {destinationName} from {sourceName} By Plane</h2>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-6">
                    {by_plane.description}
                  </p>

                  <ul className="space-y-3 text-sm mb-6">
                    <li className="flex items-start gap-3">
                      <span className="text-green-800 text-lg mt-0.5">💲</span>
                      <div>
                        <span className="text-gray-800 font-medium">Average cost:</span> 
                        <span className="text-gray-600 ml-2">{by_plane.average_cost}</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="text-blue-800 text-lg mt-0.5">⌛</span>
                      <div>
                        <span className="text-gray-800 font-medium">Travel time:</span> 
                        <span className="text-gray-600 ml-2">{by_plane.travel_time}</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="text-purple-500 text-lg mt-0.5">🚗</span>
                      <span className="text-gray-600">{by_plane.tip}</span>
                    </li>
                  </ul>

                  {/* Flight Schedules Dropdown */}
                
                </div>

                {/* Image Section - Comes Second on Mobile */}
                <div className="flex justify-center md:justify-end order-1 md:order-2">
                  <img
                    src={by_plane.image}
                    alt={`Flying from ${sourceName} to ${destinationName}`}
                    className="rounded-xl shadow-md object-cover w-full max-w-md h-auto"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
                <ScheduleDropdown
                    type="plane"
                    title="✈️ Flight Schedules & Timetables"
                    data={by_plane}
                  />
            </section>
          )}

          <br/><br/><br/><br/>

          {/* ⛴️ BY FERRY */}
          {by_ferry && (
            <section className="bg-transparent p-4 sm:p-8 mb-8 transition-all">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Image Section - Comes First on Mobile */}
                <div className="flex justify-center md:justify-start">
                  <img
                    src={by_ferry.image}
                    alt={`Ferry from ${sourceName} to ${destinationName}`}
                    loading="lazy"
                    decoding="async"
                    className="rounded-xl shadow-md object-cover w-full max-w-md h-auto"
                  />
                </div>

                {/* Content Section - Comes Second on Mobile */}
                <div className="by-ferry">
                  <div className="flex items-center gap-3 mb-6">
                    <FaShip className="text-blue-800 text-2xl" />
                    <h2 className="text-xl font-semibold text-gray-800">How to get to {destinationName} from {sourceName} By Ferry</h2>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-6">
                    {by_ferry.description}
                  </p>

                  <ul className="space-y-3 text-sm mb-6">
                    <li className="flex items-start gap-3">
                      <span className="text-green-800 text-lg mt-0.5">●</span>
                      <div>
                        <span className="font-medium text-gray-800">Operator:</span> 
                        <span className="ml-2">{by_ferry.operator}</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="text-blue-800 text-lg mt-0.5 ">●</span>
                      <div>
                        <span className="font-medium text-gray-800">Duration:</span> 
                        <span className="ml-2">{by_ferry.duration}</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="text-purple-500 text-lg mt-0.5">●</span>
                      <div>
                        <span className="font-medium text-gray-800">Departure:</span> 
                        <span className="ml-2">{by_ferry.departure_location}</span>
                      </div>
                    </li>
                  </ul>

                  {/* Ferry Schedules Dropdown */}
                  
              </div>
                </div>
                
                <ScheduleDropdown
                    type="ferry"
                    title="⛴️ Ferry Schedules & Timetables"
                    data={by_ferry}
                  />
            </section>
          )}

          {/* 🚂 BY TRAIN */}
          {by_train && (
            <section className="bg-transparent p-4 sm:p-8 mb-8 transition-all">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="flex justify-center md:justify-start">
                  <img
                    src={by_train.image}
                    alt={`Train from ${sourceName} to ${destinationName}`}
                    loading="lazy"
                    decoding="async"
                    className="rounded-xl shadow-md object-cover w-full max-w-md h-auto"
                  />
                </div>
                
                <div className="by-train">
                  <div className="flex items-center gap-3 mb-6">
                    <FaTrain className="text-blue-800 text-2xl" />
                    <h2 className="text-xl font-semibold text-gray-800">How to get to {destinationName} from {sourceName} By Train</h2>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-6">
                    {by_train.description}
                  </p>

                  <ul className="space-y-3 text-sm mb-6">
                    <li className="flex items-start gap-3">
                      <span className="text-green-800 text-lg mt-0.5">●</span>
                      <div>
                        <span className="font-medium text-gray-800">Operator:</span> 
                        <span className="ml-2">{by_train.operator}</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="text-blue-800 text-lg mt-0.5">●</span>
                      <div>
                        <span className="font-medium text-gray-800">Duration:</span> 
                        <span className="ml-2">{by_train.duration}</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <span className="text-purple-500 text-lg mt-0.5">●</span>
                      <div>
                        <span className="font-medium text-gray-800">Departure:</span> 
                        <span className="ml-2">{by_train.departure_location}</span>
                      </div>
                    </li>
                  </ul>

                  {/* Train Schedules Dropdown */}
                
                </div>
              </div>  <ScheduleDropdown
                    type="train"
                    title="🚂 Train Schedules & Timetables"
                    data={by_train}
                  />
            </section>
          )}

          <br/><br/><br/><br/>

          {/* 🚁 BY PRIVATE CHARTER */}
          {by_private_charter && (
            <section className="bg-transparent p-4 sm:p-8 mb-8 transition-all">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Content Section - Comes First */}
                <div className="order-2 md:order-1">
                  <div className="flex items-center gap-3 mb-6">
                    <FaPlane className="text-blue-800 text-2xl" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      How to get to {destinationName} from {sourceName} By Private Charter
                    </h2>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    {by_private_charter.description}
                  </p>
                  <br/>
                  {button && (
  <div className="my-6">
    <a
      href={button.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card5 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 hover:cursor-pointer"
    >
     
      {button.text}
    </a>
  </div>
)}
                </div>

                {/* Image Section - Comes Second on Mobile */}
                <div className="flex justify-center md:justify-end order-1 md:order-2">
                  <img
                    src="/get-from-to-images/charter-plane-eleuthera.webp"
                    alt={`Private Charter from ${sourceName} to ${destinationName}`}
                    loading="lazy"
                    decoding="async"
                    className="rounded-xl shadow-md object-cover w-full max-w-md h-auto"
                  />
                </div>
              </div>
            </section>
          )}

          <br/><br/><br/><br/>

          {/* 📊 TRAVEL COMPARISON TABLE */}
{pageData?.travel_comparison_table && (
  <section className="bg-white rounded-2xl shadow-lg p-6 mb-12 mt-8">
    <h2 className="card5 text-2xl font-bold text-gray-800 mb-6 text-center">
      Compare Ways to Get from {sourceName} to {destinationName}
    </h2>
    
    {/* Desktop Table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-50">
            <th className="p-4 text-left font-semibold text-blue-800 border-b card5">Mode</th>
            <th className="p-4 text-left font-semibold text-blue-800 border-b card5">Travel Time</th>
            <th className="p-4 text-left font-semibold text-blue-800 border-b card5">Average Cost</th>
            <th className="p-4 text-left font-semibold text-blue-800 border-b card5">Departure & Arrival Points</th>
            <th className="p-4 text-left font-semibold text-blue-800 border-b card5">Best For</th>
            <th className="p-4 text-left font-semibold text-blue-800 border-b card5">Booking Tip</th>
          </tr>
        </thead>
        <tbody>
          {pageData.travel_comparison_table.travelOptions.map((option, index) => (
            <tr 
              key={index} 
              className={` card5border-b hover:bg-gray-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="card5 p-4 font-semibold text-gray-800">
                {option.mode}
              </td>
              <td className="card5 p-4 text-gray-700">{option.travelTime}</td>
              <td className="card5 p-4 text-gray-700">{option.averageCost}</td>
              <td className="card5 p-4 text-gray-700">{option.departureArrival}</td>
              <td className="card5 p-4 text-gray-700">{option.bestFor}</td>
              <td className="card5 p-4 text-gray-600 text-sm">{option.bookingTip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Cards */}
    <div className="md:hidden space-y-4">
      {pageData.travel_comparison_table.travelOptions.map((option, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-lg text-blue-800">{option.mode}</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
              {option.travelTime}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Cost:</span>
              <span className="text-gray-800">{option.averageCost}</span>
            </div>
            
            <div>
              <span className="text-gray-600 font-medium">Route:</span>
              <p className="text-gray-800 text-sm mt-1">{option.departureArrival}</p>
            </div>
            
            <div>
              <span className="text-gray-600 font-medium">Best For:</span>
              <p className="text-gray-800 text-sm mt-1">{option.bestFor}</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
              <span className="text-yellow-800 text-sm font-medium">💡 {option.bookingTip}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

          {/* 📖 ABOUT DESTINATION */}
          <section className="bg-transparent p-4 sm:p-8 mb-12 transition-all text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              About {destinationName}
            </h2>

            <div className="block sm:hidden mb-6">
              <CarouselMobile />
            </div>

            <div className="hidden sm:flex flex-col md:flex-row justify-center items-center gap-6 mb-8 max-w-6xl mx-auto">
              {about_destination.images.map((img, i) => (
                <div key={i} className="flex-1 max-w-md">
                  <Image
                    src={img}
                    alt={`${destinationName} image ${i + 1}`}  
                    width={665}
                    height={503}
                    className="w-full h-auto object-cover rounded-lg shadow-md"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>

            <div className="max-w-4xl mx-auto desc">
              {about_destination.description.map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

         {/* ❓ FAQ SECTION */}
<section className="mb-16 px-4">
  <h2 className="text-2xl font-semibold text-center mb-8 text-gray-900">
    Frequently Asked Questions
  </h2>

  <div className="flex flex-col items-center gap-4">
    {faqs.map(({ q, a }, i) => (
      <div
        key={i}
        className={`faq-card w-full max-w-2xl bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${
          openIndex === i ? 'open' : ''
        }`}
        onClick={() => toggleFAQ(i)}
        role="button"
        tabIndex={0}
        aria-expanded={openIndex === i}
        aria-controls={`faq-answer-${i}`}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFAQ(i);
          }
        }}
      >
        <div className="p-6">
          <h2>
            <button className="faq-question w-full text-left flex justify-between items-center" aria-hidden="true" tabIndex={-1}>
              <span className="text-lg font-medium text-gray-900 pr-4 flex-1">{q}</span>
             
            </button>
          </h2>

          <div 
            id={`faq-answer-${i}`} 
            className={`faq-answer transition-all duration-200 overflow-hidden ${
              openIndex === i ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
            role="region"
          >
            <p className="text-gray-700 leading-relaxed">{a}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

          {/* 📍 RADIUS SELECTOR */}
          <section className="text-center mb-12 s">
            <RadiusSelector location={destinationName} />
          </section>
        </div>
      </main>

      {/* 🗺️ DISCOVER CITIES & POPULAR ROUTES */}
      <footer className="page-footer">
        <div className="footer-section card3">
          <h4>How far is {destinationName} from neighboring countries?</h4>
          {neighboringCountriesList}
        </div>
        <div className="footer-section card3">
          <h4>Popular Routes to {destinationName}</h4>
          {popularRoutes}
        </div>
      </footer>

      <Footer />

      <style jsx>{`
        .card2 {
          padding: 20px !important;
          margin-bottom: 16px;
        }
        .card3 {
          padding: 5px !important;
          background-color: transparent !important;
          margin-bottom: 5px;
        }
        .by-plane{
          margin-top: 0px;
        }
        .by-ferry{
          margin-top: 0px;
          padding-right: 0px;
        }
        .img-div{
          margin-top: 0px;
          margin-right: 0px;
        }
        .desc {
          margin-top: 20px;
          margin-left: auto;
          margin-right: auto;
          max-width: 700px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .ferry-text{
          max-width: 480px;
        }
        .img-plane{
          padding-right: 0px;
        }
        
        /* Dropdown animations */
        .dropdown-container {
          transition: all 0.3s ease;
        }
        
        .page-footer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .footer-section {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .footer-section h4 {
          margin-bottom: 1rem;
          color: #333;
        }
        
        .routes-list {
          list-style: none;
          padding: 0;
        }
        
        .routes-list li {
          margin-bottom: 0.5rem;
          padding: 4px 0;
        }
        
        .routes-list a {
          color: #0776d8;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        
        .routes-list a:hover {
          text-decoration: underline;
          color: #065bb5;
        }

        /* Spacing utilities */
        .space-y-6 > * + * {
          margin-top: 1.5rem;
        }
        
        .space-y-4 > * + * {
          margin-top: 1rem;
        }
        
        .space-y-3 > * + * {
          margin-top: 0.75rem;
        }
        
        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }

        /* Custom spacing for better layout */
        .mb-12 {
          margin-bottom: 3rem;
        }
        
        .mb-8 {
          margin-bottom: 2rem;
        }
        
        .mb-6 {
          margin-bottom: 1.5rem;
        }
        
        .mb-4 {
          margin-bottom: 1rem;
        }

        .mt-6 {
          margin-top: 1.5rem;
        }

        .p-8 {
          padding: 2rem;
        }

        .gap-8 {
          gap: 2rem;
        }

        .gap-6 {
          gap: 1.5rem;
        }

        .gap-4 {
          gap: 1rem;
        }
        
        .card4{
          margin: 10px !important;
        }
        
        .img-divs{
          margin-top:40px;
        }

        /* Responsive improvements */
        @media (max-width: 768px) {
          .page-footer {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
          }
          
          .footer-section {
            padding: 1rem;
          }
        }
        
        @media (max-width: 1024px) {
          .hero1{
            padding-left: 20px;
          }
        }

        /* Smooth transitions for dropdown */
        .dropdown-container * {
          transition: all 0.3s ease;
        }

        .p1{
          padding:5px !important; 
        }
        .card5{
          padding:10px !important;
        }
        .compact-journey {
          margin: 0 auto;
        }

        .journey-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .journey-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .journey-header p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin: 30px 0;
        }

        .option-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .option-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        /* Soft Coral */
        .option-card.best::before {
          background: linear-gradient(135deg, #FF9A8B, #FF6B9D);
        }

        .option-card.best .icon-wrapper {
          background: linear-gradient(135deg, #FF9A8B, #FF6B9D);
        }

        .option-card.best .badge {
          background: linear-gradient(135deg, #FF9A8B, #FF6B9D);
          color: white;
        }

        .option-card.best .tag {
          background: #FFF5F5;
          color: #C53030;
          border: 1px solid #FED7D7;
        }

        /* Soft Sky Blue */
        .option-card.fastest::before {
          background: linear-gradient(135deg, #7DD3FC, #0EA5E9);
        }

        .option-card.fastest .icon-wrapper {
          background: linear-gradient(135deg, #7DD3FC, #0EA5E9);
        }

        .option-card.fastest .time {
          background: linear-gradient(135deg, #0EA5E9, #0369A1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Soft Mint Green */
        .option-card.cheapest::before {
          background: linear-gradient(135deg, #6EE7B7, #10B981);
        }

        .option-card.cheapest .icon-wrapper {
          background: linear-gradient(135deg, #6EE7B7, #10B981);
        }

        .option-card.cheapest .ferry-list span {
          background: #F0FDF4;
          color: #065F46;
        }

        /* Soft Lavender */
        .option-card.reliable::before {
          background: linear-gradient(135deg, #A5B4FC, #8B5CF6);
        }

        .option-card.reliable .icon-wrapper {
          background: linear-gradient(135deg, #A5B4FC, #8B5CF6);
        }

        .option-card.reliable .reliability-badge {
          background: #FAF5FF;
          color: #7C3AED;
          border: 1px solid #E9D5FF;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .icon {
          width: 20px;
          height: 20px;
          color: white;
        }

        .card-title {
          flex: 1;
        }

        .card-title h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 6px 0;
        }

        .badge {
          background: linear-gradient(135deg, #FF9A8B, #FF6B9D);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
        }

        .card-description {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 12px;
          line-height: 1.4;
          font-weight: 500;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          background: #FFF5F5;
          color: #C53030;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          border: 1px solid #FED7D7;
        }

        .time-display {
          text-align: center;
          margin-top: 10px;
        }

        .time {
          display: block;
          font-size: 1.4rem;
          font-weight: 800;
          margin-bottom: 4px;
          background: linear-gradient(135deg, #0EA5E9, #0369A1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .time-label {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }

        .ferry-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ferry-list span {
          background: #F0FDF4;
          color: #065F46;
          font-size: 0.85rem;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 500;
        }

        .reliability-info p {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .reliability-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #FAF5FF;
          color: #7C3AED;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid #E9D5FF;
        }

        .check-icon {
          width: 16px;
          height: 16px;
          color: #10B981;
        }

        @media (max-width: 1024px) {
          .options-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }

        @media (max-width: 640px) {
          .options-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .option-card {
            padding: 20px;
          }
          
          .card-header {
            gap: 10px;
          }
          
          .icon-wrapper {
            width: 36px;
            height: 36px;
          }
          
          .icon {
            width: 18px;
            height: 18px;
          }
        }

        /* Add hover effects for airline buttons */
        .tags a .tag {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        /* Bahamas Air - Blue theme */
        .tags a:first-child .tag:hover {
          background: #ef4444!important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
        }

        /* Western Air - Red theme */
        .tags a:nth-child(2) .tag:hover {
          background: #dc2626 !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        /* Southern Air - Green theme */
        .tags a:nth-child(3) .tag:hover {
          background: #ef4444 !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        /* Add hover effects for ferry company buttons */
        .ferry-list a span {
          transition: all 0.3s ease;
          cursor: pointer;
          display: block;
        }

        /* Eleuthera Express - Teal theme */
        .ferry-list a:first-child span:hover {
          background: #0f766e !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);
        }

        /* Current Pride - Purple theme */
        .ferry-list a:nth-child(2) span:hover {
          background: #0f766e !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        /* Bahamas Daybreak - Orange theme */
        .ferry-list a:nth-child(3) span:hover {
          background: #0f766e!important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
        }

        /* Bahamas Fast Ferries - Blue theme */
        .ferry-list a:nth-child(4) span:hover {
          background: #0f766e !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Mobile-first responsive adjustments */
        @media (max-width: 767px) {
          .carousel-content {
            flex-direction: column;
            text-align: center;
          }
          
          .carousel-title {
            margin-bottom: 12px;
          }
          
          .carousel-description {
            text-align: center;
          }
        }

        /* Ensure proper spacing on all screens */
        .space-y-4 > * + * {
          margin-top: 1rem;
        }

        /* Better gradient overlay for mobile */
        @media (max-width: 640px) {
          .absolute.inset-0.bg-blue-900\/40 {
            background: linear-gradient(to bottom, rgba(30, 58, 138, 0.3), rgba(30, 58, 138, 0.6));
          }
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        button:disabled:hover {
          transform: none !important;
          background: rgba(255, 255, 255, 0.8) !important;
          scale: 1 !important;
        }

        .b1{
          min-height: 2px !important;
          min-width: 2px !important;
          padding: 5px 5px !important;
          font-size: 12px !important;
          font-weight: 550 !important;
          background-clip: padding-box !important;
          margin:5px !important;
        }

        .img1{
          width:100%;
          height:450px;
        }

        .bullets{
          margin-right:10px;
          margin-top:7px;
        }
          .faq-card1 {
  width: 100%; /* or specific width */
  max-width: 800px; /* prevents over-stretching */
  min-height: fit-content; /* consistent height */
  transition: all 0.3s ease;
padding: 1rem;
    border-left: 4px solid #4b9cd3;
}
    /* Table Styles */
table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

th, td {
  border-color: #e5e7eb;
}

th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #1e40af;
}

tr:last-child {
  border-bottom: none;
}

/* Mobile card animations */
@media (max-width: 768px) {
  .mobile-travel-card {
    transition: all 0.3s ease;
  }
  
  .mobile-travel-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

/* Ensure proper scrolling for wide tables */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
      `}</style>
    </div>
  );
}