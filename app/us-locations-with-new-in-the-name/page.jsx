'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getNewCities, getCityThemeMetadata } from '@/actions';
import CityThemeLinks from '../../components/CityThemeLinks';

// Map without SSR
const MapWithNoSSR = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="loading-indicator" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true"></div>
      <span>Loading map...</span>
    </div>
  )
});

// Virtualized location list
const LocationList = dynamic(() => import('../../components/LocationList'), {
  loading: () => (
    <div className="loading-indicator" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true"></div>
      <span>Loading list...</span>
    </div>
  )
});

export default function NewLocationsExplorer() {
  const [allNewLocations, setAllNewLocations] = useState([]);
  const [displayedLocations, setDisplayedLocations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(50);
  const [metadata, setMetadata] = useState(null);
  const LOCATIONS_PER_LOAD = 50;

  const [selectedUSState, setSelectedUSState] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const stateHeadingRef = useRef(null);
  const [announcement, setAnnouncement] = useState('');

  const [mapVisible, setMapVisible] = useState(false);
  const [mapRequestedByUser, setMapRequestedByUser] = useState(false);
  const mapContainerRef = useRef(null);

  const requestMapRender = () => {
    setMapRequestedByUser(true);
    setMapVisible(true);
  };

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

  // Fetch dataset and metadata
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsDataLoading(true);
        setAnnouncement('Loading location data');

        const [data, meta] = await Promise.all([
          getNewCities(),
          getCityThemeMetadata('new')
        ]);

        if (isMounted) {
          setAllNewLocations(data);
          setDisplayedLocations(data.slice(0, LOCATIONS_PER_LOAD));
          setMetadata(meta);
          setAnnouncement(`Loaded ${data.length} locations with "New" in their name`);
        }
      } catch (error) {
        if (isMounted) setAnnouncement('Error loading location data');
      } finally {
        if (isMounted) setIsDataLoading(false);
      }
    };

    loadData();
    return () => (isMounted = false);
  }, []);

  // Lazy load map
  useEffect(() => {
    if (isDataLoading || mapRequestedByUser || mapVisible || !mapContainerRef.current) return;

    let visibilityTimer = null;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 500));
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

  // Load More
  useEffect(() => {
    if (allNewLocations.length > 0) {
      setDisplayedLocations(allNewLocations.slice(0, visibleCount));
    }
  }, [visibleCount, allNewLocations]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOCATIONS_PER_LOAD, allNewLocations.length));
  };

  // Analytics helpers
  const commonLocationNames = useMemo(() => {
    const freq = {};
    allNewLocations.forEach((loc) => {
      freq[loc.name] = (freq[loc.name] || 0) + 1;
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [allNewLocations]);

  const statesWithMostLocations = useMemo(() => {
    const freq = {};
    allNewLocations.forEach((loc) => {
      freq[loc.state] = (freq[loc.state] || 0) + 1;
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [allNewLocations]);

  const uniqueUSStates = useMemo(
    () => [...new Set(allNewLocations.map((l) => l.state))].sort(),
    [allNewLocations]
  );

  const locationsForSelectedState = useMemo(() => {
    return selectedUSState ? allNewLocations.filter((l) => l.state === selectedUSState) : [];
  }, [allNewLocations, selectedUSState]);

  const locationsGroupedByState = useMemo(() => {
    return displayedLocations.reduce((acc, loc) => {
      if (!acc[loc.state]) acc[loc.state] = [];
      acc[loc.state].push(loc);
      return acc;
    }, {});
  }, [displayedLocations]);

  const focusOnMapLocation = (lat, lon, name) => {
    const clean = name.split(',')[0].trim().replace(/\s+/g, '-').toLowerCase();
    window.open(`/how-far-is-${clean}-from-me`, '_blank');
  };

  const handleStateSelect = (state) => setSelectedUSState(state);

  if (!metadata) {
    return (
      <div className="loading-indicator">
        <div className="loading-spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{metadata.pageTitle}</title>
        <meta name="description" content={metadata.metaDescription} />
        <link rel="canonical" href={metadata.canonicalUrl} />
      </Head>

      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      <Header />

      <main id="main-content">

        {/* HERO */}
        <section className="hero-banner">
          <div className="content-container">
            <h1 className="main-heading">{metadata.hero.title}</h1>
            <p className="hero-subtitle">{metadata.hero.subtitle}</p>
          </div>
        </section>

        {/* EXPLAINER SECTION */}
        <section className="py-16 notable-cities-explainer">
          <div className="content-container max-w-3xl mx-auto text-center leading-relaxed">
            <h2 className="explainer-title mb-6">{metadata.explainer.title}</h2>
            {metadata.explainer.paragraphs.map((paragraph, index) => (
              <p key={index} className="explainer-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* City Theme Links */}
        <CityThemeLinks currentTheme="new" />

        {/* STATISTICS */}
        <section className="location-statistics">
          <div className="content-container">
            <h2 className="section-title">Location Statistics</h2>

            <div className="stats-grid">

              {/* Common Names */}
              <div className="stat-card">
                <h3 className="stat-title">Most Common Names</h3>
                <ul className="stat-list">
                  {commonLocationNames.map(([name, count]) => (
                    <li key={name}>
                      <span>{name}</span> <strong>{count} locations</strong>
                    </li>
                  ))}
                </ul>
              </div>

              {/* States with Most */}
              <div className="stat-card">
                <h3 className="stat-title">States with Most</h3>
                <ul className="stat-list">
                  {statesWithMostLocations.map(([state, count]) => (
                    <li key={state}>
                      <span>{state}</span> <strong>{count} cities</strong>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Notable */}
              <div className="stat-card">
                <h3 className="stat-title">Notable Locations</h3>
                <ul className="stat-list">
                  {metadata.notableLocations.map((location) => (
                    <li key={location.name}>
                      {location.name} — <strong>{location.description}</strong>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* MAP */}
        <section className="interactive-map-section">
          <div className="content-container">
            <h2 className="section-title">Interactive Map</h2>

            {!mapVisible && (
              <div style={{ textAlign: 'center' }}>
                <button className="view-map-btn" onClick={requestMapRender}>
                  Load Interactive Map
                </button>
              </div>
            )}

            <div ref={mapContainerRef}>
              {mapVisible ? (
                <MapWithNoSSR locations={allNewLocations} />
              ) : (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                  <span>Map will load when visible…</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BROWSE BY STATE */}
        <section className="state-browser-section">
          <div className="content-container">
            <h2 className="section-title">Browse by State</h2>

            <div className="state-buttons-container">
              {uniqueUSStates.map((state) => (
                <button
                  key={state}
                  className="state-button"
                  onClick={() => handleStateSelect(state)}
                  aria-pressed={selectedUSState === state}
                >
                  {state}
                </button>
              ))}
            </div>

            {selectedUSState && (
              <div className="state-location-group" style={{ marginTop: '2rem' }}>
                <h3 ref={stateHeadingRef} className="state-group-heading">
                  {selectedUSState}
                </h3>

                <div className="location-list">
                  {locationsForSelectedState.map((loc) => (
                    <div key={`${loc.name}-${loc.lat}`} className="location-item">
                      <span className="location-name">{loc.name}</span>
                      <button
                        className="map-view-button"
                        onClick={() => focusOnMapLocation(loc.lat, loc.lon, loc.name)}
                      >
                        View on Map
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FULL LIST */}
        <section className="all-locations-section">
          <div className="content-container">
            <h2 className="section-title">All Locations by State</h2>

            <div className="text-center mb-3 font-medium">
              Showing {displayedLocations.length} of {allNewLocations.length} locations
            </div>

            {Object.keys(locationsGroupedByState)
              .sort()
              .map((state) => (
                <div key={state} className="state-location-group">
                  <h3 className="state-group-heading">{state}</h3>

                  <div className="location-list">
                    {locationsGroupedByState[state].map((loc) => (
                      <div key={`${loc.name}-${loc.lat}`} className="location-item">
                        <span className="location-name">{loc.name}</span>
                        <button
                          className="map-view-button"
                          onClick={() => focusOnMapLocation(loc.lat, loc.lon, loc.name)}
                        >
                          View on Map
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {visibleCount < allNewLocations.length && (
              <div className="text-center mt-6">
                <button className="view-map-btn load-more-btn" onClick={handleLoadMore}>
                  Load More — Showing {displayedLocations.length} of {allNewLocations.length}
                </button>
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
