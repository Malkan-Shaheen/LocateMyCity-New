/**
 * Single [slug] layout at app level.
 * Delegates to location-from-me or location-from-location layout based on slug.
 */

export async function generateMetadata({ params }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = Array.isArray(resolvedParams?.slug) ? resolvedParams.slug[0] : resolvedParams?.slug || '';
  if (/^places-\d+-miles-from-/.test(slug)) {
    const mod = await import('../find-places/[...slug]/layout');
    return mod.generateMetadata({
      params: { slug },
    });
  }
  if (slug.startsWith('how-to-get-to-')) {
    const match = slug.match(/^how-to-get-to-(.+)-from-(.+)$/);
    if (match) {
      const [, from, to] = match;
      const mod = await import('../how-to-get-to/[from]/[to]/layout');
      return mod.generateMetadata({
        params: Promise.resolve({ from, to }),
      });
    }
  }
  if (slug.endsWith('-from-me')) {
    // No longer using location-from-me/[slug]/layout - routes are handled directly
    // Return basic metadata for from-me pages
    const destination = slug.replace('how-far-is-', '').replace('-from-me', '').replace(/-/g, ' ');
    const base = process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://locatemycity.com');
    const canonical = `${base}/${slug}`;
    const title = `How Far is ${destination} from Me? | LocateMyCity`;
    const description = `Calculate the exact distance from your current location to ${destination}. Get precise coordinates, travel information, and detailed geographical data.`;
    const ogImage = `${base}/og-images/${slug}.jpg`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'website',
        siteName: 'LocateMyCity',
        locale: 'en_US',
        images: [{ url: ogImage, width: 1200, height: 630, alt: `Distance to ${destination} from your location` }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    };
  }
  const mod = await import('../location-from-location/[slug]/layout');
  return mod.generateMetadata({ params });
}

export default async function SlugLayout({ children, params }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = Array.isArray(resolvedParams?.slug) ? resolvedParams.slug[0] : resolvedParams?.slug || '';
  if (/^places-\d+-miles-from-/.test(slug)) {
    const PlacesRadiusLayout = (await import('../find-places/[...slug]/layout')).default;
    return <PlacesRadiusLayout params={{ slug }}>{children}</PlacesRadiusLayout>;
  }
  if (slug.startsWith('how-to-get-to-')) {
    return <>{children}</>;
  }
  if (slug.endsWith('-from-me')) {
    // From‑me distance pages: add a tiny, hidden nav so crawlers
    // see outgoing internal links, but keep the visual UI unchanged.
    return (
      <>
        <nav
          aria-label="Hidden internal navigation"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          <a href="/explore">Explore distance calculators</a>
          <a href="/find-places">Find nearby places</a>
          <a href="/citythemes">Browse city themes</a>
        </nav>
        {children}
      </>
    );
  }
  const LayoutFromLocation = (await import('../location-from-location/[slug]/layout')).default;
  return <LayoutFromLocation params={params}>{children}</LayoutFromLocation>;
}
