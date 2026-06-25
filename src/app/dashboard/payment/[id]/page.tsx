'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  CreditCard, Smartphone, Building2, CheckCircle2,
  Loader2, ArrowLeft, ShieldCheck, Copy
} from 'lucide-react'
import type { CertificateRequest } from '@/types'
import { CERTIFICATE_LABELS } from '@/types'
import { formatDate } from '@/lib/utils'

type PaymentMethod = 'gcash' | 'maya' | 'otc'

export default function PaymentPage() {
  const { id } = useParams()
  const supabase = createClient()

  const [request, setRequest] = useState<CertificateRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [method, setMethod] = useState<PaymentMethod>('gcash')
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'done'>('select')
  const [refNumber, setRefNumber] = useState('')
  const [processing, setProcessing] = useState(false)
  const [demoRef] = useState(() => `BRY${Date.now().toString().slice(-8)}`)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('certificate_requests')
        .select('*')
        .eq('id', id)
        .single()
      if (error) console.error('Load error:', error.code, error.message)
      setRequest(data)
      setLoading(false)
    }
    load()
  }, [id])

  const handlePay = async () => {
    if (!request) return
    if (method !== 'otc' && !refNumber.trim()) {
      toast.error('Please enter the reference number.')
      return
    }

    setProcessing(true)
    setStep('processing')

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 2200))

    // Step 1: UPDATE only — no .select().single() to avoid PGRST116
    const { error: updateError } = await supabase
      .from('certificate_requests')
      .update({
        payment_status: 'paid',
        payment_method: method === 'otc' ? 'over-the-counter' : 'digital',
        reference_number: method === 'otc' ? `OTC-${demoRef}` : refNumber,
      })
      .eq('id', request.id)
      .eq('user_id', request.user_id)

    if (updateError) {
      console.error('Payment update error:', updateError.code, updateError.message, updateError.hint)
      toast.error(`Payment failed: ${updateError.message}`)
      setProcessing(false)
      setStep('confirm')
      return
    }

    // Step 2: Re-fetch the updated row separately
    const { data: updated, error: fetchError } = await supabase
      .from('certificate_requests')
      .select('*')
      .eq('id', request.id)
      .single()

    setProcessing(false)

    if (fetchError || !updated) {
      console.error('Re-fetch error:', fetchError)
      // Update succeeded — patch local state manually
      setRequest(prev => prev ? {
        ...prev,
        payment_status: 'paid',
        payment_method: method === 'otc' ? 'over-the-counter' : 'digital',
        reference_number: method === 'otc' ? `OTC-${demoRef}` : refNumber,
      } : prev)
    } else {
      setRequest(updated)
    }

    toast.success('Payment confirmed!')
    setStep('done')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  const goToCertificates = () => {
    window.location.replace('/dashboard/certificates')
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!request) return (
    <div className="text-center py-20">
      <p className="text-[#5a5040] font-semibold">Request not found.</p>
    </div>
  )

  // Free certificate
  if (request.amount === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
        <p className="text-[#1a3a2a] font-bold text-lg">
          This certificate is free — no payment needed!
        </p>
        <button
          onClick={goToCertificates}
          className="mt-4 px-6 py-3 bg-[#1a3a2a] text-[#c9a84c] font-bold rounded-xl text-sm hover:bg-[#0f2419] transition-all"
        >
          View Certificate
        </button>
      </div>
    )
  }

  // ── Done / Already Paid ───────────────────────────────────────────────────
  if (step === 'done' || request.payment_status === 'paid') {
    return (
      <div className="max-w-lg mx-auto animate-fade-up">
        <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
          <div className="bg-green-50 px-6 py-8 text-center border-b border-green-100">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2
              className="text-2xl font-bold text-green-800 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Payment Confirmed!
            </h2>
            <p className="text-green-600 text-sm">
              Your certificate is now unlocked and ready to view.
            </p>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#9a8f7a]">Certificate</span>
              <span className="font-semibold text-[#1a3a2a]">
                {CERTIFICATE_LABELS[request.certificate_type]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9a8f7a]">Amount Paid</span>
              <span className="font-bold text-green-600">₱{request.amount}.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9a8f7a]">Tracking No.</span>
              <span className="font-mono text-[#1a3a2a]">{request.tracking_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9a8f7a]">Payment Method</span>
              <span className="font-semibold text-[#1a3a2a]">
                {request.payment_method === 'over-the-counter'
                  ? 'Over-the-Counter'
                  : method === 'gcash' ? 'GCash' : 'Maya'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9a8f7a]">Reference No.</span>
              <span className="font-mono text-[#1a3a2a] text-xs">
                {request.reference_number ?? '—'}
              </span>
            </div>

            <div className="pt-4">
              <button
                onClick={goToCertificates}
                className="w-full py-3 bg-[#1a3a2a] text-[#c9a84c] font-bold rounded-xl hover:bg-[#0f2419] transition-all text-sm"
              >
                View My Certificate →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Payment Flow ─────────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-up pb-10">

      {/* Back */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-[#7a6a55] hover:text-[#1a3a2a] transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div>
        <h1
          className="text-2xl font-bold text-[#1a3a2a]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Complete Payment
        </h1>
        <p className="text-sm text-[#7a6a55] mt-1">
          Pay to unlock your generated certificate.
        </p>
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm p-5">
        <p className="text-xs font-bold text-[#5a5040] uppercase tracking-widest mb-3">
          Order Summary
        </p>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#f0ebe3] flex items-center justify-center text-xl shrink-0">
            {request.certificate_type === 'clearance'
              ? '🏛️'
              : request.certificate_type === 'indigency'
              ? '🤝'
              : '🏠'}
          </div>
          <div>
            <p className="font-bold text-[#1a3a2a] text-sm">
              {CERTIFICATE_LABELS[request.certificate_type]}
            </p>
            <p className="text-xs text-[#9a8f7a]">
              {request.tracking_number} · {formatDate(request.created_at)}
            </p>
          </div>
        </div>
        <div className="border-t border-[#f0ebe3] pt-3 flex justify-between items-center">
          <span className="text-sm text-[#7a6a55]">Total Amount Due</span>
          <span className="text-xl font-bold text-[#1a3a2a]">₱{request.amount}.00</span>
        </div>
      </div>

      {/* ── Step: Select Method ── */}
      {step === 'select' && (
        <>
          <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm p-5">
            <p className="text-xs font-bold text-[#5a5040] uppercase tracking-widest mb-4">
              Select Payment Method
            </p>
            <div className="space-y-3">
              {([
                {
                  id: 'gcash' as PaymentMethod,
                  label: 'GCash',
                  sub: 'Pay via GCash mobile wallet',
                  icon: <Smartphone size={20} className="text-blue-500" />,
                  iconBg: 'bg-blue-50',
                  active: 'border-blue-500 ring-2 ring-blue-200',
                },
                {
                  id: 'maya' as PaymentMethod,
                  label: 'Maya',
                  sub: 'Pay via Maya (PayMaya) wallet',
                  icon: <CreditCard size={20} className="text-green-500" />,
                  iconBg: 'bg-green-50',
                  active: 'border-green-500 ring-2 ring-green-200',
                },
                {
                  id: 'otc' as PaymentMethod,
                  label: 'Over-the-Counter',
                  sub: 'Pay in person at the barangay hall',
                  icon: <Building2 size={20} className="text-[#c9a84c]" />,
                  iconBg: 'bg-[#faf7f0]',
                  active: 'border-[#c9a84c] ring-2 ring-[#c9a84c]/30',
                },
              ] as const).map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    method === m.id ? m.active : 'border-[#e8e0d5] hover:border-[#c9a84c]/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.iconBg}`}>
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1a3a2a] text-sm">{m.label}</p>
                    <p className="text-xs text-[#7a6a55]">{m.sub}</p>
                  </div>
                  {method === m.id && (
                    <CheckCircle2 size={18} className="text-[#1a3a2a] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep('confirm')}
            className="w-full py-3.5 bg-[#1a3a2a] text-[#c9a84c] font-bold rounded-xl hover:bg-[#0f2419] transition-all text-sm"
          >
            Continue →
          </button>
        </>
      )}

      {/* ── Step: Confirm ── */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm p-5">
            <p className="text-xs font-bold text-[#5a5040] uppercase tracking-widest mb-4">
              {method === 'otc'
                ? 'Over-the-Counter Instructions'
                : `${method === 'gcash' ? 'GCash' : 'Maya'} Payment`}
            </p>

            {method === 'otc' ? (
              <div className="space-y-3">
                <div className="bg-[#f7f4ef] rounded-xl p-4 text-sm text-[#5a5040] space-y-2">
                  <p className="font-semibold text-[#1a3a2a]">📍 Visit the Barangay Hall</p>
                  <p>Bring this reference number to the cashier:</p>
                  <div className="flex items-center gap-2 bg-white border border-[#ddd5c8] rounded-lg px-3 py-2">
                    <span className="font-mono font-bold text-[#1a3a2a] flex-1">{demoRef}</span>
                    <button
                      onClick={() => copyToClipboard(demoRef)}
                      className="text-[#9a8f7a] hover:text-[#c9a84c] transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-[#9a8f7a]">
                    Office hours: Mon–Fri, 8:00 AM – 5:00 PM
                  </p>
                </div>
                <p className="text-xs text-[#9a8f7a]">
                  Once paid at the barangay hall, click "Confirm Payment" below to unlock your certificate.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#f7f4ef] rounded-xl p-4 text-center space-y-3">
                  <p className="text-xs text-[#9a8f7a] font-semibold uppercase tracking-wide">
                    Send ₱{request.amount}.00 to
                  </p>
                  <div className="bg-white rounded-lg border border-[#ddd5c8] p-3 inline-block">
                    <div className="w-24 h-24 bg-[#1a3a2a] rounded-lg flex items-center justify-center">
                      <span className="text-[#c9a84c] text-xs font-bold text-center leading-tight px-2">
                        DEMO<br />QR CODE
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-[#ddd5c8] rounded-lg px-3 py-2">
                    <span className="text-xs text-[#7a6a55]">Account No:</span>
                    <span className="font-mono font-bold text-[#1a3a2a] flex-1 text-sm">
                      09XX-XXX-XXXX
                    </span>
                    <button
                      onClick={() => copyToClipboard('09XX-XXX-XXXX')}
                      className="text-[#9a8f7a] hover:text-[#c9a84c] transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-[#9a8f7a]">Account Name: Barangay Lonos</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5a5040] uppercase tracking-wide mb-1.5">
                    Enter {method === 'gcash' ? 'GCash' : 'Maya'} Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. ${demoRef}`}
                    value={refNumber}
                    onChange={e => setRefNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#ddd5c8] bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c] transition-all"
                  />
                  <p className="text-xs text-[#9a8f7a] mt-1">
                    Found in your {method === 'gcash' ? 'GCash' : 'Maya'} app after sending.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-[#f7f4ef] rounded-xl border border-[#e8e0d5]">
            <ShieldCheck size={15} className="text-[#c9a84c] shrink-0" />
            <p className="text-xs text-[#7a6a55]">
              This is a demo payment system. No real money will be charged.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('select')}
              className="px-4 py-3 border border-[#ddd5c8] text-[#5a5040] font-semibold rounded-xl hover:bg-[#f7f4ef] transition-all text-sm"
            >
              ← Back
            </button>
            <button
              onClick={handlePay}
              disabled={processing}
              className="flex-1 py-3 bg-[#1a3a2a] text-[#c9a84c] font-bold rounded-xl hover:bg-[#0f2419] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {processing
                ? <Loader2 size={15} className="animate-spin" />
                : <CheckCircle2 size={15} />
              }
              {processing ? 'Processing...' : `Confirm Payment — ₱${request.amount}`}
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Processing ── */}
      {step === 'processing' && (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-[#f0ebe3] flex items-center justify-center mx-auto mb-4">
            <Loader2 size={28} className="text-[#c9a84c] animate-spin" />
          </div>
          <h3
            className="font-bold text-[#1a3a2a] text-lg mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Processing Payment...
          </h3>
          <p className="text-sm text-[#7a6a55]">
            Please wait while we confirm your payment.
          </p>
        </div>
      )}
    </div>
  )
}