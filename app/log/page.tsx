'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

type LogType = 'meal' | 'symptom' | 'sleep' | 'stress' | 'supplement'

const LOG_TYPES = [
  {
    type: 'meal' as LogType,
    label: 'Meal',
    subtitle: 'What you ate',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
  },
  {
    type: 'symptom' as LogType,
    label: 'Symptom',
    subtitle: 'How you feel',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    type: 'sleep' as LogType,
    label: 'Sleep',
    subtitle: 'Rest quality',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    type: 'stress' as LogType,
    label: 'Stress',
    subtitle: 'Mental load',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 15s1.5-2 4-2 4 2 4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    type: 'supplement' as LogType,
    label: 'Supplement',
    subtitle: 'What you took',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="9" width="18" height="6" rx="3" />
        <line x1="12" y1="9" x2="12" y2="15" />
      </svg>
    ),
  },
]

export default function Home() {
  const [activeLog, setActiveLog] = useState<LogType | null>(null)
  const [content, setContent] = useState('')
  const [severity, setSeverity] = useState(3)
  const [hours, setHours] = useState('')
  const [supplementDose, setSupplementDose] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    let finalContent = content || ''
    if (activeLog === 'supplement' && supplementDose.trim()) {
      finalContent = finalContent
        ? `${finalContent} — ${supplementDose.trim()}`
        : supplementDose.trim()
    }
    const { error } = await supabase.from('logs').insert({
      type: activeLog,
      content: finalContent,
      severity: activeLog === 'symptom' || activeLog === 'stress' ? severity : null,
      hours: activeLog === 'sleep' ? parseFloat(hours) : null,
      user_id: 'anonymous',
    })
    setLoading(false)
    if (!error) {
      setSubmitted(true)
      setContent('')
      setSeverity(3)
      setHours('')
      setSupplementDose('')
      setTimeout(() => {
        setSubmitted(false)
        setActiveLog(null)
      }, 2500)
    }
  }

  const activeLogData = LOG_TYPES.find((l) => l.type === activeLog)

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes checkPop {
          0%   { opacity: 0; transform: scale(0.4); }
          70%  { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        .fade-in-up  { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .scale-in    { animation: scaleIn  0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .check-pop   { animation: checkPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }

        .log-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .log-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(30,77,53,0.10);
          border-color: #b8d4c4 !important;
        }
        .log-card:active { transform: translateY(-1px); }

        textarea, input[type="number"] {
          outline: none;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        textarea:focus, input[type="number"]:focus {
          border-color: #1e4d35 !important;
          background-color: #ffffff !important;
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          background: #d4e8dc;
          height: 4px;
          border-radius: 2px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #1e4d35;
          margin-top: -9px;
          box-shadow: 0 2px 8px rgba(30,77,53,0.28);
          transition: transform 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }

        .submit-btn {
          transition: background-color 0.2s ease, transform 0.15s ease;
        }
        .submit-btn:not(:disabled):hover  { background-color: #163b28 !important; }
        .submit-btn:not(:disabled):active { transform: scale(0.98); }

        .back-btn { transition: color 0.15s ease; }
        .back-btn:hover { color: #1e4d35 !important; }
      `}</style>

      <main
        className="min-h-screen flex flex-col items-center px-5 pt-14 pb-20"
        style={{ backgroundColor: '#f5f0e8', fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      >
        {/* ── Header ── */}
        <div className="w-full max-w-md mb-12 fade-in-up">
          <div style={{ textAlign: 'center' }}>
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
              GutBut
            </h1>
            <p
              style={{
                color: '#7a9185',
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginTop: '5px',
                marginBottom: '20px',
                fontWeight: 400,
              }}
            >
              Gut Health Tracker
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Link href="/history">
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
                  History
                </button>
              </Link>
              <Link href="/experiments">
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
                  Experiments
                </button>
              </Link>
              <Link href="/insights">
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
                  Insights
                </button>
              </Link>
            </div>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: '#d6cfc4', marginTop: '24px' }} />
        </div>

        {/* ── Log Type Grid ── */}
        {!activeLog && !submitted && (
          <div className="w-full max-w-md fade-in-up">
            <p
              style={{
                color: '#1e4d35',
                fontSize: '0.7rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '18px',
              }}
            >
              What would you like to log?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {LOG_TYPES.map(({ type, label, subtitle, icon }) => (
                <button
                  key={type}
                  onClick={() => setActiveLog(type)}
                  className="log-card"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4ddd2',
                    borderRadius: '22px',
                    padding: '26px 20px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    gridColumn: type === 'supplement' ? 'span 2' : undefined,
                  }}
                >
                  <div style={{ color: type === 'supplement' ? '#6b4f9e' : '#1e4d35', marginBottom: '16px' }}>{icon}</div>
                  <div style={{ color: '#1e4d35', fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>
                    {label}
                  </div>
                  <div style={{ color: '#9aada5', fontSize: '0.75rem', fontWeight: 400 }}>{subtitle}</div>
                </button>
              ))}
            </div>

            <p
              style={{
                color: '#b8b0a4',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                textAlign: 'center',
                marginTop: '36px',
              }}
            >
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}

        {/* ── Log Form ── */}
        {activeLog && !submitted && (
          <div className="w-full max-w-md scale-in">
            <button
              onClick={() => setActiveLog(null)}
              className="back-btn"
              style={{
                color: '#9aada5',
                fontSize: '0.8125rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: 0,
                marginBottom: '28px',
              }}
            >
              ← Back
            </button>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '26px',
                padding: '32px',
                border: '1px solid #e4ddd2',
                boxShadow: '0 6px 30px rgba(30,77,53,0.07)',
              }}
            >
              {/* Form header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '30px' }}>
                <div
                  style={{
                    color: activeLog === 'supplement' ? '#6b4f9e' : '#1e4d35',
                    backgroundColor: activeLog === 'supplement' ? '#f0ebfa' : '#edf5f0',
                    borderRadius: '14px',
                    padding: '11px',
                    display: 'flex',
                    flexShrink: 0,
                  }}
                >
                  {activeLogData?.icon}
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      color: '#1e4d35',
                      fontSize: '1.375rem',
                      fontWeight: 600,
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    Log {activeLog.charAt(0).toUpperCase() + activeLog.slice(1)}
                  </h2>
                  <p style={{ color: '#9aada5', fontSize: '0.8rem', margin: '3px 0 0' }}>
                    {activeLogData?.subtitle}
                  </p>
                </div>
              </div>

              {/* Meal / Symptom textarea */}
              {(activeLog === 'meal' || activeLog === 'symptom') && (
                <textarea
                  style={{
                    width: '100%',
                    border: '1px solid #e4ddd2',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    fontSize: '0.9rem',
                    marginBottom: '20px',
                    fontFamily: 'inherit',
                    color: '#1e4d35',
                    backgroundColor: '#faf8f4',
                    resize: 'none',
                    boxSizing: 'border-box',
                    lineHeight: 1.65,
                    display: 'block',
                  }}
                  rows={3}
                  placeholder={activeLog === 'meal' ? 'Describe what you ate...' : "Describe what you're feeling..."}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              )}

              {/* Sleep input */}
              {activeLog === 'sleep' && (
                <input
                  type="number"
                  style={{
                    width: '100%',
                    border: '1px solid #e4ddd2',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    fontSize: '0.9rem',
                    marginBottom: '20px',
                    fontFamily: 'inherit',
                    color: '#1e4d35',
                    backgroundColor: '#faf8f4',
                    boxSizing: 'border-box',
                    display: 'block',
                  }}
                  placeholder="Hours of sleep"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              )}

              {/* Severity slider */}
              {(activeLog === 'symptom' || activeLog === 'stress') && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ color: '#7a9185', fontSize: '0.8125rem', fontWeight: 500 }}>Severity</label>
                    <span
                      style={{
                        color: '#1e4d35',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        backgroundColor: '#edf5f0',
                        padding: '3px 12px',
                        borderRadius: '100px',
                      }}
                    >
                      {severity} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ color: '#c0c8c4', fontSize: '0.7rem' }}>Mild</span>
                    <span style={{ color: '#c0c8c4', fontSize: '0.7rem' }}>Severe</span>
                  </div>
                </div>
              )}

              {/* Supplement inputs */}
              {activeLog === 'supplement' && (
                <>
                  <textarea
                    style={{
                      width: '100%',
                      border: '1px solid #e4ddd2',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      fontSize: '0.9rem',
                      marginBottom: '12px',
                      fontFamily: 'inherit',
                      color: '#1e4d35',
                      backgroundColor: '#faf8f4',
                      resize: 'none',
                      boxSizing: 'border-box',
                      lineHeight: 1.65,
                      display: 'block',
                    }}
                    rows={2}
                    placeholder="What supplement did you take? e.g. Probiotic 10 billion CFU, Vitamin D 2000 IU"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <textarea
                    style={{
                      width: '100%',
                      border: '1px solid #e4ddd2',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      fontSize: '0.9rem',
                      marginBottom: '20px',
                      fontFamily: 'inherit',
                      color: '#1e4d35',
                      backgroundColor: '#faf8f4',
                      resize: 'none',
                      boxSizing: 'border-box',
                      lineHeight: 1.65,
                      display: 'block',
                    }}
                    rows={2}
                    placeholder="Dose / notes (optional) — e.g. 1 capsule after breakfast"
                    value={supplementDose}
                    onChange={(e) => setSupplementDose(e.target.value)}
                  />
                </>
              )}

              {/* Stress note textarea */}
              {activeLog === 'stress' && (
                <textarea
                  style={{
                    width: '100%',
                    border: '1px solid #e4ddd2',
                    borderRadius: '14px',
                    padding: '14px 16px',
                    fontSize: '0.9rem',
                    marginBottom: '20px',
                    fontFamily: 'inherit',
                    color: '#1e4d35',
                    backgroundColor: '#faf8f4',
                    resize: 'none',
                    boxSizing: 'border-box',
                    lineHeight: 1.65,
                    display: 'block',
                  }}
                  rows={2}
                  placeholder="Add a note about your stress (optional)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="submit-btn"
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#8eb8a3' : '#1e4d35',
                  color: '#f5f0e8',
                  borderRadius: '14px',
                  padding: '15px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: '0.02em',
                }}
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        )}

        {/* ── Success State ── */}
        {submitted && (
          <div className="fade-in-up" style={{ textAlign: 'center', marginTop: '60px' }}>
            <div
              className="check-pop"
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                backgroundColor: '#edf5f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 28px rgba(30,77,53,0.12)',
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1e4d35"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '1.4rem',
                fontWeight: 600,
                margin: '0 0 10px',
              }}
            >
              Entry saved
            </h3>
            <p style={{ color: '#9aada5', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Keep tracking. Patterns take shape over time.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
