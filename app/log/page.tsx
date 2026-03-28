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
    emoji: '🍽',
    borderColor: '#1e4d35',
    iconBg: 'rgba(30,77,53,0.07)',
    headerBg: 'rgba(30,77,53,0.04)',
  },
  {
    type: 'symptom' as LogType,
    label: 'Symptom',
    subtitle: 'How you feel',
    emoji: '⚡',
    borderColor: '#c0392b',
    iconBg: 'rgba(192,57,43,0.07)',
    headerBg: 'rgba(192,57,43,0.04)',
  },
  {
    type: 'sleep' as LogType,
    label: 'Sleep',
    subtitle: 'Rest quality',
    emoji: '🌙',
    borderColor: '#1a3a5c',
    iconBg: 'rgba(26,58,92,0.07)',
    headerBg: 'rgba(26,58,92,0.04)',
  },
  {
    type: 'stress' as LogType,
    label: 'Stress',
    subtitle: 'Mental load',
    emoji: '🧠',
    borderColor: '#b7770d',
    iconBg: 'rgba(183,119,13,0.07)',
    headerBg: 'rgba(183,119,13,0.04)',
  },
  {
    type: 'supplement' as LogType,
    label: 'Supplement',
    subtitle: 'What you took',
    emoji: '💊',
    borderColor: '#5b3d8a',
    iconBg: 'rgba(91,61,138,0.07)',
    headerBg: 'rgba(91,61,138,0.04)',
  },
]

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
  const [firstName, setFirstName] = useState('')
  const [streak, setStreak] = useState(0)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,'

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        setUserInitial((user.email?.[0] ?? '?').toUpperCase())

        // Fetch firstName from user_profiles
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('first_name')
          .eq('user_id', user.id)
          .maybeSingle()
        setFirstName(profile?.first_name ?? '')

        // Streak: distinct dates in last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const { data: recentLogs } = await supabase
          .from('logs')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
        const uniqueDates = new Set(
          (recentLogs ?? []).map(l => new Date(l.created_at).toDateString())
        )
        setStreak(uniqueDates.size)
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
      }, 2000)
    }
  }

  const activeLogData = LOG_TYPES.find((l) => l.type === activeLog)

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
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
        .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .scale-in   { animation: scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .check-pop  { animation: checkPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }

        .log-type-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          border: none;
          text-align: left;
          width: 100%;
        }
        .log-type-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(30,77,53,0.1) !important;
        }
        .log-type-card:active { transform: translateY(0); }

        textarea, input[type="number"], input[type="text"] {
          outline: none;
          transition: border-color 0.2s ease;
        }
        textarea:focus, input[type="number"]:focus, input[type="text"]:focus {
          border-color: rgba(30,77,53,0.35) !important;
        }
        textarea::placeholder { color: #b0aca6; }

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
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #1e4d35;
          margin-top: -8px;
          box-shadow: 0 2px 6px rgba(30,77,53,0.28);
        }

        .save-btn {
          transition: background-color 0.2s ease;
        }
        .save-btn:not(:disabled):hover {
          background-color: rgba(30,77,53,0.05) !important;
        }
      `}</style>

      <AppHeader pageName="Log" userInitial={userInitial} />

      <main
        style={{
          minHeight: '100vh',
          paddingTop: '104px',
          paddingBottom: '80px',
          backgroundColor: '#f5f0e8',
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>

          {/* ── Log Type List ── */}
          {!activeLog && !submitted && (
            <div className="fade-in-up">
              {/* Greeting */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", fontSize: '13px', color: '#8a8a7e', margin: '0 0 4px' }}>
                  {greeting}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                    fontStyle: 'italic',
                    fontSize: '32px',
                    color: '#1e4d35',
                    margin: '0 0 6px',
                    lineHeight: 1.15,
                  }}
                >
                  {firstName || 'there'}
                </p>
                <p style={{ fontSize: '14px', color: '#8a8a7e', fontWeight: 300, margin: 0 }}>
                  What would you like to log today?
                </p>
              </div>

              {/* Cards */}
              {LOG_TYPES.map(({ type, label, subtitle, emoji, borderColor, iconBg }) => (
                <button
                  key={type}
                  onClick={() => setActiveLog(type)}
                  className="log-type-card"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid rgba(30,77,53,0.07)',
                    borderLeft: `3px solid ${borderColor}`,
                    boxShadow: '0 2px 8px rgba(30,77,53,0.05)',
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    marginBottom: '10px',
                    fontFamily: 'inherit',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                    }}
                  >
                    {emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#1a1a18',
                        lineHeight: 1.2,
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8a8a7e', marginTop: '2px' }}>
                      {subtitle}
                    </div>
                  </div>
                  <span style={{ fontSize: '18px', color: '#d0ccc4', flexShrink: 0 }}>›</span>
                </button>
              ))}

              {/* Streak */}
              {streak > 0 && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '12px',
                      color: '#1e4d35',
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(30,77,53,0.12)',
                      borderRadius: '100px',
                      padding: '5px 16px',
                      boxShadow: '0 1px 4px rgba(30,77,53,0.05)',
                    }}
                  >
                    🔥 {streak} day streak
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Log Form ── */}
          {activeLog && !submitted && (
            <div className="scale-in">
              <button
                onClick={() => setActiveLog(null)}
                style={{
                  color: '#8a8a7e',
                  fontSize: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  padding: 0,
                  marginBottom: '12px',
                }}
              >
                ← Back
              </button>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid rgba(30,77,53,0.08)',
                  boxShadow: '0 2px 16px rgba(30,77,53,0.08)',
                  overflow: 'hidden',
                }}
              >
                {/* Form header */}
                <div
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderBottom: '1px solid rgba(30,77,53,0.06)',
                    backgroundColor: activeLogData?.headerBg,
                    borderLeft: `3px solid ${activeLogData?.borderColor}`,
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: activeLogData?.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0,
                    }}
                  >
                    {activeLogData?.emoji}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                        fontSize: '17px',
                        fontWeight: 700,
                        color: '#1a1a18',
                        lineHeight: 1.2,
                      }}
                    >
                      Log {activeLog.charAt(0).toUpperCase() + activeLog.slice(1)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8a8a7e', marginTop: '2px' }}>
                      {activeLogData?.subtitle}
                    </div>
                  </div>
                </div>

                {/* Form body */}
                <div style={{ padding: '20px' }}>
                  {/* Meal textarea */}
                  {activeLog === 'meal' && (
                    <textarea
                      style={{
                        width: '100%',
                        border: '1px solid rgba(30,77,53,0.15)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        color: '#5a5a52',
                        backgroundColor: '#ffffff',
                        resize: 'none',
                        boxSizing: 'border-box',
                        lineHeight: 1.65,
                        display: 'block',
                        minHeight: '100px',
                      }}
                      placeholder="Describe what you ate..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  )}

                  {/* Symptom textarea + severity */}
                  {activeLog === 'symptom' && (
                    <>
                      <textarea
                        style={{
                          width: '100%',
                          border: '1px solid rgba(30,77,53,0.15)',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          color: '#5a5a52',
                          backgroundColor: '#ffffff',
                          resize: 'none',
                          boxSizing: 'border-box',
                          lineHeight: 1.65,
                          display: 'block',
                          minHeight: '100px',
                          marginBottom: '16px',
                        }}
                        placeholder="Describe what you're feeling..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                      <div style={{ marginBottom: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <label style={{ color: '#5a5a52', fontSize: '13px', fontWeight: 500 }}>Severity</label>
                          <span style={{ color: '#1e4d35', fontSize: '13px', fontWeight: 600, backgroundColor: 'rgba(30,77,53,0.07)', padding: '2px 10px', borderRadius: '100px' }}>
                            {severity} / 5
                          </span>
                        </div>
                        <input type="range" min={1} max={5} value={severity} onChange={(e) => setSeverity(parseInt(e.target.value))} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span style={{ color: '#8a8a7e', fontSize: '11px' }}>Mild</span>
                          <span style={{ color: '#8a8a7e', fontSize: '11px' }}>Severe</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Sleep input */}
                  {activeLog === 'sleep' && (
                    <input
                      type="number"
                      style={{
                        width: '100%',
                        border: '1px solid rgba(30,77,53,0.15)',
                        borderRadius: '12px',
                        padding: '14px 16px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        color: '#5a5a52',
                        backgroundColor: '#ffffff',
                        boxSizing: 'border-box',
                        display: 'block',
                      }}
                      placeholder="Hours of sleep"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  )}

                  {/* Stress severity + note */}
                  {activeLog === 'stress' && (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <label style={{ color: '#5a5a52', fontSize: '13px', fontWeight: 500 }}>Severity</label>
                          <span style={{ color: '#1e4d35', fontSize: '13px', fontWeight: 600, backgroundColor: 'rgba(30,77,53,0.07)', padding: '2px 10px', borderRadius: '100px' }}>
                            {severity} / 5
                          </span>
                        </div>
                        <input type="range" min={1} max={5} value={severity} onChange={(e) => setSeverity(parseInt(e.target.value))} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span style={{ color: '#8a8a7e', fontSize: '11px' }}>Low</span>
                          <span style={{ color: '#8a8a7e', fontSize: '11px' }}>High</span>
                        </div>
                      </div>
                      <textarea
                        style={{
                          width: '100%',
                          border: '1px solid rgba(30,77,53,0.15)',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          color: '#5a5a52',
                          backgroundColor: '#ffffff',
                          resize: 'none',
                          boxSizing: 'border-box',
                          lineHeight: 1.65,
                          display: 'block',
                          minHeight: '80px',
                        }}
                        placeholder="Add a note about your stress (optional)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </>
                  )}

                  {/* Supplement inputs */}
                  {activeLog === 'supplement' && (
                    <>
                      <textarea
                        style={{
                          width: '100%',
                          border: '1px solid rgba(30,77,53,0.15)',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          color: '#5a5a52',
                          backgroundColor: '#ffffff',
                          resize: 'none',
                          boxSizing: 'border-box',
                          lineHeight: 1.65,
                          display: 'block',
                          minHeight: '80px',
                          marginBottom: '10px',
                        }}
                        placeholder="What supplement did you take? e.g. Probiotic 10 billion CFU"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                      <textarea
                        style={{
                          width: '100%',
                          border: '1px solid rgba(30,77,53,0.15)',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          color: '#5a5a52',
                          backgroundColor: '#ffffff',
                          resize: 'none',
                          boxSizing: 'border-box',
                          lineHeight: 1.65,
                          display: 'block',
                          minHeight: '80px',
                        }}
                        placeholder="Dose / notes (optional)"
                        value={supplementDose}
                        onChange={(e) => setSupplementDose(e.target.value)}
                      />
                    </>
                  )}

                  {/* Save button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="save-btn"
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      color: '#1e4d35',
                      border: '1.5px solid #1e4d35',
                      borderRadius: '100px',
                      padding: '13px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      marginTop: '14px',
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Success State ── */}
          {submitted && (
            <div
              className="fade-in-up"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '40px 24px',
                border: '1px solid rgba(30,77,53,0.08)',
                boxShadow: '0 2px 12px rgba(30,77,53,0.06)',
                textAlign: 'center',
              }}
            >
              <div
                className="check-pop"
                style={{
                  fontSize: '40px',
                  color: '#1e4d35',
                  marginBottom: '12px',
                  lineHeight: 1,
                }}
              >
                ✓
              </div>
              <p
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  fontStyle: 'italic',
                  color: '#1e4d35',
                  fontSize: '28px',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                Logged.
              </p>
              <p style={{ color: '#8a8a7e', fontSize: '13px', marginTop: '6px', margin: '6px 0 0' }}>
                Keep it up.
              </p>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
