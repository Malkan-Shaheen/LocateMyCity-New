'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const LocationFromMePage = dynamic(
  () => import('./LocationFromMePage'),
  { ssr: true, loading: () => <div className="distance-calc-loading-screen min-h-screen flex items-center justify-center" role="status" aria-live="polite"><div className="distance-calc-loading-content text-center"><div className="distance-calc-spinner spinner border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto" aria-hidden="true" /><p className="distance-calc-loading-text mt-4 text-lg">Loading...</p></div></div> }
);

const LocationFromLocationPage = dynamic(
  () => import('./LocationFromLocationPage'),
  { ssr: true, loading: () => <div className="distance-calc-loading-screen min-h-screen flex items-center justify-center" role="status" aria-live="polite"><div className="distance-calc-loading-content text-center"><div className="distance-calc-spinner spinner border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto" aria-hidden="true" /><p className="distance-calc-loading-text mt-4 text-lg">Loading...</p></div></div> }
);

const HowToGetToPage = dynamic(
  () => import('../how-to-get-to/[from]/[to]/page'),
  { ssr: true, loading: () => <div className="distance-calc-loading-screen min-h-screen flex items-center justify-center" role="status" aria-live="polite"><div className="distance-calc-loading-content text-center"><div className="distance-calc-spinner spinner border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto" aria-hidden="true" /><p className="distance-calc-loading-text mt-4 text-lg">Loading...</p></div></div> }
);

const PlacesRadiusPage = dynamic(
  () => import('../find-places/[...slug]/page'),
  { ssr: true, loading: () => <div className="distance-calc-loading-screen min-h-screen flex items-center justify-center" role="status" aria-live="polite"><div className="distance-calc-loading-content text-center"><div className="distance-calc-spinner spinner border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto" aria-hidden="true" /><p className="distance-calc-loading-text mt-4 text-lg">Loading...</p></div></div> }
);

export default function SlugPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : (Array.isArray(params?.slug) ? params.slug?.[0] : '') ?? '';
  const isFromMe = slug.endsWith('-from-me');
  const isHowToGetTo = slug.startsWith('how-to-get-to-');
  const isPlacesRadius = /^places-\d+-miles-from-/.test(slug);

  if (isFromMe) {
    return <LocationFromMePage />;
  }
  if (isPlacesRadius) {
    return <PlacesRadiusPage />;
  }
  if (isHowToGetTo) {
    return <HowToGetToPage />;
  }
  return <LocationFromLocationPage />;
}
