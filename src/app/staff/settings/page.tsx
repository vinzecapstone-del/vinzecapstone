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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a3a2a]" style={{ fontFamily: "'Playfair Display', serif" }}>
            System Settings
          </h1>
          <p className="text-sm text-[#7a6a55] mt-1">
            Configure barangay information and certificate fees
          </p>
        </div>
        {touched && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 self-start sm:self-auto">
            <AlertCircle size={12} />
            Unsaved changes
          </span>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Settings */}
        <div className="lg:col-span-3 space-y-6">
          {/* Barangay Info */}
          <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-[#f7f4ef] bg-[#faf8f4]">
              <h2 className="font-bold text-[#1a3a2a] text-sm flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <div className="w-8 h-8 rounded-lg bg-[#1a3a2a] flex items-center justify-center">
                  <Building2 size={15} className="text-[#c9a84c]" />
                </div>
                Barangay Information
              </h2>
            </div>
            <div className="p-5 sm:p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-[#9a8f7a] uppercase tracking-widest mb-2">
                  Barangay Name
                </label>
                <input
                  type="text"
                  value={form.barangay_name}
                  onChange={e => set('barangay_name', e.target.value)}
                  placeholder="e.g. San Isidro"
                  className="w-full px-4 py-3 rounded-xl border border-[#ddd5c8] bg-[#faf8f4] text-sm font-semibold text-[#1a3a2a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] transition-all placeholder:text-[#b0a898]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#9a8f7a] uppercase tracking-widest mb-2">
                  Barangay Captain&apos;s Full Name
                </label>
                <input
                  type="text"
                  value={form.captain_name}
                  onChange={e => set('captain_name', e.target.value)}
                  placeholder="Hon. Eduardo I. Madeja"
                  className="w-full px-4 py-3 rounded-xl border border-[#ddd5c8] bg-[#faf8f4] text-sm font-semibold text-[#1a3a2a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] transition-all placeholder:text-[#b0a898]"
                />
                <p className="text-xs text-[#9a8f7a] mt-2 flex items-center gap-1">
                  <User size={11} />
                  This name appears on all generated certificates
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Fees */}
          <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-[#f7f4ef] bg-[#faf8f4]">
              <h2 className="font-bold text-[#1a3a2a] text-sm flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <div className="w-8 h-8 rounded-lg bg-[#1a3a2a] flex items-center justify-center">
                  <Receipt size={15} className="text-[#c9a84c]" />
                </div>
                Certificate Fees
              </h2>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-xs text-[#9a8f7a] mb-5 bg-[#f7f4ef] px-3 py-2 rounded-lg border border-[#e8e0d5]">
                <span className="font-bold text-[#7a6a55]">Note:</span> Cedula fee shown is the base fee. Final amount depends on gross annual income and will be computed by staff.
              </p>
              <div className="space-y-3">
                {feeFields.map(({ field, label, key }) => {
                  const colors = CERT_COLORS[key]
                  const value = form[field as keyof typeof form] as number
                  const isFree = value === 0

                  return (
                    <div
                      key={field}
                      className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl border border-[#f0ebe3] hover:border-[#ddd5c8] hover:shadow-sm transition-all group"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all"
                        style={{ background: colors.bg, color: colors.icon, border: `1px solid ${colors.border}` }}
                      >
                        {CERT_ICONS[key]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1a3a2a] truncate">{label}</p>
                        {isFree ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-0.5">
                            <CheckCircle2 size={9} /> Free of charge
                          </span>
                        ) : (
                          <p className="text-xs text-[#9a8f7a] mt-0.5">Base fee amount</p>
                        )}
                      </div>
                      <div className="relative w-28 sm:w-32 shrink-0">
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

        {/* Right Column - Preview & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Preview */}
          <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm overflow-hidden lg:sticky lg:top-6">
            <div className="px-5 py-4 border-b border-[#f7f4ef] bg-[#faf8f4] flex items-center justify-between">
              <h2 className="font-bold text-[#1a3a2a] text-sm flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <div className="w-8 h-8 rounded-lg bg-[#1a3a2a] flex items-center justify-center">
                  <Eye size={15} className="text-[#c9a84c]" />
                </div>
                Live Preview
              </h2>
            </div>
            <div className="p-5">
              <div className="bg-[#faf8f4] rounded-xl border border-[#e8e0d5] p-6 text-center space-y-3">
                <p className="text-[10px] text-[#9a8f7a] uppercase tracking-[0.2em] font-semibold">
                  Republic of the Philippines
                </p>
                <div className="w-12 h-0.5 bg-[#c9a84c] mx-auto" />
                <p className="font-bold text-[#1a3a2a] text-xl sm:text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {form.barangay_name ? `BARANGAY ${form.barangay_name.toUpperCase()}` : 'BARANGAY ______'}
                </p>
                <p className="text-xs text-[#7a6a55] font-medium">
                  Office of the Barangay Captain
                </p>
                <div className="pt-3 mt-3 border-t border-dashed border-[#ddd5c8]">
                  <p className="text-[10px] text-[#9a8f7a] uppercase tracking-wider font-semibold mb-1">
                    Digitally signed by
                  </p>
                  <p className="text-sm font-bold text-[#1a3a2a]">
                    {form.captain_name || '—'}
                  </p>
                </div>
              </div>

              {/* Fee Summary */}
              <div className="mt-5 space-y-2">
                <p className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-widest mb-2">
                  Fee Summary
                </p>
                {feeFields.map(({ field, label }) => {
                  const value = form[field as keyof typeof form] as number
                  if (value === 0) return null
                  return (
                    <div key={field} className="flex items-center justify-between text-xs py-1.5 border-b border-dashed border-[#f0ebe3] last:border-0">
                      <span className="text-[#7a6a55] font-medium">{label}</span>
                      <span className="font-bold text-[#1a3a2a]">₱{value.toLocaleString()}</span>
                    </div>
                  )
                })}
                <div className="flex items-center justify-between pt-2 border-t-2 border-[#e8e0d5]">
                  <span className="text-xs font-bold text-[#5a5040]">Total Base Fees</span>
                  <span className="text-sm font-bold text-[#1a3a2a]">₱{totalFees.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1a3a2a] flex items-center justify-center shrink-0">
                <Save size={18} className="text-[#c9a84c]" />
              </div>
              <div>
                <p className="font-bold text-[#1a3a2a] text-sm">Save Changes</p>
                <p className="text-xs text-[#9a8f7a]">Update system configuration</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !touched}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1a3a2a] text-[#c9a84c] font-bold rounded-xl hover:bg-[#0f2419] active:scale-[0.98] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-[#1a3a2a]/20"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : touched ? 'Save Settings' : 'No Changes'}
            </button>
            {!touched && settings && (
              <p className="text-xs text-[#9a8f7a] text-center mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 size={11} /> All settings are up to date
              </p>
            )}
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
