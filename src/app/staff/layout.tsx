'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart2, ClipboardList, Users,
  Printer, Settings, ScrollText, ChevronRight,
  Menu, X, Sparkles, ShieldCheck
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Analytics',       href: '/staff',           icon: BarChart2 },
  { label: 'Requests',        href: '/staff/requests',  icon: ClipboardList },
  { label: 'Residents',       href: '/staff/residents', icon: Users },
  { label: 'System Settings', href: '/staff/settings',  icon: Settings },
  { label: 'Audit Logs',      href: '/staff/logs',      icon: ScrollText },
]

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  const currentPage = navItems.find(n => n.href === pathname)?.label || 'Dashboard'

  useEffect(() => {
    const loadPendingCount = async () => {
      const supabase = createClient()
      const { count, error } = await supabase
        .from('certificate_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (!error) {
        setPendingCount(count ?? 0)
      }
    }

    loadPendingCount()
  }, [])

  return (
    <div className="stl-root">
      <style>{`
        .stl-root {
          min-height: 100vh;
          background: #f7f4ef;
          padding-top: 80px;
        }

        @media (min-width: 1024px) {
          .stl-root {
            padding-top: 88px;
          }
        }

        /* Breadcrumb */
        .stl-breadcrumb {
          background: linear-gradient(135deg, #1a3a2a 0%, #143025 100%);
          color: #9a8f7a;
          font-size: 0.75rem;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .stl-breadcrumb::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .stl-breadcrumb a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease;
          position: relative;
          z-index: 2;
        }

        .stl-breadcrumb a:hover {
          color: #c9a84c;
        }

        .stl-breadcrumb-chevron {
          width: 12px;
          height: 12px;
          color: #c9a84c;
          opacity: 0.6;
          position: relative;
          z-index: 2;
        }

        .stl-breadcrumb-current {
          color: #c9a84c;
          position: relative;
          z-index: 2;
          font-weight: 600;
        }

        /* Mobile Toggle */
        .stl-mobile-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #ffffff;
          border-bottom: 1px solid #e8e0d5;
          position: sticky;
          top: 80px;
          z-index: 30;
        }

        @media (min-width: 1024px) {
          .stl-mobile-toggle {
            display: none;
          }
        }

        .stl-mobile-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
        }

        .stl-mobile-title svg {
          color: #c9a84c;
          width: 16px;
          height: 16px;
        }

        .stl-mobile-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f0ebe3;
          border: none;
          color: #1a3a2a;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .stl-mobile-btn:hover {
          background: #e8e0d5;
        }

        .stl-mobile-btn:active {
          transform: scale(0.95);
        }

        /* Container */
        .stl-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px;
        }

        @media (min-width: 640px) {
          .stl-container {
            padding: 32px;
          }
        }

        @media (min-width: 1024px) {
          .stl-container {
            padding: 32px 48px;
          }
        }

        /* Layout - Grid for proper sticky */
        .stl-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (min-width: 1024px) {
          .stl-layout {
            display: grid;
            grid-template-columns: 260px 1fr;
            gap: 32px;
            align-items: start;
          }
        }

        /* Sidebar - Sticky */
        .stl-sidebar {
          width: 100%;
          flex-shrink: 0;
          align-self: flex-start;
        }

        @media (min-width: 1024px) {
          .stl-sidebar {
            width: 260px;
          }

          .stl-sidebar-card {
            position: sticky;
            top: 100px;
          }
        }

        .stl-sidebar-card {
          background: #ffffff;
          border-radius: 1.25rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .stl-sidebar-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #0f2419 0%, #1a3a2a 100%);
          position: relative;
          overflow: hidden;
        }

        .stl-sidebar-header::after {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.08);
          filter: blur(30px);
        }

        .stl-sidebar-label {
          color: #c9a84c;
          font-size: 0.6875rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0;
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stl-sidebar-label svg {
          width: 14px;
          height: 14px;
        }

        .stl-sidebar-nav {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stl-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          color: #5a5040;
        }

        .stl-nav-link:hover {
          background: #f7f4ef;
          color: #1a3a2a;
        }

        .stl-nav-link:hover .stl-nav-icon {
          color: #c9a84c;
        }

        .stl-nav-link-active {
          background: #f0ebe3;
          color: #1a3a2a;
        }

        .stl-nav-link-active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: #c9a84c;
          border-radius: 0 4px 4px 0;
        }

        .stl-nav-link-active .stl-nav-icon {
          color: #c9a84c;
        }

        .stl-nav-icon {
          width: 18px;
          height: 18px;
          color: #9a8f7a;
          transition: color 0.2s ease;
          flex-shrink: 0;
        }

        .stl-nav-badge {
          margin-left: auto;
          font-size: 0.625rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
          background: #fee2e2;
          color: #991b1b;
        }

        .stl-nav-badge-green {
          background: #dcfce7;
          color: #166534;
        }

        /* Mobile Sidebar Overlay */
        .stl-sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 58, 42, 0.3);
          backdrop-filter: blur(4px);
          z-index: 40;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          pointer-events: none;
        }

        .stl-sidebar-overlay-open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .stl-sidebar-mobile-wrap {
          position: fixed;
          inset: 0;
          z-index: 50;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          pointer-events: none;
        }

        .stl-sidebar-mobile-wrap-open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .stl-sidebar-mobile {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          background: #ffffff;
          transform: translateX(-100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 10px 0 40px rgba(26, 58, 42, 0.1);
          overflow-y: auto;
        }

        .stl-sidebar-mobile-open,
        .stl-sidebar-mobile.open {
          transform: translateX(0);
        }

        .stl-sidebar-mobile-header {
          padding: 24px;
          background: linear-gradient(135deg, #0f2419 0%, #1a3a2a 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stl-sidebar-mobile-title {
          color: #c9a84c;
          font-size: 0.875rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stl-sidebar-mobile-title svg {
          width: 18px;
          height: 18px;
        }

        .stl-sidebar-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #c9a8f7a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .stl-sidebar-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        .stl-sidebar-mobile-nav {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* Main Content */
        .stl-main {
          min-width: 0;
          width: 100%;
        }

        /* Responsive Sidebar Visibility */
        @media (max-width: 1023px) {
          .stl-sidebar-desktop {
            display: none;
          }
        }

        @media (min-width: 1024px) {
          .stl-sidebar-mobile-wrap {
            display: none;
          }
        }

        /* Page Title Area */
        .stl-page-header {
          margin-bottom: 24px;
        }

        .stl-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 4px 0;
        }

        .stl-page-subtitle {
          font-size: 0.875rem;
          color: #9a8f7a;
          margin: 0;
        }

        @media (min-width: 640px) {
          .stl-page-title {
            font-size: 1.875rem;
          }
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="stl-breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight className="stl-breadcrumb-chevron" />
        <span className="stl-breadcrumb-current">Staff Dashboard</span>
      </div>

      {/* Mobile Toggle Bar */}
      <div className="stl-mobile-toggle">
        <div className="stl-mobile-title">
          <ShieldCheck size={16} />
          {currentPage}
        </div>
        <button 
          className="stl-mobile-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`stl-sidebar-overlay ${sidebarOpen ? 'stl-sidebar-overlay-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div className={`stl-sidebar-mobile-wrap ${sidebarOpen ? 'stl-sidebar-mobile-wrap-open' : ''}`}>
        <div className={`stl-sidebar-mobile ${sidebarOpen ? 'stl-sidebar-mobile-open' : ''}`}>
          <div className="stl-sidebar-mobile-header">
            <div className="stl-sidebar-mobile-title">
              <Sparkles size={18} />
              Staff Portal
            </div>
            <button 
              className="stl-sidebar-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
          <nav className="stl-sidebar-mobile-nav">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`stl-nav-link ${active ? 'stl-nav-link-active' : ''}`}
                >
                  <Icon className="stl-nav-icon" size={18} />
                  {label}
                  {label === 'Requests' && (
                    <span className="stl-nav-badge">{pendingCount}</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="stl-container">
        <div className="stl-layout">
          {/* Desktop Sidebar - Sticky */}
          <aside className="stl-sidebar stl-sidebar-desktop">
            <div className="stl-sidebar-card">
              <div className="stl-sidebar-header">
                <p className="stl-sidebar-label">
                  <Sparkles size={14} />
                  Staff Portal
                </p>
              </div>
              <nav className="stl-sidebar-nav">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`stl-nav-link ${active ? 'stl-nav-link-active' : ''}`}
                    >
                      <Icon className="stl-nav-icon" size={18} />
                      {label}
                      {label === 'Requests' && (
                        <span className="stl-nav-badge stl-nav-badge-green">{pendingCount}</span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="stl-main">
            
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}