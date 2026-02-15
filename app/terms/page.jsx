'use client';
import Head from 'next/head';
import {
  FiFileText,
  FiAlertTriangle,
  FiShield,
  FiGlobe,
  FiMail,
} from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function TermsConditionsPage() {
  return (
    <>
      <Head>
        <title>Terms & Conditions | LocateMyCity</title>
        <meta
          name="description"
          content="Review the terms and conditions for using LocateMyCity. Learn about acceptable use, disclaimers, limitations of liability, and site policies."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="terms-page">
        <Header />

        <main>
          {/* Hero Section */}
          <section className="contact-hero">
            <div className="hero-overlay"></div>
            <div className="hero1-content">
              <h1>Terms & <span>Conditions</span></h1>
              <p className="hero-subtitle">
                Please review these terms before using LocateMyCity.
              </p>
              <div className="divider"></div>
            </div>
          </section>

          {/* Main Content */}
          <section className="contact-content">
            <div className="contact-grid">

              {/* Acceptance of Terms */}
              <div className="contact-card">
                <div className="card-icon">
                  <FiFileText size={28} />
                </div>
                <h3>Acceptance of Terms</h3>
                <p className="card-description">
                  By accessing or using LocateMyCity, you agree to be bound by
                  these Terms and Conditions. If you do not agree, please do not
                  use the site.
                </p>
              </div>

              {/* Use of the Site */}
              <div className="contact-card">
                <div className="card-icon">
                  <FiGlobe size={28} />
                </div>
                <h3>Use of the Site</h3>
                <p className="card-description">
                  LocateMyCity provides location-based tools, distance
                  calculators, and informational content for general reference
                  only. You agree not to misuse the site, attempt unauthorized
                  access, or disrupt site functionality.
                </p>
              </div>

              {/* Accuracy Disclaimer */}
              <div className="contact-card">
                <div className="card-icon">
                  <FiAlertTriangle size={28} />
                </div>
                <h3>Accuracy & Disclaimer</h3>
                <p className="card-description">
                  While we strive to keep data accurate and up to date,
                  LocateMyCity makes no guarantees regarding completeness,
                  accuracy, or reliability. Distances, classifications, and
                  geographic data are estimates and should not be relied upon
                  for critical decisions.
                </p>
              </div>

              {/* Limitation of Liability */}
              <div className="contact-card">
                <div className="card-icon">
                  <FiShield size={28} />
                </div>
                <h3>Limitation of Liability</h3>
                <p className="card-description">
                  LocateMyCity shall not be liable for any direct, indirect,
                  incidental, or consequential damages arising from the use or
                  inability to use this site or its tools.
                </p>
              </div>

            </div>
          </section>

          {/* Closing Section */}
          <section className="closing-section">
            <div className="closing-content">
              <FiMail size={48} className="globe-icon" />
              <h2>Questions about these terms?</h2>
              <p>
                If you have questions or concerns regarding these Terms &
                Conditions, please contact us at{' '}
                <a href="mailto:support@locatemycity.com">
                  support@locatemycity.com
                </a>.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
