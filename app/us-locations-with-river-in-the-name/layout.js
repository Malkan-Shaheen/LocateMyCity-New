import { getNewCities } from '@/actions';

export async function generateMetadata() {
  return {
    title: "U.S. Cities with 'River' in Their Name | LocateMyCity",
    description:
      "Explore a complete list of U.S. cities and towns that include the word 'River' in their name. View locations, states, and interactive map tools.",
    robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    openGraph: {
      title: "U.S. Cities with 'River' in Their Name | LocateMyCity",
      description:
        "Browse every U.S. city or town featuring 'River' in the name. Includes maps, detailed listings, and state-by-state browsing.",
      url: "https://locatemycity.com/us-locations-with-river-in-the-name",
      type: "website",
      siteName: "LocateMyCity",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "U.S. Cities with 'River' in Their Name | LocateMyCity",
      description:
        "Explore a full list of U.S. places that include 'River' in the name, complete with mapping tools and geographic insights.",
    },
    alternates: {
      canonical: "https://locatemycity.com/us-locations-with-river-in-the-name",
    },
    keywords: [
      "cities with river in the name",
      "towns with river",
      "US cities river",
      "places named river",
      "river locations usa",
      "LocateMyCity river dataset",
    ],
  };
}

export default async function NewLocationsLayout({ children }) {
  const allNewLocations = await getNewCities();

  // Create JSON-LD ItemList for SEO
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "U.S. Cities with 'River' in Their Name",
    "description": "List of U.S. cities and towns that include 'River' in the name.",
    "url": "https://locatemycity.com/us-locations-with-river-in-the-name",
    "numberOfItems": allNewLocations.length,
    "itemListElement": allNewLocations.slice(0, 20).map((location, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "City",
        "name": location.name,
        "address": {
          "@type": "PostalAddress",
          "addressRegion": location.state,
          "addressCountry": "US",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": location.lat,
          "longitude": location.lon,
        }
      }
    })),
  };

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
        "name": "Cities with 'River'",
        "item": "https://locatemycity.com/us-locations-with-river-in-the-name"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
