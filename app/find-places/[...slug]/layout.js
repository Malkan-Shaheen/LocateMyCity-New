// app/places-[radius]-miles-from-[location]/layout.js
export async function generateMetadata({ params }) {
  // Extract parameters from the slug
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  
  let radius = "10";
  let location = "";
  
  // Parse the slug pattern: places-{radius}-miles-from-{location}
  if (slug) {
    const match = slug.match(/places-(\d+)-miles-from-(.+)/);
    if (match) {
      radius = match[1];
      location = decodeURIComponent(match[2]).replace(/-/g, ' ');
    }
  }
  
  // Capitalize the location name properly
  const capitalizedLocation = location
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Create dynamic title and description
  const title = `Cities and towns within ${radius} miles of ${capitalizedLocation} | LocateMyCity`;
  const description = `Discover cities, towns, and parks within ${radius} miles of ${capitalizedLocation}. Find distances, coordinates, and explore nearby locations with interactive maps.`;
  
  return {
    title: title,
    description: description,
    robots: "index, follow",
    keywords: `${capitalizedLocation}, ${radius} miles radius, nearby cities, nearby towns, distance calculator, ${capitalizedLocation} radius`,
    authors: [{ name: "LocateMyCity" }],
    openGraph: {
      title: title,
      description: description,
      type: "website",
      url: `https://locatemycity.com/places-${radius}-miles-from-${location.replace(/\s+/g, '-').toLowerCase()}`,
      siteName: "LocateMyCity",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
    alternates: {
      canonical: `https://locatemycity.com/places-${radius}-miles-from-${location.replace(/\s+/g, '-').toLowerCase()}`,
    },
  };
}

export default function PlacesRadiusLayout({ children, params }) {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  
  let radius = "10";
  let location = "";
  
  if (slug) {
    const match = slug.match(/places-(\d+)-miles-from-(.+)/);
    if (match) {
      radius = match[1];
      location = decodeURIComponent(match[2]).replace(/-/g, ' ');
    }
  }
  
  // Create structured data
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
        "name": "Radius Search",
        "item": "https://locatemycity.com/radius-search"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${radius} miles from ${location}`,
        "item": `https://locatemycity.com/places-${radius}-miles-from-${location.replace(/\s+/g, '-').toLowerCase()}`
      }
    ]
  };

  const webApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Radius Search Tool",
    "url": "https://locatemycity.com/radius-search",
    "operatingSystem": "Web",
    "applicationCategory": "TravelApplication",
    "applicationSubCategory": "Radius search and distance calculator",
    "softwareVersion": "1.0.0",
    "isAccessibleForFree": true,
    "featureList": [
      "Geolocation (HTML5)",
      "OpenStreetMap integration",
      "Radius-based location search",
      "Interactive maps",
      "Distance calculations"
    ],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "category": "free"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LocateMyCity",
      "url": "https://locatemycity.com"
    },
    "potentialAction": {
      "@type": "FindAction",
      "name": "Search locations within radius",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://locatemycity.com/places-{radius}-miles-from-{location}",
        "inLanguage": "en",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "query-input": "required name=location name=radius"
    }
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      
      {/* Page Content */}
      {children}
    </>
  );
}