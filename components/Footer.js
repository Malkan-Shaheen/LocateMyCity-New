import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer-wrapper" role="contentinfo">
      <div className="footer-content">
        {/* Left: Logo + Description */}
        <div className="footer-section">
          <h2 className="footer-logo">LocateMyCity</h2>
          <p className="footer-description">
            Helping you explore cities smarter. Fast, accurate, and user-friendly.
          </p>
        <div className="footer-social">
            <a 
              href="https://www.facebook.com/locatemycity" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link1"
              aria-label="Follow LocateMyCity on Facebook"
            >
              <FaFacebook className="social-icon" aria-hidden="true" />
              <span style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                border: 0,
              }}>
                Follow LocateMyCity on Facebook
              </span>
            </a>
            <a 
              href="https://www.instagram.com/locatemycitynow" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link1"
              aria-label="Follow LocateMyCity on Instagram"
            >
              <FaInstagram className="social-icon" aria-hidden="true" />
              <span style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                border: 0,
              }}>
                Follow LocateMyCity on Instagram
              </span>
            </a>
          </div>
        </div>

  

        {/* Center: Links */}
        <div className="footer-section">
          <h2 className="footer-heading">Quick Links</h2>
          <ul className="footer-links">
            <li><Link href="/">Home</Link></li>
            <li><a href="/explore">Explore Distances</a></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/terms">Terms & Agreement</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
          <li><Link href="/about-the-developer">About The Developer</Link></li>
          
          </ul>
        </div>

        {/* Right: Contact Info & Data Sources */}
        <div className="footer-section">
          <h2 className="footer-heading">Contact Us</h2>
  
<p>
  <FaEnvelope className="footer-icon" />{' '}
  <a href="mailto:support@locatemycity.com" style={{ color: 'inherit', textDecoration: 'none' }}>
    support@locatemycity.com
  </a>
</p>

          <h2 className="footer-heading" style={{ marginTop: '2rem' }}>Data Sources & Attribution</h2>
          <div style={{ fontSize: '0.85rem' }}>
            <p>
              Location, geographic, and place classification information on this page is compiled from trusted public and authoritative sources, including
            </p>
            <ul className="footer-links">
              <li>
                <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>GeoNames</a>
              </li>
              <li>
                Geographic Names Information System (GNIS) maintained by the{' '}
                <a href="https://www.usgs.gov/us-board-on-geographic-names/domestic-names" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>U.S. Geological Survey</a>
              </li>
              <li>
                <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>OpenStreetMap contributors</a>, and Natural Earth public domain map data.
              </li>
            </ul>
            <p style={{ marginTop: '1rem', marginBottom: 0 }}>
              Distance calculations are generated using standard geodesic formulas based on latitude and longitude coordinates.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LocateMyCity. All rights reserved.</p>
      </div>
    </footer>
  );
}
