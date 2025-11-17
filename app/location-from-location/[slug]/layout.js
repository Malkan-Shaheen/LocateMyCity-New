// app/location-from-location/[slug]/layout.js
import { notFound } from "next/navigation";

// Function to calculate distance
const toRad = (degrees) => degrees * Math.PI / 180;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const kmToMiles = (km) => km * 0.621371;
const kmToNauticalMiles = (km) => km * 0.539957;

function capitalize(str = "") {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper function to extract location names from slug
function extractLocationNames(slug) {
  let sourceName = "Location A";
  let destinationName = "Location B";
  
  if (slug && slug.includes("-from-")) {
    const parts = slug.replace("how-far-is-", "").split("-from-");
    sourceName = parts[0]?.replace(/-/g, " ") || "Location A";
    destinationName = parts[1]?.replace(/-/g, " ") || "Location B";
  }

  return { sourceName, destinationName };
}

// Static metadata
export async function generateMetadata({ params }) {
  // Await the params first
  const awaitedParams = await params;
  const slug = awaitedParams?.slug || "";

  // Extract location names from slug
  const { sourceName, destinationName } = extractLocationNames(slug);

  return {
    title: `How Far is ${sourceName} from ${destinationName}? | Distance Calculator`,
    description: `Calculate the distance between ${sourceName} and ${destinationName}. Get accurate measurements in miles, kilometers, and nautical miles with travel time estimates.`,
  };
}

export default function DistanceLayout({ children, params }) {
  // Extract location names for JSON-LD
  const slug = params?.slug || "";
  const { sourceName, destinationName } = extractLocationNames(slug);
  
  // Get short names (first part before comma)
  const sourceShortName = sourceName.split(',')[0];
  const destinationShortName = destinationName.split(',')[0];

  // Create structured data with static values
  const breadcrumbJsonLd = {
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
        "name": "Distance Calculator",
        "item": "https://locatemycity.com/location-from-location"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${capitalize(sourceShortName)} to ${capitalize(destinationShortName)}`,
        "item": `https://locatemycity.com/location-from-location/${slug}`
      }
    ]
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `How Far is ${capitalize(sourceShortName)} from ${capitalize(destinationShortName)}?`,
    "description": `Calculate the exact distance between ${capitalize(sourceShortName)} and ${capitalize(destinationShortName)} in miles, kilometers, and nautical miles.`,
    "url": `https://locatemycity.com/location-from-location/${slug}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "LocateMyCity",
      "url": "https://locatemycity.com"
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How far is ${capitalize(sourceShortName)} from ${capitalize(destinationShortName)}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The straight-line distance between ${capitalize(sourceShortName)} and ${capitalize(destinationShortName)} is calculated using precise geographical coordinates and the haversine formula for accuracy.`
        }
      },
      {
        "@type": "Question",
        "name": "What units of measurement are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our calculator provides distances in miles, kilometers, and nautical miles, with automatic conversion between all units for your convenience."
        }
      },
      {
        "@type": "Question",
        "name": "How accurate are the distance calculations?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The calculations are mathematically precise for straight-line (great-circle) distances between coordinates. Actual travel distances may vary based on specific routes and terrain."
        }
      },
      {
        "@type": "Question",
        "name": "Can I calculate distances between any locations worldwide?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our calculator works with cities, towns, addresses, or any geographical locations worldwide that can be accurately geocoded using our mapping technology."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        suppressHydrationWarning
      />
      {children}
    </>
  );
}