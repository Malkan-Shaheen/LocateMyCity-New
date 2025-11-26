// app/how-to-get-to/[from]/[to]/SchemaScript.js
'use client';

import { useParams } from 'next/navigation';
import { capitalizeFirst } from '../../../../utils/stringHelpers';

function generateRouteSchema(from, to, sourceName, destinationName) {
  const baseUrl = 'https://locatemycity.com';
  const routeUrl = `${baseUrl}/how-to-get-to-${from}-from-${to}`;
  
  const pageTitle = `How to Get to ${destinationName} from ${sourceName} - Complete Travel Guide 2024`;
  const pageDescription = `🚀 Complete travel guide from ${sourceName} to ${destinationName}. Find flight schedules, ferry timetables, travel times, costs, and best routes.`;
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "LocateMyCity",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`,
          "width": 180,
          "height": 60
        },
        "description": "Comprehensive travel guides and destination information"
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "LocateMyCity",
        "description": "Your ultimate travel companion for destination guides and route planning",
        "publisher": {
          "@id": `${baseUrl}/#organization`
        }
      },
      {
        "@type": "WebPage",
        "@id": `${routeUrl}/#webpage`,
        "url": routeUrl,
        "name": pageTitle,
        "description": pageDescription,
        "isPartOf": {
          "@id": `${baseUrl}/#website`
        },
        "about": {
          "@type": "TouristDestination",
          "name": destinationName
        }
      },
      {
        "@type": "TouristTrip",
        "name": `Travel from ${sourceName} to ${destinationName}`,
        "description": `Complete travel guide with transportation options, schedules, and tips for traveling from ${sourceName} to ${destinationName}`,
        "url": routeUrl,
        "arrivalLocation": {
          "@type": "City",
          "name": destinationName
        },
        "departureLocation": {
          "@type": "City",
          "name": sourceName
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What is the best way to travel from ${sourceName} to ${destinationName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `The best travel option depends on your budget and preferences. Direct flights are usually fastest, while ferries can be more scenic and affordable. Check our detailed guide for current schedules and prices.`
            }
          },
          {
            "@type": "Question",
            "name": `How long does it take to get from ${sourceName} to ${destinationName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Travel time varies by transportation method. Flights typically take 1-2 hours including transfers, while ferries may take 2-4 hours. Exact durations are provided in our transportation schedules.`
            }
          },
          {
            "@type": "Question",
            "name": `What is the distance between ${sourceName} and ${destinationName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `The distance varies by route. Air distance is approximately calculated, while sea routes may differ. Check our route overview for precise distance measurements.`
            }
          }
        ]
      }
    ]
  };
}

export default function SchemaScript() {
  const params = useParams();
  const { from, to } = params;
  
  const sourceName = capitalizeFirst(from);
  const destinationName = capitalizeFirst(to);
  const routeSchema = generateRouteSchema(from, to, sourceName, destinationName);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(routeSchema)
      }}
    />
  );
}