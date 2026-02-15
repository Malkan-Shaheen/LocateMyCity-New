'use client';

import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const AboutDeveloperPage = () => {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Jared Whyms",
    "jobTitle": "Independent Web Developer",
    "description":
      "Independent web developer and creator of LocateMyCity, focused on fast, accurate, and intent-driven location-based tools.",
    "url": "https://locatemycity.com/about-the-developer",
    "image": "https://locatemycity.com/Images/jared-whyms.jpg",
    "knowsAbout": [
      "Geographic Information Systems",
      "Programmatic SEO",
      "Location-based search tools",
      "Web performance optimization"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "LocateMyCity",
      "url": "https://locatemycity.com"
    },
    "sameAs": [
      "https://www.linkedin.com/in/jaredwhyms/",
      "https://www.facebook.com/jared.whyms/"
    ]
  };

  return (
    <div className="about-developer-page">
      <Header />

      <Head>
        <title>About the Developer | Jared Whyms</title>
        <meta
          name="description"
          content="Meet Jared Whyms, the independent developer behind LocateMyCity—building fast, accurate, and user-focused location tools."
        />
        <meta name="robots" content="index, follow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </Head>

      <main
        className="about-developer-main"
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <article
          className="about-container"
          style={{
            width: '100%',
            maxWidth: '1100px',
            padding: '0 1.25rem'
          }}
        >

          {/* HERO */}
          <section
            className="developer-hero-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '420px 1fr',
              gap: '2rem',
              alignItems: 'center',
              margin: '0 auto'
            }}
          >
            <div className="developer-image" style={{ display: 'flex', justifyContent: 'center' }}>
              <Image
                src="/Images/jared whyms.jpg"
                alt="Jared Whyms, independent web developer and creator of LocateMyCity"
                width={420}
                height={420}
                priority
              />
            </div>

            <div className="developer-hero-text">
              <p className="press-label">FOR IMMEDIATE RELEASE</p>
              <h1>Jared Whyms Builds Practical Location Tools for Everyday Use</h1>
              <p className="press-subtitle">
                Independent developer focused on speed, accuracy, and public utility
              </p>
              <p className="dateline">
                <strong>Charlottetown, PEI</strong> — Jared Whyms is an independent web
                developer and digital product builder, and the creator of LocateMyCity,
                a growing platform of fast, accessible tools designed to help people
                understand distances, places, and geographic data with clarity.
              </p>
            </div>
          </section>

          {/* CONTENT */}
          <section className="developer-body">
            <h2>Purpose-Built Location Tools</h2>
            <p>
              LocateMyCity began as a focused experiment around one idea: location
              information should be quick to load, easy to understand, and genuinely useful.
            </p>
            <p>
              The platform now includes distance tools, city and town classification pages,
              ghost town verification, and keyword-driven place discovery.
            </p>
            <p>
              Every tool is designed for real-world use—travelers, researchers, students,
              and everyday users looking for fast answers.
            </p>
          </section>

          <section className="developer-philosophy">
            <h2>Built With Purpose</h2>
            <p>
              “The internet doesn’t lack information—it lacks respect for the user’s time.”
            </p>
          </section>

          <section className="developer-roadmap">
            <h2>Ongoing Development</h2>
            <p>
              LocateMyCity continues to expand with new datasets, enhanced calculators,
              and global coverage driven by real search behavior.
            </p>
          </section>

          <section className="developer-attribution">
            <h3>About the Developer</h3>
            <p>
              Jared Whyms is an independent web developer specializing in performance-first,
              location-based tools.
            </p>
          </section>

          <section className="developer-socials">
            <h3>Connect</h3>
            <ul>
              <li>🔗 <a href="https://www.linkedin.com/in/jaredwhyms/" target="_blank">LinkedIn</a></li>
              <li>📘 <a href="https://www.facebook.com/jared.whyms/" target="_blank">Facebook</a></li>
            </ul>
          </section>

        </article>
      </main>

      <Footer />
    </div>
  );
};

export default AboutDeveloperPage;
