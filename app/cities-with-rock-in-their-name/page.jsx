'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getRockCities } from '@/actions';

const MapWithNoSSR = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="loading-indicator" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true"></div>
      <span>Loading map...</span>
    </div>
  )
});

// Lazy load virtualized list component similar to Spring page
const LocationList = dynamic(() => import('../../components/LocationList'), {
  loading: () => (
    <div className="loading-indicator" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true"></div>
      <span>Loading list...</span>
    </div>
  )
});

export default function RockyLocationsExplorer() {
  const [allRockyLocations, setAllRockyLocations] = useState([]);
  const [displayedLocations, setDisplayedLocations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(50);
  const LOCATIONS_PER_LOAD = 50;
  const [selectedUSState, setSelectedUSState] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const stateHeadingRef = useRef(null);
  const [announcement, setAnnouncement] = useState('');

  // Map lazy loading
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

  useEffect(() => {
    let isMounted = true;

    const loadLocationData = async () => {
      try {
        setIsDataLoading(true);
        setAnnouncement('Loading location data');

        const locationData = await getRockCities();

        if (isMounted) {
          setAllRockyLocations(locationData);
          setDisplayedLocations(locationData.slice(0, LOCATIONS_PER_LOAD));
          setAnnouncement(`Loaded ${locationData.length} locations with "Rock" in their name`);
        }
      } catch (error) {
        if (isMounted) {
          setAnnouncement('Error loading location data');
        }
      } finally {
        if (isMounted) {
          setIsDataLoading(false);
        }
      }
    };

    loadLocationData();

    return () => {
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
        // wait briefly and also prefer idle time
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

  // When visible count changes, extend the displayed list
  useEffect(() => {
    if (allRockyLocations.length > 0) {
      setDisplayedLocations(allRockyLocations.slice(0, visibleCount));
    }
  }, [visibleCount, allRockyLocations]);

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + LOCATIONS_PER_LOAD, allRockyLocations.length));
    setAnnouncement(`Loaded ${Math.min(visibleCount + LOCATIONS_PER_LOAD, allRockyLocations.length)} of ${allRockyLocations.length} locations`);
  };

  const commonLocationNames = useMemo(() => {
    const nameFrequency = {};
    allRockyLocations.forEach(location => {
      nameFrequency[location.name] = (nameFrequency[location.name] || 0) + 1;
    });
    return Object.entries(nameFrequency).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [allRockyLocations]);

  const statesWithMostLocations = useMemo(() => {
    const stateFrequency = {};
    allRockyLocations.forEach(location => {
      stateFrequency[location.state] = (stateFrequency[location.state] || 0) + 1;
    });
    return Object.entries(stateFrequency).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [allRockyLocations]);

  const uniqueUSStates = useMemo(() => [...new Set(allRockyLocations.map(l => l.state))].sort(), [allRockyLocations]);

  const locationsForSelectedState = useMemo(() =>
    selectedUSState ? allRockyLocations.filter(l => l.state === selectedUSState) : [],
    [allRockyLocations, selectedUSState]
  );

  const locationsGroupedByState = useMemo(() => {
    // group from currently displayed subset to mimic Spring behavior
    return displayedLocations.reduce((acc, location) => {
      if (!acc[location.state]) acc[location.state] = [];
      acc[location.state].push(location);
      return acc;
    }, {});
  }, [displayedLocations]);

  const focusOnMapLocation = (lat, lon, name) => {
    const mainName = name.split(',')[0].trim();
    const cleanName = mainName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    window.open(`/location-from-me/how-far-is-${cleanName}-from-me`, '_blank', 'noopener,noreferrer');
    setAnnouncement(`Opening ${name} on map in a new window`);
  };

  const handleStateSelect = (state) => {
    setSelectedUSState(state);
  };

  return (
    <>
      <Head>
        <title>Cities with "Rock" in the Name (USA) | LocateMyCity</title>
        <meta name="description" content="Discover and explore U.S. cities with 'Rock' in their names. Interactive map, statistics, and detailed information about these unique locations." />
        <meta name="keywords" content="cities with rock, rock cities USA, US cities, rock locations, geography, travel destinations" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="LocateMyCity" />
        
        <link rel="canonical" href="https://locatemycity.com/cities-with-rock" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://locatemycity.com/cities-with-rock" />
        <meta property="og:title" content="Cities with 'Rock' in the Name (USA) | LocateMyCity" />
        <meta property="og:description" content="Discover and explore U.S. cities with 'Rock' in their names. Interactive map and detailed information." />
        <meta property="og:image" content="https://locatemycity.com/images/rock-cities-og.jpg" />
        <meta property="og:image:alt" content="Map of US cities with Rock in their names" />
        <meta property="og:site_name" content="LocateMyCity" />
        
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://locatemycity.com/cities-with-rock" />
        <meta property="twitter:title" content="Cities with 'Rock' in the Name (USA) | LocateMyCity" />
        <meta property="twitter:description" content="Discover and explore U.S. cities with 'Rock' in their names. Interactive map and detailed information." />
        <meta property="twitter:image" content="https://locatemycity.com/images/rock-cities-twitter.jpg" />
        <meta property="twitter:image:alt" content="Map of US cities with Rock in their names" />
        
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
        {/* Removed duplicate/blocking Leaflet CSS links; MapComponent imports CSS */}
        
      </Head>

      {/* Accessibility announcements for screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {announcement}
      </div>

      <Header role="banner" />

      <main id="main-content" role="main">
        <section className="hero-banner" aria-labelledby="main-heading">
          <div className="content-container">
            <h1 id="main-heading" className="main-heading">Cities with "Rock" in the Name</h1>
            <p className="hero-subtitle">Discover unique U.S. cities celebrating America's geological heritage</p>
          </div>
        </section>

        <section className="location-statistics" aria-labelledby="statistics-heading">
          <div className="content-container">
            <h2 id="statistics-heading" className="section-title">Location Statistics</h2>
            <div className="stats-grid">
              {/* Common Names */}
              <div className="stat-card" role="region" aria-labelledby="common-names-heading">
                <div className="stat-content">
                  <h3 id="common-names-heading" className="stat-title">Most Common Names</h3>
                  <ul className="stat-list">
                    {isDataLoading ? (
                      <div className="loading-indicator" role="status" aria-live="polite">
                        <div className="loading-spinner" aria-hidden="true"></div>
                        <span>Loading data...</span>
                      </div>
                    ) : (
                      commonLocationNames.map(([name, count]) => (
                        <li key={name} className="stat-item">
                          <span>{name}</span> <strong>{count} locations</strong>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* States with Most */}
              <div className="stat-card" role="region" aria-labelledby="states-most-heading">
                <div className="stat-content">
                  <h3 id="states-most-heading" className="stat-title">States with Most</h3>
                  <ul className="stat-list">
                    {isDataLoading ? (
                      <div className="loading-indicator" role="status" aria-live="polite">
                        <div className="loading-spinner" aria-hidden="true"></div>
                        <span>Loading data...</span>
                      </div>
                    ) : (
                      statesWithMostLocations.map(([state, count]) => (
                        <li key={state} className="stat-item">
                          <span>{state}</span> <strong>{count} cities</strong>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* Notable Locations */}
              <div className="stat-card" role="region" aria-labelledby="notable-locations-heading">
                <div className="stat-content">
                  <h3 id="notable-locations-heading" className="stat-title">Notable Locations</h3>
                  <ul className="stat-list">
                    {isDataLoading ? (
                      <div className="loading-indicator" role="status" aria-live="polite">
                        <div className="loading-spinner" aria-hidden="true"></div>
                        <span>Loading data...</span>
                      </div>
                    ) : (
                      [
                        { name: "Little Rock, AR", description: "State Capital" },
                        { name: "Rockville, MD", description: "DC Suburb" },
                        { name: "Rock Springs, WY", description: "Historic" },
                        { name: "Rock Hill, SC", description: "Major City" }
                      ].map(location => (
                        <li key={location.name} className="stat-item">
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

        <section className="interactive-map-section" aria-labelledby="map-heading">
          <div className="content-container">
            <h2 id="map-heading" className="section-title">Interactive Map</h2>
            {isDataLoading ? (
              <div className="loading-indicator" role="status" aria-live="polite">
                <div className="loading-spinner" aria-hidden="true"></div>
                <span>Loading map...</span>
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
                    <MapWithNoSSR locations={allRockyLocations} />
                  ) : (
                    <div className="loading-indicator" role="status" aria-live="polite">
                      <div className="loading-spinner" aria-hidden="true"></div>
                      <span>Map will load when visible or on click...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="state-browser-section" aria-labelledby="state-browser-heading">
          <div className="content-container">
            <h2 id="state-browser-heading" className="section-title">Browse by State</h2>
            <div className="state-buttons-container" role="group" aria-label="US States">
              {isDataLoading ? (
                <div className="loading-indicator" role="status" aria-live="polite">
                  <div className="loading-spinner" aria-hidden="true"></div>
                    <span>Loading states...</span>
                </div>
              ) : (
                uniqueUSStates.map(state => (
                  <button 
                    key={state}
                    className="state-button" 
                    onClick={() => handleStateSelect(state)}
                    aria-label={`Show locations in ${state}`}
                    aria-pressed={selectedUSState === state}
                  >
                    <span>{state}</span>
                  </button>
                ))
              )}
            </div>

            {selectedUSState && (
              <div
                className="state-locations-container"
                style={{ marginTop: '2rem' }}
                role="region"
                aria-labelledby={`${selectedUSState}-locations-heading`}
              >
                <div className="state-location-group">
                  <h3
                    id={`${selectedUSState}-locations-heading`}
                    className="state-group-heading"
                    tabIndex="-1"
                    ref={stateHeadingRef}
                  >
                    {selectedUSState}
                  </h3>
                  <div className="location-list">
                    {locationsForSelectedState.map(location => (
                      <div key={`${location.name}-${location.county}-${location.lat}-${location.lon}`} className="location-item">
                        <span className="location-name">{location.name}</span>
                        <button
                          className="map-view-button "
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

        <section className="all-locations-section" aria-labelledby="all-locations-heading">
          <div className="content-container">
            <h2 id="all-locations-heading" className="section-title">All Locations by State</h2>
            {isDataLoading ? (
              <div className="loading-indicator" role="status" aria-live="polite">
                <div className="loading-spinner" aria-hidden="true"></div>
                  <span>Loading all locations...</span>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '1rem', textAlign: 'center', fontWeight: 500, color: '#333' }}>
                  {`Showing ${displayedLocations.length} of ${allRockyLocations.length} locations`}
                </div>
                {Object.keys(locationsGroupedByState).sort().map(state => (
                  <div
                    key={state}
                    className="state-location-group"
                    role="region"
                    aria-labelledby={`${state}-all-locations-heading`}
                  >
                    <h3
                      id={`${state}-all-locations-heading`}
                      className="state-group-heading"
                    >
                      {state}
                    </h3>
                    <div className="location-list">
                      {locationsGroupedByState[state].map(location => (
                        <div key={`${location.name}-${location.county}-${location.lat}-${location.lon}`} className="location-item">
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

                {visibleCount < allRockyLocations.length && (
                  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                      onClick={handleLoadMore}
                      className="view-map-btn load-more-btn"
                    >
                      {`Load More Locations — Showing ${displayedLocations.length} of ${allRockyLocations.length} locations`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer role="contentinfo" />
    </>
  );
}