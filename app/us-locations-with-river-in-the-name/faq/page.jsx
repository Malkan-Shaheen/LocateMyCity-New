'use client';

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Head from 'next/head';
import { useState } from 'react';

const newFaqs = [
  {
    question: 'Why do so many U.S. cities and towns start with the word “New”?',
    answer:
      'Many U.S. cities were named by early settlers after places in Europe, especially England and the Netherlands. The prefix “New” was added to represent a new version of an existing city — such as New York, New London, or New Amsterdam. This naming trend spread during colonial expansion and became one of the most common naming patterns in the United States.',
  },
  {
    question: 'Which U.S. states have the most cities with “New” in their name?',
    answer:
      'States including New York, New Jersey, New Mexico, Texas, and Ohio have the highest number of cities featuring the word “New.” These states had large colonial populations and longer settlement histories, resulting in more towns adopting this naming style.',
  },
  {
    question: 'How many cities in the United States contain the word “New” in their name?',
    answer:
      'There are hundreds of U.S. cities, towns, and unincorporated communities with “New” in their name. The exact number changes as places merge, are newly recognized, or undergo administrative updates. Our dataset reflects the most up-to-date list using national and state geographic sources.',
  },
  {
    question: 'What are the most common place names that begin with “New” in the United States?',
    answer:
      'Some of the most common place names include New Hope, New Town, New Market, New Castle, and New Salem. These names appear in multiple states due to shared cultural traditions and historical naming practices dating back to early settlement.',
  },
  {
    question: 'Can I browse or filter cities with “New” in their name by state?',
    answer:
      'Yes. Our main page includes a full state browser that lets you instantly filter all cities containing the word “New” by any U.S. state. This makes it easy to compare how many “New” locations exist in each region.',
  },
  {
    question: 'Are there major U.S. cities with “New” in their name?',
    answer:
      'Some of the most notable examples include New York, New Orleans, New Haven, New Bedford, and New Braunfels. These cities are well-known for their economic importance, cultural impact, and historical significance.',
  },
  {
    question: 'How often is the list of U.S. cities with “New” in the name updated?',
    answer:
      'The list is updated regularly using authoritative sources such as GNIS, state databases, and municipal records. Updates include new entries, coordinate corrections, and status changes to keep the dataset accurate and reliable.',
  },
];

export default function NewCitiesFAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Head>
        <title>New Cities FAQ | LocateMyCity</title>
        <meta
          name="description"
          content="SEO-optimized FAQ about U.S. cities with 'New' in their name — historical background, common names, data updates, state filters, and distance tools."
        />
        <link
          rel="canonical"
          href="https://locatemycity.com/us-locations-with-new-in-the-name/faq"
        />
      </Head>

      <main className="flex-grow py-16 px-6 sm:px-10 max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
          Cities with “New” — Frequently Asked Questions
        </h1>

        <div className="faq-list space-y-4">
          {newFaqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-card border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition bg-white/80 backdrop-blur-sm ${
                openIndex === index ? 'ring-1 ring-blue-400' : ''
              }`}
              onClick={() => toggleFAQ(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && toggleFAQ(index)
              }
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
                  openIndex === index
                    ? 'max-h-48 p-5 pt-0 sm:p-6 sm:pt-0'
                    : 'max-h-0 p-0'
                }`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
