'use client';
import { useState, useEffect } from "react";
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, Route } from 'lucide-react';
import travelGuidesData from '../../data/cities_info1.json';

export default function BlogPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const extractGuidesFromData = () => {
      try {
        setLoading(true);
        
        const guideList = [];
        
        if (travelGuidesData && travelGuidesData.page) {
          const pageData = travelGuidesData.page;
          guideList.push(createGuideObject(pageData));
        } else if (Array.isArray(travelGuidesData)) {
          travelGuidesData.forEach(page => {
            if (page && page.page) {
              guideList.push(createGuideObject(page.page));
            }
          });
        } else if (typeof travelGuidesData === 'object') {
          Object.values(travelGuidesData).forEach(item => {
            if (item && item.page) {
              guideList.push(createGuideObject(item.page));
            } else if (item && item.title) {
              guideList.push(createGuideObject(item));
            }
          });
        }

        setGuides(guideList);
      } catch (error) {
        console.error('Error processing travel guides:', error);
        setGuides([]);
      } finally {
        setLoading(false);
      }
    };

    const createGuideObject = (pageData) => {
      return {
        title: pageData.title || "Untitled Guide",
        image: getFirstValidImage(pageData),
        location: pageData.general_info?.country || "Unknown Location",
        duration: extractDuration(pageData),
        routes: calculateTotalRoutes(pageData),
        description: extractDescription(pageData),
        slug: pageData.slug || "unknown-guide"
      };
    };

    const getFirstValidImage = (pageData) => {
      if (pageData.about_destination?.images?.[0]) {
        return pageData.about_destination.images[0];
      }
      if (pageData.by_plane?.image) {
        return pageData.by_plane.image;
      }
      if (pageData.by_ferry?.image) {
        return pageData.by_ferry.image;
      }
      return "/get-from-to-images/eleuthera1.webp";
    };

    const extractDuration = (pageData) => {
      if (pageData.route_overview?.duration) {
        return pageData.route_overview.duration.split('|')[0]?.trim();
      }
      if (pageData.by_plane?.travel_time) {
        return pageData.by_plane.travel_time;
      }
      return "Duration not specified";
    };

    const calculateTotalRoutes = (pageData) => {
      let totalRoutes = 0;
      
      if (pageData.by_plane?.schedule?.airlines) {
        pageData.by_plane.schedule.airlines.forEach(airline => {
          totalRoutes += airline.routes?.length || 0;
        });
      }
      
      if (pageData.by_ferry?.schedule?.routes) {
        totalRoutes += pageData.by_ferry.schedule.routes.length;
      }
      
      return totalRoutes || 0;
    };

    const extractDescription = (pageData) => {
      if (pageData.about_destination?.description?.[0]) {
        return pageData.about_destination.description[0];
      }
      if (pageData.intro?.description) {
        return pageData.intro.description;
      }
      if (pageData.by_plane?.description) {
        return pageData.by_plane.description;
      }
      return "No description available";
    };

    extractGuidesFromData();
  }, []);

  if (loading) {
    return (
      <div className="blog-page">
        <Header />
        <main className="blog-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading travel guides...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="blog-page">
      <Head>
        <title>Travel Guides - How to Get There | LocateMyCity</title>
        <meta name="description" content="Comprehensive travel guides on how to reach different islands and destinations. Find the best routes, transportation options, and travel tips." />
        <meta name="robots" content="index, follow" />
      </Head>

      <Header />

      <main className="blog-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <h1 className="hero-title">
              How To Get There
            </h1>
            <p className="hero-subtitle">
              Your comprehensive guide to reaching beautiful islands and destinations. 
              Discover the best transportation options, routes, and travel tips to make 
              your journey smooth and memorable.
            </p>
          </div>
        </section>

        {/* Travel Guides Grid */}
        <section className="guides-section">
          <div className="guides-container">
            <div className="section-header">
              <h2 className="section-title">
                Available Travel Guides
              </h2>
              <p className="section-description">
                Browse our collection of detailed travel guides to plan your perfect island getaway
              </p>
            </div>

            {guides.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">No travel guides available at the moment.</p>
              </div>
            ) : (
              <div className="guides-grid">
                {guides.map((guide, index) => (
                  <TravelGuideCard 
                    key={`${guide.slug}-${index}`} 
                    guide={guide}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Travel Guide Card Component
const TravelGuideCard = ({ guide }) => {
  const router = useRouter();

  const handleCardClick = () => {
    if (guide.slug) {
      router.push(`/${guide.slug}`);
    }
  };

  const getRouteInfo = (title) => {
    const match = title.match(/How to Get to (.+) from (.+)/);
    if (match) {
      return {
        destination: match[1],
        source: match[2]
      };
    }
    return {
      destination: guide.location,
      source: "Various locations"
    };
  };

  const routeInfo = getRouteInfo(guide.title);

  return (
    <div className="guide-card" onClick={handleCardClick}>
      <div className="card-image-container">
        <Image
          src={guide.image}
          alt={guide.title}
          fill
          className="card-image"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="image-overlay"></div>
      </div>

      <div className="card-content">
        <h3 className="card-title">
          {guide.title}
        </h3>

        <div className="route-info">
          <div className="destination">
            <MapPin className="icon" />
            <span className="destination-text">{routeInfo.destination}</span>
          </div>
          <div className="source">from {routeInfo.source}</div>
        </div>

        <div className="card-stats">
          <div className="stat">
            <Clock className="icon" />
            <span className="stat-text">{guide.duration}</span>
          </div>
          <div className="stat">
            <Route className="icon" />
            <span className="stat-text">{guide.routes} routes</span>
          </div>
        </div>

        <p className="card-description">
          {guide.description}
        </p>

        <button 
          className="read-more-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          Read Guide
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  
);
};