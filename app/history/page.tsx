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

interface HistoryStats {
  total: number
  days: number
  topType: string
}

const TYPE_META: Record<Log['type'], { color: string; emoji: string; label: string }> = {
  meal:       { color: '#1e4d35', emoji: '🍽',  label: 'Meal' },
  symptom:    { color: '#c0392b', emoji: '⚡',  label: 'Symptom' },
  sleep:      { color: '#1a3a5c', emoji: '🌙',  label: 'Sleep' },
  stress:     { color: '#b7770d', emoji: '🧠',  label: 'Stress' },
  supplement: { color: '#5b3d8a', emoji: '💊',  label: 'Supplement' },
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

function SeverityDots({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: i <= value ? color : '#e8e3d9',
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
  const [stats, setStats] = useState<HistoryStats | null>(null)

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserInitial((user.email?.[0] ?? '?').toUpperCase())

        const { data, error } = await supabase
          .from('logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          setError('Could not load history. Please try again.')
        } else {
          const logs = (data as Log[]) ?? []
          setGroups(groupByDay(logs))

          // Compute stats
          const total = logs.length
          const uniqueDays = new Set(logs.map(l => new Date(l.created_at).toDateString())).size
          const typeCounts: Record<string, number> = {}
          for (const log of logs) {
            typeCounts[log.type] = (typeCounts[log.type] ?? 0) + 1
          }
          const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
          const topLabel = TYPE_META[topType as Log['type']]?.label ?? topType
          setStats({ total, days: uniqueDays, topType: topLabel })
        }
        setLoading(false)
      }
    })
  }, [])

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.25; transform: scale(0.75); }
          50%       { opacity: 1;    transform: scale(1); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background-color: #1e4d35;
          animation: pulseDot 1.5s ease-in-out infinite;
        }
        .entry-card {
          opacity: 0;
          animation: cardIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards;
        }
      `}</style>

      <AppHeader pageName="History" userInitial={userInitial} />

      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f0e8',
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          paddingTop: '104px',
          paddingBottom: '80px',
        }}
      >
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }}>

          {/* ── Stats Strip ── */}
          {stats && !loading && (
            <div
              className="fade-in-up"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '18px 20px',
                border: '1px solid rgba(30,77,53,0.07)',
                boxShadow: '0 2px 8px rgba(30,77,53,0.05)',
                marginBottom: '20px',
                display: 'flex',
              }}
            >
              {[
                { value: stats.total,   label: 'total logs' },
                { value: stats.days,    label: 'days tracked' },
                { value: stats.topType, label: 'top type' },
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
                      fontSize: '26px',
                      color: '#1e4d35',
                      display: 'block',
                      marginBottom: '3px',
                      lineHeight: 1.1,
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

          {/* ── Today's date ── */}
          {!loading && (
            <p
              className="fade-in-up"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                fontStyle: 'italic',
                fontSize: '16px',
                color: '#8a8a7e',
                margin: '0 0 16px',
              }}
            >
              {todayFormatted}
            </p>
          )}

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
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid rgba(192,57,43,0.15)',
                textAlign: 'center',
              }}
            >
              <p style={{ color: '#c0392b', fontSize: '14px', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* ── Empty State ── */}
          {!loading && !error && groups.length === 0 && (
            <div
              className="fade-in-up"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '48px', textAlign: 'center' }}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: '20px' }}>
                <circle cx="32" cy="32" r="31" stroke="rgba(30,77,53,0.12)" strokeWidth="1.5" />
                <line x1="32" y1="20" x2="32" y2="44" stroke="rgba(30,77,53,0.25)" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="32" x2="44" y2="32" stroke="rgba(30,77,53,0.25)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35', fontSize: '1.25rem', fontWeight: 600, margin: '0 0 8px',
                }}
              >
                Nothing logged yet
              </p>
              <p style={{ color: '#8a8a7e', fontSize: '13px', margin: '0 0 24px' }}>
                Start by logging a meal or symptom
              </p>
              <Link href="/log">
                <button
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1e4d35',
                    border: '1.5px solid #1e4d35',
                    borderRadius: '100px',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: 600,
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
            <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column' }}>
              {groups.map((group, gi) => (
                <div key={gi}>
                  {/* Day label */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '16px 0 8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 400,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color: '#8a8a7e',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {group.label}
                    </span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(30,77,53,0.06)' }} />
                  </div>

                  {/* Entry cards */}
                  {group.entries.map((entry, ei) => {
                    const meta = TYPE_META[entry.type]
                    return (
                      <div
                        key={entry.id}
                        className="entry-card"
                        style={{
                          animationDelay: `${(gi * 3 + ei) * 0.04}s`,
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid rgba(30,77,53,0.06)',
                          borderLeft: `3px solid ${meta.color}`,
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '7px',
                          boxShadow: '0 1px 4px rgba(30,77,53,0.04)',
                        }}
                      >
                        {/* Badge */}
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: meta.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            flexShrink: 0,
                          }}
                        >
                          {meta.emoji}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {entry.type === 'sleep' && entry.hours != null ? (
                            <span
                              style={{
                                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                                fontSize: '18px',
                                fontWeight: 700,
                                color: '#1a3a5c',
                                display: 'block',
                              }}
                            >
                              {entry.hours}h sleep
                            </span>
                          ) : (
                            entry.content ? (
                              <p
                                style={{
                                  fontSize: '14px',
                                  color: meta.color,
                                  lineHeight: 1.4,
                                  margin: 0,
                                  wordBreak: 'break-word',
                                }}
                              >
                                {entry.content}
                              </p>
                            ) : (
                              <p style={{ fontSize: '14px', color: meta.color, margin: 0 }}>
                                {meta.label}
                              </p>
                            )
                          )}
                          {(entry.type === 'symptom' || entry.type === 'stress') && entry.severity != null && (
                            <SeverityDots value={entry.severity} color={meta.color} />
                          )}
                        </div>

                        {/* Time */}
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#8a8a7e',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            marginLeft: 'auto',
                          }}
                        >
                          {formatTime(entry.created_at)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
