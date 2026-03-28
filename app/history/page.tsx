'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import AppHeader from '../components/AppHeader'

interface Log {
  id: string
  type: 'meal' | 'symptom' | 'sleep' | 'stress' | 'supplement'
  content: string
  severity: number | null
  hours: number | null
  created_at: string
}

interface DayGroup {
  label: string
  entries: Log[]
}

const PILL_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="9" width="18" height="6" rx="3" />
    <line x1="12" y1="9" x2="12" y2="15" />
  </svg>
)

const TYPE_META: Record<
  Log['type'],
  { bg: string; iconColor: string; icon: React.ReactNode }
> = {
  meal: {
    bg: '#e8f5ee',
    iconColor: '#1e6641',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
  },
  symptom: {
    bg: '#fdecea',
    iconColor: '#c0392b',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  sleep: {
    bg: '#e8f0fb',
    iconColor: '#2c5ea8',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  stress: {
    bg: '#fef9e7',
    iconColor: '#b07d00',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 15s1.5-2 4-2 4 2 4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  supplement: {
    bg: '#f0ebfa',
    iconColor: '#6b4f9e',
    icon: PILL_ICON,
  },
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (sameDay(d, today)) return 'Today'
  if (sameDay(d, yesterday)) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function groupByDay(logs: Log[]): DayGroup[] {
  const map = new Map<string, Log[]>()
  for (const log of logs) {
    const d = new Date(log.created_at)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(log)
  }
  return Array.from(map.entries()).map(([, entries]) => ({
    label: dayLabel(entries[0].created_at),
    entries,
  }))
}

function SeverityDots({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: i <= value ? '#1e4d35' : '#d6cfc4',
          }}
        />
      ))}
    </div>
  )
}

export default function HistoryPage() {
  const [groups, setGroups] = useState<DayGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userInitial, setUserInitial] = useState('?')

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserInitial((user.email?.[0] ?? '?').toUpperCase())
    })
  }, [])

  useEffect(() => {
    supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError('Could not load history. Please try again.')
        } else {
          setGroups(groupByDay((data as Log[]) ?? []))
        }
        setLoading(false)
      })
  }, [])

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.25; transform: scale(0.75); }
          50%       { opacity: 1;    transform: scale(1); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background-color: #1e4d35;
          animation: pulseDot 1.5s ease-in-out infinite;
        }
        .entry-card {
          opacity: 0;
          animation: cardIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
        }
      `}</style>

      <AppHeader pageName="History" userInitial={userInitial} />

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

          {/* ── Today's date ── */}
          <p
            className="fade-in-up"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontStyle: 'italic',
              fontSize: '18px',
              color: '#8a8a7e',
              margin: '0 0 28px',
            }}
          >
            {todayFormatted}
          </p>

          {/* ── Loading ── */}
          {loading && (
            <div style={{ display: 'flex', gap: '9px', marginTop: '72px', justifyContent: 'center' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="dot" style={{ animationDelay: `${i * 0.22}s` }} />
              ))}
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div
              className="fade-in-up"
              style={{
                backgroundColor: '#fff8f6',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #fdd5cc',
                textAlign: 'center',
              }}
            >
              <p style={{ color: '#c0392b', fontSize: '0.9rem', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* ── Empty State ── */}
          {!loading && !error && groups.length === 0 && (
            <div
              className="fade-in-up"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '60px',
                textAlign: 'center',
              }}
            >
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ marginBottom: '24px' }}>
                <circle cx="36" cy="36" r="35" stroke="rgba(30,77,53,0.15)" strokeWidth="1.5" />
                <line x1="36" y1="22" x2="36" y2="50" stroke="rgba(30,77,53,0.3)" strokeWidth="2" strokeLinecap="round" />
                <line x1="22" y1="36" x2="50" y2="36" stroke="rgba(30,77,53,0.3)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  margin: '0 0 10px',
                }}
              >
                Nothing logged yet
              </h3>
              <p style={{ color: '#8a8a7e', fontSize: '0.875rem', lineHeight: 1.7, margin: '0 0 28px' }}>
                Start by logging a meal or symptom
              </p>
              <Link href="/log">
                <button
                  style={{
                    backgroundColor: '#1e4d35',
                    color: '#f5f0e8',
                    borderRadius: '100px',
                    padding: '12px 28px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Log Something
                </button>
              </Link>
            </div>
          )}

          {/* ── Day Groups ── */}
          {!loading && !error && groups.length > 0 && (
            <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {groups.map((group, gi) => (
                <div key={gi}>
                  {/* Day label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span
                      style={{
                        color: '#8a8a7e',
                        fontSize: '11px',
                        fontWeight: 500,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        fontVariant: 'small-caps',
                      }}
                    >
                      {group.label}
                    </span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(30,77,53,0.1)' }} />
                  </div>

                  {/* Entry cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {group.entries.map((entry, ei) => {
                      const meta = TYPE_META[entry.type]
                      return (
                        <div
                          key={entry.id}
                          className="entry-card"
                          style={{
                            animationDelay: `${(gi * 3 + ei) * 0.05}s`,
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            border: '1px solid rgba(30,77,53,0.1)',
                            boxShadow: '0 2px 12px rgba(30,77,53,0.06)',
                            display: 'flex',
                            gap: '14px',
                            alignItems: 'flex-start',
                          }}
                        >
                          {/* Icon badge */}
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: meta.bg,
                              color: meta.iconColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {meta.icon}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {entry.content ? (
                              <p
                                style={{
                                  color: '#2c3e30',
                                  fontSize: '0.9rem',
                                  lineHeight: 1.55,
                                  margin: '0 0 6px',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {entry.content}
                              </p>
                            ) : null}

                            {entry.type === 'sleep' && entry.hours != null && (
                              <p
                                style={{
                                  color: '#2c5ea8',
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  margin: entry.content ? '0 0 6px' : '2px 0 6px',
                                }}
                              >
                                {entry.hours} hours
                              </p>
                            )}

                            {(entry.type === 'symptom' || entry.type === 'stress') && entry.severity != null && (
                              <div style={{ marginBottom: '2px' }}>
                                <SeverityDots value={entry.severity} />
                              </div>
                            )}
                          </div>

                          {/* Time */}
                          <span
                            style={{
                              color: '#b8b0a4',
                              fontSize: '0.7rem',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                              marginTop: '3px',
                            }}
                          >
                            {formatTime(entry.created_at)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
