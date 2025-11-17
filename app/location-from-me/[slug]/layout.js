import { notFound } from "next/navigation";

// Function to calculate distance
const toRad = (degrees) => degrees * Math.PI / 180;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const kmToMiles = (km) => km * 0.621371;
const kmToNauticalMiles = (km) => km * 0.539957;

export async function generateMetadata({ params }) {
  // Slug extraction
  let slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || "";

  if (!slug) {
    slug = "unknown-location-from-unknown-location";
  }

  // Extract source and destination
  const parts = slug.replace("how-far-is-", "").split("-from-");
  let from = parts[0]?.replace(/-/g, " ") || "Unknown Location";
  let to = parts[1]?.replace(/-/g, " ") || "Unknown Location";

  if (to === "me") {
    to = "Your Location";
  }

  // Dynamic distance calculation with real data
  let miles = null;
  let km = null;
  let destinationDetails = null;
  let fullDestinationName = from;

  try {
    // Only calculate if we have a real destination
    if (to !== "Your Location" && from !== "Unknown Location") {
      // Use the correct API URL - remove the base URL to use relative path
      const apiUrl = `/api/geocode?query=${encodeURIComponent(from)}`;
      
      console.log('🔍 Fetching coordinates for:', from);
      
      // Use fetch with no-cache to ensure fresh data
      const destResponse = await fetch(apiUrl, {
        cache: 'no-store', // Don't cache for metadata generation
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (destResponse.ok) {
        const destData = await destResponse.json();
        console.log('✅ API Response:', destData);
        
        if (destData && destData.lat && destData.lon) {
          destinationDetails = destData;
          fullDestinationName = destData.display_name || from;
          
          // Calculate distance from major cities to give users context
          const majorCities = [
            { lat: 40.7128, lon: -74.0060, name: "New York" }, // East Coast US
            { lat: 43.6532, lon: -79.3832, name: "Toronto" },  // Canada
            { lat: 51.5074, lon: -0.1278, name: "London" },    // Europe
            { lat: 53.5461, lon: -113.4938, name: "Edmonton" }, // Western Canada
          ];
          
          // Use Toronto as the primary reference for Canadian locations
          const torontoRef = { lat: 43.6532, lon: -79.3832, name: "Toronto" };
          
          const distanceInKm = calculateDistance(
            torontoRef.lat,
            torontoRef.lon,
            parseFloat(destData.lat),
            parseFloat(destData.lon)
          );
          
          if (distanceInKm && !isNaN(distanceInKm)) {
            miles = kmToMiles(distanceInKm).toFixed(1);
            km = distanceInKm.toFixed(1);
            
            console.log(`📏 Distance from ${torontoRef.name}: ${miles} miles (${km} km)`);
          }
        }
      } else {
        console.log('❌ API request failed:', destResponse.status);
      }
    }
  } catch (error) {
    console.error('💥 Error in metadata generation:', error.message);
    // Don't throw error, just use fallback metadata
  }

  // Extract meaningful destination name
  const shortDestinationName = fullDestinationName.split(',')[0];
  const displayDestinationName = shortDestinationName || capitalize(from);

  // Get additional location context from the API response
  let locationContext = '';
  if (destinationDetails?.address) {
    const addr = destinationDetails.address;
    if (addr.state) locationContext = ` in ${addr.state}`;
    if (addr.country && addr.country !== 'Canada') locationContext += `, ${addr.country}`;
  }

  // Dynamic title and description
  const pageTitle = `How Far is ${capitalize(displayDestinationName)} from ${capitalize(to)}? | LocateMyCity`;

  // Create dynamic description based on available data
  let metaDescription = '';
  
  if (miles && km) {
    // Case 1: We have real distance data
    metaDescription = `Marystown${locationContext} is approximately ${miles} miles (${km} km) from major Canadian cities. Calculate the exact distance from your location to Marystown and get detailed geographical information.`;
  } else if (destinationDetails && destinationDetails.lat && destinationDetails.lon) {
    // Case 2: We have coordinates but no distance
    const lat = parseFloat(destinationDetails.lat).toFixed(4);
    const lon = parseFloat(destinationDetails.lon).toFixed(4);
    metaDescription = `Marystown, Newfoundland and Labrador is located at ${lat}°N, ${lon}°W. Calculate the exact distance from your location and explore comprehensive geographical data.`;
  } else {
    // Case 3: Fallback
    metaDescription = `Calculate the exact distance from your location to Marystown, Newfoundland and Labrador. Get precise coordinates, travel information, and comprehensive geographical data.`;
  }

  console.log('🎯 Final Metadata:', { 
    title: pageTitle, 
    description: metaDescription 
  });

  const primaryDomain = 'https://locatemycity.com';
  
  return {
    title: pageTitle,
    description: metaDescription,
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      type: "website",
      url: `${primaryDomain}/location-from-me/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: metaDescription,
    },
    alternates: {
      canonical: `${primaryDomain}/location-from-me/${slug}`,
    },
  };
}

function capitalize(str = "") {
  if (!str) return "";
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

// Rest of your layout component remains the same...
export default function DistanceLayout({ children, params }) {
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || "";
  
  // Extract destination name from slug
  let destinationName = '';
  let sourceName = 'Your Location';
  
  if (slug && slug.includes('how-far-is-') && slug.includes('-from-me')) {
    destinationName = slug
      .replace('how-far-is-', '')
      .replace('-from-me', '')
      .replace(/-/g, ' ');
    
    sourceName = 'Your Current Location';
  }

  // Get short name for destination (before any commas)
  const destinationShortName = destinationName.split(',')[0];

  // Use primary domain for structured data
  const primaryDomain = 'https://locatemycity.com';

  // Create structured data with dynamic values
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How does the distance calculator work for ${capitalize(destinationShortName)}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We calculate straight-line (great-circle) distances using the haversine formula based on your current location coordinates. Driving times can differ based on route and traffic."
        }
      },
      {
        "@type": "Question",
        "name": `Can I use my current location to calculate distance to ${capitalize(destinationShortName)}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Allow location access in your browser for precise calculations, or manually enter your location for accurate distance measurements."
        }
      }
    ]
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${primaryDomain}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Distance Calculator",
        "item": `${primaryDomain}/location-from-me`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": destinationShortName ? `Distance to ${capitalize(destinationShortName)}` : "Destination",
        "item": `${primaryDomain}/location-from-me/${params.slug}`
      }
    ]
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* Page Content */}
      {children}
    </>
  );
}