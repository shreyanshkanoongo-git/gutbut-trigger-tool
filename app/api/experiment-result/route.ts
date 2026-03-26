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

  try {
    console.log('[experiment-result] experimentId:', experimentId)

    const { data: experiment, error: expError } = await supabase
      .from('experiments')
      .select('*')
      .eq('id', experimentId)
      .single()

    console.log('[experiment-result] experiment row:', experiment ? `found (user_id: ${experiment.user_id}, status: ${experiment.status})` : 'NOT FOUND', '| error:', expError?.message ?? 'none')

    if (expError || !experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    const startDate = new Date(experiment.start_date)
    const endDate = new Date(experiment.end_date)
    const durationMs = endDate.getTime() - startDate.getTime()
    const beforeEnd = new Date(startDate.getTime() - 1)
    const beforeStart = new Date(startDate.getTime() - durationMs)

    console.log('[experiment-result] date ranges — before:', beforeStart.toISOString(), '→', beforeEnd.toISOString(), '| during:', startDate.toISOString(), '→', endDate.toISOString())

    // Fetch regular health logs (before and during)
    const [{ data: duringLogs }, { data: beforeLogs }, { data: expLogs }] = await Promise.all([
      supabase
        .from('logs')
        .select('*')
        .eq('user_id', experiment.user_id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true }),
      supabase
        .from('logs')
        .select('*')
        .eq('user_id', experiment.user_id)
        .gte('created_at', beforeStart.toISOString())
        .lte('created_at', beforeEnd.toISOString())
        .order('created_at', { ascending: true }),
      supabase
        .from('experiment_logs')
        .select('*')
        .eq('experiment_id', experimentId)
        .order('day_number', { ascending: true }),
    ])

    console.log('[experiment-result] logs found — before:', beforeLogs?.length ?? 0, '| during:', duringLogs?.length ?? 0, '| experiment_logs:', expLogs?.length ?? 0)

    const hasData =
      (duringLogs && duringLogs.length > 0) ||
      (beforeLogs && beforeLogs.length > 0) ||
      (expLogs && expLogs.length > 0)

    console.log('[experiment-result] hasData:', hasData)

    if (!hasData) {
      const noDataResult = {
        verdict: 'inconclusive' as const,
        verdictLabel: 'Inconclusive',
        summary: 'Not enough data to analyse. Keep logging daily entries during your experiment.',
        beforeHighlight: 'No baseline data was found for this period.',
        duringHighlight: 'No logs were recorded during the experiment.',
        recommendation: 'Log your meals, symptoms, and daily experiment entries each day to get a meaningful verdict.',
      }
      await supabase
        .from('experiments')
        .update({ result: JSON.stringify(noDataResult), status: 'completed' })
        .eq('id', experimentId)
      return NextResponse.json(noDataResult)
    }

    function formatHealthLogs(logs: Record<string, unknown>[] | null): string {
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

    function formatExpLogs(logs: Record<string, unknown>[] | null): string {
      if (!logs || logs.length === 0) return 'No daily entries recorded.'
      return logs
        .map((log) =>
          `Day ${log.day_number}: Mood=${log.mood}, Severity=${log.severity}/5${log.note ? `, Note: "${log.note}"` : ''}`
        )
        .join('\n')
    }

    const prompt = `You are a gut health analyst evaluating a personal health experiment. Return ONLY a raw JSON object with no markdown.

Experiment name: "${experiment.name}"
Hypothesis: "${experiment.hypothesis}"
Duration: ${experiment.start_date} to ${experiment.end_date}

BEFORE the experiment (baseline period):
${formatHealthLogs(beforeLogs as Record<string, unknown>[] | null)}

DURING the experiment:
${formatHealthLogs(duringLogs as Record<string, unknown>[] | null)}

DAILY EXPERIMENT LOG ENTRIES:
${formatExpLogs(expLogs as Record<string, unknown>[] | null)}

Analyse all data and return this exact JSON:
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

    console.log('[experiment-result] calling OpenAI...')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    })

    const raw = completion.choices[0].message.content ?? '{}'
    console.log('[experiment-result] OpenAI raw response:', raw.slice(0, 300))
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)
    console.log('[experiment-result] parsed result verdict:', result.verdict)

    await supabase
      .from('experiments')
      .update({ result: JSON.stringify(result), status: 'completed' })
      .eq('id', experimentId)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Experiment result error:', err)
    const fallback = {
      verdict: 'inconclusive' as const,
      verdictLabel: 'Inconclusive',
      summary: 'Unable to analyse this experiment. This may be due to insufficient data or a temporary issue.',
      beforeHighlight: 'Analysis could not be completed.',
      duringHighlight: 'Analysis could not be completed.',
      recommendation: 'Continue logging daily entries and try ending the experiment again.',
    }
    return NextResponse.json(fallback)
  }
}
