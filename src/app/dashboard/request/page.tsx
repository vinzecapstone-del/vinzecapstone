'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateTrackingNumber } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react'
import type { CertificateType, Profile } from '@/types'
import {
  CERTIFICATE_LABELS, CERTIFICATE_DESCRIPTIONS,
  REQUEST_PURPOSES, PUROK_LIST, CIVIL_STATUS_LIST,
} from '@/types'

const FEES: Record<CertificateType, number> = {
  clearance: 50,
  indigency: 0,
  residency: 50,
  business_clearance: 150,
  tree_cutting: 200,
  cedula: 100,
}

const CERT_ICONS: Record<CertificateType, string> = {
  clearance: '🏛️',
  indigency: '🤝',
  residency: '🏠',
  business_clearance: '🏢',
  tree_cutting: '🌳',
  cedula: '🪪',
}

const ALL_TYPES: CertificateType[] = [
  'clearance',
  'indigency',
  'residency',
  'business_clearance',
  'tree_cutting',
  'cedula',
]

type PaymentMethod = 'digital' | 'over-the-counter'

interface RequestFormState {
  certificate_type: CertificateType | ''
  purpose: string
  purpose_other: string
  full_name: string
  birthdate: string
  purok: string
  address: string
  contact_number: string
  business_name: string
  business_address: string
  business_type: string
  tree_species: string
  tree_count: string
  tree_location: string
  tree_reason: string
  cedula_civil_status: string
  cedula_occupation: string
  cedula_gross_income: string
  cedula_tin: string
  payment_method: PaymentMethod
  payment_reference: string
}

const createEmptyForm = (overrides: Partial<RequestFormState> = {}): RequestFormState => ({
  certificate_type: '',
  purpose: '',
  purpose_other: '',
  full_name: '',
  birthdate: '',
  purok: '',
  address: '',
  contact_number: '',
  business_name: '',
  business_address: '',
  business_type: '',
  tree_species: '',
  tree_count: '',
  tree_location: '',
  tree_reason: '',
  cedula_civil_status: '',
  cedula_occupation: '',
  cedula_gross_income: '',
  cedula_tin: '',
  payment_method: 'digital',
  payment_reference: '',
  ...overrides,
})

const getProfileDefaults = (profile: Profile): Partial<RequestFormState> => ({
  full_name: profile.full_name || '',
  birthdate: profile.birthdate || '',
  purok: profile.purok || '',
  address: profile.address || '',
  contact_number: profile.contact_number || '',
  cedula_occupation: profile.occupation || '',
})

function RequestFormInner() {
  const [step, setStep] = useState(1)
  const [profileDefaults, setProfileDefaults] = useState<Partial<RequestFormState>>({})
  const [form, setForm] = useState<RequestFormState>(() => createEmptyForm())
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const type = searchParams.get('type') as CertificateType
    if (type && ALL_TYPES.includes(type)) {
      setForm(prev => ({ ...prev, certificate_type: type }))
      setStep(2)
    }
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        const defaults = getProfileDefaults(profile)
        setProfileDefaults(defaults)
        setForm(prev => ({ ...prev, ...defaults }))
      }
    }
    check()
  }, [router, searchParams, supabase])

  const set = <K extends keyof RequestFormState>(field: K, value: RequestFormState[K]) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const isBusinessType = form.certificate_type === 'business_clearance'
  const isTreeType = form.certificate_type === 'tree_cutting'
  const isCedulaType = form.certificate_type === 'cedula'

  const handleSubmit = async () => {
    if (!form.certificate_type || !form.purpose) {
      toast.error('Please complete all required fields.')
      return
    }
    if (!form.full_name.trim() || !form.birthdate || !form.purok) {
      toast.error('Please fill in your personal information.')
      return
    }
    if (isBusinessType && !form.business_name.trim()) {
      toast.error('Please enter the business name.')
      return
    }
    if (isTreeType && (!form.tree_species.trim() || !form.tree_count.trim())) {
      toast.error('Please fill in tree details.')
      return
    }
    if (isCedulaType && (!form.cedula_civil_status || !form.cedula_occupation.trim())) {
      toast.error('Please fill in civil status and occupation.')
      return
    }

    const fee = FEES[form.certificate_type as CertificateType]
    if (fee > 0 && form.payment_method === 'digital' && !form.payment_reference.trim()) {
      toast.error('Please provide a GCash Reference Number for your payment.')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const tracking = generateTrackingNumber()
      const purpose = form.purpose === 'Other' ? form.purpose_other : form.purpose

      const { error } = await supabase.from('certificate_requests').insert({
        tracking_number: tracking,
        user_id: user.id,
        certificate_type: form.certificate_type,
        purpose,
        status: 'pending',
        amount: fee,
        payment_status: (fee > 0 && form.payment_method === 'digital' && form.payment_reference) ? 'paid' : 'unpaid',
        payment_method: fee > 0 ? form.payment_method : undefined,
        reference_number: form.payment_method === 'digital' ? form.payment_reference || undefined : undefined,
        applicant_name: form.full_name,
        applicant_birthdate: form.birthdate,
        applicant_purok: form.purok,
        applicant_address: form.address,
        applicant_contact: form.contact_number,
        ...(isBusinessType && {
          business_name: form.business_name,
          business_address: form.business_address,
          business_type: form.business_type,
        }),
        ...(isTreeType && {
          tree_species: form.tree_species,
          tree_count: form.tree_count,
          tree_location: form.tree_location,
          tree_reason: form.tree_reason,
        }),
        ...(isCedulaType && {
          cedula_civil_status: form.cedula_civil_status,
          cedula_occupation: form.cedula_occupation,
          cedula_gross_income: form.cedula_gross_income,
          cedula_tin: form.cedula_tin,
        }),
      })

      if (error) throw error
      setTrackingNumber(tracking)
      setSubmitted(true)
    } catch {
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setStep(1)
    setForm(createEmptyForm(profileDefaults))
  }

  const steps = ['Document Type', 'Your Information', 'Review & Submit']
  const fee = form.certificate_type ? FEES[form.certificate_type as CertificateType] : 0

  if (submitted) return (
    <div className="req-success">
      <style>{`
        .req-success {
          max-width: 480px;
          margin: 0 auto;
          text-align: center;
          padding: 48px 24px;
          animation: reqFadeUp 0.6s ease-out;
        }
        .req-success-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #dcfce7;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .req-success-icon svg {
          width: 40px;
          height: 40px;
          color: #16a34a;
        }
        .req-success-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 8px 0;
        }
        .req-success-desc {
          font-size: 0.875rem;
          color: #7a6a55;
          margin: 0 0 20px 0;
        }
        .req-tracking-box {
          background: #f0ebe3;
          border: 1px solid #ddd5c8;
          border-radius: 1rem;
          padding: 20px 24px;
          margin-bottom: 24px;
        }
        .req-tracking-label {
          font-size: 0.75rem;
          color: #9a8f7a;
          margin: 0 0 8px 0;
          font-weight: 500;
        }
        .req-tracking-number {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a3a2a;
          letter-spacing: 0.05em;
          margin: 0;
        }
        .req-tracking-hint {
          font-size: 0.6875rem;
          color: #9a8f7a;
          margin: 8px 0 0 0;
        }
        .req-success-note {
          font-size: 0.875rem;
          color: #7a6a55;
          margin: 0 0 24px 0;
          line-height: 1.6;
        }
        .req-btn-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .req-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px 24px;
          background: #1a3a2a;
          color: #c9a84c;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .req-btn-primary:hover {
          background: #0f2419;
        }
        .req-btn-primary:active {
          transform: scale(0.98);
        }
        .req-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px 24px;
          background: transparent;
          color: #5a5040;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 14px;
          border: 1px solid #ddd5c8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .req-btn-outline:hover {
          background: #f7f4ef;
        }
        .req-btn-outline:active {
          transform: scale(0.98);
        }
      `}</style>
      <div className="req-success-icon">
        <CheckCircle2 size={40} />
      </div>
      <h2 className="req-success-title">Request Submitted!</h2>
      <p className="req-success-desc">Your tracking number is:</p>
      <div className="req-tracking-box">
        <p className="req-tracking-label">Tracking Number</p>
        <p className="req-tracking-number">{trackingNumber}</p>
        <p className="req-tracking-hint">Save this for tracking your request</p>
      </div>
      <p className="req-success-note">
        We&apos;ll notify you once your document is ready. Processing typically takes 1-2 business days.
      </p>
      <div className="req-btn-group">
        <button onClick={() => router.push('/dashboard/certificates')} className="req-btn-primary">
          View My Certificates
        </button>
        <button onClick={resetForm} className="req-btn-outline">
          Submit Another Request
        </button>
      </div>
    </div>
  )

  return (
    <div className="req-root">
      <style>{`
        .req-root {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
          animation: reqFadeUp 0.5s ease-out;
        }

        @keyframes reqFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .req-header {
          position: relative;
          background: linear-gradient(135deg, #1a3a2a 0%, #143025 50%, #0f261e 100%);
          border-radius: 1rem;
          padding: 24px;
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .req-header {
            padding: 32px;
            border-radius: 1.25rem;
          }
        }

        .req-header-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .req-header-glow {
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

        .req-header-content {
          position: relative;
          z-index: 10;
        }

        .req-header-label {
          color: #9abfa8;
          font-size: 0.875rem;
          margin: 0 0 4px 0;
        }

        .req-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          .req-header-title {
            font-size: 1.875rem;
          }
        }

        .req-header-sub {
          color: #7a9a88;
          font-size: 0.75rem;
          margin: 8px 0 0 0;
        }

        /* Stepper */
        .req-stepper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .req-step {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .req-step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .req-step-circle-done {
          background: #c9a84c;
          color: #1a3a2a;
        }

        .req-step-circle-active {
          background: #1a3a2a;
          color: #c9a84c;
        }

        .req-step-circle-pending {
          background: #e8e0d5;
          color: #9a8f7a;
        }

        .req-step-label {
          font-size: 0.75rem;
          font-weight: 600;
          transition: color 0.3s ease;
          white-space: nowrap;
        }

        .req-step-label-active {
          color: #1a3a2a;
        }

        .req-step-label-pending {
          color: #9a8f7a;
        }

        @media (max-width: 480px) {
          .req-step-label {
            display: none;
          }
        }

        .req-step-line {
          flex: 1;
          height: 1px;
          transition: background 0.3s ease;
        }

        .req-step-line-done {
          background: #c9a84c;
        }

        .req-step-line-pending {
          background: #e8e0d5;
        }

        /* Card */
        .req-card {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          padding: 24px;
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .req-card {
            padding: 32px;
            border-radius: 1.25rem;
          }
        }

        .req-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 20px 0;
        }

        /* Certificate Type Cards */
        .req-type-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .req-type-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 14px;
          border: 2px solid #e8e0d5;
          background: #ffffff;
          text-align: left;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100%;
        }

        .req-type-card:hover {
          border-color: #c9a84c;
          background: #faf8f4;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(26, 58, 42, 0.08);
        }

        .req-type-card-active {
          border-color: #c9a84c;
          background: #faf7f0;
        }

        .req-type-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .req-type-info {
          flex: 1;
          min-width: 0;
        }

        .req-type-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .req-type-desc {
          font-size: 0.75rem;
          color: #9a8f7a;
          margin: 4px 0 0 0;
          line-height: 1.4;
        }

        .req-type-price {
          text-align: right;
          flex-shrink: 0;
        }

        .req-type-price-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .req-type-price-chevron {
          width: 14px;
          height: 14px;
          color: #9a8f7a;
          margin: 4px 0 0 auto;
        }

        /* Form Grid */
        .req-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .req-form-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .req-form-col-full {
            grid-column: 1 / -1;
          }
        }

        .req-label {
          display: block;
          font-size: 0.625rem;
          font-weight: 700;
          color: #5a5040;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .req-label span {
          color: #ef4444;
          margin-left: 2px;
        }

        .req-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid #ddd5c8;
          background: #ffffff;
          font-size: 0.875rem;
          color: #1a3a2a;
          transition: all 0.2s ease;
          outline: none;
        }

        .req-input::placeholder {
          color: #b0a490;
        }

        .req-input:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
        }

        select.req-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239a8f7a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }

        /* Divider */
        .req-divider {
          height: 1px;
          background: #e8e0d5;
          margin: 4px 0;
        }

        /* Sub-section */
        .req-subsection {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .req-subsection-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #1a3a2a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }

        .req-info-box {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.75rem;
          line-height: 1.5;
        }

        .req-info-box-amber {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
        }

        .req-info-box-blue {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
        }

        /* Upload */
        .req-upload {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 120px;
          border: 2px dashed #ddd5c8;
          border-radius: 12px;
          background: #faf8f4;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 20px;
        }

        .req-upload:hover {
          border-color: #c9a84c;
          background: #faf7f0;
        }

        .req-upload svg {
          width: 24px;
          height: 24px;
          color: #9a8f7a;
        }

        .req-upload-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: #7a6a55;
          margin: 0;
        }

        .req-upload-hint {
          font-size: 0.6875rem;
          color: #9a8f7a;
          margin: 0;
        }

        .req-upload-file {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
          text-align: center;
          word-break: break-all;
        }

        /* Buttons */
        .req-actions {
          display: flex;
          gap: 12px;
          padding-top: 8px;
        }

        .req-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          flex-shrink: 0;
        }

        .req-btn-outline {
          background: transparent;
          border: 1px solid #ddd5c8;
          color: #5a5040;
        }

        .req-btn-outline:hover {
          background: #f7f4ef;
        }

        .req-btn-outline:active {
          transform: scale(0.98);
        }

        .req-btn-dark {
          flex: 1;
          background: #1a3a2a;
          color: #c9a84c;
        }

        .req-btn-dark:hover {
          background: #0f2419;
        }

        .req-btn-dark:active {
          transform: scale(0.98);
        }

        .req-btn-dark:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Review */
        .req-review {
          background: #f7f4ef;
          border-radius: 12px;
          border: 1px solid #e8e0d5;
          overflow: hidden;
        }

        .req-review-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 16px;
          font-size: 0.875rem;
          border-bottom: 1px solid #e8e0d5;
        }

        .req-review-row:last-child {
          border-bottom: none;
        }

        .req-review-label {
          color: #7a6a55;
          font-weight: 500;
          flex-shrink: 0;
        }

        .req-review-value {
          color: #1a3a2a;
          font-weight: 700;
          text-align: right;
          word-break: break-word;
        }

        /* Payment */
        .req-payment-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .req-payment-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .req-payment-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          border: 2px solid #e8e0d5;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .req-payment-card:hover {
          border-color: rgba(201, 168, 76, 0.5);
        }

        .req-payment-card-active {
          border-color: #c9a84c;
          background: #faf7f0;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
        }

        .req-payment-emoji {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .req-payment-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
        }

        .req-payment-desc {
          font-size: 0.75rem;
          color: #7a6a55;
          margin: 4px 0 0 0;
        }

        .req-payment-details {
          background: #f0ebe3;
          border-radius: 12px;
          border: 1px solid #e8e0d5;
          padding: 20px;
          animation: reqFadeIn 0.3s ease-out;
        }

        @keyframes reqFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .req-payment-number {
          font-size: 1.25rem;
          font-weight: 900;
          color: #1a3a2a;
          letter-spacing: 0.05em;
          background: #ffffff;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #ddd5c8;
          display: inline-block;
          margin: 8px 0 12px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }

        /* Alert */
        .req-alert {
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .req-alert-warning {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .req-root {
            gap: 16px;
          }
          .req-card {
            padding: 20px;
            border-radius: 1rem;
          }
          .req-header {
            padding: 20px;
          }
          .req-header-title {
            font-size: 1.25rem;
          }
        }
      `}</style>

      {/* Header */}
      <div className="req-header">
        <div className="req-header-pattern" />
        <div className="req-header-glow" />
        <div className="req-header-content">
          <p className="req-header-label">Certificate Request</p>
          <h1 className="req-header-title">New Certificate Request</h1>
          <p className="req-header-sub">Complete the form below to submit your request</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="req-stepper">
        {steps.map((s, i) => {
          const n = i + 1
          const done = step > n
          const active = step === n
          return (
            <div key={s} className="req-step">
              <div className="flex items-center gap-2 shrink-0">
                <div className={`req-step-circle ${done ? 'req-step-circle-done' : active ? 'req-step-circle-active' : 'req-step-circle-pending'}`}>
                  {done ? '✓' : n}
                </div>
                <span className={`req-step-label ${active ? 'req-step-label-active' : 'req-step-label-pending'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`req-step-line ${step > n ? 'req-step-line-done' : 'req-step-line-pending'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Form Card */}
      <div className="req-card">

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="req-type-grid">
            <h2 className="req-section-title">Select Document Type</h2>
            {ALL_TYPES.map(type => (
              <button
                key={type}
                onClick={() => { set('certificate_type', type); setStep(2) }}
                className={`req-type-card ${form.certificate_type === type ? 'req-type-card-active' : ''}`}
              >
                <div className="req-type-icon">{CERT_ICONS[type]}</div>
                <div className="req-type-info">
                  <p className="req-type-name">{CERTIFICATE_LABELS[type]}</p>
                  <p className="req-type-desc">{CERTIFICATE_DESCRIPTIONS[type]}</p>
                </div>
                <div className="req-type-price">
                  <p className="req-type-price-value">{FEES[type] === 0 ? 'Free' : `₱${FEES[type]}`}</p>
                  <ChevronRight className="req-type-price-chevron" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 className="req-section-title">Your Information</h2>

            {/* Personal */}
            <div className="req-form-grid">
              <div className="req-form-col-full">
                <label className="req-label">Full Name <span>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Juan Dela Cruz"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  className="req-input"
                />
              </div>
              <div>
                <label className="req-label">Date of Birth <span>*</span></label>
                <input
                  type="date"
                  value={form.birthdate}
                  onChange={e => set('birthdate', e.target.value)}
                  className="req-input"
                />
              </div>
              <div>
                <label className="req-label">Purok <span>*</span></label>
                <select
                  value={form.purok}
                  onChange={e => set('purok', e.target.value)}
                  className="req-input"
                >
                  <option value="">Select Purok...</option>
                  {PUROK_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="req-form-col-full">
                <label className="req-label">Complete Address</label>
                <input
                  type="text"
                  placeholder="House No., Street, Barangay..."
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  className="req-input"
                />
              </div>
              <div className="req-form-col-full">
                <label className="req-label">Contact Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 09171234567"
                  value={form.contact_number}
                  onChange={e => set('contact_number', e.target.value)}
                  className="req-input"
                />
              </div>
            </div>

            {/* Cedula extras */}
            {isCedulaType && (
              <div className="req-subsection">
                <div className="req-divider" />
                <p className="req-subsection-title">🪪 Cedula Information</p>
                <div className="req-info-box req-info-box-amber">
                  ℹ️ Community Tax Certificate (Cedula) fee is based on gross annual income. The final amount will be computed by staff upon processing.
                </div>
                <div className="req-form-grid">
                  <div>
                    <label className="req-label">Civil Status <span>*</span></label>
                    <select
                      value={form.cedula_civil_status}
                      onChange={e => set('cedula_civil_status', e.target.value)}
                      className="req-input"
                    >
                      <option value="">Select...</option>
                      {CIVIL_STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="req-label">Occupation <span>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Farmer, Teacher, Driver"
                      value={form.cedula_occupation}
                      onChange={e => set('cedula_occupation', e.target.value)}
                      className="req-input"
                    />
                  </div>
                  <div>
                    <label className="req-label">Gross Annual Income</label>
                    <input
                      type="text"
                      placeholder="e.g. 50000"
                      value={form.cedula_gross_income}
                      onChange={e => set('cedula_gross_income', e.target.value)}
                      className="req-input"
                    />
                  </div>
                  <div>
                    <label className="req-label">TIN (if applicable)</label>
                    <input
                      type="text"
                      placeholder="e.g. 123-456-789"
                      value={form.cedula_tin}
                      onChange={e => set('cedula_tin', e.target.value)}
                      className="req-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Business extras */}
            {isBusinessType && (
              <div className="req-subsection">
                <div className="req-divider" />
                <p className="req-subsection-title">🏢 Business Information</p>
                <div className="req-form-grid">
                  <div className="req-form-col-full">
                    <label className="req-label">Business Name <span>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Juan's Sari-sari Store"
                      value={form.business_name}
                      onChange={e => set('business_name', e.target.value)}
                      className="req-input"
                    />
                  </div>
                  <div>
                    <label className="req-label">Type of Business</label>
                    <input
                      type="text"
                      placeholder="e.g. Retail, Food, Services"
                      value={form.business_type}
                      onChange={e => set('business_type', e.target.value)}
                      className="req-input"
                    />
                  </div>
                  <div>
                    <label className="req-label">Business Address</label>
                    <input
                      type="text"
                      placeholder="Location within the barangay"
                      value={form.business_address}
                      onChange={e => set('business_address', e.target.value)}
                      className="req-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tree extras */}
            {isTreeType && (
              <div className="req-subsection">
                <div className="req-divider" />
                <p className="req-subsection-title">🌳 Tree Information</p>
                <div className="req-form-grid">
                  <div>
                    <label className="req-label">Tree Species <span>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Mahogany, Narra"
                      value={form.tree_species}
                      onChange={e => set('tree_species', e.target.value)}
                      className="req-input"
                    />
                  </div>
                  <div>
                    <label className="req-label">Number of Trees <span>*</span></label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 2"
                      value={form.tree_count}
                      onChange={e => set('tree_count', e.target.value)}
                      className="req-input"
                    />
                  </div>
                  <div className="req-form-col-full">
                    <label className="req-label">Location of Trees</label>
                    <input
                      type="text"
                      placeholder="Exact location within the barangay"
                      value={form.tree_location}
                      onChange={e => set('tree_location', e.target.value)}
                      className="req-input"
                    />
                  </div>
                  <div className="req-form-col-full">
                    <label className="req-label">Reason for Cutting</label>
                    <input
                      type="text"
                      placeholder="e.g. Construction, Hazard, Dead tree"
                      value={form.tree_reason}
                      onChange={e => set('tree_reason', e.target.value)}
                      className="req-input"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="req-divider" />

            {/* Purpose */}
            <div>
              <label className="req-label">Purpose of Request <span>*</span></label>
              <select
                value={form.purpose}
                onChange={e => set('purpose', e.target.value)}
                className="req-input"
              >
                <option value="">Select purpose...</option>
                {REQUEST_PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {form.purpose === 'Other' && (
              <div>
                <label className="req-label">Specify Purpose</label>
                <input
                  type="text"
                  placeholder="Please describe your purpose..."
                  value={form.purpose_other}
                  onChange={e => set('purpose_other', e.target.value)}
                  className="req-input"
                />
              </div>
            )}

            <div className="req-actions">
              <button onClick={() => setStep(1)} className="req-btn req-btn-outline">
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={() => {
                  if (!form.full_name.trim() || !form.birthdate || !form.purok) {
                    toast.error('Please fill in your name, birthdate, and purok.')
                    return
                  }
                  if (isCedulaType && (!form.cedula_civil_status || !form.cedula_occupation.trim())) {
                    toast.error('Please fill in civil status and occupation.')
                    return
                  }
                  if (isBusinessType && !form.business_name.trim()) {
                    toast.error('Please enter the business name.')
                    return
                  }
                  if (isTreeType && (!form.tree_species.trim() || !form.tree_count.trim())) {
                    toast.error('Please fill in tree species and count.')
                    return
                  }
                  if (!form.purpose) {
                    toast.error('Please select a purpose.')
                    return
                  }
                  setStep(3)
                }}
                className="req-btn req-btn-dark"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 className="req-section-title">Review Your Request</h2>

            <div className="req-review">
              {[
                { label: 'Document Type', value: CERTIFICATE_LABELS[form.certificate_type as CertificateType] },
                { label: 'Full Name', value: form.full_name },
                { label: 'Date of Birth', value: form.birthdate },
                { label: 'Purok', value: form.purok },
                { label: 'Address', value: form.address || '—' },
                { label: 'Contact', value: form.contact_number || '—' },
                ...(isCedulaType ? [
                  { label: 'Civil Status', value: form.cedula_civil_status },
                  { label: 'Occupation', value: form.cedula_occupation },
                  { label: 'Gross Annual Income', value: form.cedula_gross_income ? `₱${form.cedula_gross_income}` : '—' },
                  { label: 'TIN', value: form.cedula_tin || '—' },
                ] : []),
                ...(isBusinessType ? [
                  { label: 'Business Name', value: form.business_name },
                  { label: 'Business Type', value: form.business_type || '—' },
                  { label: 'Business Address', value: form.business_address || '—' },
                ] : []),
                ...(isTreeType ? [
                  { label: 'Tree Species', value: form.tree_species },
                  { label: 'No. of Trees', value: form.tree_count },
                  { label: 'Tree Location', value: form.tree_location || '—' },
                  { label: 'Reason', value: form.tree_reason || '—' },
                ] : []),
                { label: 'Purpose', value: form.purpose === 'Other' ? form.purpose_other : form.purpose },
                { label: 'Fee', value: fee === 0 ? 'Free' : `₱${fee}.00` },
              ].map(({ label, value }) => (
                <div key={label} className="req-review-row">
                  <span className="req-review-label">{label}</span>
                  <span className="req-review-value">{value ?? '—'}</span>
                </div>
              ))}
            </div>

            {isCedulaType && (
              <div className="req-info-box req-info-box-blue">
                ℹ️ The final cedula fee will be computed by staff based on your gross annual income and may differ from the base fee shown.
              </div>
            )}

            {fee > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="req-card" style={{ padding: '20px' }}>
                  <p className="req-subsection-title" style={{ marginBottom: '16px' }}>Select Payment Method</p>
                  <div className="req-payment-grid">
                    <button
                      onClick={() => set('payment_method', 'digital')}
                      className={`req-payment-card ${form.payment_method === 'digital' ? 'req-payment-card-active' : ''}`}
                    >
                      <span className="req-payment-emoji">📱</span>
                      <div>
                        <p className="req-payment-name">GCash (Mobile)</p>
                        <p className="req-payment-desc">Pay online and enter your reference number.</p>
                      </div>
                    </button>
                    <button
                      onClick={() => set('payment_method', 'over-the-counter')}
                      className={`req-payment-card ${form.payment_method === 'over-the-counter' ? 'req-payment-card-active' : ''}`}
                    >
                      <span className="req-payment-emoji">🏢</span>
                      <div>
                        <p className="req-payment-name">Over-the-Counter</p>
                        <p className="req-payment-desc">Pay at the office when you pick up your certificate.</p>
                      </div>
                    </button>
                  </div>
                </div>

                {form.payment_method === 'digital' && (
                  <div className="req-payment-details">
                    <p className="req-subsection-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.25rem' }}>📱</span> Mobile Payment (GCash)
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#7a6a55', margin: '0 0 12px' }}>
                      Please send exactly <strong style={{ color: '#1a3a2a' }}>₱{fee}.00</strong> to the following GCash number:
                    </p>
                    <div className="req-payment-number">0912-345-6789</div>
                    <p style={{ fontSize: '0.875rem', color: '#7a6a55', margin: '0 0 16px' }}>
                      After payment, enter the GCash reference number below.
                    </p>
                    <div>
                      <label className="req-label">GCash Reference Number <span>*</span></label>
                      <input
                        type="text"
                        placeholder="Enter reference no."
                        value={form.payment_reference}
                        onChange={e => set('payment_reference', e.target.value)}
                        className="req-input"
                      />
                    </div>
                  </div>
                )}

                {form.payment_method === 'over-the-counter' && (
                  <div className="req-info-box req-info-box-amber">
                    ℹ️ You have chosen Over-the-Counter payment. Please bring the payment amount to the barangay hall when you pick up your certificate.
                  </div>
                )}
              </div>
            )}

            <div className="req-alert req-alert-warning">
              ⚠️ By submitting, you confirm that all information provided is true and correct.
            </div>

            <div className="req-actions">
              <button onClick={() => setStep(2)} className="req-btn req-btn-outline">
                <ArrowLeft size={16} />
                Back
              </button>
              <button onClick={handleSubmit} disabled={loading} className="req-btn req-btn-dark">
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RequestPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: 32, height: 32, border: '2px solid #c9a84c', borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'reqSpin 0.8s linear infinite'
        }} />
        <style>{`@keyframes reqSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <RequestFormInner />
    </Suspense>
  )
}
