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
    <main className="min-h-screen bg-[#f7f4ef] flex flex-col items-center px-4 py-10">
      <h1 className="text-3xl font-bold text-[#2d6a4f] mb-2">Your Insights</h1>
      <p className="text-gray-500 mb-8 text-center">Patterns discovered from your logs</p>

      <div className="w-full max-w-md mb-6">
        <Link href="/">
          <button className="text-sm text-[#2d6a4f] underline">← Back to Log</button>
        </Link>
      </div>

      {loading && (
        <div className="text-gray-500 text-center mt-10">Analysing your data...</div>
      )}

      {insufficient && !loading && (
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-gray-600 text-lg">Not enough data yet.</p>
          <p className="text-gray-400 mt-2 text-sm">Keep logging for a few more days and your patterns will appear here.</p>
        </div>
      )}

      {error && !loading && (
        <div className="w-full max-w-md bg-red-50 rounded-2xl p-6 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!loading && !insufficient && insights.length > 0 && (
        <div className="w-full max-w-md flex flex-col gap-4">
          {insights.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-700 text-base leading-relaxed">💡 {item.insight}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}