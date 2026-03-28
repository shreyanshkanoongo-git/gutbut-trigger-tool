'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_TABS = [
  { label: 'Log',         href: '/log' },
  { label: 'History',     href: '/history' },
  { label: 'Experiments', href: '/experiments' },
  { label: 'Insights',    href: '/insights' },
  { label: 'My Info',     href: '/my-info' },
]

interface AppHeaderProps {
  pageName: string
  userInitial: string
}

export default function AppHeader({ pageName, userInitial }: AppHeaderProps) {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        .app-nav-bar::-webkit-scrollbar { display: none; }
        .app-nav-tab { transition: color 0.15s ease; }
        .app-nav-tab:hover { color: #1e4d35 !important; }
        .app-avatar { transition: opacity 0.15s ease; }
        .app-avatar:hover { opacity: 0.85; }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 50,
          backgroundColor: '#f5f0e8',
        }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: '1px solid rgba(30,77,53,0.1)',
            position: 'relative',
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: '20px',
              color: '#1e4d35',
              fontWeight: 700,
              letterSpacing: '-0.01em',
            }}
          >
            GutBut
          </span>
          <span
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#5a5a52',
              whiteSpace: 'nowrap',
            }}
          >
            {pageName}
          </span>
          <Link href="/profile">
            <div
              className="app-avatar"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#1e4d35',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(30,77,53,0.2)',
              }}
            >
              {userInitial}
            </div>
          </Link>
        </div>

        {/* ── Nav bar ── */}
        <div
          className="app-nav-bar"
          style={{
            padding: '8px 16px',
            borderBottom: '1px solid rgba(30,77,53,0.1)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '4px',
              justifyContent: 'center',
              minWidth: 'max-content',
              margin: '0 auto',
            }}
          >
            {NAV_TABS.map(({ label, href }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <span
                    className="app-nav-tab"
                    style={{
                      display: 'inline-block',
                      padding: '7px 14px',
                      borderRadius: '100px',
                      fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                      fontSize: '0.75rem',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                      backgroundColor: active ? '#1e4d35' : 'transparent',
                      color: active ? '#ffffff' : '#8a8a7e',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
