'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import {
  ScrollText, Search, X, Filter, Clock, User, Shield,
  CheckCircle2, XCircle, AlertTriangle, FileEdit, Printer,
  Download, ChevronDown, ChevronUp, Activity, CalendarDays
} from 'lucide-react'
import type { AuditLog } from '@/types'
import { AUDIT_ACTION_LABELS } from '@/types'

const ACTION_META: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  APPROVED_AND_READY: {
    icon: <CheckCircle2 size={14} />,
    color: '#166534',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  REJECTED_REQUEST: {
    icon: <XCircle size={14} />,
    color: '#991b1b',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  UPDATED_SETTINGS: {
    icon: <FileEdit size={14} />,
    color: '#1e40af',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  MARKED_PICKED_UP: {
    icon: <CheckCircle2 size={14} />,
    color: '#0369a1',
    bg: '#f0f9ff',
    border: '#bae6fd',
  },
  GENERATED_CERTIFICATE: {
    icon: <Printer size={14} />,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  DELETED_REQUEST: {
    icon: <AlertTriangle size={14} />,
    color: '#9a3412',
    bg: '#fff7ed',
    border: '#fed7aa',
  },
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filtered, setFiltered] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      setLogs(data ?? [])
      setFiltered(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = [...logs]

    if (search) {
      const s = search.toLowerCase()
      result = result.filter(l =>
        l.staff_name.toLowerCase().includes(s) ||
        l.action.toLowerCase().includes(s) ||
        l.details?.toLowerCase().includes(s)
      )
    }

    if (actionFilter !== 'all') {
      result = result.filter(l => l.action === actionFilter)
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          result = result.filter(l => new Date(l.created_at) >= filterDate)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          result = result.filter(l => new Date(l.created_at) >= filterDate)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          result = result.filter(l => new Date(l.created_at) >= filterDate)
          break
      }
    }

    setFiltered(result)
  }, [search, actionFilter, dateFilter, logs])

  const actionTypes = useMemo(() => {
    const types = new Set(logs.map(l => l.action))
    return Array.from(types).sort()
  }, [logs])

  const stats = useMemo(() => ({
    total: logs.length,
    today: logs.filter(l => {
      const d = new Date(l.created_at)
      const today = new Date()
      return d.toDateString() === today.toDateString()
    }).length,
    approvals: logs.filter(l => l.action.includes('APPROVED')).length,
    rejections: logs.filter(l => l.action.includes('REJECTED')).length,
  }), [logs])

  const activeFiltersCount = [
    actionFilter !== 'all',
    dateFilter !== 'all',
  ].filter(Boolean).length

  const clearFilters = () => {
    setActionFilter('all')
    setDateFilter('all')
    setSearch('')
  }

  const getActionMeta = (action: string) => {
    return ACTION_META[action] || {
      icon: <Activity size={14} />,
      color: '#5a5040',
      bg: '#f0ebe3',
      border: '#ddd5c8',
    }
  }

  const formatActionLabel = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a3a2a]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Audit Logs
          </h1>
          <p className="text-sm text-[#7a6a55] mt-1">
            Security and accountability record of all staff actions
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#9a8f7a] bg-[#f7f4ef] px-3 py-1.5 rounded-lg border border-[#e8e0d5] self-start sm:self-auto">
          <Shield size={12} />
          <span className="font-semibold">{logs.length}</span> total entries
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<ScrollText size={16} />} label="Total Logs" value={stats.total} color="#1a3a2a" bg="#f0ebe3" />
        <StatCard icon={<Clock size={16} />} label="Today" value={stats.today} color="#0369a1" bg="#f0f9ff" />
        <StatCard icon={<CheckCircle2 size={16} />} label="Approvals" value={stats.approvals} color="#059669" bg="#ecfdf5" />
        <StatCard icon={<XCircle size={16} />} label="Rejections" value={stats.rejections} color="#dc2626" bg="#fef2f2" />
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a8f7a]" />
            <input
              type="text"
              placeholder="Search by staff, action, or details..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ddd5c8] bg-[#faf8f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] placeholder:text-[#b0a898] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a8f7a] hover:text-[#1a3a2a] transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
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
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#fee2e2] bg-[#fef2f2] text-[#991b1b] text-sm font-semibold hover:bg-[#fee2e2] transition-all"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#f0ebe3] animate-fade-up">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-widest">Action Type</label>
              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#ddd5c8] bg-[#faf8f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 appearance-none transition-all"
              >
                <option value="all">All Actions</option>
                {actionTypes.map(action => (
                  <option key={action} value={action}>{formatActionLabel(action)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-widest">Time Period</label>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#ddd5c8] bg-[#faf8f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 appearance-none transition-all"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#7a6a55]">
          Showing <span className="font-bold text-[#1a3a2a]">{filtered.length}</span> of{' '}
          <span className="font-bold text-[#1a3a2a]">{logs.length}</span> entries
        </p>
        {filtered.length > 0 && (
          <button
            onClick={() => {
              const csv = [
                ['Timestamp', 'Staff', 'Action', 'Details', 'Target ID'].join(','),
                ...filtered.map(l => [
                  new Date(l.created_at).toISOString(),
                  `"${l.staff_name}"`,
                  l.action,
                  `"${(l.details || '').replace(/"/g, '""')}"`,
                  l.target_id || '',
                ].join(','))
              ].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
              a.click()
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#5a5040] hover:text-[#1a3a2a] transition-colors"
          >
            <Download size={13} />
            Export CSV
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-[#e8e0d5] shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#f7f4ef] border-b border-[#e8e0d5] text-[10px] font-bold text-[#7a6a55] uppercase tracking-widest">
          <div className="col-span-2">Timestamp</div>
          <div className="col-span-2">Staff</div>
          <div className="col-span-2">Action</div>
          <div className="col-span-5">Details</div>
          <div className="col-span-1"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f0ebe3] flex items-center justify-center mx-auto mb-4">
              <ScrollText size={28} className="text-[#9a8f7a]" />
            </div>
            <p className="text-[#1a3a2a] font-bold text-lg mb-1">No logs found</p>
            <p className="text-[#9a8f7a] text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f7f4ef]">
            {filtered.map(log => {
              const meta = getActionMeta(log.action)
              const isExpanded = expandedLog === log.id

              return (
                <div
                  key={log.id}
                  className="hover:bg-[#faf8f4] transition-all"
                >
                  {/* Desktop Row */}
                  <div
                    className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer"
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  >
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={12} className="text-[#9a8f7a] shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-[#1a3a2a]">
                            {formatDate(log.created_at)}
                          </p>
                          <p className="text-[10px] text-[#9a8f7a]">
                            {new Date(log.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#1a3a2a] flex items-center justify-center shrink-0">
                          <span className="text-[#c9a84c] text-[10px] font-bold">
                            {log.staff_name[0]?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#1a3a2a] truncate">{log.staff_name}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border"
                        style={{
                          background: meta.bg,
                          color: meta.color,
                          borderColor: meta.border,
                        }}
                      >
                        {meta.icon}
                        {formatActionLabel(log.action)}
                      </span>
                    </div>
                    <div className="col-span-5">
                      <p className="text-sm text-[#5a5040] truncate">
                        {log.details ?? AUDIT_ACTION_LABELS[log.action as keyof typeof AUDIT_ACTION_LABELS] ?? log.action}
                      </p>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-[#9a8f7a]" />
                      ) : (
                        <ChevronDown size={16} className="text-[#9a8f7a]" />
                      )}
                    </div>
                  </div>

                  {/* Mobile Row */}
                  <div
                    className="lg:hidden px-5 py-4 cursor-pointer"
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#1a3a2a] flex items-center justify-center shrink-0">
                          <span className="text-[#c9a84c] text-xs font-bold">
                            {log.staff_name[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#1a3a2a] truncate">{log.staff_name}</p>
                          <p className="text-[10px] text-[#9a8f7a]">{formatDate(log.created_at)}</p>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                        style={{
                          background: meta.bg,
                          color: meta.color,
                          borderColor: meta.border,
                        }}
                      >
                        {meta.icon}
                        {formatActionLabel(log.action)}
                      </span>
                    </div>
                    <p className="text-xs text-[#5a5040] mt-2 ml-10.5 line-clamp-2">
                      {log.details ?? AUDIT_ACTION_LABELS[log.action as keyof typeof AUDIT_ACTION_LABELS] ?? log.action}
                    </p>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-6 pb-4 pt-0 bg-[#faf8f4] border-t border-[#f0ebe3] animate-fade-up">
                      <div className="lg:ml-[calc(16.666%+1rem)] py-3 space-y-2">
                        <div className="grid grid-cols-2 gap-4 max-w-md">
                          <div>
                            <p className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider">Staff ID</p>
                            <p className="text-xs font-mono text-[#1a3a2a] mt-0.5">{log.staff_id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider">Target ID</p>
                            <p className="text-xs font-mono text-[#1a3a2a] mt-0.5">{log.target_id || '—'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider">Full Details</p>
                          <p className="text-sm text-[#5a5040] mt-0.5">{log.details}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#9a8f7a] uppercase tracking-wider">Raw Timestamp</p>
                          <p className="text-xs font-mono text-[#1a3a2a] mt-0.5">{new Date(log.created_at).toISOString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
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