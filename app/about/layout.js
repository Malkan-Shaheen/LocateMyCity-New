import { Metadata } from 'next';

const baseUrl = 'https://locatemycity.com';
const ogImage = `${baseUrl}/images/og-default.jpg`;

export const metadata = {
  title: 'About Us | LocateMyCity',
  description: 'LocateMyCity offers fast, accurate, and simple tools to explore the world. Verify city status, calculate distances, discover ghost towns, and search global locations with ease.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${baseUrl}/about`,
  },
  openGraph: {
    title: 'About Us | LocateMyCity',
    description: 'LocateMyCity offers fast, accurate, and simple tools to explore the world. Verify city status, calculate distances, discover ghost towns, and search global locations with ease.',
    url: `${baseUrl}/about`,
    type: 'website',
    siteName: 'LocateMyCity',
    locale: 'en_US',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'LocateMyCity - About Us' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | LocateMyCity',
    description: 'LocateMyCity offers fast, accurate, and simple tools to explore the world. Verify city status, calculate distances, discover ghost towns, and search global locations with ease.',
    images: [ogImage],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
