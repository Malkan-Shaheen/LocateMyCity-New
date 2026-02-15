import Head from 'next/head';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Cards from '../components/Cards';
import Footer from '../components/Footer';
import AdUnit from '../components/AdUnit'; // ✅ Ad component

export default function Home() {
  return (
    <>
      <Head>
        <title>Locate My City</title>
        <meta charSet="UTF-8" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Calculate precise distances between locations, explore cities worldwide, and discover unique geographical features with LocateMyCity."
        />
        <link rel="icon" type="image/png" href="/images/cityfav.png" />

        {/* Fonts */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@700&display=swap"
          rel="stylesheet"
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "LocateMyCity - Distance Calculator & Location Explorer",
              "url": "https://www.locatemycity.com",
              "description":
                "Calculate distances between locations, explore cities, and discover geographic insights.",
              "applicationCategory": "TravelApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "LocateMyCity"
              }
            })
          }}
        />
      </Head>

      <main>
        <Header />
        <Hero />

        {/* =========================
            HOMEPAGE AD (TOP ONLY)
            ========================= */}
        <AdUnit slot="3866531892" />

        <Cards />
        <Footer />
      </main>
    </>
  );
}
