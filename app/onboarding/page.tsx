'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  // Step 2 state
  const [firstName, setFirstName] = useState('')
  const [age, setAge] = useState('')
  const [dietType, setDietType] = useState('')
  const [step2Saving, setStep2Saving] = useState(false)

  // Step 3 log state
  const [activeLog, setActiveLog] = useState<LogType | null>(null)
  const [content, setContent] = useState('')
  const [severity, setSeverity] = useState(3)
  const [hours, setHours] = useState('')
  const [supplementDose, setSupplementDose] = useState('')
  const [logLoading, setLogLoading] = useState(false)
  const [logSubmitted, setLogSubmitted] = useState(false)
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  async function handleStep2Continue() {
    if (!userId) return
    setStep2Saving(true)
    await supabase.from('user_profiles').upsert(
      {
        user_id: userId,
        first_name: firstName.trim() || null,
        age: age ? parseInt(age) : null,
        diet_type: dietType || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    setStep2Saving(false)
    setStep(3)
  }

  async function handleLogSubmit() {
    setLogLoading(true)
    let finalContent = content || ''
    if (activeLog === 'supplement' && supplementDose.trim()) {
      finalContent = finalContent ? `${finalContent} — ${supplementDose.trim()}` : supplementDose.trim()
    }
    const { error } = await supabase.from('logs').insert({
      type: activeLog,
      content: finalContent,
      severity: activeLog === 'symptom' || activeLog === 'stress' ? severity : null,
      hours: activeLog === 'sleep' ? parseFloat(hours) : null,
      user_id: userId ?? 'anonymous',
    })
    setLogLoading(false)
    if (!error) setLogSubmitted(true)
  }

  async function handleFinish() {
    setFinishing(true)
    if (userId) {
      await supabase.from('user_profiles').upsert(
        { user_id: userId, onboarding_complete: true, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
    }
    document.cookie = 'gutbut-onboarded=1; path=/; max-age=31536000; SameSite=Lax'
    router.push('/log')
  }

  const activeLogData = LOG_TYPES.find((l) => l.type === activeLog)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #e4ddd2',
    borderRadius: '14px',
    padding: '13px 16px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    color: '#1e4d35',
    backgroundColor: '#faf8f4',
    boxSizing: 'border-box',
    display: 'block',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    color: '#7a9185',
    fontSize: '0.8rem',
    fontWeight: 500,
    display: 'block',
    marginBottom: '8px',
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPop {
          0%   { opacity: 0; transform: scale(0.4); }
          70%  { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
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

        textarea, input[type="text"], input[type="number"] {
          outline: none;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        textarea:focus, input[type="text"]:focus, input[type="number"]:focus, select:focus {
          border-color: #1e4d35 !important;
          background-color: #ffffff !important;
        }
        input[type="range"] {
          -webkit-appearance: none; appearance: none;
          background: transparent; cursor: pointer; width: 100%;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          background: #d4e8dc; height: 4px; border-radius: 2px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px; height: 22px; border-radius: 50%;
          background: #1e4d35; margin-top: -9px;
          box-shadow: 0 2px 8px rgba(30,77,53,0.28);
          transition: transform 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }

        .primary-btn { transition: background-color 0.2s ease, transform 0.15s ease; }
        .primary-btn:not(:disabled):hover  { background-color: #163b28 !important; }
        .primary-btn:not(:disabled):active { transform: scale(0.98); }

        .back-link {
          color: #9aada5; font-size: 0.8125rem; background: none; border: none;
          cursor: pointer; font-family: inherit; padding: 0;
          transition: color 0.15s ease;
        }
        .back-link:hover { color: #1e4d35 !important; }
      `}</style>

      <main
        className="min-h-screen flex flex-col items-center px-5 pt-12 pb-20"
        style={{ backgroundColor: '#f5f0e8', fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      >
        {/* ── Step indicator ── */}
        <div className="w-full max-w-md mb-10 fade-in-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#7a9185', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
              Step {step} of 3
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  style={{
                    width: s === step ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: s <= step ? '#1e4d35' : '#d6cfc4',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: '#d6cfc4', marginTop: '14px' }} />
        </div>

        {/* ══ STEP 1 — Welcome ══ */}
        {step === 1 && (
          <div className="w-full max-w-md fade-in-up" style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '2.5rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                margin: '0 0 8px',
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
                margin: '0 0 44px',
                fontWeight: 400,
              }}
            >
              Trigger Tool
            </p>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '26px',
                padding: '40px 32px',
                border: '1px solid #e4ddd2',
                boxShadow: '0 6px 30px rgba(30,77,53,0.07)',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.625rem',
                  fontWeight: 600,
                  margin: '0 0 20px',
                  lineHeight: 1.25,
                }}
              >
                Welcome to GutBut Trigger Tool
              </h2>
              <p style={{ color: '#5a7a6a', fontSize: '0.9375rem', lineHeight: 1.75, margin: '0 0 10px' }}>
                Log your meals, symptoms, sleep and stress every day.
              </p>
              <p style={{ color: '#5a7a6a', fontSize: '0.9375rem', lineHeight: 1.75, margin: 0 }}>
                Our AI finds the patterns and tells you exactly what is triggering your gut issues.
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              className="primary-btn"
              style={{
                width: '100%',
                backgroundColor: '#1e4d35',
                color: '#f5f0e8',
                borderRadius: '14px',
                padding: '16px',
                fontSize: '1rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
              }}
            >
              Let&apos;s Get Started →
            </button>
          </div>
        )}

        {/* ══ STEP 2 — Quick info ══ */}
        {step === 2 && (
          <div className="w-full max-w-md scale-in">
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
              <h2
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  margin: '0 0 6px',
                  lineHeight: 1.2,
                }}
              >
                Tell us a little about yourself
              </h2>
              <p style={{ color: '#9aada5', fontSize: '0.8375rem', margin: '0 0 28px' }}>
                Helps us personalise your insights
              </p>

              <label style={labelStyle}>First name</label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{ ...inputStyle, marginBottom: '20px' }}
              />

              <label style={labelStyle}>Age</label>
              <input
                type="number"
                placeholder="e.g. 32"
                value={age}
                min={1}
                max={120}
                onChange={(e) => setAge(e.target.value)}
                style={{ ...inputStyle, marginBottom: '20px' }}
              />

              <label style={labelStyle}>Diet type</label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                style={{ ...inputStyle, marginBottom: '0', appearance: 'auto' }}
              >
                <option value="">Select diet type</option>
                <option value="Omnivore">Omnivore</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Gluten-free">Gluten-free</option>
                <option value="Dairy-free">Dairy-free</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              onClick={handleStep2Continue}
              disabled={step2Saving}
              className="primary-btn"
              style={{
                width: '100%',
                backgroundColor: step2Saving ? '#8eb8a3' : '#1e4d35',
                color: '#f5f0e8',
                borderRadius: '14px',
                padding: '15px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                border: 'none',
                cursor: step2Saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
                marginBottom: '14px',
              }}
            >
              {step2Saving ? 'Saving...' : 'Continue →'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button className="back-link" onClick={() => setStep(1)}>← Back</button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — First log ══ */}
        {step === 3 && !logSubmitted && (
          <div className="w-full max-w-md scale-in">
            <h2
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '1.5rem',
                fontWeight: 600,
                margin: '0 0 6px',
                lineHeight: 1.2,
              }}
            >
              Log your first entry
            </h2>
            <p style={{ color: '#9aada5', fontSize: '0.8375rem', margin: '0 0 24px' }}>
              Pick what you&apos;d like to track first
            </p>

            {/* Log type grid */}
            {!activeLog && (
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
                    <div style={{ color: '#1e4d35', fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
                    <div style={{ color: '#9aada5', fontSize: '0.75rem', fontWeight: 400 }}>{subtitle}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Log form */}
            {activeLog && (
              <>
                <button
                  onClick={() => setActiveLog(null)}
                  className="back-link"
                  style={{ marginBottom: '20px' }}
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
                      <h3
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
                      </h3>
                      <p style={{ color: '#9aada5', fontSize: '0.8rem', margin: '3px 0 0' }}>
                        {activeLogData?.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Meal / Symptom textarea */}
                  {(activeLog === 'meal' || activeLog === 'symptom') && (
                    <textarea
                      style={{ ...inputStyle, marginBottom: '20px', resize: 'none', lineHeight: 1.65 }}
                      rows={3}
                      placeholder={activeLog === 'meal' ? 'Describe what you ate...' : "Describe what you're feeling..."}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  )}

                  {/* Sleep */}
                  {activeLog === 'sleep' && (
                    <input
                      type="number"
                      style={{ ...inputStyle, marginBottom: '20px' }}
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
                            color: '#1e4d35', fontSize: '0.8125rem', fontWeight: 600,
                            backgroundColor: '#edf5f0', padding: '3px 12px', borderRadius: '100px',
                          }}
                        >
                          {severity} / 5
                        </span>
                      </div>
                      <input
                        type="range" min={1} max={5} value={severity}
                        onChange={(e) => setSeverity(parseInt(e.target.value))}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span style={{ color: '#c0c8c4', fontSize: '0.7rem' }}>Mild</span>
                        <span style={{ color: '#c0c8c4', fontSize: '0.7rem' }}>Severe</span>
                      </div>
                    </div>
                  )}

                  {/* Supplement */}
                  {activeLog === 'supplement' && (
                    <>
                      <textarea
                        style={{ ...inputStyle, marginBottom: '12px', resize: 'none', lineHeight: 1.65 }}
                        rows={2}
                        placeholder="What supplement did you take? e.g. Probiotic 10 billion CFU"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                      <textarea
                        style={{ ...inputStyle, marginBottom: '20px', resize: 'none', lineHeight: 1.65 }}
                        rows={2}
                        placeholder="Dose / notes (optional)"
                        value={supplementDose}
                        onChange={(e) => setSupplementDose(e.target.value)}
                      />
                    </>
                  )}

                  {/* Stress note */}
                  {activeLog === 'stress' && (
                    <textarea
                      style={{ ...inputStyle, marginBottom: '20px', resize: 'none', lineHeight: 1.65 }}
                      rows={2}
                      placeholder="Add a note about your stress (optional)"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  )}

                  <button
                    onClick={handleLogSubmit}
                    disabled={logLoading}
                    className="primary-btn"
                    style={{
                      width: '100%',
                      backgroundColor: logLoading ? '#8eb8a3' : '#1e4d35',
                      color: '#f5f0e8',
                      borderRadius: '14px',
                      padding: '15px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: logLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {logLoading ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ STEP 3 — Success ══ */}
        {step === 3 && logSubmitted && (
          <div className="w-full max-w-md fade-in-up" style={{ textAlign: 'center' }}>
            <div
              className="check-pop"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#edf5f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 28px',
                boxShadow: '0 8px 32px rgba(30,77,53,0.14)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e4d35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '1.625rem',
                fontWeight: 600,
                margin: '0 0 12px',
                lineHeight: 1.2,
              }}
            >
              You&apos;re all set!
            </h2>
            <p style={{ color: '#5a7a6a', fontSize: '0.9375rem', lineHeight: 1.7, margin: '0 0 36px' }}>
              Let&apos;s find your triggers.
            </p>

            <button
              onClick={handleFinish}
              disabled={finishing}
              className="primary-btn"
              style={{
                width: '100%',
                backgroundColor: finishing ? '#8eb8a3' : '#1e4d35',
                color: '#f5f0e8',
                borderRadius: '14px',
                padding: '16px',
                fontSize: '1rem',
                fontWeight: 600,
                border: 'none',
                cursor: finishing ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
              }}
            >
              {finishing ? 'Loading...' : 'Go to My Dashboard →'}
            </button>
          </div>
        )}
      </main>
    </>
  )
}
