'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

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

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .nav-btn { transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
        .logout-btn { transition: background-color 0.2s ease, border-color 0.2s ease; }
        .logout-btn:not(:disabled):hover { background-color: #fff0ee !important; border-color: #fdd5cc !important; }
        .export-btn { transition: background-color 0.2s ease, transform 0.15s ease; }
        .export-btn:not(:disabled):hover { background-color: #163b28 !important; }
        .export-btn:not(:disabled):active { transform: scale(0.98); }
      `}</style>

      <main
        className="min-h-screen flex flex-col items-center px-5 pt-14 pb-20"
        style={{ backgroundColor: '#f5f0e8', fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      >
        {/* ── Header ── */}
        <div className="w-full max-w-md mb-10 fade-in-up">
          <div className="flex items-start justify-between">
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '2.25rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                Profile
              </h1>
              <p
                style={{
                  color: '#7a9185',
                  fontSize: '0.75rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginTop: '5px',
                  fontWeight: 400,
                }}
              >
                Your account
              </p>
            </div>
            <Link href="/log">
              <button
                className="nav-btn"
                style={{
                  backgroundColor: 'transparent',
                  color: '#1e4d35',
                  fontSize: '0.8125rem',
                  letterSpacing: '0.04em',
                  padding: '10px 22px',
                  borderRadius: '100px',
                  border: '1px solid #c8bfb0',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e4d35'
                  e.currentTarget.style.color = '#f5f0e8'
                  e.currentTarget.style.borderColor = '#1e4d35'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#1e4d35'
                  e.currentTarget.style.borderColor = '#c8bfb0'
                }}
              >
                ← Log
              </button>
            </Link>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: '#d6cfc4', marginTop: '24px' }} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: '9px', marginTop: '72px' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#1e4d35',
                  opacity: 0.4,
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.22}s`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-md fade-in-up">
            {/* Avatar + name */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#1e4d35',
                  color: '#f5f0e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  boxShadow: '0 4px 20px rgba(30,77,53,0.18)',
                }}
              >
                {initial}
              </div>
            </div>

            {/* Info card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '26px',
                padding: '32px',
                border: '1px solid #e4ddd2',
                boxShadow: '0 6px 30px rgba(30,77,53,0.07)',
                marginBottom: '16px',
              }}
            >
              {/* Email row */}
              <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f0ebe3' }}>
                <p style={{ color: '#b8b0a4', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  Email
                </p>
                <p style={{ color: '#1e4d35', fontSize: '0.9375rem', fontWeight: 500, margin: 0 }}>
                  {email}
                </p>
              </div>

              {/* Member since row */}
              <div>
                <p style={{ color: '#b8b0a4', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  Member since
                </p>
                <p style={{ color: '#1e4d35', fontSize: '0.9375rem', fontWeight: 500, margin: 0 }}>
                  {memberSince}
                </p>
              </div>
            </div>

            {/* My Info */}
            <Link href="/my-info">
              <button
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#1e4d35',
                  borderRadius: '14px',
                  padding: '15px',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  border: '1px solid #1e4d35',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: '0.02em',
                  marginBottom: '12px',
                  display: 'block',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e4d35'
                  e.currentTarget.style.color = '#f5f0e8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#1e4d35'
                }}
              >
                My Info
              </button>
            </Link>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="export-btn"
              style={{
                width: '100%',
                backgroundColor: exporting ? '#8eb8a3' : '#1e4d35',
                color: '#f5f0e8',
                borderRadius: '14px',
                padding: '15px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                border: 'none',
                cursor: exporting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
                marginBottom: '12px',
              }}
            >
              {exporting ? 'Exporting...' : 'Export My Data ↓'}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="logout-btn"
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: '#c0392b',
                borderRadius: '14px',
                padding: '15px',
                fontSize: '0.9375rem',
                fontWeight: 500,
                border: '1px solid #fdd5cc',
                cursor: loggingOut ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
              }}
            >
              {loggingOut ? 'Logging out...' : 'Log Out'}
            </button>
          </div>
        )}
      </main>
    </>
  )
}
