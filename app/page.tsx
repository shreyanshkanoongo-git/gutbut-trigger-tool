'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

type LogType = 'meal' | 'symptom' | 'sleep' | 'stress'

export default function Home() {
  const [activeLog, setActiveLog] = useState<LogType | null>(null)
  const [content, setContent] = useState('')
  const [severity, setSeverity] = useState(3)
  const [hours, setHours] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const { error } = await supabase.from('logs').insert({
      type: activeLog,
      content: content || '',
      severity: activeLog === 'symptom' || activeLog === 'stress' ? severity : null,
      hours: activeLog === 'sleep' ? parseFloat(hours) : null,
      user_id: 'anonymous'
    })
    setLoading(false)
    if (!error) {
      setSubmitted(true)
      setContent('')
      setSeverity(3)
      setHours('')
      setTimeout(() => { setSubmitted(false); setActiveLog(null) }, 2000)
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] flex flex-col items-center px-4 py-10">
      <h1 className="text-3xl font-bold text-[#2d6a4f] mb-2">GutBut Trigger Tool</h1>
      <p className="text-gray-500 mb-4 text-center">Track your meals, symptoms, sleep and stress</p>

      <div className="w-full max-w-md mb-8 flex justify-end">
        <Link href="/insights">
          <button className="bg-[#2d6a4f] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#245a42] transition">
            View Insights →
          </button>
        </Link>
      </div>

      {!activeLog && !submitted && (
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {[
            { type: 'meal', label: '🍽️ Log Meal', color: 'bg-green-100 border-green-300' },
            { type: 'symptom', label: '🤢 Log Symptom', color: 'bg-red-100 border-red-300' },
            { type: 'sleep', label: '😴 Log Sleep', color: 'bg-blue-100 border-blue-300' },
            { type: 'stress', label: '🤯 Log Stress', color: 'bg-yellow-100 border-yellow-300' },
          ].map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => setActiveLog(type as LogType)}
              className={`${color} border-2 rounded-2xl p-6 text-left font-semibold text-gray-700 hover:opacity-80 transition`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {activeLog && !submitted && (
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm">
          <button onClick={() => setActiveLog(null)} className="text-sm text-gray-400 mb-4 underline">← Back</button>
          <h2 className="text-xl font-bold text-gray-700 mb-4 capitalize">Log {activeLog}</h2>

          {(activeLog === 'meal' || activeLog === 'symptom') && (
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-4"
              rows={3}
              placeholder={activeLog === 'meal' ? 'What did you eat?' : 'What symptom are you feeling?'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}

          {activeLog === 'sleep' && (
            <input
              type="number"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-4"
              placeholder="How many hours did you sleep?"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          )}

          {(activeLog === 'symptom' || activeLog === 'stress') && (
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-2 block">Severity: {severity}/5</label>
              <input
                type="range" min={1} max={5} value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {activeLog === 'stress' && (
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-4"
              rows={2}
              placeholder="Optional note about your stress"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#2d6a4f] text-white rounded-xl py-3 font-semibold hover:bg-[#245a42] transition"
          >
            {loading ? 'Saving...' : 'Submit'}
          </button>
        </div>
      )}

      {submitted && (
        <div className="text-center mt-10">
          <p className="text-2xl">✅</p>
          <p className="text-green-600 font-semibold mt-2">Logged. Keep it up.</p>
        </div>
      )}
    </main>
  )
}