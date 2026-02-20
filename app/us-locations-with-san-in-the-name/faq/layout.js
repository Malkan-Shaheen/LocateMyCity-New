const baseUrl = "https://locatemycity.com";
const canonical = `${baseUrl}/us-locations-with-san-in-the-name/faq`;
const ogImage = `${baseUrl}/images/og-default.jpg`;

export const metadata = {
  title: "San Cities FAQ | LocateMyCity",
  description: "FAQ about U.S. cities and towns with 'San' in their name.",
  alternates: { canonical },
  openGraph: {
    title: "San Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'San' in their name.",
    url: canonical,
    type: "website",
    siteName: "LocateMyCity",
    locale: "en_US",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "San Cities FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "San Cities FAQ | LocateMyCity",
    description: "FAQ about U.S. cities and towns with 'San' in their name.",
    images: [ogImage],
  },
};

export default function SanFaqLayout({ children }) {
  return children;
}
