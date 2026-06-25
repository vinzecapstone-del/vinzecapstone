'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react'

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const updateField = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSending(true)
    await new Promise(r => setTimeout(r, 1500))
    setSending(false)
    setSent(true)
    setForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSent(false), 5000)
  }

  const contactInfo = [
    {
      Icon: Phone,
      label: 'Phone Support',
      value: '+63 XXX XXX XXXX',
    },
    {
      Icon: Mail,
      label: 'Email Address',
      value: 'sample@mail.com',
    },
    {
      Icon: Clock,
      label: 'Office Hours',
      value: 'Mon – Fri, 8:00 AM – 5:00 PM',
    },
  ]

  return (
    <section className="cnt-section" id="contact">
      <style>{`
        .cnt-section {
          position: relative;
          min-height: 100vh;
          background: #faf8f4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 96px 0;
        }

        .cnt-top-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26, 58, 42, 0.1), transparent);
        }

        .cnt-bottom-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26, 58, 42, 0.1), transparent);
        }

        .cnt-container {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
        }

        @media (min-width: 640px) {
          .cnt-container {
            padding: 0 48px;
          }
        }

        @media (min-width: 1024px) {
          .cnt-container {
            padding: 0 64px;
          }
        }

        /* Header */
        .cnt-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 80px;
          gap: 16px;
        }

        .cnt-label-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cnt-label-line {
          width: 32px;
          height: 2px;
          background: #c9a84c;
        }

        .cnt-label {
          color: #c9a84c;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .cnt-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a3a2a;
          line-height: 1.2;
          margin: 0;
        }

        .cnt-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 500;
          color: #7a6a55;
          max-width: 560px;
          margin: 0;
          line-height: 1.6;
        }

        @media (min-width: 640px) {
          .cnt-title {
            font-size: 3.5rem;
          }
        }

        @media (min-width: 1024px) {
          .cnt-title {
            font-size: 4rem;
          }
        }

        /* Grid */
        .cnt-grid {
          display: grid;
          gap: 32px;
          align-items: stretch;
        }

        @media (min-width: 1024px) {
          .cnt-grid {
            grid-template-columns: 5fr 7fr;
            gap: 48px;
          }
        }

        /* Left Column */
        .cnt-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Map Card */
        .cnt-map-card {
          position: relative;
          background: #1a3a2a;
          border-radius: 2.5rem;
          overflow: hidden;
          flex: 1;
          min-height: 280px;
          border: 1px solid #1a3a2a;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cnt-map-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.1;
          transition: opacity 0.7s ease;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1.5px, transparent 0);
          background-size: 32px 32px;
        }

        .cnt-map-card:hover .cnt-map-pattern {
          opacity: 0.2;
        }

        .cnt-map-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 32px;
        }

        .cnt-map-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          border: 1px solid rgba(201, 168, 76, 0.2);
        }

        .cnt-map-icon {
          color: #c9a84c;
          width: 32px;
          height: 32px;
        }

        .cnt-map-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 8px 0;
        }

        .cnt-map-subtitle {
          color: #9abfa8;
          font-weight: 500;
          letter-spacing: 0.02em;
          margin: 0 0 24px 0;
        }

        .cnt-map-badge {
          padding: 8px 24px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        /* Contact Info Card */
        .cnt-info-card {
          background: #ffffff;
          border-radius: 2.5rem;
          border: 1px solid #e8e0d5;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .cnt-info-item {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .cnt-info-item:hover .cnt-info-icon-wrap {
          background: #1a3a2a;
        }

        .cnt-info-item:hover .cnt-info-icon {
          color: #c9a84c;
        }

        .cnt-info-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 1rem;
          background: #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .cnt-info-icon {
          color: #c9a84c;
          width: 18px;
          height: 18px;
          transition: color 0.3s ease;
        }

        .cnt-info-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cnt-info-label {
          font-size: 10px;
          font-weight: 900;
          color: #a8a29e;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0;
        }

        .cnt-info-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        /* Right Column — Form */
        .cnt-form-card {
          background: #ffffff;
          border-radius: 2.5rem;
          border: 1px solid #e8e0d5;
          padding: 40px;
          height: 100%;
          box-shadow: 0 20px 25px -5px rgba(26, 58, 42, 0.05);
          position: relative;
          overflow: hidden;
        }

        @media (max-width: 480px) {
          .cnt-form-card {
            padding: 32px 24px;
            border-radius: 2rem;
          }
        }

        /* Success State */
        .cnt-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 80px 0;
          text-align: center;
          animation: cntFadeIn 0.5s ease-out;
        }

        @keyframes cntFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .cnt-success-icon-wrap {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: #f0fdf4;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          border: 1px solid #dcfce7;
        }

        .cnt-success-icon {
          color: #16a34a;
          width: 48px;
          height: 48px;
        }

        .cnt-success-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.875rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 12px 0;
        }

        .cnt-success-text {
          color: #7a6a55;
          font-weight: 500;
          max-width: 320px;
          margin: 0;
        }

        /* Form */
        .cnt-form-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .cnt-form-header-icon {
          color: #c9a84c;
          width: 18px;
          height: 18px;
        }

        .cnt-form-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .cnt-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .cnt-form-row {
          display: grid;
          gap: 24px;
        }

        @media (min-width: 640px) {
          .cnt-form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .cnt-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cnt-label {
          font-size: 10px;
          font-weight: 900;
          color: #1a3a2a;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-left: 4px;
        }

        .cnt-label-required {
          color: #c9a84c;
        }

        .cnt-input {
          width: 100%;
          padding: 16px 20px;
          border-radius: 1rem;
          border: 1px solid #ddd5c8;
          background: rgba(250, 248, 244, 0.5);
          font-size: 0.875rem;
          color: #1a3a2a;
          transition: all 0.3s ease;
          outline: none;
        }

        .cnt-input:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
        }

        .cnt-textarea {
          width: 100%;
          padding: 20px;
          border-radius: 1rem;
          border: 1px solid #ddd5c8;
          background: rgba(250, 248, 244, 0.5);
          font-size: 0.875rem;
          color: #1a3a2a;
          resize: none;
          transition: all 0.3s ease;
          outline: none;
          min-height: 140px;
        }

        .cnt-textarea:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
        }

        .cnt-submit {
          width: 100%;
          padding: 20px;
          background: #1a3a2a;
          color: #c9a84c;
          font-weight: 900;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          border-radius: 1rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .cnt-submit:hover:not(:disabled) {
          background: #0f2419;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
        }

        .cnt-submit:active:not(:disabled) {
          transform: scale(0.98);
        }

        .cnt-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .cnt-submit-icon {
          width: 20px;
          height: 20px;
        }

        .cnt-spin {
          animation: cntSpin 1s linear infinite;
        }

        @keyframes cntSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .cnt-section {
            padding: 64px 0;
          }
          .cnt-header {
            margin-bottom: 48px;
          }
          .cnt-title {
            font-size: 2rem;
          }
          .cnt-map-card {
            min-height: 220px;
            border-radius: 2rem;
          }
          .cnt-info-card {
            border-radius: 2rem;
            padding: 24px;
          }
          .cnt-map-title {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="cnt-top-line" />

      <div className="cnt-container">
        {/* Header */}
        <div className="cnt-header">
          <div className="cnt-label-row">
            <div className="cnt-label-line" />
            <span className="cnt-label">Get In Touch</span>
            <div className="cnt-label-line" />
          </div>

          <h2 className="cnt-title">Contact Our Office</h2>

          <p className="cnt-subtitle">
            Have questions or concerns? Reach out to the Barangay Lonos office and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="cnt-grid">
          {/* Left Column */}
          <div className="cnt-left">
            {/* Map Card */}
            <div className="cnt-map-card">
              <div className="cnt-map-pattern" />
              <div className="cnt-map-content">
                <div className="cnt-map-icon-wrap">
                  <MapPin className="cnt-map-icon" />
                </div>
                <h3 className="cnt-map-title">Barangay Lonos</h3>
                <p className="cnt-map-subtitle">Romblon, Mimaropa, Philippines</p>
                <div className="cnt-map-badge">Official Government Seat</div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="cnt-info-card">
              {contactInfo.map((item, idx) => (
                <div key={idx} className="cnt-info-item">
                  <div className="cnt-info-icon-wrap">
                    <item.Icon className="cnt-info-icon" />
                  </div>
                  <div className="cnt-info-text">
                    <p className="cnt-info-label">{item.label}</p>
                    <p className="cnt-info-value">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Form */}
          <div className="cnt-form-card">
            {sent ? (
              <div className="cnt-success">
                <div className="cnt-success-icon-wrap">
                  <CheckCircle2 className="cnt-success-icon" />
                </div>
                <h3 className="cnt-success-title">Message Received</h3>
                <p className="cnt-success-text">
                  Thank you for reaching out. A barangay representative will review your message shortly.
                </p>
              </div>
            ) : (
              <div>
                <div className="cnt-form-header">
                  <Sparkles className="cnt-form-header-icon" />
                  <h3 className="cnt-form-header-title">Send us a Message</h3>
                </div>

                <form onSubmit={handleSubmit} className="cnt-form">
                  <div className="cnt-form-row">
                    <div className="cnt-field">
                      <label className="cnt-label">
                        Full Name <span className="cnt-label-required">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Juan dela Cruz"
                        value={form.name}
                        onChange={e => updateField('name', e.target.value)}
                        required
                        className="cnt-input"
                      />
                    </div>
                    <div className="cnt-field">
                      <label className="cnt-label">
                        Email Address <span className="cnt-label-required">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="juan@email.com"
                        value={form.email}
                        onChange={e => updateField('email', e.target.value)}
                        required
                        className="cnt-input"
                      />
                    </div>
                  </div>

                  <div className="cnt-field">
                    <label className="cnt-label">Subject</label>
                    <input
                      type="text"
                      placeholder="What is this regarding?"
                      value={form.subject}
                      onChange={e => updateField('subject', e.target.value)}
                      className="cnt-input"
                    />
                  </div>

                  <div className="cnt-field">
                    <label className="cnt-label">
                      Detailed Message <span className="cnt-label-required">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Please describe your inquiry or concern..."
                      value={form.message}
                      onChange={e => updateField('message', e.target.value)}
                      required
                      className="cnt-textarea"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="cnt-submit"
                  >
                    {sending ? (
                      <Loader2 className="cnt-submit-icon cnt-spin" />
                    ) : (
                      <Send className="cnt-submit-icon" />
                    )}
                    <span>{sending ? 'Processing...' : 'Send Message'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cnt-bottom-line" />
    </section>
  )
}