'use client';

import { useState } from 'react';

const sanFaqs = [
  {
    question: 'Why do so many U.S. cities and towns include the word "San"?',
    answer:
      'Many communities were named during Spanish colonial rule or mission expansion. "San" refers to saints honored by early settlers and religious institutions.',
  },
  {
    question: 'Which U.S. states have the most cities with "San" in their name?',
    answer:
      'California has the highest concentration, followed by Texas, Arizona, and New Mexico due to their Spanish colonial history.',
  },
  {
    question: 'How many cities and towns in the U.S. contain the word "San"?',
    answer:
      'There are hundreds of cities, towns, and unincorporated communities with "San" in their name, primarily in the western and southwestern United States.',
  },
  {
    question: 'Are places with "San" in the name tied to Spanish missions?',
    answer:
      'Many are. A significant number of "San" cities originated around Spanish missions or religious settlements established in the 18th and 19th centuries.',
  },
  {
    question: 'What are some common place names that start with "San"?',
    answer:
      'Common examples include San Diego, San Jose, San Antonio, San Francisco, and San Marcos, with variations appearing across multiple states.',
  },
  {
    question: 'Can I filter cities with "San" in their name by state?',
    answer:
      'Yes. This page allows you to browse and filter all U.S. locations containing the word "San" by individual states for easy comparison.',
  },
  {
    question: 'How often is the list of cities with "San" in the name updated?',
    answer:
      'The dataset is updated regularly using authoritative geographic and municipal sources to reflect new entries, corrections, and classification changes.',
  },
];

export default function SanFAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" aria-labelledby="san-faq-heading">
      <div className="content-container py-16 max-w-4xl mx-auto">
        <h2 id="san-faq-heading" className="section-title text-center mb-10">
          FAQ — Cities With "San" in the Name
        </h2>

        <div className="faq-list space-y-4">
          {sanFaqs.map((faq, index) => (
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

