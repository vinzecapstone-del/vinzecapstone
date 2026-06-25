'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts'
import {
  FileText, Clock, CheckCircle2, XCircle, TrendingUp, Users
} from 'lucide-react'
import type { CertificateRequest } from '@/types'
import { CERTIFICATE_LABELS } from '@/types'
import { formatDate } from '@/lib/utils'

export default function StaffAnalyticsPage() {
  const [requests, setRequests] = useState<CertificateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [totalResidents, setTotalResidents] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const [{ data: reqs }, { count }] = await Promise.all([
        supabase
          .from('certificate_requests')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'resident'),
      ])
      setRequests(reqs ?? [])
      setTotalResidents(count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    ready: requests.filter(r => r.status === 'ready').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    revenue: requests
      .filter(r => r.payment_status === 'paid')
      .reduce((s, r) => s + r.amount, 0),
  }

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const label = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
    const dateStr = d.toISOString().split('T')[0]
    const dayReqs = requests.filter(r => r.created_at.startsWith(dateStr))
    return {
      label,
      clearance: dayReqs.filter(r => r.certificate_type === 'clearance').length,
      indigency: dayReqs.filter(r => r.certificate_type === 'indigency').length,
      residency: dayReqs.filter(r => r.certificate_type === 'residency').length,
      total: dayReqs.length,
    }
  })

  const typeBreakdown = [
    {
      name: 'Clearance',
      value: requests.filter(r => r.certificate_type === 'clearance').length,
    },
    {
      name: 'Indigency',
      value: requests.filter(r => r.certificate_type === 'indigency').length,
    },
    {
      name: 'Residency',
      value: requests.filter(r => r.certificate_type === 'residency').length,
    },
  ]

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    pending:  { bg: '#fef9c3', text: '#854d0e', dot: '#eab308' },
    approved: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
    ready:    { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
    rejected: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  }

  if (loading) return (
    <div className="anl-loading">
      <style>{`
        .anl-loading {
          display: flex;
          justify-content: center;
          padding: 80px 0;
        }
        .anl-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid #c9a84c;
          border-top-color: transparent;
          border-radius: 50%;
          animation: anlSpin 0.8s linear infinite;
        }
        @keyframes anlSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="anl-spinner" />
    </div>
  )

  return (
    <div className="anl-root">
      <style>{`
        .anl-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
          animation: anlFadeUp 0.5s ease-out;
        }

        @keyframes anlFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header Banner */
        .anl-header {
          position: relative;
          background: linear-gradient(135deg, #1a3a2a 0%, #143025 50%, #0f261e 100%);
          border-radius: 1rem;
          padding: 24px;
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .anl-header {
            padding: 32px;
            border-radius: 1.25rem;
          }
        }

        .anl-header-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .anl-header-glow {
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

        .anl-header-content {
          position: relative;
          z-index: 10;
        }

        .anl-header-label {
          color: #9abfa8;
          font-size: 0.875rem;
          margin: 0 0 4px 0;
        }

        .anl-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          .anl-header-title {
            font-size: 1.875rem;
          }
        }

        .anl-header-sub {
          color: #7a9a88;
          font-size: 0.75rem;
          margin: 8px 0 0 0;
        }

        /* Stats Grid */
        .anl-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 640px) {
          .anl-stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }

        @media (min-width: 1280px) {
          .anl-stats-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        .anl-stat-card {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .anl-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(26, 58, 42, 0.1);
        }

        .anl-stat-card::before {
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

        .anl-stat-card:hover::before {
          opacity: 1;
        }

        .anl-stat-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
        }

        .anl-stat-icon-wrap svg {
          width: 18px;
          height: 18px;
        }

        .anl-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 4px 0;
          position: relative;
          z-index: 2;
        }

        .anl-stat-label {
          font-size: 0.75rem;
          color: #9a8f7a;
          margin: 0;
          position: relative;
          z-index: 2;
        }

        /* Charts Grid */
        .anl-charts-grid {
          display: grid;
          gap: 24px;
        }

        @media (min-width: 1024px) {
          .anl-charts-grid {
            grid-template-columns: 2fr 1fr;
          }
        }

        .anl-chart-card {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          padding: 24px;
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .anl-chart-card {
            padding: 32px;
            border-radius: 1.25rem;
          }
        }

        .anl-chart-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 24px 0;
        }

        /* Table */
        .anl-table-card {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .anl-table-card {
            border-radius: 1.25rem;
          }
        }

        .anl-table-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f0ebe3;
        }

        @media (min-width: 640px) {
          .anl-table-header {
            padding: 24px 32px;
          }
        }

        .anl-table-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .anl-table-body {
          display: flex;
          flex-direction: column;
        }

        .anl-table-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          gap: 16px;
          transition: background 0.2s ease;
          border-bottom: 1px solid #f7f4ef;
        }

        .anl-table-row:last-child {
          border-bottom: none;
        }

        .anl-table-row:hover {
          background: #faf8f4;
        }

        @media (min-width: 640px) {
          .anl-table-row {
            padding: 16px 32px;
          }
        }

        .anl-row-main {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .anl-row-emoji {
          font-size: 1.25rem;
          flex-shrink: 0;
          width: 32px;
          text-align: center;
        }

        .anl-row-info {
          min-width: 0;
          flex: 1;
        }

        .anl-row-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a3a2a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .anl-row-meta {
          font-size: 0.75rem;
          color: #9a8f7a;
          margin: 4px 0 0 0;
        }

        .anl-row-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .anl-row-status::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--status-dot);
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .anl-root {
            gap: 16px;
          }
          .anl-stat-card {
            padding: 16px;
          }
          .anl-stat-icon-wrap {
            width: 36px;
            height: 36px;
            margin-bottom: 12px;
          }
          .anl-stat-value {
            font-size: 1.25rem;
          }
          .anl-chart-card {
            padding: 20px;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="anl-header">
        <div className="anl-header-pattern" />
        <div className="anl-header-glow" />
        <div className="anl-header-content">
          <p className="anl-header-label">Staff Portal</p>
          <h1 className="anl-header-title">Analytics Overview</h1>
          <p className="anl-header-sub">Real-time certificate request statistics</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="anl-stats-grid">
        {[
          {
            label: 'Total Requests',
            value: stats.total,
            icon: FileText,
            color: '#eff6ff',
            iconColor: '#2563eb',
            borderColor: '#dbeafe',
            accent: '#3b82f6',
          },
          {
            label: 'Pending',
            value: stats.pending,
            icon: Clock,
            color: '#fefce8',
            iconColor: '#ca8a04',
            borderColor: '#fef9c3',
            accent: '#eab308',
          },
          {
            label: 'Ready',
            value: stats.ready,
            icon: CheckCircle2,
            color: '#f0fdf4',
            iconColor: '#16a34a',
            borderColor: '#dcfce7',
            accent: '#22c55e',
          },
          {
            label: 'Rejected',
            value: stats.rejected,
            icon: XCircle,
            color: '#fef2f2',
            iconColor: '#dc2626',
            borderColor: '#fee2e2',
            accent: '#ef4444',
          },
          {
            label: 'Total Revenue',
            value: `₱${stats.revenue.toLocaleString()}`,
            icon: TrendingUp,
            color: '#faf7f0',
            iconColor: '#c9a84c',
            borderColor: '#f0e6d0',
            accent: '#c9a84c',
          },
          {
            label: 'Residents',
            value: totalResidents,
            icon: Users,
            color: '#faf5ff',
            iconColor: '#9333ea',
            borderColor: '#f3e8ff',
            accent: '#a855f7',
          },
        ].map(({ label, value, icon: Icon, color, iconColor, borderColor, accent }) => (
          <div
            key={label}
            className="anl-stat-card"
            style={{
              borderColor: borderColor,
              '--accent-color': accent,
            } as React.CSSProperties}
          >
            <div
              className="anl-stat-icon-wrap"
              style={{ background: color, color: iconColor }}
            >
              <Icon size={18} />
            </div>
            <p className="anl-stat-value">{value}</p>
            <p className="anl-stat-label">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="anl-charts-grid">
        {/* Line Chart */}
        <div className="anl-chart-card">
          <h2 className="anl-chart-title">Requests — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9a8f7a' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9a8f7a' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e8e0d5',
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  padding: '12px 16px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />
              <Line
                type="monotone"
                dataKey="clearance"
                stroke="#1a3a2a"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#1a3a2a', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                name="Clearance"
              />
              <Line
                type="monotone"
                dataKey="indigency"
                stroke="#c9a84c"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#c9a84c', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                name="Indigency"
              />
              <Line
                type="monotone"
                dataKey="residency"
                stroke="#5a8a6a"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#5a8a6a', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                name="Residency"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="anl-chart-card">
          <h2 className="anl-chart-title">By Certificate Type</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={typeBreakdown} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0ebe3"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#9a8f7a' }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9a8f7a' }}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e8e0d5',
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  padding: '12px 16px',
                }}
              />
              <Bar
                dataKey="value"
                fill="#1a3a2a"
                radius={[0, 8, 8, 0]}
                name="Requests"
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="anl-table-card">
        <div className="anl-table-header">
          <h2 className="anl-table-title">Recent Requests</h2>
        </div>
        <div className="anl-table-body">
          {requests.slice(0, 8).map(req => {
            const statusStyle = statusConfig[req.status] || statusConfig.pending
            return (
              <div key={req.id} className="anl-table-row">
                <div className="anl-row-main">
                  <span className="anl-row-emoji">
                    {req.certificate_type === 'clearance'
                      ? '🏛️'
                      : req.certificate_type === 'indigency'
                      ? '🤝'
                      : '🏠'}
                  </span>
                  <div className="anl-row-info">
                    <p className="anl-row-title">
                      {CERTIFICATE_LABELS[req.certificate_type]}
                    </p>
                    <p className="anl-row-meta">
                      {req.tracking_number} · {formatDate(req.created_at)}
                    </p>
                  </div>
                </div>
                <span
                  className="anl-row-status"
                  style={{
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    '--status-dot': statusStyle.dot,
                  } as React.CSSProperties}
                >
                  {req.status}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}