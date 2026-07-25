'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Save, Loader2, DollarSign, User, Building2, Receipt,
  Shield, FileText, HandHeart, Home, TreePine, CreditCard,
  Eye, CheckCircle2, AlertCircle
} from 'lucide-react'
import type { SystemSettings } from '@/types'

const DEFAULT_FORM = {
  captain_name: 'Hon. Eduardo I. Madeja',
  barangay_name: '',
  clearance_fee: 50,
  indigency_fee: 0,
  residency_fee: 50,
  business_clearance_fee: 150,
  tree_cutting_fee: 200,
  cedula_fee: 100,
}

const FORM_FIELDS = Object.keys(DEFAULT_FORM) as Array<keyof typeof DEFAULT_FORM>
const CORE_FIELDS = ['captain_name', 'barangay_name'] as const
const FEE_FIELDS = [
  'clearance_fee',
  'indigency_fee',
  'residency_fee',
  'business_clearance_fee',
  'tree_cutting_fee',
  'cedula_fee',
] as const

const CERT_ICONS: Record<string, React.ReactNode> = {
  clearance: <FileText size={18} />,
  indigency: <HandHeart size={18} />,
  residency: <Home size={18} />,
  business_clearance: <Building2 size={18} />,
  tree_cutting: <TreePine size={18} />,
  cedula: <CreditCard size={18} />,
}

const CERT_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  clearance:          { bg: '#eff6ff', icon: '#2563eb', border: '#dbeafe' },
  indigency:          { bg: '#fefce8', icon: '#ca8a04', border: '#fef9c3' },
  residency:          { bg: '#f0fdf4', icon: '#16a34a', border: '#dcfce7' },
  business_clearance: { bg: '#fdf4ff', icon: '#a855f7', border: '#f5d0fe' },
  tree_cutting:       { bg: '#f0fdf4', icon: '#15803d', border: '#bbf7d0' },
  cedula:             { bg: '#fff7ed', icon: '#ea580c', border: '#fed7aa' },
}

function getErrorMessage(error: unknown) {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (typeof error === 'object') {
    const maybeError = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown }
    return [maybeError.message, maybeError.details, maybeError.hint, maybeError.code]
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
      .join(' ')
      || 'Unknown error'
  }
  return 'Unknown error'
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [settingsColumns, setSettingsColumns] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [staffId, setStaffId] = useState('')
  const [staffName, setStaffName] = useState('')
  const [touched, setTouched] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStaffId(user.id)
        const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        setStaffName(prof?.full_name ?? 'Staff')
      }
      const { data, error } = await supabase.from('system_settings').select('*').limit(1).maybeSingle()
      if (error) {
        toast.error(`Failed to load system settings: ${getErrorMessage(error)}`)
      }
      if (data) {
        setSettings(data)
        setSettingsColumns(new Set(Object.keys(data)))
        setForm({
          captain_name:           data.captain_name ?? '',
          barangay_name:          data.barangay_name ?? '',
          clearance_fee:          data.clearance_fee ?? 50,
          indigency_fee:          data.indigency_fee ?? 0,
          residency_fee:          data.residency_fee ?? 50,
          business_clearance_fee: data.business_clearance_fee ?? 150,
          tree_cutting_fee:       data.tree_cutting_fee ?? 200,
          cedula_fee:             data.cedula_fee ?? 100,
        })
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const hasSettingsColumn = (field: keyof typeof DEFAULT_FORM | 'updated_at') => {
    if (!settings) return CORE_FIELDS.includes(field as typeof CORE_FIELDS[number])
    return settingsColumns.has(field)
  }

  const set = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setTouched(true)
  }

  const handleSave = async () => {
    if (!form.captain_name.trim() || !form.barangay_name.trim()) {
      toast.error('Captain name and barangay name are required.')
      return
    }
    setSaving(true)

    try {
      const payload = FORM_FIELDS.reduce<Record<string, string | number>>((acc, field) => {
        if (hasSettingsColumn(field)) acc[field] = form[field]
        return acc
      }, {})

      if (hasSettingsColumn('updated_at')) {
        payload.updated_at = new Date().toISOString()
      }

      const saveResult = settings?.id
        ? await supabase
            .from('system_settings')
            .update(payload)
            .eq('id', settings.id)
            .select()
            .single()
        : await supabase
            .from('system_settings')
            .insert(payload)
            .select()
            .single()

      const { data: savedSettings, error } = saveResult

      if (error) {
        toast.error(`Failed to save settings: ${getErrorMessage(error)}`)
        return
      }

      setSettings(savedSettings)
      setSettingsColumns(new Set(Object.keys(savedSettings)))
      const { error: auditError } = await supabase.from('audit_logs').insert({
        staff_id: staffId, staff_name: staffName,
        action: 'UPDATED_SETTINGS',
        details: 'Updated system settings',
      })
      if (auditError) {
        console.warn('Settings were saved, but audit logging failed:', getErrorMessage(auditError))
      }
      const unsupportedFees = FEE_FIELDS.filter(field => !hasSettingsColumn(field))
      if (unsupportedFees.length > 0) {
        toast.success('Barangay settings saved. Fee columns are missing from the database schema.')
      } else {
        toast.success('Settings saved successfully!')
      }
      setTouched(false)
    } catch (error) {
      toast.error(`Failed to save settings: ${getErrorMessage(error)}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const feeFields = [
    { field: 'clearance_fee',          label: 'Barangay Clearance',                  key: 'clearance' },
    { field: 'indigency_fee',          label: 'Certificate of Indigency',           key: 'indigency' },
    { field: 'residency_fee',          label: 'Certificate of Residency',             key: 'residency' },
    { field: 'business_clearance_fee', label: 'Business Clearance',                 key: 'business_clearance' },
    { field: 'tree_cutting_fee',       label: 'Tree Cutting Permit',                key: 'tree_cutting' },
    { field: 'cedula_fee',             label: 'Community Tax Certificate (Cedula)', key: 'cedula' },
  ] as const

  const totalFees = feeFields.reduce((sum, { field }) => sum + (form[field as keyof typeof form] as number), 0)

  return (
    <div className="settings-root">
      <style>{`
        .settings-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
          animation: settingsFadeUp 0.5s ease-out;
        }

        @keyframes settingsFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .settings-header {
          position: relative;
          background: linear-gradient(135deg, #1a3a2a 0%, #143025 50%, #0f261e 100%);
          border-radius: 1rem;
          padding: 24px;
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .settings-header {
            padding: 32px;
            border-radius: 1.25rem;
          }
        }

        .settings-header-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .settings-header-glow {
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

        .settings-header-content {
          position: relative;
          z-index: 10;
        }

        .settings-header-label {
          color: #9abfa8;
          font-size: 0.875rem;
          margin: 0 0 4px 0;
        }

        .settings-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          .settings-header-title {
            font-size: 1.875rem;
          }
        }

        .settings-header-sub {
          color: #7a9a88;
          font-size: 0.75rem;
          margin: 8px 0 0 0;
        }

        .settings-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        @media (min-width: 640px) {
          .settings-stats-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
          }
        }

        .settings-stat-card {
          background: #ffffff;
          border: 1px solid #e8e0d5;
          border-radius: 1rem;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .settings-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -8px rgba(26, 58, 42, 0.1);
        }

        .settings-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .settings-stat-info {
          min-width: 0;
        }

        .settings-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
          line-height: 1.2;
        }

        .settings-stat-label {
          font-size: 0.7rem;
          color: #9a8f7a;
          margin: 2px 0 0 0;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .settings-grid {
          display: grid;
          gap: 24px;
        }

        @media (min-width: 1024px) {
          .settings-grid {
            grid-template-columns: 1.15fr 0.85fr;
          }
        }

        .settings-card {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .settings-card-header {
          padding: 18px 20px;
          border-bottom: 1px solid #f0ebe3;
          background: #faf8f4;
        }

        @media (min-width: 640px) {
          .settings-card-header {
            padding: 20px 24px;
          }
        }

        .settings-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .settings-card-title svg {
          width: 18px;
          height: 18px;
          color: #c9a84c;
        }

        .settings-card-body {
          padding: 20px;
        }

        @media (min-width: 640px) {
          .settings-card-body {
            padding: 24px;
          }
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .settings-label {
          font-size: 0.625rem;
          font-weight: 700;
          color: #5a5040;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .settings-input {
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

        .settings-input:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
        }

        .settings-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #1a3a2a;
          background: #f7f4ef;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid #e8e0d5;
        }

        .settings-fee-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #f0ebe3;
          transition: all 0.2s ease;
        }

        .settings-fee-item:hover {
          border-color: #ddd5c8;
          background: #faf8f4;
        }

        .settings-fee-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .settings-preview {
          background: linear-gradient(135deg, #faf8f4 0%, #f3ede4 100%);
          border-radius: 14px;
          border: 1px solid #e8e0d5;
          padding: 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .settings-preview-label {
          font-size: 0.625rem;
          font-weight: 800;
          color: #9a8f7a;
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }

        .settings-preview-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          color: #1a3a2a;
          font-weight: 700;
          margin: 0;
        }

        .settings-preview-sub {
          font-size: 0.75rem;
          color: #7a6a55;
          margin: 0;
        }

        .settings-preview-divider {
          width: 48px;
          height: 2px;
          background: #c9a84c;
          margin: 0 auto;
        }

        .settings-save-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .settings-save-action {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 12px;
          background: #1a3a2a;
          color: #c9a84c;
          font-weight: 700;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }

        .settings-save-action:hover:not(:disabled) {
          background: #0f2419;
          transform: translateY(-1px);
        }

        .settings-save-action:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <div className="settings-header">
        <div className="settings-header-pattern" />
        <div className="settings-header-glow" />
        <div className="settings-header-content">
          <p className="settings-header-label">Staff Portal</p>
          <h1 className="settings-header-title">System Settings</h1>
          <p className="settings-header-sub">Configure barangay information, certificate details, and fees from one polished workspace.</p>
        </div>
      </div>

      <div className="settings-stats-grid">
        <StatCard
          icon={<Building2 size={16} />}
          label="Barangay"
          value={form.barangay_name || 'Not set'}
          color="#1a3a2a"
          bg="#f0ebe3"
        />
        <StatCard
          icon={<Shield size={16} />}
          label="Captain"
          value={form.captain_name ? form.captain_name.split(' ').pop() ?? form.captain_name : 'Not set'}
          color="#059669"
          bg="#ecfdf5"
        />
        <StatCard
          icon={<Receipt size={16} />}
          label="Fee Types"
          value={`${feeFields.length} certificates`}
          color="#0369a1"
          bg="#f0f9ff"
        />
        <StatCard
          icon={<DollarSign size={16} />}
          label="Total Base Fees"
          value={`₱${totalFees.toLocaleString()}`}
          color="#ca8a04"
          bg="#fefce8"
        />
      </div>

      <div className="settings-grid">
        <div className="space-y-6">
          <div className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">
                <Building2 size={16} />
                Barangay Information
              </h2>
            </div>
            <div className="settings-card-body space-y-5">
              <div className="settings-field">
                <label className="settings-label">Barangay Name</label>
                <input
                  type="text"
                  value={form.barangay_name}
                  onChange={e => set('barangay_name', e.target.value)}
                  placeholder="e.g. San Isidro"
                  className="settings-input"
                />
              </div>
              <div className="settings-field">
                <label className="settings-label">Barangay Captain&apos;s Full Name</label>
                <input
                  type="text"
                  value={form.captain_name}
                  onChange={e => set('captain_name', e.target.value)}
                  placeholder="Hon. Eduardo I. Madeja"
                  className="settings-input"
                />
                <p className="flex items-center gap-1 text-xs text-[#9a8f7a]">
                  <User size={11} />
                  This name appears on all generated certificates.
                </p>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">
                <Receipt size={16} />
                Certificate Fees
              </h2>
            </div>
            <div className="settings-card-body">
              <p className="mb-4 rounded-lg border border-[#e8e0d5] bg-[#f7f4ef] px-3 py-2 text-xs text-[#7a6a55]">
                <span className="font-bold text-[#1a3a2a]">Note:</span> Cedula fee shown is the base fee. Final amount depends on gross annual income and will be computed by staff.
              </p>
              <div className="space-y-3">
                {feeFields.map(({ field, label, key }) => {
                  const colors = CERT_COLORS[key]
                  const value = form[field as keyof typeof form] as number
                  const isFree = value === 0

                  return (
                    <div key={field} className="settings-fee-item">
                      <div className="settings-fee-icon" style={{ background: colors.bg, color: colors.icon, border: `1px solid ${colors.border}` }}>
                        {CERT_ICONS[key]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1a3a2a]">{label}</p>
                        {isFree ? (
                          <span className="settings-pill mt-1">
                            <CheckCircle2 size={10} /> Free of charge
                          </span>
                        ) : (
                          <p className="mt-1 text-xs text-[#9a8f7a]">Base fee amount</p>
                        )}
                      </div>
                      <div className="relative w-24 sm:w-28 shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8f7a] text-sm font-bold">₱</span>
                        <input
                          type="number"
                          min={0}
                          value={value}
                          onChange={e => set(field, Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-[#ddd5c8] bg-[#faf8f4] text-sm font-bold text-[#1a3a2a] text-right focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] transition-all"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="settings-card lg:sticky lg:top-6">
            <div className="settings-card-header">
              <h2 className="settings-card-title">
                <Eye size={16} />
                Live Preview
              </h2>
            </div>
            <div className="settings-card-body space-y-5">
              <div className="settings-preview">
                <p className="settings-preview-label">Republic of the Philippines</p>
                <div className="settings-preview-divider" />
                <p className="settings-preview-title">
                  {form.barangay_name ? `BARANGAY ${form.barangay_name.toUpperCase()}` : 'BARANGAY ______'}
                </p>
                <p className="settings-preview-sub">Office of the Barangay Captain</p>
                <div className="border-t border-dashed border-[#ddd5c8] pt-3 w-full">
                  <p className="settings-preview-label mb-1">Digitally signed by</p>
                  <p className="text-sm font-bold text-[#1a3a2a]">{form.captain_name || '—'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-widest">Fee Summary</p>
                {feeFields.map(({ field, label }) => {
                  const value = form[field as keyof typeof form] as number
                  if (value === 0) return null
                  return (
                    <div key={field} className="flex items-center justify-between border-b border-dashed border-[#f0ebe3] py-1.5 text-xs last:border-0">
                      <span className="text-[#7a6a55]">{label}</span>
                      <span className="font-bold text-[#1a3a2a]">₱{value.toLocaleString()}</span>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between border-t-2 border-[#e8e0d5] pt-2 text-sm">
                  <span className="font-bold text-[#5a5040]">Total Base Fees</span>
                  <span className="font-bold text-[#1a3a2a]">₱{totalFees.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-save-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a3a2a] text-[#c9a84c]">
                  <Save size={18} />
                </div>
                <div>
                  <p className="font-bold text-[#1a3a2a]">Save Changes</p>
                  <p className="text-xs text-[#9a8f7a]">Update system configuration</p>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !touched}
                className="settings-save-action"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : touched ? 'Save Settings' : 'No Changes'}
              </button>

              {!touched && settings && (
                <p className="flex items-center justify-center gap-1 text-center text-xs text-[#9a8f7a]">
                  <CheckCircle2 size={11} /> All settings are up to date
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Subcomponents ─── */

function StatCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  bg: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e8e0d5] p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-[#d4c4b0] transition-all">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: bg, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#1a3a2a] truncate">{value}</p>
        <p className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider">{label}</p>
      </div>
    </div>
  )
}
