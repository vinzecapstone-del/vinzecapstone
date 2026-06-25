'use client'

import { UserPlus, FileText, Bell, PackageCheck } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Create an Account',
    description: 'Register with your full name, email, and purok. Your Resident ID is generated automatically.',
    Icon: UserPlus,
  },
  {
    number: '02',
    title: 'Submit Your Request',
    description: 'Choose your certificate type, fill in your personal details, state your purpose, and upload a valid ID.',
    Icon: FileText,
  },
  {
    number: '03',
    title: 'Wait for Approval',
    description: 'Barangay staff will review your request and prepare your certificate. You\'ll be notified once it\'s ready.',
    Icon: Bell,
  },
  {
    number: '04',
    title: 'Pick Up at the Hall',
    description: 'Visit the Barangay Hall with your tracking number and a valid ID to claim your official certificate.',
    Icon: PackageCheck,
  },
]

export default function HowItWorksSection() {
  return (
    <section className="hiw-section" id="how-it-works">
      <style>{`
        .hiw-section {
          position: relative;
          min-height: 100vh;
          background: #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 96px 0;
        }

        .hiw-top-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26, 58, 42, 0.1), transparent);
        }

        .hiw-bottom-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26, 58, 42, 0.1), transparent);
        }

        .hiw-container {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
        }

        @media (min-width: 640px) {
          .hiw-container {
            padding: 0 48px;
          }
        }

        @media (min-width: 1024px) {
          .hiw-container {
            padding: 0 64px;
          }
        }

        /* Header */
        .hiw-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 80px;
          gap: 16px;
        }

        .hiw-label-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hiw-label-line {
          width: 32px;
          height: 2px;
          background: #c9a84c;
        }

        .hiw-label {
          color: #c9a84c;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .hiw-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a3a2a;
          line-height: 1.2;
          margin: 0;
        }

        .hiw-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 500;
          color: #7a6a55;
          max-width: 560px;
          margin: 0;
          line-height: 1.6;
        }

        @media (min-width: 640px) {
          .hiw-title {
            font-size: 3.5rem;
          }
        }

        @media (min-width: 1024px) {
          .hiw-title {
            font-size: 4rem;
          }
        }

        /* Grid */
        .hiw-grid {
          display: grid;
          gap: 48px;
          position: relative;
        }

        @media (min-width: 640px) {
          .hiw-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 48px 32px;
          }
        }

        @media (min-width: 1024px) {
          .hiw-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 32px;
          }
        }

        /* Timeline connector - desktop only */
        .hiw-timeline {
          display: none;
        }

        @media (min-width: 1024px) {
          .hiw-timeline {
            display: block;
            position: absolute;
            top: 56px;
            left: 0;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.4), transparent);
            z-index: 0;
          }
        }

        /* Step */
        .hiw-step {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .hiw-step:hover .hiw-step-title {
          color: #c9a84c;
        }

        .hiw-step:hover .hiw-icon-shadow {
          transform: rotate(20deg);
        }

        .hiw-step:hover .hiw-icon-box {
          transform: translateY(-12px);
        }

        /* Icon wrap */
        .hiw-icon-wrap {
          position: relative;
          margin-bottom: 40px;
          width: 112px;
          height: 112px;
        }

        .hiw-icon-shadow {
          position: absolute;
          inset: 0;
          background: rgba(201, 168, 76, 0.1);
          border-radius: 2.5rem;
          transform: rotate(12deg);
          transition: all 0.7s ease;
        }

        .hiw-icon-box {
          position: absolute;
          inset: 0;
          background: #1a3a2a;
          border-radius: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a84c;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transition: all 0.5s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .hiw-icon-box svg {
          width: 28px;
          height: 28px;
        }

        .hiw-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 40px;
          height: 40px;
          background: #c9a84c;
          color: #1a3a2a;
          font-size: 0.875rem;
          font-weight: 900;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid #f0ebe3;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        /* Text */
        .hiw-text {
          max-width: 240px;
        }

        .hiw-step-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 16px 0;
          transition: color 0.3s ease;
        }

        .hiw-step-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          line-height: 1.7;
          color: #7a6a55;
          margin: 0;
          font-weight: 500;
          opacity: 0.9;
        }

        /* Mobile vertical guide */
        .hiw-guide {
          display: flex;
          justify-content: center;
          margin-top: 48px;
          margin-bottom: 16px;
        }

        .hiw-guide-line {
          width: 1px;
          height: 64px;
          background: linear-gradient(180deg, #c9a84c, transparent);
          opacity: 0.3;
        }

        @media (min-width: 1024px) {
          .hiw-guide {
            display: none;
          }
        }

        /* Bottom divider */
        .hiw-bottom-divider {
          margin-top: 96px;
          display: flex;
          justify-content: center;
        }

        .hiw-divider-line {
          padding: 1px;
          background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.5), transparent);
          width: 100%;
          max-width: 512px;
        }

        /* Mobile padding adjustment */
        @media (max-width: 480px) {
          .hiw-section {
            padding: 64px 0;
          }
          .hiw-header {
            margin-bottom: 48px;
          }
          .hiw-title {
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="hiw-top-line" />

      <div className="hiw-container">
        {/* Header */}
        <div className="hiw-header">
          <div className="hiw-label-row">
            <div className="hiw-label-line" />
            <span className="hiw-label">Seamless Process</span>
            <div className="hiw-label-line" />
          </div>

          <h2 className="hiw-title">How It Works</h2>

          <p className="hiw-subtitle">
            A simple, hassle-free way to request your barangay certificates online —
            no need to line up. Just request, wait, and pick up.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="hiw-grid">
          <div className="hiw-timeline" />

          {steps.map((step, i) => (
            <div key={i} className="hiw-step">
              <div className="hiw-icon-wrap">
                <div className="hiw-icon-shadow" />
                <div className="hiw-icon-box">
                  <step.Icon />
                </div>
                <div className="hiw-badge">{step.number}</div>
              </div>

              <div className="hiw-text">
                <h3 className="hiw-step-title">{step.title}</h3>
                <p className="hiw-step-desc">{step.description}</p>
              </div>

              {i < steps.length - 1 && (
                <div className="hiw-guide">
                  <div className="hiw-guide-line" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom divider */}
        <div className="hiw-bottom-divider">
          <div className="hiw-divider-line" />
        </div>
      </div>

      <div className="hiw-bottom-line" />
    </section>
  )
}