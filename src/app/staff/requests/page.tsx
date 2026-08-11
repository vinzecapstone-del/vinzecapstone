'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Search, CheckCircle2, XCircle, Loader2, Clock,
  ExternalLink, Eye, Download, MapPin, Filter,
  FileText, Calendar, User, AlertCircle, PackageCheck,
  Hash
} from 'lucide-react'
import type { CertificateRequest, Profile, SystemSettings } from '@/types'
import { CERTIFICATE_LABELS, REQUEST_STATUS_LABELS } from '@/types'



type RequestWithProfile = CertificateRequest & { profiles: Profile | null }

interface RejectModal {
  id: string
  name: string
}

const CERT_ICONS: Record<string, string> = {
  clearance: '🏛️',
  indigency: '🤝',
  residency: '🏠',
  business_clearance: '🏢',
  tree_cutting: '🌳',
  cedula: '🪪',
}

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; dot: string; label: string }> = {
  pending:   { bg: '#fefce8', border: '#fef9c3', text: '#854d0e', dot: '#eab308', label: 'Pending Review' },
  ready:     { bg: '#f0fdf4', border: '#dcfce7', text: '#166534', dot: '#22c55e', label: 'Ready for Pickup' },
  picked_up: { bg: '#eff6ff', border: '#dbeafe', text: '#1e40af', dot: '#3b82f6', label: 'Picked Up' },
  rejected:  { bg: '#fef2f2', border: '#fee2e2', text: '#991b1b', dot: '#ef4444', label: 'Rejected' },
  approved:  { bg: '#f0fdf4', border: '#dcfce7', text: '#166534', dot: '#22c55e', label: 'Approved' },
}

function generateCertificateHTML(req: RequestWithProfile, settings: SystemSettings): string {
  const today = new Date().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const fullName = req.applicant_name ?? req.profiles?.full_name ?? '—'
  const purok = req.applicant_purok ?? req.profiles?.purok ?? 'this barangay'
  const bdRaw = req.applicant_birthdate ?? req.profiles?.birthdate
  const birthdate = bdRaw
    ? new Date(bdRaw).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'
  const address = req.applicant_address ?? ''

  const titles: Record<string, string> = {
    clearance: 'BARANGAY CLEARANCE',
    indigency: 'CERTIFICATE OF INDIGENCY',
    residency: 'CERTIFICATE OF RESIDENCY',
    business_clearance: 'BUSINESS CLEARANCE',
    tree_cutting: 'TREE CUTTING PERMIT',
    cedula: 'COMMUNITY TAX CERTIFICATE',
  }

  const bodies: Record<string, string> = {
    clearance: `This is to certify that <strong style="text-decoration:underline">${fullName}</strong>, born on <strong>${birthdate}</strong>, of legal age, a bonafide resident of <strong>${purok}</strong>, Barangay ${settings.barangay_name}, has <strong>NO DEROGATORY RECORD</strong> on file in this barangay as of this date and is known to be a law-abiding citizen of good moral character.`,

    indigency: `This is to certify that <strong style="text-decoration:underline">${fullName}</strong>, born on <strong>${birthdate}</strong>, of legal age, a bonafide resident of <strong>${purok}</strong>, Barangay ${settings.barangay_name}, belongs to an <strong>INDIGENT FAMILY</strong> and is one of the underprivileged constituents of this barangay.`,

    residency: `This is to certify that <strong style="text-decoration:underline">${fullName}</strong>, born on <strong>${birthdate}</strong>, of legal age, is a <strong>BONAFIDE RESIDENT</strong> of <strong>${purok}</strong>, Barangay ${settings.barangay_name}, and has been residing in this barangay for a considerable length of time.`,

    business_clearance: `This is to certify that <strong style="text-decoration:underline">${fullName}</strong>, of legal age, a bonafide resident of <strong>${purok}</strong>, Barangay ${settings.barangay_name}, is the owner/operator of <strong style="text-decoration:underline">${req.business_name ?? '—'}</strong>${req.business_type ? `, a <strong>${req.business_type}</strong> type of business` : ''}, located at <strong>${req.business_address ?? purok}</strong>. Said business has complied with the requirements of this barangay and is hereby granted clearance to operate within its jurisdiction.`,

    tree_cutting: `This is to certify that <strong style="text-decoration:underline">${fullName}</strong>, of legal age, a bonafide resident of <strong>${purok}</strong>, Barangay ${settings.barangay_name}, has been granted permission to cut <strong>${req.tree_count ?? '—'}</strong> tree/s of species <strong>${req.tree_species ?? '—'}</strong> located at <strong>${req.tree_location ?? purok}</strong>. Reason for cutting: <strong>${req.tree_reason ?? req.purpose}</strong>. This permit is valid for thirty (30) days from the date of issuance.`,

    cedula: `This certifies that <strong style="text-decoration:underline">${fullName}</strong>, born on <strong>${birthdate}</strong>, ${req.cedula_civil_status ? `<strong>${req.cedula_civil_status}</strong>,` : ''} of legal age, residing at <strong>${address || purok + ', Barangay ' + settings.barangay_name}</strong>, with occupation of <strong>${req.cedula_occupation ?? '—'}</strong>${req.cedula_gross_income ? ` and gross annual income of <strong>₱${req.cedula_gross_income}</strong>` : ''}${req.cedula_tin ? `, TIN: <strong>${req.cedula_tin}</strong>` : ''}, has paid the community tax for the current year.`,
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',Times,serif;width:816px;min-height:1056px;background:#fff;padding:60px 80px;color:#111;position:relative}
    .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:80px;font-weight:bold;color:#1a3a2a;opacity:0.04;white-space:nowrap;pointer-events:none;z-index:0;letter-spacing:4px}
    .border-outer{position:fixed;inset:16px;border:4px double #1a3a2a;pointer-events:none;z-index:0}
    .border-inner{position:fixed;inset:22px;border:1px solid #c9a84c;pointer-events:none;z-index:0}
    .content{position:relative;z-index:1}
    .header{text-align:center;margin-bottom:28px}
    .republic{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#666;margin-bottom:4px}
    .province{font-size:11px;color:#777;margin-bottom:2px}
    .brgy-name{font-size:26px;font-weight:bold;color:#1a3a2a;margin:8px 0 4px;letter-spacing:1px}
    .office{font-size:10px;color:#888}
    .divider{display:flex;align-items:center;gap:12px;margin:14px auto;max-width:400px}
    .divider-line{flex:1;height:1px;background:#c9a84c}
    .divider-diamond{width:8px;height:8px;background:#c9a84c;transform:rotate(45deg)}
    .cert-title{font-size:18px;font-weight:bold;color:#1a3a2a;letter-spacing:3px;text-decoration:underline;text-underline-offset:5px;margin-bottom:24px}
    .salutation{margin-bottom:20px;font-size:13px}
    .body-text{line-height:2.1;font-size:13px;text-align:justify;margin-bottom:18px}
    .purpose{font-size:13px;line-height:2;margin-bottom:28px;text-align:justify}
    .issued{font-size:13px;margin-bottom:32px}
    .sig-section{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px}
    .sig-block{text-align:center;min-width:240px}
    .esig-label{font-size:8px;color:#aaa;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px}
    .esig-authenticated{font-size:8px;color:#c9a84c;margin-top:6px;letter-spacing:0.5px}
    .sig-name-line{width:240px;border-top:1.5px solid #111;margin-bottom:6px}
    .sig-name{font-weight:bold;font-size:14px}
    .sig-role{font-size:11px;color:#555}
    .sig-role{margin-top:2px}
    .footer{border-top:1px solid #ccc;padding-top:10px;display:flex;justify-content:space-between;font-size:9px;color:#999}
    .or-box{border:1px solid #ddd;border-radius:4px;padding:6px 12px;font-size:10px;color:#555;text-align:center}
    .cedula-table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px}
    .cedula-table td{padding:5px 8px;border:1px solid #ccc}
    .cedula-table .label{background:#f7f4ef;font-weight:bold;width:40%}
    .ref-box{border:1px solid #ddd;border-radius:4px;padding:6px 12px;font-size:10px;color:#555;text-align:center;margin-top:6px}
  </style>
</head>
<body>
  <div class="watermark">BARANGAY ${settings.barangay_name.toUpperCase()}</div>
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="content">
    <!-- Logo removed -->
    <div class="header">
      <div class="republic">Republic of the Philippines</div>
      <div class="province">Province &bull; Municipality</div>
      <div class="brgy-name">BARANGAY ${settings.barangay_name.toUpperCase()}</div>
      <div class="office">Office of the Barangay Captain</div>
      <div class="divider">
        <div class="divider-line"></div>
        <div class="divider-diamond"></div>
        <div class="divider-line"></div>
      </div>
      <div class="cert-title">${titles[req.certificate_type]}</div>
    </div>

    ${req.certificate_type === 'cedula' ? `
    <table class="cedula-table">
      <tr><td class="label">Full Name</td><td>${fullName}</td></tr>
      <tr><td class="label">Date of Birth</td><td>${birthdate}</td></tr>
      <tr><td class="label">Address</td><td>${address || purok + ', Barangay ' + settings.barangay_name}</td></tr>
      <tr><td class="label">Civil Status</td><td>${req.cedula_civil_status ?? '—'}</td></tr>
      <tr><td class="label">Occupation</td><td>${req.cedula_occupation ?? '—'}</td></tr>
      <tr><td class="label">Gross Annual Income</td><td>${req.cedula_gross_income ? '₱' + req.cedula_gross_income : '—'}</td></tr>
      <tr><td class="label">TIN</td><td>${req.cedula_tin ?? '—'}</td></tr>
      <tr><td class="label">Amount Paid</td><td>₱${req.amount}.00</td></tr>
    </table>
    ` : `
    <div class="salutation">TO WHOM IT MAY CONCERN:</div>
    <div class="body-text">${bodies[req.certificate_type]}</div>
    <div class="purpose">
      This certification is issued upon the request of the above-named person for
      <strong style="text-decoration:underline">${req.purpose}</strong> purposes
      and to whom it may concern.
    </div>
    `}

    <div class="issued">Issued this <strong>${today}</strong> at Barangay ${settings.barangay_name}.</div>
    <div class="sig-section">
      <div class="sig-block">
        <div class="esig-label">Electronically Signed</div>
        <img src="/sign.png" alt="Captain Signature" style="width:220px;height:auto;display:block;margin:0 auto 4px;max-height:52px;object-fit:contain;">
        <div class="sig-name-line"></div>
        <div class="sig-name">${settings.captain_name}</div>
        <div class="sig-role">Barangay Captain</div>
        <div class="sig-role">Barangay ${settings.barangay_name}</div>
        <div class="esig-authenticated">&#10022; Digitally authenticated &mdash; ${today}</div>
      </div>
      <div class="or-box">
        O.R. No.: ___________<br/>
        Amount: &#8369;${req.amount}.00<br/>
        Date: ${today}
        ${req.reference_number ? `<div class="ref-box">Ref. No.: ${req.reference_number}</div>` : ''}
      </div>
    </div>
    <!-- Seal removed -->
    <div class="footer">
      <span>Tracking No: <strong style="color:#555">${req.tracking_number}</strong>${req.reference_number ? ` &bull; Ref. No.: <strong style="color:#555">${req.reference_number}</strong>` : ''}</span>
      <span>Generated: ${today}</span>
      <span>Valid for: 6 months from issuance</span>
    </div>
  </div>
</body>
</html>`
}

export default function StaffRequestsPage() {
  const [requests, setRequests] = useState<RequestWithProfile[]>([])
  const [filtered, setFiltered] = useState<RequestWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<RejectModal | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [staffId, setStaffId] = useState('')
  const [staffName, setStaffName] = useState('')
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStaffId(user.id)
        const { data: prof } = await supabase
          .from('profiles').select('full_name').eq('id', user.id).single()
        setStaffName(prof?.full_name ?? 'Staff')
      }
      const [{ data: reqs }, { data: sett }] = await Promise.all([
        supabase.from('certificate_requests').select('*, profiles(*)').order('created_at', { ascending: false }),
        supabase.from('system_settings').select('*').single(),
      ])
      setRequests((reqs as RequestWithProfile[]) ?? [])
      setSettings(sett)
      setLoading(false)
    }
    load()
  }, [supabase])

  useEffect(() => {
    let result = requests
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter)
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(r =>
        r.tracking_number.toLowerCase().includes(s) ||
        (r.reference_number ?? '').toLowerCase().includes(s) ||
        (r.profiles?.full_name ?? '').toLowerCase().includes(s) ||
        (r.applicant_name ?? '').toLowerCase().includes(s) ||
        CERTIFICATE_LABELS[r.certificate_type].toLowerCase().includes(s)
      )
    }
    setFiltered(result)
  }, [search, statusFilter, requests])

  const logAction = async (action: string, targetId: string, details: string) => {
    await supabase.from('audit_logs').insert({
      staff_id: staffId, staff_name: staffName, action, target_id: targetId, details,
    })
  }

  const handleApprove = async (req: RequestWithProfile) => {
    if (!settings) { toast.error('System settings not loaded.'); return }
    setActionLoading(req.id)
    const certHtml = generateCertificateHTML(req, settings)
    const { error } = await supabase
      .from('certificate_requests')
      .update({ status: 'ready', certificate_html: certHtml, certificate_generated_at: new Date().toISOString() })
      .eq('id', req.id)

    if (error) {
      console.error(error)
      toast.error('Failed to approve request.')
    } else {
      toast.success('Approved! Certificate generated.')
      setRequests(prev => prev.map(r =>
        r.id === req.id ? { ...r, status: 'ready', certificate_html: certHtml } : r
      ))
      await logAction('APPROVED_AND_READY', req.id,
        `Approved: ${CERTIFICATE_LABELS[req.certificate_type]} for ${req.applicant_name ?? req.profiles?.full_name ?? ''}`)
    }
    setActionLoading(null)
  }

  const handleReject = async () => {
    const modal = rejectModal
    if (!modal || !rejectReason.trim()) { toast.error('Please provide a reason.'); return }
    setActionLoading(modal.id)
    const { error } = await supabase
      .from('certificate_requests')
      .update({ status: 'rejected', rejection_reason: rejectReason })
      .eq('id', modal.id)

    if (error) {
      toast.error('Failed to reject request.')
    } else {
      toast.success('Request rejected.')
      setRequests(prev => prev.map(r =>
        r.id === modal.id ? { ...r, status: 'rejected', rejection_reason: rejectReason } : r
      ))
      await logAction('REJECTED_REQUEST', modal.id, `Reason: ${rejectReason}`)
    }
    setActionLoading(null)
    setRejectModal(null)
    setRejectReason('')
  }

  const handleMarkPickedUp = async (req: RequestWithProfile) => {
    setActionLoading(req.id)
    const { error } = await supabase
      .from('certificate_requests')
      .update({ status: 'picked_up', picked_up_at: new Date().toISOString() })
      .eq('id', req.id)

    if (error) {
      console.error(error)
      toast.error('Failed to mark as picked up.')
    } else {
      toast.success('Marked as picked up.')
      setRequests(prev => prev.map(r =>
        r.id === req.id ? { ...r, status: 'picked_up' } : r
      ))
      await logAction('MARKED_PICKED_UP', req.id,
        `Marked as picked up: ${CERTIFICATE_LABELS[req.certificate_type]} for ${req.applicant_name ?? req.profiles?.full_name ?? ''}`)
    }
    setActionLoading(null)
  }

  const handlePrint = (html: string) => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.onload = () => win.print()
  }

  const statusTabs = [
    { value: 'all', label: 'All', count: requests.length },
    { value: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { value: 'ready', label: 'Ready', count: requests.filter(r => r.status === 'ready').length },
    { value: 'picked_up', label: 'Picked Up', count: requests.filter(r => r.status === 'picked_up').length },
    { value: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
  ]

  return (
    <div className="srq-root">
      <style>{`
        .srq-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
          animation: srqFadeUp 0.4s ease-out;
        }

        @keyframes srqFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .srq-header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .srq-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        @media (min-width: 640px) {
          .srq-header-title {
            font-size: 1.875rem;
          }
        }

        .srq-header-sub {
          font-size: 0.875rem;
          color: #7a6a55;
          margin: 0;
        }

        .srq-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (min-width: 640px) {
          .srq-stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .srq-stats {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .srq-stat {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .srq-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .srq-stat-icon svg {
          width: 18px;
          height: 18px;
        }

        .srq-stat-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .srq-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .srq-stat-label {
          font-size: 0.6875rem;
          color: #9a8f7a;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .srq-filter-bar {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .srq-filter-bar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .srq-tabs {
          display: flex;
          gap: 4px;
          background: #f0ebe3;
          border-radius: 12px;
          padding: 4px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .srq-tabs::-webkit-scrollbar {
          display: none;
        }

        .srq-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #7a6a55;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .srq-tab:hover {
          color: #1a3a2a;
          background: rgba(255, 255, 255, 0.5);
        }

        .srq-tab-active {
          background: #ffffff;
          color: #1a3a2a;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .srq-tab-count {
          font-size: 0.625rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
          background: #e8e0d5;
          color: #5a5040;
        }

        .srq-tab-active .srq-tab-count {
          background: #f0ebe3;
          color: #1a3a2a;
        }

        .srq-search-wrap {
          position: relative;
          width: 100%;
        }

        @media (min-width: 640px) {
          .srq-search-wrap {
            max-width: 280px;
          }
        }

        .srq-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9a8f7a;
          width: 16px;
          height: 16px;
          pointer-events: none;
        }

        .srq-search-input {
          width: 100%;
          padding: 10px 14px 10px 40px;
          border-radius: 12px;
          border: 1px solid #ddd5c8;
          background: #ffffff;
          font-size: 0.875rem;
          color: #1a3a2a;
          transition: all 0.2s ease;
          outline: none;
        }

        .srq-search-input:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.1);
        }

        .srq-search-input::placeholder {
          color: #a8a29e;
        }

        .srq-loading {
          display: flex;
          justify-content: center;
          padding: 80px 0;
        }

        .srq-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid #c9a84c;
          border-top-color: transparent;
          border-radius: 50%;
          animation: srqSpin 0.8s linear infinite;
        }

        @keyframes srqSpin {
          to { transform: rotate(360deg); }
        }

        .srq-empty {
          background: #ffffff;
          border-radius: 1.25rem;
          border: 1px solid #e8e0d5;
          padding: 64px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .srq-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9a8f7a;
        }

        .srq-empty-icon svg {
          width: 28px;
          height: 28px;
        }

        .srq-empty-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .srq-empty-text {
          font-size: 0.875rem;
          color: #7a6a55;
          margin: 0;
        }

        .srq-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .srq-card {
          background: #ffffff;
          border-radius: 1.25rem;
          border: 1px solid #e8e0d5;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }

        .srq-card:hover {
          box-shadow: 0 8px 24px -8px rgba(26, 58, 42, 0.08);
          border-color: #d4c4b0;
        }

        .srq-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px;
          gap: 16px;
          border-bottom: 1px solid #f7f4ef;
        }

        @media (min-width: 640px) {
          .srq-card-header {
            padding: 24px;
            align-items: center;
          }
        }

        .srq-card-main {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          min-width: 0;
          flex: 1;
        }

        @media (min-width: 640px) {
          .srq-card-main {
            align-items: center;
          }
        }

        .srq-card-emoji {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .srq-card-info {
          min-width: 0;
          flex: 1;
        }

        .srq-card-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 4px 0;
        }

        .srq-card-meta {
          font-size: 0.75rem;
          color: #9a8f7a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .srq-card-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .srq-card-meta svg {
          width: 12px;
          height: 12px;
        }

        .srq-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .srq-status::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .srq-card-body {
          padding: 20px;
        }

        @media (min-width: 640px) {
          .srq-card-body {
            padding: 24px;
          }
        }

        .srq-details {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        @media (min-width: 640px) {
          .srq-details {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .srq-details {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .srq-detail {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .srq-detail-label {
          font-size: 0.6875rem;
          color: #9a8f7a;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .srq-detail-label svg {
          width: 12px;
          height: 12px;
        }

        .srq-detail-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a3a2a;
          margin: 0;
        }

        .srq-payment-box {
          background: #f7f4ef;
          border-radius: 10px;
          padding: 12px 16px;
          border: 1px solid #e8e0d5;
        }

        .srq-payment-label {
          font-size: 0.625rem;
          color: #7a6a55;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 4px 0;
        }

        .srq-payment-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .srq-payment-sub {
          font-size: 0.6875rem;
          color: #9a8f7a;
          margin: 4px 0 0 0;
        }

        .srq-extras {
          background: #f7f4ef;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .srq-extras {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .srq-extra {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .srq-extra-label {
          font-size: 0.6875rem;
          color: #9a8f7a;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .srq-extra-value {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1a3a2a;
          margin: 0;
        }

        .srq-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 16px;
        }

        .srq-alert svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .srq-alert-red {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #991b1b;
        }

        .srq-alert-green {
          background: #f0fdf4;
          border: 1px solid #dcfce7;
          color: #166534;
        }

        .srq-alert-blue {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          color: #1e40af;
        }

        .srq-alert-text {
          font-size: 0.8125rem;
          margin: 0;
          line-height: 1.5;
        }

        .srq-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .srq-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 0.8125rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .srq-btn-primary {
          background: #1a3a2a;
          color: #c9a84c;
        }

        .srq-btn-primary:hover:not(:disabled) {
          background: #0f2419;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(26, 58, 42, 0.2);
        }

        .srq-btn-danger {
          background: #ef4444;
          color: #ffffff;
        }

        .srq-btn-danger:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-1px);
        }

        .srq-btn-secondary {
          background: #ffffff;
          color: #1a3a2a;
          border: 1px solid #ddd5c8;
        }

        .srq-btn-secondary:hover:not(:disabled) {
          background: #f7f4ef;
          border-color: #c9a84c;
        }

        .srq-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .srq-btn svg {
          width: 14px;
          height: 14px;
        }

        .srq-id-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1a3a2a;
          text-decoration: none;
          margin-bottom: 16px;
          transition: color 0.2s ease;
        }

        .srq-id-link:hover {
          color: #c9a84c;
        }

        .srq-id-link svg {
          width: 14px;
          height: 14px;
        }

        .srq-id-preview {
          margin: 16px 0;
          padding: 16px;
          background: #f7f4ef;
          border: 1px solid #e8e0d5;
          border-radius: 10px;
        }

        .srq-id-preview-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 12px;
          color: #1a3a2a;
          font-size: 0.8125rem;
          font-weight: 700;
        }

        .srq-id-preview-header svg {
          width: 15px;
          height: 15px;
          color: #c9a84c;
        }

        .srq-id-preview-image,
        .srq-id-preview-pdf {
          display: block;
          width: 100%;
          height: 260px;
          border: 1px solid #e8e0d5;
          border-radius: 6px;
          background: #ffffff;
        }

        .srq-id-preview-image {
          object-fit: contain;
        }

        .srq-id-preview-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          color: #1a3a2a;
          font-size: 0.75rem;
          font-weight: 700;
          text-decoration: none;
        }

        .srq-id-preview-link:hover {
          color: #c9a84c;
        }

        .srq-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 16px;
          animation: srqFadeIn 0.2s ease;
        }

        @keyframes srqFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .srq-modal {
          background: #ffffff;
          border-radius: 1.25rem;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          animation: srqModalUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes srqModalUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .srq-modal-header {
          padding: 24px 24px 16px;
        }

        .srq-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 4px 0;
        }

        .srq-modal-sub {
          font-size: 0.875rem;
          color: #7a6a55;
          margin: 0;
        }

        .srq-modal-body {
          padding: 0 24px 16px;
        }

        .srq-modal-textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #ddd5c8;
          font-size: 0.875rem;
          color: #1a3a2a;
          resize: none;
          outline: none;
          transition: all 0.2s ease;
          min-height: 100px;
          font-family: inherit;
        }

        .srq-modal-textarea:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.1);
        }

        .srq-modal-textarea::placeholder {
          color: #a8a29e;
        }

        .srq-modal-footer {
          display: flex;
          gap: 12px;
          padding: 16px 24px 24px;
        }

        .srq-modal-btn {
          flex: 1;
          padding: 12px;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .srq-modal-btn-cancel {
          background: #f7f4ef;
          color: #5a5040;
        }

        .srq-modal-btn-cancel:hover {
          background: #f0ebe3;
        }

        .srq-modal-btn-confirm {
          background: #ef4444;
          color: #ffffff;
        }

        .srq-modal-btn-confirm:hover:not(:disabled) {
          background: #dc2626;
        }

        .srq-modal-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .srq-preview-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: srqFadeIn 0.2s ease;
        }

        .srq-preview {
          background: #ffffff;
          border-radius: 1.25rem;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: srqModalUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .srq-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e8e0d5;
          gap: 16px;
        }

        .srq-preview-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .srq-preview-actions {
          display: flex;
          gap: 8px;
        }

        .srq-preview-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.8125rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .srq-preview-btn-primary {
          background: #1a3a2a;
          color: #c9a84c;
        }

        .srq-preview-btn-primary:hover {
          background: #0f2419;
        }

        .srq-preview-btn-secondary {
          background: #ffffff;
          color: #5a5040;
          border: 1px solid #ddd5c8;
        }

        .srq-preview-btn-secondary:hover {
          background: #f7f4ef;
          border-color: #c9a84c;
        }

        .srq-preview-btn svg {
          width: 14px;
          height: 14px;
        }

        .srq-preview-body {
          flex: 1;
          overflow: auto;
          padding: 16px;
          background: #f7f4ef;
        }

        .srq-preview-frame {
          width: 100%;
          max-width: 816px;
          aspect-ratio: 816/1056;
          margin: 0 auto;
          border: none;
          background: #ffffff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 480px) {
          .srq-card-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .srq-card-main {
            width: 100%;
          }
          .srq-actions {
            width: 100%;
          }
          .srq-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>

      {/* Header */}
      <div className="srq-header">
        <h1 className="srq-header-title">Certificate Requests</h1>
        <p className="srq-header-sub">Review and approve resident requests for official documentation.</p>
      </div>

      {/* Stats */}
      <div className="srq-stats">
        <div className="srq-stat">
          <div className="srq-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <FileText size={18} />
          </div>
          <div className="srq-stat-info">
            <p className="srq-stat-value">{requests.length}</p>
            <p className="srq-stat-label">Total</p>
          </div>
        </div>
        <div className="srq-stat">
          <div className="srq-stat-icon" style={{ background: '#fefce8', color: '#ca8a04' }}>
            <Clock size={18} />
          </div>
          <div className="srq-stat-info">
            <p className="srq-stat-value">{requests.filter(r => r.status === 'pending').length}</p>
            <p className="srq-stat-label">Pending</p>
          </div>
        </div>
        <div className="srq-stat">
          <div className="srq-stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <CheckCircle2 size={18} />
          </div>
          <div className="srq-stat-info">
            <p className="srq-stat-value">{requests.filter(r => r.status === 'ready').length}</p>
            <p className="srq-stat-label">Ready</p>
          </div>
        </div>
        <div className="srq-stat">
          <div className="srq-stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <PackageCheck size={18} />
          </div>
          <div className="srq-stat-info">
            <p className="srq-stat-value">{requests.filter(r => r.status === 'picked_up').length}</p>
            <p className="srq-stat-label">Picked Up</p>
          </div>
        </div>
        <div className="srq-stat">
          <div className="srq-stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <XCircle size={18} />
          </div>
          <div className="srq-stat-info">
            <p className="srq-stat-value">{requests.filter(r => r.status === 'rejected').length}</p>
            <p className="srq-stat-label">Rejected</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="srq-filter-bar">
        <div className="srq-tabs">
          {statusTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`srq-tab ${statusFilter === tab.value ? 'srq-tab-active' : ''}`}
            >
              {tab.label}
              <span className="srq-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="srq-search-wrap">
          <Search className="srq-search-icon" size={16} />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="srq-search-input"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="srq-loading">
          <div className="srq-spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="srq-empty">
          <div className="srq-empty-icon">
            <Filter size={28} />
          </div>
          <p className="srq-empty-title">No requests found</p>
          <p className="srq-empty-text">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="srq-list">
          {filtered.map(req => {
            const certHtml = req.certificate_html ?? null
            const idUrl = req.id_document_url ?? null
            const idIsPdf = idUrl ? /\.pdf(?:$|[?#])/i.test(idUrl) : false
            const displayName = req.applicant_name ?? req.profiles?.full_name ?? '—'
            const statusStyle = STATUS_STYLES[req.status] || STATUS_STYLES.pending

            return (
              <div key={req.id} className="srq-card">
                {/* Card Header */}
                <div className="srq-card-header">
                  <div className="srq-card-main">
                    <div className="srq-card-emoji">
                      {CERT_ICONS[req.certificate_type] ?? '📄'}
                    </div>
                    <div className="srq-card-info">
                      <p className="srq-card-title">{CERTIFICATE_LABELS[req.certificate_type]}</p>
                      <p className="srq-card-meta">
                        <span>
                          <FileText size={12} />
                          {req.tracking_number}
                        </span>
                        <span>
                          <Calendar size={12} />
                          {formatDate(req.created_at)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span
                    className="srq-status"
                    style={{
                      background: statusStyle.bg,
                      border: `1px solid ${statusStyle.border}`,
                      color: statusStyle.text,
                    }}
                  >
                    <span style={{ background: statusStyle.dot, width: 6, height: 6, borderRadius: '50%', display: 'inline-block' }} />
                    {statusStyle.label}
                  </span>
                </div>

                {/* Card Body */}
                <div className="srq-card-body">
                  <div className="srq-details">
                    <div className="srq-detail">
                      <p className="srq-detail-label">
                        <User size={12} />
                        Applicant
                      </p>
                      <p className="srq-detail-value">{displayName}</p>
                    </div>
                    <div className="srq-detail">
                      <p className="srq-detail-label">
                        <FileText size={12} />
                        Purpose
                      </p>
                      <p className="srq-detail-value">{req.purpose}</p>
                    </div>
                    {req.applicant_purok && (
                      <div className="srq-detail">
                        <p className="srq-detail-label">
                          <MapPin size={12} />
                          Purok
                        </p>
                        <p className="srq-detail-value">{req.applicant_purok}</p>
                      </div>
                    )}
                    {req.applicant_birthdate && (
                      <div className="srq-detail">
                        <p className="srq-detail-label">
                          <Calendar size={12} />
                          Birthdate
                        </p>
                        <p className="srq-detail-value">{formatDate(req.applicant_birthdate)}</p>
                      </div>
                    )}
                    {/* Reference Number */}
                    {req.reference_number && (
                      <div className="srq-detail">
                        <p className="srq-detail-label">
                          <Hash size={12} />
                          Reference No.
                        </p>
                        <p className="srq-detail-value">{req.reference_number}</p>
                      </div>
                    )}
                  </div>

                  {/* Certificate-specific extras */}
                  {(req.business_name || req.tree_count || req.cedula_occupation || req.cedula_tin) && (
                    <div className="srq-extras">
                      {req.business_name && (
                        <div className="srq-extra">
                          <p className="srq-extra-label">Business Name</p>
                          <p className="srq-extra-value">{req.business_name}</p>
                        </div>
                      )}
                      {req.business_type && (
                        <div className="srq-extra">
                          <p className="srq-extra-label">Business Type</p>
                          <p className="srq-extra-value">{req.business_type}</p>
                        </div>
                      )}
                      {req.business_address && (
                        <div className="srq-extra">
                          <p className="srq-extra-label">Business Address</p>
                          <p className="srq-extra-value">{req.business_address}</p>
                        </div>
                      )}
                      {req.tree_count && (
                        <div className="srq-extra">
                          <p className="srq-extra-label">Tree Count</p>
                          <p className="srq-extra-value">{req.tree_count}</p>
                        </div>
                      )}
                      {req.tree_species && (
                        <div className="srq-extra">
                          <p className="srq-extra-label">Tree Species</p>
                          <p className="srq-extra-value">{req.tree_species}</p>
                        </div>
                      )}
                      {req.tree_location && (
                        <div className="srq-extra">
                          <p className="srq-extra-label">Tree Location</p>
                          <p className="srq-extra-value">{req.tree_location}</p>
                        </div>
                      )}
                      {req.tree_reason && (
                        <div className="srq-extra">
                          <p className="srq-extra-label">Reason for Cutting</p>
                          <p className="srq-extra-value">{req.tree_reason}</p>
                        </div>
                      )}
                      {req.cedula_civil_status && (
                        <div className="srq-extra">
                          <p className="srq-extra-label">Civil Status</p>
                          <p className="srq-extra-value">{req.cedula_civil_status}</p>
                        </div>
                      )}
                      {req.cedula_occupation && (
                        <div className="srq-extra">
                          <p className="srq-extra-label">Occupation</p>
                          <p className="srq-extra-value">{req.cedula_occupation}</p>
                        </div>
                      )}
                      {req.cedula_gross_income && (
                        <div className="srq-extra">
                          <p className="srq-extra-label">Gross Annual Income</p>
                          <p className="srq-extra-value">₱{req.cedula_gross_income}</p>
                        </div>
                      )}
                      {req.cedula_tin && (
                        <div className="srq-extra">
                          <p className="srq-extra-label">TIN</p>
                          <p className="srq-extra-value">{req.cedula_tin}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment */}
                  <div className="srq-payment-box">
                    <p className="srq-payment-label">Payment Details</p>
                    <p className="srq-payment-value">₱{req.amount}.00</p>
                    <p className="srq-payment-sub">Official Receipt required upon pickup</p>
                  </div>

                  {/* Status Alerts */}
                  {req.status === 'ready' && certHtml && (
                    <div className="srq-alert srq-alert-green">
                      <CheckCircle2 size={16} />
                      <p className="srq-alert-text">
                        Certificate has been generated and is ready for pickup. Resident has been notified.
                      </p>
                    </div>
                  )}

                  {req.status === 'picked_up' && (
                    <div className="srq-alert srq-alert-blue">
                      <PackageCheck size={16} />
                      <p className="srq-alert-text">
                        Certificate has been picked up by the resident on {req.picked_up_at ? formatDate(req.picked_up_at) : '—'}.
                      </p>
                    </div>
                  )}

                  {req.status === 'rejected' && req.rejection_reason && (
                    <div className="srq-alert srq-alert-red">
                      <AlertCircle size={16} />
                      <p className="srq-alert-text">
                        <strong>Rejection Reason:</strong> {req.rejection_reason}
                      </p>
                    </div>
                  )}

                  {req.status === 'pending' && idUrl && (
                    <section className="srq-id-preview" aria-label={`Submitted ID for ${displayName}`}>
                      <p className="srq-id-preview-header">
                        <FileText size={15} />
                        Submitted ID
                      </p>
                      {idIsPdf ? (
                        <iframe
                          className="srq-id-preview-pdf"
                          src={idUrl}
                          title={`Submitted ID for ${displayName}`}
                        />
                      ) : (
                        <img
                          className="srq-id-preview-image"
                          src={idUrl}
                          alt={`Submitted ID for ${displayName}`}
                        />
                      )}
                      <a
                        href={idUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="srq-id-preview-link"
                      >
                        <ExternalLink size={14} />
                        Open full ID
                      </a>
                    </section>
                  )}

                  {/* ID Document Link */}
                  {idUrl && req.status !== 'pending' && (
                    <a
                      href={idUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="srq-id-link"
                    >
                      <ExternalLink size={14} />
                      View Uploaded ID Document
                    </a>
                  )}

                  {/* Actions */}
                  <div className="srq-actions">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(req)}
                          disabled={actionLoading === req.id || !settings}
                          className="srq-btn srq-btn-primary"
                        >
                          {actionLoading === req.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Approve & Generate
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: req.id, name: displayName })}
                          disabled={actionLoading === req.id}
                          className="srq-btn srq-btn-danger"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}

                    {(req.status === 'ready' || req.status === 'picked_up') && certHtml && (
                      <>
                        <button
                          onClick={() => handlePrint(certHtml)}
                          className="srq-btn srq-btn-primary"
                        >
                          <Download size={14} />
                          Print Certificate
                        </button>
                        <button
                          onClick={() => setPreviewHtml(certHtml)}
                          className="srq-btn srq-btn-secondary"
                        >
                          <Eye size={14} />
                          Preview
                        </button>
                      </>
                    )}

                    {req.status === 'ready' && certHtml && (
                      <button
                        onClick={() => handleMarkPickedUp(req)}
                        disabled={actionLoading === req.id}
                        className="srq-btn srq-btn-primary"
                      >
                        {actionLoading === req.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <PackageCheck size={14} />
                        )}
                        Mark as Picked Up
                      </button>
                    )}

                    {req.status === 'rejected' && (
                      <button
                        onClick={() => setRejectModal({ id: req.id, name: displayName })}
                        className="srq-btn srq-btn-secondary"
                      >
                        <XCircle size={14} />
                        Update Rejection Reason
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="srq-modal-overlay" onClick={() => !actionLoading && setRejectModal(null)}>
          <div className="srq-modal" onClick={e => e.stopPropagation()}>
            <div className="srq-modal-header">
              <h3 className="srq-modal-title">Reject Request</h3>
              <p className="srq-modal-sub">
                You are rejecting the request for <strong>{rejectModal.name}</strong>. Please provide a clear reason.
              </p>
            </div>
            <div className="srq-modal-body">
              <textarea
                className="srq-modal-textarea"
                placeholder="e.g. Incomplete requirements, invalid ID, missing payment..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                autoFocus
              />
            </div>
            <div className="srq-modal-footer">
              <button
                onClick={() => setRejectModal(null)}
                disabled={actionLoading === rejectModal.id}
                className="srq-modal-btn srq-modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal.id || !rejectReason.trim()}
                className="srq-modal-btn srq-modal-btn-confirm"
              >
                {actionLoading === rejectModal.id ? (
                  <Loader2 size={16} className="animate-spin" style={{ margin: '0 auto' }} />
                ) : (
                  'Confirm Rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewHtml && (
        <div className="srq-preview-overlay" onClick={() => setPreviewHtml(null)}>
          <div className="srq-preview" onClick={e => e.stopPropagation()}>
            <div className="srq-preview-header">
              <h3 className="srq-preview-title">Certificate Preview</h3>
              <div className="srq-preview-actions">
                <button
                  onClick={() => handlePrint(previewHtml)}
                  className="srq-preview-btn srq-preview-btn-primary"
                >
                  <Download size={14} />
                  Print
                </button>
                <button
                  onClick={() => setPreviewHtml(null)}
                  className="srq-preview-btn srq-preview-btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="srq-preview-body">
              <iframe
                className="srq-preview-frame"
                srcDoc={previewHtml}
                title="Certificate Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
