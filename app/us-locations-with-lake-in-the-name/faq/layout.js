const baseUrl = "https://locatemycity.com";
const canonical = `${baseUrl}/us-locations-with-lake-in-the-name/faq`;
const ogImage = `${baseUrl}/images/og-default.jpg`;

export const metadata = {
  title: "Lake Cities FAQ | LocateMyCity",
  description: "FAQ about U.S. cities and towns with 'Lake' in their name.",
  alternates: { canonical },
  openGraph: {
    title: "Lake Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'Lake' in their name.",
    url: canonical,
    type: "website",
    siteName: "LocateMyCity",
    locale: "en_US",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Lake Cities FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@locatemycity",
    title: "Lake Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'Lake' in their name.",
    images: [ogImage],
  },
};

export default function LakeFaqLayout({ children }) {
  return children;
}
