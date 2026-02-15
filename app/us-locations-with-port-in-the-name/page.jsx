'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getPortLocations, getCityThemeMetadata } from '@/actions';
import PortFAQSection from '../../components/PortFAQSection';
import PortCitiesNotable from '../../components/PortCitiesNotable';
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

export default function PortLocationsExplorer() {
  const [allPortLocations, setAllPortLocations] = useState([]);
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
          getPortLocations(),
          getCityThemeMetadata('port')
        ]);

        if (isMounted) {
          setAllPortLocations(data);
          setDisplayedLocations(data.slice(0, LOCATIONS_PER_LOAD));
          setMetadata(meta);
          setAnnouncement(`Loaded ${data.length} locations with "Port" in their name`);
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
    if (allPortLocations.length > 0) {
      setDisplayedLocations(allPortLocations.slice(0, visibleCount));
    }
  }, [visibleCount, allPortLocations]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOCATIONS_PER_LOAD, allPortLocations.length));
  };

  // Analytics helpers
  const commonLocationNames = useMemo(() => {
    const freq = {};
    allPortLocations.forEach((loc) => {
      freq[loc.name] = (freq[loc.name] || 0) + 1;
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [allPortLocations]);

  const statesWithMostLocations = useMemo(() => {
    const freq = {};
    allPortLocations.forEach((loc) => {
      freq[loc.state] = (freq[loc.state] || 0) + 1;
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [allPortLocations]);

  const uniqueUSStates = useMemo(
    () => [...new Set(allPortLocations.map((l) => l.state))].sort(),
    [allPortLocations]
  );

  const locationsForSelectedState = useMemo(() => {
    return selectedUSState ? allPortLocations.filter((l) => l.state === selectedUSState) : [];
  }, [allPortLocations, selectedUSState]);

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
            <h2 className="explainer-title mb-6">
              U.S. Cities and Towns With "Port" in Their Name
            </h2>

            <p className="explainer-paragraph">
              Why do so many cities and towns include the word "Port" in their name? The answer lies in trade, transportation, and access to water. Ports were critical entry points for goods, people, and ideas, making them natural foundations for early settlement and long-term economic growth.
            </p>

            <p className="explainer-paragraph">
              In many cases, communities with "Port" in their name developed around harbors, river mouths, or coastal inlets, where ships could dock and commerce could flourish. As these settlements expanded beyond their original waterfronts, the word "Port" remained, anchoring the town's identity to its maritime roots.
            </p>

            <p className="explainer-paragraph">
              Today, cities and towns with "Port" in their name are found along coastlines, rivers, and lakes throughout the United States. Some have grown into major shipping and industrial centers, while others remain smaller harbor towns shaped by fishing, tourism, or regional trade. Together, they reflect how water access influenced settlement patterns, economies, and place naming across the country.
            </p>

            <p className="explainer-paragraph">
              This page provides a complete, searchable list of U.S. locations containing the word "Port," along with interactive maps, state filtering, and geographic insights to help explore these port-connected communities.
            </p>
          </div>
        </section>

        {/* WHY SO MANY PLACES USE SECTION */}
        <section className="py-20" style={{ 
          background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 50%, #ddeeff 100%)',
          paddingTop: '5rem',
          paddingBottom: '5rem'
        }}>
          <div className="content-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title text-center mb-6" style={{ 
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1e3a8a',
              marginBottom: '2rem'
            }}>
              Why So Many Places Use "Port" in the Name
            </h2>

            <div className="flex justify-center mb-12" style={{ marginBottom: '3rem' }}>
              <p className="text-center text-gray-700 text-xl leading-relaxed max-w-3xl" style={{ 
                fontSize: '1.25rem',
                lineHeight: '1.8',
                textAlign: 'center',
                width: '100%'
              }}>
                The word "Port" is commonly used in place names to mark:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="why-card bg-white rounded-3xl border-2 border-blue-200 shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                borderColor: '#bfdbfe',
                padding: '2.5rem'
              }}>
                <div className="why-card-icon mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold text-white shadow-lg" style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  }}>
                    1
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#1e40af' }}>
                  Harbors & Docks
                </h3>
                <p className="text-gray-700 text-center leading-relaxed" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                  Settlements established around harbors or docking points
                </p>
              </div>

              <div className="why-card bg-white rounded-3xl border-2 border-indigo-200 shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)',
                borderColor: '#c7d2fe',
                padding: '2.5rem'
              }}>
                <div className="why-card-icon mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold text-white shadow-lg" style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                  }}>
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#4338ca' }}>
                  Maritime Commerce
                </h3>
                <p className="text-gray-700 text-center leading-relaxed" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                  Towns shaped by shipping, trade, and maritime commerce
                </p>
              </div>

              <div className="why-card bg-white rounded-3xl border-2 border-purple-200 shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                borderColor: '#e9d5ff',
                padding: '2.5rem'
              }}>
                <div className="why-card-icon mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold text-white shadow-lg" style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                  }}>
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#6d28d9' }}>
                  Entry Points
                </h3>
                <p className="text-gray-700 text-center leading-relaxed" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                  Locations serving as entry points for people and goods
                </p>
              </div>

              <div className="why-card bg-white rounded-3xl border-2 border-pink-200 shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-3" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%)',
                borderColor: '#fbcfe8',
                padding: '2.5rem'
              }}>
                <div className="why-card-icon mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold text-white shadow-lg" style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
                  }}>
                    4
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#be185d' }}>
                  Navigable Waterways
                </h3>
                <p className="text-gray-700 text-center leading-relaxed" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                  Communities defined by access to navigable waterways
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-8" style={{ paddingTop: '2rem' }}>
              <p className="text-center text-gray-800 text-xl leading-relaxed max-w-3xl" style={{ 
                fontSize: '1.25rem',
                lineHeight: '1.8',
                fontWeight: '500',
                textAlign: 'center',
                width: '100%'
              }}>
                In many regions, the port remains central to local identity, even if shipping activity has declined or shifted elsewhere.
              </p>
            </div>
          </div>
        </section>

        {/* City Theme Links */}
        <CityThemeLinks currentTheme="port" />

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

        {/* Notable Cities Component */}
        <PortCitiesNotable />

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
                <MapWithNoSSR locations={allPortLocations} />
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
              Showing {displayedLocations.length} of {allPortLocations.length} locations
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

            {visibleCount < allPortLocations.length && (
              <div className="text-center mt-6">
                <button className="view-map-btn load-more-btn" onClick={handleLoadMore}>
                  Load More — Showing {displayedLocations.length} of {allPortLocations.length}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <PortFAQSection />

      </main>

      <Footer />
    </>
  );
}
