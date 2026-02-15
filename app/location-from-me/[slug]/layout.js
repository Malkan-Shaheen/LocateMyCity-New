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
  // Handle params as Promise (Next.js 16+) or direct object
  const resolvedParams = params instanceof Promise ? await params : params;
  let slug = Array.isArray(resolvedParams?.slug) 
    ? resolvedParams.slug[0] 
    : resolvedParams?.slug || "";

  // Debug logging (remove in production if needed)
  if (!slug || slug === "unknown-location-from-unknown-location") {
    console.warn("⚠️ [Metadata] No slug found or slug is unknown:", { slug, params: resolvedParams });
  }

  if (!slug) slug = "unknown-location-from-unknown-location";

  // Parse slug: "how-far-is-{location}-from-me" or similar formats
  let from = "Unknown Location";
  let to = "Unknown Location";
  
  if (slug.includes("how-far-is-") && slug.includes("-from-")) {
    const parts = slug.replace("how-far-is-", "").split("-from-");
    from = parts[0]?.replace(/-/g, " ").trim() || "Unknown Location";
    to = parts[1]?.replace(/-/g, " ").trim() || "Unknown Location";
  } else if (slug.includes("-from-")) {
    // Fallback: handle other formats
    const parts = slug.split("-from-");
    from = parts[0]?.replace(/-/g, " ").trim() || "Unknown Location";
    to = parts[1]?.replace(/-/g, " ").trim() || "Unknown Location";
  } else {
    // If no "-from-" found, treat entire slug as destination
    from = slug.replace(/-/g, " ").trim() || "Unknown Location";
  }

  if (to === "me" || to === "your location") to = "Your Location";

  let miles = null;
  let km = null;
  let destinationDetails = null;
  let fullDestinationName = from;

  try {
    // Always try to geocode the destination (from) if it's not unknown
    // This works for both "location-from-me" and "location-from-location" pages
    if (from !== "Unknown Location" && from.trim() !== "") {
      // Use absolute URL for server-side fetch
      // In production on Vercel, use the VERCEL_URL or fallback to production domain
      let base = process.env.NEXT_PUBLIC_SITE_URL;
      
      if (!base) {
        if (process.env.VERCEL_URL) {
          base = `https://${process.env.VERCEL_URL}`;
        } else if (process.env.NODE_ENV === "development") {
          base = "http://localhost:3000";
        } else {
          base = "https://locatemycity.com";
        }
      }
      
      try {
        const apiUrl = `${base}/api/geocode?query=${encodeURIComponent(from)}`;
        // Create timeout controller for fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const destResponse = await fetch(apiUrl, {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (destResponse.ok) {
          const destData = await destResponse.json();
          if (destData && destData.lat && destData.lon) {
            destinationDetails = destData;
            fullDestinationName = destData.display_name || from;

            // Calculate distance from Toronto reference point (optional, for metadata)
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
      } catch (fetchError) {
        // Silently fail - metadata generation shouldn't break the page
        // Handle timeout and other fetch errors gracefully
        if (fetchError.name === 'AbortError') {
          console.warn("⚠️ [Metadata] Geocoding timeout (non-critical)");
        } else {
          console.warn("⚠️ [Metadata] Geocoding failed (non-critical):", fetchError.message);
        }
      }
    }
  } catch (error) {
    // Don't throw - just log and continue with default values
    console.error("💥 Error in metadata generation:", error.message);
  }

  // Ensure we always have a valid display name
  const shortDestinationName = fullDestinationName.split(",")[0];
  // Use the geocoded name if available, otherwise use the parsed slug name (capitalized)
  // Only fall back to "Unknown Location" if both are unavailable
  const displayDestinationName = 
    (shortDestinationName && shortDestinationName !== "Unknown Location") 
      ? shortDestinationName 
      : (from && from !== "Unknown Location" && from.trim() !== "")
        ? capitalize(from)
        : "Unknown Location";

  let locationContext = "";
  if (destinationDetails?.address) {
    const addr = destinationDetails.address;
    if (addr.state) locationContext = ` in ${addr.state}`;
    if (addr.country && addr.country !== "Canada")
      locationContext += `, ${addr.country}`;
  }

  const pageTitle = `How Far is ${capitalize(
    displayDestinationName
  )} from ${capitalize(to)}? `;

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
      url: `${primaryDomain}/${slug}`,
      images: [`${primaryDomain}/og-images/${slug}.jpg`],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: metaDescription,
    },
    alternates: {
      canonical: `${primaryDomain}/${slug}`,
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
export default async function DistanceLayout({ children, params }) {
  // Handle params as Promise (Next.js 16+) or direct object
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = Array.isArray(resolvedParams?.slug) 
    ? resolvedParams.slug[0] 
    : resolvedParams?.slug || "";
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

  // ❌ REMOVED: FAQ Schema moved to page component to avoid duplicates
  // FAQ schema is now handled in the page component where dynamic FAQ data is available

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
        "item": `${primaryDomain}/${slug}`
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
    "url": `${primaryDomain}/${slug}`
  };

  // ✅ WebPage Schema (main entity is the Place)
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Distance from Your Location to ${capitalize(destinationShortName)}`,
    "description": `Find out how far ${capitalize(destinationShortName)} is from your current location in miles, kilometers, and nautical miles using LocateMyCity’s interactive distance calculator.`,
    "url": `${primaryDomain}/${slug}`,
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
      {/* ❌ REMOVED: FAQ Schema - now handled in page component to avoid duplicates */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ✅ Page Content */}
      {children}
    </>
  );
}
