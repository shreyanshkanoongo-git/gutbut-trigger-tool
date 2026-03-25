'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

type DateRange = '7' | '14' | '30' | 'all'

interface Summary {
  totalLogs: number
  daysTracked: number
  topTrigger: string
}

interface Insight {
  id: number
  category: 'food' | 'sleep' | 'stress' | 'positive'
  severity: 'high' | 'medium' | 'low'
  text: string
  count: number
  percentage: number
  recommendation: string
}

interface InsightsData {
  summary: Summary
  insights: Insight[]
  insufficient?: boolean
}

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7',   label: '7 Days' },
  { value: '14',  label: '14 Days' },
  { value: '30',  label: '30 Days' },
  { value: 'all', label: 'All Time' },
]

const CATEGORY_META: Record<
  Insight['category'],
  { label: string; icon: React.ReactNode }
> = {
  food: {
    label: 'Food Triggers',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
  },
  sleep: {
    label: 'Sleep Impact',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  stress: {
    label: 'Stress Response',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  positive: {
    label: 'Positive Patterns',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
}

const SEVERITY_STYLES: Record<
  Insight['severity'],
  { label: string; bg: string; color: string }
> = {
  high:   { label: 'HIGH',   bg: '#fff0ee', color: '#c0392b' },
  medium: { label: 'MEDIUM', bg: '#fffbec', color: '#b07d00' },
  low:    { label: 'LOW',    bg: '#edf5f0', color: '#1e4d35' },
}

// Order categories for consistent display
const CATEGORY_ORDER: Insight['category'][] = ['food', 'sleep', 'stress', 'positive']

export default function InsightsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('7')
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchInsights = useCallback(async (range: DateRange) => {
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await fetch(`/api/insights?dateRange=${range}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setData(json)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights(dateRange)
  }, [dateRange, fetchInsights])

  // Group insights by category, preserving defined order
  const grouped = data?.insights
    ? CATEGORY_ORDER.reduce<Record<string, Insight[]>>((acc, cat) => {
        const items = data.insights.filter((i) => i.category === cat)
        if (items.length) acc[cat] = items
        return acc
      }, {})
    : {}

  const totalPatterns = data?.insights?.length ?? 0

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
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }

        .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background-color: #1e4d35;
          animation: pulseDot 1.5s ease-in-out infinite;
        }

        .insight-card {
          opacity: 0;
          animation: cardIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        .range-btn {
          transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
        }

        .back-btn {
          transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
      `}</style>

      <main
        className="min-h-screen flex flex-col items-center px-5 pt-14 pb-20"
        style={{ backgroundColor: '#f5f0e8', fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      >
        {/* ── Header ── */}
        <div className="w-full max-w-md mb-8 fade-in-up">
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
                Insights
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
                Your patterns
              </p>
            </div>
            <Link href="/">
              <button
                className="back-btn"
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

        {/* ── Date Range Filter ── */}
        <div className="w-full max-w-md mb-8 fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {DATE_RANGE_OPTIONS.map(({ value, label }) => {
              const active = dateRange === value
              return (
                <button
                  key={value}
                  onClick={() => setDateRange(value)}
                  className="range-btn"
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: '100px',
                    border: active ? '1px solid #1e4d35' : '1px solid #d0c9bf',
                    backgroundColor: active ? '#1e4d35' : 'transparent',
                    color: active ? '#f5f0e8' : '#7a9185',
                    fontSize: '0.8rem',
                    fontWeight: active ? 600 : 400,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Summary Bar ── */}
        {!loading && data && !data.insufficient && data.summary && (
          <div
            className="w-full max-w-md mb-8 fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div
              style={{
                backgroundColor: '#1e4d35',
                borderRadius: '20px',
                padding: '22px 24px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '8px',
              }}
            >
              {[
                { value: data.summary.totalLogs, label: 'logs analysed' },
                { value: data.summary.daysTracked, label: 'days tracked' },
                { value: data.summary.topTrigger, label: 'top trigger' },
              ].map(({ value, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      color: '#f5f0e8',
                      fontSize: typeof value === 'number' ? '1.625rem' : '0.9rem',
                      fontWeight: 600,
                      lineHeight: 1.2,
                      marginBottom: '4px',
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      color: '#8eb8a3',
                      fontSize: '0.6875rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontWeight: 400,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '22px',
              marginTop: '64px',
            }}
          >
            <div style={{ display: 'flex', gap: '9px' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="dot"
                  style={{ animationDelay: `${i * 0.22}s` }}
                />
              ))}
            </div>
            <p style={{ color: '#9aada5', fontSize: '0.875rem', letterSpacing: '0.04em' }}>
              Analysing your data...
            </p>
          </div>
        )}

        {/* ── Insufficient Data ── */}
        {!loading && data?.insufficient && (
          <div
            className="w-full max-w-md fade-in-up"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '26px',
              padding: '44px 32px',
              border: '1px solid #e4ddd2',
              textAlign: 'center',
              boxShadow: '0 6px 30px rgba(30,77,53,0.06)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#edf5f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 22px',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e4d35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '1.3rem',
                fontWeight: 600,
                margin: '0 0 12px',
              }}
            >
              Not enough data yet
            </h3>
            <p style={{ color: '#9aada5', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
              Keep logging for a few more days.
              <br />
              Patterns need time to take shape.
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div
            className="w-full max-w-md fade-in-up"
            style={{
              backgroundColor: '#fff8f6',
              borderRadius: '22px',
              padding: '32px',
              border: '1px solid #fdd5cc',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#c0392b', fontSize: '0.9rem', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Insight Cards ── */}
        {!loading && !error && data && !data.insufficient && totalPatterns > 0 && (
          <div className="w-full max-w-md">
            <p
              style={{
                color: '#1e4d35',
                fontSize: '0.7rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              {totalPatterns} pattern{totalPatterns !== 1 ? 's' : ''} found
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {(Object.keys(grouped) as Insight['category'][]).map((cat) => {
                const meta = CATEGORY_META[cat]
                const items = grouped[cat]
                return (
                  <div key={cat}>
                    {/* Category header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        color: '#1e4d35',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#edf5f0',
                          borderRadius: '8px',
                          padding: '6px',
                          display: 'flex',
                        }}
                      >
                        {meta.icon}
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {/* Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {items.map((item, idx) => {
                        const sev = SEVERITY_STYLES[item.severity]
                        return (
                          <div
                            key={item.id}
                            className="insight-card"
                            style={{
                              animationDelay: `${idx * 0.07}s`,
                              backgroundColor: '#ffffff',
                              borderRadius: '20px',
                              padding: '22px 22px 20px',
                              border: '1px solid #e4ddd2',
                              boxShadow: '0 2px 12px rgba(30,77,53,0.04)',
                              position: 'relative',
                            }}
                          >
                            {/* Severity badge */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '18px',
                                right: '18px',
                                backgroundColor: sev.bg,
                                color: sev.color,
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                padding: '3px 9px',
                                borderRadius: '100px',
                              }}
                            >
                              {sev.label}
                            </div>

                            {/* Insight text */}
                            <p
                              style={{
                                color: '#2c3e30',
                                fontSize: '0.9375rem',
                                lineHeight: 1.68,
                                margin: '0 0 16px',
                                paddingRight: '56px',
                              }}
                            >
                              {item.text}
                            </p>

                            {/* Divider */}
                            <div style={{ height: '1px', backgroundColor: '#f0ebe3', marginBottom: '14px' }} />

                            {/* Recommendation */}
                            <p style={{ margin: 0, fontSize: '0.8375rem', lineHeight: 1.6, color: '#7a9185' }}>
                              <span style={{ fontWeight: 600, color: '#5a7a6a' }}>Recommendation: </span>
                              {item.recommendation}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
