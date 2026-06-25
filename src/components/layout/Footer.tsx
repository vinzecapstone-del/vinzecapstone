import Link from 'next/link'
import { MapPin, Phone, Mail, Facebook } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="ftr-root">
      <style>{`
        .ftr-root {
          background: #1a3a2a;
          color: #f4f1ec;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ftr-accent {
          height: 4px;
          background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.5), transparent);
        }

        .ftr-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 64px 24px;
        }

        @media (min-width: 640px) {
          .ftr-container {
            padding: 64px 32px;
          }
        }

        @media (min-width: 1024px) {
          .ftr-container {
            padding: 64px 48px;
          }
        }

        .ftr-grid {
          display: grid;
          gap: 48px;
        }

        @media (min-width: 768px) {
          .ftr-grid {
            grid-template-columns: 5fr 3fr 4fr;
            gap: 48px;
          }
        }

        @media (min-width: 1024px) {
          .ftr-grid {
            gap: 64px;
          }
        }

        /* Brand Column */
        .ftr-brand {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .ftr-brand-header {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ftr-brand-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #c9a84c, #a68a3b);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .ftr-brand-icon::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), transparent 70%);
        }

        .ftr-brand-letter {
          color: #1a3a2a;
          font-weight: 700;
          font-size: 1.25rem;
          font-family: 'Playfair Display', serif;
          font-style: italic;
          position: relative;
          z-index: 2;
        }

        .ftr-brand-text {
          display: flex;
          flex-direction: column;
        }

        .ftr-brand-title {
          color: #ffffff;
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
          line-height: 1;
          font-family: 'Playfair Display', serif;
          margin: 0;
        }

        .ftr-brand-subtitle {
          color: #c9a84c;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-top: 6px;
          opacity: 0.9;
        }

        .ftr-brand-desc {
          font-size: 0.875rem;
          line-height: 1.7;
          color: #9a8f7a;
          max-width: 400px;
          margin: 0;
        }

        .ftr-social {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 8px;
        }

        .ftr-social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          color: #f4f1ec;
          transition: all 0.3s ease;
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }

        .ftr-social-link:hover {
          background: #c9a84c;
          color: #1a3a2a;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(201, 168, 76, 0.3);
        }

        .ftr-social-link svg {
          width: 18px;
          height: 18px;
          position: relative;
          z-index: 2;
        }

        /* Links Column */
        .ftr-links-col {
          display: flex;
          flex-direction: column;
        }

        .ftr-heading {
          color: #ffffff;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0 0 24px 0;
        }

        .ftr-links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ftr-link-item {
          display: flex;
          align-items: center;
        }

        .ftr-link {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.875rem;
          color: #9a8f7a;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          padding-left: 0;
        }

        .ftr-link:hover {
          color: #c9a84c;
          padding-left: 8px;
        }

        .ftr-link-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9a84c;
          opacity: 0;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .ftr-link:hover .ftr-link-dot {
          opacity: 1;
        }

        /* Contact Column */
        .ftr-contact-col {
          display: flex;
          flex-direction: column;
        }

        .ftr-contact-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ftr-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .ftr-contact-item:hover .ftr-contact-icon {
          background: rgba(201, 168, 76, 0.1);
        }

        .ftr-contact-icon {
          padding: 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #c9a84c;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.3s ease;
        }

        .ftr-contact-icon svg {
          width: 16px;
          height: 16px;
        }

        .ftr-contact-text {
          font-size: 0.875rem;
          color: #9a8f7a;
          line-height: 1.5;
          margin: 0;
        }

        .ftr-contact-text strong {
          color: #f4f1ec;
          font-weight: 500;
        }

        /* Bottom Bar */
        .ftr-bottom {
          margin-top: 64px;
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        @media (min-width: 640px) {
          .ftr-bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .ftr-copyright {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        @media (min-width: 640px) {
          .ftr-copyright {
            align-items: flex-start;
          }
        }

        .ftr-copyright-text {
          font-size: 11px;
          font-weight: 700;
          color: #78716c;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0;
        }

        .ftr-copyright-sub {
          font-size: 10px;
          color: #57534e;
          margin: 0;
        }

        .ftr-legal {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .ftr-legal-link {
          font-size: 11px;
          color: #78716c;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-decoration: none;
          transition: color 0.2s ease;
          position: relative;
        }

        .ftr-legal-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #c9a84c;
          transition: width 0.3s ease;
        }

        .ftr-legal-link:hover {
          color: #c9a84c;
        }

        .ftr-legal-link:hover::after {
          width: 100%;
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .ftr-container {
            padding: 48px 20px;
          }
          .ftr-grid {
            gap: 40px;
          }
          .ftr-bottom {
            margin-top: 48px;
          }
        }
      `}</style>

      <div className="ftr-accent" />

      <div className="ftr-container">
        <div className="ftr-grid">
          {/* Brand & Mission */}
          <div className="ftr-brand">
            <div className="ftr-brand-header">
              <div className="ftr-brand-icon">
                <span className="ftr-brand-letter">S</span>
              </div>
              <div className="ftr-brand-text">
                <p className="ftr-brand-title">SerbisyoHub</p>
                <p className="ftr-brand-subtitle">Official E-Services Portal</p>
              </div>
            </div>

            <p className="ftr-brand-desc">
              Committed to serving our community with digital transparency and efficiency.
              Our portal allows residents to access essential barangay services and request
              certificates securely from anywhere, anytime.
            </p>

            <div className="ftr-social">
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="ftr-social-link"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="ftr-links-col">
            <h4 className="ftr-heading">Quick Links</h4>
            <ul className="ftr-links-list">
              {[
                { label: 'Home', href: '/' },
                { label: 'Request a Certificate', href: '/dashboard/request' },
                { label: 'Verify Certificate', href: '/verify' },
                { label: 'About Barangay', href: '/#about' },
                { label: 'Contact Us', href: '/#contact' },
              ].map(link => (
                <li key={link.href} className="ftr-link-item">
                  <Link href={link.href} className="ftr-link">
                    <span className="ftr-link-dot" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="ftr-contact-col">
            <h4 className="ftr-heading">Get In Touch</h4>
            <ul className="ftr-contact-list">
              <li className="ftr-contact-item">
                <div className="ftr-contact-icon">
                  <MapPin size={16} />
                </div>
                <p className="ftr-contact-text">
                  Barangay Hall,<br />
                  Municipality, Province, PH
                </p>
              </li>
              <li className="ftr-contact-item">
                <div className="ftr-contact-icon">
                  <Phone size={16} />
                </div>
                <p className="ftr-contact-text">
                  <strong>(02) 8XXX-XXXX</strong>
                </p>
              </li>
              <li className="ftr-contact-item">
                <div className="ftr-contact-icon">
                  <Mail size={16} />
                </div>
                <p className="ftr-contact-text">
                  barangay@email.com
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="ftr-bottom">
          <div className="ftr-copyright">
            <p className="ftr-copyright-text">© {year} SerbisyoHub</p>
            <p className="ftr-copyright-sub">Official E-Services &amp; Governance Portal</p>
          </div>
          <div className="ftr-legal">
            <Link href="/privacy" className="ftr-legal-link">
              Privacy Policy
            </Link>
            <Link href="/terms" className="ftr-legal-link">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}