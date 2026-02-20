const baseUrl = "https://locatemycity.com";
const canonical = `${baseUrl}/us-locations-with-fort-in-the-name/faq`;
const ogImage = `${baseUrl}/images/og-default.jpg`;

export const metadata = {
  title: "Fort Cities FAQ | LocateMyCity",
  description: "FAQ about U.S. cities and towns with 'Fort' in their name.",
  alternates: { canonical },
  openGraph: {
    title: "Fort Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'Fort' in their name.",
    url: canonical,
    type: "website",
    siteName: "LocateMyCity",
    locale: "en_US",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Fort Cities FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fort Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'Fort' in their name.",
    images: [ogImage],
  },
};

export default function FortFaqLayout({ children }) {
  return children;
}
