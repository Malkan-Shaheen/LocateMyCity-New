const baseUrl = "https://locatemycity.com";
const canonical = `${baseUrl}/cities-with-rock-in-their-name/faq`;
const ogImage = `${baseUrl}/images/og-default.jpg`;

export const metadata = {
  title: "Rock Cities FAQ | LocateMyCity",
  description:
    "Frequently asked questions about U.S. cities with 'Rock' in their name — data updates, map tools, filters, and distance features.",
  alternates: { canonical },
  openGraph: {
    title: "Rock Cities FAQ | LocateMyCity",
    description: "Frequently asked questions about U.S. cities with 'Rock' in their name — data updates, map tools, filters, and distance features.",
    url: canonical,
    type: "website",
    siteName: "LocateMyCity",
    locale: "en_US",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Rock Cities FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@locatemycity",
    title: "Rock Cities FAQ | LocateMyCity",
    description: "Frequently asked questions about U.S. cities with 'Rock' in their name.",
    images: [ogImage],
  },
};

export default function RockFaqLayout({ children }) {
  return children;
}
