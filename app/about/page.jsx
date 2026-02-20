'use client';
import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Head from 'next/head';
import { useRouter } from "next/navigation";



const AboutPage = () => {
  const features = [
    { icon: '📍', title: 'Distance Calculators', description: 'Measure in miles, kilometers, or nautical miles—perfect for travelers and planners.' },
    { icon: '🏙️', title: 'City/Town Classifier', description: 'Instantly check if a location is officially a city, town, or something else.' },
    { icon: '👻', title: 'Ghost Town Verifier', description: 'Discover abandoned settlements and verify their status with ease.' },
    { icon: '🔍', title: 'Search by Keyword', description: 'Find places by name or keywords like "rock", "spring", or "island".' },
  ];

  const promises = [
    { emoji: '⚡', text: 'Fast-loading pages – No waiting, just answers.' },
    { emoji: '🌎', text: 'Global coverage – From cities to ghost towns.' },
    { emoji: '🎯', text: 'Precise results – Reliable data anytime.' },
    { emoji: '✨', text: 'Simple design – Easy to use for everyone.' },
    { emoji: '📡', text: 'Open data – Transparent and trustworthy.' },
    { emoji: '⏳', text: 'Ready when you are – Explore on your time.' },
  ];
  const router = useRouter();

  
  return (
    <div className="about-page">
      <Header />
      <Head>
        <title>{`About Us | Locatemycity`}</title>
         <meta
    name="description"
    content="LocateMyCity offers fast, accurate, and simple tools to explore the world. 
    Verify city status, calculate distances, discover ghost towns, and search global locations with ease."
  />
     <link rel="preload" href="/globals.css" as="style" />
     <meta name="robots" content="index, follow">
</meta>
      </Head>

      <main id="main-content" className="about-main">
        {/* Hero */}
        <section className="about-hero">
          <h1>About <span>LocateMyCity</span></h1>
          <p>Discover the world — one location at a time. Whether you're exploring ghost towns, 
          checking distance to a tropical island, or verifying a city's status — our tools make it simple.</p>
        </section>

        {/* What We Do */}
        <section className="about-what-we-do">
          <h2>What We Do</h2>
          <div className="about-features">
            {features.map((card, index) => (
              <div key={index} className="about-feature-card">
                <div className="icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why We Built This */}
        <section className="about-why">
          <h2>Why We Built This</h2>
          <p>
            We believe location data should be fast, accurate, and accessible — no clutter, no confusion.
            Whether you're a traveler, researcher, or simply curious, LocateMyCity gives you tools to explore smarter.
          </p>
        </section>

        {/* Our Promise */}
        <section className="about-promise">
          <h2>Our Promise</h2>
          <div className="about-promises">
            {promises.map((item, index) => (
              <div key={index} className="about-promise-card">
                <span className="emoji">{item.emoji}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
      <h3>Start Exploring Today</h3>
      <p>Dive into the world with LocateMyCity — where every location tells a story.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={() => router.push("/")}
          aria-label="Try our location tools and calculators"
        >
          Try Our Tools Now
        </button>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <a href="/explore" style={{ color: '#158bf5', textDecoration: 'underline' }}>Explore Distance Calculators</a>
          <a href="/find-places" style={{ color: '#158bf5', textDecoration: 'underline' }}>Find Places & Cities</a>
          <a href="/citythemes" style={{ color: '#158bf5', textDecoration: 'underline' }}>Browse City Themes</a>
          <a href="/location-from-me" style={{ color: '#158bf5', textDecoration: 'underline' }}>Distance From Me Calculator</a>
        </div>
      </div>
    </section>
      </main>

      <Footer />

      
    </div>
  );
};

export default AboutPage;
