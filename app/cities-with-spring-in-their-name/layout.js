// app/cities-with-spring/layout.js
import { getSpringCities } from '@/actions';

export async function generateMetadata() {
  return {
    title: "Cities with 'Spring' in Their Name | LocateMyCity",
    description:
      "Discover all U.S. cities and towns that have 'Spring' in their name. Explore detailed listings with states, population insights, and more.",
    robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    openGraph: {
      title: "Cities with 'Spring' in Their Name | LocateMyCity",
      description:
        "Explore a comprehensive list of U.S. cities and towns that include 'Spring' in their name. Get locations, states, and more details.",
      url: "https://locatemycity.com/cities-with-spring",
      type: "website",
      siteName: "LocateMyCity",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "Cities with 'Spring' in Their Name | LocateMyCity",
      description:
        "Browse all U.S. cities and towns featuring 'Spring' in their name. Find locations, states, and extra details.",
    },
    alternates: {
      canonical: "https://locatemycity.com/cities-with-spring",
    },
    keywords: [
      "cities with spring in name",
      "towns with spring",
      "US cities spring",
      "places named spring",
      "LocateMyCity spring cities",
    ],
  };
}

export default async function SpringLayout({ children }) {
  const allSprings = await getSpringCities();

  // Structured data
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "US Cities with 'Spring' in the Name",
    "description":
      "A comprehensive list of United States cities and towns that include the word 'Spring' in their name.",
    "url": "https://locatemycity.com/cities-with-spring",
    "numberOfItems": allSprings.length,
    "itemListElement": allSprings.slice(0, 20).map((location, index) => ({
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
        "name": "Cities with Spring",
        "item": "https://locatemycity.com/cities-with-spring"
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
