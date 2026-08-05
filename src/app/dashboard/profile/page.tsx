'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Loader2, Save, Eye, EyeOff, User, Phone, MapPin, Lock,
  ShieldCheck, Mail, Calendar, IdCard, BadgeCheck, Home,
  GraduationCap, Briefcase, Wallet, Zap, Bath
} from 'lucide-react'
import type { Profile } from '@/types'
import { PUROK_LIST } from '@/types'

type PwField = 'current' | 'new_pw' | 'confirm'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<Record<string, any>>({
    full_name: '', contact_number: '', address: '', purok: '',
    house_type: '', house_type_other: '',
    government_beneficiary: 'None', government_beneficiary_other: '',
    with_electricity: false, with_bathroom: false,
    monthly_income: '', occupation: '', educational_attainment: ''
  })
  const [passwords, setPasswords] = useState({ current: '', new_pw: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, new_pw: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const houseType = data?.house_type ?? ''
      const beneficiary = data?.government_beneficiary ?? 'None'
      const isOtherHouseType = houseType.startsWith('Others: ')
      const isOtherBeneficiary = beneficiary.startsWith('Others: ')
      setProfile(data)
      setForm({
        full_name: data?.full_name ?? '',
        contact_number: data?.contact_number ?? '',
        address: data?.address ?? '',
        purok: data?.purok ?? '',
        house_type: isOtherHouseType ? 'Others' : houseType,
        house_type_other: isOtherHouseType ? houseType.slice('Others: '.length) : '',
        government_beneficiary: isOtherBeneficiary ? 'Others' : beneficiary,
        government_beneficiary_other: isOtherBeneficiary ? beneficiary.slice('Others: '.length) : '',
        with_electricity: data?.with_electricity ?? false,
        with_bathroom: data?.with_bathroom ?? false,
        monthly_income: data?.monthly_income ?? '',
        occupation: data?.occupation ?? '',
        educational_attainment: data?.educational_attainment ?? '',
      })
    }
    load()
  }, [])

  const set = (field: string, value: any) => setForm((prev: Record<string, any>) => ({ ...prev, [field]: value }))
  const setPw = (field: PwField, value: string) => setPasswords(prev => ({ ...prev, [field]: value }))
  const togglePw = (field: PwField) => setShowPw(prev => ({ ...prev, [field]: !prev[field] }))

  const handleSaveProfile = async () => {
    if (!form.full_name.trim()) { toast.error('Full name is required.'); return }
    if (form.house_type === 'Others' && !form.house_type_other.trim()) { toast.error('Please specify the house type.'); return }
    if (form.government_beneficiary === 'Others' && !form.government_beneficiary_other.trim()) { toast.error('Please specify the government benefit.'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { house_type_other, government_beneficiary_other, ...profileFields } = form
    const { error } = await supabase.from('profiles').update({
      ...profileFields,
      house_type: form.house_type === 'Others'
        ? `Others: ${house_type_other.trim()}`
        : form.house_type,
      government_beneficiary: form.government_beneficiary === 'Others'
        ? `Others: ${government_beneficiary_other.trim()}`
        : form.government_beneficiary,
    }).eq('id', user!.id)
    setSaving(false)
    if (error) { toast.error('Failed to save changes.') } else { toast.success('Profile updated!') }
  }

  const handleChangePassword = async () => {
    if (!passwords.new_pw || passwords.new_pw.length < 8) { toast.error('Password must be at least 8 characters.'); return }
    if (passwords.new_pw !== passwords.confirm) { toast.error('Passwords do not match.'); return }
    setChangingPw(true)
    const { error } = await supabase.auth.updateUser({ password: passwords.new_pw })
    setChangingPw(false)
    if (error) { toast.error('Failed to change password. Please re-login and try again.') }
    else { toast.success('Password changed!'); setPasswords({ current: '', new_pw: '', confirm: '' }) }
  }

  if (!profile) return (
    <div className="prof-loading">
      <style>{`
        .prof-loading {
          display: flex;
          justify-content: center;
          padding: 80px 0;
        }
        .prof-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid #c9a84c;
          border-top-color: transparent;
          border-radius: 50%;
          animation: profSpin 0.8s linear infinite;
        }
        @keyframes profSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="prof-spinner" />
    </div>
  )

  return (
    <div className="prof-root">
      <style>{`
        .prof-root {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
          animation: profFadeUp 0.5s ease-out;
        }

        @keyframes profFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header Banner */
        .prof-header {
          position: relative;
          background: linear-gradient(135deg, #1a3a2a 0%, #143025 50%, #0f261e 100%);
          border-radius: 1rem;
          padding: 24px;
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .prof-header {
            padding: 32px;
            border-radius: 1.25rem;
          }
        }

        .prof-header-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .prof-header-glow {
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

        .prof-header-content {
          position: relative;
          z-index: 10;
        }

        .prof-header-label {
          color: #9abfa8;
          font-size: 0.875rem;
          margin: 0 0 4px 0;
        }

        .prof-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          .prof-header-title {
            font-size: 1.875rem;
          }
        }

        .prof-header-sub {
          color: #7a9a88;
          font-size: 0.75rem;
          margin: 8px 0 0 0;
        }

        /* ID Card */
        .prof-id-card {
          position: relative;
          background: linear-gradient(135deg, #1a3a2a 0%, #143025 100%);
          border-radius: 1rem;
          padding: 24px;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid rgba(201, 168, 76, 0.15);
        }

        @media (min-width: 640px) {
          .prof-id-card {
            padding: 28px;
            border-radius: 1.25rem;
            gap: 20px;
          }
        }

        .prof-id-card::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.06);
          filter: blur(40px);
        }

        .prof-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.15);
          border: 2px solid rgba(201, 168, 76, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }

        @media (min-width: 640px) {
          .prof-avatar {
            width: 64px;
            height: 64px;
          }
        }

        .prof-avatar-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #c9a84c;
        }

        .prof-id-info {
          position: relative;
          z-index: 2;
          min-width: 0;
        }

        .prof-id-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.125rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        @media (min-width: 640px) {
          .prof-id-name {
            font-size: 1.25rem;
          }
        }

        .prof-id-email {
          font-size: 0.875rem;
          color: #9abfa8;
          margin: 4px 0 0 0;
        }

        .prof-id-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .prof-id-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.625rem;
          font-weight: 800;
          color: #c9a84c;
          background: rgba(201, 168, 76, 0.1);
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid rgba(201, 168, 76, 0.2);
        }

        .prof-id-badge svg {
          width: 10px;
          height: 10px;
        }

        .prof-id-location {
          font-size: 0.625rem;
          color: #7a9a88;
          font-weight: 600;
        }

        /* Card */
        .prof-card {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          padding: 24px;
          overflow: hidden;
        }

        @media (min-width: 640px) {
          .prof-card {
            padding: 32px;
            border-radius: 1.25rem;
          }
        }

        .prof-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 24px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .prof-card-title svg {
          width: 18px;
          height: 18px;
          color: #c9a84c;
        }

        /* Form */
        .prof-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .prof-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 640px) {
          .prof-form-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .prof-col-full {
            grid-column: 1 / -1;
          }
        }

        .prof-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .prof-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.625rem;
          font-weight: 700;
          color: #5a5040;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .prof-label svg {
          width: 11px;
          height: 11px;
          color: #9a8f7a;
        }

        .prof-input {
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

        .prof-input::placeholder {
          color: #b0a490;
        }

        .prof-input:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
        }

        select.prof-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239a8f7a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }

        .prof-input-readonly {
          background: #f7f4ef;
          border-color: #e8e0d5;
          color: #7a6a55;
          cursor: default;
        }

        /* Checkbox group */
        .prof-checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .prof-checkbox-group {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 16px;
          }
        }

        .prof-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 4px 0;
        }

        .prof-checkbox input {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid #ddd5c8;
          accent-color: #1a3a2a;
          cursor: pointer;
          flex-shrink: 0;
        }

        .prof-checkbox input:checked {
          border-color: #1a3a2a;
        }

        .prof-checkbox-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: #5a5040;
        }

        .prof-checkbox-icon {
          display: inline;
          margin-right: 4px;
          vertical-align: middle;
        }

        /* Divider */
        .prof-divider {
          height: 1px;
          background: #e8e0d5;
          margin: 4px 0;
        }

        /* Password field */
        .prof-password-wrap {
          position: relative;
        }

        .prof-password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: #9a8f7a;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 6px;
        }

        .prof-password-toggle:hover {
          color: #1a3a2a;
          background: #f7f4ef;
        }

        .prof-password-toggle svg {
          width: 15px;
          height: 15px;
        }

        /* Button */
        .prof-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: #1a3a2a;
          color: #c9a84c;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          align-self: flex-start;
        }

        .prof-btn:hover {
          background: #0f2419;
        }

        .prof-btn:active {
          transform: scale(0.98);
        }

        .prof-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .prof-btn svg {
          width: 15px;
          height: 15px;
        }

        /* Mobile adjustments */
        @media (max-width: 480px) {
          .prof-root {
            gap: 16px;
          }
          .prof-header {
            padding: 20px;
          }
          .prof-header-title {
            font-size: 1.25rem;
          }
          .prof-id-card {
            padding: 20px;
          }
          .prof-card {
            padding: 20px;
          }
          .prof-avatar {
            width: 48px;
            height: 48px;
          }
          .prof-avatar-text {
            font-size: 1.25rem;
          }
        }
      `}</style>

      {/* Header */}
      <div className="prof-header">
        <div className="prof-header-pattern" />
        <div className="prof-header-glow" />
        <div className="prof-header-content">
          <p className="prof-header-label">Resident Portal</p>
          <h1 className="prof-header-title">My Profile</h1>
          <p className="prof-header-sub">Manage your account information</p>
        </div>
      </div>

      {/* ID Card */}
      <div className="prof-id-card">
        <div className="prof-avatar">
          <span className="prof-avatar-text">
            {profile.full_name?.[0]?.toUpperCase()}
          </span>
        </div>
        <div className="prof-id-info">
          <p className="prof-id-name">{profile.full_name}</p>
          <p className="prof-id-email">{profile.email}</p>
          <div className="prof-id-meta">
            <span className="prof-id-badge">
              <ShieldCheck size={10} />
              ID: {profile.resident_id}
            </span>
            <span className="prof-id-location">{profile.purok}</span>
          </div>
        </div>
      </div>

      <div className="prof-card">
        <h2 className="prof-card-title">
          <IdCard size={18} />
          Valid Government ID
        </h2>
        {profile.valid_id_url ? (
          <a href={profile.valid_id_url} target="_blank" rel="noopener noreferrer" className="block w-fit">
            <img
              src={profile.valid_id_url}
              alt="Uploaded valid ID"
              className="h-44 max-w-full rounded-lg border border-[#e8e0d5] bg-[#faf8f4] object-contain"
            />
          </a>
        ) : (
          <p className="text-sm text-[#9a8f7a]">No valid ID has been uploaded.</p>
        )}
      </div>

      {/* Personal Information */}
      <div className="prof-card">
        <h2 className="prof-card-title">
          <User size={18} />
          Personal Information
        </h2>
        <div className="prof-form">
          <div className="prof-field prof-col-full">
            <label className="prof-label">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              className="prof-input"
            />
          </div>

          <div className="prof-form-grid">
            <div className="prof-field">
              <label className="prof-label">
                <Phone size={11} />
                Contact Number
              </label>
              <input
                type="tel"
                placeholder="09XX-XXX-XXXX"
                value={form.contact_number}
                onChange={e => set('contact_number', e.target.value)}
                className="prof-input"
              />
            </div>
            <div className="prof-field">
              <label className="prof-label">
                <MapPin size={11} />
                Purok
              </label>
              <select
                value={form.purok}
                onChange={e => set('purok', e.target.value)}
                className="prof-input"
              >
                <option value="">Select Purok...</option>
                {PUROK_LIST.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="prof-field prof-col-full">
            <label className="prof-label">
              <Home size={11} />
              Home Address
            </label>
            <input
              type="text"
              placeholder="House No., Street, Barangay..."
              value={form.address}
              onChange={e => set('address', e.target.value)}
              className="prof-input"
            />
          </div>

          <div className="prof-divider" />

          <div className="prof-form-grid">
            <div className="prof-field">
              <label className="prof-label">
                <Briefcase size={11} />
                Occupation
              </label>
              <input
                type="text"
                value={form.occupation}
                onChange={e => set('occupation', e.target.value)}
                className="prof-input"
              />
            </div>
            <div className="prof-field">
              <label className="prof-label">
                <Wallet size={11} />
                Monthly Income
              </label>
              <input
                type="text"
                placeholder="e.g. 15000"
                value={form.monthly_income}
                onChange={e => set('monthly_income', e.target.value)}
                className="prof-input"
              />
            </div>
            <div className="prof-field">
              <label className="prof-label">
                <GraduationCap size={11} />
                Educational Attainment
              </label>
              <select
                value={form.educational_attainment}
                onChange={e => set('educational_attainment', e.target.value)}
                className="prof-input"
              >
                <option value="">Select...</option>
                <option value="Elementary Undergraduate">Elementary Undergraduate</option>
                <option value="Elementary Graduate">Elementary Graduate</option>
                <option value="High School Undergraduate">High School Undergraduate</option>
                <option value="High School Graduate">High School Graduate</option>
                <option value="College Undergraduate">College Undergraduate</option>
                <option value="College Graduate">College Graduate</option>
                <option value="Vocational">Vocational</option>
                <option value="Post-Graduate">Post-Graduate</option>
              </select>
            </div>
            <div className="prof-field">
              <label className="prof-label">Government Beneficiary</label>
              <select
                value={form.government_beneficiary}
                onChange={e => set('government_beneficiary', e.target.value)}
                className="prof-input"
              >
                <option value="None">None</option>
                <option value="4Ps">4Ps</option>
                <option value="Senior Citizen">Senior Citizen</option>
                <option value="Solo Parent">Solo Parent</option>
                <option value="Others">Others</option>
              </select>
              {form.government_beneficiary === 'Others' && (
                <input
                  type="text"
                  value={form.government_beneficiary_other}
                  onChange={e => set('government_beneficiary_other', e.target.value)}
                  placeholder="Specify government benefit"
                  className="prof-input"
                />
              )}
            </div>
          </div>

          <div className="prof-form-grid">
            <div className="prof-field">
              <label className="prof-label">House Type</label>
              <select
                value={form.house_type}
                onChange={e => set('house_type', e.target.value)}
                className="prof-input"
              >
                <option value="">Select...</option>
                <option value="Permanent">Permanent</option>
                <option value="Semi-permanent">Semi-permanent</option>
                <option value="Temporary">Temporary</option>
                <option value="Others">Others</option>
              </select>
              {form.house_type === 'Others' && (
                <input
                  type="text"
                  value={form.house_type_other}
                  onChange={e => set('house_type_other', e.target.value)}
                  placeholder="Specify house type"
                  className="prof-input"
                />
              )}
            </div>
            <div className="prof-field prof-col-full">
              <div className="prof-checkbox-group">
                <label className="prof-checkbox">
                  <input
                    type="checkbox"
                    checked={form.with_electricity}
                    onChange={e => set('with_electricity', e.target.checked)}
                  />
                  <span className="prof-checkbox-text">
                    <Zap size={14} className="prof-checkbox-icon" />
                    With Electricity
                  </span>
                </label>
                <label className="prof-checkbox">
                  <input
                    type="checkbox"
                    checked={form.with_bathroom}
                    onChange={e => set('with_bathroom', e.target.checked)}
                  />
                  <span className="prof-checkbox-text">
                    <Bath size={14} className="prof-checkbox-icon" />
                    With Bathroom
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="prof-divider" />

          <div className="prof-form-grid">
            <div className="prof-field">
              <label className="prof-label">
                <Mail size={11} />
                Email
              </label>
              <div className="prof-input prof-input-readonly">{profile.email ?? '—'}</div>
            </div>
            <div className="prof-field">
              <label className="prof-label">
                <Calendar size={11} />
                Birthdate
              </label>
              <div className="prof-input prof-input-readonly">{profile.birthdate ?? '—'}</div>
            </div>
            <div className="prof-field">
              <label className="prof-label">
                <IdCard size={11} />
                Resident ID
              </label>
              <div className="prof-input prof-input-readonly">{profile.resident_id ?? '—'}</div>
            </div>
            <div className="prof-field">
              <label className="prof-label">
                <BadgeCheck size={11} />
                Role
              </label>
              <div className="prof-input prof-input-readonly">{profile.role ?? '—'}</div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="prof-btn"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="prof-card">
        <h2 className="prof-card-title">
          <Lock size={18} />
          Change Password
        </h2>
        <div className="prof-form">
          <div className="prof-form-grid">
            <div className="prof-field">
              <label className="prof-label">New Password</label>
              <div className="prof-password-wrap">
                <input
                  type={showPw.new_pw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={passwords.new_pw}
                  onChange={e => setPw('new_pw', e.target.value)}
                  className="prof-input"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => togglePw('new_pw')}
                  className="prof-password-toggle"
                >
                  {showPw.new_pw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="prof-field">
              <label className="prof-label">Confirm Password</label>
              <div className="prof-password-wrap">
                <input
                  type={showPw.confirm ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  value={passwords.confirm}
                  onChange={e => setPw('confirm', e.target.value)}
                  className="prof-input"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => togglePw('confirm')}
                  className="prof-password-toggle"
                >
                  {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={changingPw}
            className="prof-btn"
          >
            {changingPw ? <Loader2 className="animate-spin" /> : <Lock size={15} />}
            {changingPw ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  )
}
