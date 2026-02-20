const baseUrl = "https://locatemycity.com";
const ogImage = `${baseUrl}/images/color-cities-og.jpg`;

export const metadata = {
  title: "Cities with 'Color' in the Name (USA) | LocateMyCity",
  description:
    "Discover and explore U.S. cities with color names like Orange, Green Bay, White Plains, and more. Interactive map, statistics, and detailed information.",
  robots: "index, follow, max-image-preview:large",
  openGraph: {
    title: "Cities with 'Color' in the Name (USA) | LocateMyCity",
    description: "Discover and explore U.S. cities with color names. Interactive map and detailed information.",
    url: `${baseUrl}/color-cities`,
    type: "website",
    siteName: "LocateMyCity",
    locale: "en_US",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Map of US cities with color names" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cities with 'Color' in the Name (USA) | LocateMyCity",
    description: "Discover and explore U.S. cities with color names. Interactive map and detailed information.",
    images: [ogImage],
  },
  alternates: {
    canonical: `${baseUrl}/color-cities`,
  },
};

export default function ColorCitiesLayout({ children }) {
  return children;
}
