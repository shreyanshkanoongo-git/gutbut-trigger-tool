import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const dateRange = searchParams.get('dateRange')

  if (!userId || !dateRange) return NextResponse.json({ cached: false })

  const { data, error } = await adminSupabase
    .from('insight_cache')
    .select('result, generated_at')
    .eq('user_id', userId)
    .eq('date_range', dateRange)
    .single()

  if (error || !data) return NextResponse.json({ cached: false })
  return NextResponse.json({ cached: true, result: data.result, generated_at: data.generated_at })
}

export async function POST(req: NextRequest) {
  const { userId, dateRange, result } = await req.json()

  if (!userId || !dateRange || !result) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error } = await adminSupabase
    .from('insight_cache')
    .upsert(
      { user_id: userId, date_range: dateRange, result, generated_at: new Date().toISOString() },
      { onConflict: 'user_id,date_range' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
