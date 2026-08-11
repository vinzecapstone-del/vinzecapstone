'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, stripLogoSeal } from '@/lib/utils'
import {
  Search, FileText, CheckCircle2, Clock,
  RefreshCw, MapPin, PackageCheck, Loader2, Eye, Download, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import type { CertificateRequest } from '@/types'
import { CERTIFICATE_LABELS } from '@/types'

const steps = ['Submitted', 'Under Review', 'Ready for Pickup', 'Picked Up']

const STATUS_CONFIG: Record<string, { bg: string; border: string; text: string; dot: string; label: string }> = {
  pending:   { bg: '#fefce8', border: '#fef9c3', text: '#854d0e', dot: '#eab308', label: 'Pending' },
  ready:     { bg: '#f0fdf4', border: '#dcfce7', text: '#166534', dot: '#22c55e', label: 'Ready for Pickup' },
  picked_up: { bg: '#eff6ff', border: '#dbeafe', text: '#1e40af', dot: '#3b82f6', label: 'Picked Up' },
  rejected:  { bg: '#fef2f2', border: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: 'Rejected' },
}

const CERT_EMOJIS: Record<string, string> = {
  clearance: '🏛️',
  indigency: '🤝',
  residency: '🏠',
  business_clearance: '🏢',
  tree_cutting: '🌳',
  cedula: '🪪',
}

export default function CertificatesPage() {
  const [requests, setRequests] = useState<CertificateRequest[]>([])
  const [filtered, setFiltered] = useState<CertificateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pickingUp, setPickingUp] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchRequests = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    const controller = new AbortController()
    try {
      const { data: { user } } = await supabaseRef.current.auth.getUser()
      if (!user) {
        setLoading(false)
        setRefreshing(false)
        return
      }

      const { data, error } = await supabaseRef.current
        .from('certificate_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal)

      if (error) {
        if (!error.message?.includes('AbortError')) {
          console.error('Fetch error:', error)
        }
      } else {
        setRequests(data ?? [])
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('Unexpected error:', err)
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  useEffect(() => {
    intervalRef.current = setInterval(() => fetchRequests(), 15000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetchRequests])

  useEffect(() => {
    const handleFocus = () => fetchRequests()
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchRequests()
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchRequests])

  useEffect(() => {
    let result = requests
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter)
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(r =>
        r.tracking_number.toLowerCase().includes(s) ||
        CERTIFICATE_LABELS[r.certificate_type].toLowerCase().includes(s)
      )
    }
    setFiltered(result)
  }, [search, statusFilter, requests])

  const handleMarkPickedUp = async (id: string) => {
    setPickingUp(id)
    const { data: { user } } = await supabaseRef.current.auth.getUser()

    if (!user) {
      toast.error("Session expired. Please log in again.")
      setPickingUp(null)
      return
    }

    const { error } = await supabaseRef.current
      .from('certificate_requests')
      .update({
        status: 'picked_up',
        picked_up_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Pickup error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      toast.error(error.message || 'Failed to update. Please check database permissions.')
    } else {
      toast.success('Certificate marked as picked up!')
      setRequests(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'picked_up' as any } : r
      ))
      setConfirmModal(null)
    }
    setPickingUp(null)
  }

  const handlePrint = (html: string) => {
    const win = window.open('', '_blank')
    if (!win) return
    const cleaned = stripLogoSeal(html)
    win.document.write(cleaned)
    win.document.close()
    win.onload = () => win.print()
  }

  const getStepIndex = (status: string) => {
    if (status === 'pending') return 0
    if (status === 'approved') return 1
    if (status === 'ready') return 2
    if (status === 'picked_up') return 3
    return -1
  }

  return (
    <div className="cert-root">
      <style>{`
        .cert-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
          animation: certFadeUp 0.5s ease-out;
        }

        @keyframes certFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header Banner */
        .cert-header {
          position: relative;
          background: linear-gradient(135deg, #1a3a2a 0%, #143025 50%, #0f261e 100%);
          border-radius: 1rem;
          padding: 24px;
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .cert-header {
            padding: 32px;
            border-radius: 1.25rem;
          }
        }

        .cert-header-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .cert-header-glow {
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

        .cert-header-content {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .cert-header-text {
          flex: 1;
          min-width: 0;
        }

        .cert-header-label {
          color: #9abfa8;
          font-size: 0.875rem;
          margin: 0 0 4px 0;
        }

        .cert-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          .cert-header-title {
            font-size: 1.875rem;
          }
        }

        .cert-header-sub {
          color: #7a9a88;
          font-size: 0.75rem;
          margin: 8px 0 0 0;
        }

        .cert-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(201, 168, 76, 0.2);
          color: #c9a84c;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .cert-refresh-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(201, 168, 76, 0.4);
        }

        .cert-refresh-btn:active {
          transform: scale(0.98);
        }

        .cert-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cert-refresh-btn svg {
          width: 13px;
          height: 13px;
        }

        .cert-refresh-btn .cert-spin {
          animation: certSpin 0.8s linear infinite;
        }

        @keyframes certSpin {
          to { transform: rotate(360deg); }
        }

        /* Filters */
        .cert-filters {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .cert-filters {
            flex-direction: row;
            align-items: center;
            gap: 12px;
          }
        }

        .cert-search-wrap {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .cert-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: #9a8f7a;
          pointer-events: none;
        }

        .cert-input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          border-radius: 10px;
          border: 1px solid #ddd5c8;
          background: #ffffff;
          font-size: 0.875rem;
          color: #1a3a2a;
          transition: all 0.2s ease;
          outline: none;
        }

        .cert-input::placeholder {
          color: #b0a490;
        }

        .cert-input:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
        }

        .cert-select {
          padding: 10px 36px 10px 14px;
          border-radius: 10px;
          border: 1px solid #ddd5c8;
          background: #ffffff;
          font-size: 0.875rem;
          color: #1a3a2a;
          transition: all 0.2s ease;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239a8f7a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          cursor: pointer;
        }

        .cert-select:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
        }

        /* Notice */
        .cert-notice {
          background: rgba(26, 58, 42, 0.04);
          border: 1px solid rgba(26, 58, 42, 0.08);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .cert-notice svg {
          width: 16px;
          height: 16px;
          color: #1a3a2a;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .cert-notice-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .cert-notice-desc {
          font-size: 0.75rem;
          color: #7a6a55;
          margin: 4px 0 0 0;
          line-height: 1.5;
        }

        .cert-notice-desc strong {
          color: #1a3a2a;
        }

        /* Loading */
        .cert-loading {
          display: flex;
          justify-content: center;
          padding: 80px 0;
        }

        .cert-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid #c9a84c;
          border-top-color: transparent;
          border-radius: 50%;
          animation: certSpin 0.8s linear infinite;
        }

        /* Empty State */
        .cert-empty {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          padding: 64px 24px;
          text-align: center;
        }

        @media (min-width: 640px) {
          .cert-empty {
            border-radius: 1.25rem;
            padding: 80px 24px;
          }
        }

        .cert-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: #f7f4ef;
          border: 1px dashed #dcd2c1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .cert-empty-icon svg {
          width: 24px;
          height: 24px;
          color: #9a8f7a;
        }

        .cert-empty-title {
          font-size: 1rem;
          font-weight: 700;
          color: #5a5040;
          margin: 0;
        }

        /* Cards */
        .cert-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cert-card {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .cert-card:hover {
          box-shadow: 0 8px 24px -4px rgba(26, 58, 42, 0.08);
          border-color: #d4c4b0;
        }

        @media (min-width: 640px) {
          .cert-card {
            border-radius: 1.25rem;
          }
        }

        .cert-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #f7f4ef;
        }

        @media (min-width: 640px) {
          .cert-card-header {
            padding: 20px 24px;
          }
        }

        .cert-card-main {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .cert-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .cert-card-info {
          min-width: 0;
        }

        .cert-card-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cert-card-meta {
          font-size: 0.75rem;
          color: #9a8f7a;
          margin: 4px 0 0 0;
        }

        .cert-status {
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

        .cert-status::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--status-dot);
        }

        .cert-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .cert-card-body {
            padding: 24px;
          }
        }

        /* Timeline */
        .cert-timeline {
          display: flex;
          align-items: flex-start;
        }

        .cert-timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .cert-timeline-step:last-child {
          flex: none;
        }

        .cert-timeline-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ddd5c8;
          background: #ffffff;
          transition: all 0.3s ease;
          position: relative;
          z-index: 2;
        }

        .cert-timeline-dot-done {
          background: #1a3a2a;
          border-color: #1a3a2a;
        }

        .cert-timeline-dot svg {
          width: 14px;
          height: 14px;
        }

        .cert-timeline-dot-done svg {
          color: #c9a84c;
        }

        .cert-timeline-dot-pending svg {
          color: #b0a898;
        }

        .cert-timeline-label {
          font-size: 0.625rem;
          font-weight: 600;
          margin-top: 8px;
          text-align: center;
          line-height: 1.3;
          max-width: 80px;
          transition: color 0.3s ease;
        }

        .cert-timeline-label-active {
          color: #1a3a2a;
          font-weight: 700;
        }

        .cert-timeline-label-pending {
          color: #b0a898;
        }

        .cert-timeline-line {
          position: absolute;
          top: 14px;
          left: 50%;
          right: -50%;
          height: 2px;
          background: #e8e0d5;
          z-index: 1;
          transition: background 0.3s ease;
        }

        .cert-timeline-line-done {
          background: #1a3a2a;
        }

        .cert-timeline-step:last-child .cert-timeline-line {
          display: none;
        }

        /* Alert boxes inside card */
        .cert-alert {
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cert-alert-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .cert-alert-success-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #166534;
          margin: 0;
        }

        .cert-alert-success-desc {
          font-size: 0.75rem;
          color: #15803d;
          margin: 0;
          line-height: 1.5;
        }

        .cert-alert-rejected {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          flex-direction: row;
          align-items: flex-start;
        }

        .cert-alert-rejected svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .cert-alert-rejected-title {
          font-size: 0.8125rem;
          font-weight: 700;
          margin: 0 0 4px;
        }

        .cert-alert-rejected-desc {
          font-size: 0.75rem;
          line-height: 1.5;
          margin: 0;
        }

        .cert-btn-pickup {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #1a3a2a;
          color: #c9a84c;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          align-self: flex-start;
        }

        .cert-btn-pickup:hover {
          background: #0f2419;
        }

        .cert-btn-pickup:active {
          transform: scale(0.98);
        }

        .cert-btn-pickup svg {
          width: 13px;
          height: 13px;
        }

        .cert-alert-done {
          background: #f7f4ef;
          border: 1px solid #e8e0d5;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cert-alert-done svg {
          width: 15px;
          height: 15px;
          color: #1a3a2a;
          flex-shrink: 0;
        }

        .cert-alert-done p {
          font-size: 0.875rem;
          color: #5a5040;
          margin: 0;
        }

        /* Card footer */
        .cert-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cert-purpose {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .cert-purpose-label {
          font-size: 0.75rem;
          color: #9a8f7a;
        }

        .cert-purpose-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: #5a5040;
          background: #f7f4ef;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .cert-actions {
          display: flex;
          gap: 8px;
        }

        .cert-btn-sm {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.625rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .cert-btn-sm-outline {
          background: transparent;
          border: 1px solid #ddd5c8;
          color: #5a5040;
        }

        .cert-btn-sm-outline:hover {
          background: #f7f4ef;
        }

        .cert-btn-sm-dark {
          background: #1a3a2a;
          color: #c9a84c;
        }

        .cert-btn-sm-dark:hover {
          background: #0f2419;
        }

        .cert-btn-sm svg {
          width: 12px;
          height: 12px;
        }

        /* Modal Overlay */
        .cert-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 58, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: certFadeIn 0.2s ease-out;
        }

        @keyframes certFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cert-modal {
          background: #ffffff;
          border-radius: 1.25rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 20px 60px -12px rgba(26, 58, 42, 0.2);
          padding: 28px;
          width: 100%;
          max-width: 400px;
          animation: certScaleUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes certScaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .cert-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a3a2a;
          text-align: center;
          margin: 0 0 8px 0;
        }

        .cert-modal-desc {
          font-size: 0.875rem;
          color: #7a6a55;
          text-align: center;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .cert-modal-actions {
          display: flex;
          gap: 12px;
        }

        .cert-modal-btn {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .cert-modal-btn-outline {
          background: transparent;
          border: 1px solid #ddd5c8;
          color: #5a5040;
        }

        .cert-modal-btn-outline:hover {
          background: #f7f4ef;
        }

        .cert-modal-btn-dark {
          background: #1a3a2a;
          color: #c9a84c;
        }

        .cert-modal-btn-dark:hover {
          background: #0f2419;
        }

        .cert-modal-btn-dark:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cert-modal-btn-dark svg {
          width: 14px;
          height: 14px;
        }

        /* Preview Modal */
        .cert-preview-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 58, 42, 0.6);
          backdrop-filter: blur(6px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: certFadeIn 0.2s ease-out;
        }

        .cert-preview {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 20px 60px -12px rgba(26, 58, 42, 0.25);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: certScaleUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cert-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 24px;
          border-bottom: 1px solid #f0ebe3;
          flex-wrap: wrap;
        }

        .cert-preview-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .cert-preview-actions {
          display: flex;
          gap: 8px;
        }

        .cert-preview-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .cert-preview-btn-dark {
          background: #1a3a2a;
          color: #c9a84c;
        }

        .cert-preview-btn-dark:hover {
          background: #0f2419;
        }

        .cert-preview-btn-outline {
          background: transparent;
          border: 1px solid #ddd5c8;
          color: #5a5040;
        }

        .cert-preview-btn-outline:hover {
          background: #f7f4ef;
        }

        .cert-preview-btn svg {
          width: 13px;
          height: 13px;
        }

        .cert-preview-body {
          flex: 1;
          overflow: auto;
          padding: 16px;
          background: #f7f4ef;
        }

        .cert-preview-frame {
          width: 100%;
          max-width: 816px;
          aspect-ratio: 816 / 1056;
          margin: 0 auto;
          border: none;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-radius: 4px;
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .cert-root {
            gap: 16px;
          }
          .cert-header {
            padding: 20px;
          }
          .cert-header-title {
            font-size: 1.25rem;
          }
          .cert-card-header {
            padding: 14px 16px;
          }
          .cert-card-body {
            padding: 16px;
          }
          .cert-timeline-label {
            font-size: 0.5625rem;
            max-width: 60px;
          }
          .cert-modal {
            padding: 24px 20px;
          }
          .cert-preview-header {
            padding: 14px 16px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="cert-header">
        <div className="cert-header-pattern" />
        <div className="cert-header-glow" />
        <div className="cert-header-content">
          <div className="cert-header-text">
            <p className="cert-header-label">Resident Portal</p>
            <h1 className="cert-header-title">My Certificates</h1>
            <p className="cert-header-sub">Track the status of your barangay certificate requests</p>
          </div>
          <button
            onClick={() => fetchRequests(true)}
            disabled={refreshing}
            className="cert-refresh-btn"
          >
            <RefreshCw className={refreshing ? 'cert-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="cert-filters">
        <div className="cert-search-wrap">
          <Search className="cert-search-icon" />
          <input
            type="text"
            placeholder="Search by tracking number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="cert-input"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="cert-select"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="ready">Ready for Pickup</option>
          <option value="picked_up">Picked Up</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Notice */}
      <div className="cert-notice">
        <MapPin size={16} />
        <div>
          <p className="cert-notice-title">Pickup at the Barangay Hall</p>
          <p className="cert-notice-desc">
            Once your request is marked <strong>Ready for Pickup</strong>, visit the Barangay Hall
            during office hours. Please bring a valid ID and your tracking number.
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="cert-loading">
          <div className="cert-spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="cert-empty">
          <div className="cert-empty-icon">
            <FileText size={24} />
          </div>
          <p className="cert-empty-title">No certificates found</p>
        </div>
      ) : (
        <div className="cert-cards">
          {filtered.map(req => {
            const stepIndex = getStepIndex(req.status)
            const statusStyle = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
            const emoji = CERT_EMOJIS[req.certificate_type] ?? '📄'

            return (
              <div key={req.id} className="cert-card">
                <div className="cert-card-header">
                  <div className="cert-card-main">
                    <div className="cert-card-icon">{emoji}</div>
                    <div className="cert-card-info">
                      <p className="cert-card-title">{CERTIFICATE_LABELS[req.certificate_type]}</p>
                      <p className="cert-card-meta">{req.tracking_number} · {formatDate(req.created_at)}</p>
                    </div>
                  </div>
                  <span
                    className="cert-status"
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

                <div className="cert-card-body">
                  {req.status !== 'rejected' && (
                    <div className="cert-timeline">
                      {steps.map((step, i) => {
                        const done = i <= stepIndex
                        const active = i === stepIndex
                        return (
                          <div key={step} className="cert-timeline-step">
                            <div
                              className="cert-timeline-line"
                              style={done && i < stepIndex ? { background: '#1a3a2a' } : {}}
                            />
                            <div className={`cert-timeline-dot ${done ? 'cert-timeline-dot-done' : ''}`}>
                              {done ? <CheckCircle2 size={14} /> : <Clock size={12} />}
                            </div>
                            <span className={`cert-timeline-label ${active ? 'cert-timeline-label-active' : 'cert-timeline-label-pending'}`}>
                              {step}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {req.status === 'ready' && (
                    <div className="cert-alert cert-alert-success">
                      <p className="cert-alert-success-title">Your Certificate is Ready! 🎉</p>
                      <p className="cert-alert-success-desc">
                        Visit the Hall with ID and tracking number.
                      </p>
                      <button
                        onClick={() => setConfirmModal(req.id)}
                        className="cert-btn-pickup"
                      >
                        <PackageCheck size={13} />
                        I Already Picked This Up
                      </button>
                    </div>
                  )}

                  {req.status === 'rejected' && (
                    <div className="cert-alert cert-alert-rejected">
                      <AlertCircle size={16} />
                      <div>
                        <p className="cert-alert-rejected-title">Request Rejected</p>
                        <p className="cert-alert-rejected-desc">
                          {req.rejection_reason
                            ? `Reason: ${req.rejection_reason}`
                            : 'Please contact the barangay office for more information.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {req.status === 'picked_up' && (
                    <div className="cert-alert-done">
                      <PackageCheck size={15} />
                      <p>Certificate successfully claimed.</p>
                    </div>
                  )}

                  <div className="cert-card-footer">
                    <div className="cert-purpose">
                      <span className="cert-purpose-label">Purpose:</span>
                      <span className="cert-purpose-value">{req.purpose}</span>
                    </div>
                    {(req.status === 'ready' || req.status === 'picked_up') && req.certificate_html && (
                      <div className="cert-actions">
                        <button
                            onClick={() => setPreviewHtml(stripLogoSeal(req.certificate_html!))}
                            className="cert-btn-sm cert-btn-sm-outline"
                          >
                          <Eye size={12} />
                          Preview
                        </button>
                        <button
                          onClick={() => handlePrint(stripLogoSeal(req.certificate_html!))}
                          className="cert-btn-sm cert-btn-sm-dark"
                        >
                          <Download size={12} />
                          Print
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm Pickup Modal */}
      {confirmModal && (
        <div className="cert-modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="cert-modal" onClick={e => e.stopPropagation()}>
            <h3 className="cert-modal-title">Confirm Pickup</h3>
            <p className="cert-modal-desc">
              Are you sure you have picked up this certificate?
            </p>
            <div className="cert-modal-actions">
              <button
                onClick={() => setConfirmModal(null)}
                className="cert-modal-btn cert-modal-btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkPickedUp(confirmModal)}
                disabled={pickingUp === confirmModal}
                className="cert-modal-btn cert-modal-btn-dark"
              >
                {pickingUp === confirmModal && <Loader2 className="cert-spin" />}
                {pickingUp === confirmModal ? 'Updating...' : 'Yes, Picked Up'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewHtml !== null && (
        <div className="cert-preview-overlay" onClick={() => setPreviewHtml(null)}>
          <div className="cert-preview" onClick={e => e.stopPropagation()}>
            <div className="cert-preview-header">
              <h3 className="cert-preview-title">Certificate Preview</h3>
              <div className="cert-preview-actions">
                <button
                  onClick={() => handlePrint(previewHtml)}
                  className="cert-preview-btn cert-preview-btn-dark"
                >
                  <Download size={13} />
                  Print
                </button>
                <button
                  onClick={() => setPreviewHtml(null)}
                  className="cert-preview-btn cert-preview-btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="cert-preview-body">
              <iframe
                srcDoc={previewHtml}
                className="cert-preview-frame"
                title="Certificate Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
