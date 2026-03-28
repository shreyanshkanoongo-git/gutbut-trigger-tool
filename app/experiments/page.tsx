'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AppHeader from '../components/AppHeader'

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
  before_severity?: number
  during_severity?: number
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
  string,
  { bg: string; color: string; border: string; borderLeft: string }
> = {
  confirmed_trigger: { bg: '#fde8e8', color: '#c0392b', border: 'rgba(192,57,43,0.2)', borderLeft: '#c0392b' },
  not_a_trigger:     { bg: '#e8f5e9', color: '#2e7d32', border: 'rgba(46,125,50,0.2)',  borderLeft: '#2e7d32' },
  inconclusive:      { bg: '#fef3e2', color: '#b7770d', border: 'rgba(183,119,13,0.2)', borderLeft: '#b7770d' },
}
const VERDICT_FALLBACK = { bg: '#fef3e2', color: '#b7770d', border: 'rgba(183,119,13,0.2)', borderLeft: '#b7770d' }

function getVerdictStyle(verdict: string | undefined) {
  return (verdict && VERDICT_STYLES[verdict]) ? VERDICT_STYLES[verdict] : VERDICT_FALLBACK
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

  const [name, setName] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [duration, setDuration] = useState<7 | 14 | 21>(7)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [fetchingVerdictId, setFetchingVerdictId] = useState<string | null>(null)
  const [verdictError, setVerdictError] = useState<string | null>(null)
  const [deleteConfirming, setDeleteConfirming] = useState<string | null>(null)
  const [openLogId, setOpenLogId] = useState<string | null>(null)

  const [logMood, setLogMood] = useState<'Good' | 'Okay' | 'Bad' | ''>('')
  const [logSeverity, setLogSeverity] = useState(3)
  const [logNote, setLogNote] = useState('')
  const [loggingId, setLoggingId] = useState<string | null>(null)

  const [expLogs, setExpLogs] = useState<Record<string, ExperimentLog[]>>({})

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

  async function handleFetchVerdict(experiment: Experiment) {
    setVerdictError(null)
    setFetchingVerdictId(experiment.id)
    try {
      const res = await fetch(`/api/experiment-result?experimentId=${experiment.id}`)
      const json = await res.json()
      if (json.error) { setVerdictError(`Could not get verdict: ${json.error}`); return }
      const resultStr = JSON.stringify(json)
      await supabase.from('experiments').update({ result: resultStr }).eq('id', experiment.id)
      setExperiments(prev =>
        prev.map(e => e.id === experiment.id ? { ...e, result: resultStr } : e)
      )
    } catch {
      setVerdictError('Something went wrong. Please try again.')
    } finally {
      setFetchingVerdictId(null)
    }
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid rgba(30,77,53,0.15)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '13px',
    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
    color: '#1a1a18',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    display: 'block',
    outline: 'none',
    marginBottom: '12px',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#8a8a7e',
    marginBottom: '6px',
    display: 'block',
    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
  }

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
        .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background-color: #1e4d35;
          animation: pulseDot 1.5s ease-in-out infinite;
        }
        textarea, input[type="text"], input[type="range"] {
          outline: none;
          transition: border-color 0.2s ease;
        }
        textarea:focus, input[type="text"]:focus {
          border-color: rgba(30,77,53,0.4) !important;
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          background: rgba(30,77,53,0.12);
          height: 4px;
          border-radius: 2px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #1e4d35;
          margin-top: -7px;
          box-shadow: 0 2px 6px rgba(30,77,53,0.25);
        }
        .outline-btn { transition: background-color 0.2s ease; }
        .outline-btn:not(:disabled):hover { background-color: rgba(30,77,53,0.04) !important; }
        .share-btn { transition: background-color 0.15s ease; }
        .share-btn:hover { background-color: rgba(30,77,53,0.04) !important; }
        .delete-link { transition: color 0.15s ease; }
        .delete-link:hover { color: #c0392b !important; }
        .duration-btn { transition: all 0.15s ease; }
        @media (max-width: 640px) {
          .share-card { margin: 0 16px; }
        }
      `}</style>

      <AppHeader pageName="Experiments" userInitial={userInitial} />

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

          {/* Page title */}
          <h1
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              color: '#1e4d35',
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              margin: '0 0 4px',
              lineHeight: 1.15,
            }}
          >
            Experiments
          </h1>
          <p style={{ color: '#8a8a7e', fontSize: '13px', margin: '0 0 24px' }}>
            Test your triggers, find your patterns
          </p>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', gap: '9px', marginTop: '40px', justifyContent: 'center' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="dot" style={{ animationDelay: `${i * 0.22}s` }} />
              ))}
            </div>
          )}

          {!loading && (
            <div className="fade-in-up">

              {/* ══ ACTIVE EXPERIMENTS ══ */}
              {activeExps.map((exp) => {
                const logs = expLogs[exp.id] ?? []
                const lastLog = logs[0]
                const total = totalDays(exp.start_date, exp.end_date)
                const dayNum = currentDayNumber(exp.start_date)
                const daysLeft = daysRemaining(exp.end_date)
                const progress = progressPercent(exp.start_date, exp.end_date)
                const isAnalyzing = analyzingId === exp.id
                const isLogOpen = openLogId === exp.id
                const isConfirmingDelete = deleteConfirming === exp.id

                return (
                  <div
                    key={exp.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid rgba(30,77,53,0.12)',
                      borderLeft: '4px solid #1e4d35',
                      padding: '24px',
                      marginBottom: '16px',
                      boxShadow: '0 2px 8px rgba(30,77,53,0.05)',
                    }}
                  >
                    {isAnalyzing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '12px 0' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[0, 1, 2].map(i => (
                            <div key={i} className="dot" style={{ animationDelay: `${i * 0.22}s` }} />
                          ))}
                        </div>
                        <p style={{ color: '#8a8a7e', fontSize: '13px', margin: 0 }}>Analysing your experiment...</p>
                      </div>
                    ) : (
                      <>
                        {/* Name + badge */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <h3
                            style={{
                              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                              color: '#1a1a18', fontSize: '20px', fontWeight: 700,
                              margin: 0, lineHeight: 1.2, flex: 1, paddingRight: '12px',
                            }}
                          >
                            {exp.name}
                          </h3>
                          <span
                            style={{
                              backgroundColor: 'rgba(30,77,53,0.08)', color: '#1e4d35',
                              borderRadius: '100px', padding: '4px 12px',
                              fontSize: '10px', fontWeight: 600,
                              flexShrink: 0, letterSpacing: '0.04em',
                            }}
                          >
                            ACTIVE
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div style={{ marginBottom: '14px' }}>
                          <div
                            style={{
                              height: '6px', backgroundColor: '#f5f0e8',
                              borderRadius: '100px', overflow: 'hidden', marginBottom: '6px',
                            }}
                          >
                            <div
                              style={{
                                height: '100%', width: `${progress}%`,
                                backgroundColor: '#1e4d35', borderRadius: '100px',
                                transition: 'width 0.6s ease',
                              }}
                            />
                          </div>
                          <p style={{ fontSize: '11px', color: '#8a8a7e', margin: 0 }}>
                            Day {dayNum} of {total} · {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                          </p>
                        </div>

                        {/* Log count */}
                        <div
                          style={{
                            display: 'flex', justifyContent: 'space-between',
                            paddingTop: '12px', borderTop: '1px solid rgba(30,77,53,0.06)',
                            marginBottom: '14px',
                          }}
                        >
                          <span style={{ color: '#8a8a7e', fontSize: '12px' }}>
                            {logs.length} of {total} days logged
                          </span>
                          {lastLog && (
                            <span style={{ color: '#5a5a52', fontSize: '12px' }}>
                              Last: {lastLog.mood} · {lastLog.severity}/5
                            </span>
                          )}
                        </div>

                        {/* Log form or button */}
                        {!isLogOpen ? (
                          <button
                            onClick={() => openLogForm(exp.id)}
                            className="outline-btn"
                            style={{
                              width: '100%', backgroundColor: '#ffffff',
                              color: '#1e4d35', border: '1.5px solid #1e4d35',
                              borderRadius: '100px', padding: '10px',
                              fontSize: '13px', fontWeight: 600,
                              cursor: 'pointer', fontFamily: 'inherit',
                              marginBottom: '8px',
                            }}
                          >
                            + Log Today's Entry
                          </button>
                        ) : (
                          <div
                            style={{
                              backgroundColor: '#f5f0e8', borderRadius: '12px',
                              padding: '16px', marginBottom: '10px',
                            }}
                          >
                            <p style={{ color: '#5a5a52', fontSize: '11px', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              How are you feeling?
                            </p>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                              {(['Good', 'Okay', 'Bad'] as const).map(m => (
                                <button
                                  key={m}
                                  onClick={() => setLogMood(m)}
                                  style={{
                                    flex: 1, padding: '8px 0',
                                    borderRadius: '100px', fontFamily: 'inherit',
                                    fontSize: '12px', fontWeight: logMood === m ? 600 : 400,
                                    cursor: 'pointer',
                                    backgroundColor: logMood === m ? '#1e4d35' : '#ffffff',
                                    color: logMood === m ? '#ffffff' : '#8a8a7e',
                                    border: logMood === m ? '1px solid #1e4d35' : '1px solid rgba(30,77,53,0.15)',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  {m === 'Good' ? '😊' : m === 'Okay' ? '😐' : '😔'} {m}
                                </button>
                              ))}
                            </div>
                            <p style={{ color: '#5a5a52', fontSize: '11px', fontWeight: 600, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              Severity: {logSeverity}/5
                            </p>
                            <input
                              type="range" min={1} max={5} step={1}
                              value={logSeverity}
                              onChange={(e) => setLogSeverity(Number(e.target.value))}
                              style={{ marginBottom: '14px' }}
                            />
                            <textarea
                              placeholder="Any observations today..."
                              value={logNote}
                              onChange={(e) => setLogNote(e.target.value)}
                              rows={2}
                              style={{
                                width: '100%', border: '1px solid rgba(30,77,53,0.15)',
                                borderRadius: '10px', padding: '10px 14px',
                                fontSize: '13px', fontFamily: 'inherit',
                                color: '#1a1a18', backgroundColor: '#ffffff',
                                resize: 'none', boxSizing: 'border-box',
                                lineHeight: 1.55, display: 'block', marginBottom: '10px',
                              }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => setOpenLogId(null)}
                                style={{
                                  flex: 1, backgroundColor: 'transparent', color: '#8a8a7e',
                                  borderRadius: '100px', padding: '9px',
                                  fontSize: '12px', fontWeight: 500,
                                  border: '1px solid rgba(30,77,53,0.15)',
                                  cursor: 'pointer', fontFamily: 'inherit',
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveLog(exp)}
                                disabled={loggingId === exp.id}
                                className="outline-btn"
                                style={{
                                  flex: 2, backgroundColor: '#ffffff',
                                  color: '#1e4d35', border: '1.5px solid #1e4d35',
                                  borderRadius: '100px', padding: '9px',
                                  fontSize: '12px', fontWeight: 600,
                                  cursor: loggingId === exp.id ? 'not-allowed' : 'pointer',
                                  fontFamily: 'inherit', opacity: loggingId === exp.id ? 0.6 : 1,
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
                          style={{
                            width: '100%', backgroundColor: 'transparent',
                            color: '#c0392b', borderRadius: '10px',
                            padding: '10px', fontSize: '12px', fontWeight: 500,
                            border: '1px solid rgba(192,57,43,0.25)', cursor: 'pointer',
                            fontFamily: 'inherit', marginBottom: '6px',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(192,57,43,0.04)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          End &amp; Get Verdict
                        </button>

                        <button
                          onClick={() => handleDeleteClick(exp.id)}
                          className="delete-link"
                          style={{
                            background: 'transparent', border: 'none',
                            color: isConfirmingDelete ? '#c0392b' : '#b0aca6',
                            fontSize: '12px', cursor: 'pointer',
                            fontFamily: 'inherit', display: 'block',
                            width: '100%', textAlign: 'center',
                            padding: '4px',
                          }}
                        >
                          {isConfirmingDelete ? 'Are you sure? Click again to delete' : 'Delete'}
                        </button>
                      </>
                    )}
                  </div>
                )
              })}

              {/* ══ COMPLETED EXPERIMENTS ══ */}
              {completedExps.map((exp) => {
                let result: ExperimentResult | null = null
                try { result = exp.result ? JSON.parse(exp.result) : null } catch { /* ignore */ }
                const vs = result ? getVerdictStyle(result.verdict) : null
                const isConfirmingDelete = deleteConfirming === exp.id
                const beforeSev = result?.before_severity ?? 4
                const duringSev = result?.during_severity ?? 1

                return (
                  <div
                    key={exp.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid rgba(30,77,53,0.07)',
                      borderLeft: `4px solid ${vs?.borderLeft ?? '#b7770d'}`,
                      padding: '24px',
                      marginBottom: '16px',
                      boxShadow: '0 2px 12px rgba(30,77,53,0.06)',
                    }}
                  >
                    {/* Name + verdict badge */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h3
                        style={{
                          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                          color: '#1a1a18', fontSize: '20px', fontWeight: 700,
                          margin: 0, lineHeight: 1.2, flex: 1, paddingRight: '12px',
                        }}
                      >
                        {exp.name}
                      </h3>
                      {vs && result && (
                        <span
                          style={{
                            backgroundColor: vs.bg, color: vs.color,
                            border: `1px solid ${vs.border}`,
                            borderRadius: '100px', padding: '4px 14px',
                            fontSize: '11px', fontWeight: 600,
                            flexShrink: 0, whiteSpace: 'nowrap',
                          }}
                        >
                          {result.verdictLabel}
                        </span>
                      )}
                    </div>

                    {/* Confirmed trigger line */}
                    {result?.verdict === 'confirmed_trigger' && (
                      <p
                        style={{
                          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                          fontStyle: 'italic',
                          fontSize: '16px',
                          color: '#c0392b',
                          margin: '6px 0 14px',
                        }}
                      >
                        {exp.name} is a confirmed gut trigger for you.
                      </p>
                    )}

                    {/* Summary */}
                    {result && (
                      <p style={{ color: '#5a5a52', fontSize: '13px', lineHeight: 1.7, margin: '0 0 16px' }}>
                        {result.summary}
                      </p>
                    )}

                    {/* Before / After bars */}
                    {result && (
                      <div style={{ marginBottom: '12px' }}>
                        {[
                          { label: 'Before', sev: beforeSev, fillColor: '#c0392b' },
                          { label: 'During', sev: duringSev, fillColor: '#27ae60' },
                        ].map(({ label, sev, fillColor }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#8a8a7e', width: '52px', flexShrink: 0 }}>
                              {label}
                            </span>
                            <div
                              style={{
                                flex: 1, height: '8px', backgroundColor: '#f5f0e8',
                                borderRadius: '100px', overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%', width: `${(sev / 5) * 100}%`,
                                  backgroundColor: fillColor, borderRadius: '100px',
                                  transition: 'width 0.6s ease',
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: '12px', fontWeight: 600,
                                color: fillColor, width: '20px',
                                textAlign: 'right', flexShrink: 0,
                              }}
                            >
                              {sev}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Date range */}
                    <p style={{ fontSize: '11px', color: '#8a8a7e', margin: '0 0 16px' }}>
                      {new Date(exp.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {' – '}
                      {new Date(exp.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>

                    {result ? (
                      <button
                        onClick={() => setShareTarget({ experiment: exp, result })}
                        className="share-btn"
                        style={{
                          width: '100%', backgroundColor: '#ffffff', color: '#1e4d35',
                          border: '1px solid rgba(30,77,53,0.2)', borderRadius: '100px',
                          padding: '10px 24px', fontSize: '13px', fontWeight: 500,
                          cursor: 'pointer', fontFamily: 'inherit', marginBottom: '8px',
                        }}
                      >
                        Share Result ↗
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleFetchVerdict(exp)}
                          disabled={fetchingVerdictId === exp.id}
                          className="outline-btn"
                          style={{
                            width: '100%', backgroundColor: '#ffffff', color: '#1e4d35',
                            border: '1.5px solid #1e4d35', borderRadius: '100px',
                            padding: '10px', fontSize: '13px', fontWeight: 600,
                            cursor: fetchingVerdictId === exp.id ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', marginBottom: '8px',
                            opacity: fetchingVerdictId === exp.id ? 0.6 : 1,
                          }}
                        >
                          {fetchingVerdictId === exp.id ? 'Analysing...' : 'Get AI Verdict →'}
                        </button>
                        {verdictError && (
                          <p style={{ color: '#c0392b', fontSize: '12px', margin: '0 0 8px', textAlign: 'center' }}>
                            {verdictError}
                          </p>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => handleDeleteClick(exp.id)}
                      className="delete-link"
                      style={{
                        background: 'transparent', border: 'none',
                        color: isConfirmingDelete ? '#c0392b' : '#b0aca6',
                        fontSize: '12px', cursor: 'pointer',
                        fontFamily: 'inherit', display: 'block',
                        width: '100%', textAlign: 'center', padding: '4px',
                      }}
                    >
                      {isConfirmingDelete ? 'Are you sure? Click again to delete' : 'Delete'}
                    </button>
                  </div>
                )
              })}

              {/* ══ EMPTY STATE ══ */}
              {experiments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
                  <p
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      fontStyle: 'italic',
                      fontSize: '22px',
                      color: '#1e4d35',
                      margin: '0 0 8px',
                    }}
                  >
                    Start your first experiment
                  </p>
                  <p style={{ color: '#8a8a7e', fontSize: '13px', margin: '0 0 24px', lineHeight: 1.6 }}>
                    Pick something to test — like cutting dairy or taking a probiotic — and track it for 7–21 days.
                  </p>
                </div>
              )}

              {/* ══ NEW EXPERIMENT FORM ══ */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(30,77,53,0.07)',
                  boxShadow: '0 2px 8px rgba(30,77,53,0.05)',
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                    fontStyle: 'italic',
                    color: '#1e4d35',
                    fontSize: '20px',
                    fontWeight: 600,
                    margin: '0 0 20px',
                    lineHeight: 1.2,
                  }}
                >
                  {experiments.length === 0 ? 'Start an experiment' : 'New experiment'}
                </h2>

                {formError && (
                  <div
                    style={{
                      backgroundColor: '#fff8f6', borderRadius: '10px',
                      padding: '10px 14px', border: '1px solid rgba(192,57,43,0.2)',
                      marginBottom: '14px',
                    }}
                  >
                    <p style={{ color: '#c0392b', fontSize: '13px', margin: 0 }}>{formError}</p>
                  </div>
                )}

                <label style={labelStyle}>Experiment name</label>
                <input
                  type="text"
                  placeholder="e.g. Cut out dairy for 2 weeks"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />

                <label style={labelStyle}>What are you testing?</label>
                <textarea
                  placeholder="e.g. I think dairy is causing my bloating. I'll avoid it completely and see if symptoms improve."
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'none',
                    lineHeight: 1.6,
                    minHeight: '80px',
                  }}
                />

                <label style={labelStyle}>Duration</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  {([7, 14, 21] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className="duration-btn"
                      style={{
                        flex: 1, padding: '9px 0',
                        borderRadius: '100px', fontFamily: 'inherit',
                        border: duration === d ? '1px solid #1e4d35' : '1px solid rgba(30,77,53,0.15)',
                        backgroundColor: duration === d ? '#1e4d35' : 'transparent',
                        color: duration === d ? '#ffffff' : '#8a8a7e',
                        fontSize: '12px', fontWeight: duration === d ? 600 : 400,
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
                  className="outline-btn"
                  style={{
                    width: '100%', backgroundColor: '#ffffff',
                    color: '#1e4d35', border: '1.5px solid #1e4d35',
                    borderRadius: '100px', padding: '13px',
                    fontSize: '14px', fontWeight: 600,
                    cursor: submitting || !name.trim() || !hypothesis.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: submitting || !name.trim() || !hypothesis.trim() ? 0.45 : 1,
                  }}
                >
                  {submitting ? 'Starting...' : 'Start Experiment →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Share Overlay ── */}
      {shareTarget && (() => {
        const { experiment: exp } = shareTarget
        let parsed: ExperimentResult
        try {
          const raw = shareTarget.result
          parsed = typeof raw === 'string' ? JSON.parse(raw) : (raw as ExperimentResult)
        } catch {
          parsed = { verdict: 'inconclusive', verdictLabel: 'Inconclusive', summary: 'Analysis complete', beforeHighlight: '', duringHighlight: '', recommendation: '' }
        }
        const verdict = parsed?.verdict || 'inconclusive'
        const verdictLabel = parsed?.verdictLabel || 'Inconclusive'
        const summary = parsed?.summary || 'Analysis complete'
        const vs = getVerdictStyle(verdict)
        return (
          <div
            onClick={() => setShareTarget(null)}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: 'rgba(10,24,16,0.72)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: '24px 16px',
            }}
          >
            <div
              className="share-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff', borderRadius: '24px',
                padding: '32px 28px 28px', width: '100%', maxWidth: '380px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)', marginBottom: '16px',
              }}
            >
              <p style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35', fontSize: '1.5rem', fontWeight: 700,
                margin: '0 0 20px', textAlign: 'center',
              }}>
                GutBut
              </p>
              <h3 style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1a1a18', fontSize: '1.1875rem', fontWeight: 700,
                margin: '0 0 16px', lineHeight: 1.25, textAlign: 'center',
              }}>
                {exp.name}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <span style={{
                  backgroundColor: vs.bg, color: vs.color,
                  fontSize: '0.75rem', fontWeight: 700,
                  padding: '7px 18px', borderRadius: '100px',
                  border: `1px solid ${vs.border}`,
                }}>
                  {verdictLabel}
                </span>
              </div>
              <p style={{ color: '#5a5a52', fontSize: '0.875rem', lineHeight: 1.65, margin: '0 0 20px', textAlign: 'center' }}>
                {summary}
              </p>
              <div style={{ height: '1px', backgroundColor: 'rgba(30,77,53,0.06)', marginBottom: '16px' }} />
              <p style={{ color: '#b0aca6', fontSize: '0.75rem', textAlign: 'center', margin: 0, lineHeight: 1.55 }}>
                Discovered with GutBut Trigger Tool<br />
                <span style={{ color: '#8a8a7e' }}>gutbut-trigger-tool.vercel.app</span>
              </p>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', textAlign: 'center', margin: '0 0 16px' }}>
              Screenshot this card to share on WhatsApp or Instagram
            </p>

            <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '380px' }}>
              <button
                onClick={() => setShareTarget(null)}
                style={{
                  flex: 1, backgroundColor: 'transparent', color: '#ffffff',
                  borderRadius: '100px', padding: '13px', fontSize: '14px',
                  fontWeight: 500, border: '1px solid rgba(255,255,255,0.35)',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Close
              </button>
              <button
                onClick={handleCopyLink}
                style={{
                  flex: 1, backgroundColor: '#1e4d35', color: '#f5f0e8',
                  borderRadius: '100px', padding: '13px', fontSize: '14px',
                  fontWeight: 600, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
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
