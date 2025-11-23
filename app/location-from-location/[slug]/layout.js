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
  let slug = params?.slug || "";
  if (!slug) slug = "unknown-location-from-unknown-location";

  const parts = slug.split("-from-");
  const from = parts[0]?.replace(/-/g, " ") || "Unknown Location";
  const to = parts[1]?.replace(/-/g, " ") || "Unknown Location";
  const fromShort = from.split(",")[0];
  const toShort = to.split(",")[0];

  let km = "0",
    miles = "0",
    nauticalMiles = "0",
    fromLat = "",
    fromLon = "",
    toLat = "",
    toLon = "";

  try {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://locate-my-city-blue.vercel.app";

    const [srcRes, destRes] = await Promise.all([
      fetch(`${base}/api/geocode?query=${encodeURIComponent(from)}`, {
        cache: "no-store",
      }),
      fetch(`${base}/api/geocode?query=${encodeURIComponent(to)}`, {
        cache: "no-store",
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
      }
    }
  } catch (err) {
    console.error("❌ Metadata distance fetch error:", err.message);
  }

  const pageTitle = `How Far is ${capitalize(
    fromShort
  )} from ${capitalize(toShort)}? | LocateMyCity`;
  const metaDescription = `The distance from ${capitalize(
    fromShort
  )} to ${capitalize(
    toShort
  )} is approximately ${miles} miles (${km} km / ${nauticalMiles} nautical miles). Use LocateMyCity’s Distance Calculator to measure distances, compare routes, and explore nearby attractions.`;

  const canonical = `https://locatemycity.com/location-from-location/${slug}`;
  const ogImage = `https://locatemycity.com/og-images/${slug}.jpg`;

  return {
    title: pageTitle,
    description: metaDescription,
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: canonical,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: metaDescription,
    },
    alternates: { canonical },
    other: { fromLat, fromLon, toLat, toLon, km, miles, nauticalMiles },
  };
}

// ───────────────────────────────────────────────
// Layout Component with Schema Integration
// ───────────────────────────────────────────────
export default function DistanceLayout({ children, params }) {
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || "";
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
  const fullUrl = `${base}/location-from-location/${slug}`;

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
        item: `${base}/location-from-location`,
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

  // ─────────────── FAQ Schema ───────────────
  const distanceMiles = 0,
    distanceKm = 0,
    flightTimeHours = 0,
    drivingTimeHours = 0;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How far is ${capitalize(sourceShort)} from ${capitalize(
          destShort
        )}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${capitalize(sourceShort)} is approximately ${distanceMiles.toFixed(
            1
          )} miles (${distanceKm.toFixed(1)} km) from ${capitalize(
            destShort
          )}, with an estimated flight time of around ${flightTimeHours.toFixed(
            1
          )} hours.`,
        },
      },
      {
        "@type": "Question",
        name: `How long does it take to drive from ${capitalize(
          sourceShort
        )} to ${capitalize(destShort)}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Driving from ${capitalize(sourceShort)} to ${capitalize(
            destShort
          )} would take about ${
            drivingTimeHours
              ? drivingTimeHours.toFixed(1)
              : (distanceMiles / 60).toFixed(1)
          } hours, assuming average highway speeds and normal traffic conditions.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I view the route between ${capitalize(
          sourceShort
        )} and ${capitalize(destShort)} on a map?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. You can view the full route between ${capitalize(
            sourceShort
          )} and ${capitalize(
            destShort
          )} directly on the interactive map above, showing both driving and flight paths for easy trip planning.`,
        },
      },
      {
        "@type": "Question",
        name: "What units of measurement are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "You can view distances in miles, kilometers, and nautical miles with real-time conversion.",
        },
      },
      {
        "@type": "Question",
        name: "Can I calculate distances between any two locations worldwide?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. The calculator works globally for cities, addresses, and coordinates that can be geocoded.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate are the distance results?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "They are mathematically precise for straight-line distances. Actual travel routes may vary by path.",
        },
      },
    ],
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
