'use client';

import { useState } from 'react';

const newFaqs = [
  {
    question: 'Why do so many U.S. cities and towns start with the word “New”?',
    answer:
      'Many U.S. cities begin with “New” because early settlers often named towns after locations from Europe. “New” was added to represent a new version of a familiar city—such as New York, New London, or New Amsterdam. This naming pattern continued during westward expansion, making “New” one of the most common prefixes in American place names.',
  },
  {
    question: 'Which U.S. states have the highest number of cities that include the word “New”?',
    answer:
      'States such as New York, New Jersey, New Mexico, Texas, and Ohio have the highest number of “New” cities. These states saw early settlement and rapid growth, resulting in more incorporated towns adopting historically significant names.',
  },
  {
    question: 'How many cities in the United States contain the word “New” in their name?',
    answer:
      'There are hundreds of cities, towns, and unincorporated communities in the U.S. with “New” in their name. The exact number changes as areas merge, are newly recognized, or updated in geographic databases. Our list reflects the most recent data available from national and state-level sources.',
  },
  {
    question: 'What are the most common place names that begin with “New” in the United States?',
    answer:
      'Some of the most common “New” place names include New Hope, New Town, New Market, New Castle, and New Salem. These names frequently appear across multiple states because they align with early settlement naming patterns and historical references.',
  },
  {
    question: 'Can I search for cities with ‘New’ in the name by state or region?',
    answer:
      'Yes. The page includes a full state browser that allows you to filter cities with “New” in their name by any U.S. state. Simply select a state to instantly view matching locations, including coordinates and map links.',
  },
  {
    question: 'Are there major U.S. cities with ‘New’ in their name, and what are some examples?',
    answer:
      'Some of the most notable cities include New York, New Orleans, New Haven, New Bedford, and New Braunfels. These cities hold cultural, economic, and historical importance and attract millions of visitors each year.',
  },
  {
    question: 'How often is the list of U.S. cities with ‘New’ in the name updated?',
    answer:
      'The dataset is updated regularly using authoritative sources such as GNIS, municipal records, and state geographic data. Updates include new entries, coordinate adjustments, and status changes to ensure accuracy.',
  },
];

export default function NewFAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" aria-labelledby="new-faq-heading">
      <div className="content-container py-16 max-w-4xl mx-auto">
        <h2 id="new-faq-heading" className="section-title text-center mb-10">
          Frequently Asked Questions About Cities With “New”
        </h2>

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
