'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, MapPin, Award, Heart, ShieldCheck, Sparkles } from 'lucide-react'

const officials = [
  { role: 'Barangay Captain', name: 'Hon. Eduardo I. Madeja' },
  { role: 'Barangay Secretary', name: 'Ellein Jane F. Maestro' },
  { role: 'Barangay Treasurer', name: 'Maria A. Ramal' },
]

export default function AboutSection() {
  const [residentCount, setResidentCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchCount = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'resident')
      setResidentCount(count ?? 0)
    }
    fetchCount()
  }, [])

  const stats = [
    {
      icon: Users,
      value: residentCount !== null ? `${residentCount.toLocaleString()}+` : '—',
      label: 'Registered Residents',
    },
    { icon: MapPin, value: '8', label: 'Local Puroks' },
    { icon: Award, value: '10+', label: 'Years of Service' },
    { icon: Heart, value: '100%', label: 'Community Driven' },
  ]

  return (
    <section className="abt-section" id="about">
      <style>{`
        .abt-section {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, #1a3a2a 0%, #143025 50%, #0f261e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 96px 0;
        }

        .abt-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          pointer-events: none;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1.5px, transparent 0);
          background-size: 48px 48px;
        }

        .abt-glow-1 {
          position: absolute;
          top: -10%;
          left: -5%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.05);
          filter: blur(120px);
          pointer-events: none;
        }

        .abt-glow-2 {
          position: absolute;
          bottom: -10%;
          right: -5%;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: rgba(42, 106, 74, 0.2);
          filter: blur(100px);
          pointer-events: none;
        }

        .abt-top-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.2), transparent);
        }

        .abt-bottom-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.2), transparent);
        }

        .abt-container {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
        }

        @media (min-width: 640px) {
          .abt-container {
            padding: 0 48px;
          }
        }

        @media (min-width: 1024px) {
          .abt-container {
            padding: 0 64px;
          }
        }

        .abt-grid {
          display: grid;
          gap: 64px;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .abt-grid {
            grid-template-columns: 7fr 5fr;
            gap: 64px;
          }
        }

        /* Left Column */
        .abt-left {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .abt-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .abt-label-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .abt-label-line {
          width: 40px;
          height: 2px;
          background: #c9a84c;
        }

        .abt-label {
          color: #c9a84c;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .abt-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.1;
          margin: 0;
        }

        .abt-title-gold {
          color: #c9a84c;
        }

        @media (min-width: 640px) {
          .abt-title {
            font-size: 3.5rem;
          }
        }

        @media (min-width: 1024px) {
          .abt-title {
            font-size: 3.75rem;
          }
        }

        .abt-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 640px;
        }

        .abt-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.05rem;
          line-height: 1.7;
          color: rgba(214, 211, 209, 0.8);
          margin: 0;
          font-weight: 500;
        }

        /* Officials Card */
        .abt-officials {
          padding: 32px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2rem;
          backdrop-filter: blur(12px);
          transition: all 0.5s ease;
          max-width: 100%;
        }

        @media (min-width: 640px) {
          .abt-officials {
            max-width: 448px;
          }
        }

        .abt-officials:hover {
          border-color: rgba(201, 168, 76, 0.3);
        }

        .abt-officials-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .abt-officials-icon {
          color: #c9a84c;
          width: 18px;
          height: 18px;
        }

        .abt-officials-label {
          color: #c9a84c;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .abt-officials-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .abt-official {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .abt-official:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .abt-official-role {
          color: rgba(214, 211, 209, 0.6);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .abt-official-name {
          color: #ffffff;
          font-size: 0.875rem;
          font-weight: 900;
        }

        /* Right Column — Stats */
        .abt-right {
          position: relative;
        }

        .abt-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          position: relative;
          z-index: 10;
        }

        .abt-stat-card {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2.5rem;
          padding: 40px 24px;
          text-align: center;
          backdrop-filter: blur(8px);
          transition: all 0.5s ease;
        }

        .abt-stat-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(201, 168, 76, 0.3);
          transform: translateY(-8px);
        }

        .abt-stat-card:nth-child(2) {
          margin-top: 32px;
        }

        .abt-stat-card:nth-child(3) {
          margin-top: -32px;
        }

        @media (max-width: 1023px) {
          .abt-stat-card:nth-child(2),
          .abt-stat-card:nth-child(3) {
            margin-top: 0;
          }
        }

        .abt-stat-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 1rem;
          background: rgba(201, 168, 76, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
        }

        .abt-stat-icon {
          color: #c9a84c;
          width: 24px;
          height: 24px;
        }

        .abt-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 2.25rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0 0 8px 0;
        }

        .abt-stat-label {
          color: rgba(214, 211, 209, 0.6);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          line-height: 1.3;
          margin: 0;
        }

        .abt-sparkle {
          position: absolute;
          top: -40px;
          right: -40px;
          color: rgba(201, 168, 76, 0.1);
          pointer-events: none;
        }

        @media (max-width: 1023px) {
          .abt-sparkle {
            display: none;
          }
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .abt-section {
            padding: 64px 0;
          }
          .abt-title {
            font-size: 2.2rem;
          }
          .abt-officials {
            padding: 24px;
          }
          .abt-stat-card {
            padding: 32px 16px;
            border-radius: 2rem;
          }
          .abt-stat-value {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 359px) {
          .abt-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="abt-pattern" />
      <div className="abt-glow-1" />
      <div className="abt-glow-2" />
      <div className="abt-top-line" />
      <div className="abt-bottom-line" />

      <div className="abt-container">
        <div className="abt-grid">
          {/* Left — text */}
          <div className="abt-left">
            <div className="abt-header">
              <div className="abt-label-row">
                <div className="abt-label-line" />
                <span className="abt-label">Our Identity</span>
              </div>
              <h2 className="abt-title">
                Serving Our Community <br />
                <span className="abt-title-gold">With Pride & Purpose</span>
              </h2>
            </div>

            <div className="abt-body">
              <p className="abt-text">
                Our barangay is committed to delivering efficient and transparent public service
                to all its residents. This official e-portal was designed to bridge the gap
                between governance and technology — making transactions easier, faster, and
                more accessible for everyone.
              </p>
              <p className="abt-text">
                Under the guidance of our local council, we continue to modernize our services
                while preserving the warmth and community spirit that has defined our barangay
                for generations.
              </p>
            </div>

            {/* Officials card */}
            <div className="abt-officials">
              <div className="abt-officials-header">
                <ShieldCheck className="abt-officials-icon" />
                <p className="abt-officials-label">Barangay Leadership</p>
              </div>
              <div className="abt-officials-list">
                {officials.map((official) => (
                  <div key={official.role} className="abt-official">
                    <span className="abt-official-role">{official.role}</span>
                    <span className="abt-official-name">{official.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — stats grid */}
          <div className="abt-right">
            <div className="abt-stats-grid">
              {stats.map(({ icon: Icon, value, label }, i) => (
                <div key={i} className="abt-stat-card">
                  <div className="abt-stat-icon-wrap">
                    <Icon className="abt-stat-icon" />
                  </div>
                  <p className="abt-stat-value">{value}</p>
                  <p className="abt-stat-label">{label}</p>
                </div>
              ))}
            </div>

            <div className="abt-sparkle">
              <Sparkles size={120} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}