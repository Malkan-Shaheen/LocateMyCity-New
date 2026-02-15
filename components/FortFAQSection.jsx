'use client';

import { useState } from 'react';

const fortFaqs = [
  {
    question: 'Why do so many U.S. cities and towns include the word "Fort"?',
    answer:
      'Many communities grew around military installations that provided protection, employment, and infrastructure during early settlement.',
  },
  {
    question: 'Which U.S. states have the most cities with "Fort" in their name?',
    answer:
      'States such as Texas, Florida, California, and Arkansas contain a high number of places using "Fort" in their name due to extensive military and frontier history.',
  },
  {
    question: 'How many cities and towns in the U.S. contain the word "Fort"?',
    answer:
      'There are hundreds of cities, towns, and unincorporated communities across the United States with "Fort" in their name.',
  },
  {
    question: 'Are all places with "Fort" in the name former military sites?',
    answer:
      'Most originated near military outposts, though some were named symbolically or after historic forts in nearby areas.',
  },
  {
    question: 'What are some common place names that start with "Fort"?',
    answer:
      'Common examples include Fort Worth, Fort Lauderdale, Fort Myers, Fort Collins, and Fort Wayne.',
  },
  {
    question: 'Can I filter cities with "Fort" in their name by state?',
    answer:
      'Yes. This page allows you to browse and filter all U.S. locations containing the word "Fort" by individual states.',
  },
  {
    question: 'How often is the list of cities with "Fort" in the name updated?',
    answer:
      'The dataset is updated regularly using authoritative geographic and municipal sources to reflect new entries, corrections, and classification updates.',
  },
];

export default function FortFAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" aria-labelledby="fort-faq-heading">
      <div className="content-container py-16 max-w-4xl mx-auto">
        <h2 id="fort-faq-heading" className="section-title text-center mb-10">
          FAQ — Cities With "Fort" in the Name
        </h2>

        <div className="faq-list space-y-4">
          {fortFaqs.map((faq, index) => (
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




