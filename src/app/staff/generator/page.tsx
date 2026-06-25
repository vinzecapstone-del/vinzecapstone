'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Printer, Loader2 } from 'lucide-react'
import type { CertificateRequest, SystemSettings } from '@/types'
import { CERTIFICATE_LABELS } from '@/types'
import { formatDate } from '@/lib/utils'

export default function DocumentGeneratorPage() {
  const [requests, setRequests] = useState<(CertificateRequest & { profiles: any })[]>([])
  const [filtered, setFiltered] = useState<(CertificateRequest & { profiles: any })[]>([])
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [printing, setPrinting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const [{ data: reqs }, { data: sett }] = await Promise.all([
        supabase
          .from('certificate_requests')
          .select('*, profiles(*)')
          .in('status', ['approved', 'ready'])
          .order('created_at', { ascending: false }),
        supabase.from('system_settings').select('*').single(),
      ])
      setRequests(reqs ?? [])
      setFiltered(reqs ?? [])
      setSettings(sett)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!search) { setFiltered(requests); return }
    setFiltered(requests.filter(r =>
      r.tracking_number.toLowerCase().includes(search.toLowerCase()) ||
      r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    ))
  }, [search, requests])

  const handlePrint = (req: CertificateRequest & { profiles: any }) => {
    setPrinting(req.id)
    const win = window.open('', '_blank')
    if (!win) { setPrinting(null); return }

    const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    const captainName = settings?.captain_name ?? 'Barangay Captain'
    const barangayName = settings?.barangay_name ?? 'Lonos'
    const residentName = req.profiles?.full_name ?? '—'
    const purok = req.profiles?.purok ?? '—'
    const birthdate = req.profiles?.birthdate ? new Date(req.profiles.birthdate).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

    const certTitles: Record<string, string> = {
      clearance: 'BARANGAY CLEARANCE',
      indigency: 'CERTIFICATE OF INDIGENCY',
      residency: 'CERTIFICATE OF RESIDENCY',
    }

    const certBodies: Record<string, string> = {
      clearance: `This is to certify that <strong>${residentName}</strong>, of legal age, a resident of ${purok}, Barangay ${barangayName}, has no derogatory record in this barangay as of this date and is known to be a law-abiding citizen of good moral character.`,
      indigency: `This is to certify that <strong>${residentName}</strong>, of legal age, a resident of ${purok}, Barangay ${barangayName}, belongs to an indigent family and is one of the underprivileged constituents of this barangay.`,
      residency: `This is to certify that <strong>${residentName}</strong>, born on ${birthdate}, is a bonafide resident of ${purok}, Barangay ${barangayName}, and has been residing in this barangay for a considerable length of time.`,
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${certTitles[req.certificate_type]}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', Times, serif; padding: 40px 60px; background: white; color: #111; font-size: 13pt; }
          .header { text-align: center; border-bottom: 3px double #1a3a2a; padding-bottom: 16px; margin-bottom: 20px; }
          .header .republic { font-size: 10pt; text-transform: uppercase; letter-spacing: 2px; color: #555; }
          .header .brgy { font-size: 22pt; font-weight: bold; color: #1a3a2a; margin: 6px 0 2px; }
          .header .address { font-size: 10pt; color: #777; }
          .cert-title { text-align: center; margin: 24px 0 20px; }
          .cert-title h2 { font-size: 18pt; font-weight: bold; color: #1a3a2a; text-decoration: underline; letter-spacing: 1px; }
          .body-text { line-height: 2; text-align: justify; margin: 16px 0; }
          .purpose { margin: 12px 0 24px; }
          .issued { margin: 20px 0 40px; }
          .signature { margin-top: 60px; text-align: center; }
          .sig-line { border-top: 1px solid #111; width: 240px; margin: 0 auto 4px; }
          .sig-name { font-weight: bold; font-size: 13pt; }
          .sig-role { font-size: 10pt; color: #555; }
          .tracking { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 9pt; color: #999; display: flex; justify-content: space-between; }
          @media print { body { padding: 20px 40px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="republic">Republic of the Philippines</div>
          <div class="brgy">Barangay ${barangayName}</div>
          <div class="address">Municipality · Province · Philippines</div>
        </div>
        <div class="cert-title">
          <h2>${certTitles[req.certificate_type]}</h2>
        </div>
        <p>TO WHOM IT MAY CONCERN:</p>
        <div class="body-text">
          <p>${certBodies[req.certificate_type]}</p>
        </div>
        <div class="purpose">
          <p>This certification is issued upon the request of the above-named person for <strong>${req.purpose}</strong> purposes.</p>
        </div>
        <div class="issued">
          <p>Issued this <strong>${today}</strong> at Barangay ${barangayName}.</p>
        </div>
        <div class="signature">
          <div class="sig-line"></div>
          <div class="sig-name">${captainName}</div>
          <div class="sig-role">Barangay Captain</div>
        </div>
        <div class="tracking">
          <span>Tracking No: ${req.tracking_number}</span>
          <span>Date Issued: ${today}</span>
        </div>
      </body>
      </html>
    `

    win.document.write(html)
    win.document.close()
    win.onload = () => { win.print(); setPrinting(null) }

    // Log action
    supabase.from('audit_logs').insert({
      action: 'GENERATED_CERTIFICATE',
      target_id: req.id,
      details: `Generated ${certTitles[req.certificate_type]} for ${residentName} — ${req.tracking_number}`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1a3a2a]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Document Generator
        </h1>
        <p className="text-sm text-[#7a6a55] mt-1">
          Generate and print certificates for approved requests.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a8f7a]" />
        <input type="text" placeholder="Search by name or tracking no..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#ddd5c8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c] placeholder:text-[#b0a898] transition-all" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] py-20 text-center">
          <Printer size={24} className="text-[#9a8f7a] mx-auto mb-3" />
          <p className="text-[#5a5040] font-semibold">No approved requests to generate</p>
          <p className="text-sm text-[#9a8f7a] mt-1">Approve requests first before generating certificates.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-5 gap-4 px-6 py-3 bg-[#f7f4ef] border-b border-[#e8e0d5] text-xs font-semibold text-[#7a6a55] uppercase tracking-wide">
            <div className="col-span-2">Resident</div>
            <div>Certificate</div>
            <div>Status</div>
            <div>Action</div>
          </div>
          <div className="divide-y divide-[#f7f4ef]">
            {filtered.map(req => (
              <div key={req.id} className="px-6 py-4 hover:bg-[#faf8f4] transition-colors">
                <div className="flex items-center justify-between gap-4 sm:grid sm:grid-cols-5">
                  <div className="sm:col-span-2 min-w-0">
                    <p className="text-sm font-semibold text-[#1a3a2a] truncate">{req.profiles?.full_name}</p>
                    <p className="text-xs text-[#9a8f7a]">{req.tracking_number} · {formatDate(req.created_at)}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-base">
                      {req.certificate_type === 'clearance' ? '🏛️' : req.certificate_type === 'indigency' ? '🤝' : '🏠'}
                    </span>
                    <span className="text-xs text-[#5a5040] font-medium">{CERTIFICATE_LABELS[req.certificate_type]}</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      req.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => handlePrint(req)}
                      disabled={printing === req.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#1a3a2a] text-[#c9a84c] font-semibold rounded-lg text-xs hover:bg-[#0f2419] transition-all disabled:opacity-60"
                    >
                      {printing === req.id ? <Loader2 size={13} className="animate-spin" /> : <Printer size={13} />}
                      {printing === req.id ? 'Printing...' : 'Print'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}