'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import {
  Search, Users, MapPin, Phone, Mail, X, Filter,
  Home, Zap, Droplets, GraduationCap, Briefcase,
  Wallet, HeartPulse, CalendarDays, ShieldCheck,
  ChevronRight, UserCircle2, Building2, Sparkles
} from 'lucide-react'
import type { Profile } from '@/types'

type ResidentProfile = Profile & {
  years_of_residency?: number | string | null
  updated_at?: string | null
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState<ResidentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [purokFilter, setPurokFilter] = useState('all')
  const [houseTypeFilter, setHouseTypeFilter] = useState('all')
  const [beneficiaryFilter, setBeneficiaryFilter] = useState('all')
  const [pwdOnly, setPwdOnly] = useState(false)
  const [seniorOnly, setSeniorOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [selectedResident, setSelectedResident] = useState<ResidentProfile | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'resident')
        .order('full_name')
      setResidents(data ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const filtered = useMemo(() => {
    let result = residents
    if (purokFilter !== 'all') result = result.filter(r => r.purok === purokFilter)
    if (houseTypeFilter !== 'all') result = result.filter(r => r.house_type === houseTypeFilter)
    if (beneficiaryFilter !== 'all') result = result.filter(r => r.government_beneficiary === beneficiaryFilter)
    if (pwdOnly) result = result.filter(r => r.is_pwd)
    if (seniorOnly) result = result.filter(r => r.is_senior)

    if (search) {
      const s = search.toLowerCase()
      result = result.filter(r =>
        r.full_name?.toLowerCase().includes(s) ||
        r.email?.toLowerCase().includes(s) ||
        r.resident_id?.toLowerCase().includes(s) ||
        r.purok?.toLowerCase().includes(s) ||
        r.occupation?.toLowerCase().includes(s)
      )
    }
    return result
  }, [search, purokFilter, houseTypeFilter, beneficiaryFilter, pwdOnly, seniorOnly, residents])

  const puroks = useMemo(() => 
    Array.from(new Set(residents.map(r => r.purok).filter(Boolean))).sort() as string[],
  [residents])

  const stats = useMemo(() => ({
    total: residents.length,
    pwd: residents.filter(r => r.is_pwd).length,
    senior: residents.filter(r => r.is_senior).length,
    withBenefits: residents.filter(r => r.government_beneficiary && r.government_beneficiary !== 'None').length,
    withElectricity: residents.filter(r => r.with_electricity).length,
    withBathroom: residents.filter(r => r.with_bathroom).length,
  }), [residents])

  const activeFiltersCount = [
    purokFilter !== 'all',
    houseTypeFilter !== 'all',
    beneficiaryFilter !== 'all',
    pwdOnly,
    seniorOnly,
  ].filter(Boolean).length

  const clearFilters = () => {
    setPurokFilter('all')
    setHouseTypeFilter('all')
    setBeneficiaryFilter('all')
    setPwdOnly(false)
    setSeniorOnly(false)
    setSearch('')
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a3a2a]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Residents Directory
          </h1>
          <p className="text-sm text-[#7a6a55] mt-1">
            Manage and view all registered barangay residents
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-[#1a3a2a] font-serif">{residents.length}</p>
          <p className="text-xs text-[#9a8f7a] font-semibold uppercase tracking-wider">Total Residents</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={<Users size={16} />} label="Total" value={stats.total} color="#1a3a2a" bg="#f0ebe3" />
        <StatCard icon={<HeartPulse size={16} />} label="PWD" value={stats.pwd} color="#7c3aed" bg="#f5f3ff" />
        <StatCard icon={<Sparkles size={16} />} label="Senior" value={stats.senior} color="#059669" bg="#ecfdf5" />
        <StatCard icon={<ShieldCheck size={16} />} label="Beneficiaries" value={stats.withBenefits} color="#0369a1" bg="#f0f9ff" />
        <StatCard icon={<Zap size={16} />} label="w/ Electricity" value={stats.withElectricity} color="#ca8a04" bg="#fefce8" />
        <StatCard icon={<Droplets size={16} />} label="w/ Bathroom" value={stats.withBathroom} color="#dc2626" bg="#fef2f2" />
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a8f7a]" />
            <input
              type="text"
              placeholder="Search by name, email, Resident ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ddd5c8] bg-[#faf8f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] placeholder:text-[#b0a898] transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              activeFiltersCount > 0
                ? 'bg-[#1a3a2a] text-[#c9a84c] border-[#1a3a2a]'
                : 'bg-white text-[#5a5040] border-[#ddd5c8] hover:border-[#c9a84c]'
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-[#c9a84c] text-[#1a3a2a] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#fee2e2] bg-[#fef2f2] text-[#991b1b] text-sm font-semibold hover:bg-[#fee2e2] transition-all"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#f0ebe3] animate-fade-up">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider">Purok</label>
              <select
                value={purokFilter}
                onChange={e => setPurokFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#ddd5c8] bg-[#faf8f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 appearance-none transition-all"
              >
                <option value="all">All Puroks</option>
                {puroks.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider">House Type</label>
              <select
                value={houseTypeFilter}
                onChange={e => setHouseTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#ddd5c8] bg-[#faf8f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 appearance-none transition-all"
              >
                <option value="all">All Types</option>
                <option value="Permanent">Permanent</option>
                <option value="Semi-permanent">Semi-permanent</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider">Beneficiary</label>
              <select
                value={beneficiaryFilter}
                onChange={e => setBeneficiaryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#ddd5c8] bg-[#faf8f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 appearance-none transition-all"
              >
                <option value="all">All</option>
                <option value="None">None</option>
                <option value="4Ps">4Ps</option>
                <option value="Senior Citizen">Senior Citizen</option>
                <option value="Solo Parent">Solo Parent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider">Special Groups</label>
              <div className="flex gap-2">
                <ToggleChip active={pwdOnly} onClick={() => setPwdOnly(!pwdOnly)} label="PWD" />
                <ToggleChip active={seniorOnly} onClick={() => setSeniorOnly(!seniorOnly)} label="Senior" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#7a6a55]">
          Showing <span className="font-bold text-[#1a3a2a]">{filtered.length}</span> of{' '}
          <span className="font-bold text-[#1a3a2a]">{residents.length}</span> residents
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] py-20 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#f0ebe3] flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-[#9a8f7a]" />
          </div>
          <p className="text-[#1a3a2a] font-bold text-lg mb-1">No residents found</p>
          <p className="text-[#9a8f7a] text-sm">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#f7f4ef] border-b border-[#e8e0d5] text-[10px] font-bold text-[#7a6a55] uppercase tracking-widest">
            <div className="col-span-4">Resident</div>
            <div className="col-span-2">Resident ID</div>
            <div className="col-span-2">Purok</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-2 text-right">Registered</div>
          </div>

          <div className="divide-y divide-[#f7f4ef]">
            {filtered.map(res => (
              <div
                key={res.id}
                onClick={() => setSelectedResident(res)}
                className="px-6 py-4 hover:bg-[#faf8f4] transition-all cursor-pointer group"
              >
                {/* Mobile */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={res.full_name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a3a2a] text-sm truncate">{res.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono bg-[#f0ebe3] text-[#5a5040] px-1.5 py-0.5 rounded">
                          {res.resident_id}
                        </span>
                        <span className="text-[10px] text-[#9a8f7a] flex items-center gap-0.5">
                          <MapPin size={9} /> {res.purok}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#ddd5c8] group-hover:text-[#c9a84c] transition-colors" />
                  </div>
                  <div className="flex gap-1.5 flex-wrap ml-11">
                    {res.is_pwd && <Badge text="PWD" color="purple" />}
                    {res.is_senior && <Badge text="Senior" color="green" />}
                    {res.government_beneficiary && res.government_beneficiary !== 'None' && (
                      <Badge text={res.government_beneficiary} color="blue" />
                    )}
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <Avatar name={res.full_name} />
                    <div className="min-w-0">
                      <p className="font-bold text-[#1a3a2a] text-sm truncate">{res.full_name}</p>
                      <p className="text-xs text-[#9a8f7a] truncate">{res.email || 'No email'}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-mono font-semibold bg-[#f0ebe3] text-[#5a5040] px-2.5 py-1 rounded-lg border border-[#e8e0d5]">
                      {res.resident_id}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center gap-1.5 text-sm text-[#5a5040]">
                      <MapPin size={12} className="text-[#c9a84c]" />
                      {res.purok ?? '—'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-[#5a5040]">
                      {res.contact_number || '—'}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs text-[#9a8f7a]">{formatDate(res.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resident Details Modal */}
      {selectedResident && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedResident(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#e8e0d5] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-modal-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e8e0d5] flex items-center justify-between bg-[#faf8f4] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1a3a2a] flex items-center justify-center">
                  <UserCircle2 size={20} className="text-[#c9a84c]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a3a2a] text-base font-serif">Resident Profile</h3>
                  <p className="text-[10px] text-[#9a8f7a] font-semibold uppercase tracking-wider">ID: {selectedResident.resident_id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResident(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9a8f7a] hover:text-[#1a3a2a] hover:bg-[#f0ebe3] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-5 pb-6 border-b border-[#f0ebe3]">
                <div className="w-20 h-20 rounded-2xl bg-[#1a3a2a] flex items-center justify-center shrink-0 shadow-lg shadow-[#1a3a2a]/20">
                  <span className="text-[#c9a84c] text-4xl font-bold font-serif">
                    {selectedResident.full_name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-2xl font-bold text-[#1a3a2a] font-serif truncate">
                    {selectedResident.full_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#7a6a55] bg-[#f0ebe3] px-2.5 py-1 rounded-lg border border-[#e8e0d5]">
                      <MapPin size={11} className="text-[#c9a84c]" />
                      Purok {selectedResident.purok ?? '—'}
                    </span>
                    {selectedResident.is_pwd && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        <HeartPulse size={11} /> PWD
                      </span>
                    )}
                    {selectedResident.is_senior && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <Sparkles size={11} /> Senior
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Personal Information */}
                <InfoSection title="Personal Information" icon={<UserCircle2 size={14} />}>
                  <InfoRow icon={<Mail size={13} />} label="Email" value={selectedResident.email} />
                  <InfoRow icon={<Phone size={13} />} label="Contact" value={selectedResident.contact_number} />
                  <InfoRow icon={<CalendarDays size={13} />} label="Birthdate" value={selectedResident.birthdate ? formatDate(selectedResident.birthdate) : null} />
                  <InfoRow icon={<MapPin size={13} />} label="Address" value={selectedResident.address} />
                </InfoSection>

                {/* Socio-Economic */}
                <InfoSection title="Socio-Economic Profile" icon={<Briefcase size={14} />}>
                  <InfoRow icon={<Briefcase size={13} />} label="Occupation" value={selectedResident.occupation} />
                  <InfoRow icon={<Wallet size={13} />} label="Monthly Income" value={selectedResident.monthly_income ? `₱${Number(selectedResident.monthly_income).toLocaleString()}` : null} />
                  <InfoRow icon={<GraduationCap size={13} />} label="Education" value={selectedResident.educational_attainment} />
                  <InfoRow icon={<ShieldCheck size={13} />} label="Beneficiary" value={selectedResident.government_beneficiary === 'None' ? null : selectedResident.government_beneficiary} />
                </InfoSection>

                {/* Living Conditions */}
                <InfoSection title="Living Conditions" icon={<Home size={14} />} className="md:col-span-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <ConditionCard
                      icon={<Home size={18} />}
                      label="House Type"
                      value={selectedResident.house_type || 'Not specified'}
                      active={!!selectedResident.house_type}
                    />
                    <ConditionCard
                      icon={<Zap size={18} />}
                      label="Electricity"
                      value={selectedResident.with_electricity ? 'Connected' : 'Not connected'}
                      active={!!selectedResident.with_electricity}
                    />
                    <ConditionCard
                      icon={<Droplets size={18} />}
                      label="Water / Bathroom"
                      value={selectedResident.with_bathroom ? 'Available' : 'Not available'}
                      active={!!selectedResident.with_bathroom}
                    />
                    <ConditionCard
                      icon={<Building2 size={18} />}
                      label="Residency"
                      value={selectedResident.years_of_residency ? `${selectedResident.years_of_residency} years` : 'Not specified'}
                      active={!!selectedResident.years_of_residency}
                    />
                  </div>
                </InfoSection>
              </div>

              {/* Footer Info */}
              <div className="pt-4 border-t border-[#f0ebe3] flex items-center justify-between text-xs text-[#9a8f7a]">
                <span>Registered on {formatDate(selectedResident.created_at)}</span>
                <span>Last updated {selectedResident.updated_at ? formatDate(selectedResident.updated_at) : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Subcomponents ─── */

function StatCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode
  label: string
  value: number
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
      <div>
        <p className="text-lg font-bold text-[#1a3a2a] font-serif leading-none">{value}</p>
        <p className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function ToggleChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
        active
          ? 'bg-[#1a3a2a] text-[#c9a84c] border-[#1a3a2a]'
          : 'bg-white text-[#5a5040] border-[#ddd5c8] hover:border-[#c9a84c]'
      }`}
    >
      {label}
    </button>
  )
}

function Avatar({ name }: { name?: string }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-[#1a3a2a] flex items-center justify-center shrink-0 shadow-sm">
      <span className="text-[#c9a84c] text-sm font-bold font-serif">{name?.[0]?.toUpperCase()}</span>
    </div>
  )
}

function Badge({ text, color }: { text: string; color: 'purple' | 'green' | 'blue' | 'amber' }) {
  const styles = {
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${styles[color]}`}>
      {text}
    </span>
  )
}

function InfoSection({ title, icon, children, className = '' }: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <h5 className="flex items-center gap-2 font-bold text-[#1a3a2a] text-xs uppercase tracking-widest mb-4 pb-2 border-b-2 border-[#e8e0d5]">
        <span className="text-[#c9a84c]">{icon}</span>
        {title}
      </h5>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function InfoRow({ icon, label, value }: {
  icon: React.ReactNode
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-dashed border-[#f0ebe3] last:border-0">
      <span className="text-[#c9a84c] mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-[#1a3a2a] mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

function ConditionCard({ icon, label, value, active }: {
  icon: React.ReactNode
  label: string
  value: string
  active: boolean
}) {
  return (
    <div className={`rounded-xl border p-3.5 text-center transition-all ${
      active
        ? 'bg-[#f7f4ef] border-[#ddd5c8] shadow-sm'
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
        active ? 'bg-[#1a3a2a] text-[#c9a84c]' : 'bg-gray-200 text-gray-400'
      }`}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-xs font-bold ${active ? 'text-[#1a3a2a]' : 'text-gray-400'}`}>{value}</p>
    </div>
  )
}
