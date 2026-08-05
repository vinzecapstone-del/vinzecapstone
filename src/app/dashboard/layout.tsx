'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FilePlus, FileText,
  UserCircle, ChevronRight,
  Menu, X, Sparkles
} from 'lucide-react'

const navItems = [
  { label: 'Overview',        href: '/dashboard',              icon: LayoutDashboard },
  { label: 'New Request',     href: '/dashboard/request',      icon: FilePlus },
  { label: 'My Certificates', href: '/dashboard/certificates', icon: FileText },
  { label: 'My Profile',      href: '/dashboard/profile',      icon: UserCircle },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentPage = navItems.find(n => n.href === pathname)?.label || 'Dashboard'

  return (
    <div className="rdl-root">
      <style>{`
        .rdl-root {
          min-height: 100vh;
          background: #f7f4ef;
          padding-top: 80px;
        }

        @media (min-width: 1024px) {
          .rdl-root {
            padding-top: 88px;
          }
        }

        /* Breadcrumb */
        .rdl-breadcrumb {
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

        .rdl-breadcrumb::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: radial-gradient(circle at 2px 2px, #c9a84c 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .rdl-breadcrumb a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease;
          position: relative;
          z-index: 2;
        }

        .rdl-breadcrumb a:hover {
          color: #c9a84c;
        }

        .rdl-breadcrumb-chevron {
          width: 12px;
          height: 12px;
          color: #c9a84c;
          opacity: 0.6;
          position: relative;
          z-index: 2;
          flex-shrink: 0;
        }

        .rdl-breadcrumb-current {
          color: #c9a84c;
          position: relative;
          z-index: 2;
          font-weight: 600;
        }

        /* Mobile Toggle */
        .rdl-mobile-toggle {
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
          .rdl-mobile-toggle {
            display: none;
          }
        }

        .rdl-mobile-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a3a2a;
        }

        .rdl-mobile-title svg {
          color: #c9a84c;
          width: 16px;
          height: 16px;
        }

        .rdl-mobile-btn {
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

        .rdl-mobile-btn:hover {
          background: #e8e0d5;
        }

        .rdl-mobile-btn:active {
          transform: scale(0.95);
        }

        /* Container */
        .rdl-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px;
        }

        @media (min-width: 640px) {
          .rdl-container {
            padding: 32px;
          }
        }

        @media (min-width: 1024px) {
          .rdl-container {
            padding: 32px 48px;
          }
        }

        /* Layout */
        .rdl-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (min-width: 1024px) {
          .rdl-layout {
            display: grid;
            grid-template-columns: 260px 1fr;
            gap: 32px;
            align-items: start;
          }
        }

        /* Sidebar */
        .rdl-sidebar {
          width: 100%;
          flex-shrink: 0;
          align-self: flex-start;
        }

        @media (min-width: 1024px) {
          .rdl-sidebar {
            width: 260px;
          }

          .rdl-sidebar-card {
            position: sticky;
            top: 100px;
          }
        }

        .rdl-sidebar-card {
          background: #ffffff;
          border-radius: 1.25rem;
          border: 1px solid #e8e0d5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .rdl-sidebar-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #0f2419 0%, #1a3a2a 100%);
          position: relative;
          overflow: hidden;
        }

        .rdl-sidebar-header::after {
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

        .rdl-sidebar-label {
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

        .rdl-sidebar-label svg {
          width: 14px;
          height: 14px;
        }

        .rdl-sidebar-nav {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .rdl-nav-link {
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

        .rdl-nav-link:hover {
          background: #f7f4ef;
          color: #1a3a2a;
        }

        .rdl-nav-link:hover .rdl-nav-icon {
          color: #c9a84c;
        }

        .rdl-nav-link-active {
          background: #f0ebe3;
          color: #1a3a2a;
        }

        .rdl-nav-link-active::before {
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

        .rdl-nav-link-active .rdl-nav-icon {
          color: #c9a84c;
        }

        .rdl-nav-icon {
          width: 18px;
          height: 18px;
          color: #9a8f7a;
          transition: color 0.2s ease;
          flex-shrink: 0;
        }

        /* Mobile Overlay */
        .rdl-overlay {
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

        .rdl-overlay-open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        /* Mobile Sidebar */
        .rdl-mobile-wrap {
          position: fixed;
          inset: 0;
          z-index: 50;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          pointer-events: none;
        }

        .rdl-mobile-wrap-open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .rdl-mobile-panel {
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

        .rdl-mobile-panel-open {
          transform: translateX(0);
        }

        .rdl-mobile-header {
          padding: 24px;
          background: linear-gradient(135deg, #0f2419 0%, #1a3a2a 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .rdl-mobile-title {
          color: #c9a84c;
          font-size: 0.875rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rdl-mobile-title svg {
          width: 18px;
          height: 18px;
        }

        .rdl-mobile-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #c9a84c;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rdl-mobile-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }

        .rdl-mobile-nav {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* Main */
        .rdl-main {
          min-width: 0;
          width: 100%;
        }

        /* Page Header */
        .rdl-page-header {
          margin-bottom: 24px;
        }

        .rdl-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a3a2a;
          margin: 0 0 4px 0;
        }

        .rdl-page-subtitle {
          font-size: 0.875rem;
          color: #9a8f7a;
          margin: 0;
        }

        @media (min-width: 640px) {
          .rdl-page-title {
            font-size: 1.875rem;
          }
        }

        /* Responsive visibility */
        @media (max-width: 1023px) {
          .rdl-sidebar-desktop {
            display: none;
          }
        }

        @media (min-width: 1024px) {
          .rdl-mobile-wrap {
            display: none;
          }
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="rdl-breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight className="rdl-breadcrumb-chevron" />
        <span className="rdl-breadcrumb-current">Resident Dashboard</span>
      </div>

      {/* Mobile Toggle */}
      <div className="rdl-mobile-toggle">
        <div className="rdl-mobile-title">
          <Sparkles size={16} />
          {currentPage}
        </div>
        <button
          className="rdl-mobile-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`rdl-overlay ${sidebarOpen ? 'rdl-overlay-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div className={`rdl-mobile-wrap ${sidebarOpen ? 'rdl-mobile-wrap-open' : ''}`}>
        <div className={`rdl-mobile-panel ${sidebarOpen ? 'rdl-mobile-panel-open' : ''}`}>
          <div className="rdl-mobile-header">
            <div className="rdl-mobile-title">
              <Sparkles size={18} />
              Resident Portal
            </div>
            <button
              className="rdl-mobile-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
          <nav className="rdl-mobile-nav">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`rdl-nav-link ${active ? 'rdl-nav-link-active' : ''}`}
                >
                  <Icon className="rdl-nav-icon" size={18} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="rdl-container">
        <div className="rdl-layout">
          {/* Desktop Sidebar */}
          <aside className="rdl-sidebar rdl-sidebar-desktop">
            <div className="rdl-sidebar-card">
              <div className="rdl-sidebar-header">
                <p className="rdl-sidebar-label">
                  <Sparkles size={14} />
                  Resident Portal
                </p>
              </div>
              <nav className="rdl-sidebar-nav">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`rdl-nav-link ${active ? 'rdl-nav-link-active' : ''}`}
                    >
                      <Icon className="rdl-nav-icon" size={18} />
                      {label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="rdl-main">
             
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
