'use client';

import { useState } from 'react';

const riverFaqs = [
  {
    question: 'Why do so many U.S. cities and towns include the word "River"?',
    answer:
      'Many communities were founded along rivers that provided transportation, water supply, and economic opportunity. The river often became the defining geographic feature of the town.',
  },
  {
    question: 'Which U.S. states have the most cities with "River" in their name?',
    answer:
      'States with extensive river systems such as California, Texas, Wisconsin, Michigan, and New Jersey contain a high number of places using "River" in their name.',
  },
  {
    question: 'How many cities and towns in the U.S. contain the word "River"?',
    answer:
      'There are hundreds of cities, towns, and unincorporated communities across the United States with "River" in their name, reflecting the importance of waterways in settlement history.',
  },
  {
    question: 'Are places with "River" in the name always located next to a river?',
    answer:
      'Most are, though in some cases rivers have changed course, been renamed, or are no longer central to daily life due to urban development.',
  },
  {
    question: 'What are some common place names that start with "River"?',
    answer:
      'Common examples include Riverside, Riverdale, River Falls, Riverhead, and River Forest, with variations appearing across multiple states.',
  },
  {
    question: 'Can I filter cities with "River" in their name by state?',
    answer:
      'Yes. This page allows you to browse and filter all U.S. locations containing the word "River" by individual states for easy comparison.',
  },
  {
    question: 'How often is the list of cities with "River" in the name updated?',
    answer:
      'The dataset is updated regularly using authoritative geographic and municipal sources to reflect new entries, corrections, and administrative changes.',
  },
];

export default function RiverFAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" aria-labelledby="river-faq-heading">
      <div className="content-container py-16 max-w-4xl mx-auto">
        <h2 id="river-faq-heading" className="section-title text-center mb-10">
          FAQ — Cities With "River" in the Name
        </h2>

        <div className="faq-list space-y-4">
          {riverFaqs.map((faq, index) => (
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
              <h3
                id={`faq-question-${index}`}
                className="faq-question flex justify-between items-center cursor-pointer p-5 sm:p-6 text-lg sm:text-xl font-semibold text-blue-700"
              >
                <span>{faq.question}</span>
                <span className="ml-3 text-2xl font-bold text-blue-500 transition-transform duration-300">
                  {openIndex === index ? '–' : '+'}
                </span>
              </h3>

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
      </div>
    </section>
  );
}




