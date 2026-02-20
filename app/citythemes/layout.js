const baseUrl = 'https://locatemycity.com';
const ogImage = `${baseUrl}/images/og-default.jpg`;

export async function generateMetadata() {
  return {
    title: 'City Themes | LocateMyCity',
    description:
      'Explore unique collections of U.S. cities organized by themes. Discover locations with specific words in their names - beaches, forts, lakes, ports, and more.',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    openGraph: {
      title: 'City Themes | LocateMyCity',
      description:
        'Browse themed collections of U.S. cities - from beach towns to historic forts. Interactive maps and detailed location information for each theme.',
      url: `${baseUrl}/citythemes`,
      type: 'website',
      siteName: 'LocateMyCity',
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'LocateMyCity City Themes' }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@locatemycity',
      title: 'City Themes | LocateMyCity',
      description:
        'Explore themed collections of U.S. cities organized by naming patterns. Discover beaches, forts, lakes, ports, and more.',
      images: [ogImage],
    },
    alternates: {
      canonical: `${baseUrl}/citythemes`,
    },
    keywords: [
      'city themes',
      'themed cities',
      'US city collections',
      'beach cities',
      'fort cities',
      'lake cities',
      'port cities',
      'river cities',
      'LocateMyCity themes',
    ],
  };
}

export default function CityThemesLayout({ children }) {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://locatemycity.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'City Themes',
        item: 'https://locatemycity.com/citythemes',
      },
    ],
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'City Themes',
    description: 'A collection of themed U.S. city directories organized by naming patterns',
    url: 'https://locatemycity.com/citythemes',
    about: {
      '@type': 'Thing',
      name: 'U.S. Cities by Theme',
      description: 'Collections of cities organized by common words in their names',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {children}
    </>
  );
}

