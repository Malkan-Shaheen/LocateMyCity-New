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
    const mod = await import('../location-from-me/[slug]/layout');
    return mod.generateMetadata({ params });
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
    const LayoutFromMe = (await import('../location-from-me/[slug]/layout')).default;
    return <LayoutFromMe params={params}>{children}</LayoutFromMe>;
  }
  const LayoutFromLocation = (await import('../location-from-location/[slug]/layout')).default;
  return <LayoutFromLocation params={params}>{children}</LayoutFromLocation>;
}
