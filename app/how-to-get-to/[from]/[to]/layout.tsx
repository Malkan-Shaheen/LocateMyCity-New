// app/how-to-get-to/[from]/[to]/layout.js (Minimal Working Version)
export async function generateMetadata({ params }) {
  const { from, to } = params;
  
  const sourceName = from.charAt(0).toUpperCase() + from.slice(1);
  const destinationName = to.charAt(0).toUpperCase() + to.slice(1);
  
  const title = `How to Get to ${destinationName} from ${sourceName} - Complete Travel Guide 2024`;
  const description = `Complete travel guide from ${sourceName} to ${destinationName}. Find flight schedules, ferry timetables, travel times, costs, and best routes.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}

export default function TravelRouteLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Basic schema that works for all pages */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "LocateMyCity",
              "url": "https://locatemycity.com"
            })
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}