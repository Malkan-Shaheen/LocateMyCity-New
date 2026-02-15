// Server-rendered crawlable link spine page
// This page MUST be server-rendered (no "use client")
// Contains plain <a href> links visible in raw HTML

// Popular cities and locations for distance calculators
const POPULAR_CITIES = [
  'Miami', 'New York', 'Toronto', 'London', 'Paris', 'Los Angeles', 'Chicago',
  'Montreal', 'Vancouver', 'Boston', 'San Francisco', 'Las Vegas', 'Phoenix',
  'Seattle', 'Houston', 'Dallas', 'Atlanta', 'Denver', 'Philadelphia', 'Washington',
  'Orlando', 'Tampa', 'Fort Lauderdale', 'West Palm Beach', 'Nassau', 'Havana',
  'Dubai', 'Tokyo', 'Sydney', 'Melbourne', 'Berlin', 'Rome', 'Madrid', 'Barcelona',
  'Amsterdam', 'Vienna', 'Prague', 'Budapest', 'Warsaw', 'Stockholm', 'Copenhagen',
  'Oslo', 'Helsinki', 'Dublin', 'Edinburgh', 'Manchester', 'Birmingham', 'Liverpool',
  'Glasgow', 'Belfast', 'Cardiff', 'Brussels', 'Zurich', 'Geneva', 'Luxembourg',
  'Monaco', 'Lisbon', 'Porto', 'Athens', 'Istanbul', 'Cairo', 'Johannesburg',
  'Cape Town', 'Nairobi', 'Lagos', 'Casablanca', 'Marrakech', 'Tunis', 'Algiers',
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Beijing', 'Shanghai', 'Hong Kong', 'Singapore',
  'Bangkok', 'Kuala Lumpur', 'Jakarta', 'Manila', 'Seoul', 'Taipei', 'Ho Chi Minh City',
  'Hanoi', 'Phnom Penh', 'Vientiane', 'Yangon', 'Dhaka', 'Kathmandu', 'Colombo',
  'Karachi', 'Lahore', 'Islamabad', 'Tehran', 'Baghdad', 'Riyadh', 'Jeddah',
  'Doha', 'Kuwait City', 'Abu Dhabi', 'Muscat', 'Manama', 'Beirut', 'Damascus',
  'Amman', 'Jerusalem', 'Tel Aviv', 'Ankara', 'Istanbul', 'Baku', 'Tbilisi',
  'Yerevan', 'Nicosia', 'Mexico City', 'Guadalajara', 'Monterrey', 'Cancun',
  'Tijuana', 'Buenos Aires', 'Sao Paulo', 'Rio de Janeiro', 'Brasilia', 'Lima',
  'Bogota', 'Caracas', 'Santiago', 'Quito', 'La Paz', 'Montevideo', 'Asuncion',
  'Auckland', 'Wellington', 'Christchurch', 'Fiji', 'Honolulu', 'Anchorage',
  'Calgary', 'Edmonton', 'Winnipeg', 'Ottawa', 'Quebec City', 'Halifax', 'St. John\'s'
];

// Generate distance calculator links
function generateDistanceLinks() {
  const links = [];
  const seen = new Set();
  
  // Popular routes (high priority)
  const popularRoutes = [
    ['Miami', 'New York'], ['Miami', 'Toronto'], ['Miami', 'London'], ['Miami', 'Montreal'],
    ['New York', 'Toronto'], ['New York', 'London'], ['New York', 'Los Angeles'], ['New York', 'Miami'],
    ['Toronto', 'Montreal'], ['Toronto', 'Vancouver'], ['Toronto', 'New York'], ['Toronto', 'Miami'],
    ['Montreal', 'New York'], ['Montreal', 'Toronto'], ['Montreal', 'Boston'], ['Montreal', 'Miami'],
    ['London', 'Paris'], ['London', 'New York'], ['London', 'Dubai'], ['London', 'Miami'],
    ['Paris', 'London'], ['Paris', 'New York'], ['Paris', 'Rome'], ['Paris', 'Barcelona'],
    ['Los Angeles', 'San Francisco'], ['Los Angeles', 'Las Vegas'], ['Los Angeles', 'New York'],
    ['Chicago', 'New York'], ['Chicago', 'Miami'], ['Chicago', 'Los Angeles'],
    ['Dubai', 'London'], ['Dubai', 'Mumbai'], ['Dubai', 'Singapore'],
    ['Tokyo', 'Osaka'], ['Tokyo', 'Seoul'], ['Tokyo', 'Shanghai'],
    ['Sydney', 'Melbourne'], ['Sydney', 'Auckland'], ['Sydney', 'Brisbane']
  ];
  
  // Add popular routes first
  popularRoutes.forEach(([source, dest]) => {
    const key = `${source}-${dest}`;
    if (!seen.has(key)) {
      seen.add(key);
      links.push({ source, dest });
    }
  });
  
  // Generate additional routes from popular cities
  const topCities = POPULAR_CITIES.slice(0, 50);
  for (let i = 0; i < topCities.length && links.length < 500; i++) {
    for (let j = i + 1; j < topCities.length && links.length < 500; j++) {
      const source = topCities[i];
      const dest = topCities[j];
      const key = `${source}-${dest}`;
      if (!seen.has(key)) {
        seen.add(key);
        links.push({ source, dest });
      }
    }
  }
  
  return links.slice(0, 500);
}

function toLocationSlug(str) {
  return (str || '').toLowerCase().replace(/\s+/g, '-');
}

export default function ExplorePage() {
  const links = generateDistanceLinks();
  
  // Group links by source city for better organization
  const linksBySource = {};
  links.forEach(({ source, dest }) => {
    if (!linksBySource[source]) {
      linksBySource[source] = [];
    }
    linksBySource[source].push(dest);
  });
  
  const sources = Object.keys(linksBySource).sort();
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
        Explore Distance Calculators
      </h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
        Discover distances between cities, locations, and landmarks worldwide. All links are crawlable and indexable.
      </p>
      
      {/* Popular Distance Calculators Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          Popular Distance Calculators
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {links.slice(0, 50).map(({ source, dest }, idx) => (
            <a
              key={`popular-${idx}`}
              href={`/how-far-is-${toLocationSlug(dest)}-from-${toLocationSlug(source)}`}
              style={{
                display: 'block',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#158bf5'
              }}
            >
              How far is {dest} from {source}?
            </a>
          ))}
        </div>
      </section>
      
      {/* Cities Section - Organized by Source */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          Cities
        </h2>
        {sources.map((source) => (
          <div key={source} style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600', color: '#333' }}>
              From {source}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
              {linksBySource[source].slice(0, 20).map((dest) => (
                <li key={`${source}-${dest}`}>
                  <a
                    href={`/how-far-is-${toLocationSlug(dest)}-from-${toLocationSlug(source)}`}
                    style={{
                      display: 'block',
                      padding: '0.5rem 0.75rem',
                      textDecoration: 'none',
                      color: '#158bf5',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    {source} → {dest}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      
      {/* States / Countries Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          Major International Routes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {links.filter(({ source, dest }) => {
            // Filter for major international routes
            const majorCities = ['New York', 'London', 'Paris', 'Tokyo', 'Dubai', 'Sydney', 'Toronto', 'Miami'];
            return majorCities.includes(source) || majorCities.includes(dest);
          }).slice(0, 100).map(({ source, dest }, idx) => (
            <a
              key={`international-${idx}`}
              href={`/how-far-is-${toLocationSlug(dest)}-from-${toLocationSlug(source)}`}
              style={{
                display: 'block',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#158bf5'
              }}
            >
              {source} to {dest}
            </a>
          ))}
        </div>
      </section>
      
      {/* All Links Section (Complete List) */}
      <section>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          All Distance Calculator Links
        </h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Complete list of {links.length} distance calculator pages:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
          {links.map(({ source, dest }, idx) => (
            <a
              key={`all-${idx}`}
              href={`/how-far-is-${toLocationSlug(dest)}-from-${toLocationSlug(source)}`}
              style={{
                display: 'block',
                padding: '0.5rem',
                textDecoration: 'none',
                color: '#158bf5',
                fontSize: '0.9rem'
              }}
            >
              How far is {dest} from {source}?
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: 'Explore Distance Calculators | LocateMyCity',
  description: 'Browse hundreds of distance calculator pages. Find distances between cities, locations, and landmarks worldwide.',
  robots: 'index, follow',
};
