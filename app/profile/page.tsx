'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import AppHeader from '../components/AppHeader'

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [memberSince, setMemberSince] = useState('')
  const [initial, setInitial] = useState('?')
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        setEmail(user.email ?? '')
        setInitial((user.email?.[0] ?? '?').toUpperCase())
        setMemberSince(
          new Date(user.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        )
      }
      setLoading(false)
    })
  }, [])

  async function handleExport() {
    if (!userId) return
    setExporting(true)
    const { data, error } = await supabase
      .from('logs')
      .select('created_at, type, content, severity, hours')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) { setExporting(false); return }

    const header = 'date,type,content,severity,hours'
    const escape = (val: unknown) => {
      if (val == null) return ''
      const str = String(val)
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }
    const rows = data.map((row) =>
      [
        new Date(row.created_at).toISOString().split('T')[0],
        escape(row.type),
        escape(row.content),
        escape(row.severity),
        escape(row.hours),
      ].join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gutbut-export.csv'
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  async function handleLogout() {
    setLoggingOut(true)
    await supabase.auth.signOut()
    document.cookie = 'sb-gutbut-session=; path=/; max-age=0; SameSite=Lax'
    router.push('/login')
  }

  const CARD_STYLE = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid rgba(30,77,53,0.1)',
    boxShadow: '0 2px 12px rgba(30,77,53,0.06)',
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .action-card { transition: background-color 0.15s ease, box-shadow 0.15s ease; }
        .action-card:hover { background-color: #f9f7f3 !important; }
        .danger-card:hover { background-color: #fff8f6 !important; }
        .export-btn { transition: background-color 0.2s ease, transform 0.15s ease; }
        .export-btn:not(:disabled):hover { background-color: #163b28 !important; }
        .export-btn:not(:disabled):active { transform: scale(0.98); }
      `}</style>

      <AppHeader pageName="Profile" userInitial={initial} />

      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f0e8',
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          paddingTop: '116px',
          paddingBottom: '80px',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        <div style={{ maxWidth: '448px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', gap: '9px', marginTop: '72px', justifyContent: 'center' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: '#1e4d35', opacity: 0.4,
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.22}s`,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="fade-in-up">
              {/* ── Avatar ── */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#1e4d35',
                    color: '#f5f0e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.625rem',
                    fontWeight: 600,
                    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                    boxShadow: '0 4px 20px rgba(30,77,53,0.2)',
                    marginBottom: '16px',
                  }}
                >
                  {initial}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                    color: '#1e4d35',
                    fontSize: '20px',
                    fontWeight: 600,
                    margin: '0 0 4px',
                    textAlign: 'center',
                  }}
                >
                  {email}
                </p>
                <p style={{ color: '#8a8a7e', fontSize: '13px', margin: 0, textAlign: 'center' }}>
                  Member since {memberSince}
                </p>
              </div>

              {/* ── Action cards ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                {/* My Health Info */}
                <Link href="/my-info" style={{ textDecoration: 'none' }}>
                  <div
                    className="action-card"
                    style={{
                      ...CARD_STYLE,
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px', height: '40px', borderRadius: '10px',
                          backgroundColor: '#e8f5ee', color: '#1e4d35',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ color: '#1e4d35', fontSize: '0.9375rem', fontWeight: 500, margin: '0 0 2px' }}>My Health Info</p>
                        <p style={{ color: '#8a8a7e', fontSize: '0.75rem', margin: 0 }}>Name, age, diet, goals</p>
                      </div>
                    </div>
                    <span style={{ color: '#8a8a7e', fontSize: '1rem' }}>→</span>
                  </div>
                </Link>

                {/* Export my data */}
                <div
                  className="action-card export-btn"
                  onClick={handleExport}
                  style={{
                    ...CARD_STYLE,
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: exporting ? 'not-allowed' : 'pointer',
                    opacity: exporting ? 0.7 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        backgroundColor: '#e8f0fb', color: '#2c5ea8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                    <div>
                      <p style={{ color: '#1e4d35', fontSize: '0.9375rem', fontWeight: 500, margin: '0 0 2px' }}>
                        {exporting ? 'Exporting...' : 'Export My Data'}
                      </p>
                      <p style={{ color: '#8a8a7e', fontSize: '0.75rem', margin: 0 }}>Download as CSV</p>
                    </div>
                  </div>
                  <span style={{ color: '#8a8a7e', fontSize: '1rem' }}>↓</span>
                </div>

                {/* Sign out */}
                <div
                  className="action-card danger-card"
                  onClick={loggingOut ? undefined : handleLogout}
                  style={{
                    ...CARD_STYLE,
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: loggingOut ? 'not-allowed' : 'pointer',
                    opacity: loggingOut ? 0.7 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        backgroundColor: '#fff0ee', color: '#c0392b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </div>
                    <p style={{ color: '#c0392b', fontSize: '0.9375rem', fontWeight: 500, margin: 0 }}>
                      {loggingOut ? 'Signing out...' : 'Sign Out'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
