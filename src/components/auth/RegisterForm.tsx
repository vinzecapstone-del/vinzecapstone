'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { PUROK_LIST } from '@/types'

interface Props {
  onSwitchToLogin: () => void
}

function generateResidentId(): string {
  const num = Math.floor(10000 + Math.random() * 90000)
  return `RES-${num}`
}

export default function RegisterForm({ onSwitchToLogin }: Props) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    birthdate: '',
    purok: '',
    contact_number: '',
    address: '',
    house_type: '',
    is_pwd: false,
    is_senior: false,
    government_beneficiary: 'None',
    with_electricity: false,
    with_bathroom: false,
    monthly_income: '',
    occupation: '',
    educational_attainment: '',
    agree_terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()
  const set = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const passwordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    const map = [
      { label: '', color: '#e8e0d5' },
      { label: 'Weak', color: '#f87171' },
      { label: 'Fair', color: '#fb923c' },
      { label: 'Good', color: '#facc15' },
      { label: 'Strong', color: '#22c55e' },
    ]
    return { score, ...map[score] }
  }

  const strength = passwordStrength(form.password)

  const validate = () => {
    if (!form.full_name.trim()) return 'Full name is required.'
    if (!form.email.trim()) return 'Email is required.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email.'
    if (!form.birthdate) return 'Birthdate is required.'
    if (!form.purok) return 'Please select your Purok.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirm_password) return 'Passwords do not match.'
    if (!form.agree_terms) return 'You must agree to the Terms and Data Privacy Act.'
    return null
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { toast.error(err); return }

    setLoading(true)
    try {
      const residentId = generateResidentId()

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name } },
      })

      if (signUpError) {
        toast.error(
          signUpError.message.includes('already registered')
            ? 'This email is already registered. Please sign in.'
            : signUpError.message
        )
        return
      }

      if (!data.user) {
        toast.error('Registration failed. Please try again.')
        return
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: form.full_name,
        email: form.email,
        resident_id: residentId,
        birthdate: form.birthdate,
        purok: form.purok,
        contact_number: form.contact_number,
        address: form.address,
        house_type: form.house_type,
        is_pwd: form.is_pwd,
        is_senior: form.is_senior,
        government_beneficiary: form.government_beneficiary,
        with_electricity: form.with_electricity,
        with_bathroom: form.with_bathroom,
        monthly_income: form.monthly_income,
        occupation: form.occupation,
        educational_attainment: form.educational_attainment,
        role: 'resident',
      })

      if (profileError) {
        toast.error('Profile creation failed. Please contact support.')
        return
      }

      setSuccess(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Unified central style system mapping straight to inline coordinates
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      padding: '40px',
      maxWidth: '640px',
      margin: '0 auto',
      width: '100%',
    },
    successWrapper: {
      padding: '48px 40px',
      textAlign: 'center' as const,
      maxWidth: '500px',
      margin: '0 auto',
    },
    successBadge: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: '#f0fdf4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px auto',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1a3a2a',
      fontFamily: "'Playfair Display', serif",
      lineHeight: '1.3',
      marginBottom: '10px',
    },
    subtitleParagraph: {
      color: '#7a6a55',
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '1.7',
      marginBottom: '40px',
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '11px',
      fontWeight: '900',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.15em',
      color: '#c9a84c',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      marginBottom: '24px',
      padding: '0',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px', // Generous separation between field elements
      marginBottom: '28px',
    },
    gridLayout2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '24px',
    },
    gridLayout3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '24px',
    },
    checkboxGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '28px',
    },
    label: {
      fontSize: '11px',
      fontWeight: '900',
      color: '#1a3a2a',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      marginLeft: '4px',
    },
    inputField: {
      width: '100%',
      padding: '14px 20px',
      borderRadius: '14px',
      border: '1px solid #ddd5c8',
      backgroundColor: 'rgba(250, 248, 244, 0.5)',
      fontSize: '14px',
      color: '#1a3a2a',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    relativeContainer: {
      position: 'relative' as const,
    },
    eyeIconButton: {
      position: 'absolute' as const,
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#9a8f7a',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '0',
    },
    cardCheckboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #ddd5c8',
      backgroundColor: 'rgba(250, 248, 244, 0.5)',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease',
    },
    privacyWrapperLabel: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '4px',
      cursor: 'pointer',
      marginBottom: '32px',
    },
    privacyText: {
      fontSize: '12px',
      color: '#9a8f7a',
      lineHeight: '1.75', // Spacious reading alignment for dense structural details
      fontStyle: 'italic' as const,
    },
    submitButton: {
      width: '100%',
      padding: '18px',
      backgroundColor: '#1a3a2a',
      color: '#c9a84c',
      fontWeight: '900',
      borderRadius: '16px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      cursor: 'pointer',
      boxShadow: '0 10px 25px rgba(26, 58, 42, 0.15)',
      transition: 'all 0.2s ease',
    },
    buttonText: {
      textTransform: 'uppercase' as const,
      letterSpacing: '0.15em',
      fontSize: '12px',
    },
    footerWrapper: {
      marginTop: '40px',
      paddingTop: '32px',
      borderTop: '1px dashed #e8e0d5',
      textAlign: 'center' as const,
    },
    footerText: {
      fontSize: '14px',
      color: '#9a8f7a',
      lineHeight: '1.6',
    },
    footerAction: {
      background: 'none',
      border: 'none',
      color: '#1a3a2a',
      fontWeight: '900',
      cursor: 'pointer',
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
      padding: '0',
      marginLeft: '4px',
    },
  }

  // ── Success Screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={styles.successWrapper}>
        <div style={styles.successBadge}>
          <CheckCircle2 size={40} style={{ color: '#16a34a' }} />
        </div>
        <h3 style={styles.title}>
          Registration Successful!
        </h3>
        <p style={{ ...styles.subtitleParagraph, marginBottom: '32px' }}>
          A confirmation email has been sent to:<br />
          <span style={{ fontWeight: '700', color: '#1a3a2a' }}>{form.email}</span>
        </p>
        <button
          onClick={onSwitchToLogin}
          style={styles.submitButton}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f2419')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a3a2a')}
        >
          <span style={styles.buttonText}>Go to Sign In</span>
        </button>
      </div>
    )
  }

  // ── Register Form ─────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {/* Header */}
      <div>
        <button
          onClick={onSwitchToLogin}
          style={styles.backButton}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1a3a2a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#c9a84c')}
        >
          <ArrowLeft size={14} />
          Back to Login
        </button>
        <h2 style={styles.title}>
          Create Account
        </h2>
        <p style={styles.subtitleParagraph}>
          Register to request barangay certificates online.
        </p>
      </div>

      <form onSubmit={handleRegister}>
        {/* Full Name */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            placeholder="Juan dela Cruz"
            value={form.full_name}
            onChange={e => set('full_name', e.target.value)}
            style={styles.inputField}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#c9a84c'
              e.currentTarget.style.backgroundColor = '#ffffff'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#ddd5c8'
              e.currentTarget.style.backgroundColor = 'rgba(250, 248, 244, 0.5)'
            }}
          />
        </div>

        {/* Email */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            placeholder="yourname@email.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            style={styles.inputField}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#c9a84c'
              e.currentTarget.style.backgroundColor = '#ffffff'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#ddd5c8'
              e.currentTarget.style.backgroundColor = 'rgba(250, 248, 244, 0.5)'
            }}
          />
        </div>

        {/* Birthdate + Purok Group */}
        <div style={{ ...styles.gridLayout2, marginBottom: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={styles.label}>Birthdate</label>
            <input
              type="date"
              value={form.birthdate}
              onChange={e => set('birthdate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={styles.inputField}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={styles.label}>Purok</label>
            <div style={styles.relativeContainer}>
              <select
                value={form.purok}
                onChange={e => set('purok', e.target.value)}
                style={{ ...styles.inputField, appearance: 'none' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}
              >
                <option value="">Select Purok...</option>
                {PUROK_LIST.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contact Number & Address Group */}
        <div style={{ ...styles.gridLayout2, marginBottom: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={styles.label}>Contact Number</label>
            <input
              type="text"
              placeholder="09123456789"
              value={form.contact_number}
              onChange={e => set('contact_number', e.target.value)}
              style={styles.inputField}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={styles.label}>Detailed Address</label>
            <input
              type="text"
              placeholder="House/Block/Lot No., Street"
              value={form.address}
              onChange={e => set('address', e.target.value)}
              style={styles.inputField}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}
            />
          </div>
        </div>

        {/* Occupation & Education & Income Group */}
        <div style={{ ...styles.gridLayout3, marginBottom: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={styles.label}>Occupation</label>
            <input
              type="text"
              placeholder="e.g. Teacher"
              value={form.occupation}
              onChange={e => set('occupation', e.target.value)}
              style={styles.inputField}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={styles.label}>Monthly Income</label>
            <input
              type="text"
              placeholder="e.g. 15,000"
              value={form.monthly_income}
              onChange={e => set('monthly_income', e.target.value)}
              style={styles.inputField}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={styles.label}>Education</label>
            <select
              value={form.educational_attainment}
              onChange={e => set('educational_attainment', e.target.value)}
              style={{ ...styles.inputField, appearance: 'none' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}
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
        </div>

        {/* House Info & Government Status Group */}
        <div style={{ ...styles.gridLayout2, marginBottom: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={styles.label}>House Type</label>
            <select
              value={form.house_type}
              onChange={e => set('house_type', e.target.value)}
              style={{ ...styles.inputField, appearance: 'none' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}
            >
              <option value="">Select...</option>
              <option value="Permanent">Permanent</option>
              <option value="Semi-permanent">Semi-permanent</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={styles.label}>Gov't Beneficiary</label>
            <select
              value={form.government_beneficiary}
              onChange={e => set('government_beneficiary', e.target.value)}
              style={{ ...styles.inputField, appearance: 'none' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}
            >
              <option value="None">None</option>
              <option value="4Ps">4Ps</option>
              <option value="Senior Citizen">Senior Citizen</option>
              <option value="Solo Parent">Solo Parent</option>
            </select>
          </div>
        </div>

        {/* Additional Status Checkboxes */}
        <div style={styles.checkboxGrid}>
          <label style={styles.cardCheckboxLabel} onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.5)')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}>
            <input
              type="checkbox"
              checked={form.is_pwd}
              onChange={e => set('is_pwd', e.target.checked)}
              style={{ accentColor: '#1a3a2a', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a3a2a' }}>PWD</span>
          </label>
          <label style={styles.cardCheckboxLabel} onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.5)')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}>
            <input
              type="checkbox"
              checked={form.is_senior}
              onChange={e => set('is_senior', e.target.checked)}
              style={{ accentColor: '#1a3a2a', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a3a2a' }}>Senior Citizen</span>
          </label>
          <label style={styles.cardCheckboxLabel} onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.5)')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}>
            <input
              type="checkbox"
              checked={form.with_electricity}
              onChange={e => set('with_electricity', e.target.checked)}
              style={{ accentColor: '#1a3a2a', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a3a2a' }}>Has Electricity</span>
          </label>
          <label style={styles.cardCheckboxLabel} onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.5)')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}>
            <input
              type="checkbox"
              checked={form.with_bathroom}
              onChange={e => set('with_bathroom', e.target.checked)}
              style={{ accentColor: '#1a3a2a', width: '16px', height: '16px' }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a3a2a' }}>Has Bathroom</span>
          </label>
        </div>

        {/* Password field */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <div style={styles.relativeContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              style={{ ...styles.inputField, paddingRight: '48px' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#c9a84c')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd5c8')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeIconButton}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.password && (
            <div style={{ padding: '0 4px', marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    style={{ 
                      height: '4px', 
                      flex: 1, 
                      borderRadius: '4px', 
                      transition: 'all 0.4s ease',
                      backgroundColor: i <= strength.score ? strength.color : '#e8e0d5' 
                    }} 
                  />
                ))}
              </div>
              <p style={{ fontSize: '10px', color: '#9a8f7a', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Strength: <span style={{ color: '#5a5040' }}>{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password field */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm Password</label>
          <div style={styles.relativeContainer}>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={form.confirm_password}
              onChange={e => set('confirm_password', e.target.value)}
              style={{
                ...styles.inputField,
                paddingRight: '48px',
                borderColor: form.confirm_password && form.password !== form.confirm_password ? '#f87171' : '#ddd5c8'
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={styles.eyeIconButton}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.confirm_password && form.password !== form.confirm_password && (
            <p style={{ fontSize: '10px', fontWeight: '700', color: '#f87171', marginTop: '6px', textTransform: 'uppercase', marginLeft: '4px' }}>
              Passwords do not match.
            </p>
          )}
        </div>

        {/* Privacy notice */}
        <label style={styles.privacyWrapperLabel}>
          <div style={{ display: 'flex', alignItems: 'center', height: '20px' }}>
            <input
              type="checkbox"
              checked={form.agree_terms}
              onChange={e => set('agree_terms', e.target.checked)}
              style={{ accentColor: '#1a3a2a', width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>
          <p style={styles.privacyText}>
            By registering, you agree to the collection and processing of your
            personal data in accordance with the{' '}
            <span style={{ color: '#1a3a2a', fontWeight: '700', fontStyle: 'normal' }}>Data Privacy Act of 2012</span>.
          </p>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{ ...styles.submitButton, opacity: loading ? 0.6 : 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f2419')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a3a2a')}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          <span style={styles.buttonText}>
            {loading ? 'Creating account...' : 'Create Account'}
          </span>
        </button>
      </form>

      {/* Alternative Path Switcher */}
      <div style={styles.footerWrapper}>
        <p style={styles.footerText}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={styles.footerAction}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#1a3a2a')}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}