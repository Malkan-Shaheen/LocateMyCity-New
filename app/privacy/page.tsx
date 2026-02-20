'use client';
import Head from 'next/head';
import { FiShield, FiLock, FiEye, FiDatabase, FiMail } from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | LocateMyCity</title>
        <meta
          name="description"
          content="Learn how LocateMyCity collects, uses, and protects your information. Our privacy policy explains data usage, cookies, analytics, and advertising practices."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="privacy-page">
        <Header />

        <main id="main-content">
          {/* Hero Section */}
          <section className="contact-hero">
            <div className="hero-overlay"></div>
            <div className="hero1-content">
              <h1>Privacy <span>Policy</span></h1>
              <p className="hero-subtitle">
                Your privacy matters. This page explains how information is collected and used on LocateMyCity.
              </p>
              <div className="divider"></div>
            </div>
          </section>

          {/* Main Content */}
          <section className="contact-content">
            <div className="contact-grid">

              {/* Information Collection */}
              <div className="contact-card">
                <div className="card-icon">
                  <FiDatabase size={28} />
                </div>
                <h3>Information We Collect</h3>
                <p className="card-description">
                  LocateMyCity does not require account registration. We may collect limited, non-personal
                  information such as browser type, device data, approximate location, and usage patterns
                  to improve site performance and content relevance.
                </p>
              </div>

              {/* Cookies & Analytics */}
              <div className="contact-card">
                <div className="card-icon">
                  <FiEye size={28} />
                </div>
                <h3>Cookies & Analytics</h3>
                <p className="card-description">
                  We use cookies and similar technologies to analyze traffic, improve user experience,
                  and support advertising. This includes services such as Google Analytics and ad partners
                  that may use cookies to display relevant ads.
                </p>
              </div>

              {/* Advertising */}
              <div className="contact-card">
                <div className="card-icon">
                  <FiShield size={28} />
                </div>
                <h3>Advertising Partners</h3>
                <p className="card-description">
                  LocateMyCity works with third-party advertising platforms, including Google AdSense and
                  Ezoic. These partners may use cookies or web beacons to deliver ads based on visits to
                  this and other websites.
                </p>
              </div>

              {/* Data Protection */}
              <div className="contact-card">
                <div className="card-icon">
                  <FiLock size={28} />
                </div>
                <h3>Data Protection</h3>
                <p className="card-description">
                  We take reasonable measures to protect collected information and do not sell or trade
                  personal data. While no system is completely secure, we prioritize privacy-focused
                  infrastructure and best practices.
                </p>
              </div>

            </div>
          </section>

          {/* Closing Section */}
          <section className="closing-section">
            <div className="closing-content">
              <FiMail size={48} className="globe-icon" />
              <h2>Questions about privacy?</h2>
              <p>
                If you have concerns about this policy or how data is handled, you can contact us anytime
                at <a href="mailto:support@locatemycity.com">support@locatemycity.com</a>.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
