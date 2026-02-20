import { Metadata } from 'next';

export const metadata = {
  title: 'About Us | LocateMyCity',
  description: 'LocateMyCity offers fast, accurate, and simple tools to explore the world. Verify city status, calculate distances, discover ghost towns, and search global locations with ease.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://locatemycity.com/about',
  },
};

export default function AboutLayout({ children }) {
  return children;
}
