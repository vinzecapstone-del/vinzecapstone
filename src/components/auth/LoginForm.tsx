'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Loader2, 
  ArrowLeft, 
  UserCircle, 
  Send, 
  Sparkles 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  onSwitchToRegister: () => void
}

export default function LoginForm({ onSwitchToRegister }: Props) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier || !password) {
      toast.error('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      let email = identifier

      if (!identifier.includes('@')) {
        const { data: resProfile, error: resError } = await supabase
          .from('profiles')
          .select('email')
          .eq('resident_id', identifier)
          .single()

        if (resError || !resProfile?.email) {
          toast.error('Resident ID not found. Please check and try again.')
          setLoading(false)
          return
        }
        email = resProfile.email
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError || !authData.user) {
        toast.error('Invalid credentials. Please try again.')
        return
      }

      await new Promise(r => setTimeout(r, 400))

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        await new Promise(r => setTimeout(r, 600))
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', authData.user.id)
          .single()

        if (!retryProfile) {
          toast.error('Could not load your profile. Please try again.')
          return
        }

        toast.success(`Welcome back, ${retryProfile.full_name?.split(' ')[0]}!`)
        const dest = retryProfile.role === 'staff' ? '/staff' : '/dashboard'
        router.push(dest)
        router.refresh()
        return
      }

      toast.success(`Welcome back, ${profile.full_name?.split(' ')[0]}!`)
      const destination = profile.role === 'staff' ? '/staff' : '/dashboard'
      router.push(destination)
      router.refresh()

    } catch (err) {
      console.error('Login error:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) {
      toast.error('Please enter your email address.')
      return
    }
    setForgotLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setForgotLoading(false)
    if (error) {
      toast.error('Failed to send reset email.')
    } else {
      toast.success('Check your inbox for the reset link!')
      setForgotMode(false)
    }
  }

  // Styles object written in standard CSS coordinates mapping to JavaScript
  const styles = {
    container: {
      width: '100%',
    },
    label: {
      display: 'block',
      fontSize: '11px',
      fontWeight: '700',
      color: 'rgba(26, 58, 66, 0.8)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      marginBottom: '8px', // More breathing room between text label and input box
    },
    inputWrapper: {
      position: 'relative' as const,
      marginBottom: '24px', // Creates clear separation between fields
    },
    inputIcon: {
      position: 'absolute' as const,
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#c9a84c',
      pointerEvents: 'none' as const,
    },
    inputField: {
      width: '100%',
      paddingLeft: '44px',
      paddingRight: '16px',
      paddingTop: '14px',
      paddingBottom: '14px',
      borderRadius: '12px',
      border: '1px solid #ede7df',
      backgroundColor: '#faf9f6',
      fontSize: '14px',
      color: '#1a3a2a',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    textParagraph: {
      color: '#7a6a55',
      fontSize: '13px',
      fontWeight: '500',
      lineHeight: '1.75', // Wide padding between multi-line textual rules
      marginBottom: '24px',
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
      color: '#8a7e6a',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      marginBottom: '20px',
      padding: '0',
    },
    submitButton: {
      width: '100%',
      paddingTop: '14px',
      paddingBottom: '14px',
      backgroundColor: '#1a3a2a',
      color: '#ffffff',
      fontWeight: '600',
      borderRadius: '12px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(26,58,42,0.05)',
      marginTop: '12px',
    },
    buttonText: {
      textTransform: 'uppercase' as const,
      letterSpacing: '0.12em',
      fontSize: '11px',
    },
    footerWrapper: {
      marginTop: '28px',
      paddingTop: '20px',
      borderTop: '1px dashed #ede7df',
      textAlign: 'center' as const,
    },
    footerText: {
      fontSize: '13px',
      color: '#8a7e6a',
      fontWeight: '500',
      lineHeight: '1.6',
    },
    footerAction: {
      background: 'none',
      border: 'none',
      color: '#1a3a2a',
      fontWeight: '700',
      cursor: 'pointer',
      textDecoration: 'underline',
      textUnderlineOffset: '5px',
      padding: '0',
      marginLeft: '4px',
    }
  }

  // ── Forgot Password View ──────────────────────────────────────────────────
  if (forgotMode) {
    return (
      <div style={styles.container}>
        <button
          type="button"
          onClick={() => setForgotMode(false)}
          style={styles.backButton}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1a3a2a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8a7e6a')}
        >
          <ArrowLeft size={13} />
          Back to Login
        </button>

        <p style={styles.textParagraph}>
          Enter your email address below. We will generate and send a temporary secure network link to restore complete administrative control over your credentials.
        </p>

        <form onSubmit={handleForgotPassword}>
          <div>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <div style={styles.inputIcon}>
                <Mail size={15} />
              </div>
              <input
                type="email"
                placeholder="yourname@email.com"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                style={styles.inputField}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#c9a84c'
                  e.currentTarget.style.backgroundColor = '#ffffff'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#ede7df'
                  e.currentTarget.style.backgroundColor = '#faf9f6'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={forgotLoading}
            style={{ ...styles.submitButton, opacity: forgotLoading ? 0.6 : 1 }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#11271c')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a3a2a')}
          >
            {forgotLoading ? (
              <Loader2 size={15} className="animate-spin" style={{ color: '#c9a84c' }} />
            ) : (
              <Send size={14} style={{ color: '#c9a84c' }} />
            )}
            <span style={styles.buttonText}>
              {forgotLoading ? 'Sending link...' : 'Send Reset Link'}
            </span>
          </button>
        </form>
      </div>
    )
  }

  // ── Login View ────────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin}>
        {/* Email / Resident ID */}
        <div>
          <label style={styles.label}>Email or Resident ID</label>
          <div style={styles.inputWrapper}>
            <div style={styles.inputIcon}>
              <UserCircle size={15} />
            </div>
            <input
              type="text"
              placeholder="name@email.com or RES-XXXXX"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              autoComplete="username"
              style={styles.inputField}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#c9a84c'
                e.currentTarget.style.backgroundColor = '#ffffff'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ede7df'
                e.currentTarget.style.backgroundColor = '#faf9f6'
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <label style={{ ...styles.label, flexGrow: 1 }}>Password</label>
            <button
              type="button"
              onClick={() => setForgotMode(true)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '10px',
                color: '#c9a84c',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                marginBottom: '8px',
                padding: '0'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#1a3a2a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#c9a84c')}
            >
              Forgot?
            </button>
          </div>
          <div style={styles.inputWrapper}>
            <div style={styles.inputIcon}>
              <Lock size={15} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ ...styles.inputField, paddingRight: '44px' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#c9a84c'
                e.currentTarget.style.backgroundColor = '#ffffff'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ede7df'
                e.currentTarget.style.backgroundColor = '#faf9f6'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#b5a898',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#1a3a2a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#b5a898')}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={loading}
          style={{ ...styles.submitButton, opacity: loading ? 0.6 : 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#11271c')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a3a2a')}
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" style={{ color: '#c9a84c' }} />
          ) : (
            <Sparkles size={14} style={{ color: '#c9a84c' }} />
          )}
          <span style={styles.buttonText}>
            {loading ? 'Authenticating...' : 'Sign In to Account'}
          </span>
        </button>
      </form>

      {/* Alternative Path Switcher */}
      <div style={styles.footerWrapper}>
        <p style={styles.footerText}>
          Don't have an account yet?
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={styles.footerAction}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a84c')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#1a3a2a')}
          >
            Create Profile
          </button>
        </p>
      </div>
    </div>
  )
}