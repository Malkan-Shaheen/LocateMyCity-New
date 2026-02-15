'use client';

import { useState } from 'react';

const oldFaqs = [
  {
    question: 'Why do so many U.S. cities and towns include the word "Old"?',
    answer:
      'Many communities adopted "Old" to distinguish an original settlement from newer nearby development. The term often reflects historical roots rather than the current size or importance of the town.',
  },
  {
    question: 'Which U.S. states have the most cities with "Old" in their name?',
    answer:
      'States with long settlement histories such as Connecticut, Maine, New York, New Jersey, and Florida contain a high number of places using "Old" in their name.',
  },
  {
    question: 'How many cities and towns in the U.S. contain the word "Old"?',
    answer:
      'There are hundreds of cities, towns, and unincorporated communities across the United States with "Old" in their name. The exact number changes as geographic records are updated.',
  },
  {
    question: 'Are places with "Old" in the name usually historic districts?',
    answer:
      'Often yes. Many "Old" locations are associated with preserved town centers, historic neighborhoods, or early settlement areas, though some remain fully active modern communities.',
  },
  {
    question: 'What are some common place names that start with "Old"?',
    answer:
      'Common examples include Old Town, Old Forge, Old Bridge, Old Lyme, and Old Saybrook, with variations appearing across multiple states.',
  },
  {
    question: 'Can I filter cities with "Old" in their name by state?',
    answer:
      'Yes. This page allows you to browse and filter all U.S. locations containing the word "Old" by individual states for easy comparison.',
  },
  {
    question: 'How often is the list of cities with "Old" in the name updated?',
    answer:
      'The dataset is updated regularly using authoritative geographic and municipal sources to reflect name changes, new designations, and corrections.',
  },
];

export default function OldFAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" aria-labelledby="old-faq-heading">
      <div className="content-container py-16 max-w-4xl mx-auto">
        <h2 id="old-faq-heading" className="section-title text-center mb-10">
          FAQ — Cities With "Old" in the Name
        </h2>

        <div className="faq-list space-y-4">
          {oldFaqs.map((faq, index) => (
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

