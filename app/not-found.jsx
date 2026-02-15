'use client';
import Link from 'next/link';
import Head from 'next/head';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found - LocateMyCity</title>
        <meta name="description" content="The page or location you're looking for couldn't be found. Use our tools to search cities, find nearby places, or explore themed city lists." />
        <meta name="robots" content="noindex, follow" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </Head>
      <main style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '700px',
          width: '100%',
          flex: 1,
          justifyContent: 'center',
          gap: '12px'
        }}>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 8px 0', color: '#158bf5' }}>
            404
          </h1>
          
          <p style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: '#333' }}>
            We couldn't find that location or page.
          </p>
          
          <p style={{ fontSize: '0.95rem', margin: '0 0 16px 0', color: '#666' }}>
            The link was typed incorrectly, the page has moved, or the location doesn't exist in our database.
          </p>
          
          <p style={{ fontSize: '0.95rem', margin: '0 0 16px 0', color: '#158bf5' }}>
              Don't worry — you're still in the right place.
            </p>

          <p style={{ fontSize: '0.95rem', margin: '0 0 8px 0', color: '#666', fontWeight: '500' }}>
            What you can do next
          </p>
          
          <p style={{ fontSize: '1.1rem', margin: '0 0 8px 0', color: '#666', fontWeight: 'bold' }}>
            Start fresh with our tools:
          </p>

          <div style={{ fontSize: '0.9rem', margin: '0 0 0 0', color: '#666', lineHeight: '1.6', textAlign: 'left' }}>
            <p style={{ margin: '4px 0' }}>• <Link href="/find-places" style={{ color: '#158bf5', textDecoration: 'underline' }}>Search a city or town</Link> to see distance, location details, or nearby places</p>
            <p style={{ margin: '4px 0' }}>• <Link href="/find-places" style={{ color: '#158bf5', textDecoration: 'underline' }}>Find cities within a radius</Link> (50, 100, 500, or 1000 miles)</p>
            <p style={{ margin: '4px 0' }}>• <Link href="/citythemes" style={{ color: '#158bf5', textDecoration: 'underline' }}>s themed city </Link> lists (cities with "Spring," "Rock," "Lake," and more in the name)</p><br/>
              </div>
            </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
          gap: '10px',
          width: '100%',
          maxWidth: '400px',
          marginTop: 'auto',
          paddingBottom: '30px'
          }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
                backgroundColor: '#158bf5',
                color: '#fff',
                textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem'
              }}
            >
              <i className="fas fa-home"></i>
              <span>Go to the homepage</span>
            </Link>
            
            <Link
              href="/find-places"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              gap: '8px',
              padding: '12px 24px',
                backgroundColor: '#fff',
                color: '#158bf5',
                textDecoration: 'none',
              borderRadius: '8px',
                border: '2px solid #158bf5',
              fontSize: '0.95rem'
              }}
            >
              <i className="fas fa-search"></i>
              <span>Use the city search</span>
            </Link>
        </div>
      </main>
    </>
  );
}
