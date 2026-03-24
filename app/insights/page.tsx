'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Insight {
  insight: string
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [insufficient, setInsufficient] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/insights')
      .then((res) => res.json())
      .then((data) => {
        if (data.insufficient) {
          setInsufficient(true)
        } else {
          setInsights(data.insights)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Something went wrong. Please try again.')
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
          from { opacity: 0; transform: translateY(14px); }
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

        .back-btn { transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease; }
      `}</style>

      <main
        className="min-h-screen flex flex-col items-center px-5 pt-14 pb-20"
        style={{ backgroundColor: '#f5f0e8', fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      >
        {/* ── Header ── */}
        <div className="w-full max-w-md mb-12 fade-in-up">
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

        {/* ── Loading ── */}
        {loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '22px',
              marginTop: '72px',
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
        {insufficient && !loading && (
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1e4d35"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
        {error && !loading && (
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
        {!loading && !insufficient && insights.length > 0 && (
          <div className="w-full max-w-md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p
              style={{
                color: '#1e4d35',
                fontSize: '0.7rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '6px',
              }}
            >
              {insights.length} pattern{insights.length !== 1 ? 's' : ''} found
            </p>
            {insights.map((item, index) => (
              <div
                key={index}
                className="insight-card"
                style={{
                  animationDelay: `${index * 0.07}s`,
                  backgroundColor: '#ffffff',
                  borderRadius: '22px',
                  padding: '24px 26px',
                  border: '1px solid #e4ddd2',
                  display: 'flex',
                  gap: '18px',
                  alignItems: 'flex-start',
                  boxShadow: '0 2px 12px rgba(30,77,53,0.04)',
                }}
              >
                <div
                  style={{
                    minWidth: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#edf5f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  <span style={{ color: '#1e4d35', fontSize: '0.7rem', fontWeight: 700 }}>{index + 1}</span>
                </div>
                <p
                  style={{
                    color: '#2c3e30',
                    fontSize: '0.9375rem',
                    lineHeight: 1.68,
                    margin: 0,
                    fontWeight: 400,
                  }}
                >
                  {item.insight}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
