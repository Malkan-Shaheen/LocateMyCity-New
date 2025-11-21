'use client';
import { useState, useEffect, useMemo, useRef } from "react";
import React from 'react';
import Head from 'next/head';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import WeatherDetails from '../../../../components/WeatherDetails';
import CountryInfoDetails from '../../../../components/CountryInfoDetails';
import RadiusSelector from '../../../../components/RadiusSelector';
import { FaPlane, FaShip, FaMapMarkerAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import CarouselMobile from '../../../../components/CarouselMobile';
import Link from 'next/link';
import { getRouteCoordinates, fetchWeatherData, fetchRouteMap } from '../../../../utils/api';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { CheckCircle, Zap, DollarSign, Shield } from 'lucide-react';
import { Crown, Clock, TrendingUp, Star } from 'lucide-react';


// Import JSON directly
import allPagesData from '../../../../data/cities_info';

export default function HowToGetToPage() {
  const params = useParams();
  const from = params.from; // This will be 'nassau', 'moscow', etc.
  const to = params.to; // This will be 'eleuthera', 'berlin', etc.



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

const totalSlides = extendedPlacesToStay.length;

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
  
  // Reset transitioning state after animation
  setTimeout(() => setIsTransitioning(false), 500);
};

const goToNext = () => {
  if (totalSlides === 0 || isTransitioning) return;
  
  const nextSlide = currentSlide + 1;
  
  if (nextSlide >= totalSlides - 1) {
    // If we're at the cloned last item, instantly jump to the real first item
    setTimeout(() => {
      setCurrentSlide(1);
      sliderRef.current.scrollTo({
        left: sliderRef.current.clientWidth * 1,
        behavior: 'instant'
      });
    }, 500);
  }
  
  goToSlide(nextSlide);
};

const goToPrevious = () => {
  if (totalSlides === 0 || isTransitioning) return;
  
  const prevSlide = currentSlide - 1;
  
  if (prevSlide <= 0) {
    // If we're at the cloned first item, instantly jump to the real last item
    setTimeout(() => {
      setCurrentSlide(totalSlides - 2);
      sliderRef.current.scrollTo({
        left: sliderRef.current.clientWidth * (totalSlides - 2),
        behavior: 'instant'
      });
    }, 500);
  }
  
  goToSlide(prevSlide);
};

// Handle scroll to detect current slide
useEffect(() => {
  const handleScroll = () => {
    if (sliderRef.current && !isTransitioning) {
      const scrollLeft = sliderRef.current.scrollLeft;
      const slideWidth = sliderRef.current.clientWidth;
      const newSlide = Math.round(scrollLeft / slideWidth);
      
      // Adjust for cloned items
      let adjustedSlide = newSlide;
      if (newSlide === 0) {
        adjustedSlide = placesToStay.length - 1;
      } else if (newSlide === totalSlides - 1) {
        adjustedSlide = 0;
      } else {
        adjustedSlide = newSlide - 1;
      }
      
      setCurrentSlide(adjustedSlide);
    }
  };

  const slider = sliderRef.current;
  if (slider) {
    slider.addEventListener('scroll', handleScroll);
    return () => slider.removeEventListener('scroll', handleScroll);
  }
}, [isTransitioning, placesToStay.length, totalSlides]);

// Auto-slide every 5 seconds
useEffect(() => {
  if (placesToStay.length === 0) return;
  
  const interval = setInterval(() => {
    goToNext();
  }, 5000);
  
  return () => clearInterval(interval);
}, [currentSlide, placesToStay.length, isTransitioning]);

// Initialize slider position
useEffect(() => {
  if (sliderRef.current && totalSlides > 0) {
    // Start at the first real item (index 1 because we added a clone at the beginning)
    sliderRef.current.scrollTo({
      left: sliderRef.current.clientWidth * 1,
      behavior: 'instant'
    });
  }
}, [totalSlides]);

  // Replace popup with dropdown state
  const [openDropdown, setOpenDropdown] = useState(null); // 'plane', 'ferry', or null

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




// Auto-slide every 5 seconds
useEffect(() => {
  const interval = setInterval(goToNext, 5000);
  return () => clearInterval(interval);
}, [currentSlide, placesToStay.length]);

// Update current slide on scroll
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

  // Load page data based on route parameters
  useEffect(() => {
    const loadPageData = () => {
      if (!from || !to) return;
      
      try {
        setLoading(true);
        const routeKey = `${from}-${to}`;
        
        // Get the specific page data from our JSON
const specificPageData = allPagesData.page;        
        if (specificPageData) {
          setPageData(specificPageData);
          setDestinationName(capitalizeFirst(to));
          setSourceName(capitalizeFirst(from));
          // Set destination country based on the route
          setDestinationCountry(specificPageData.general_info?.country_code || 'BS');
        } else {
          console.error(`No data found for route: ${routeKey}`);
          // Fallback to first available page
          const firstKey = Object.keys(allPagesData.pages)[0];
          const fallbackData = allPagesData.pages[firstKey];
          setPageData(fallbackData);
          setDestinationName(capitalizeFirst(to));
          setSourceName(capitalizeFirst(from));
        }
        
      } catch (error) {
        console.error('Error loading page data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
    fetchBackgroundImage();
  }, [from, to]);


// Function to fetch real-time weather data for both locations
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
        humidity: sourceWeather.humidity || 'N/A', // Note: humidity might not be in response
        conditions: sourceWeather.description || sourceWeather.conditions || 'No data'
      },
      destination: {
        temp: destinationWeather.temp || 'N/A',
        wind_speed: destinationWeather.wind_speed || 'N/A',
        visibility: destinationWeather.visibility || 'N/A',
        humidity: destinationWeather.humidity || 'N/A', // Note: humidity might not be in response
        conditions: destinationWeather.description || destinationWeather.conditions || 'No data'
      }
    };

    console.log('✅ [DEBUG] Formatted weather data:', formattedWeather);
    setDynamicWeather(formattedWeather);
    setLastUpdated(new Date().toLocaleTimeString());
    console.log('✅ [DEBUG] Weather data successfully updated');
    
  } catch (error) {
    console.error('❌ [ERROR] Error fetching real-time weather:', error);
    
    // Fallback to static weather data if API fails
    const fallbackWeather = {
      source: {
        temp: '26°C',
        wind_speed: '18 km/h',
        visibility: '16.0 km',
        humidity: '78%',
        conditions: 'Partly Cloudy'
      },
      destination: {
        temp: '27°C',
        wind_speed: '22 km/h',
        visibility: '15.5 km',
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
      
      const demoImageUrl = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBackground({
        imageUrl: demoImageUrl,
        isLoading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error fetching background image:', error);
      setBackground({
        imageUrl: '',
        isLoading: false,
        error: 'Failed to load background image'
      });
    }
  };

  // Effect to fetch real-time weather data when page data is loaded
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
          const destSlug = sourceName 
            ? sourceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
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
              >
                How far is {country.name} from {sourceName || 'Destination'}?
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }, [loadingNeighbors, sourceName, to]);

  // Memoized popular routes
  const popularRoutes = useMemo(() => (
    <ul className="routes-list">
      {[
        'Miami',
        'New York',
        'Toronto',
        'London'
      ].map((city, index) => {
        const destSlug = sourceName
          ? sourceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
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
            >
              {city} to {sourceName || 'Destination'}
            </Link>
          </li>
        );
      })}
    </ul>
  ), [sourceName, to]);

  // Schedule Dropdown Component
   const ScheduleDropdown = ({ type, title, data, icon }) => (
    <div className="dropdown-container mb-6 w-full"> {/* Add w-full here */}
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
  <div className="dropdown-inner w-full"> {/* Add w-full here */}
    {type === 'plane' ? (
      <div className="airlines-container w-full"> {/* Add w-full here */}
        {data.schedule.airlines.map((airline, airlineIndex) => (
          <div key={airlineIndex} className="airline-card w-full"> {/* Add w-full here */}
            <div className="airline-header">
              <div className="airline-accent"></div>
              <div className="airline-info">
                <h4 className="airline-name">{airline.operator}</h4>
                <p className="airline-routes">
                  {airline.routes.length} Route{airline.routes.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="routes-grid w-full"> {/* Add w-full here */}
              {airline.routes.map((route, routeIndex) => (
                <div key={routeIndex} className="route-card w-full"> {/* Add w-full here */}
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
    ) : (
      <div className="ferry-routes-container w-full"> {/* Add w-full here */}
        {data.schedule.routes.map((route, routeIndex) => (
          <div key={routeIndex} className="ferry-route-card w-full"> {/* Add w-full here */}
            <div className="ferry-route-header">
              <div className="ferry-accent"></div>
              <div className="ferry-route-info">
                <h5 className="ferry-route-name">{route.from} to {route.to}</h5>
                <p className="ferry-route-days">{route.days}</p>
              </div>
            </div>
            
            <div className="ferry-schedule-grid w-full"> {/* Add w-full here */}
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
    )}
  </div>
</div>
    </div>
  );
   

  // Fallback background image
  const fallbackBackground = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
  const backgroundImage = background.imageUrl || fallbackBackground;

  // Show loading state
  if (loading || !pageData) {
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
    intro, 
    route_overview, 
    general_info, 
    by_plane, 
    by_ferry,
    by_private_charter,
    best_overall_way,
    about_destination,
    faqs
  } = pageData;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 ">
       <Head>
        <title>{title} | LocateMyCity</title>
        <meta name="description" content={intro.description} />
        <meta name="robots" content="index, follow" />
        
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
        {/* 🏝️ HERO SECTION WITH DYNAMIC BACKGROUND */}
   <section className="relative min-h-[70vh] flex items-center justify-center bg-cover bg-center bg-no-repeat">
  {/* Background Image */}
  <Image
    src={fallbackBackground}
    alt={`Beautiful view of ${destinationName}`}
    className="absolute inset-0 w-full h-full object-cover"
    priority={true}
    fetchPriority="high"
    fill
    sizes="100vw"
    quality={85}
  />

  {/* Blue overlay */}
  <div className="absolute inset-0 bg-blue-900/40"></div> 
  
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
        How to Get from <span className="text-yellow-400">{sourceName}</span>  to<span className="block"></span> <span className="text-yellow-400">{destinationName}</span> 
        
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
    <h2>Travel from {sourceName} to {destinationName}</h2>
    <p>Choose your preferred option</p>
  </div>

  <div className="options-grid w-full">
  <div className="option-card best">
    <div className="card-header card5">
      <div className="icon-wrapper">
        <Crown className="icon" />
      </div>
      <div className="card-title ">
        <h3>Best Route</h3>
        <span className="badge">Recommended</span>
      </div>
    </div>
    <p className="card-description">Direct flights with:</p>
    <div className="tags">
      <span className="tag">Bahamas Air</span>
      <span className="tag">Western Air</span>
      <span className="tag">Southern Air</span>
    </div>
  </div>

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
      <span className="time">15-20 min</span>
      <span className="time-label">Direct flight</span>
    </div>
  </div>

  <div className="option-card cheapest">
    <div className="card-header">
      <div className="icon-wrapper">
        <DollarSign className="icon" />
      </div>
      <div className="card-title">
        <h3>Cheapest</h3>
      </div>
    </div>
    <p className="card-description">Ferry services:</p>
    <div className="ferry-list">
      <span>Eleuthera Express</span>
      <span>Current Pride</span>
      <span>Bahamas Daybreak</span>
      <span>Bahamas Fast Ferries</span>
    </div>
  </div>

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
      <p>Direct flight</p>
      <div className="reliability-badge">
        <CheckCircle className="check-icon" />
        <span>99% on-time</span>
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

          <div className="mb-12">
  <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
    Top Things to Do in {sourceName}
  </h2>
  
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto justify-self-center">
    {topThings.map((item, index) => (
      <div key={index} className="flex flex-col items-center">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-64 object-cover rounded-xl border-2 border-gray-200 shadow-md justify-center"
        /><br/>
        <h3 className="text-lg font-semibold text-gray-800 mt-3 text-center">
          {item.title}
        </h3>
      </div>
    ))}
  </div>
</div><br/><br/>


{placesToStay.length > 0 && (
  <div className="mb-12">
    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
      Places to Stay in {destinationName}
    </h2>
    
    {/* Slideshow Container */}
    <div className="relative max-w-6xl mx-auto ">
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {placesToStay.map((place, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 w-full snap-center relative rounded-xl overflow-hidden shadow-lg bg-[#0776d8]"
          >
           <img
  src={place.image}
  alt={place.title}
  className="w-auto h-auto object-contain brightness-105 max-w-full max-h-full"
/>

            
            {/* <div className="absolute inset-0 bg-blue-900/40"></div> */}
            
<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pb-0">
  <div className="relative w-full h-full">
    

    <div className="absolute right-10 bottom-2 sm:bottom-4 sm:right-6 max-w-[45%]">
      <div className="space-y-1 sm:space-y-2 card5 text-left">
        <h3
      className="absolute left-4 bottom-2 sm:bottom-4 sm:left-6 text-xl sm:text-4xl md:text-3xl font-bold text-white drop-shadow-lg mb-0 card11"
      style={{ marginBottom: 160 }}
    >
      {place.title}
    </h3>
        {place.description.map((point, idx) => (
          <p
            key={idx}
            className="text-sm sm:text-base md:text-lg font-medium text-white opacity-95 leading-tight sm:leading-relaxed drop-shadow-md mb-0 card11"
            style={{ marginBottom: 0 }}
          >
            - {point}
          </p>
        ))}
      </div>
    </div>
  

              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Arrows */}
      <button 
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-10"
      >
        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    
    </div>
  </div>
)}
<br/><br/>
 <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
      Avaliable Routes & Modes
    </h2>


          {/* ✈️ BY PLANE */}
        <br/> <section className="bg-transparent p-4 sm:p-8 mb-8 transition-all plane-route">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Content Section - Comes First */}
              <div className="by-plane order-2 md:order-1">
                <div className="flex items-center gap-3 mb-6">
                  <FaPlane className="text-blue-800 text-2xl" />
                  <h2 className="text-2xl font-semibold text-gray-800">By Plane</h2>
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
                //   icon={<FaPlane className="text-blue-600" />}
                />
          </section>
          <br/><br/><br/><br/>

          {/* ⛴️ BY FERRY */}
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
                  <h2 className="text-2xl font-semibold text-gray-800">By Ferry</h2>
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
            </div> <ScheduleDropdown
                  type="ferry"
                  title="⛴️ Ferry Schedules & Timetables"
                  data={by_ferry}
                //   icon={<FaShip className="text-blue-600" />}
                />
          </section>
          <br/><br/><br/><br/>

          {/* 🚁 BY PRIVATE CHARTER */}
          <section className="bg-transparent p-4 sm:p-8 mb-8 transition-all">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Content Section - Comes First */}
              <div className="order-2 md:order-1">
                <div className="flex items-center gap-3 mb-6">
                  <FaPlane className="text-blue-800 text-2xl" />
                  <h2 className="text-2xl font-semibold text-gray-800">By Private Charter</h2>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {by_private_charter.description}
                </p>
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
<br/><br/><br/><br/>
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
          <section className="mb-16 px-4 justify-items-center">
            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-900">
              Frequently Asked Questions
            </h2><br/><br/>

           <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto justify-items-center">
  {faqs.map(({ q, a }, i) => (
    <div
      key={i}
      className={`faq-card ${
        openIndex === i ? 'open' : ''
      } w-full sm:w-3/4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200`}
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
      <div className="p-4 sm:p-6">
        <h2>
          <button className="faq-question w-full text-left flex justify-between items-center" aria-hidden="true" tabIndex={-1}>
            <span className="text-lg font-medium text-gray-900 pr-4">{q}</span>
            <span className="text-transparent transform transition-transform duration-200">
              {openIndex === i ? '−' : '+'}
            </span>
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
            <RadiusSelector location={sourceName} />
          </section>
        </div>
      </main>

      {/* 🗺️ DISCOVER CITIES & POPULAR ROUTES */}
    <footer className="page-footer">
        <div className="footer-section card3">
          <h4>How far is {sourceName} from neighboring countries?</h4>
          {neighboringCountriesList}
        </div>
        <div className="footer-section card3">
          <h4>Popular Routes to {sourceName}</h4>
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .option-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
    }

    .option-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }

    .icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon {
      width: 18px;
      height: 18px;
      color: white;
    }

    .best .icon-wrapper { background: linear-gradient(135deg, #10b981, #3b82f6); }
    .fastest .icon-wrapper { background: linear-gradient(135deg, #ef4444, #f97316); }
    .cheapest .icon-wrapper { background: linear-gradient(135deg, #22c55e, #14b8a6); }
    .reliable .icon-wrapper { background: linear-gradient(135deg, #3b82f6, #6366f1); }

    .card-title {
      flex: 1;
    }

    .card-title h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 4px 0;
    }

    .badge {
      background: #d1fae5;
      color: #065f46;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      margin-right:5px
    }

    .card-description {
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tag {
      background: #dbeafe;
      color: #1e40af;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .time-display {
      text-align: center;
    }

    .time {
      display: block;
      font-size: 1.3rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .time-label {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .ferry-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .ferry-list span {
      font-size: 0.8rem;
      color: #374151;
      padding-left: 8px;
      border-left: 2px solid #22c55e;
    }

    .reliability-info p {
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .reliability-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #2563eb;
    }

    .check-icon {
      width: 14px;
      height: 14px;
    }

    @media (max-width: 768px) {
      .compact-journey {
        padding: 16px;
      }
      
      .options-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .option-card {
        padding: 16px;
      }
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

.option-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
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
  border-left: 3px solid #10B981;
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
  border-left: 3px solid #10B981;
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
  .card11{
  
  padding-right:150px;
  }
      `}</style>
    </div>
  );
}