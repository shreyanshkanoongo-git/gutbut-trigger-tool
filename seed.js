// seed.js — inserts 10 days of realistic gut health data into Supabase
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://winsfeqqfsvlvgbziigx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbnNmZXFxZnN2bHZnYnppaWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjE0MzAsImV4cCI6MjA4OTgzNzQzMH0.UL7LQzh4wtSSPzNU7XOyUWnN8fVqlSSjeb-DcWuLgJ0'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 10 days of entries ending yesterday (day 0 = 10 days ago)
// Each day has: meals, symptoms correlated to meals, sleep, and stress.
//
// Correlation patterns baked in:
//  - Dairy (pizza, milk, cheese) → bloating the same or next morning
//  - Gluten-heavy days → fatigue + bloating
//  - Spicy food → stomach cramps / discomfort
//  - Low sleep → high fatigue symptom next day
//  - High stress days → stomach discomfort

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

const days = [
  // ── Day 10 (10 days ago) ──────────────────────────────────────────────
  {
    offset: 10,
    logs: [
      { type: 'meal',    content: 'Scrambled eggs on sourdough toast with butter and orange juice', severity: null, hours: null },
      { type: 'meal',    content: 'Pasta with creamy alfredo sauce, garlic bread, glass of milk', severity: null, hours: null },
      { type: 'meal',    content: 'Bowl of ice cream with chocolate sauce', severity: null, hours: null },
      { type: 'sleep',   content: '', severity: null, hours: 7.5 },
      { type: 'stress',  content: 'Normal workday, no big pressures', severity: 2, hours: null },
    ],
  },
  // ── Day 9 ─────────────────────────────────────────────────────────────
  // Bloating after yesterday's dairy + gluten heavy day
  {
    offset: 9,
    logs: [
      { type: 'symptom', content: 'Bloating since morning, stomach feels tight and uncomfortable', severity: 4, hours: null },
      { type: 'meal',    content: 'Plain oatmeal with banana and honey — keeping it light', severity: null, hours: null },
      { type: 'meal',    content: 'Grilled chicken salad with mixed greens, cucumber, and olive oil dressing', severity: null, hours: null },
      { type: 'meal',    content: 'Vegetable stir fry with tofu, broccoli, and brown rice', severity: null, hours: null },
      { type: 'sleep',   content: '', severity: null, hours: 6 },
      { type: 'stress',  content: 'Bit anxious about a project deadline', severity: 3, hours: null },
    ],
  },
  // ── Day 8 ─────────────────────────────────────────────────────────────
  {
    offset: 8,
    logs: [
      { type: 'meal',    content: 'Greek yogurt with granola and mixed berries', severity: null, hours: null },
      { type: 'meal',    content: 'Cheese toastie on white bread with tomato soup', severity: null, hours: null },
      { type: 'meal',    content: 'Spicy Thai green curry with jasmine rice and naan bread', severity: null, hours: null },
      { type: 'sleep',   content: '', severity: null, hours: 4.5 },
      { type: 'stress',  content: 'Stressful day — back to back meetings and a tough conversation with my manager', severity: 5, hours: null },
    ],
  },
  // ── Day 7 ─────────────────────────────────────────────────────────────
  // Fatigue from 4.5h sleep + stomach cramps from spicy curry
  {
    offset: 7,
    logs: [
      { type: 'symptom', content: 'Stomach cramps and gurgling all morning, likely from last night\'s curry', severity: 4, hours: null },
      { type: 'symptom', content: 'Extreme fatigue — struggling to concentrate, heavy eyes all day', severity: 5, hours: null },
      { type: 'meal',    content: 'Just a banana and black coffee — no appetite in the morning', severity: null, hours: null },
      { type: 'meal',    content: 'Plain rice with boiled carrots and steamed chicken breast', severity: null, hours: null },
      { type: 'meal',    content: 'Crackers with peanut butter and herbal tea', severity: null, hours: null },
      { type: 'sleep',   content: '', severity: null, hours: 8 },
      { type: 'stress',  content: 'Still recovering from yesterday, tried to take it easy', severity: 2, hours: null },
    ],
  },
  // ── Day 6 ─────────────────────────────────────────────────────────────
  {
    offset: 6,
    logs: [
      { type: 'meal',    content: 'Avocado on whole grain toast with poached eggs and spinach', severity: null, hours: null },
      { type: 'meal',    content: 'Homemade lentil soup with crusty sourdough', severity: null, hours: null },
      { type: 'meal',    content: 'Grilled salmon with roasted sweet potato and asparagus', severity: null, hours: null },
      { type: 'sleep',   content: '', severity: null, hours: 7 },
      { type: 'stress',  content: 'Good day, felt calm and in control', severity: 1, hours: null },
    ],
  },
  // ── Day 5 ─────────────────────────────────────────────────────────────
  // Pizza night — gluten + dairy combo
  {
    offset: 5,
    logs: [
      { type: 'meal',    content: 'Cereal with full-fat milk and a glass of orange juice', severity: null, hours: null },
      { type: 'meal',    content: 'Cheese and ham sandwich on white bread, bag of crisps', severity: null, hours: null },
      { type: 'meal',    content: 'Large pepperoni and cheese pizza (3 slices), garlic dip, fizzy drink', severity: null, hours: null },
      { type: 'sleep',   content: '', severity: null, hours: 6.5 },
      { type: 'stress',  content: 'Social event in the evening, mild social anxiety beforehand', severity: 3, hours: null },
    ],
  },
  // ── Day 4 ─────────────────────────────────────────────────────────────
  // Bloating + fatigue after pizza
  {
    offset: 4,
    logs: [
      { type: 'symptom', content: 'Bloating again — abdomen distended and gassy, same as after pasta night', severity: 4, hours: null },
      { type: 'symptom', content: 'Low energy and brain fog in the morning', severity: 3, hours: null },
      { type: 'meal',    content: 'Smoothie with almond milk, spinach, banana, and chia seeds', severity: null, hours: null },
      { type: 'meal',    content: 'Quinoa bowl with roasted chickpeas, cucumber, tomato, and tahini', severity: null, hours: null },
      { type: 'meal',    content: 'Baked cod with steamed broccoli and peas', severity: null, hours: null },
      { type: 'sleep',   content: '', severity: null, hours: 7.5 },
      { type: 'stress',  content: 'Working from home, fairly relaxed day', severity: 2, hours: null },
    ],
  },
  // ── Day 3 ─────────────────────────────────────────────────────────────
  {
    offset: 3,
    logs: [
      { type: 'meal',    content: 'Porridge with oat milk, blueberries and a drizzle of maple syrup', severity: null, hours: null },
      { type: 'meal',    content: 'Spicy buffalo chicken wrap with lettuce, cheese, and sour cream', severity: null, hours: null },
      { type: 'meal',    content: 'Beef tacos with salsa, jalapeños, guacamole, and sour cream', severity: null, hours: null },
      { type: 'sleep',   content: '', severity: null, hours: 5 },
      { type: 'stress',  content: 'Argument at home left me unsettled all evening', severity: 4, hours: null },
    ],
  },
  // ── Day 2 ─────────────────────────────────────────────────────────────
  // Stomach discomfort from spicy + dairy, fatigue from 5h sleep + stress
  {
    offset: 2,
    logs: [
      { type: 'symptom', content: 'Heartburn and acid reflux since last night — spicy food again', severity: 4, hours: null },
      { type: 'symptom', content: 'Fatigue and irritability, slept badly due to stress', severity: 4, hours: null },
      { type: 'meal',    content: 'Toast with jam and chamomile tea', severity: null, hours: null },
      { type: 'meal',    content: 'Vegetable soup with a small bread roll', severity: null, hours: null },
      { type: 'meal',    content: 'Steamed rice with grilled courgette, peppers, and hummus', severity: null, hours: null },
      { type: 'sleep',   content: '', severity: null, hours: 8 },
      { type: 'stress',  content: 'Feeling calmer, resolved things from yesterday', severity: 2, hours: null },
    ],
  },
  // ── Day 1 (yesterday) ─────────────────────────────────────────────────
  {
    offset: 1,
    logs: [
      { type: 'meal',    content: 'Two fried eggs with sautéed kale, tomatoes and whole grain toast', severity: null, hours: null },
      { type: 'meal',    content: 'Pasta bake with mozzarella, tomato sauce and a side salad', severity: null, hours: null },
      { type: 'symptom', content: 'Mild bloating after lunch — pasta and cheese again', severity: 2, hours: null },
      { type: 'meal',    content: 'Roasted vegetable and chickpea tray bake with tahini dressing', severity: null, hours: null },
      { type: 'sleep',   content: '', severity: null, hours: 7 },
      { type: 'stress',  content: 'Productive day, feeling good overall', severity: 1, hours: null },
    ],
  },
]

async function seed() {
  console.log('🌱 Starting seed...\n')

  let totalInserted = 0

  for (const day of days) {
    const timestamp = daysAgo(day.offset)
    const date = new Date(timestamp).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

    const rows = day.logs.map((log) => ({
      type: log.type,
      content: log.content,
      severity: log.severity,
      hours: log.hours,
      user_id: 'anonymous',
      created_at: timestamp,
    }))

    const { error } = await supabase.from('logs').insert(rows)

    if (error) {
      console.error(`  ✗ Day -${day.offset} (${date}): ${error.message}`)
    } else {
      console.log(`  ✓ Day -${day.offset} (${date}): inserted ${rows.length} entries`)
      totalInserted += rows.length
    }
  }

  console.log(`\n✅ Done. ${totalInserted} rows inserted across ${days.length} days.`)
}

seed()
