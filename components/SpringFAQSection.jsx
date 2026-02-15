'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export default function SpringFAQSection() {
  const faqs = [
    {
      question: 'Which U.S. state has the most cities with “Spring” in the name?',
      answer: 'Texas and Arkansas have the most “Spring” cities, including Little Spring and Springwall, due to geographic and historical naming influences.',
    },
    {
      question: 'Can I view all “Spring” cities on an interactive map?',
      answer: 'Yes — the interactive map displays all U.S. cities with “Spring” in their names, complete with coordinates, filters, and quick view links.',
    },
    {
      question: 'How often is the list of “Spring” cities updated?',
      answer: 'The database is refreshed regularly to include the latest verified U.S. city and town data from authoritative geographic and census sources.',
    },
    {
      question: 'Can I filter or search by state?',
      answer: 'Yes — you can browse by individual U.S. states using the buttons provided, or explore all locations grouped by state below.',
    },
  ];

    const [activeFAQ, setActiveFAQ] = useState(null);

  const toggleFAQ = useCallback((index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  }, [activeFAQ]);

  return (
         <section className="faq-page" aria-labelledby="faq-section-title">
            <h2 id="faq-section-title" className="faq-title">Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className={`faq-card ${activeFAQ === index ? 'open' : ''}`}
                  role="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveFAQ(prev => {
                      const newValue = prev === index ? null : index;
                      return newValue;
                    });
                    requestAnimationFrame(() => window.scrollTo(0, window.scrollY));
                  }}
                  aria-expanded={activeFAQ === index}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <h3 className="faq-question">{faq.question}</h3>
                  <div
                    id={`faq-answer-${faq.id}`}
                    className="faq-answer"
                    role="region"
                    aria-labelledby={`faq-question-${faq.id}`}
                    hidden={activeFAQ !== index}
                    style={{
                      overflowAnchor: 'none'
                    }}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
  );
}
