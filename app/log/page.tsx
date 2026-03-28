'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AppHeader from '../components/AppHeader'

type LogType = 'meal' | 'symptom' | 'sleep' | 'stress' | 'supplement'

const LOG_TYPES = [
  {
    type: 'meal' as LogType,
    label: 'Meal',
    subtitle: 'What you ate',
    iconBg: '#e8f0eb',
    iconColor: '#1e6641',
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
    iconBg: '#fde8e8',
    iconColor: '#c0392b',
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
    iconBg: '#e8f0fb',
    iconColor: '#2c5ea8',
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
    iconBg: '#fef3e2',
    iconColor: '#b07d00',
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
    iconBg: '#f0ebfe',
    iconColor: '#6b4f9e',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="9" width="18" height="6" rx="3" />
        <line x1="12" y1="9" x2="12" y2="15" />
      </svg>
    ),
  },
]

const CARD_STYLE = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid rgba(30,77,53,0.1)',
  boxShadow: '0 2px 12px rgba(30,77,53,0.06)',
}

export default function LogPage() {
  const [activeLog, setActiveLog] = useState<LogType | null>(null)
  const [content, setContent] = useState('')
  const [severity, setSeverity] = useState(3)
  const [hours, setHours] = useState('')
  const [supplementDose, setSupplementDose] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userInitial, setUserInitial] = useState('?')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        setUserInitial((user.email?.[0] ?? '?').toUpperCase())
      }
    })
  }, [])

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
      user_id: userId ?? 'anonymous',
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
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes checkPop {
          0%   { opacity: 0; transform: scale(0.4); }
          70%  { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .scale-in   { animation: scaleIn  0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .check-pop  { animation: checkPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }

        .log-type-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          cursor: pointer;
        }
        .log-type-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(30,77,53,0.12) !important;
        }
        .log-type-card:active { transform: translateY(-1px); }

        textarea, input[type="number"], input[type="text"] {
          outline: none;
          transition: border-color 0.2s ease;
        }
        textarea:focus, input[type="number"]:focus, input[type="text"]:focus {
          border-color: #1e4d35 !important;
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          background: rgba(30,77,53,0.15);
          height: 4px;
          border-radius: 2px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #1e4d35;
          margin-top: -9px;
          box-shadow: 0 2px 8px rgba(30,77,53,0.28);
          transition: transform 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }

        .submit-btn { transition: background-color 0.2s ease, transform 0.15s ease; }
        .submit-btn:not(:disabled):hover  { background-color: #163b28 !important; }
        .submit-btn:not(:disabled):active { transform: scale(0.98); }

        @media (max-width: 640px) {
          .log-grid { grid-template-columns: 1fr !important; }
          .log-grid > * { grid-column: span 1 !important; }
        }
      `}</style>

      <AppHeader pageName="Log" userInitial={userInitial} />

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '116px',
          paddingBottom: '80px',
          paddingLeft: '20px',
          paddingRight: '20px',
          backgroundColor: '#f5f0e8',
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
        }}
      >

        {/* ── Log Type Grid ── */}
        {!activeLog && !submitted && (
          <div className="w-full max-w-md fade-in-up">
            <h1
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '28px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                margin: '0 0 32px',
              }}
            >
              What would you like to log?
            </h1>

            <div
              className="log-grid"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
            >
              {LOG_TYPES.map(({ type, label, subtitle, icon, iconBg, iconColor }) => (
                <button
                  key={type}
                  onClick={() => setActiveLog(type)}
                  className="log-type-card"
                  style={{
                    ...CARD_STYLE,
                    padding: '28px 24px',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    gridColumn: type === 'supplement' ? 'span 2' : undefined,
                    background: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: iconBg,
                      color: iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      color: '#1a1a18',
                      fontSize: '20px',
                      fontWeight: 600,
                      marginBottom: '4px',
                      lineHeight: 1.2,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ color: '#8a8a7e', fontSize: '13px', fontWeight: 400 }}>
                    {subtitle}
                  </div>
                </button>
              ))}
            </div>

            <p
              style={{
                color: '#8a8a7e',
                fontSize: '0.75rem',
                textAlign: 'center',
                marginTop: '32px',
                fontStyle: 'italic',
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
              style={{
                color: '#8a8a7e',
                fontSize: '0.8125rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: 0,
                marginBottom: '24px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#1e4d35' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#8a8a7e' }}
            >
              ← Back
            </button>

            <div style={{ ...CARD_STYLE, padding: '28px' }}>
              {/* Form header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: LOG_TYPES.find(l => l.type === activeLog)?.iconBg,
                    color: LOG_TYPES.find(l => l.type === activeLog)?.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {activeLogData?.icon}
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      color: '#1a1a18',
                      fontSize: '1.375rem',
                      fontWeight: 600,
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    Log {activeLog.charAt(0).toUpperCase() + activeLog.slice(1)}
                  </h2>
                  <p style={{ color: '#8a8a7e', fontSize: '0.8rem', margin: '3px 0 0' }}>
                    {activeLogData?.subtitle}
                  </p>
                </div>
              </div>

              {/* Meal / Symptom textarea */}
              {(activeLog === 'meal' || activeLog === 'symptom') && (
                <textarea
                  style={{
                    width: '100%',
                    border: '1px solid rgba(30,77,53,0.15)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    marginBottom: '20px',
                    fontFamily: 'inherit',
                    color: '#1a1a18',
                    backgroundColor: '#ffffff',
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
                    border: '1px solid rgba(30,77,53,0.15)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    marginBottom: '20px',
                    fontFamily: 'inherit',
                    color: '#1a1a18',
                    backgroundColor: '#ffffff',
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
                    <label style={{ color: '#5a5a52', fontSize: '0.8125rem', fontWeight: 500 }}>Severity</label>
                    <span
                      style={{
                        color: '#1e4d35',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        backgroundColor: '#e8f0eb',
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
                    <span style={{ color: '#8a8a7e', fontSize: '0.7rem' }}>Mild</span>
                    <span style={{ color: '#8a8a7e', fontSize: '0.7rem' }}>Severe</span>
                  </div>
                </div>
              )}

              {/* Supplement inputs */}
              {activeLog === 'supplement' && (
                <>
                  <textarea
                    style={{
                      width: '100%',
                      border: '1px solid rgba(30,77,53,0.15)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      fontSize: '0.9rem',
                      marginBottom: '12px',
                      fontFamily: 'inherit',
                      color: '#1a1a18',
                      backgroundColor: '#ffffff',
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
                      border: '1px solid rgba(30,77,53,0.15)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      fontSize: '0.9rem',
                      marginBottom: '20px',
                      fontFamily: 'inherit',
                      color: '#1a1a18',
                      backgroundColor: '#ffffff',
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
                    border: '1px solid rgba(30,77,53,0.15)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    marginBottom: '20px',
                    fontFamily: 'inherit',
                    color: '#1a1a18',
                    backgroundColor: '#ffffff',
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
                  color: '#ffffff',
                  borderRadius: '100px',
                  padding: '13px 28px',
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
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#e8f0eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 28px rgba(30,77,53,0.12)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e4d35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '1.5rem',
                fontWeight: 600,
                margin: '0 0 8px',
              }}
            >
              Logged.
            </h3>
            <p style={{ color: '#8a8a7e', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
              Keep it up.
            </p>
          </div>
        )}
      </main>
    </>
  )
}
