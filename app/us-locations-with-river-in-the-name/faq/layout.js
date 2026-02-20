const baseUrl = "https://locatemycity.com";
const canonical = `${baseUrl}/us-locations-with-river-in-the-name/faq`;
const ogImage = `${baseUrl}/images/og-default.jpg`;

export const metadata = {
  title: "River Cities FAQ | LocateMyCity",
  description: "FAQ about U.S. cities and towns with 'River' in their name.",
  alternates: { canonical },
  openGraph: {
    title: "River Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'River' in their name.",
    url: canonical,
    type: "website",
    siteName: "LocateMyCity",
    locale: "en_US",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "River Cities FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "River Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'River' in their name.",
    images: [ogImage],
  },
};

export default function RiverFaqLayout({ children }) {
  return children;
}
