import { Metadata } from 'next';

export const metadata = {
  title: 'Travel Guides - How to Get There | LocateMyCity',
  description: 'Comprehensive travel guides on how to reach different islands and destinations. Find the best routes, transportation options, and travel tips.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://locatemycity.com/blog',
  },
};

export default function BlogLayout({ children }) {
  return children;
}
