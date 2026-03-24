import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
  const { data: logs, error } = await supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!logs || logs.length === 0) {
    return NextResponse.json({ insights: [], insufficient: true })
  }

  const formatted = logs.map((log) => {
    const date = new Date(log.created_at).toLocaleDateString('en-IN')
    if (log.type === 'meal') return `${date} — Meal: ${log.content}`
    if (log.type === 'symptom') return `${date} — Symptom: ${log.content} (severity ${log.severity}/5)`
    if (log.type === 'sleep') return `${date} — Sleep: ${log.hours} hours`
    if (log.type === 'stress') return `${date} — Stress level: ${log.severity}/5${log.content ? `, note: ${log.content}` : ''}`
    return ''
  }).join('\n')

  const prompt = `You are a gut health analyst. A user has been logging their meals, symptoms, sleep and stress. Analyse their data and identify patterns that could explain their gut issues or health problems.

Here is their log data:
${formatted}

Return 3 to 5 clear insights in plain language. Each insight should be one or two sentences. Focus on connections between meals and symptoms, sleep and energy, stress and digestion. Be specific and use the actual data. Do not give generic advice.

Format your response as a JSON array like this:
[
  { "insight": "Your insight here" },
  { "insight": "Your insight here" }
]

Return only the JSON array. No extra text.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  })

  const raw = completion.choices[0].message.content || '[]'
  const cleaned = raw.replace(/```json|```/g, '').trim()
  const insights = JSON.parse(cleaned)

  return NextResponse.json({ insights, insufficient: false })
}