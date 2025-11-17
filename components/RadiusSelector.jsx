'use client';
import Link from 'next/link';
import { useMemo } from 'react';

export default function RadiusSelector({ location }) {
  // Normalize the slug (used for URLs)
  const slug = useMemo(
    () => location?.toLowerCase().replace(/\s+/g, '-'),
    [location]
  );

  const radiusOptions = [10, 20, 25, 50, 75, 100];
  const currentRadius = null; // you can pass this later as a prop if needed

  return (
    <div
      style={{
        backgroundColor: '#3b82f6', // Tailwind blue-500
        color: 'white',
        borderRadius: '16px',
        padding: '2rem 1rem',
        textAlign: 'center',
        marginTop: '2.5rem',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      }}
    >
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
        }}
      >
        Discover cities within different distances from{' '}
        <span style={{ color: '#052457' }}>{location}</span>
      </h3>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {radiusOptions.map((radius) => (
          <Link
            key={radius}
            href={`/places-${radius}-miles-from-${slug}`}
            className={
              currentRadius === radius ? 'active-radius-link' : 'radius-link'
            }
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              backgroundColor:
                currentRadius === radius ? '#a7bee2' : 'white',
              color: currentRadius === radius ? 'white' : '#0b2e68',
              border: `1.5px solid ${
                currentRadius === radius ? '#a7bee2' : '#e2e8f0'
              }`,
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 500,
              transition: 'all 0.2s ease-in-out',
              boxShadow:
                currentRadius === radius
                  ? '0 4px 6px -1px rgba(59, 130, 246, 0.3), 0 2px 4px -1px rgba(59, 130, 246, 0.15)'
                  : '0 2px 4px rgba(0, 0, 0, 0.03)',
              transform: 'translateY(0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (currentRadius !== radius) {
                e.target.style.backgroundColor = '#eff6ff';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow =
                  '0 6px 12px -2px rgba(59, 130, 246, 0.25)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentRadius !== radius) {
                e.target.style.backgroundColor = 'white';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow =
                  '0 2px 4px rgba(0, 0, 0, 0.03)';
              }
            }}
          >
            <span style={{ marginRight: '4px' }}>{radius}</span> Miles
          </Link>
        ))}
      </div>

      <p
        style={{
          marginTop: '20px',
          fontSize: '14px',
          color: 'white',
          fontStyle: 'italic',
        }}
      >
        Click any distance to explore nearby cities
      </p>
    </div>
  );
}
