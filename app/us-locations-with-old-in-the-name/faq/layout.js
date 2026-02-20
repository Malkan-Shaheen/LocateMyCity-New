const baseUrl = "https://locatemycity.com";
const canonical = `${baseUrl}/us-locations-with-old-in-the-name/faq`;
const ogImage = `${baseUrl}/images/og-default.jpg`;

export const metadata = {
  title: "Old Cities FAQ | LocateMyCity",
  description: "FAQ about U.S. cities and towns with 'Old' in their name.",
  alternates: { canonical },
  openGraph: {
    title: "Old Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'Old' in their name.",
    url: canonical,
    type: "website",
    siteName: "LocateMyCity",
    locale: "en_US",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Old Cities FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Old Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'Old' in their name.",
    images: [ogImage],
  },
};

export default function OldFaqLayout({ children }) {
  return children;
}
