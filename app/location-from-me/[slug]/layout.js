import { notFound } from "next/navigation";

// Function to calculate distance
const toRad = (degrees) => degrees * Math.PI / 180;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const kmToMiles = (km) => km * 0.621371;
const kmToNauticalMiles = (km) => km * 0.539957;

export async function generateMetadata({ params }) {
  let slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || "";

  if (!slug) slug = "unknown-location-from-unknown-location";

  const parts = slug.replace("how-far-is-", "").split("-from-");
  let from = parts[0]?.replace(/-/g, " ") || "Unknown Location";
  let to = parts[1]?.replace(/-/g, " ") || "Unknown Location";

  if (to === "me") to = "Your Location";

  let miles = null;
  let km = null;
  let destinationDetails = null;
  let fullDestinationName = from;

  try {
    if (to !== "Your Location" && from !== "Unknown Location") {
      const apiUrl = `/api/geocode?query=${encodeURIComponent(from)}`;
      const destResponse = await fetch(apiUrl, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      });

      if (destResponse.ok) {
        const destData = await destResponse.json();
        if (destData && destData.lat && destData.lon) {
          destinationDetails = destData;
          fullDestinationName = destData.display_name || from;

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
          }
        }
      }
    }
  } catch (error) {
    console.error("💥 Error in metadata generation:", error.message);
  }

  const shortDestinationName = fullDestinationName.split(",")[0];
  const displayDestinationName = shortDestinationName || capitalize(from);

  let locationContext = "";
  if (destinationDetails?.address) {
    const addr = destinationDetails.address;
    if (addr.state) locationContext = ` in ${addr.state}`;
    if (addr.country && addr.country !== "Canada")
      locationContext += `, ${addr.country}`;
  }

  const pageTitle = `How Far is ${capitalize(
    displayDestinationName
  )} from ${capitalize(to)}? | LocateMyCity`;

  let metaDescription = "";

  if (miles && km) {
    metaDescription = `${capitalize(
      displayDestinationName
    )}${locationContext} is approximately ${miles} miles (${km} km) from major Canadian cities. Calculate the exact distance from your location to ${capitalize(
      displayDestinationName
    )} and get detailed geographical information.`;
  } else if (destinationDetails?.lat && destinationDetails?.lon) {
    const lat = parseFloat(destinationDetails.lat).toFixed(4);
    const lon = parseFloat(destinationDetails.lon).toFixed(4);
    metaDescription = `${capitalize(
      displayDestinationName
    )}${locationContext} is located at ${lat}°N, ${lon}°W. Calculate the exact distance from your location and explore comprehensive geographical data.`;
  } else {
    metaDescription = `Calculate the exact distance from your location to ${capitalize(
      displayDestinationName
    )}${locationContext}. Get precise coordinates, travel information, and detailed geographical data.`;
  }

  const primaryDomain = "https://locatemycity.com";

  return {
    title: pageTitle,
    description: metaDescription,
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      type: "website",
      url: `${primaryDomain}/location-from-me/${slug}`,
      images: [`${primaryDomain}/og-images/${slug}.jpg`],
    },
    twitter: {
      card: "summary_large_image",
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
  return str
    .split(" ")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}

// ✅ Enhanced Layout with all schema types
export default function DistanceLayout({ children, params }) {
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || "";
  let destinationName = "";
  let sourceName = "Your Location";

  if (slug && slug.includes("how-far-is-") && slug.includes("-from-me")) {
    destinationName = slug
      .replace("how-far-is-", "")
      .replace("-from-me", "")
      .replace(/-/g, " ");
    sourceName = "Your Current Location";
  }

  const destinationShortName = destinationName.split(",")[0];
  const primaryDomain = "https://locatemycity.com";

  // ✅ FAQ Schema
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

  // ✅ Breadcrumb Schema
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

  // ✅ Place Schema (dynamic coordinates)
  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": capitalize(destinationShortName),
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "",
      "longitude": ""
    },
    "url": `${primaryDomain}/location-from-me/${slug}`
  };

  // ✅ WebPage Schema (main entity is the Place)
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Distance from Your Location to ${capitalize(destinationShortName)}`,
    "description": `Find out how far ${capitalize(destinationShortName)} is from your current location in miles, kilometers, and nautical miles using LocateMyCity’s interactive distance calculator.`,
    "url": `${primaryDomain}/location-from-me/${slug}`,
    "mainEntity": placeJsonLd
  };

  // ✅ SoftwareApplication Schema (Distance Calculator Web App)
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "LocateMyCity Distance Calculator",
  "operatingSystem": "Web",
  "applicationCategory": "TravelApplication",
  "description": "An interactive distance calculator that helps users find how far cities and attractions are from their location in miles, kilometers, and nautical miles.",
  "url": primaryDomain,
  "creator": {
    "@type": "Organization",
    "name": "LocateMyCity",
    "url": primaryDomain
  }
};


  return (
    <>
      {/* ✅ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ✅ Page Content */}
      {children}
    </>
  );
}
