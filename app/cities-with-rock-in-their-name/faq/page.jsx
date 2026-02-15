'use client';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Head from 'next/head';
import { useState } from 'react';

const rockFaqs = [
  {
    question: 'Which U.S. state has the most cities with “Rock” in the name?',
    answer:
      'Texas and Arkansas have the most “Rock” cities, including Little Rock and Rockwall, due to geographic and historical naming influences.',
  },
  {
    question: 'Can I view all “Rock” cities on an interactive map?',
    answer:
      'Yes — the interactive map displays all U.S. cities with “Rock” in their names, complete with coordinates, filters, and quick-view links.',
  },
  {
    question: 'How often is the list of “Rock” cities updated?',
    answer:
      'The database is refreshed regularly to include the latest verified U.S. city and town data from authoritative geographic and census sources.',
  },
  {
    question: 'Can I filter or search by state?',
    answer:
      'Yes — you can browse by individual U.S. states using the buttons provided, or explore all locations grouped by state below.',
  },
  {
    question: 'Does the Rock Cities page link to the Distance Calculator?',
    answer:
      'Absolutely. Click any city name in the Rock list to open the Distance Calculator and instantly see how far that city is from your current location.',
  },
];

export default function RockFAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Head>
        <title>Rock Cities FAQ | LocateMyCity</title>
        <meta
          name="description"
          content="Frequently asked questions about U.S. cities with 'Rock' in their name — data updates, map tools, filters, and distance features."
        />
        <link rel="canonical" href="https://locatemycity.com/cities-with-rock/faq" />
      </Head>

      <main className="flex-grow py-16 px-6 sm:px-10 max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
          Rock Cities — Frequently Asked Questions
        </h1>

        <div className="faq-list space-y-4">
          {rockFaqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-card border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition bg-white/80 backdrop-blur-sm ${
                openIndex === index ? 'ring-1 ring-blue-400' : ''
              }`}
              onClick={() => toggleFAQ(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleFAQ(index)}
            >
              <h2
                id={`faq-question-${index}`}
                className="faq-question flex justify-between items-center cursor-pointer p-5 sm:p-6 text-lg sm:text-xl font-semibold text-blue-700"
              >
                <span>{faq.question}</span>
                <span className="ml-3 text-2xl font-bold text-blue-500 transition-transform duration-300">
                  {openIndex === index ? '–' : '+'}
                </span>
              </h2>
              <div
                id={`faq-answer-${index}`}
                className={`faq-answer overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-40 p-5 pt-0 sm:p-6 sm:pt-0' : 'max-h-0 p-0'
                }`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
