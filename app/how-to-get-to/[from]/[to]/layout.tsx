// app/how-to-get-to/[from]/[to]/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";

type Props = {
  params: Promise<{ from: string; to: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // ✅ AWAIT THE PARAMS
  const { from, to } = await params;
  
  // ✅ DEBUG LOGS
  console.log('🔍 [LAYOUT DEBUG] Layout params:', { from, to });
  console.log('🔍 [LAYOUT DEBUG] Current URL:', typeof window !== 'undefined' ? window.location.href : 'Server side');
  
  // Capitalize for display
  const fromCapitalized = from.charAt(0).toUpperCase() + from.slice(1);
  const toCapitalized = to.charAt(0).toUpperCase() + to.slice(1);
  
  // ✅ TEMPORARILY REMOVE VALIDATION TO SEE WHAT'S HAPPENING
  // if (from.toLowerCase() === to.toLowerCase()) {
  //   console.log('❌ [LAYOUT DEBUG] Invalid route - from and to are the same:', { from, to });
  //   return {
  //     title: "Invalid Route | LocateMyCity",
  //     description: "Origin and destination cannot be the same location.",
  //   };
  // }
  
  const pageUrl = `https://www.locatemycity.com/how-to-get-to-${from}-from-${to}`;
  
  console.log('✅ [LAYOUT DEBUG] Generating metadata for:', { fromCapitalized, toCapitalized });
  
  return {
    title: `How to Get to ${fromCapitalized} from ${toCapitalized} `,
    description: `Discover the best ways to travel from ${fromCapitalized} to ${toCapitalized}. Compare flights, ferries, trains, and other transportation options with travel times and insider tips.`,
    keywords: [
      `${toCapitalized} travel`,
      `${fromCapitalized} to ${toCapitalized}`,
      `how to get to ${toCapitalized}`,
      `${fromCapitalized} travel guide`,
      `travel from ${fromCapitalized}`,
    ],
    openGraph: {
      title: `How to Get to ${toCapitalized} from ${fromCapitalized} `,
      description: `Complete travel guide from ${fromCapitalized} to ${toCapitalized}. Compare all transportation options, costs, and travel times.`,
      url: pageUrl,
      siteName: "LocateMyCity",
      images: [
        {
          url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2070&q=80",
          width: 1200,
          height: 630,
          alt: `Travel from ${fromCapitalized} to ${toCapitalized}`,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `How to Get to ${toCapitalized} from ${fromCapitalized}`,
      description: `Travel guide: Best ways to get from ${fromCapitalized} to ${toCapitalized}. Compare flights, ferries, and more.`,
      images: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2070&q=80",
      ],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* ✅ Generic Travel Schema */}
        <Script id="json-ld-travel" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAction",
            name: "Travel Guide",
            description: "Comprehensive travel guide with transportation options, routes, and travel tips",
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2070&q=80",
            url: "https://www.locatemycity.com",
            provider: {
              "@type": "Organization",
              name: "LocateMyCity",
              url: "https://www.locatemycity.com",
            },
          })}
        </Script>

        {/* ✅ Generic FAQ Schema */}
        <Script id="json-ld-faq" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What transportation options are available?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Various transportation options including flights, ferries, trains, buses, and private charters are available depending on the specific route.",
                },
              },
              {
                "@type": "Question",
                name: "How can I find the best travel times?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Check our comprehensive travel guides for up-to-date schedules, seasonal recommendations, and real-time travel information.",
                },
              },
            ],
          })}
        </Script>

        {/* ✅ Breadcrumb Schema */}
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
                name: "Travel Guides",
                item: "https://www.locatemycity.com/how-to-get-to",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Route Guide",
                item: "https://www.locatemycity.com/how-to-get-to",
              },
            ],
          })}
        </Script>
      </body>
    </html>
  );
}