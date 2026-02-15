'use client';

import { useState } from 'react';

const portFaqs = [
  {
    question: 'Why do so many U.S. cities and towns include the word "Port"?',
    answer:
      'Many communities formed around harbors or navigable waterways that supported trade, shipping, and settlement.',
  },
  {
    question: 'Which U.S. states have the most cities with "Port" in their name?',
    answer:
      'States with extensive coastlines or major waterways such as California, Florida, Texas, Michigan, and New York contain a high number of "Port" locations.',
  },
  {
    question: 'How many cities and towns in the U.S. contain the word "Port"?',
    answer:
      'There are hundreds of cities, towns, and unincorporated communities across the United States with "Port" in their name.',
  },
  {
    question: 'Are places with "Port" in the name always active shipping hubs?',
    answer:
      'Not always. Some ports declined over time, while others shifted focus to tourism, fishing, or recreation.',
  },
  {
    question: 'What are some common place names that start with "Port"?',
    answer:
      'Common examples include Portland, Portsmouth, Port Arthur, Port Huron, and Port Angeles.',
  },
  {
    question: 'Can I filter cities with "Port" in their name by state?',
    answer:
      'Yes. This page allows you to browse and filter all U.S. locations containing the word "Port" by individual states.',
  },
  {
    question: 'How often is the list of cities with "Port" in the name updated?',
    answer:
      'The dataset is updated regularly using authoritative geographic and municipal sources to reflect new entries, corrections, and classification changes.',
  },
];

export default function PortFAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" aria-labelledby="port-faq-heading">
      <div className="content-container py-16 max-w-4xl mx-auto">
        <h2 id="port-faq-heading" className="section-title text-center mb-10">
          FAQ — Cities With "Port" in the Name
        </h2>

        <div className="faq-list space-y-4">
          {portFaqs.map((faq, index) => (
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




