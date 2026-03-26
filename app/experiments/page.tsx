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

interface ExperimentLog {
  id: string
  experiment_id: string
  user_id: string
  day_number: number
  note: string
  mood: string
  severity: number
  created_at: string
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

function totalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
}

function currentDayNumber(startDate: string): number {
  const start = new Date(startDate).getTime()
  const now = Date.now()
  return Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)) + 1)
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userInitial, setUserInitial] = useState('?')

  // New experiment form
  const [name, setName] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [duration, setDuration] = useState<7 | 14 | 21>(7)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Per-experiment state
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [deleteConfirming, setDeleteConfirming] = useState<string | null>(null)
  const [openLogId, setOpenLogId] = useState<string | null>(null)

  // Daily log form
  const [logMood, setLogMood] = useState<'Good' | 'Okay' | 'Bad' | ''>('')
  const [logSeverity, setLogSeverity] = useState(3)
  const [logNote, setLogNote] = useState('')
  const [loggingId, setLoggingId] = useState<string | null>(null)

  // Experiment daily logs keyed by experiment_id
  const [expLogs, setExpLogs] = useState<Record<string, ExperimentLog[]>>({})

  // Share overlay
  const [shareTarget, setShareTarget] = useState<{ experiment: Experiment; result: ExperimentResult } | null>(null)
  const [copyDone, setCopyDone] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const uid = user?.id ?? 'anonymous'
    setUserId(uid)
    if (user) setUserInitial((user.email?.[0] ?? '?').toUpperCase())

    const { data: exps } = await supabase
      .from('experiments')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    const list = (exps ?? []) as Experiment[]
    setExperiments(list)

    if (list.length > 0) {
      const ids = list.map(e => e.id)
      const { data: logs } = await supabase
        .from('experiment_logs')
        .select('*')
        .in('experiment_id', ids)
        .order('created_at', { ascending: false })

      const grouped: Record<string, ExperimentLog[]> = {}
      for (const log of (logs ?? []) as ExperimentLog[]) {
        if (!grouped[log.experiment_id]) grouped[log.experiment_id] = []
        grouped[log.experiment_id].push(log)
      }
      setExpLogs(grouped)
    }

    setLoading(false)
  }

  async function handleStart() {
    if (!name.trim() || !hypothesis.trim()) return
    setSubmitting(true)
    setFormError('')
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
    if (error) { setFormError('Could not start experiment. Please try again.'); return }
    setExperiments(prev => [data as Experiment, ...prev])
    setName('')
    setHypothesis('')
  }

  async function handleEndExperiment(experiment: Experiment) {
    setAnalyzingId(experiment.id)

    const today = new Date().toISOString().split('T')[0]
    await supabase.from('experiments').update({ end_date: today }).eq('id', experiment.id)

    const res = await fetch(`/api/experiment-result?experimentId=${experiment.id}`)
    const json = await res.json()

    setExperiments(prev =>
      prev.map(e =>
        e.id === experiment.id
          ? { ...e, status: 'completed', end_date: today, result: JSON.stringify(json) }
          : e
      )
    )
    setAnalyzingId(null)
  }

  async function handleDeleteClick(experimentId: string) {
    if (deleteConfirming !== experimentId) {
      setDeleteConfirming(experimentId)
      setTimeout(() => setDeleteConfirming(prev => prev === experimentId ? null : prev), 3000)
    } else {
      await supabase.from('experiments').delete().eq('id', experimentId)
      setExperiments(prev => prev.filter(e => e.id !== experimentId))
      setDeleteConfirming(null)
    }
  }

  function openLogForm(experimentId: string) {
    setOpenLogId(experimentId)
    setLogMood('')
    setLogSeverity(3)
    setLogNote('')
  }

  async function handleSaveLog(experiment: Experiment) {
    if (!userId) return
    setLoggingId(experiment.id)

    const { data, error } = await supabase
      .from('experiment_logs')
      .insert({
        experiment_id: experiment.id,
        user_id: userId,
        day_number: currentDayNumber(experiment.start_date),
        note: logNote.trim(),
        mood: logMood || 'Okay',
        severity: logSeverity,
      })
      .select()
      .single()

    setLoggingId(null)
    if (!error && data) {
      setExpLogs(prev => ({
        ...prev,
        [experiment.id]: [data as ExperimentLog, ...(prev[experiment.id] ?? [])],
      }))
    }
    setOpenLogId(null)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText('Check out my gut trigger discovery: gutbut-trigger-tool.vercel.app')
    setCopyDone(true)
    setTimeout(() => setCopyDone(false), 2000)
  }

  const activeExps = experiments.filter(e => e.status === 'active')
  const completedExps = experiments.filter(e => e.status === 'completed')

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
        .delete-btn { transition: color 0.15s ease, border-color 0.15s ease; }
        .delete-btn:hover { color: #c0392b !important; border-color: #fdd5cc !important; }
        .log-btn { transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
        .log-btn:hover { background-color: #1e4d35 !important; color: #f5f0e8 !important; border-color: #1e4d35 !important; }
        .share-btn { transition: background-color 0.18s ease, color 0.18s ease; }
        .share-btn:hover { background-color: #1e4d35 !important; color: #f5f0e8 !important; }
        .duration-btn { transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease; }
        textarea, input[type="text"] {
          outline: none;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        textarea:focus, input[type="text"]:focus {
          border-color: #1e4d35 !important;
          background-color: #ffffff !important;
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: #e4ddd2;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #1e4d35;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(30,77,53,0.25);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #1e4d35;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(30,77,53,0.25);
        }
        .overlay-copy-btn { transition: background-color 0.2s ease, transform 0.15s ease; }
        .overlay-copy-btn:hover { background-color: #163b28 !important; }
        .overlay-copy-btn:active { transform: scale(0.98); }
        .overlay-close-btn { transition: background-color 0.15s ease; }
        .overlay-close-btn:hover { background-color: rgba(255,255,255,0.12) !important; }

        @media (max-width: 640px) {
          .exp-header { flex-wrap: nowrap; align-items: center; }
          .exp-header-left { min-width: 0; }
          .exp-header-right { flex-shrink: 0; margin-left: 12px; }
          .share-card { margin: 0 16px; }
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
              <h1 style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35', fontSize: '2.25rem', fontWeight: 600,
                letterSpacing: '-0.01em', lineHeight: 1.15, margin: 0,
              }}>
                Experiments
              </h1>
              <p style={{
                color: '#7a9185', fontSize: '0.75rem', letterSpacing: '0.14em',
                textTransform: 'uppercase', marginTop: '5px', fontWeight: 400,
              }}>
                Test your triggers
              </p>
            </div>
            <div className="exp-header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link href="/log">
                <button
                  className="nav-btn"
                  style={{
                    backgroundColor: 'transparent', color: '#1e4d35',
                    fontSize: '0.8125rem', letterSpacing: '0.04em',
                    padding: '10px 22px', borderRadius: '100px',
                    border: '1px solid #c8bfb0', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 500,
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
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: '#1e4d35', color: '#f5f0e8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                    boxShadow: '0 2px 10px rgba(30,77,53,0.18)', flexShrink: 0,
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

        {!loading && (
          <div className="w-full max-w-md fade-in-up">

            {/* ══ ACTIVE EXPERIMENTS ══ */}
            {activeExps.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{
                  color: '#7a9185', fontSize: '0.7rem', fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px',
                }}>
                  Active · {activeExps.length}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeExps.map((exp) => {
                    const logs = expLogs[exp.id] ?? []
                    const lastLog = logs[0]
                    const total = totalDays(exp.start_date, exp.end_date)
                    const isAnalyzing = analyzingId === exp.id
                    const isLogOpen = openLogId === exp.id
                    const isConfirmingDelete = deleteConfirming === exp.id

                    return (
                      <div
                        key={exp.id}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '22px',
                          border: '1px solid #e4ddd2',
                          borderLeft: '4px solid #1e4d35',
                          boxShadow: '0 4px 20px rgba(30,77,53,0.07)',
                          overflow: 'hidden',
                        }}
                      >
                        {isAnalyzing ? (
                          <div style={{
                            padding: '36px', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: '16px',
                          }}>
                            <div style={{ display: 'flex', gap: '9px' }}>
                              {[0, 1, 2].map(i => (
                                <div key={i} className="dot" style={{ animationDelay: `${i * 0.22}s` }} />
                              ))}
                            </div>
                            <p style={{ color: '#9aada5', fontSize: '0.875rem', margin: 0 }}>
                              Analysing your experiment...
                            </p>
                          </div>
                        ) : (
                          <div style={{ padding: '24px' }}>
                            {/* Name + Active badge */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <h3 style={{
                                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                                color: '#1e4d35', fontSize: '1.125rem', fontWeight: 600,
                                margin: 0, lineHeight: 1.25, flex: 1, paddingRight: '12px',
                              }}>
                                {exp.name}
                              </h3>
                              <span style={{
                                backgroundColor: '#edf5f0', color: '#1e4d35',
                                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em',
                                textTransform: 'uppercase', padding: '4px 12px',
                                borderRadius: '100px', border: '1px solid #c8ddd0',
                                flexShrink: 0,
                              }}>
                                Active
                              </span>
                            </div>

                            {/* Progress */}
                            <div style={{ marginBottom: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                                <span style={{ color: '#9aada5', fontSize: '0.75rem' }}>Progress</span>
                                <span style={{ color: '#1e4d35', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {daysRemaining(exp.end_date)} days left
                                </span>
                              </div>
                              <div style={{
                                width: '100%', height: '6px', backgroundColor: '#e8f0eb',
                                borderRadius: '3px', overflow: 'hidden',
                              }}>
                                <div style={{
                                  height: '100%',
                                  width: `${progressPercent(exp.start_date, exp.end_date)}%`,
                                  backgroundColor: '#1e4d35', borderRadius: '3px',
                                  transition: 'width 0.6s ease',
                                }} />
                              </div>
                            </div>

                            {/* Log summary */}
                            <div style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              paddingTop: '12px', borderTop: '1px solid #f0ebe3', marginBottom: '16px',
                            }}>
                              <span style={{ color: '#9aada5', fontSize: '0.78rem' }}>
                                {logs.length} of {total} days logged
                              </span>
                              {lastLog && (
                                <span style={{ color: '#7a9185', fontSize: '0.78rem' }}>
                                  Last: {lastLog.mood} · {lastLog.severity}/5
                                </span>
                              )}
                            </div>

                            {/* Log today — button or inline form */}
                            {!isLogOpen ? (
                              <button
                                onClick={() => openLogForm(exp.id)}
                                className="log-btn"
                                style={{
                                  width: '100%', backgroundColor: 'transparent',
                                  color: '#1e4d35', borderRadius: '100px',
                                  padding: '11px', fontSize: '0.875rem', fontWeight: 500,
                                  border: '1px solid #1e4d35', cursor: 'pointer',
                                  fontFamily: 'inherit', marginBottom: '10px',
                                  letterSpacing: '0.01em',
                                }}
                              >
                                + Log Today's Entry
                              </button>
                            ) : (
                              <div style={{
                                backgroundColor: '#faf8f4', borderRadius: '16px',
                                padding: '20px', marginBottom: '10px',
                                border: '1px solid #e4ddd2',
                              }}>
                                {/* Mood */}
                                <p style={{ color: '#7a9185', fontSize: '0.78rem', fontWeight: 600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                  How are you feeling?
                                </p>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                                  {(['Good', 'Okay', 'Bad'] as const).map(m => (
                                    <button
                                      key={m}
                                      onClick={() => setLogMood(m)}
                                      style={{
                                        flex: 1, padding: '9px 0',
                                        borderRadius: '100px', fontFamily: 'inherit',
                                        fontSize: '0.8125rem', fontWeight: logMood === m ? 600 : 400,
                                        cursor: 'pointer',
                                        backgroundColor: logMood === m ? '#1e4d35' : 'transparent',
                                        color: logMood === m ? '#f5f0e8' : '#7a9185',
                                        border: logMood === m ? '1px solid #1e4d35' : '1px solid #d6cfc4',
                                        transition: 'all 0.15s ease',
                                      }}
                                    >
                                      {m === 'Good' ? '😊' : m === 'Okay' ? '😐' : '😔'} {m}
                                    </button>
                                  ))}
                                </div>

                                {/* Severity */}
                                <p style={{ color: '#7a9185', fontSize: '0.78rem', fontWeight: 600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                  Symptom severity:{' '}
                                  <span style={{ color: '#1e4d35', fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1rem' }}>
                                    {logSeverity}/5
                                  </span>
                                </p>
                                <input
                                  type="range"
                                  min={1} max={5} step={1}
                                  value={logSeverity}
                                  onChange={(e) => setLogSeverity(Number(e.target.value))}
                                  style={{ marginBottom: '18px' }}
                                />

                                {/* Note */}
                                <p style={{ color: '#7a9185', fontSize: '0.78rem', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                  What did you notice today?
                                </p>
                                <textarea
                                  placeholder="Any symptoms, changes, or observations..."
                                  value={logNote}
                                  onChange={(e) => setLogNote(e.target.value)}
                                  rows={2}
                                  style={{
                                    width: '100%', border: '1px solid #e4ddd2',
                                    borderRadius: '12px', padding: '11px 14px',
                                    fontSize: '0.875rem', fontFamily: 'inherit',
                                    color: '#1e4d35', backgroundColor: '#ffffff',
                                    resize: 'none', boxSizing: 'border-box',
                                    lineHeight: 1.6, display: 'block', marginBottom: '14px',
                                  }}
                                />

                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => setOpenLogId(null)}
                                    style={{
                                      flex: 1, backgroundColor: 'transparent', color: '#9aada5',
                                      borderRadius: '100px', padding: '10px', fontSize: '0.8125rem',
                                      fontWeight: 500, border: '1px solid #d6cfc4',
                                      cursor: 'pointer', fontFamily: 'inherit',
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveLog(exp)}
                                    disabled={loggingId === exp.id}
                                    className="primary-btn"
                                    style={{
                                      flex: 2,
                                      backgroundColor: loggingId === exp.id ? '#8eb8a3' : '#1e4d35',
                                      color: '#f5f0e8', borderRadius: '100px',
                                      padding: '10px', fontSize: '0.8125rem',
                                      fontWeight: 600, border: 'none',
                                      cursor: loggingId === exp.id ? 'not-allowed' : 'pointer',
                                      fontFamily: 'inherit',
                                    }}
                                  >
                                    {loggingId === exp.id ? 'Saving...' : 'Save Entry'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* End & get verdict */}
                            <button
                              onClick={() => handleEndExperiment(exp)}
                              className="danger-btn"
                              style={{
                                width: '100%', backgroundColor: 'transparent',
                                color: '#c0392b', borderRadius: '14px',
                                padding: '11px', fontSize: '0.8125rem', fontWeight: 500,
                                border: '1px solid #fdd5cc', cursor: 'pointer',
                                fontFamily: 'inherit', marginBottom: '8px',
                              }}
                            >
                              End &amp; Get Verdict
                            </button>

                            <button
                              onClick={() => handleDeleteClick(exp.id)}
                              className="delete-btn"
                              style={{
                                width: '100%', backgroundColor: 'transparent',
                                color: isConfirmingDelete ? '#c0392b' : '#c0a8a0',
                                borderRadius: '14px', padding: '9px',
                                fontSize: '0.8rem', fontWeight: 500,
                                border: `1px solid ${isConfirmingDelete ? '#fdd5cc' : '#e8e0d8'}`,
                                cursor: 'pointer', fontFamily: 'inherit',
                                transition: 'color 0.15s ease, border-color 0.15s ease',
                              }}
                            >
                              {isConfirmingDelete ? 'Are you sure? Click again to delete' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ══ COMPLETED EXPERIMENTS ══ */}
            {completedExps.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{
                  color: '#7a9185', fontSize: '0.7rem', fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px',
                }}>
                  Completed · {completedExps.length}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {completedExps.map((exp) => {
                    let result: ExperimentResult | null = null
                    try { result = exp.result ? JSON.parse(exp.result) : null } catch { /* ignore */ }
                    const vs = result ? VERDICT_STYLES[result.verdict] : null
                    const isConfirmingDelete = deleteConfirming === exp.id

                    return (
                      <div
                        key={exp.id}
                        style={{
                          backgroundColor: '#ffffff', borderRadius: '22px',
                          border: '1px solid #e4ddd2',
                          boxShadow: '0 4px 20px rgba(30,77,53,0.05)',
                          padding: '24px',
                        }}
                      >
                        {/* Name + verdict badge */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <h3 style={{
                            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                            color: '#1e4d35', fontSize: '1.125rem', fontWeight: 600,
                            margin: 0, lineHeight: 1.25, flex: 1, paddingRight: '12px',
                          }}>
                            {exp.name}
                          </h3>
                          {vs && result && (
                            <span style={{
                              backgroundColor: vs.bg, color: vs.color,
                              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                              textTransform: 'uppercase', padding: '4px 12px',
                              borderRadius: '100px', border: `1px solid ${vs.border}`,
                              flexShrink: 0,
                            }}>
                              {vs.icon} {result.verdictLabel}
                            </span>
                          )}
                        </div>

                        {/* Summary */}
                        {result && (
                          <p style={{ color: '#7a9185', fontSize: '0.8375rem', lineHeight: 1.6, margin: '0 0 12px' }}>
                            {result.summary}
                          </p>
                        )}

                        {/* Dates */}
                        <p style={{ color: '#b8b0a4', fontSize: '0.75rem', margin: '0 0 16px' }}>
                          {new Date(exp.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {' – '}
                          {new Date(exp.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>

                        {result && (
                          <button
                            onClick={() => setShareTarget({ experiment: exp, result })}
                            className="share-btn"
                            style={{
                              width: '100%', backgroundColor: 'transparent', color: '#1e4d35',
                              borderRadius: '100px', padding: '11px', fontSize: '0.875rem',
                              fontWeight: 500, border: '1px solid #1e4d35',
                              cursor: 'pointer', fontFamily: 'inherit', marginBottom: '8px',
                              letterSpacing: '0.01em',
                            }}
                          >
                            Share Result ↗
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteClick(exp.id)}
                          className="delete-btn"
                          style={{
                            width: '100%', backgroundColor: 'transparent',
                            color: isConfirmingDelete ? '#c0392b' : '#c0a8a0',
                            borderRadius: '14px', padding: '9px',
                            fontSize: '0.8rem', fontWeight: 500,
                            border: `1px solid ${isConfirmingDelete ? '#fdd5cc' : '#e8e0d8'}`,
                            cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'color 0.15s ease, border-color 0.15s ease',
                          }}
                        >
                          {isConfirmingDelete ? 'Are you sure? Click again to delete' : 'Delete'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ══ EMPTY STATE howto ══ */}
            {experiments.length === 0 && (
              <div style={{
                backgroundColor: '#edf5f0', borderRadius: '18px',
                padding: '20px 22px', marginBottom: '28px',
                border: '1px solid #c8ddd0',
              }}>
                <p style={{ color: '#1e4d35', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                  <strong>How it works:</strong> Pick something to test — like cutting out dairy, or taking a probiotic — and track it for 7–21 days. Log a daily entry each day, then at the end AI compares your symptoms before and during to give you a verdict.
                </p>
              </div>
            )}

            {/* ══ START NEW EXPERIMENT ══ */}
            <div>
              {experiments.length > 0 && (
                <p style={{
                  color: '#7a9185', fontSize: '0.7rem', fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px',
                }}>
                  Start New
                </p>
              )}
              <div style={{
                backgroundColor: '#ffffff', borderRadius: '26px', padding: '32px',
                border: '1px solid #e4ddd2', boxShadow: '0 6px 30px rgba(30,77,53,0.07)',
              }}>
                <h2 style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35', fontSize: '1.375rem', fontWeight: 600,
                  margin: '0 0 24px', lineHeight: 1.2,
                }}>
                  {experiments.length === 0 ? 'Start an Experiment' : 'New Experiment'}
                </h2>

                {formError && (
                  <div style={{
                    backgroundColor: '#fff8f6', borderRadius: '12px',
                    padding: '12px 16px', border: '1px solid #fdd5cc', marginBottom: '20px',
                  }}>
                    <p style={{ color: '#c0392b', fontSize: '0.8375rem', margin: 0 }}>{formError}</p>
                  </div>
                )}

                <label style={{ color: '#7a9185', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  Experiment name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cut out dairy for 2 weeks"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%', border: '1px solid #e4ddd2', borderRadius: '14px',
                    padding: '13px 16px', fontSize: '0.9rem', marginBottom: '20px',
                    fontFamily: 'inherit', color: '#1e4d35', backgroundColor: '#faf8f4',
                    boxSizing: 'border-box', display: 'block',
                  }}
                />

                <label style={{ color: '#7a9185', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  What are you testing?
                </label>
                <textarea
                  placeholder="e.g. I think dairy is causing my bloating. I'll avoid it completely and see if symptoms improve."
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%', border: '1px solid #e4ddd2', borderRadius: '14px',
                    padding: '13px 16px', fontSize: '0.9rem', marginBottom: '20px',
                    fontFamily: 'inherit', color: '#1e4d35', backgroundColor: '#faf8f4',
                    resize: 'none', boxSizing: 'border-box', lineHeight: 1.65, display: 'block',
                  }}
                />

                <label style={{ color: '#7a9185', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '10px' }}>
                  Duration
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                  {([7, 14, 21] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className="duration-btn"
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: '100px',
                        border: duration === d ? '1px solid #1e4d35' : '1px solid #d0c9bf',
                        backgroundColor: duration === d ? '#1e4d35' : 'transparent',
                        color: duration === d ? '#f5f0e8' : '#7a9185',
                        fontSize: '0.8rem', fontWeight: duration === d ? 600 : 400,
                        fontFamily: 'inherit', cursor: 'pointer',
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
                    color: '#f5f0e8', borderRadius: '14px', padding: '15px',
                    fontSize: '0.9375rem', fontWeight: 600, border: 'none',
                    cursor: submitting || !name.trim() || !hypothesis.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', letterSpacing: '0.02em',
                  }}
                >
                  {submitting ? 'Starting...' : 'Start Experiment →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Share Overlay ── */}
      {shareTarget && (() => {
        const { experiment: exp, result } = shareTarget
        const vs = VERDICT_STYLES[result.verdict]
        return (
          <div
            onClick={() => setShareTarget(null)}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: 'rgba(10, 24, 16, 0.72)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: '24px 16px',
            }}
          >
            <div
              className="share-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff', borderRadius: '26px',
                padding: '32px 28px 28px', width: '100%', maxWidth: '380px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)', marginBottom: '16px',
              }}
            >
              <p style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35', fontSize: '1.5rem', fontWeight: 600,
                letterSpacing: '-0.01em', margin: '0 0 20px', textAlign: 'center',
              }}>
                GutBut
              </p>
              <h3 style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35', fontSize: '1.1875rem', fontWeight: 600,
                margin: '0 0 16px', lineHeight: 1.25, textAlign: 'center',
              }}>
                {exp.name}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <span style={{
                  backgroundColor: vs.bg, color: vs.color,
                  fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '7px 18px',
                  borderRadius: '100px', border: `1px solid ${vs.border}`,
                }}>
                  {vs.icon} {result.verdictLabel}
                </span>
              </div>
              <p style={{
                color: '#5a7a6a', fontSize: '0.875rem', lineHeight: 1.65,
                margin: '0 0 20px', textAlign: 'center',
              }}>
                {result.summary}
              </p>
              <div style={{ height: '1px', backgroundColor: '#f0ebe3', marginBottom: '16px' }} />
              <p style={{ color: '#b8b0a4', fontSize: '0.75rem', textAlign: 'center', margin: 0, lineHeight: 1.55 }}>
                Discovered with GutBut Trigger Tool<br />
                <span style={{ color: '#9aada5' }}>gutbut-trigger-tool.vercel.app</span>
              </p>
            </div>

            <p style={{
              color: 'rgba(255,255,255,0.65)', fontSize: '0.8125rem',
              textAlign: 'center', margin: '0 0 16px',
            }}>
              Screenshot this card to share on WhatsApp or Instagram
            </p>

            <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '380px' }}>
              <button
                onClick={() => setShareTarget(null)}
                className="overlay-close-btn"
                style={{
                  flex: 1, backgroundColor: 'transparent', color: '#ffffff',
                  borderRadius: '100px', padding: '13px', fontSize: '0.9375rem',
                  fontWeight: 500, border: '1px solid rgba(255,255,255,0.35)',
                  cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em',
                }}
              >
                Close
              </button>
              <button
                onClick={handleCopyLink}
                className="overlay-copy-btn"
                style={{
                  flex: 1, backgroundColor: '#1e4d35', color: '#f5f0e8',
                  borderRadius: '100px', padding: '13px', fontSize: '0.9375rem',
                  fontWeight: 600, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.02em',
                }}
              >
                {copyDone ? 'Copied ✓' : 'Copy Link'}
              </button>
            </div>
          </div>
        )
      })()}
    </>
  )
}
