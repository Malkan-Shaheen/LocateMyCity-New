const baseUrl = "https://locatemycity.com";
const canonical = `${baseUrl}/us-locations-with-port-in-the-name/faq`;
const ogImage = `${baseUrl}/images/og-default.jpg`;

export const metadata = {
  title: "Port Cities FAQ | LocateMyCity",
  description: "FAQ about U.S. cities and towns with 'Port' in their name.",
  alternates: { canonical },
  openGraph: {
    title: "Port Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'Port' in their name.",
    url: canonical,
    type: "website",
    siteName: "LocateMyCity",
    locale: "en_US",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Port Cities FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Port Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'Port' in their name.",
    images: [ogImage],
  },
};

export default function PortFaqLayout({ children }) {
  return children;
}
