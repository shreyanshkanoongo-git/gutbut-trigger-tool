'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

interface Experiment {
  id: string
  created_at: string
  name: string
  hypothesis: string
  start_date: string
  end_date: string
  status: 'active' | 'completed'
  result: string | null
  user_id: string
}

interface ExperimentResult {
  verdict: 'confirmed_trigger' | 'not_a_trigger' | 'inconclusive'
  verdictLabel: string
  summary: string
  beforeHighlight: string
  duringHighlight: string
  recommendation: string
}

const VERDICT_STYLES: Record<
  ExperimentResult['verdict'],
  { bg: string; color: string; border: string; icon: string }
> = {
  confirmed_trigger: { bg: '#fff0ee', color: '#c0392b', border: '#fdd5cc', icon: '⚠️' },
  not_a_trigger:     { bg: '#edf5f0', color: '#1e6641', border: '#b8d4c4', icon: '✓' },
  inconclusive:      { bg: '#fffbec', color: '#b07d00', border: '#f0e0a0', icon: '~' },
}

function daysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function progressPercent(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = Date.now()
  if (now >= end) return 100
  if (now <= start) return 0
  return Math.round(((now - start) / (end - start)) * 100)
}

export default function ExperimentsPage() {
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [analyzingResult, setAnalyzingResult] = useState(false)
  const [result, setResult] = useState<ExperimentResult | null>(null)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [userInitial, setUserInitial] = useState('?')

  // Form state
  const [name, setName] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [duration, setDuration] = useState<7 | 14 | 21>(7)

  useEffect(() => {
    loadExperiment()
  }, [])

  async function loadExperiment() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const uid = user?.id ?? 'anonymous'
    setUserId(uid)
    if (user) setUserInitial((user.email?.[0] ?? '?').toUpperCase())

    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!error && data) {
      setExperiment(data as Experiment)
      if (data.status === 'completed' && data.result) {
        try { setResult(JSON.parse(data.result)) } catch { /* ignore */ }
      }
    }
    setLoading(false)
  }

  async function handleStart() {
    if (!name.trim() || !hypothesis.trim()) return
    setSubmitting(true)
    setError('')
    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + duration)

    const { data, error } = await supabase
      .from('experiments')
      .insert({
        name: name.trim(),
        hypothesis: hypothesis.trim(),
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        status: 'active',
        user_id: userId ?? 'anonymous',
      })
      .select()
      .single()

    setSubmitting(false)
    if (error) { setError('Could not start experiment. Please try again.'); return }
    setExperiment(data as Experiment)
    setName('')
    setHypothesis('')
  }

  async function handleEnd() {
    if (!experiment) return
    setAnalyzingResult(true)
    setError('')

    // Mark end date as today
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('experiments')
      .update({ end_date: today })
      .eq('id', experiment.id)

    // Fetch AI verdict
    const res = await fetch(`/api/experiment-result?experimentId=${experiment.id}`)
    const json = await res.json()
    if (json.error) {
      setError('Could not analyse experiment. Please try again.')
      setAnalyzingResult(false)
      return
    }

    setResult(json)
    setExperiment({ ...experiment, status: 'completed', end_date: today, result: JSON.stringify(json) })
    setAnalyzingResult(false)
  }

  async function handleReset() {
    setExperiment(null)
    setResult(null)
  }

  const isExpired = experiment?.status === 'active' && daysRemaining(experiment.end_date) === 0

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
        .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background-color: #1e4d35;
          animation: pulseDot 1.5s ease-in-out infinite;
        }
        .nav-btn { transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
        .primary-btn { transition: background-color 0.2s ease, transform 0.15s ease; }
        .primary-btn:not(:disabled):hover { background-color: #163b28 !important; }
        .primary-btn:not(:disabled):active { transform: scale(0.98); }
        .danger-btn { transition: background-color 0.2s ease, border-color 0.2s ease; }
        .danger-btn:hover { background-color: #fff0ee !important; border-color: #fdd5cc !important; }
        textarea, input[type="text"] {
          outline: none;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        textarea:focus, input[type="text"]:focus {
          border-color: #1e4d35 !important;
          background-color: #ffffff !important;
        }
        .duration-btn { transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease; }

        @media (max-width: 640px) {
          .exp-header { flex-wrap: nowrap; align-items: center; }
          .exp-header-left { min-width: 0; }
          .exp-header-right { flex-shrink: 0; margin-left: 12px; }
        }
      `}</style>

      <main
        className="min-h-screen flex flex-col items-center px-5 pt-14 pb-20"
        style={{ backgroundColor: '#f5f0e8', fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      >
        {/* ── Header ── */}
        <div className="w-full max-w-md mb-10 fade-in-up">
          <div className="exp-header flex items-start justify-between">
            <div className="exp-header-left">
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
                Experiments
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
                Test your triggers
              </p>
            </div>
            <div className="exp-header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href="/log">
                <button
                  className="nav-btn"
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
              <Link href="/profile">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#1e4d35',
                    color: '#f5f0e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                    boxShadow: '0 2px 10px rgba(30,77,53,0.18)',
                    flexShrink: 0,
                  }}
                  title="View profile"
                >
                  {userInitial}
                </div>
              </Link>
            </div>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: '#d6cfc4', marginTop: '24px' }} />
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: 'flex', gap: '9px', marginTop: '72px' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="dot" style={{ animationDelay: `${i * 0.22}s` }} />
            ))}
          </div>
        )}

        {/* ── Analysing ── */}
        {analyzingResult && (
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '22px', marginTop: '64px',
            }}
          >
            <div style={{ display: 'flex', gap: '9px' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="dot" style={{ animationDelay: `${i * 0.22}s` }} />
              ))}
            </div>
            <p style={{ color: '#9aada5', fontSize: '0.875rem', letterSpacing: '0.04em' }}>
              Analysing your experiment...
            </p>
          </div>
        )}

        {!loading && !analyzingResult && (
          <>
            {/* ── Error ── */}
            {error && (
              <div
                className="w-full max-w-md mb-6"
                style={{
                  backgroundColor: '#fff8f6', borderRadius: '16px',
                  padding: '16px 20px', border: '1px solid #fdd5cc',
                }}
              >
                <p style={{ color: '#c0392b', fontSize: '0.875rem', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* ══ EMPTY STATE — Start Experiment ══ */}
            {!experiment && (
              <div className="w-full max-w-md fade-in-up">
                {/* Explainer */}
                <div
                  style={{
                    backgroundColor: '#edf5f0',
                    borderRadius: '18px',
                    padding: '20px 22px',
                    marginBottom: '28px',
                    border: '1px solid #c8ddd0',
                  }}
                >
                  <p
                    style={{
                      color: '#1e4d35',
                      fontSize: '0.875rem',
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    <strong>How it works:</strong> Pick something to test — like cutting out dairy, or taking a probiotic — and track it for 7–21 days. At the end, AI compares your symptoms before and during to give you a verdict.
                  </p>
                </div>

                {/* Form card */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '26px',
                    padding: '32px',
                    border: '1px solid #e4ddd2',
                    boxShadow: '0 6px 30px rgba(30,77,53,0.07)',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      color: '#1e4d35',
                      fontSize: '1.375rem',
                      fontWeight: 600,
                      margin: '0 0 24px',
                      lineHeight: 1.2,
                    }}
                  >
                    Start an Experiment
                  </h2>

                  {/* Name */}
                  <label
                    style={{ color: '#7a9185', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '8px' }}
                  >
                    Experiment name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cut out dairy for 2 weeks"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      border: '1px solid #e4ddd2',
                      borderRadius: '14px',
                      padding: '13px 16px',
                      fontSize: '0.9rem',
                      marginBottom: '20px',
                      fontFamily: 'inherit',
                      color: '#1e4d35',
                      backgroundColor: '#faf8f4',
                      boxSizing: 'border-box',
                      display: 'block',
                    }}
                  />

                  {/* Hypothesis */}
                  <label
                    style={{ color: '#7a9185', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '8px' }}
                  >
                    What are you testing?
                  </label>
                  <textarea
                    placeholder="e.g. I think dairy is causing my bloating. I'll avoid it completely and see if symptoms improve."
                    value={hypothesis}
                    onChange={(e) => setHypothesis(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      border: '1px solid #e4ddd2',
                      borderRadius: '14px',
                      padding: '13px 16px',
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
                  />

                  {/* Duration */}
                  <label
                    style={{ color: '#7a9185', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '10px' }}
                  >
                    Duration
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                    {([7, 14, 21] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className="duration-btn"
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          borderRadius: '100px',
                          border: duration === d ? '1px solid #1e4d35' : '1px solid #d0c9bf',
                          backgroundColor: duration === d ? '#1e4d35' : 'transparent',
                          color: duration === d ? '#f5f0e8' : '#7a9185',
                          fontSize: '0.8rem',
                          fontWeight: duration === d ? 600 : 400,
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        {d} days
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleStart}
                    disabled={submitting || !name.trim() || !hypothesis.trim()}
                    className="primary-btn"
                    style={{
                      width: '100%',
                      backgroundColor: submitting || !name.trim() || !hypothesis.trim() ? '#8eb8a3' : '#1e4d35',
                      color: '#f5f0e8',
                      borderRadius: '14px',
                      padding: '15px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: submitting || !name.trim() || !hypothesis.trim() ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {submitting ? 'Starting...' : 'Start Experiment →'}
                  </button>
                </div>
              </div>
            )}

            {/* ══ ACTIVE STATE ══ */}
            {experiment && experiment.status === 'active' && !isExpired && (
              <div className="w-full max-w-md fade-in-up">
                {/* Status badge */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <span
                    style={{
                      backgroundColor: '#edf5f0',
                      color: '#1e4d35',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      padding: '6px 16px',
                      borderRadius: '100px',
                      border: '1px solid #c8ddd0',
                    }}
                  >
                    ● Experiment Running
                  </span>
                </div>

                {/* Main card */}
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
                      fontSize: '1.375rem',
                      fontWeight: 600,
                      margin: '0 0 6px',
                      lineHeight: 1.2,
                    }}
                  >
                    {experiment.name}
                  </h2>
                  <p style={{ color: '#9aada5', fontSize: '0.8375rem', lineHeight: 1.6, margin: '0 0 28px' }}>
                    {experiment.hypothesis}
                  </p>

                  {/* Days remaining */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                    <span style={{ color: '#7a9185', fontSize: '0.8125rem', fontWeight: 500 }}>Progress</span>
                    <span
                      style={{
                        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                        color: '#1e4d35',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                      }}
                    >
                      {daysRemaining(experiment.end_date)}
                      <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#9aada5', marginLeft: '4px' }}>
                        days left
                      </span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e8f0eb',
                      borderRadius: '4px',
                      marginBottom: '28px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPercent(experiment.start_date, experiment.end_date)}%`,
                        backgroundColor: '#1e4d35',
                        borderRadius: '4px',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>

                  {/* Dates */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '28px',
                      paddingBottom: '24px',
                      borderBottom: '1px solid #f0ebe3',
                    }}
                  >
                    <div>
                      <p style={{ color: '#b8b0a4', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 3px' }}>
                        Started
                      </p>
                      <p style={{ color: '#1e4d35', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                        {new Date(experiment.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#b8b0a4', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 3px' }}>
                        Ends
                      </p>
                      <p style={{ color: '#1e4d35', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
                        {new Date(experiment.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  <p style={{ color: '#9aada5', fontSize: '0.8125rem', lineHeight: 1.6, margin: '0 0 20px', textAlign: 'center' }}>
                    Keep logging meals, symptoms and supplements as normal while the experiment runs.
                  </p>

                  <button
                    onClick={handleEnd}
                    className="danger-btn"
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      color: '#c0392b',
                      borderRadius: '14px',
                      padding: '13px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      border: '1px solid #fdd5cc',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    End experiment &amp; get verdict
                  </button>
                </div>
              </div>
            )}

            {/* ══ EXPIRED — can end ══ */}
            {experiment && experiment.status === 'active' && isExpired && (
              <div className="w-full max-w-md fade-in-up">
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '26px',
                    padding: '32px',
                    border: '1px solid #e4ddd2',
                    boxShadow: '0 6px 30px rgba(30,77,53,0.07)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '60px', height: '60px', borderRadius: '50%',
                      backgroundColor: '#edf5f0', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1e4d35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      color: '#1e4d35', fontSize: '1.375rem',
                      fontWeight: 600, margin: '0 0 10px',
                    }}
                  >
                    {experiment.name}
                  </h2>
                  <p style={{ color: '#9aada5', fontSize: '0.875rem', lineHeight: 1.65, margin: '0 0 28px' }}>
                    Your experiment period is complete. Ready to see the verdict?
                  </p>
                  <button
                    onClick={handleEnd}
                    className="primary-btn"
                    style={{
                      width: '100%',
                      backgroundColor: '#1e4d35',
                      color: '#f5f0e8',
                      borderRadius: '14px',
                      padding: '15px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Get AI Verdict →
                  </button>
                </div>
              </div>
            )}

            {/* ══ COMPLETED STATE ══ */}
            {experiment && experiment.status === 'completed' && result && (
              <div className="w-full max-w-md fade-in-up">
                {/* Verdict badge */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  {(() => {
                    const vs = VERDICT_STYLES[result.verdict]
                    return (
                      <span
                        style={{
                          backgroundColor: vs.bg,
                          color: vs.color,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '8px 20px',
                          borderRadius: '100px',
                          border: `1px solid ${vs.border}`,
                        }}
                      >
                        {vs.icon} {result.verdictLabel}
                      </span>
                    )
                  })()}
                </div>

                {/* Main result card */}
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
                      fontSize: '1.375rem',
                      fontWeight: 600,
                      margin: '0 0 16px',
                      lineHeight: 1.2,
                    }}
                  >
                    {experiment.name}
                  </h2>

                  <p style={{ color: '#2c3e30', fontSize: '0.9375rem', lineHeight: 1.7, margin: '0 0 24px' }}>
                    {result.summary}
                  </p>

                  {/* Before / During comparison */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginBottom: '24px',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#faf8f4',
                        borderRadius: '16px',
                        padding: '16px',
                        border: '1px solid #e4ddd2',
                      }}
                    >
                      <p style={{ color: '#b8b0a4', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                        Before
                      </p>
                      <p style={{ color: '#5a7a6a', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
                        {result.beforeHighlight}
                      </p>
                    </div>
                    <div
                      style={{
                        backgroundColor: '#faf8f4',
                        borderRadius: '16px',
                        padding: '16px',
                        border: '1px solid #e4ddd2',
                      }}
                    >
                      <p style={{ color: '#b8b0a4', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                        During
                      </p>
                      <p style={{ color: '#5a7a6a', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
                        {result.duringHighlight}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div
                    style={{
                      backgroundColor: '#edf5f0',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      border: '1px solid #c8ddd0',
                    }}
                  >
                    <p style={{ color: '#5a7a6a', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                      Next step
                    </p>
                    <p style={{ color: '#1e4d35', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                      {result.recommendation}
                    </p>
                  </div>
                </div>

                {/* Start new experiment */}
                <button
                  onClick={handleReset}
                  className="primary-btn"
                  style={{
                    width: '100%',
                    backgroundColor: '#1e4d35',
                    color: '#f5f0e8',
                    borderRadius: '14px',
                    padding: '15px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    letterSpacing: '0.02em',
                  }}
                >
                  Start a New Experiment →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
