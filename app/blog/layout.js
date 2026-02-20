import { Metadata } from 'next';

const baseUrl = 'https://locatemycity.com';
const ogImage = `${baseUrl}/images/og-default.jpg`;

export const metadata = {
  title: 'Travel Guides - How to Get There | LocateMyCity',
  description: 'Comprehensive travel guides on how to reach different islands and destinations. Find the best routes, transportation options, and travel tips.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    title: 'Travel Guides - How to Get There | LocateMyCity',
    description: 'Comprehensive travel guides on how to reach different islands and destinations. Find the best routes, transportation options, and travel tips.',
    url: `${baseUrl}/blog`,
    type: 'website',
    siteName: 'LocateMyCity',
    locale: 'en_US',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'LocateMyCity Travel Guides' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@locatemycity',
    title: 'Travel Guides - How to Get There | LocateMyCity',
    description: 'Comprehensive travel guides on how to reach different islands and destinations. Find the best routes, transportation options, and travel tips.',
    images: [ogImage],
  },
};

export default function BlogLayout({ children }) {
  return children;
}
