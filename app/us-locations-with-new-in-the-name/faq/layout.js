const baseUrl = "https://locatemycity.com";
const canonical = `${baseUrl}/us-locations-with-new-in-the-name/faq`;
const ogImage = `${baseUrl}/images/og-default.jpg`;

export const metadata = {
  title: "New Cities FAQ | LocateMyCity",
  description:
    "SEO-optimized FAQ about U.S. cities with 'New' in their name — historical background, common names, data updates, state filters, and distance tools.",
  alternates: { canonical },
  openGraph: {
    title: "New Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities with 'New' in their name — historical background, common names, data updates, state filters, and distance tools.",
    url: canonical,
    type: "website",
    siteName: "LocateMyCity",
    locale: "en_US",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "New Cities FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@locatemycity",
    title: "New Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities with 'New' in their name.",
    images: [ogImage],
  },
};

export default function NewFaqLayout({ children }) {
  return children;
}
