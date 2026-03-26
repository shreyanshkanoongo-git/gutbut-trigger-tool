import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateRange = searchParams.get('dateRange') ?? '7'
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ insufficient: true })
  }

  let query = supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (dateRange !== 'all') {
    const days = parseInt(dateRange, 10)
    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setHours(0, 0, 0, 0)
    query = query.gte('created_at', since.toISOString())
  }

  const { data: logs, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!logs || logs.length < 3) {
    return NextResponse.json({ insufficient: true })
  }

  const formatted = logs
    .map((log) => {
      const date = new Date(log.created_at).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
      if (log.type === 'meal')       return `${date} — Meal: ${log.content}`
      if (log.type === 'symptom')    return `${date} — Symptom: ${log.content} (severity ${log.severity}/5)`
      if (log.type === 'sleep')      return `${date} — Sleep: ${log.hours} hours`
      if (log.type === 'stress')     return `${date} — Stress: ${log.severity}/5${log.content ? `, note: ${log.content}` : ''}`
      if (log.type === 'supplement') return `${date} — Supplement: ${log.content}`
      return ''
    })
    .filter(Boolean)
    .join('\n')

  const prompt = `You are a gut health analyst. Analyse the following health logs and return ONLY a JSON object with no markdown, no explanation, just raw JSON. Find specific patterns with exact counts and percentages. Be specific — name the actual foods, actual symptoms, actual numbers. Every insight must include one actionable recommendation the user can take this week.

Return this exact JSON shape:
{
  "weeklySummary": "<2-3 sentence warm, personal summary written like a health coach. Mention how many days they logged, their biggest trigger, and one specific thing to focus on next week.>",
  "summary": {
    "totalLogs": <total number of log entries>,
    "daysTracked": <number of distinct days in the data>,
    "topTrigger": <the single most impactful food or habit, e.g. "Dairy" or "Spicy food">
  },
  "insights": [
    {
      "id": 1,
      "category": "food" | "sleep" | "stress" | "supplement" | "positive",
      "severity": "high" | "medium" | "low",
      "text": "<2–3 sentence pattern description using real data>",
      "count": <how many times this pattern appeared>,
      "percentage": <approximate % of relevant days affected>,
      "recommendation": "<one specific action the user can take this week>"
    }
  ]
}

Rules:
- category "food" = meals causing symptoms
- category "sleep" = sleep duration affecting next-day energy or symptoms
- category "stress" = stress correlating with gut issues
- category "supplement" = patterns involving supplements — for example, on days the user took probiotics were symptoms lower? Did any supplement correlate with better or worse gut health? Name the specific supplement.
- category "positive" = things that are going well or improving
- severity "high" if it affects >50% of days or symptom severity ≥ 4
- severity "medium" if it affects 25–50% or severity 2–3
- severity "low" if it affects <25% or is a positive trend
- Also write a weeklySummary field: a 2-3 sentence personal health coach summary of this person's week. Be warm, specific, and encouraging. Mention actual foods or symptoms by name. End with one concrete focus for next week.
- Return 3 to 6 insights total. Only include categories you have evidence for.
- Return ONLY the raw JSON. No code fences, no explanation.

Health log data:
${formatted}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  })

  const raw = completion.choices[0].message.content ?? '{}'
  const cleaned = raw.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json({ ...parsed, insufficient: false })
}
