'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import AppHeader from '../components/AppHeader'

interface ProfileStats {
  totalLogs: number
  activeDays: number
  topTrigger: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [memberSince, setMemberSince] = useState('')
  const [initial, setInitial] = useState('?')
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
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

        // Fetch firstName
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('first_name')
          .eq('user_id', user.id)
          .maybeSingle()
        setFirstName(profile?.first_name ?? '')

        // Fetch stats
        const { data: logs } = await supabase
          .from('logs')
          .select('created_at')
          .eq('user_id', user.id)
        const totalLogs = logs?.length ?? 0
        const activeDays = new Set((logs ?? []).map(l => new Date(l.created_at).toDateString())).size

        // Top trigger: completed experiment with confirmed result
        const { data: experiments } = await supabase
          .from('experiments')
          .select('name, result')
          .eq('user_id', user.id)
          .eq('status', 'completed')
        let topTrigger = '—'
        for (const exp of experiments ?? []) {
          if (exp.result && exp.result.toLowerCase().includes('confirmed')) {
            topTrigger = exp.name
            break
          }
        }

        setStats({ totalLogs, activeDays, topTrigger })
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

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid rgba(30,77,53,0.07)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s ease',
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .action-card:hover { box-shadow: 0 2px 8px rgba(30,77,53,0.08) !important; }
      `}</style>

      <AppHeader pageName="Profile" userInitial={initial} />

      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f0e8',
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          paddingTop: '104px',
          paddingBottom: '80px',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
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
              {/* ── Profile header ── */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: '#1e4d35',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 700,
                    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                    margin: '0 auto 14px',
                    boxShadow: '0 4px 16px rgba(30,77,53,0.2)',
                  }}
                >
                  {initial}
                </div>
                {firstName && (
                  <p
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      fontStyle: 'italic',
                      fontSize: '26px',
                      color: '#1e4d35',
                      margin: '0 0 4px',
                    }}
                  >
                    {firstName}
                  </p>
                )}
                <p style={{ fontSize: '12px', color: '#8a8a7e', margin: '0 0 2px' }}>{email}</p>
                <p style={{ fontSize: '11px', color: '#b0aca6', margin: 0 }}>Member since {memberSince}</p>
              </div>

              {/* ── Journey Stats ── */}
              {stats && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    padding: '20px',
                    border: '1px solid rgba(30,77,53,0.07)',
                    boxShadow: '0 2px 8px rgba(30,77,53,0.05)',
                    margin: '20px 0',
                    display: 'flex',
                  }}
                >
                  {[
                    { value: stats.totalLogs,  label: 'total logs' },
                    { value: stats.activeDays, label: 'active days' },
                    { value: stats.topTrigger, label: 'top trigger' },
                  ].map(({ value, label }, i) => (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        borderLeft: i > 0 ? '1px solid rgba(30,77,53,0.08)' : 'none',
                        paddingLeft: i > 0 ? '16px' : 0,
                        paddingRight: i < 2 ? '16px' : 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                          fontSize: '28px',
                          color: '#1e4d35',
                          display: 'block',
                          marginBottom: '4px',
                          lineHeight: 1.1,
                          wordBreak: 'break-word',
                        }}
                      >
                        {value}
                      </span>
                      <span style={{ fontSize: '10px', color: '#8a8a7e', display: 'block' }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Action cards ── */}
              <Link href="/my-info" style={{ textDecoration: 'none' }}>
                <div className="action-card" style={cardStyle}>
                  <div
                    style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      backgroundColor: 'rgba(30,77,53,0.07)', color: '#1e4d35',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', flexShrink: 0,
                    }}
                  >
                    👤
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#1a1a18', fontSize: '14px', margin: '0 0 2px', fontWeight: 400 }}>My Info</p>
                    <p style={{ color: '#8a8a7e', fontSize: '11px', margin: 0 }}>Name, age, goals, symptoms</p>
                  </div>
                  <span style={{ fontSize: '18px', color: '#d0ccc4' }}>›</span>
                </div>
              </Link>

              <div
                className="action-card"
                onClick={handleExport}
                style={{ ...cardStyle, cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1 }}
              >
                <div
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    backgroundColor: 'rgba(30,77,53,0.07)', color: '#1e4d35',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}
                >
                  📥
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#1a1a18', fontSize: '14px', margin: '0 0 2px', fontWeight: 400 }}>
                    {exporting ? 'Exporting...' : 'Export my data'}
                  </p>
                  <p style={{ color: '#8a8a7e', fontSize: '11px', margin: 0 }}>Download as CSV</p>
                </div>
                <span style={{ fontSize: '18px', color: '#d0ccc4' }}>↓</span>
              </div>

              <div
                className="action-card"
                onClick={loggingOut ? undefined : handleLogout}
                style={{ ...cardStyle, cursor: loggingOut ? 'not-allowed' : 'pointer', opacity: loggingOut ? 0.7 : 1 }}
              >
                <div
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    backgroundColor: 'rgba(192,57,43,0.07)', color: '#c0392b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}
                >
                  🚪
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#c0392b', fontSize: '14px', margin: '0 0 2px', fontWeight: 400 }}>
                    {loggingOut ? 'Signing out...' : 'Sign out'}
                  </p>
                  <p style={{ color: '#8a8a7e', fontSize: '11px', margin: 0 }}>Log out of your account</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
