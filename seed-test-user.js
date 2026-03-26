/**
 * GutBut — Seed script for test user
 *
 * BEFORE RUNNING:
 *   1. Set TEST_USER_ID below (already done)
 *   2. Set SUPABASE_SERVICE_KEY below:
 *      Supabase Dashboard → Project Settings → API → service_role (secret) key
 *   3. Run: node seed-test-user.js
 *
 * Uses the service role key to bypass RLS for seeding.
 * Inserts 14 days of correlated health data (Mar 12–25 2026),
 * one completed experiment, and 14 experiment_logs entries.
 */

const { createClient } = require('@supabase/supabase-js')

// ── CONFIGURE THESE ───────────────────────────────────────────────────────────
const TEST_USER_ID = 'a659a342-fbf8-49aa-a6ad-ceaa02927762'

// Get this from: Supabase Dashboard → Project Settings → API → service_role key
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbnNmZXFxZnN2bHZnYnppaWd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI2MTQzMCwiZXhwIjoyMDg5ODM3NDMwfQ.JoRf_BOMGNbl1B-lz2famjbhIoC-w3KdzTLIdvvAh8c'
// ─────────────────────────────────────────────────────────────────────────────

if (TEST_USER_ID === 'USER_ID_HERE') {
  console.error('\n⛔  Replace USER_ID_HERE with your actual user_id from Supabase Auth dashboard before running.\n')
  process.exit(1)
}

if (SUPABASE_SERVICE_KEY === 'SERVICE_ROLE_KEY_HERE') {
  console.error('\n⛔  Replace SERVICE_ROLE_KEY_HERE with your service_role key.')
  console.error('    Find it at: Supabase Dashboard → Project Settings → API → service_role (secret)\n')
  process.exit(1)
}

const SUPABASE_URL = 'https://winsfeqqfsvlvgbziigx.supabase.co'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns ISO timestamp for a given date string + hour offset (24h) */
function ts(dateStr, hour = 12, minute = 0) {
  return new Date(`${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`).toISOString()
}

function log(type, content, dateStr, hour, extra = {}) {
  return { user_id: TEST_USER_ID, type, content, created_at: ts(dateStr, hour), ...extra }
}

// ── Correlated day-by-day plan ────────────────────────────────────────────────
//
// Dairy days (heavy):  Mar 12, 14, 16, 18, 20, 22, 24  → bloating/digestion symptoms
// Dairy-free days:     Mar 13, 15, 17, 19, 21, 23, 25  → milder/no gut symptoms
// Poor sleep nights:   Mar 13, 16, 20, 23               → next-day fatigue + stress spike
// Probiotic days:      Mar 12, 15, 18, 21, 24           → reduced symptoms over time
// Ashwagandha days:    Mar 14, 19, 23
//
// Experiment: "Cut out dairy" — Mar 12–19 (user did NOT cut dairy, so symptoms appear)

const EXPERIMENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' // deterministic placeholder uuid

const days = [
  // ── Mar 12 ── dairy heavy, bloating, moderate stress, ok sleep, probiotic
  {
    date: '2026-03-12',
    meals: [
      log('meal', 'Chai with full-fat milk and rusk', '2026-03-12', 7),
      log('meal', 'Dal makhani with naan and dahi (full bowl)', '2026-03-12', 13),
      log('meal', 'Paneer butter masala with roti and raita', '2026-03-12', 20),
    ],
    symptoms: [
      log('symptom', 'Bloating and stomach fullness after lunch', '2026-03-12', 15, { severity: 3 }),
      log('symptom', 'Mild stomach cramps and gas in the evening', '2026-03-12', 19, { severity: 2 }),
    ],
    sleep: log('sleep', '', '2026-03-12', 23, { hours: 7 }),
    stress: log('stress', 'Average work day, manageable', '2026-03-12', 21, { severity: 2 }),
    supplement: log('supplement', 'Probiotic (Lactobacillus)', '2026-03-12', 9),
    expLog: { mood: 'Okay', severity: 3, note: 'Had dairy at lunch and dinner. Stomach felt heavy and gassy by evening.' },
  },

  // ── Mar 13 ── dairy-free, reduced symptoms, poor sleep
  {
    date: '2026-03-13',
    meals: [
      log('meal', 'Oats with banana and honey', '2026-03-13', 8),
      log('meal', 'Rajma chawal with salad (no dahi)', '2026-03-13', 13),
      log('meal', 'Vegetable soup and roti', '2026-03-13', 20),
    ],
    symptoms: [
      log('symptom', 'Mild fatigue mid-afternoon, no gut issues', '2026-03-13', 16, { severity: 1 }),
    ],
    sleep: log('sleep', '', '2026-03-13', 23, { hours: 5 }),
    stress: log('stress', 'Deadline at work, stayed up late', '2026-03-13', 22, { severity: 3 }),
    supplement: null,
    expLog: { mood: 'Good', severity: 1, note: 'No dairy today. Gut felt much lighter. Slept only 5 hours due to work.' },
  },

  // ── Mar 14 ── dairy heavy, bad digestion, next-day fatigue from poor sleep
  {
    date: '2026-03-14',
    meals: [
      log('meal', 'Paratha with butter and chai', '2026-03-14', 8),
      log('meal', 'Chole bhature with lassi', '2026-03-14', 13),
      log('meal', 'Kheer (rice pudding with full-fat milk)', '2026-03-14', 21),
    ],
    symptoms: [
      log('symptom', 'Fatigue and brain fog all morning', '2026-03-14', 10, { severity: 3 }),
      log('symptom', 'Significant bloating and loose stools after lunch', '2026-03-14', 15, { severity: 4 }),
    ],
    sleep: log('sleep', '', '2026-03-14', 23, { hours: 7 }),
    stress: log('stress', 'Tired from poor sleep, scattered focus', '2026-03-14', 18, { severity: 4 }),
    supplement: log('supplement', 'Ashwagandha', '2026-03-14', 9),
    expLog: { mood: 'Bad', severity: 4, note: 'Heavy dairy day again — paratha with butter, lassi, kheer. Bloating and digestion bad by afternoon.' },
  },

  // ── Mar 15 ── dairy-free, much better gut, decent sleep, probiotic
  {
    date: '2026-03-15',
    meals: [
      log('meal', 'Idli sambar with coconut chutney (no dairy)', '2026-03-15', 8),
      log('meal', 'Moong dal khichdi with pickle', '2026-03-15', 13),
      log('meal', 'Sabzi with roti and dal', '2026-03-15', 20),
    ],
    symptoms: [
      log('symptom', 'Headache mid-morning, resolved after lunch', '2026-03-15', 11, { severity: 2 }),
    ],
    sleep: log('sleep', '', '2026-03-15', 23, { hours: 7.5 }),
    stress: log('stress', 'Good productive day', '2026-03-15', 20, { severity: 1 }),
    supplement: log('supplement', 'Probiotic (Lactobacillus)', '2026-03-15', 9),
    expLog: { mood: 'Good', severity: 1, note: 'Dairy-free day. Gut completely fine. Energy was good. Slight headache in the morning but cleared up.' },
  },

  // ── Mar 16 ── dairy moderate, bloating returns, poor sleep
  {
    date: '2026-03-16',
    meals: [
      log('meal', 'Chai with milk and biscuits', '2026-03-16', 7),
      log('meal', 'Paneer paratha with dahi', '2026-03-16', 13),
      log('meal', 'Dal tadka with rice', '2026-03-16', 20),
    ],
    symptoms: [
      log('symptom', 'Bloating after lunch, stomach discomfort', '2026-03-16', 15, { severity: 3 }),
    ],
    sleep: log('sleep', '', '2026-03-16', 23, { hours: 5.5 }),
    stress: log('stress', 'Busy day, slight anxiety about upcoming week', '2026-03-16', 21, { severity: 3 }),
    supplement: null,
    expLog: { mood: 'Okay', severity: 3, note: 'Had paneer paratha and dahi. Bloating came back by 3pm. Went to bed late.' },
  },

  // ── Mar 17 ── dairy-free, good, but tired from poor sleep
  {
    date: '2026-03-17',
    meals: [
      log('meal', 'Poha with peanuts and lemon (no dairy)', '2026-03-17', 8),
      log('meal', 'Aloo sabzi with roti and dal', '2026-03-17', 13),
      log('meal', 'Brown rice with rajma', '2026-03-17', 20),
    ],
    symptoms: [
      log('symptom', 'Fatigue in the morning from lack of sleep', '2026-03-17', 9, { severity: 3 }),
      log('symptom', 'Headache from tiredness, eased after evening walk', '2026-03-17', 17, { severity: 2 }),
    ],
    sleep: log('sleep', '', '2026-03-17', 23, { hours: 8 }),
    stress: log('stress', 'Tired but manageable, light day', '2026-03-17', 19, { severity: 2 }),
    supplement: null,
    expLog: { mood: 'Okay', severity: 2, note: 'No dairy. Gut was fine. Just tired from sleeping late yesterday. Headache cleared by evening.' },
  },

  // ── Mar 18 ── dairy heavy, worst digestion day, probiotic
  {
    date: '2026-03-18',
    meals: [
      log('meal', 'Chai and paneer sandwich', '2026-03-18', 8),
      log('meal', 'Pav bhaji with extra butter and dahi', '2026-03-18', 13),
      log('meal', 'Milk-based dessert (gajar ka halwa)', '2026-03-18', 21),
    ],
    symptoms: [
      log('symptom', 'Severe bloating and gurgling stomach after lunch', '2026-03-18', 15, { severity: 5 }),
      log('symptom', 'Loose stools and cramping in the late afternoon', '2026-03-18', 17, { severity: 4 }),
    ],
    sleep: log('sleep', '', '2026-03-18', 23, { hours: 6.5 }),
    stress: log('stress', 'Frustrated with ongoing stomach issues', '2026-03-18', 20, { severity: 4 }),
    supplement: log('supplement', 'Probiotic (Lactobacillus)', '2026-03-18', 9),
    expLog: { mood: 'Bad', severity: 5, note: 'Heavy dairy day — paneer, lots of butter, dahi, halwa. Worst digestion of the week. Stomach cramping all afternoon.' },
  },

  // ── Mar 19 ── dairy-free (experiment end day), noticeable relief
  {
    date: '2026-03-19',
    meals: [
      log('meal', 'Upma with coconut (no milk, no dahi)', '2026-03-19', 8),
      log('meal', 'Chana masala with jeera rice', '2026-03-19', 13),
      log('meal', 'Palak dal with roti', '2026-03-19', 20),
    ],
    symptoms: [
      log('symptom', 'Mild residual bloating from yesterday, clearing up', '2026-03-19', 10, { severity: 2 }),
    ],
    sleep: log('sleep', '', '2026-03-19', 23, { hours: 7.5 }),
    stress: log('stress', 'Noticeably better stomach, calmer mood', '2026-03-19', 20, { severity: 1 }),
    supplement: null,
    expLog: { mood: 'Good', severity: 2, note: 'First fully dairy-free day. Stomach much calmer. Some leftover bloating from yesterday but clearing up by evening.' },
  },

  // ── Mar 20 ── dairy moderate (back after dairy-free day), bloating returns, poor sleep
  {
    date: '2026-03-20',
    meals: [
      log('meal', 'Chai with milk and toast with butter', '2026-03-20', 7),
      log('meal', 'Kadhi chawal with dahi', '2026-03-20', 13),
      log('meal', 'Roti with sabzi', '2026-03-20', 20),
    ],
    symptoms: [
      log('symptom', 'Bloating and gas returned after lunch', '2026-03-20', 15, { severity: 3 }),
    ],
    sleep: log('sleep', '', '2026-03-20', 23, { hours: 5 }),
    stress: log('stress', 'Stressed about work, distracted', '2026-03-20', 21, { severity: 4 }),
    supplement: null,
    expLog: { mood: 'Okay', severity: 3, note: 'Had dairy again (chai, kadhi, dahi). Bloating came back within hours of lunch.' },
  },

  // ── Mar 21 ── dairy-free, fatigue from poor sleep, probiotic
  {
    date: '2026-03-21',
    meals: [
      log('meal', 'Banana and almond milk smoothie', '2026-03-21', 8),
      log('meal', 'Aloo gobi sabzi with dal and rice', '2026-03-21', 13),
      log('meal', 'Vegetable pulao with raita substitute (skipped dahi)', '2026-03-21', 20),
    ],
    symptoms: [
      log('symptom', 'Morning fatigue and mild headache', '2026-03-21', 9, { severity: 3 }),
      log('symptom', 'Headache worsened midday, eased after rest', '2026-03-21', 14, { severity: 3 }),
    ],
    sleep: log('sleep', '', '2026-03-21', 23, { hours: 7 }),
    stress: log('stress', 'Tired from last night, better by afternoon', '2026-03-21', 18, { severity: 3 }),
    supplement: log('supplement', 'Probiotic (Lactobacillus)', '2026-03-21', 9),
    expLog: { mood: 'Okay', severity: 2, note: 'Dairy-free. Gut was quiet. Tired and had a headache likely from poor sleep last night.' },
  },

  // ── Mar 22 ── dairy heavy, clear bloating spike
  {
    date: '2026-03-22',
    meals: [
      log('meal', 'Chai and paratha with white butter', '2026-03-22', 8),
      log('meal', 'Dahi with rice and aloo sabzi', '2026-03-22', 13),
      log('meal', 'Paneer tikka and naan', '2026-03-22', 20),
    ],
    symptoms: [
      log('symptom', 'Significant bloating after lunch with dahi', '2026-03-22', 15, { severity: 4 }),
      log('symptom', 'Indigestion and stomach gurgling at night after paneer', '2026-03-22', 22, { severity: 4 }),
    ],
    sleep: log('sleep', '', '2026-03-22', 23, { hours: 6.5 }),
    stress: log('stress', 'Stomach discomfort made it hard to focus', '2026-03-22', 21, { severity: 3 }),
    supplement: null,
    expLog: { mood: 'Bad', severity: 4, note: 'Heavy dairy day — butter paratha, dahi, paneer tikka. Bad bloating and indigestion all evening.' },
  },

  // ── Mar 23 ── dairy-free, recovering, poor sleep, ashwagandha
  {
    date: '2026-03-23',
    meals: [
      log('meal', 'Oats with coconut milk and chia seeds', '2026-03-23', 8),
      log('meal', 'Moong dal soup with roti (no dahi)', '2026-03-23', 13),
      log('meal', 'Steamed rice with sambhar', '2026-03-23', 20),
    ],
    symptoms: [
      log('symptom', 'Mild residual bloating morning, cleared by noon', '2026-03-23', 9, { severity: 2 }),
    ],
    sleep: log('sleep', '', '2026-03-23', 23, { hours: 5.5 }),
    stress: log('stress', 'Slight anxiety, slept poorly', '2026-03-23', 22, { severity: 3 }),
    supplement: log('supplement', 'Ashwagandha', '2026-03-23', 9),
    expLog: { mood: 'Good', severity: 2, note: 'No dairy. Stomach calmed down from yesterday. Mild bloating in morning that cleared. Slept late again.' },
  },

  // ── Mar 24 ── dairy moderate, mild symptoms (probiotic helping over time), probiotic
  {
    date: '2026-03-24',
    meals: [
      log('meal', 'Chai with a splash of milk, whole wheat toast', '2026-03-24', 8),
      log('meal', 'Dal makhani with small portion of dahi', '2026-03-24', 13),
      log('meal', 'Aloo palak with roti', '2026-03-24', 20),
    ],
    symptoms: [
      log('symptom', 'Fatigue from poor sleep, improved by afternoon', '2026-03-24', 10, { severity: 3 }),
      log('symptom', 'Light bloating after lunch, less than usual', '2026-03-24', 16, { severity: 2 }),
    ],
    sleep: log('sleep', '', '2026-03-24', 23, { hours: 7.5 }),
    stress: log('stress', 'Calmer day, stomach coping better', '2026-03-24', 20, { severity: 2 }),
    supplement: log('supplement', 'Probiotic (Lactobacillus)', '2026-03-24', 9),
    expLog: { mood: 'Okay', severity: 2, note: 'Had some dairy. Bloating came but noticeably milder than last week — maybe the probiotic is helping.' },
  },

  // ── Mar 25 ── dairy-free, best day, good sleep ahead
  {
    date: '2026-03-25',
    meals: [
      log('meal', 'Sprouts salad with lemon and black pepper', '2026-03-25', 8),
      log('meal', 'Rajma chawal with salad (no dairy)', '2026-03-25', 13),
      log('meal', 'Mixed vegetable sabzi with jowar roti', '2026-03-25', 20),
    ],
    symptoms: [
      log('symptom', 'Feeling noticeably lighter and more energetic', '2026-03-25', 11, { severity: 1 }),
    ],
    sleep: log('sleep', '', '2026-03-25', 23, { hours: 8 }),
    stress: log('stress', 'Good mood, clear gut, low stress', '2026-03-25', 20, { severity: 1 }),
    supplement: null,
    expLog: { mood: 'Good', severity: 1, note: 'Fully dairy-free. Best gut day in 2 weeks. No bloating at all. Energy and mood both noticeably better.' },
  },
]

// ── Build flat arrays ─────────────────────────────────────────────────────────

const logsToInsert = []
const expLogsToInsert = []

for (let i = 0; i < days.length; i++) {
  const day = days[i]
  for (const meal of day.meals) logsToInsert.push(meal)
  for (const symptom of day.symptoms) logsToInsert.push(symptom)
  logsToInsert.push(day.sleep)
  logsToInsert.push(day.stress)
  if (day.supplement) logsToInsert.push(day.supplement)

  expLogsToInsert.push({
    experiment_id: EXPERIMENT_ID,
    user_id: TEST_USER_ID,
    day_number: i + 1,
    mood: day.expLog.mood,
    severity: day.expLog.severity,
    note: day.expLog.note,
    created_at: ts(day.date, 21, 30),
  })
}

// ── Experiment row ────────────────────────────────────────────────────────────

const experimentRow = {
  id: EXPERIMENT_ID,
  user_id: TEST_USER_ID,
  name: 'Cut out dairy',
  hypothesis: 'I think dairy is causing my bloating. I will avoid it completely for a week and see if my digestive symptoms improve.',
  start_date: '2026-03-12',
  end_date: '2026-03-19',
  status: 'completed',
  result: null,
}

// ── Run inserts ───────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  GutBut seed script starting...')
  console.log(`    User ID: ${TEST_USER_ID}`)
  console.log(`    Logs to insert: ${logsToInsert.length}`)
  console.log(`    Experiment logs to insert: ${expLogsToInsert.length}\n`)

  // 1. Insert experiment
  const { error: expError } = await supabase
    .from('experiments')
    .upsert(experimentRow, { onConflict: 'id' })

  if (expError) {
    console.error('❌  Failed to insert experiment:', expError.message)
    process.exit(1)
  }
  console.log('✓  Experiment inserted')

  // 2. Insert health logs (batched to avoid payload limits)
  const BATCH = 50
  let logCount = 0
  for (let i = 0; i < logsToInsert.length; i += BATCH) {
    const batch = logsToInsert.slice(i, i + BATCH)
    const { error } = await supabase.from('logs').insert(batch)
    if (error) {
      console.error(`❌  Failed to insert logs batch ${i / BATCH + 1}:`, error.message)
      process.exit(1)
    }
    logCount += batch.length
  }
  console.log(`✓  ${logCount} health log entries inserted`)

  // 3. Insert experiment logs
  const { error: expLogError } = await supabase
    .from('experiment_logs')
    .insert(expLogsToInsert)

  if (expLogError) {
    console.error('❌  Failed to insert experiment logs:', expLogError.message)
    process.exit(1)
  }
  console.log(`✓  ${expLogsToInsert.length} experiment log entries inserted`)

  console.log('\n✅  Seed complete!')
  console.log(`    Total rows inserted: ${1 + logCount + expLogsToInsert.length}`)
  console.log('    Open the app and go to Experiments → End & Get Verdict to test the AI analysis.\n')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
