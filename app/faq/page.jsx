'use client';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Head from 'next/head';

import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqs = [
  {
    question: 'What information can I find on LocateMyCity?',
    answer:
      'LocateMyCity provides detailed insights about locations, including city/town status, distance measurements, and unique geographical traits.',
  },
  {
    question: 'How do I use the distance calculator?',
    answer:
      'Either allow location access or manually enter locations to calculate real-time distances in miles or kilometers.',
  },
  {
    question: 'Can I compare multiple locations?',
    answer:
      'Yes, our Location to Location tool lets you compare multiple destinations for effective trip planning.',
  },
  {
    question: 'How current is the location data?',
    answer:
      'We update weekly using verified sources including satellite imagery and government data.',
  },
  {
    question: 'What makes LocateMyCity different?',
    answer:
      'We highlight unique natural features and cover both abandoned and active locations with faster search and data accuracy than traditional tools.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <Header />
      <Head>
        <title>{`faqs`}</title>
        <meta name="description" content={`faqs`} />
        <link rel="preload" href="/globals.css" as="style" />
        <meta name="robots" content="index, follow"></meta>
      </Head>
      <main id="main-content" className="faq-page">
        <h1 className="faq-title">Frequently Asked Questions</h1>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-card ${openIndex === index ? 'open' : ''}`}
              onClick={() => toggleFAQ(index)}   // 🔹 Make whole div clickable
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleFAQ(index)}
            >
              <h2 className="faq-question">
                <span>{faq.question}</span>
               
                
              </h2>
              <div
                id={`faq-answer-${index}`}
                className="faq-answer"
                role="region"
                aria-labelledby={`faq-question-${index}`}
                hidden={openIndex !== index}
              >
                {openIndex === index && (
                  <div>
                    <p>{faq.answer}</p>
                    {index === 1 && (
                      <p style={{ marginTop: '1rem' }}>
                        Try our <a href="/explore" style={{ color: '#158bf5', textDecoration: 'underline' }}>distance calculator tools</a> or <a href="/find-places" style={{ color: '#158bf5', textDecoration: 'underline' }}>search for places</a> to get started.
                      </p>
                    )}
                    {index === 2 && (
                      <p style={{ marginTop: '1rem' }}>
                        Visit our <a href="/explore" style={{ color: '#158bf5', textDecoration: 'underline' }}>explore page</a> to compare distances between multiple cities and locations.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Explore Our Tools</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <a href="/explore" style={{ color: '#158bf5', textDecoration: 'underline' }}>Browse Distance Calculators</a>
            <a href="/find-places" style={{ color: '#158bf5', textDecoration: 'underline' }}>Find Places & Cities</a>
            <a href="/citythemes" style={{ color: '#158bf5', textDecoration: 'underline' }}>City Themes Explorer</a>
            <a href="/location-from-me" style={{ color: '#158bf5', textDecoration: 'underline' }}>Distance From Me</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
