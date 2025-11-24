// app/location-from-location/how-to-get-to-eleuthera-from-nassau/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "How to Get to Eleuthera from Nassau | LocateMyCity",
  description:
    "Discover the best ways to travel from Nassau to Eleuthera — by plane, ferry, or private charter. Includes weather updates, travel times, and insider tips for a smooth trip.",
  keywords: [
    "Eleuthera travel",
    "Nassau to Eleuthera",
    "Bahamas ferry",
    "Bahamas flight routes",
    "how to get to Eleuthera",
    "Nassau travel guide",
  ],
  openGraph: {
    title: "How to Get to Eleuthera from Nassau | LocateMyCity",
    description:
      "Learn how to travel from Nassau to Eleuthera — see flight times, ferry routes, and local tips for your Bahamas journey.",
    url: "https://www.locatemycity.com/location-from-location/how-to-get-to-eleuthera-from-nassau",
    siteName: "LocateMyCity",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2070&q=80",
        width: 1200,
        height: 630,
        alt: "Beautiful aerial view of Eleuthera Island, Bahamas",
      },
    ],
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Get to Eleuthera from Nassau",
    description:
      "Explore flights, ferries, and tips for traveling from Nassau to Eleuthera with real-time weather and travel insights.",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2070&q=80",
    ],
  },
  alternates: {
    canonical:
      "https://www.locatemycity.com/location-from-location/how-to-get-to-eleuthera-from-nassau",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* ✅ Main TravelAction Schema */}
        <Script id="json-ld-travel" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAction",
            name: "How to Get to Eleuthera from Nassau",
            description:
              "Travel guide explaining different ways to reach Eleuthera from Nassau, including plane, ferry, and private options with weather insights.",
            image:
              "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2070&q=80",
            url: "https://www.locatemycity.com/location-from-location/how-to-get-to-eleuthera-from-nassau",
            provider: {
              "@type": "Organization",
              name: "LocateMyCity",
              url: "https://www.locatemycity.com",
              logo: "https://www.locatemycity.com/logo.png",
            },
            sameAs: [
              "https://facebook.com/LocateMyCity",
              "https://instagram.com/LocateMyCity",
              "https://twitter.com/LocateMyCity",
            ],
          })}
        </Script>

        {/* ✅ FAQPage Schema for Rich Results */}
        <Script id="json-ld-faq" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is the fastest way to get from Nassau to Eleuthera?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The fastest way is by a 20-minute domestic flight from Nassau to North Eleuthera Airport.",
                },
              },
              {
                "@type": "Question",
                name: "Is there a ferry from Nassau to Eleuthera?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, Bahamas Ferries operates a service several times a week between Nassau and Harbour Island (Eleuthera).",
                },
              },
              {
                "@type": "Question",
                name: "Can I travel by private charter?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, private charters are available and can provide flexible schedules for a more comfortable experience.",
                },
              },
            ],
          })}
        </Script>

        {/* ✅ Breadcrumb Schema for Google Snippets */}
        <Script id="json-ld-breadcrumb" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.locatemycity.com/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Locations",
                item: "https://www.locatemycity.com/location-from-location",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "How to Get to Eleuthera from Nassau",
                item:
                  "https://www.locatemycity.com/location-from-location/how-to-get-to-eleuthera-from-nassau",
              },
            ],
          })}
        </Script>
      </body>
    </html>
  );
}
