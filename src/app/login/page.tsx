'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'

function LoginPageInner() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTab(searchParams.get('tab') === 'register' ? 'register' : 'login')
  }, [searchParams])

  const handleTabSwitch = (newTab: 'login' | 'register') => {
    if (newTab === tab) return
    setIsTransitioning(true)
    setTimeout(() => {
      setTab(newTab)
      setIsTransitioning(false)
    }, 180)
  }

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f2ed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2.5px solid #c9a84c',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#f5f2ed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '96px 20px 64px'
    }} suppressHydrationWarning>
      {/* Top accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: '#c9a84c'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        animation: 'fadeUp 0.4s ease-out'
      }}>
        {/* Logo & Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#1a3a2a',
            boxShadow: '0 10px 25px -5px rgba(26, 58, 42, 0.3)',
            marginBottom: '20px'
          }}>
            <span style={{
              color: '#c9a84c',
              fontWeight: 700,
              fontSize: '24px',
              letterSpacing: '-0.02em',
              fontFamily: "'Playfair Display', serif"
            }}>
              B
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 5vw, 2rem)',
            fontWeight: 700,
            color: '#1a3a2a',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            fontFamily: "'Playfair Display', serif",
            margin: 0
          }}>
            SerbisyoHub
          </h1>
          <p style={{
            color: '#8a7e6a',
            fontSize: '14px',
            marginTop: '8px',
            fontWeight: 500,
            letterSpacing: '0.05em'
          }}>
            Barangay E-Services Portal
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          backgroundColor: '#eae5dc',
          borderRadius: '16px',
          padding: '6px',
          marginBottom: '32px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', position: 'relative' }}>
            <button
              onClick={() => handleTabSwitch('login')}
              style={{
                flex: 1,
                position: 'relative',
                zIndex: 10,
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                letterSpacing: '0.02em',
                fontFamily: "'DM Sans', sans-serif",
                color: tab === 'login' ? '#1a3a2a' : '#8a7e6a'
              }}
            >
              {tab === 'login' && (
                <span style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: '1px solid #e0d8cc',
                  transition: 'all 0.3s ease'
                }} />
              )}
              <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={14} style={{ color: tab === 'login' ? '#c9a84c' : 'rgba(138, 126, 106, 0.4)' }} />
                Sign In
              </span>
            </button>
            <button
              onClick={() => handleTabSwitch('register')}
              style={{
                flex: 1,
                position: 'relative',
                zIndex: 10,
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '12px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                letterSpacing: '0.02em',
                fontFamily: "'DM Sans', sans-serif",
                color: tab === 'register' ? '#1a3a2a' : '#8a7e6a'
              }}
            >
              {tab === 'register' && (
                <span style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: '1px solid #e0d8cc',
                  transition: 'all 0.3s ease'
                }} />
              )}
              <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={14} style={{ color: tab === 'register' ? '#c9a84c' : 'rgba(138, 126, 106, 0.4)' }} />
                Register
              </span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e8e0d5',
          boxShadow: '0 2px 16px -4px rgba(26, 58, 42, 0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '32px 24px',
            transition: 'all 0.18s ease',
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'translateY(4px)' : 'translateY(0)'
          }}>
            {tab === 'login' ? (
              <LoginForm onSwitchToRegister={() => handleTabSwitch('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => handleTabSwitch('login')} />
            )}
          </div>
        </div>

        {/* Verify Link */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link
            href="/verify"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#8a7e6a',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1a3a2a')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8a7e6a')}
          >
            <ShieldCheck size={14} style={{ color: '#c9a84c' }} />
            Verify a certificate
            <ArrowRight size={12} style={{ color: '#c9a84c' }} />
          </Link>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: '11px',
          color: '#b5a898',
          marginTop: '48px',
          letterSpacing: '0.05em',
          fontWeight: 500
        }}>
          Official Barangay Digital Services Platform
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#f5f2ed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2.5px solid #c9a84c',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  )
}
