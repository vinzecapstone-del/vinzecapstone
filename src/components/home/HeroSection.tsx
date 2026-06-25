'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck, Clock, FileCheck, Sparkles } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="hero-section">
      <style>{`
        .hero-section {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, #1a3a2a 0%, #143025 50%, #0f261e 100%);
          display: flex;
          align-items: center;
          overflow: hidden;
          padding-top: 80px;
        }

        .hero-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          pointer-events: none;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1.5px, transparent 0);
          background-size: 40px 40px;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(100px);
        }

        .hero-orb-1 {
          top: -10%;
          right: -5%;
          width: 600px;
          height: 600px;
          background: rgba(201, 168, 76, 0.12);
          animation: heroFloat 8s ease-in-out infinite;
        }

        .hero-orb-2 {
          bottom: -10%;
          left: -5%;
          width: 500px;
          height: 500px;
          background: rgba(42, 106, 74, 0.25);
          animation: heroFloat 10s ease-in-out infinite reverse;
        }

        @keyframes heroFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 20px); }
        }

        .hero-curve {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: #faf8f4;
          pointer-events: none;
          clip-path: polygon(0 100%, 100% 100%, 100% 35%, 0 100%);
        }

        .hero-container {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 24px;
          width: 100%;
        }

        .hero-grid {
          display: grid;
          gap: 48px;
          align-items: center;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 28px;
          animation: heroFadeInLeft 1s ease-out;
        }

        @keyframes heroFadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(12px);
          border-radius: 999px;
          padding: 6px 16px 6px 6px;
          width: fit-content;
          transition: all 0.3s ease;
        }

        .hero-badge:hover {
          border-color: rgba(201, 168, 76, 0.35);
          background: rgba(255, 255, 255, 0.08);
        }

        .hero-badge-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hero-badge-text {
          color: #c9a84c;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .hero-headline-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .hero-headline {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.15;
          margin: 0;
        }

        .hero-headline-gold {
          color: #c9a84c;
        }

        .hero-subheadline {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 300;
          color: rgba(214, 211, 209, 0.7);
          font-style: italic;
          letter-spacing: 0.02em;
          margin: 0;
          margin-top: 12px;
        }

        .hero-accent-line {
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #c9a84c, transparent);
          border-radius: 2px;
          margin-top: 8px;
        }

        .hero-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.05rem;
          line-height: 1.7;
          color: rgba(214, 211, 209, 0.75);
          max-width: 520px;
          margin: 0;
          font-weight: 500;
        }

        .hero-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding-top: 8px;
        }

        .hero-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: #c9a84c;
          color: #1a3a2a;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(201, 168, 76, 0.2);
          border: none;
          cursor: pointer;
          white-space: nowrap;
        }

        .hero-btn-primary:hover {
          background: #d9b85c;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(201, 168, 76, 0.3);
        }

        .hero-btn-primary:hover .hero-arrow {
          transform: translateX(4px);
        }

        .hero-arrow {
          transition: transform 0.3s ease;
        }

        .hero-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: transparent;
          color: #ffffff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: 16px;
          text-decoration: none;
          border: 2px solid rgba(255, 255, 255, 0.12);
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .hero-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .hero-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          padding-top: 16px;
        }

        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: rgba(214, 211, 209, 0.65);
        }

        .hero-trust-icon {
          padding: 6px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hero-trust-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hero-right {
          display: none;
          position: relative;
        }

        .hero-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          position: relative;
        }

        .hero-stat-card {
          position: relative;
          padding: 32px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          transition: all 0.5s ease;
          overflow: hidden;
        }

        .hero-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(201, 168, 76, 0.05), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .hero-stat-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(201, 168, 76, 0.25);
          transform: translateY(-6px);
        }

        .hero-stat-card:hover::before {
          opacity: 1;
        }

        .hero-stat-card:nth-child(2) {
          margin-top: 40px;
        }

        .hero-stat-card:nth-child(3) {
          margin-top: -40px;
        }

        .hero-stat-sparkle {
          position: absolute;
          top: 16px;
          right: 20px;
          color: rgba(201, 168, 76, 0.15);
          transition: color 0.3s ease;
        }

        .hero-stat-card:hover .hero-stat-sparkle {
          color: rgba(201, 168, 76, 0.4);
        }

        .hero-stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #c9a84c;
          margin: 0 0 12px 0;
          position: relative;
        }

        .hero-stat-label {
          color: #ffffff;
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0 0 8px 0;
          position: relative;
        }

        .hero-stat-sub {
          color: rgba(214, 211, 209, 0.55);
          font-size: 0.75rem;
          line-height: 1.5;
          font-weight: 500;
          margin: 0;
          position: relative;
        }

        .hero-stats-glow {
          position: absolute;
          inset: -20px;
          background: rgba(201, 168, 76, 0.05);
          filter: blur(60px);
          border-radius: 50%;
          z-index: -1;
        }

        .hero-mobile-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 24px;
        }

        .hero-mobile-stat {
          padding: 20px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
        }

        .hero-mobile-number {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #c9a84c;
          margin: 0 0 6px 0;
        }

        .hero-mobile-label {
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0;
        }

        @media (min-width: 640px) {
          .hero-container {
            padding: 60px 48px;
          }
          .hero-headline {
            font-size: 3.5rem;
          }
          .hero-subheadline {
            font-size: 1.5rem;
          }
          .hero-desc {
            font-size: 1.15rem;
          }
        }

        @media (min-width: 1024px) {
          .hero-container {
            padding: 80px 64px;
          }
          .hero-grid {
            grid-template-columns: 7fr 5fr;
            gap: 64px;
          }
          .hero-headline {
            font-size: 4.5rem;
          }
          .hero-subheadline {
            font-size: 1.75rem;
          }
          .hero-left {
            margin-left: 32px;
          }
          .hero-right {
            display: block;
            animation: heroFadeInScale 1s ease-out 0.3s both;
          }
          .hero-mobile-stats {
            display: none;
          }
        }

        @keyframes heroFadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 480px) {
          .hero-buttons {
            flex-direction: column;
            width: 100%;
          }
          .hero-btn-primary,
          .hero-btn-secondary {
            width: 100%;
            justify-content: center;
          }
          .hero-trust {
            justify-content: center;
          }
          .hero-headline {
            font-size: 2.2rem;
          }
        }

        @media (max-width: 640px) {
          .hero-trust {
            gap: 16px;
          }
          .hero-trust-item {
            width: 100%;
          }
        }
      `}</style>

      <div className="hero-pattern" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-curve" />

      <div className="hero-container">
        <div className="hero-grid">
          <div className="hero-left">
            <div className="hero-badge">
              <div className="hero-badge-icon">
                <Sparkles size={12} color="#c9a84c" />
              </div>
              <span className="hero-badge-text">Official E-Services Portal</span>
            </div>

            <div className="hero-headline-box">
              <h1 className="hero-headline">
                Serbisyo{''}
                <span className="hero-headline-gold">Hub</span>
                <span className="hero-subheadline"><br></br>
                  Modernizing Community Service
                </span>
              </h1>
              <div className="hero-accent-line" />
            </div>

            <p className="hero-desc">
              Streamline your document requests. Access official barangay certificates
              online with our secure, paperless, and efficient processing system —
              no more long queues.
            </p>

            <div className="hero-buttons">
              <Link href="/dashboard/request" className="hero-btn-primary">
                Request Now
                <ArrowRight size={18} className="hero-arrow" />
              </Link>
              <Link href="/verify" className="hero-btn-secondary">
                Verify Certificate
              </Link>
            </div>

            <div className="hero-trust">
              {[
                { icon: ShieldCheck, label: 'Secure Encryption' },
                { icon: Clock, label: 'Rapid Turnaround' },
                { icon: FileCheck, label: 'DILG Compliant' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="hero-trust-item">
                  <div className="hero-trust-icon">
                    <Icon size={14} color="#c9a84c" />
                  </div>
                  <span className="hero-trust-label">{label}</span>
                </div>
              ))}
            </div>

            <div className="hero-mobile-stats">
              {[
                { number: '06', label: 'Document Types' },
                { number: '24h', label: 'Processing' },
                { number: '100%', label: 'Paperless' },
                { number: 'Fast', label: 'Access' },
              ].map((stat, i) => (
                <div key={i} className="hero-mobile-stat">
                  <p className="hero-mobile-number">{stat.number}</p>
                  <p className="hero-mobile-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-stats-grid">
              {[
                { number: '06', label: 'Document Types', sub: 'Clearance, Indigency, Residency, Business & More' },
                { number: '24h', label: 'Processing', sub: 'Average digital approval time' },
                { number: '100%', label: 'Paperless', sub: 'Environmentally friendly process' },
                { number: 'Fast', label: 'Access', sub: 'Skip the long physical queues' },
              ].map((stat, i) => (
                <div key={i} className="hero-stat-card">
                  <div className="hero-stat-sparkle">
                    <Sparkles size={24} />
                  </div>
                  <p className="hero-stat-number">{stat.number}</p>
                  <p className="hero-stat-label">{stat.label}</p>
                  <p className="hero-stat-sub">{stat.sub}</p>
                </div>
              ))}
            </div>
            <div className="hero-stats-glow" />
          </div>
        </div>
      </div>
    </section>
  )
}