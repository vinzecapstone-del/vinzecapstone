'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, stripLogoSeal } from '@/lib/utils'
import { Receipt, FileText, Eye, Download } from 'lucide-react'
import type { CertificateRequest } from '@/types'
import { CERTIFICATE_LABELS } from '@/types'

export default function TransactionsPage() {
  const [requests, setRequests] = useState<CertificateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('certificate_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setRequests(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const handlePrint = (html: string) => {
    const win = window.open('', '_blank')
    if (!win) return
    const cleaned = stripLogoSeal(html)
    win.document.write(cleaned)
    win.document.close()
    win.onload = () => win.print()
  }

  return (
    <div className="space-y-6 animate-fade-up pb-10">
      <div>
        <h1
          className="text-2xl font-bold text-[#1a3a2a]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Request History
        </h1>
        <p className="text-sm text-[#7a6a55] mt-1">
          A full history of all your certificate requests.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] py-20 text-center">
          <Receipt size={24} className="text-[#9a8f7a] mx-auto mb-3" />
          <p className="text-[#5a5040] font-semibold">No requests yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f0ebe3] flex items-center gap-2">
            <FileText size={15} className="text-[#c9a84c]" />
            <h2 className="font-bold text-[#1a3a2a] text-sm">
              {requests.length} Request{requests.length !== 1 ? 's' : ''}
            </h2>
          </div>
          <div className="divide-y divide-[#f7f4ef]">
            {requests.map(req => (
              <div
                key={req.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#faf8f4] transition-colors gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#f0ebe3] flex items-center justify-center text-xl shrink-0">
                    {req.certificate_type === 'clearance'
                      ? '🏛️'
                      : req.certificate_type === 'indigency'
                      ? '🤝'
                      : '🏠'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1a3a2a] truncate">
                      {CERTIFICATE_LABELS[req.certificate_type]}
                    </p>
                    <p className="text-xs text-[#9a8f7a]">
                      {req.tracking_number} · {formatDate(req.created_at)}
                    </p>
                    <p className="text-xs text-[#b0a898] mt-0.5">
                      Purpose: {req.purpose}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(req.status === 'ready' || req.status === 'picked_up') && req.certificate_html && (
                    <>
                      <button
                        onClick={() => setPreviewHtml(stripLogoSeal(req.certificate_html!))}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#ddd5c8] rounded-lg text-[10px] font-bold text-[#5a5040] hover:bg-[#f7f4ef] transition-all"
                      >
                        <Eye size={12} /> Preview
                      </button>
                      <button
                        onClick={() => handlePrint(req.certificate_html!)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a3a2a] text-[#c9a84c] rounded-lg text-[10px] font-bold hover:bg-[#0f2419] transition-all"
                      >
                        <Download size={12} /> Print
                      </button>
                    </>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border shrink-0 ${
                    req.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      : req.status === 'approved'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : req.status === 'ready'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    {req.status === 'ready'
                      ? 'Ready for Pickup'
                      : req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {previewHtml !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-[#1a3a2a] font-serif">Certificate Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrint(previewHtml)}
                  className="bg-[#1a3a2a] text-[#c9a84c] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5"
                >
                  <Download size={13} /> Print
                </button>
                <button
                  onClick={() => setPreviewHtml(null)}
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <iframe
                srcDoc={previewHtml}
                className="w-full max-w-[816px] aspect-[816/1056] mx-auto border shadow-lg bg-white"
                title="Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}