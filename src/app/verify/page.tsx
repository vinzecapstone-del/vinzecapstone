'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, CheckCircle2, XCircle, ShieldCheck, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { CertificateRequest } from '@/types'
import { CERTIFICATE_LABELS } from '@/types'

export default function VerifyPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CertificateRequest & { profiles: any } | null>(null)
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return

    setLoading(true)
    setSearched(false)
    setResult(null)

    const { data } = await supabase
      .from('certificate_requests')
      .select('*, profiles(full_name, purok, resident_id)')
      .eq('tracking_number', trackingNumber.trim().toUpperCase())
      .single()

    setResult(data ?? null)
    setSearched(true)
    setLoading(false)
  }

  const isAuthentic = result?.status === 'ready' || result?.status === 'approved'

  return (
    <div className="min-h-screen bg-[#faf8f4]">

      {/* Hero */}
      <div className="bg-[#1a3a2a] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #c9a84c 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#c9a84c]/20 border border-[#c9a84c]/40 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={28} className="text-[#c9a84c]" />
          </div>
          <h1
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Certificate Verification
          </h1>
          <div className="w-16 h-0.5 bg-[#c9a84c] mx-auto mb-4" />
          <p className="text-[#9abfa8] text-base max-w-lg mx-auto leading-relaxed">
            Enter a tracking number to verify the authenticity of a certificate using SerbisyoHub. This service is available to the public — no login required.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-lg p-6">
          <form onSubmit={handleVerify} className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a8f7a]" />
              <input
                type="text"
                placeholder="Enter tracking number (e.g. BRY-2025-XXXXXX)"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ddd5c8] bg-white text-sm text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c] placeholder:text-[#b0a898] transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !trackingNumber.trim()}
              className="px-6 py-3 bg-[#1a3a2a] text-[#c9a84c] font-bold rounded-xl hover:bg-[#0f2419] transition-all text-sm disabled:opacity-60 flex items-center gap-2 shrink-0"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>

      {/* Result */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {searched && (
          <div className={`rounded-2xl border-2 overflow-hidden animate-fade-up ${
            isAuthentic
              ? 'border-green-200 bg-green-50'
              : result
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-red-200 bg-red-50'
          }`}>

            {/* Result header */}
            <div className={`px-6 py-5 flex items-center gap-4 ${
              isAuthentic ? 'bg-green-100' : result ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                isAuthentic ? 'bg-green-200' : result ? 'bg-yellow-200' : 'bg-red-200'
              }`}>
                {isAuthentic
                  ? <CheckCircle2 size={24} className="text-green-700" />
                  : <XCircle size={24} className={result ? 'text-yellow-700' : 'text-red-700'} />
                }
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  isAuthentic ? 'text-green-800' : result ? 'text-yellow-800' : 'text-red-800'
                }`} style={{ fontFamily: "'Playfair Display', serif" }}>
                  {isAuthentic
                    ? '✅ Certificate is Authentic'
                    : result
                    ? '⚠️ Certificate Found but Not Yet Issued'
                    : '❌ Certificate Not Found'
                  }
                </h2>
                <p className={`text-sm mt-0.5 ${
                  isAuthentic ? 'text-green-700' : result ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {isAuthentic
                    ? 'This certificate has been officially issued by Barangay Lonos.'
                    : result
                    ? `Current status: ${result.status.toUpperCase()} — this certificate has not been officially released yet.`
                    : `No certificate found with tracking number "${trackingNumber}". It may be invalid or forged.`
                  }
                </p>
              </div>
            </div>

            {/* Certificate details */}
            {result && (
              <div className="px-6 py-5">
                <p className="text-xs font-bold text-[#5a5040] uppercase tracking-widest mb-4">
                  Certificate Details
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Tracking Number', value: result.tracking_number },
                    { label: 'Certificate Type', value: CERTIFICATE_LABELS[result.certificate_type] },
                    { label: 'Issued To', value: result.profiles?.full_name ?? '—' },
                    { label: 'Resident ID', value: result.profiles?.resident_id ?? '—' },
                    { label: 'Purok', value: result.profiles?.purok ?? '—' },
                    { label: 'Purpose', value: result.purpose },
                    { label: 'Date Filed', value: formatDate(result.created_at) },
                    { label: 'Status', value: result.status.toUpperCase() },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/60 rounded-xl px-4 py-3">
                      <p className="text-xs text-[#9a8f7a] mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-[#1a3a2a]">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Authenticity badge */}
                {isAuthentic && (
                  <div className="mt-5 flex items-center gap-3 bg-white/80 border border-green-200 rounded-xl px-4 py-3">
                    <ShieldCheck size={20} className="text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-green-800">Verified by SerbisyoHub</p>
                      <p className="text-xs text-green-600">
                        This document is an official record from the Barangay Information System.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!searched && (
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            {[
              { icon: '🔢', title: 'Enter Tracking Number', desc: 'Type the tracking number printed on the certificate (e.g. BRY-2025-XXXXXX).' },
              { icon: '🔍', title: 'Click Verify', desc: 'Our system will check the certificate against official barangay records.' },
              { icon: '✅', title: 'View Result', desc: 'You\'ll see if the certificate is authentic, pending, or not found.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-5 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="font-bold text-[#1a3a2a] text-sm mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {item.title}
                </p>
                <p className="text-xs text-[#7a6a55] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}