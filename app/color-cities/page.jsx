'use client';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getColorCities } from '@/actions';

// Dynamically import Leaflet to avoid SSR issues
const MapWithNoSSR = dynamic(() => import('../../components/MapComponent'), { ssr: false });

export default function ColorLocationsExplorer() {
  const [colorLocations, setColorLocations] = useState([]);
  const [displayedLocations, setDisplayedLocations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(50);
  const LOCATIONS_PER_LOAD = 50;
  const [selectedUSState, setSelectedUSState] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const stateHeadingRef = useRef(null);
  const [announcement, setAnnouncement] = useState('');
  // Map lazy loading controls
  const [mapVisible, setMapVisible] = useState(false);
  const [mapRequestedByUser, setMapRequestedByUser] = useState(false);
  const mapContainerRef = useRef(null);
  const requestMapRender = () => {
    setMapRequestedByUser(true);
    setMapVisible(true);
  };

  // Announce state changes to screen readers
  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => setAnnouncement(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  useEffect(() => {
    if (selectedUSState && stateHeadingRef.current) {
      stateHeadingRef.current.focus();
      setAnnouncement(`Showing locations for ${selectedUSState}`);
    }
  }, [selectedUSState]);

  // Load color-based location data with server actions
  useEffect(() => {
    let isMounted = true;

    const loadLocationData = async () => {
      try {
        setIsDataLoading(true);
        setAnnouncement('Loading color cities data');

        console.log("📡 Calling server action: getColorCities");
        
        const locationData = await getColorCities();

        if (isMounted) {
          console.log("📍 Setting color cities data with", locationData.length, "items");
          setColorLocations(locationData);
          setDisplayedLocations(locationData.slice(0, LOCATIONS_PER_LOAD));
          setAnnouncement(`Loaded ${locationData.length} locations with color names`);
        }
      } catch (error) {
        console.error("🔥 Error loading color cities data:", error.message);
        console.error("📜 Full error object:", error);
        if (isMounted) {
          setAnnouncement('Error loading color cities data');
          // Fallback data if server action fails
          setColorLocations([
            {
              name: "Orange",
              state: "California",
              lat: 33.78779,
              lon: -117.85311,
              county: null,
              slug: "orange-ca",
              population: 140992,
              country: "US",
              gnis_id: 5379513
            }
          ]);
        }
      } finally {
        if (isMounted) {
          console.log("⏹️ Color cities data loading finished");
          setIsDataLoading(false);
        }
      }
    };

    loadLocationData();

    return () => {
      console.log("🧹 Cleaning up: component unmounted");
      isMounted = false;
    };
  }, []);

  // Setup IntersectionObserver for map after data loads
  useEffect(() => {
    if (isDataLoading || !mapContainerRef.current || mapRequestedByUser || mapVisible) return;

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
  }, [isDataLoading, mapRequestedByUser, mapVisible]);

  // Extend visible list when count changes
  useEffect(() => {
    if (colorLocations.length > 0) {
      setDisplayedLocations(colorLocations.slice(0, visibleCount));
    }
  }, [visibleCount, colorLocations]);

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + LOCATIONS_PER_LOAD, colorLocations.length));
    setAnnouncement(`Loaded ${Math.min(visibleCount + LOCATIONS_PER_LOAD, colorLocations.length)} of ${colorLocations.length} locations`);
  };

  // Memoized data processing
  const { commonNamesData, statesMostData, uniqueStatesData, locationsByStateData, stateLocationsData } = useMemo(() => {
    const nameCounts = {};
    const stateCounts = {};
    
    colorLocations.forEach(loc => {
      nameCounts[loc.name] = (nameCounts[loc.name] || 0) + 1;
      stateCounts[loc.state] = (stateCounts[loc.state] || 0) + 1;
    });

    const commonNamesData = Object.entries(nameCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const statesMostData = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const uniqueStatesData = [...new Set(colorLocations.map(l => l.state))].sort();
    
    const locationsByStateData = colorLocations.reduce((acc, loc) => {
      if (!acc[loc.state]) acc[loc.state] = [];
      acc[loc.state].push(loc);
      return acc;
    }, {});

    const stateLocationsData = selectedUSState ? colorLocations.filter(l => l.state === selectedUSState) : [];

    return {
      commonNamesData,
      statesMostData,
      uniqueStatesData,
      locationsByStateData,
      stateLocationsData
    };
  }, [colorLocations, selectedUSState]);

  // Group currently displayed subset for the "All Locations" section
  const displayedLocationsByState = useMemo(() => {
    return displayedLocations.reduce((acc, loc) => {
      if (!acc[loc.state]) acc[loc.state] = [];
      acc[loc.state].push(loc);
      return acc;
    }, {});
  }, [displayedLocations]);

  // Focus map on specific location
  const focusOnMapLocation = useCallback((lat, lon, name) => {
    const mainName = name.split(',')[0].trim();
    const cleanName = mainName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    window.open(`/location-from-me/how-far-is-${cleanName}-from-me`, '_blank', 'noopener,noreferrer');
    setAnnouncement(`Opening ${name} on map in a new window`);
  }, []);

  return (
    <>
      <Head>
        <title>Cities with "Color" in the Name (USA) | LocateMyCity</title>
        <meta name="description" content="Discover and explore U.S. cities with color names like Orange, Green Bay, White Plains, and more. Interactive map, statistics, and detailed information about these unique locations." />
        <meta name="keywords" content="cities with colors, color cities USA, US cities, orange city, green bay, white plains, geography, travel destinations" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="LocateMyCity" />
        
        <link rel="canonical" href="https://locatemycity.com/color-cities" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://locatemycity.com/color-cities" />
        <meta property="og:title" content="Cities with 'Color' in the Name (USA) | LocateMyCity" />
        <meta property="og:description" content="Discover and explore U.S. cities with color names. Interactive map and detailed information." />
        <meta property="og:image" content="https://locatemycity.com/images/color-cities-og.jpg" />
        <meta property="og:image:alt" content="Map of US cities with color names" />
        <meta property="og:site_name" content="LocateMyCity" />
        
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://locatemycity.com/color-cities" />
        <meta property="twitter:title" content="Cities with 'Color' in the Name (USA) | LocateMyCity" />
        <meta property="twitter:description" content="Discover and explore U.S. cities with color names. Interactive map and detailed information." />
        <meta property="twitter:image" content="https://locatemycity.com/images/color-cities-twitter.jpg" />
        <meta property="twitter:image:alt" content="Map of US cities with color names" />
        
        <meta name="theme-color" content="#317EFB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" media="print" onLoad="this.media='all'" />
        <noscript>
          {`<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet" />`}
        </noscript>
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "US Cities with Color Names",
              "description": "A comprehensive list of United States cities and towns that include color names like Orange, Green Bay, White Plains, and more.",
              "url": "https://locatemycity.com/color-cities",
              "numberOfItems": colorLocations.length,
              "itemListElement": colorLocations.slice(0, 20).map((location, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "City",
                  "name": location.name,
                  "containedInPlace": {
                    "@type": "State",
                    "name": location.state
                  }
                }
              }))
            })
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://locatemycity.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Color Cities",
                  "item": "https://locatemycity.com/color-cities"
                }
              ]
            })
          }}
        />
      </Head>

      {/* Accessibility announcements for screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {announcement}
      </div>

      <header className="site-header">
        <div className="header-wrapper">
          <div className="decorative-circle" style={{ width: '80px', height: '80px', top: '20%', left: '10%' }}></div>
          <div className="decorative-circle" style={{ width: '120px', height: '120px', bottom: '-30%', right: '15%' }}></div>
          <div className="decorative-circle" style={{ width: '60px', height: '60px', top: '50%', left: '80%' }}></div>

          <div className="header-content-wrapper">
            <div className="site-logo">
              <Image 
                src="/Images/cityfav.png" 
                alt="LocateMyCity Logo" 
                width={50} 
                height={50} 
                className="logo-img"
                priority
              />
              LocateMyCity
            </div>
            <nav className="main-navigation">
              <a href="/" title="Home">HOME</a>
              <Link href="/about">ABOUT US</Link>
              <Link href="/contact">CONTACT US</Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="hero-banner">
        <div className="content-container">
          <h1 className="main-heading">Cities with "Colors" in the Name</h1>
          <p className="hero-subtitle">Discover unique U.S. locations with "Colors" in their name</p>
        </div>
      </section>

      <main className="main-content">
        <section className="location-statistics">
          <div className="content-container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <h3 className="stat-title">Most Common Names</h3>
                  <ul className="stat-list">
                    {isDataLoading ? (
                      <div className="loading-indicator"><div className="loading-spinner"></div></div>
                    ) : (
                      commonNamesData.map(([name, count]) => (
                        <li key={name} className="stat-item">
                          <span>{name}</span> <strong>{count} locations</strong>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <h3 className="stat-title">States with Most</h3>
                  <ul className="stat-list">
                    {isDataLoading ? (
                      <div className="loading-indicator"><div className="loading-spinner"></div></div>
                    ) : (
                      statesMostData.map(([state, count]) => (
                        <li key={state} className="stat-item">
                          <span>{state}</span> <strong>{count} cities</strong>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <h3 className="stat-title">Notable Color Cities</h3>
                  <ul className="stat-list">
                    <li><span>Redlands, CA</span> <strong>Historic citrus hub</strong></li>
                    <li><span>White Plains, NY</span> <strong>Suburban metro</strong></li>
                    <li><span>Green Bay, WI</span> <strong>Football capital</strong></li>
                    <li><span>Blue Springs, MO</span> <strong>Quiet charm</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="interactive-map-section">
          <div className="content-container">
            <h2 className="section-heading">Interactive Map</h2>
            {isDataLoading ? (
              <div className="loading-indicator"><div className="loading-spinner"></div></div>
            ) : (
              <div>
                {!mapVisible && (
                  <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <button onClick={requestMapRender} className="view-map-btn">
                      Load Interactive Map
                    </button>
                  </div>
                )}
                <div ref={mapContainerRef}>
                  {mapVisible ? (
                    <MapWithNoSSR locations={colorLocations} />
                  ) : (
                    <div className="loading-indicator" role="status" aria-live="polite">
                      <div className="loading-spinner"></div>
                      <span>Map will load when visible or on click...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="state-browser-section">
          <div className="content-container">
            <h2 className="section-heading">Browse by State</h2>
            <div className="state-buttons-container">
              {isDataLoading ? (
                <div className="loading-indicator"><div className="loading-spinner"></div></div>
              ) : (
                uniqueStatesData.map(state => (
                  <button 
                    key={state}
                    className="state-button"
                    onClick={() => setSelectedUSState(state)}
                    aria-label={`Show locations in ${state}`}
                    aria-pressed={selectedUSState === state}
                  >
                    <span>{state}</span>
                  </button>
                ))
              )}
            </div>
            {selectedUSState && (
              <div className="state-locations-container" style={{ marginTop: '2rem' }}>
                <div className="state-location-group">
                  <h3 className="state-group-heading">{selectedUSState}</h3>
                  <div className="location-list">
                    {stateLocationsData.map(location => (
                      <div key={`${location.name}-${location.lat}-${location.lon}`} className="location-item">
                        <span className="location-name">{location.name}</span>
                        <button 
                          className="map-view-button" 
                          onClick={() => focusOnMapLocation(location.lat, location.lon, location.name)}
                          aria-label={`View ${location.name} on map`}
                        >
                          View on Map
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="all-locations-section">
          <div className="content-container">
            <h2 className="section-heading">All Locations by State</h2>
            {isDataLoading ? (
              <div className="loading-indicator"><div className="loading-spinner"></div></div>
            ) : (
              <>
                <div style={{ marginBottom: '1rem', textAlign: 'center', fontWeight: 500, color: '#333' }}>
                  {`Showing ${displayedLocations.length} of ${colorLocations.length} locations`}
                </div>
                {Object.keys(displayedLocationsByState).sort().map(state => (
                  <div key={state} className="state-location-group">
                    <h3 className="state-group-heading">{state}</h3>
                    <div className="location-list">
                      {displayedLocationsByState[state].map(location => (
                        <div key={`${location.name}-${location.lat}-${location.lon}`} className="location-item">
                          <span className="location-name">{location.name}</span>
                          <button 
                            className="map-view-button"
                            onClick={() => focusOnMapLocation(location.lat, location.lon, location.name)}
                            aria-label={`View ${location.name} on map`}
                          >
                            View on Map
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {visibleCount < colorLocations.length && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                      onClick={handleLoadMore}
                      className="view-map-btn load-more-btn"
                    >
                      {`Load More Locations — Showing ${displayedLocations.length} of ${colorLocations.length} locations`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}