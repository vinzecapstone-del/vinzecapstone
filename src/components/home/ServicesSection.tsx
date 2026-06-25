'use client'

import Link from 'next/link'
import { ArrowRight, Clock, Banknote } from 'lucide-react'

const services = [
  {
    emoji: '🏛️',
    title: 'Barangay Clearance',
    description:
      'Official certification that you have no derogatory record. Essential for employment, business permits, and government IDs.',
    uses: ['Employment', 'Business Permit', 'Government ID'],
    fee: '₱50.00',
    days: '1–2 days',
    href: '/dashboard/request?type=clearance',
  },
  {
    emoji: '🤝',
    title: 'Certificate of Indigency',
    description:
      'Certification for residents belonging to low-income households. Used for medical assistance, scholarships, and social services.',
    uses: ['Medical Aid', 'Scholarship', 'Social Services'],
    fee: 'Free',
    days: '1 day',
    href: '/dashboard/request?type=indigency',
  },
  {
    emoji: '🏠',
    title: 'Certificate of Residency',
    description:
      'Proof of legitimate residency in Barangay Lonos. Required for school enrollment, bank loans, and travel documents.',
    uses: ['School Enrollment', 'Loans', 'Travel / Visa'],
    fee: '₱50.00',
    days: '1–2 days',
    href: '/dashboard/request?type=residency',
  },
]

export default function ServicesSection() {
  return (
    <section className="svc-section" id="services">
      <style>{`
        .svc-section {
          position: relative;
          min-height: 100vh;
          background: #faf8f4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 96px 0;
        }

        .svc-top-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26, 58, 42, 0.1), transparent);
        }

        .svc-bottom-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26, 58, 42, 0.1), transparent);
        }

        .svc-container {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
        }

        @media (min-width: 640px) {
          .svc-container {
            padding: 0 48px;
          }
        }

        @media (min-width: 1024px) {
          .svc-container {
            padding: 0 64px;
          }
        }

        /* Header */
        .svc-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 80px;
          gap: 16px;
        }

        .svc-label-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .svc-label-line {
          width: 32px;
          height: 2px;
          background: #c9a84c;
        }

        .svc-label {
          color: #c9a84c;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .svc-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a3a2a;
          line-height: 1.2;
          margin: 0;
        }

        .svc-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 500;
          color: #7a6a55;
          max-width: 560px;
          margin: 0;
          line-height: 1.6;
        }

        @media (min-width: 640px) {
          .svc-title {
            font-size: 3.5rem;
          }
        }

        @media (min-width: 1024px) {
          .svc-title {
            font-size: 4rem;
          }
        }

        /* Cards Grid */
        .svc-grid {
          display: grid;
          gap: 24px;
          justify-content: center;
          align-items: stretch;
        }

        @media (min-width: 768px) {
          .svc-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
          }
        }

        /* Card */
        .svc-card {
          position: relative;
          background: #ffffff;
          border-radius: 2.5rem;
          border: 1px solid #e8e0d5;
          padding: 40px;
          transition: all 0.5s ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-width: 380px;
          width: 100%;
          margin: 0 auto;
        }

        .svc-card:hover {
          box-shadow: 0 25px 50px -12px rgba(26, 58, 42, 0.1);
          transform: translateY(-12px);
        }

        .svc-card-bg {
          position: absolute;
          top: -24px;
          right: -24px;
          font-size: 10rem;
          font-family: serif;
          color: #f0ebe3;
          opacity: 0.4;
          pointer-events: none;
          user-select: none;
          line-height: 1;
          transition: all 0.7s ease;
        }

        .svc-card:hover .svc-card-bg {
          transform: scale(1.25);
          color: rgba(201, 168, 76, 0.1);
        }

        .svc-card-body {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        @media (min-width: 768px) {
          .svc-card-body {
            align-items: flex-start;
          }
        }

        .svc-icon-wrap {
          width: 80px;
          height: 80px;
          border-radius: 1.5rem;
          background: #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.25rem;
          margin-bottom: 32px;
          transition: all 0.5s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid rgba(255,255,255,0.5);
        }

        .svc-card:hover .svc-icon-wrap {
          background: #1a3a2a;
          transform: scale(1.1);
        }

        .svc-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 16px 0;
          text-align: center;
        }

        @media (min-width: 768px) {
          .svc-card-title {
            text-align: left;
          }
        }

        .svc-card-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          line-height: 1.7;
          color: #7a6a55;
          margin: 0 0 32px 0;
          text-align: center;
          opacity: 0.9;
          font-weight: 500;
        }

        @media (min-width: 768px) {
          .svc-card-desc {
            text-align: left;
          }
        }

        .svc-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-bottom: 40px;
        }

        @media (min-width: 768px) {
          .svc-tags {
            justify-content: flex-start;
          }
        }

        .svc-tag {
          font-size: 10px;
          padding: 8px 14px;
          background: #faf8f4;
          color: #78716c;
          border: 1px solid #f5f5f4;
          border-radius: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          transition: background 0.3s ease;
        }

        .svc-card:hover .svc-tag {
          background: #ffffff;
        }

        /* Stats row */
        .svc-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 32px 0;
          border-top: 1px dashed #e7e5e4;
          margin-bottom: 32px;
        }

        .svc-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        @media (min-width: 768px) {
          .svc-stat {
            flex-direction: row;
            align-items: center;
          }
        }

        .svc-stat-icon {
          padding: 10px;
          border-radius: 12px;
          background: #faf8f4;
          color: #c9a84c;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
        }

        .svc-card:hover .svc-stat-icon {
          background: rgba(201, 168, 76, 0.1);
        }

        .svc-stat-info {
          text-align: center;
        }

        @media (min-width: 768px) {
          .svc-stat-info {
            text-align: left;
          }
        }

        .svc-stat-label {
          font-size: 10px;
          color: #a8a29e;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          margin: 0 0 4px 0;
        }

        .svc-stat-value {
          font-size: 0.875rem;
          font-weight: 900;
          color: #1a3a2a;
          margin: 0;
        }

        /* CTA Button */
        .svc-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 20px;
          background: #1a3a2a;
          color: #c9a84c;
          font-family: 'DM Sans', sans-serif;
          font-weight: 900;
          font-size: 0.9rem;
          border-radius: 1.25rem;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          border: none;
          cursor: pointer;
        }

        .svc-btn:hover {
          background: #0f2419;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15);
          gap: 20px;
        }

        .svc-btn:active {
          transform: scale(0.97);
        }

        /* Footer link */
        .svc-footer {
          margin-top: 80px;
          text-align: center;
        }

        .svc-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #1a3a2a;
          font-weight: 900;
          font-size: 0.875rem;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .svc-footer-link:hover {
          color: #c9a84c;
        }

        .svc-footer-arrow {
          transition: transform 0.3s ease;
        }

        .svc-footer-link:hover .svc-footer-arrow {
          transform: translateX(8px);
        }

        /* Mobile padding adjustment */
        @media (max-width: 480px) {
          .svc-section {
            padding: 64px 0;
          }
          .svc-header {
            margin-bottom: 48px;
          }
          .svc-card {
            padding: 32px 24px;
            border-radius: 2rem;
          }
          .svc-title {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="svc-top-line" />

      <div className="svc-container">
        {/* Header */}
        <div className="svc-header">
          <div className="svc-label-row">
            <div className="svc-label-line" />
            <span className="svc-label">Community E-Services</span>
            <div className="svc-label-line" />
          </div>

          <h2 className="svc-title">Available Certificates</h2>

          <p className="svc-subtitle">
            Skip the lines and process your documents digitally. Select a service below to start your request.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="svc-grid">
          {services.map((svc, i) => (
            <div key={i} className="svc-card">
              <div className="svc-card-bg">{svc.emoji}</div>

              <div className="svc-card-body">
                <div className="svc-icon-wrap">{svc.emoji}</div>

                <h3 className="svc-card-title">{svc.title}</h3>

                <p className="svc-card-desc">{svc.description}</p>

                <div className="svc-tags">
                  {svc.uses.map(use => (
                    <span key={use} className="svc-tag">{use}</span>
                  ))}
                </div>
              </div>

              <div className="svc-stats">
                <div className="svc-stat">
                  <div className="svc-stat-icon">
                    <Banknote size={18} />
                  </div>
                  <div className="svc-stat-info">
                    <p className="svc-stat-label">Fee</p>
                    <p className="svc-stat-value">{svc.fee}</p>
                  </div>
                </div>
                <div className="svc-stat">
                  <div className="svc-stat-icon">
                    <Clock size={18} />
                  </div>
                  <div className="svc-stat-info">
                    <p className="svc-stat-label">Turnaround</p>
                    <p className="svc-stat-value">{svc.days}</p>
                  </div>
                </div>
              </div>

              <Link href={svc.href} className="svc-btn">
                Request Now
                <ArrowRight size={20} />
              </Link>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="svc-footer">
          <Link href="/dashboard/request" className="svc-footer-link">
            Explore All Resident Services
            <ArrowRight size={16} className="svc-footer-arrow" />
          </Link>
        </div>
      </div>

      <div className="svc-bottom-line" />
    </section>
  )
}