import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const experimentId = searchParams.get('experimentId')

  if (!experimentId) {
    return NextResponse.json({ error: 'experimentId is required' }, { status: 400 })
  }

  // Fetch the experiment
  const { data: experiment, error: expError } = await supabase
    .from('experiments')
    .select('*')
    .eq('id', experimentId)
    .single()

  if (expError || !experiment) {
    return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
  }

  const startDate = new Date(experiment.start_date)
  const endDate = new Date(experiment.end_date)

  // Fetch logs during the experiment period
  const { data: duringLogs } = await supabase
    .from('logs')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true })

  // Fetch logs from the same number of days before the experiment (baseline)
  const durationMs = endDate.getTime() - startDate.getTime()
  const beforeEnd = new Date(startDate.getTime() - 1)
  const beforeStart = new Date(startDate.getTime() - durationMs)

  const { data: beforeLogs } = await supabase
    .from('logs')
    .select('*')
    .gte('created_at', beforeStart.toISOString())
    .lte('created_at', beforeEnd.toISOString())
    .order('created_at', { ascending: true })

  function formatLogs(logs: Record<string, unknown>[] | null): string {
    if (!logs || logs.length === 0) return 'No data available.'
    return logs
      .map((log) => {
        const date = new Date(log.created_at as string).toLocaleDateString('en-GB', {
          weekday: 'short', day: 'numeric', month: 'short',
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
  }

  const beforeFormatted = formatLogs(beforeLogs as Record<string, unknown>[] | null)
  const duringFormatted = formatLogs(duringLogs as Record<string, unknown>[] | null)

  const prompt = `You are a gut health analyst evaluating a personal health experiment. Return ONLY a raw JSON object with no markdown.

Experiment name: "${experiment.name}"
Hypothesis: "${experiment.hypothesis}"
Duration: ${experiment.start_date} to ${experiment.end_date}

BEFORE the experiment (baseline period):
${beforeFormatted}

DURING the experiment:
${duringFormatted}

Analyse the before vs during data and return this exact JSON:
{
  "verdict": "confirmed_trigger" | "not_a_trigger" | "inconclusive",
  "verdictLabel": "Confirmed Trigger" | "Not a Trigger" | "Inconclusive",
  "summary": "<2-3 sentences comparing before vs during. Be specific — mention symptom severity numbers, frequency, actual foods or supplements by name.>",
  "beforeHighlight": "<1 sentence describing the key pattern from the baseline period>",
  "duringHighlight": "<1 sentence describing the key pattern during the experiment>",
  "recommendation": "<One specific, actionable next step based on the result>"
}

Rules:
- "confirmed_trigger" if symptoms were clearly worse (or better) during the experiment period
- "not_a_trigger" if there was no meaningful change in symptoms
- "inconclusive" if there is not enough data to draw a conclusion
- Be honest and specific. Do not pad with vague statements.
- Return ONLY raw JSON. No code fences.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  })

  const raw = completion.choices[0].message.content ?? '{}'
  const cleaned = raw.replace(/```json|```/g, '').trim()
  const result = JSON.parse(cleaned)

  // Save the result back to the experiment row
  await supabase
    .from('experiments')
    .update({ result: JSON.stringify(result), status: 'completed' })
    .eq('id', experimentId)

  return NextResponse.json(result)
}
