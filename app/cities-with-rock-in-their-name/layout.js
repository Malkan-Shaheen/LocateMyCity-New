// app/cities-with-rock/layout.js
import { getRockCities } from '@/actions';

export async function generateMetadata() {
  return {
    title: "Cities with 'Rock' in Their Name | LocateMyCity",
    description:
      "Discover all U.S. cities and towns that have 'Rock' in their name. Explore detailed listings with states, population insights, and more.",
    robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    openGraph: {
      title: "Cities with 'Rock' in Their Name | LocateMyCity",
      description:
        "Explore a comprehensive list of U.S. cities and towns that include 'Rock' in their name. Get locations, states, and more details.",
      url: "https://locatemycity.com/cities-with-rock",
      type: "website",
      siteName: "LocateMyCity",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "Cities with 'Rock' in Their Name | LocateMyCity",
      description:
        "Browse all U.S. cities and towns featuring 'Rock' in their name. Find locations, states, and extra details.",
    },
    alternates: {
      canonical: "https://locatemycity.com/cities-with-rock",
    },
    keywords: [
      "cities with rock in name",
      "towns with rock",
      "US cities rock",
      "places named rock",
      "LocateMyCity rock cities",
    ],
  };
}

export default async function RockLayout({ children }) {
  const allRockyLocations = await getRockCities();

  // Structured data
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "US Cities with 'Rock' in the Name",
    "description": "A comprehensive list of United States cities and towns that include the word 'Rock' in their name.",
    "url": "https://locatemycity.com/cities-with-rock",
    "numberOfItems": allRockyLocations.length,
    "itemListElement": allRockyLocations.slice(0, 20).map((location, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "City",
        "name": location.name,
        "address": {
          "@type": "PostalAddress",
          "addressRegion": location.state,
          "addressCountry": "US"
        }
      }
    }))
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
        "name": "Cities with Rock",
        "item": "https://locatemycity.com/cities-with-rock"
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
