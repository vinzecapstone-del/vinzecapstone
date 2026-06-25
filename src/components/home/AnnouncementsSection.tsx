'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Megaphone, ArrowRight, Calendar, Sparkles } from 'lucide-react'
import type { Announcement } from '@/types'
import Link from 'next/link'

const FALLBACK: Announcement[] = [
  {
    id: '1',
    title: 'Barangay Hall Office Hours',
    content: 'The Barangay Hall is open Monday to Friday, 8:00 AM to 5:00 PM. Certificates may be picked up during these hours.',
    author_id: '',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Online Certificate Requests Now Available',
    content: 'Residents can now request Barangay Clearance, Certificate of Indigency, and Certificate of Residency through this portal.',
    author_id: '',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Reminder: Bring Valid ID When Picking Up',
    content: 'Please bring a valid government-issued ID when claiming your certificate at the Barangay Hall.',
    author_id: '',
    created_at: new Date().toISOString(),
  },
]

// Instantiating outside the component prevents dependency size mismatch errors entirely
const supabase = createClient()

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(FALLBACK)

  useEffect(() => {
    const loadAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      if (data && data.length > 0) setAnnouncements(data)
    }
    loadAnnouncements()
  }, []) // Safe, unchanging empty dependency array

  return (
    <section className="ann-section" id="announcements">
      <style>{`
        .ann-section {
          position: relative;
          min-height: 100vh;
          background: #faf8f4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 96px 0;
        }

        .ann-top-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26, 58, 42, 0.1), transparent);
        }

        .ann-bottom-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26, 58, 42, 0.1), transparent);
        }

        .ann-container {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
        }

        @media (min-width: 640px) {
          .ann-container {
            padding: 0 48px;
          }
        }

        @media (min-width: 1024px) {
          .ann-container {
            padding: 0 64px;
          }
        }

        .ann-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 80px;
          gap: 16px;
        }

        .ann-label-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ann-label-line {
          width: 32px;
          height: 2px;
          background: #c9a84c;
        }

        .ann-label {
          color: #c9a84c;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .ann-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a3a2a;
          line-height: 1.2;
          margin: 0;
        }

        .ann-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 500;
          color: #7a6a55;
          max-width: 560px;
          margin: 0;
          line-height: 1.6;
        }

        @media (min-width: 640px) {
          .ann-title {
            font-size: 3.5rem;
          }
        }

        @media (min-width: 1024px) {
          .ann-title {
            font-size: 4rem;
          }
        }

        .ann-grid {
          display: grid;
          gap: 24px;
          margin-bottom: 64px;
        }

        @media (min-width: 768px) {
          .ann-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
          }
        }

        .ann-card {
          position: relative;
          background: #ffffff;
          border-radius: 2.5rem;
          border: 1px solid #e8e0d5;
          padding: 40px;
          transition: all 0.5s ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .ann-card:hover {
          box-shadow: 0 25px 50px -12px rgba(26, 58, 42, 0.08);
          transform: translateY(-8px);
          border-color: #d4c4b0;
        }

        .ann-card:hover .ann-card-title {
          color: #c9a84c;
        }

        .ann-card:hover .ann-card-text {
          opacity: 1;
        }

        .ann-card:hover .ann-accent-bar {
          background: #c9a84c;
        }

        .ann-card:hover .ann-icon-box {
          background: #c9a84c;
        }

        .ann-card:hover .ann-icon {
          color: #1a3a2a;
        }

        .ann-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          position: relative;
          z-index: 10;
        }

        .ann-icon-box {
          width: 56px;
          height: 56px;
          border-radius: 1rem;
          background: #1a3a2a;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transition: background 0.5s ease;
          flex-shrink: 0;
        }

        .ann-icon {
          color: #c9a84c;
          transition: color 0.5s ease;
          width: 20px;
          height: 20px;
        }

        .ann-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
          gap: 8px;
        }

        .ann-date {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #9a8f7a;
        }

        .ann-date-icon {
          width: 12px;
          height: 12px;
        }

        .ann-date-text {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .ann-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(201, 168, 76, 0.1);
          color: #c9a84c;
          border-radius: 999px;
          border: 1px solid rgba(201, 168, 76, 0.2);
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ann-badge-icon {
          width: 10px;
          height: 10px;
        }

        .ann-card-body {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .ann-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3a2a;
          line-height: 1.25;
          margin: 0 0 16px 0;
          transition: color 0.3s ease;
        }

        .ann-card-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          line-height: 1.7;
          color: #7a6a55;
          margin: 0;
          font-weight: 500;
          opacity: 0.85;
          transition: opacity 0.3s ease;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ann-accent-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: transparent;
          transition: background 0.5s ease;
          border-bottom-left-radius: 2.5rem;
          border-bottom-right-radius: 2.5rem;
        }

        .ann-cta {
          display: flex;
          justify-content: center;
        }

        .ann-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 20px 40px;
          background: #1a3a2a;
          color: #c9a84c;
          font-weight: 900;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: none;
          border-radius: 1.25rem;
          transition: all 0.3s ease;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border: none;
          cursor: pointer;
        }

        .ann-btn:hover {
          background: #0f2419;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
          gap: 20px;
        }

        .ann-btn:active {
          transform: scale(0.97);
        }

        .ann-btn-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.3s ease;
        }

        .ann-btn:hover .ann-btn-icon {
          transform: translateX(8px);
        }

        @media (max-width: 480px) {
          .ann-section {
            padding: 64px 0;
          }
          .ann-header {
            margin-bottom: 48px;
          }
          .ann-title {
            font-size: 2rem;
          }
          .ann-card {
            padding: 32px 24px;
            border-radius: 2rem;
          }
          .ann-card-title {
            font-size: 1.25rem;
          }
        }

        @media (max-width: 767px) {
          .ann-grid {
            max-width: 480px;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>

      <div className="ann-top-line" />

      <div className="ann-container">
        <div className="ann-header">
          <div className="ann-label-row">
            <div className="ann-label-line" />
            <span className="ann-label">Community Updates</span>
            <div className="ann-label-line" />
          </div>

          <h2 className="ann-title">Latest Announcements</h2>

          <p className="ann-subtitle">
            Stay informed with the latest news, events, and important notices from the Barangay Lonos Council.
          </p>
        </div>

        <div className="ann-grid">
          {announcements.map((ann, i) => (
            <div key={ann.id} className="ann-card">
              <div className="ann-card-header">
                <div className="ann-icon-box">
                  <Megaphone className="ann-icon" />
                </div>
                <div className="ann-meta">
                  <div className="ann-date">
                    <Calendar className="ann-date-icon" />
                    <span className="ann-date-text">{formatDate(ann.created_at)}</span>
                  </div>
                  {i === 0 && (
                    <div className="ann-badge">
                      <Sparkles className="ann-badge-icon" />
                      <span>New</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="ann-card-body">
                <h3 className="ann-card-title">{ann.title}</h3>
                <p className="ann-card-text">{ann.content}</p>
              </div>

              <div className="ann-accent-bar" />
            </div>
          ))}
        </div>

        <div className="ann-cta">
          <Link href="/announcements" className="ann-btn">
            <span>View All Announcements</span>
            <ArrowRight className="ann-btn-icon" />
          </Link>
        </div>
      </div>

      <div className="ann-bottom-line" />
    </section>
  )
}