'use client';
import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Footer from '../../components/Footer'
import Header from '../../components/Header';
import { getSpringCities } from '@/actions';

// Dynamically import Leaflet with loading state and higher priority
const MapWithNoSSR = dynamic(() => import('../../components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="loading-container"><div className="spinner"></div></div>
});

// Lazy load heavy components
const LocationList = dynamic(() => import('../../components/LocationList'), {
  loading: () => <div className="loading-container"><div className="spinner"></div></div>
});

export default function SpringLocationsExplorer() {
  const [allSprings, setAllSprings] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isStatsLoaded, setIsStatsLoaded] = useState(false);
  const stateHeadingRef = useRef(null);
  const [announcement, setAnnouncement] = useState('');
  const [displayedLocations, setDisplayedLocations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(50);
  const LOCATIONS_PER_LOAD = 50;
  // Map lazy loading similar to rock page
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
    if (selectedState && stateHeadingRef.current) {
      stateHeadingRef.current.focus();
      setAnnouncement(`Showing locations for ${selectedState}`);
    }
  }, [selectedState]);

  // Optimized memoized data processing with separate concerns
  const commonNamesData = useMemo(() => {
    if (!allSprings.length) return [];
    const nameCounts = {};
    allSprings.forEach(loc => {
      nameCounts[loc.name] = (nameCounts[loc.name] || 0) + 1;
    });
    return Object.entries(nameCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [allSprings]);

  const statesMostData = useMemo(() => {
    if (!allSprings.length) return [];
    const stateCounts = {};
    allSprings.forEach(loc => {
      stateCounts[loc.state] = (stateCounts[loc.state] || 0) + 1;
    });
    return Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [allSprings]);

  const uniqueStatesData = useMemo(() => {
    if (!allSprings.length) return [];
    return [...new Set(allSprings.map(l => l.state))].sort();
  }, [allSprings]);

  const locationsByStateData = useMemo(() => {
    if (!allSprings.length) return {};
    return allSprings.reduce((acc, loc) => {
      if (!acc[loc.state]) acc[loc.state] = [];
      acc[loc.state].push(loc);
      return acc;
    }, {});
  }, [allSprings]);

  const stateLocationsData = useMemo(() => {
    if (!selectedState || !allSprings.length) return [];
    return allSprings.filter(l => l.state === selectedState);
  }, [allSprings, selectedState]);

  // Load more locations for better performance
  const loadMoreLocations = useMemo(() => {
    return allSprings.slice(0, visibleCount);
  }, [allSprings, visibleCount]);

  // Map locations (clustered for better performance)
  const mapLocations = useMemo(() => {
    // Return a subset for initial map load, then load more progressively
    return allSprings.slice(0, isMapLoaded ? allSprings.length : 100);
  }, [allSprings, isMapLoaded]);

  // Stable callback for location focus
  const focusOnLocation = useCallback((lat, lon, name) => {
    const mainName = name.split(',')[0].trim();
    const cleanName = mainName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    window.open(`/location-from-me/how-far-is-${cleanName}-from-me`, '_blank', 'noopener,noreferrer');
    setAnnouncement(`Opening ${name} on map in a new window`);
  }, []);

  // Load more locations function
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + LOCATIONS_PER_LOAD, allSprings.length));
    setAnnouncement(`Loaded ${Math.min(visibleCount + LOCATIONS_PER_LOAD, allSprings.length)} of ${allSprings.length} locations`);
  }, [visibleCount, allSprings.length]);

  // Progressive data loading for better performance
  useEffect(() => {
    let isMounted = true;

    const loadDataProgressively = async () => {
      try {
        setIsLoading(true);
        setAnnouncement('Loading spring cities data');

        // Load data in chunks to reduce blocking time
        const locationData = await getSpringCities();

        if (isMounted) {
          // Set initial data
          setAllSprings(locationData);
          setIsStatsLoaded(true);
          setAnnouncement(`Loaded ${locationData.length} locations with "Spring" in their name`);

          // Load map progressively after stats are ready
          setTimeout(() => {
            if (isMounted) {
              setIsMapLoaded(true);
            }
          }, 100);

          // Load additional features after map
          setTimeout(() => {
            if (isMounted) {
              setDisplayedLocations(locationData.slice(0, LOCATIONS_PER_LOAD));
            }
          }, 200);
        }
      } catch (error) {
        console.error("🔥 Error loading spring cities data:", error.message);
        console.error("📜 Full error object:", error);
        if (isMounted) {
          setAnnouncement('Error loading spring cities data');
          setAllSprings([
            {
              name: "Blue Springs",
              state: "Alabama",
              lat: 31.66128,
              lon: -85.50744,
              county: null,
              slug: "blue-springs-alabama",
              population: 79,
              country: "US",
              gnis_id: 4050985
            }
          ]);
          setIsStatsLoaded(true);
          setIsMapLoaded(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDataProgressively();

    return () => {
      isMounted = false;
    };
  }, []);

  // Setup IntersectionObserver for map after data loads
  useEffect(() => {
    if (isLoading || !mapContainerRef.current || mapRequestedByUser || mapVisible) return;

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
  }, [isLoading, mapRequestedByUser, mapVisible]);

  // Load more locations when visible count changes
  useEffect(() => {
    if (allSprings.length > 0) {
      setDisplayedLocations(allSprings.slice(0, visibleCount));
    }
  }, [visibleCount, allSprings]);

  // Load more map locations progressively
  useEffect(() => {
    if (isMapLoaded && allSprings.length > 100) {
      const timer = setTimeout(() => {
        setIsMapLoaded(true); // This will trigger the full dataset in mapLocations
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMapLoaded, allSprings.length]);

  // Notable locations memoized
  const notableLocations = useMemo(() => [
    { name: "Hot Springs, AR", description: "Historic Spa Town" },
    { name: "Sulphur Springs, TX", description: "Famous for minerals" },
    { name: "Palm Springs, CA", description: "Desert resort" },
    { name: "Coral Springs, FL", description: "Master-planned city" }
  ], []);

  return (
    <>
      <Head>
        <title>Cities with "Spring" in the Name (USA) | LocateMyCity</title>
        <meta name="description" content="Discover and explore U.S. cities with 'Spring' in their names. Interactive map, statistics, and detailed information about these unique locations." />
        <meta name="keywords" content="cities with spring, spring cities USA, US cities, spring locations, geography, travel destinations" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="LocateMyCity" />
        
        <link rel="canonical" href="https://locatemycity.com/cities-with-spring" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://locatemycity.com/cities-with-spring" />
        <meta property="og:title" content="Cities with 'Spring' in the Name (USA) | LocateMyCity" />
        <meta property="og:description" content="Discover and explore U.S. cities with 'Spring' in their names. Interactive map and detailed information." />
        <meta property="og:image" content="https://locatemycity.com/images/spring-cities-og.jpg" />
        <meta property="og:image:alt" content="Map of US cities with Spring in their names" />
        <meta property="og:site_name" content="LocateMyCity" />
        
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://locatemycity.com/cities-with-spring" />
        <meta property="twitter:title" content="Cities with 'Spring' in the Name (USA) | LocateMyCity" />
        <meta property="twitter:description" content="Discover and explore U.S. cities with 'Spring' in their names. Interactive map and detailed information." />
        <meta property="twitter:image" content="https://locatemycity.com/images/spring-cities-twitter.jpg" />
        <meta property="twitter:image:alt" content="Map of US cities with Spring in their names" />
        
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
        <link rel="stylesheet" href="/styles/performance.css" />
        
       
      </Head>

      {/* Accessibility announcements for screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {announcement}
      </div>

      <Header />

      <main>
        <section className="page-hero">
          <div className="container">
            <h1>Cities with "Spring" in the Name</h1>
            <p className="subtitle">Discover unique U.S. locations with "Spring" in their name</p>
          </div>
        </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-card-content">
                <h1 className="stat-card-title">Most Common Names</h1>
                <ul className="stat-card-list">
                  {isLoading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                  ) : (
                    commonNamesData.map(([name, count]) => (
                      <li key={name} className="stat-card-item">
                        <span>{name}</span> <strong>{count} locations</strong>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-content">
                <h2 className="stat-card-title">States with Most</h2>
                <ul className="stat-card-list">
                  {isLoading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                  ) : (
                    statesMostData.map(([state, count]) => (
                      <li key={state} className="stat-card-item">
                        <span>{state}</span> <strong>{count} cities</strong>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-content">
                <h3 className="stat-card-title">Notable Locations</h3>
                <ul className="stat-card-list">
                  {isLoading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                  ) : (
                    notableLocations.map(location => (
                      <li key={location.name} className="stat-card-item">
                        <span>{location.name}</span> <strong>{location.description}</strong>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="map-section">
        <div className="container">
          <h2 className="section-title">Interactive Map</h2>
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading map...</p>
            </div>
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
                  <Suspense fallback={<div className="loading-container"><div className="spinner"></div></div>}>
                    <MapWithNoSSR locations={mapLocations} />
                  </Suspense>
                ) : (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Map will load when visible or on click...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="states-section">
        <div className="container">
          <h2 className="section-title">Browse by State</h2>
          <div className="states-container">
            {isLoading ? (
              <div className="loading-container"><div className="spinner"></div></div>
            ) : (
              uniqueStatesData.map(state => (
                <button 
                  key={state} 
                  className="state-btn" 
                  onClick={() => setSelectedState(state)}
                >
                  <span>{state}</span>
                </button>
              ))
            )}
          </div>
          {selectedState && (
            <div id="state-countries-container" style={{ marginTop: '2rem' }}>
              <div className="state-group">
                <h3 className="state-group-title">{selectedState}</h3>
                <div className="countries-list">
                  {stateLocationsData.map(loc => (
                    <div key={`${loc.name}-${loc.lat}-${loc.lon}`} className="country-item ">
                      <span className="country-name">{loc.name}</span>
                      <button 
                        className="view-map-btn " 
                        onClick={() => focusOnLocation(loc.lat, loc.lon, loc.name)}
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

      <section className="countries-section">
        <div className="container">
          <h2 className="section-title">All Locations by State</h2>
          {!isStatsLoaded ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : (
            <>
              {/* Location List with Load More Button at End */}
              <div>
                <Suspense fallback={<div className="loading-container"><div className="spinner"></div></div>}>
                  <LocationList 
                    locations={displayedLocations} 
                    onLocationClick={focusOnLocation}
                    totalCount={allSprings.length}
                  />
                </Suspense>
                
                {/* Load More Button at the End */}
                {visibleCount < allSprings.length && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button 
                      onClick={handleLoadMore}
                      className="view-map-btn load-more-btn"
                    >
                      {`Load More Locations — Showing ${displayedLocations.length} of ${allSprings.length} locations`}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
      </main>
      
      <Footer />
    </>
  );
}