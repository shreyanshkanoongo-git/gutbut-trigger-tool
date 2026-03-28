'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import AppHeader from '../components/AppHeader'

type DateRange = '7' | '14' | '30' | 'all'
type CacheStatus = 'checking' | 'none' | 'fresh' | 'stale'

interface Summary {
  totalLogs: number
  daysTracked: number
  topTrigger: string
}

interface Insight {
  id: number
  category: 'food' | 'sleep' | 'stress' | 'positive' | 'supplement'
  severity: 'high' | 'medium' | 'low'
  text: string
  count: number
  percentage: number
  recommendation: string
}

interface InsightsData {
  weeklySummary?: string
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
  supplement: {
    label: 'Supplement Patterns',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="9" width="18" height="6" rx="3" />
        <line x1="12" y1="9" x2="12" y2="15" />
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

const CATEGORY_ORDER: Insight['category'][] = ['food', 'sleep', 'stress', 'supplement', 'positive']

function hoursAgoText(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60))
  if (hours === 0) return 'less than an hour ago'
  return `${hours} hour${hours !== 1 ? 's' : ''} ago`
}

export default function InsightsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30')
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>('checking')
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [userInitial, setUserInitial] = useState('?')
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<Record<string, unknown> | null>(null)

  // ── Auth + profile ──────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserInitial((user.email?.[0] ?? '?').toUpperCase())
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('first_name, age, gender, diet_type, wellness_goals, current_symptoms')
          .eq('user_id', user.id)
          .single()
        setUserProfile(profile ?? null)
      }
    })
  }, [])

  // ── Cache check ─────────────────────────────────────────────────
  const checkCache = useCallback(async (range: DateRange, uid: string) => {
    setCacheStatus('checking')
    setData(null)
    setError('')
    try {
      const res = await fetch(`/api/insight-cache?userId=${uid}&dateRange=${range}`)
      const json = await res.json()
      if (!json.cached) {
        setCacheStatus('none')
        return
      }
      const hours = (Date.now() - new Date(json.generated_at).getTime()) / (1000 * 60 * 60)
      setData(json.result)
      setGeneratedAt(json.generated_at)
      setCacheStatus(hours < 6 ? 'fresh' : 'stale')
    } catch {
      setCacheStatus('none')
    }
  }, [])

  useEffect(() => {
    if (userId) checkCache(dateRange, userId)
  }, [dateRange, userId, checkCache])

  // ── Run AI analysis ─────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateRange, userId, userProfile }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      // Write to cache
      await fetch('/api/insight-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, dateRange, result: json }),
      })

      const now = new Date().toISOString()
      setData(json)
      setGeneratedAt(now)
      setCacheStatus('fresh')
    } catch (err) {
      console.error('[Insights] runAnalysis error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [userId, dateRange, userProfile])

  // ── Derived display state ────────────────────────────────────────
  const showSpinner    = cacheStatus === 'checking' || loading
  const showResults    = !showSpinner && !!data && !data.insufficient && (cacheStatus === 'fresh' || cacheStatus === 'stale')
  const showReadyCard  = !showSpinner && cacheStatus === 'none'
  const showStatusBar  = !showSpinner && cacheStatus === 'fresh' && !!generatedAt
  const showStaleBar   = !showSpinner && cacheStatus === 'stale' && !!generatedAt
  const showInsufficient = !showSpinner && !!data?.insufficient

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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }

        .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background-color: #1e4d35;
          animation: pulseDot 1.5s ease-in-out infinite;
        }

        .loading-spinner {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 2.5px solid rgba(30,77,53,0.15);
          border-top-color: #1e4d35;
          animation: spin 0.8s linear infinite;
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

        .analyse-btn {
          transition: background-color 0.18s ease, transform 0.15s ease;
        }
        .analyse-btn:hover {
          background-color: #163b28 !important;
          transform: translateY(-2px);
        }
        .analyse-btn:active { transform: translateY(0); }

        .fresh-link {
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          color: #5a9e7a;
          font-size: 0.8125rem;
          font-weight: 500;
          padding: 0;
          transition: color 0.15s ease;
        }
        .fresh-link:hover { color: #1e4d35; }

        .stale-btn {
          transition: background-color 0.15s ease;
        }
        .stale-btn:hover { background-color: #fef0a0 !important; }

        @media (max-width: 640px) {
          .summary-bar { grid-template-columns: 1fr 1fr !important; }
          .summary-bar-top-trigger { grid-column: span 2; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 16px; margin-top: 4px; }
          .stale-bar { flex-direction: column !important; gap: 8px !important; align-items: flex-start !important; }
        }
      `}</style>

      <AppHeader pageName="Insights" userInitial={userInitial} />

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#f5f0e8',
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          paddingTop: '116px',
          paddingBottom: '80px',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >

        {/* ── Weekly Summary Card (shown when results are available) ── */}
        {showResults && data?.weeklySummary && (
          <div className="w-full max-w-md mb-8 fade-in-up" style={{ animationDelay: '0.05s' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e4ddd2',
                borderLeft: '4px solid #1e4d35',
                padding: '22px 24px',
                boxShadow: '0 2px 12px rgba(30,77,53,0.05)',
              }}
            >
              <p
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#7a9185',
                  margin: '0 0 8px',
                }}
              >
                Weekly Summary
              </p>
              <h3
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  margin: '0 0 12px',
                  lineHeight: 1.3,
                }}
              >
                Your Week in Review
              </h3>
              <p style={{ color: '#4a5568', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                🌿 {data.weeklySummary}
              </p>
            </div>
          </div>
        )}

        {/* ── Status bar: Case B — fresh cache ── */}
        {showStatusBar && (
          <div className="w-full max-w-md mb-3 fade-in-up">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 4px',
              }}
            >
              <span style={{ color: '#5a9e7a', fontSize: '0.8125rem', fontWeight: 400 }}>
                ✓ Analysed {hoursAgoText(generatedAt!)}
              </span>
              <button className="fresh-link" onClick={runAnalysis}>
                Run fresh analysis →
              </button>
            </div>
          </div>
        )}

        {/* ── Notice bar: Case C — stale cache ── */}
        {showStaleBar && (
          <div className="w-full max-w-md mb-3 fade-in-up">
            <div
              className="stale-bar"
              style={{
                backgroundColor: '#fffbec',
                border: '1px solid #f0d060',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ color: '#b07d00', fontSize: '0.8125rem', lineHeight: 1.4 }}>
                This analysis is over 6 hours old. Your data may have changed.
              </span>
              <button
                className="stale-btn"
                onClick={runAnalysis}
                style={{
                  backgroundColor: '#fef3c7',
                  color: '#b07d00',
                  border: '1px solid #f0d060',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Run fresh analysis
              </button>
            </div>
          </div>
        )}

        {/* ── Date Range Filter (always visible) ── */}
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

        {/* ── Summary Bar (shown when results are available) ── */}
        {showResults && data?.summary && (
          <div className="w-full max-w-md mb-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div
              className="summary-bar"
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
                { value: data.summary.totalLogs,    label: 'logs analysed', mobile: '' },
                { value: data.summary.daysTracked,  label: 'days tracked',  mobile: '' },
                { value: data.summary.topTrigger,   label: 'top trigger',   mobile: 'summary-bar-top-trigger' },
              ].map(({ value, label, mobile }) => (
                <div key={label} className={mobile} style={{ textAlign: 'center' }}>
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

        {/* ── Loading spinner (cache check OR AI analysis) ── */}
        {showSpinner && (
          <div
            className="w-full max-w-md"
            style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e4ddd2',
                boxShadow: '0 4px 24px rgba(30,77,53,0.07)',
                padding: '48px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                width: '100%',
              }}
            >
              <div className="loading-spinner" />
              {loading && (
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                    color: '#1e4d35',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    margin: 0,
                  }}
                >
                  Analysing your data...
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Case A: No cache — Analyse button ── */}
        {showReadyCard && (
          <div
            className="w-full max-w-md fade-in-up"
            style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e4ddd2',
                boxShadow: '0 4px 24px rgba(30,77,53,0.07)',
                padding: '48px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', lineHeight: 1 }}>🔍</div>
              <h3
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Ready to analyse your data
              </h3>
              <p style={{ color: '#9aada5', fontSize: '0.875rem', lineHeight: 1.68, margin: 0, maxWidth: '280px' }}>
                Tap the button below to discover your gut triggers. Takes 10–15 seconds.
              </p>
              <button
                className="analyse-btn"
                onClick={runAnalysis}
                style={{
                  backgroundColor: '#1e4d35',
                  color: '#f5f0e8',
                  borderRadius: '100px',
                  padding: '14px 36px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: '0.02em',
                  marginTop: '8px',
                }}
              >
                Analyse my data
              </button>
              <p style={{ color: '#c8bfb0', fontSize: '0.8rem', margin: 0 }}>
                Your results will be saved for 6 hours
              </p>
            </div>
          </div>
        )}

        {/* ── Insufficient Data / Empty State ── */}
        {showInsufficient && (
          <div
            className="w-full max-w-md fade-in-up"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '26px',
              padding: '48px 32px',
              border: '1px solid #e4ddd2',
              textAlign: 'center',
              boxShadow: '0 6px 30px rgba(30,77,53,0.06)',
            }}
          >
            <div style={{ fontSize: '2.5rem', lineHeight: 1, margin: '0 auto 20px' }}>🌿</div>
            <h3
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '1.25rem',
                fontWeight: 600,
                margin: '0 0 10px',
              }}
            >
              No insights yet
            </h3>
            <p style={{ color: '#9aada5', fontSize: '0.875rem', lineHeight: 1.7, margin: '0 0 28px' }}>
              Log at least 7 days of meals and symptoms to unlock your personal gut trigger report.
            </p>
            <Link href="/log">
              <button
                style={{
                  backgroundColor: '#1e4d35',
                  color: '#f5f0e8',
                  borderRadius: '14px',
                  padding: '13px 28px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#163b28' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1e4d35' }}
              >
                Start Logging
              </button>
            </Link>
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
        {showResults && totalPatterns > 0 && (
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
                        color: cat === 'supplement' ? '#6b4f9e' : '#1e4d35',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: cat === 'supplement' ? '#f0ebfa' : '#edf5f0',
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
