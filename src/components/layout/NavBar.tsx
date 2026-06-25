'use client'

import { useState, useEffect, useRef } from 'react'
import type { MouseEvent as ReactMouseEvent, CSSProperties } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, LogOut, User, FileText, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export default function NavBar() {
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [user, setUser] = useState<Profile | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY
      const maxHeight = document.body.scrollHeight - window.innerHeight || 1
      setScrolled(scrollTop > 10)
      setScrollProgress(Math.min((scrollTop / maxHeight) * 100, 100))
    }
    updateScroll()
    window.addEventListener('scroll', updateScroll)
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const getInitialUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase
          .from('profiles').select('*').eq('id', authUser.id).single()
        setUser(data)
      } else {
        setUser(null)
      }
    }
    getInitialUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setProfileOpen(false)
        } else if (event === 'SIGNED_IN' && session.user) {
          const { data } = await supabase
            .from('profiles').select('*').eq('id', session.user.id).single()
          setUser(data)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      setProfileOpen(false)
      setUser(null)
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch {
      window.location.href = '/'
    }
  }

  const handleNavClick = (e: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault()
      const sectionId = href.replace('/#', '')
      if (pathname === '/') {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        router.push('/')
        setTimeout(() => {
          const el = document.getElementById(sectionId)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 500)
      }
      setProfileOpen(false)
    }
  }

  const dashboardHref = user?.role === 'staff' ? '/staff' : '/dashboard'

  const navLinks = [
    { label: 'Home',      href: '/#hero'        },
    { label: 'About',     href: '/#about'  },
    { label: 'Contact',   href: '/#contact'},
    ...(user ? [{ label: 'Dashboard', href: dashboardHref }] : []),
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('/#')) return false
    return pathname.startsWith(href)
  }

  return (
    <nav className={`nav-root ${scrolled ? 'nav-scrolled' : 'nav-top'}`}>
      <style>{`
        .nav-root {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-bottom: 1px solid transparent;
        }

        .nav-top {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding-top: 12px;
          padding-bottom: 12px;
        }

        .nav-scrolled {
          background: rgba(250, 248, 244, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom-color: rgba(231, 229, 228, 0.6);
          box-shadow: 0 4px 30px rgba(26, 58, 42, 0.06);
          padding-top: 4px;
          padding-bottom: 4px;
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        @media (min-width: 1024px) {
          .nav-container {
            padding: 0 32px;
          }
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: 16px;
        }

        /* Logo */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          text-decoration: none;
          transition: transform 0.3s ease;
        }

        .nav-logo:hover {
          transform: scale(1.02);
        }

        .nav-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #1a3a2a;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 2px rgba(201, 168, 76, 0.2);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .nav-logo:hover .nav-logo-icon {
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.5), 0 8px 24px rgba(26, 58, 42, 0.2);
          transform: rotate(-5deg);
        }

        .nav-logo-icon::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(201, 168, 76, 0.15), transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .nav-logo:hover .nav-logo-icon::after {
          opacity: 1;
        }

        .nav-logo-letter {
          color: #c9a84c;
          font-weight: 700;
          font-size: 1rem;
          font-family: 'Playfair Display', serif;
          font-style: italic;
          user-select: none;
          position: relative;
          z-index: 2;
        }

        .nav-logo-text {
          display: none;
          flex-direction: column;
        }

        @media (min-width: 480px) {
          .nav-logo-text {
            display: flex;
          }
        }

        .nav-logo-title {
          color: #1a3a2a;
          font-weight: 700;
          font-size: 1.125rem;
          letter-spacing: -0.02em;
          line-height: 1;
          font-family: 'Playfair Display', serif;
          transition: color 0.3s ease;
        }

        .nav-logo:hover .nav-logo-title {
          color: #0f2419;
        }

        .nav-logo-subtitle {
          color: #7a6a55;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 4px;
          font-weight: 600;
        }

        /* Nav Links - Horizontal scroll on mobile */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          flex: 1;
          justify-content: center;
          padding: 0 4px;
        }

        .nav-links::-webkit-scrollbar {
          display: none;
        }

        @media (min-width: 768px) {
          .nav-links {
            gap: 8px;
            margin-left: 32px;
          }
        }

        @media (min-width: 1024px) {
          .nav-links {
            gap: 12px;
            margin-left: 48px;
          }
        }

        @media (max-width: 767px) {
          .nav-links.nav-links-hide-mobile {
            display: none;
          }
        }

        .nav-link {
          position: relative;
          padding: 8px 14px;
          font-size: 0.8125rem;
          font-weight: 600;
          border-radius: 10px;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.3s ease;
          overflow: hidden;
          white-space: nowrap;
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .nav-link {
            padding: 10px 18px;
            font-size: 0.875rem;
            border-radius: 12px;
          }
        }

        .nav-link::before {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          width: 0;
          height: 2px;
          background: #c9a84c;
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-50%);
        }

        .nav-link:hover::before {
          width: 50%;
        }

        .nav-link-inactive {
          color: #78716c;
        }

        .nav-link-inactive:hover {
          color: #1a3a2a;
          background: rgba(250, 248, 244, 0.8);
        }

        .nav-link-active {
          color: #1a3a2a;
          background: rgba(231, 229, 228, 0.5);
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.03);
        }

        .nav-link-active::before {
          width: 35%;
        }

        /* Right Actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        /* Auth Buttons */
        .nav-auth {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (min-width: 640px) {
          .nav-auth {
            gap: 12px;
          }
        }

        .nav-btn-signin {
          padding: 8px 14px;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #57534e;
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.3s ease;
          position: relative;
          white-space: nowrap;
        }

        @media (min-width: 640px) {
          .nav-btn-signin {
            padding: 10px 20px;
            font-size: 0.875rem;
            border-radius: 12px;
          }
        }

        .nav-btn-signin::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 14px;
          right: 14px;
          height: 2px;
          background: #c9a84c;
          border-radius: 2px;
          transform: scaleX(0);
          transition: transform 0.3s ease;
          transform-origin: center;
        }

        .nav-btn-signin:hover {
          color: #1a3a2a;
        }

        .nav-btn-signin:hover::after {
          transform: scaleX(1);
        }

        .nav-btn-register {
          padding: 8px 16px;
          font-size: 0.8125rem;
          font-weight: 700;
          background: #1a3a2a;
          color: #c9a84c;
          text-decoration: none;
          border-radius: 10px;
          box-shadow: 0 4px 14px rgba(26, 58, 42, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }

        @media (min-width: 640px) {
          .nav-btn-register {
            padding: 10px 24px;
            font-size: 0.875rem;
            border-radius: 12px;
          }
        }

        .nav-btn-register::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .nav-btn-register:hover {
          background: #0f2419;
          box-shadow: 0 6px 20px rgba(26, 58, 42, 0.3);
          transform: translateY(-1px);
        }

        .nav-btn-register:hover::before {
          left: 100%;
        }

        /* Profile Dropdown */
        .nav-profile-wrap {
          position: relative;
        }

        .nav-profile-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 12px 3px 3px;
          border-radius: 999px;
          border: 1px solid #e7e5e4;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        @media (min-width: 640px) {
          .nav-profile-btn {
            gap: 12px;
            padding: 4px 16px 4px 4px;
          }
        }

        .nav-profile-btn:hover {
          border-color: #c9a84c;
          box-shadow: 0 4px 12px rgba(201, 168, 76, 0.1);
        }

        .nav-profile-btn-open {
          border-color: #c9a84c;
          box-shadow: 0 4px 12px rgba(201, 168, 76, 0.15);
        }

        .nav-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a3a2a, #2a6a4a);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .nav-avatar {
            width: 32px;
            height: 32px;
          }
        }

        .nav-avatar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(201, 168, 76, 0.25), transparent 70%);
        }

        .nav-avatar-letter {
          color: #c9a84c;
          font-size: 0.6875rem;
          font-weight: 700;
          position: relative;
          z-index: 2;
        }

        @media (min-width: 640px) {
          .nav-avatar-letter {
            font-size: 0.75rem;
          }
        }

        .nav-profile-name {
          display: none;
          font-size: 0.875rem;
          color: #1a3a2a;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        @media (min-width: 640px) {
          .nav-profile-name {
            display: block;
          }
        }

        .nav-chevron {
          color: #a8a29e;
          width: 14px;
          height: 14px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .nav-chevron-open {
          transform: rotate(180deg);
          color: #c9a84c;
        }

        /* Dropdown */
        .nav-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 12px);
          width: 220px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(231, 229, 228, 0.8);
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(26, 58, 42, 0.15);
          padding: 8px;
          z-index: 50;
          animation: navDropdownIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: top right;
        }

        @media (max-width: 480px) {
          .nav-dropdown {
            position: fixed;
            top: auto;
            bottom: 16px;
            left: 16px;
            right: 16px;
            width: auto;
            animation: navDropdownUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: bottom center;
          }
        }

        @keyframes navDropdownIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes navDropdownUp {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(16px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .nav-dropdown-header {
          padding: 16px 20px 12px;
          border-bottom: 1px solid rgba(231, 229, 228, 0.6);
          margin-bottom: 4px;
        }

        .nav-dropdown-label {
          font-size: 10px;
          font-weight: 600;
          color: #a8a29e;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 4px 0;
        }

        .nav-dropdown-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #57534e;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .nav-dropdown-item:hover {
          background: rgba(250, 248, 244, 0.8);
          color: #1a3a2a;
        }

        .nav-dropdown-item svg {
          color: #a8a29e;
          width: 16px;
          height: 16px;
          transition: color 0.2s ease;
          flex-shrink: 0;
        }

        .nav-dropdown-item:hover svg {
          color: #c9a84c;
        }

        .nav-dropdown-divider {
          height: 1px;
          background: rgba(231, 229, 228, 0.6);
          margin: 4px 8px;
        }

        .nav-dropdown-logout {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 16px;
          font-size: 0.875rem;
          font-weight: 700;
          color: #ef4444;
          background: transparent;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .nav-dropdown-logout:hover {
          background: rgba(239, 68, 68, 0.06);
        }

        .nav-dropdown-logout svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        /* Scroll progress indicator */
        .nav-scroll-progress {
          position: absolute;
          bottom: -1px;
          left: 0;
          height: 2px;
          background: linear-gradient(90deg, #c9a84c, #d9b85c);
          border-radius: 0 2px 2px 0;
          transition: width 0.1s linear;
          width: var(--scroll-progress, 0%);
        }
      `}</style>

      {/* Scroll progress bar */}
      <div 
        className="nav-scroll-progress" 
        style={{ '--scroll-progress': `${scrollProgress}%` } as CSSProperties}
      />

      <div className="nav-container">
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">
              <span className="nav-logo-letter">S</span>
            </div>
            <div className="nav-logo-text">
              <span className="nav-logo-title">SerbisyoHub</span>
              <span className="nav-logo-subtitle">E-Services Portal</span>
            </div>
          </Link>

          {/* Nav Links - Always visible, scrollable on mobile for guests */}
          <div className={`nav-links ${user ? 'nav-links-hide-mobile' : ''}`}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={e => handleNavClick(e, link.href)}
                className={`nav-link ${isActive(link.href) ? 'nav-link-active' : 'nav-link-inactive'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="nav-actions">
            {user ? (
              <div className="nav-profile-wrap" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`nav-profile-btn ${profileOpen ? 'nav-profile-btn-open' : ''}`}
                >
                  <div className="nav-avatar">
                    <span className="nav-avatar-letter">
                      {user.full_name?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <span className="nav-profile-name">
                    {user.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`nav-chevron ${profileOpen ? 'nav-chevron-open' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      <p className="nav-dropdown-label">Account</p>
                      <p className="nav-dropdown-name">{user.full_name}</p>
                    </div>
                    <Link href={dashboardHref} onClick={() => setProfileOpen(false)} className="nav-dropdown-item">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)} className="nav-dropdown-item">
                      <User size={16} /> Profile Settings
                    </Link>
                    <Link href="/dashboard/certificates" onClick={() => setProfileOpen(false)} className="nav-dropdown-item">
                      <FileText size={16} /> Certificates
                    </Link>
                    <div className="nav-dropdown-divider" />
                    <button onClick={handleLogout} className="nav-dropdown-logout">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-auth">
                <Link href="/login?tab=login" className="nav-btn-signin">Sign In</Link>
                <Link href="/login?tab=register" className="nav-btn-register">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
