"use client";

import Link from "next/link";

const cityThemes = [
  {
    name: "Spring",
    path: "/cities-with-spring-in-their-name",
    description: "Towns inspired by natural springs, water sources, and early settlements.",
    keyword: "spring",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    bgColor: "rgba(16, 185, 129, 0.1)"
  },
  {
    name: "Rock",
    path: "/cities-with-rock-in-their-name",
    description: "Locations named after rocky landscapes, formations, or mining history.",
    keyword: "rock",
    gradient: "linear-gradient(135deg, #78716c 0%, #57534e 100%)",
    bgColor: "rgba(120, 113, 108, 0.1)"
  },
  {
    name: "Lake",
    path: "/us-locations-with-lake-in-the-name",
    description: "Communities built around lakes, reservoirs, and freshwater access.",
    keyword: "lake",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    bgColor: "rgba(59, 130, 246, 0.1)"
  },
  {
    name: "Fort",
    path: "/us-locations-with-fort-in-the-name",
    description: "Cities that grew around historic military forts and trading posts.",
    keyword: "fort",
    gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    bgColor: "rgba(220, 38, 38, 0.1)"
  },
  {
    name: "Beach",
    path: "/us-locations-with-beach-in-the-name",
    description: "Coastal communities shaped by beaches, recreation, and waterfront access.",
    keyword: "beach",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    bgColor: "rgba(245, 158, 11, 0.1)"
  },
  {
    name: "Port",
    path: "/us-locations-with-port-in-the-name",
    description: "Towns established around harbors, shipping, and maritime commerce.",
    keyword: "port",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    bgColor: "rgba(99, 102, 241, 0.1)"
  },
  {
    name: "Old",
    path: "/us-locations-with-old-in-the-name",
    description: "Places that mark original settlements and historic districts.",
    keyword: "old",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    bgColor: "rgba(139, 92, 246, 0.1)"
  },
  {
    name: "New",
    path: "/us-locations-with-new-in-the-name",
    description: "Communities established as newer settlements or renamed locations.",
    keyword: "new",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    bgColor: "rgba(6, 182, 212, 0.1)"
  },
  {
    name: "San",
    path: "/us-locations-with-san-in-the-name",
    description: "Cities with Spanish colonial roots and mission settlements.",
    keyword: "san",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    bgColor: "rgba(236, 72, 153, 0.1)"
  },
  {
    name: "River",
    path: "/us-locations-with-river-in-the-name",
    description: "Towns developed along rivers, waterways, and trade routes.",
    keyword: "river",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    bgColor: "rgba(20, 184, 166, 0.1)"
  }
];

export default function CityThemeLinks({ currentTheme }) {
  // Filter out the current theme
  const otherThemes = cityThemes.filter(
    (theme) => theme.keyword !== currentTheme?.toLowerCase()
  );

  // Get the current theme's display name for the heading
  const currentThemeName = cityThemes.find(
    (theme) => theme.keyword === currentTheme?.toLowerCase()
  )?.name || "City Names";

  return (
    <section className="py-20" style={{ 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
      paddingTop: '6rem',
      paddingBottom: '5rem',
      position: 'relative',
      overflow: 'hidden',
      marginTop: '4rem'
    }}>
      {/* Static background elements */}
      <div style={{
        position: 'absolute',
        top: '-40%',
        right: '-8%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-25%',
        left: '-3%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      <div className="content-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
        <div className="text-center mb-16">
          <h2 className="section-title" style={{ 
            fontSize: '2.75rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em'
          }}>
            Enjoy Exploring City Name Patterns?
          </h2>

          <div style={{ 
            maxWidth: '48rem',
            margin: '0 auto',
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <p className="text-gray-700 text-lg leading-relaxed mb-4" style={{ 
              fontSize: '1.125rem',
              lineHeight: '1.8',
              color: '#4b5563',
              fontWeight: '400',
              textAlign: 'center',
              width: '100%',
              maxWidth: '100%'
            }}>
              If you found this list of U.S. cities with <span style={{ 
                fontWeight: '700', 
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>"{currentThemeName}"</span> in their name interesting, there's plenty more to explore. Across the country, place names often reflect geography, history, and early settlement patterns.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed" style={{ 
              fontSize: '1.125rem',
              lineHeight: '1.8',
              color: '#4b5563',
              fontWeight: '400',
              textAlign: 'center',
              width: '100%',
              maxWidth: '100%'
            }}>
              Check out these popular collections to discover how words like <span style={{ 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Spring, Rock</span>, and more shaped city names throughout the United States.
            </p>
          </div>
        </div>

        {/* Buttons with descriptions inside */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: '1.25rem',
          marginTop: '3rem',
          width: '100%'
        }}>
          {otherThemes.map((theme) => (
            <Link
              key={theme.keyword}
              href={theme.path}
              style={{
                display: 'flex',
                textDecoration: 'none',
                position: 'relative',
                zIndex: 2,
                flex: '0 1 auto',
                minWidth: '280px',
                maxWidth: '320px'
              }}
            >
              <div
                style={{
                  background: 'white',
                  color: '#1e3a8a',
                  padding: '1.5rem 2rem',
                  borderRadius: '50px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                  border: `2px solid transparent`,
                  position: 'relative',
                  overflow: 'visible',
                  width: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '120px',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 25px ${theme.bgColor.replace('0.1', '0.25')}`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = theme.bgColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  marginBottom: '0.75rem',
                  color: '#1e3a8a'
                }}>
                  Cities With "{theme.name}"
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  fontWeight: '400',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {theme.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

