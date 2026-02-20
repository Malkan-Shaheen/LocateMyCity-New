import { notFound } from "next/navigation";

// ───────────────────────────────────────────────
// Helper functions
// ───────────────────────────────────────────────
const toRad = (degrees) => (degrees * Math.PI) / 180;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const kmToMiles = (km) => km * 0.621371;
const kmToNauticalMiles = (km) => km * 0.539957;
const capitalize = (str = "") =>
  str
    ? str
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    : "";

// ───────────────────────────────────────────────
// Metadata Generation (Server-side)
// ───────────────────────────────────────────────
export async function generateMetadata({ params }) {
  // Handle params as Promise (Next.js 16+) or direct object
  const resolvedParams = params instanceof Promise ? await params : params;
  let slug = Array.isArray(resolvedParams?.slug) 
    ? resolvedParams.slug[0] 
    : resolvedParams?.slug || "";
  
  // Debug logging
  if (!slug || slug === "unknown-location-from-unknown-location") {
    console.warn("⚠️ [Metadata] No slug found or slug is unknown:", { slug, params: resolvedParams });
  }

  if (!slug) slug = "unknown-location-from-unknown-location";

  // Parse slug: handle "how-far-is-{location}-from-{location}" or "{location}-from-{location}" formats
  let from = "Unknown Location";
  let to = "Unknown Location";
  
  if (slug.includes("how-far-is-") && slug.includes("-from-")) {
    const parts = slug.replace("how-far-is-", "").split("-from-");
    from = parts[0]?.replace(/-/g, " ").trim() || "Unknown Location";
    to = parts[1]?.replace(/-/g, " ").trim() || "Unknown Location";
  } else if (slug.includes("-from-")) {
    const parts = slug.split("-from-");
    from = parts[0]?.replace(/-/g, " ").trim() || "Unknown Location";
    to = parts[1]?.replace(/-/g, " ").trim() || "Unknown Location";
  } else {
    // If no "-from-" found, treat entire slug as source (fallback)
    from = slug.replace(/-/g, " ").trim() || "Unknown Location";
  }
  
  let fromShort = from.split(",")[0];
  let toShort = to.split(",")[0];

  let km = "0",
    miles = "0",
    nauticalMiles = "0",
    fromLat = "",
    fromLon = "",
    toLat = "",
    toLon = "";

  try {
    // Always try to geocode both locations if they're not unknown
    if (from !== "Unknown Location" && to !== "Unknown Location" && 
        from.trim() !== "" && to.trim() !== "") {
      const base =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://locatemycity.com");

      const [srcRes, destRes] = await Promise.all([
        fetch(`${base}/api/geocode?query=${encodeURIComponent(from)}`, {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`${base}/api/geocode?query=${encodeURIComponent(to)}`, {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        }),
      ]);

      if (srcRes.ok && destRes.ok) {
        const [srcData, destData] = await Promise.all([
          srcRes.json(),
          destRes.json(),
        ]);
        if (srcData?.lat && destData?.lat) {
          fromLat = srcData.lat;
          fromLon = srcData.lon;
          toLat = destData.lat;
          toLon = destData.lon;

          const distKm = calculateDistance(
            parseFloat(srcData.lat),
            parseFloat(srcData.lon),
            parseFloat(destData.lat),
            parseFloat(destData.lon)
          );
          km = distKm.toFixed(1);
          miles = kmToMiles(distKm).toFixed(1);
          nauticalMiles = kmToNauticalMiles(distKm).toFixed(1);
          
          // Update display names with geocoded results if available
          if (srcData.display_name) {
            const srcShort = srcData.display_name.split(",")[0];
            if (srcShort) fromShort = srcShort;
          }
          if (destData.display_name) {
            const destShort = destData.display_name.split(",")[0];
            if (destShort) toShort = destShort;
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ Metadata distance fetch error:", err.message);
  }

  // Ensure we have valid display names (use parsed names if geocoding failed)
  const displayFrom = (fromShort && fromShort !== "Unknown Location") 
    ? fromShort 
    : (from && from !== "Unknown Location" && from.trim() !== "")
      ? capitalize(from)
      : "Unknown Location";
  const displayTo = (toShort && toShort !== "Unknown Location") 
    ? toShort 
    : (to && to !== "Unknown Location" && to.trim() !== "")
      ? capitalize(to)
      : "Unknown Location";
  
  const pageTitle = `How Far is ${capitalize(
    displayFrom
  )} from ${capitalize(displayTo)}?`;
  const metaDescription = `The distance from ${capitalize(
    displayFrom
  )} to ${capitalize(
    displayTo
  )} is approximately ${miles} miles (${km} km / ${nauticalMiles} nautical miles). Use LocateMyCity's Distance Calculator to measure distances, compare routes, and explore nearby attractions.`;

  const base = process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://locatemycity.com');
  const canonical = `${base}/${slug}`;
  const ogImage = `${base}/og-images/${slug}.jpg`;

  return {
    title: pageTitle,
    description: metaDescription,
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: canonical,
      type: "website",
      siteName: "LocateMyCity",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: pageTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: metaDescription,
      images: [ogImage],
    },
    alternates: { canonical },
    other: { fromLat, fromLon, toLat, toLon, km, miles, nauticalMiles },
  };
}

// ───────────────────────────────────────────────
// Layout Component with Schema Integration
// ───────────────────────────────────────────────
export default async function DistanceLayout({ children, params }) {
  // Handle params as Promise (Next.js 16+) or direct object
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = Array.isArray(resolvedParams?.slug) 
    ? resolvedParams.slug[0] 
    : resolvedParams?.slug || "";
  let sourceName = "Location A";
  let destinationName = "Location B";

  if (slug && slug.includes("-from-")) {
    const parts = slug.replace("how-far-is-", "").split("-from-");
    sourceName = parts[0]?.replace(/-/g, " ") || "Location A";
    destinationName = parts[1]?.replace(/-/g, " ") || "Location B";
  }

  const sourceShort = sourceName.split(",")[0];
  const destShort = destinationName.split(",")[0];
  const base = "https://locatemycity.com";
  const fullUrl = `${base}/${slug}`;

  // ─────────────── Breadcrumb Schema ───────────────
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      {
        "@type": "ListItem",
        position: 2,
        name: "Distance Calculator",
        item: `${base}/explore`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${capitalize(sourceShort)} to ${capitalize(destShort)}`,
        item: fullUrl,
      },
    ],
  };

  // ─────────────── Place Schema ───────────────
  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${capitalize(destShort)}`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: typeof window !== "undefined" ? window.toLat : "",
      longitude: typeof window !== "undefined" ? window.toLon : "",
    },
    url: fullUrl,
  };

  // ─────────────── WebPage Schema ───────────────
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `How Far is ${capitalize(sourceShort)} from ${capitalize(destShort)}?`,
    description: `Calculate the distance between ${capitalize(
      sourceShort
    )} and ${capitalize(
      destShort
    )} in miles, kilometers, and nautical miles.`,
    url: fullUrl,
    isPartOf: { "@type": "WebSite", name: "LocateMyCity", url: base },
    mainEntity: placeJsonLd,
  };

  // ─────────────── SoftwareApplication Schema ───────────────
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LocateMyCity Distance Calculator",
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    description:
      "LocateMyCity is a web-based distance calculator that helps users measure how far cities, attractions, and landmarks are from each other in miles, kilometers, and nautical miles.",
    url: base,
    creator: { "@type": "Organization", name: "LocateMyCity", url: base },
  };

  // ❌ REMOVED: FAQ Schema moved to page component to avoid duplicates
  // FAQ schema is now handled in the page component where dynamic FAQ data is available

  // ✅ Output schema to page head
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...placeJsonLd,
            geo: {
              "@type": "GeoCoordinates",
              latitude:
                typeof window !== "undefined" && window.toLat ? window.toLat : "",
              longitude:
                typeof window !== "undefined" && window.toLon ? window.toLon : "",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Visually hidden internal links so distance result pages
          always have crawlable outgoing links without changing
          the visible UI. */}
      <nav
        aria-label="Hidden internal navigation"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <a href="/explore">Explore distance calculators</a>
        <a href="/find-places">Find nearby places</a>
        <a href="/citythemes">Browse city themes</a>
      </nav>

      {/* ❌ REMOVED: FAQ Schema - now handled in page component to avoid duplicates */}
      {children}
    </>
  );
}
