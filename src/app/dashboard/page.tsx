'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import {
  FilePlus, FileText, Clock, CheckCircle2, XCircle,
  MapPin, PackageCheck, User, ShieldCheck,
  ChevronRight, Landmark,
  TrendingUp
} from 'lucide-react'
import type { Profile, CertificateRequest } from '@/types'
import { CERTIFICATE_LABELS } from '@/types'

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; dot: string; label: string }> = {
  pending:   { bg: '#fefce8', border: '#fef9c3', text: '#854d0e', dot: '#eab308', label: 'Pending Review' },
  ready:     { bg: '#f0fdf4', border: '#dcfce7', text: '#166534', dot: '#22c55e', label: 'Ready for Pickup' },
  picked_up: { bg: '#eff6ff', border: '#dbeafe', text: '#1e40af', dot: '#3b82f6', label: 'Picked Up' },
  rejected:  { bg: '#fef2f2', border: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: 'Rejected' },
}

const CERT_ICONS: Record<string, string> = {
  clearance: '🏛️',
  indigency: '🤝',
  residency: '🏠',
  business_clearance: '🏢',
  tree_cutting: '🌳',
  cedula: '🪪',
}

export default function ResidentDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [requests, setRequests] = useState<CertificateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: reqs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('certificate_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])
      setProfile(prof)
      setRequests(reqs ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const counts = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    ready: requests.filter(r => r.status === 'ready').length,
    picked_up: requests.filter(r => r.status === 'picked_up').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }), [requests])

  const readyRequests = useMemo(() => 
    requests.filter(r => r.status === 'ready'),
  [requests])

  if (loading) return (
    <div className="rd-loading">
      <style>{`
        .rd-loading {
          display: flex;
          justify-content: center;
          padding: 80px 0;
        }
        .rd-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid #c9a84c;
          border-top-color: transparent;
          border-radius: 50%;
          animation: rdSpin 0.8s linear infinite;
        }
        @keyframes rdSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="rd-spinner" />
    </div>
  )

  return (
    <div className="rd-root">
      <style>{`
        .rd-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
          animation: rdFadeUp 0.5s ease-out;
        }

        @keyframes rdFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Welcome Banner */
        .rd-banner {
          position: relative;
          background: linear-gradient(135deg, #1a3a2a 0%, #143025 50%, #0f261e 100%);
          border-radius: 1rem;
          padding: 24px;
          overflow: hidden;
          border: 1px solid rgba(201, 168, 76, 0.12);
        }

        @media (min-width: 640px) {
          .rd-banner {
            padding: 32px;
            border-radius: 1.25rem;
          }
        }

        .rd-banner-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .rd-banner-glow {
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.08);
          filter: blur(80px);
          pointer-events: none;
        }

        .rd-banner-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (min-width: 640px) {
          .rd-banner-content {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .rd-banner-user {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .rd-avatar {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(201, 168, 76, 0.15);
          border: 1px solid rgba(201, 168, 76, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .rd-avatar {
            width: 64px;
            height: 64px;
            border-radius: 16px;
          }
        }

        .rd-avatar svg {
          width: 28px;
          height: 28px;
          color: #c9a84c;
        }

        .rd-banner-label {
          color: #9abfa8;
          font-size: 0.625rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin: 0 0 4px 0;
        }

        .rd-banner-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          .rd-banner-name {
            font-size: 1.5rem;
          }
        }

        .rd-banner-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
          flex-wrap: wrap;
        }

        .rd-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.625rem;
          font-weight: 700;
          color: #c9a84c;
          background: rgba(201, 168, 76, 0.1);
          padding: 2px 8px;
          border-radius: 8px;
          border: 1px solid rgba(201, 168, 76, 0.2);
        }

        .rd-badge svg {
          width: 10px;
          height: 10px;
        }

        .rd-location {
          font-size: 0.625rem;
          color: #7a9a88;
          font-weight: 600;
        }

        .rd-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: #c9a84c;
          color: #1a3a2a;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 8px 24px -4px rgba(201, 168, 76, 0.3);
          flex-shrink: 0;
          border: none;
          cursor: pointer;
        }

        .rd-btn-primary:hover {
          background: #ffffff;
          transform: translateY(-1px);
        }

        .rd-btn-primary:active {
          transform: scale(0.98);
        }

        .rd-btn-primary svg {
          width: 16px;
          height: 16px;
        }

        /* Stats Grid */
        .rd-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 640px) {
          .rd-stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }

        @media (min-width: 1024px) {
          .rd-stats-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .rd-stat-card {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rd-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(26, 58, 42, 0.1);
          border-color: #d4c4b0;
        }

        .rd-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-color);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .rd-stat-card:hover::before {
          opacity: 1;
        }

        .rd-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rd-stat-icon svg {
          width: 18px;
          height: 18px;
        }

        .rd-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
          line-height: 1;
        }

        .rd-stat-label {
          font-size: 0.625rem;
          font-weight: 700;
          color: #9a8f7a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 4px 0 0 0;
        }

        /* Alert Banner */
        .rd-alert {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 1rem;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .rd-alert {
            flex-direction: row;
            align-items: center;
            border-radius: 1.25rem;
            padding: 24px;
          }
        }

        .rd-alert-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #dcfce7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rd-alert-icon svg {
          width: 22px;
          height: 22px;
          color: #16a34a;
        }

        .rd-alert-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #166534;
          margin: 0;
        }

        .rd-alert-desc {
          font-size: 0.75rem;
          color: #15803d;
          margin: 4px 0 0 0;
          line-height: 1.5;
        }

        .rd-btn-green {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 18px;
          background: #16a34a;
          color: #ffffff;
          font-size: 0.6875rem;
          font-weight: 700;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
          flex-shrink: 0;
          border: none;
          cursor: pointer;
        }

        .rd-btn-green:hover {
          background: #15803d;
        }

        .rd-btn-green:active {
          transform: scale(0.98);
        }

        .rd-btn-green svg {
          width: 14px;
          height: 14px;
        }

        /* Table Card */
        .rd-table-card {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .rd-table-card {
            border-radius: 1.25rem;
          }
        }

        .rd-table-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @media (min-width: 640px) {
          .rd-table-header {
            padding: 24px 32px;
          }
        }

        .rd-table-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .rd-table-sub {
          font-size: 0.6875rem;
          color: #9a8f7a;
          margin: 4px 0 0 0;
          font-weight: 500;
        }

        .rd-view-all {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.625rem;
          font-weight: 700;
          color: #c9a84c;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .rd-view-all:hover {
          color: #1a3a2a;
        }

        .rd-view-all svg {
          width: 14px;
          height: 14px;
          transition: transform 0.2s ease;
        }

        .rd-view-all:hover svg {
          transform: translateX(2px);
        }

        .rd-table-body {
          display: flex;
          flex-direction: column;
        }

        .rd-table-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          gap: 16px;
          transition: background 0.2s ease;
          border-bottom: 1px solid #f7f4ef;
        }

        .rd-table-row:last-child {
          border-bottom: none;
        }

        .rd-table-row:hover {
          background: #faf8f4;
        }

        @media (min-width: 640px) {
          .rd-table-row {
            padding: 16px 32px;
          }
        }

        .rd-row-main {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .rd-row-emoji {
          font-size: 1.25rem;
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f4ef;
          border-radius: 10px;
          border: 1px solid #e8e0d5;
        }

        .rd-row-info {
          min-width: 0;
          flex: 1;
        }

        .rd-row-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a3a2a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rd-row-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0 0 0;
        }

        .rd-row-meta span {
          font-size: 0.6875rem;
          color: #9a8f7a;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rd-row-meta svg {
          width: 10px;
          height: 10px;
        }

        .rd-row-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .rd-row-price {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
          display: none;
        }

        @media (min-width: 640px) {
          .rd-row-price {
            display: block;
          }
        }

        .rd-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.6875rem;
          font-weight: 700;
          flex-shrink: 0;
          border: 1px solid transparent;
        }

        .rd-status::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--status-dot);
        }

        /* Empty State */
        .rd-empty {
          padding: 64px 24px;
          text-align: center;
        }

        @media (min-width: 640px) {
          .rd-empty {
            padding: 80px 24px;
          }
        }

        .rd-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #f7f4ef;
          border: 1px dashed #dcd2c1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .rd-empty-icon svg {
          width: 28px;
          height: 28px;
          color: #9a8f7a;
        }

        .rd-empty-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .rd-empty-desc {
          font-size: 0.75rem;
          color: #9a8f7a;
          margin: 8px auto 0;
          max-width: 280px;
          line-height: 1.5;
        }

        .rd-btn-dark {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding: 10px 20px;
          background: #1a3a2a;
          color: #c9a84c;
          font-size: 0.6875rem;
          font-weight: 700;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }

        .rd-btn-dark:hover {
          background: #0f2419;
        }

        .rd-btn-dark:active {
          transform: scale(0.98);
        }

        /* Action Cards */
        .rd-actions-grid {
          display: grid;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .rd-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .rd-action-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          border-radius: 1rem;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 1px solid;
        }

        @media (min-width: 640px) {
          .rd-action-card {
            padding: 28px;
            border-radius: 1.25rem;
          }
        }

        .rd-action-card:hover {
          transform: translateY(-2px);
        }

        .rd-action-card:active {
          transform: scale(0.98);
        }

        .rd-action-primary {
          background: #1a3a2a;
          border-color: #1a3a2a;
          box-shadow: 0 8px 24px -4px rgba(26, 58, 42, 0.2);
        }

        .rd-action-primary:hover {
          background: #0f2419;
          box-shadow: 0 12px 32px -4px rgba(26, 58, 42, 0.3);
        }

        .rd-action-secondary {
          background: #ffffff;
          border-color: #e8e0d5;
        }

        .rd-action-secondary:hover {
          border-color: rgba(201, 168, 76, 0.5);
          box-shadow: 0 8px 24px -4px rgba(201, 168, 76, 0.1);
        }

        .rd-action-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .rd-action-icon svg {
          width: 22px;
          height: 22px;
        }

        .rd-action-title {
          font-size: 0.875rem;
          font-weight: 700;
          margin: 0;
        }

        .rd-action-desc {
          font-size: 0.6875rem;
          margin: 4px 0 0 0;
          line-height: 1.5;
        }

        .rd-action-arrow {
          margin-left: auto;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .rd-action-card:hover .rd-action-arrow {
          transform: translateX(4px);
        }

        /* Services Section */
        .rd-services {
          background: #f7f4ef;
          border: 1px solid #e8e0d5;
          border-radius: 1rem;
          padding: 24px;
        }

        @media (min-width: 640px) {
          .rd-services {
            border-radius: 1.25rem;
            padding: 28px;
          }
        }

        .rd-services-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .rd-services-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #1a3a2a;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rd-services-icon svg {
          width: 15px;
          height: 15px;
          color: #c9a84c;
        }

        .rd-services-title {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .rd-services-grid {
          display: grid;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .rd-services-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .rd-service-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #ffffff;
          border: 1px solid #e8e0d5;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .rd-service-item:hover {
          border-color: rgba(201, 168, 76, 0.5);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .rd-service-emoji {
          font-size: 1.25rem;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .rd-service-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .rd-service-desc {
          font-size: 0.6875rem;
          color: #9a8f7a;
          margin: 4px 0 0 0;
          line-height: 1.5;
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .rd-root {
            gap: 16px;
          }
          .rd-stat-card {
            padding: 16px;
          }
          .rd-stat-icon {
            width: 36px;
            height: 36px;
          }
          .rd-stat-value {
            font-size: 1.25rem;
          }
        }
      `}</style>

      {/* Welcome Banner */}
      <div className="rd-banner">
        <div className="rd-banner-pattern" />
        <div className="rd-banner-glow" />
        <div className="rd-banner-content">
          <div className="rd-banner-user">
            <div className="rd-avatar">
              <User size={28} />
            </div>
            <div>
              <p className="rd-banner-label">Welcome Back</p>
              <h1 className="rd-banner-name">
                {profile?.full_name ?? 'Resident'}
              </h1>
              <div className="rd-banner-meta">
                <span className="rd-badge">
                  <ShieldCheck size={10} />
                  {profile?.resident_id ?? '—'}
                </span>
                <span className="rd-location">
                  {profile?.purok || 'Location Pending'}
                </span>
              </div>
            </div>
          </div>
          <Link href="/dashboard/request" className="rd-btn-primary">
            <FilePlus size={16} />
            New Request
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="rd-stats-grid">
        {[
          { label: 'Total', value: counts.total, icon: FileText, color: '#1a3a2a', bg: '#f0ebe3', accent: '#1a3a2a' },
          { label: 'Pending', value: counts.pending, icon: Clock, color: '#ca8a04', bg: '#fefce8', accent: '#eab308' },
          { label: 'Ready', value: counts.ready, icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4', accent: '#22c55e' },
          { label: 'Picked Up', value: counts.picked_up, icon: PackageCheck, color: '#2563eb', bg: '#eff6ff', accent: '#3b82f6' },
          { label: 'Rejected', value: counts.rejected, icon: XCircle, color: '#dc2626', bg: '#fef2f2', accent: '#ef4444' },
        ].map(({ label, value, icon: Icon, color, bg, accent }) => (
          <div
            key={label}
            className="rd-stat-card"
            style={{ '--accent-color': accent } as React.CSSProperties}
          >
            <div className="rd-stat-icon" style={{ background: bg, color }}>
              <Icon size={18} />
            </div>
            <div>
              <p className="rd-stat-value">{value}</p>
              <p className="rd-stat-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ready for Pickup Alert */}
      {readyRequests.length > 0 && (
        <div className="rd-alert">
          <div className="rd-alert-icon">
            <MapPin size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <p className="rd-alert-title">
              {readyRequests.length} certificate{readyRequests.length > 1 ? 's are' : ' is'} ready for pickup!
            </p>
            <p className="rd-alert-desc">
              Visit the Barangay Hall (Mon–Fri, 8AM–5PM) and bring a valid ID.
            </p>
          </div>
          <Link href="/dashboard/certificates" className="rd-btn-green">
            View All
            <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Recent Requests */}
      <div className="rd-table-card">
        <div className="rd-table-header">
          <div>
            <h2 className="rd-table-title">Recent Requests</h2>
            <p className="rd-table-sub">
              Last {requests.length} certificate request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/dashboard/certificates" className="rd-view-all">
            View All
            <ChevronRight size={14} />
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="rd-empty">
            <div className="rd-empty-icon">
              <FileText size={28} />
            </div>
            <p className="rd-empty-title">No active requests</p>
            <p className="rd-empty-desc">
              Start by clicking the "New Request" button to apply for your first certificate.
            </p>
            <Link href="/dashboard/request" className="rd-btn-dark">
              <FilePlus size={14} />
              Request Certificate
            </Link>
          </div>
        ) : (
          <div className="rd-table-body">
            {requests.map(req => {
              const statusStyle = STATUS_STYLES[req.status] || STATUS_STYLES.pending
              const certIcon = CERT_ICONS[req.certificate_type] ?? '📄'

              return (
                <div key={req.id} className="rd-table-row">
                  <div className="rd-row-main">
                    <span className="rd-row-emoji">{certIcon}</span>
                    <div className="rd-row-info">
                      <p className="rd-row-title">
                        {CERTIFICATE_LABELS[req.certificate_type]}
                      </p>
                      <div className="rd-row-meta">
                        <span>
                          <FileText size={10} />
                          {req.tracking_number}
                        </span>
                        <span>
                          <Clock size={10} />
                          {formatDate(req.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="rd-row-right">
                    <span className="rd-row-price">₱{req.amount}.00</span>
                    <span
                      className="rd-status"
                      style={{
                        background: statusStyle.bg,
                        borderColor: statusStyle.border,
                        color: statusStyle.text,
                        '--status-dot': statusStyle.dot,
                      } as React.CSSProperties}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rd-actions-grid">
        <Link href="/dashboard/request" className="rd-action-card rd-action-primary">
          <div className="rd-action-icon" style={{ background: 'rgba(201, 168, 76, 0.2)' }}>
            <FilePlus size={22} style={{ color: '#c9a84c' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="rd-action-title" style={{ color: '#c9a84c' }}>New Request</p>
            <p className="rd-action-desc" style={{ color: '#9abfa8' }}>
              Apply for barangay certificates online
            </p>
          </div>
          <ChevronRight size={18} className="rd-action-arrow" style={{ color: 'rgba(201, 168, 76, 0.6)' }} />
        </Link>

        <Link href="/dashboard/certificates" className="rd-action-card rd-action-secondary">
          <div className="rd-action-icon" style={{ background: '#f7f4ef' }}>
            <TrendingUp size={22} style={{ color: '#7a6a55' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="rd-action-title" style={{ color: '#1a3a2a' }}>Track Requests</p>
            <p className="rd-action-desc" style={{ color: '#9a8f7a' }}>
              Monitor status of your applications
            </p>
          </div>
          <ChevronRight size={18} className="rd-action-arrow" style={{ color: '#ddd5c8' }} />
        </Link>
      </div>

      {/* Services Section */}
      <div className="rd-services">
        <div className="rd-services-header">
          <div className="rd-services-icon">
            <Landmark size={15} />
          </div>
          <h3 className="rd-services-title">Barangay Services</h3>
        </div>
        <div className="rd-services-grid">
          {[
            { icon: '🏛️', title: 'Barangay Clearance', desc: 'For employment, business, or legal purposes' },
            { icon: '🤝', title: 'Certificate of Indigency', desc: 'Free for qualified residents' },
            { icon: '🏠', title: 'Certificate of Residency', desc: 'Proof of barangay residence' },
            { icon: '🏢', title: 'Business Clearance', desc: 'For small business operations' },
          ].map(service => (
            <div key={service.title} className="rd-service-item">
              <span className="rd-service-emoji">{service.icon}</span>
              <div>
                <p className="rd-service-title">{service.title}</p>
                <p className="rd-service-desc">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}