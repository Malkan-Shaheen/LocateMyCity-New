// app/blog/layout.js
export const metadata = {
  title: 'Travel Guides - How to Get There ',
  description: 'Comprehensive travel guides on how to reach different islands and destinations. Find the best routes, transportation options, and travel tips for your perfect island getaway.',
  keywords: 'travel guides, transportation, islands, routes, travel tips, destinations, how to get there',
  authors: [{ name: 'LocateMyCity' }],
  creator: 'LocateMyCity',
  publisher: 'LocateMyCity',
  robots: 'index, follow',
  openGraph: {
    title: 'Travel Guides - How to Get There ',
    description: 'Comprehensive travel guides on how to reach different islands and destinations. Find the best routes and transportation options.',
    url: 'https://locatemycity.com/blog',
    siteName: 'LocateMyCity',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LocateMyCity Travel Guides',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Guides - How to Get There | LocateMyCity',
    description: 'Comprehensive travel guides on how to reach different islands and destinations.',
    images: ['/twitter-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#3B82F6',
  category: 'travel',
}

export default function BlogLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Travel Guides - How to Get There",
              "description": "Comprehensive travel guides on how to reach different islands and destinations",
              "url": "https://locatemycity.com/blog",
              "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": 10, // This should be dynamic based on your actual data
                "itemListOrder": "https://schema.org/ItemListUnordered",
                "name": "Travel Guides Collection"
              },
              "publisher": {
                "@type": "Organization",
                "name": "LocateMyCity",
                "url": "https://locatemycity.com"
              },
              "inLanguage": "en-US",
              "isFamilyFriendly": true
            })
          }}
        />
        
        {/* Additional schema for breadcrumbs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
                  "name": "Travel Guides",
                  "item": "https://locatemycity.com/blog"
                }
              ]
            })
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}