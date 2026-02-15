'use client';

import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const cityThemes = [
  {
    title: 'Beach Cities',
    description: 'Discover U.S. cities and towns with "Beach" in their name',
    path: '/us-locations-with-beach-in-the-name',
    icon: '🏖️',
    gradient: 'linear-gradient(135deg, #6bb9f0 0%, #3498db)',
  },
  {
    title: 'Fort Cities',
    description: 'Explore U.S. locations with "Fort" in their name',
    path: '/us-locations-with-fort-in-the-name',
    icon: '🏰',
    gradient: 'linear-gradient(135deg, #6bb9f0 0%, #3498db)',
  },
  {
    title: 'Lake Cities',
    description: 'Find U.S. cities and towns featuring "Lake" in their name',
    path: '/us-locations-with-lake-in-the-name',
    icon: '🏞️',
    gradient: 'linear-gradient(135deg, #6bb9f0 0%, #3498db)',
  },
  {
    title: 'New Cities',
    description: 'Browse U.S. locations that begin with "New"',
    path: '/us-locations-with-new-in-the-name',
    icon: '🆕',
    gradient: 'linear-gradient(135deg, #6bb9f0 0%, #3498db)',
  },
  {
    title: 'Old Cities',
    description: 'Discover U.S. cities with "Old" in their name',
    path: '/us-locations-with-old-in-the-name',
    icon: '🏛️',
    gradient: 'linear-gradient(135deg, #6bb9f0 0%, #3498db)',
  },
  {
    title: 'Port Cities',
    description: 'Explore U.S. locations featuring "Port" in their name',
    path: '/us-locations-with-port-in-the-name',
    icon: '⚓',
    gradient: 'linear-gradient(135deg, #6bb9f0 0%, #3498db)',
  },
  {
    title: 'River Cities',
    description: 'Find U.S. cities and towns with "River" in their name',
    path: '/us-locations-with-river-in-the-name',
    icon: '🌊',
    gradient: 'linear-gradient(135deg, #6bb9f0 0%, #3498db)',
  },
  {
    title: 'San Cities',
    description: 'Browse U.S. locations that start with "San"',
    path: '/us-locations-with-san-in-the-name',
    icon: '☀️',
    gradient: 'linear-gradient(135deg, #6bb9f0 0%, #3498db)',
  },
  {
    title: 'Rock Cities',
    description: 'Discover U.S. cities with "Rock" in their name',
    path: '/cities-with-rock-in-their-name',
    icon: '⛰️',
    gradient: 'linear-gradient(135deg, #6bb9f0 0%, #3498db)',
  },
  {
    title: 'Spring Cities',
    description: 'Explore U.S. locations featuring "Spring" in their name',
    path: '/cities-with-spring-in-their-name',
    icon: '💧',
    gradient: 'linear-gradient(135deg, #6bb9f0 0%, #3498db)',
  },
];

export default function CityThemesPage() {
  const router = useRouter();

  const handleCardClick = (path) => {
    router.push(path);
  };

  return (
    <>
      <style>{`
        .city-themes-page {
          min-height: 100vh;
          background-color: #f5f7fa;
        }

        .hero-banner {
          color: white;
          padding: 3rem 0;
          text-align: center;
          box-shadow: 0 4px 20px rgba(70, 130, 180, 0.2);
          position: relative;
          overflow: hidden;
          margin-top: 0px;
          background: linear-gradient(135deg, #6bb9f0 0%, #3498db);
        }

        .hero-banner::before {
          content: '';
          position: absolute;
          top: -50px;
          left: -50px;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .hero-banner::after {
          content: '';
          position: absolute;
          right: -80px;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }

        .main-heading {
          margin: 0;
          font-size: 2.8rem;
          font-weight: 700;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .hero-subtitle {
          font-size: 1.3rem;
          opacity: 0.9;
          margin-top: 0.5rem;
          font-weight: 300;
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          padding: 0 20px;
        }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .themes-section {
          padding: 4rem 0;
        }

        .themes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .theme-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(70, 130, 180, 0.1);
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border-top: 4px solid #4682B4;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-height: 220px;
        }

        .theme-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(70, 130, 180, 0.03), rgba(135, 206, 235, 0.03));
          z-index: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .theme-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(70, 130, 180, 0.2);
        }

        .theme-card:hover::before {
          opacity: 1;
        }

        .theme-card-content {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .theme-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          display: block;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .theme-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2E5F8A;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .theme-description {
          font-size: 1rem;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .theme-card:hover .theme-title {
          color: #158bf5;
        }

        .section-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #2E5F8A;
          text-align: center;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: #666;
          text-align: center;
          max-width: 700px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .main-heading {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .themes-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .theme-card {
            min-height: 200px;
            padding: 1.5rem;
          }

          .theme-icon {
            font-size: 3rem;
          }

          .theme-title {
            font-size: 1.3rem;
          }

          .section-title {
            font-size: 1.8rem;
          }
        }

        @media (max-width: 480px) {
          .hero-banner {
            padding: 2rem 0;
          }

          .main-heading {
            font-size: 1.75rem;
          }

          .hero-subtitle {
            font-size: 1rem;
            padding: 0 15px;
          }

          .themes-section {
            padding: 2.5rem 0;
          }
        }
      `}</style>

      <div className="city-themes-page">
        <Header />

        <main id="main-content">
          <section className="hero-banner">
            <div className="content-container">
              <h1 className="main-heading">City Themes</h1>
              <p className="hero-subtitle">
                Explore unique collections of U.S. cities organized by themes. Discover locations with
                specific words in their names, from coastal beaches to historic forts and everything in between.
              </p>
            </div>
          </section>

          <section className="themes-section">
            <div className="content-container">
              <h2 className="section-title">Browse by Theme</h2>
              <p className="section-subtitle">
                Click on any theme card below to explore cities and towns that share a common naming pattern.
                Each theme includes interactive maps, detailed statistics, and comprehensive location listings.
              </p>

              <div className="themes-grid">
                {cityThemes.map((theme) => (
                  <div
                    key={theme.path}
                    className="theme-card"
                    onClick={() => handleCardClick(theme.path)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(theme.path);
                      }
                    }}
                    aria-label={`Explore ${theme.title}`}
                  >
                    <div className="theme-card-content">
                      <span className="theme-icon" aria-hidden="true">
                        {theme.icon}
                      </span>
                      <h3 className="theme-title">{theme.title}</h3>
                      <p className="theme-description">{theme.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

