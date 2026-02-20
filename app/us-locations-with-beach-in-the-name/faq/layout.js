const baseUrl = "https://locatemycity.com";
const canonical = `${baseUrl}/us-locations-with-beach-in-the-name/faq`;
const ogImage = `${baseUrl}/images/og-default.jpg`;

export const metadata = {
  title: "Beach Cities FAQ | LocateMyCity",
  description: "FAQ about U.S. cities and towns with 'Beach' in their name.",
  alternates: { canonical },
  openGraph: {
    title: "Beach Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'Beach' in their name.",
    url: canonical,
    type: "website",
    siteName: "LocateMyCity",
    locale: "en_US",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Beach Cities FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beach Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'Beach' in their name.",
    images: [ogImage],
  },
};

export default function BeachFaqLayout({ children }) {
  return children;
}
