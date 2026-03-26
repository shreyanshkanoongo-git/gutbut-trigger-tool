'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const WELLNESS_GOALS = [
  'Better sleep', 'More energy', 'Stress management', 'Weight management',
  'Improved digestion', 'Mental clarity', 'Regular exercise', 'Healthy eating',
  'Mindfulness', 'Work-life balance',
]

const CURRENT_SYMPTOMS = [
  'Fatigue', 'Stress', 'Poor sleep', 'Digestive issues', 'Headaches',
  'Anxiety', 'Low mood', 'Brain fog', 'Muscle tension', 'Low motivation',
]

export default function MyInfoPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [firstName, setFirstName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [dietType, setDietType] = useState('')
  const [wellnessGoals, setWellnessGoals] = useState<string[]>([])
  const [currentSymptoms, setCurrentSymptoms] = useState<string[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data) {
        setFirstName(data.first_name ?? '')
        setAge(data.age != null ? String(data.age) : '')
        setGender(data.gender ?? '')
        setDietType(data.diet_type ?? '')
        setWellnessGoals(data.wellness_goals ?? [])
        setCurrentSymptoms(data.current_symptoms ?? [])
      }
      setLoading(false)
    })
  }, [])

  function toggleGoal(goal: string) {
    setWellnessGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : prev.length < 3 ? [...prev, goal] : prev
    )
  }

  function toggleSymptom(symptom: string) {
    setCurrentSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    )
  }

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    setError('')
    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: userId,
          first_name: firstName.trim() || null,
          age: age ? parseInt(age) : null,
          gender: gender || null,
          diet_type: dietType || null,
          wellness_goals: wellnessGoals,
          current_symptoms: currentSymptoms,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    setSaving(false)
    if (upsertError) { setError('Could not save. Please try again.'); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle = {
    width: '100%',
    border: '1px solid #e4ddd2',
    borderRadius: '14px',
    padding: '13px 16px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    color: '#1e4d35',
    backgroundColor: '#faf8f4',
    boxSizing: 'border-box' as const,
    display: 'block',
  }

  const labelStyle = {
    color: '#7a9185',
    fontSize: '0.8rem',
    fontWeight: 500 as const,
    display: 'block' as const,
    marginBottom: '8px',
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .nav-btn { transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
        input, select, textarea {
          outline: none;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        input:focus, select:focus {
          border-color: #1e4d35 !important;
          background-color: #ffffff !important;
        }
        .submit-btn { transition: background-color 0.2s ease, transform 0.15s ease; }
        .submit-btn:not(:disabled):hover { background-color: #163b28 !important; }
        .submit-btn:not(:disabled):active { transform: scale(0.98); }
        .chip {
          display: inline-block;
          padding: 7px 14px;
          border-radius: 100px;
          font-size: 0.8125rem;
          font-family: inherit;
          cursor: pointer;
          border: 1px solid #d6cfc4;
          background-color: transparent;
          color: #7a9185;
          transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
          user-select: none;
        }
        .chip.active {
          background-color: #1e4d35;
          color: #f5f0e8;
          border-color: #1e4d35;
        }
        .chip:hover:not(.active) {
          border-color: #a8c4b4;
          color: #1e4d35;
        }
        @media (max-width: 640px) {
          .my-info-header { flex-wrap: nowrap; align-items: center; }
        }
      `}</style>

      <main
        className="min-h-screen flex flex-col items-center px-5 pt-14 pb-20"
        style={{ backgroundColor: '#f5f0e8', fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      >
        {/* ── Header ── */}
        <div className="w-full max-w-md mb-10 fade-in-up">
          <div className="my-info-header flex items-start justify-between">
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '2.25rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                My Info
              </h1>
              <p
                style={{
                  color: '#7a9185',
                  fontSize: '0.75rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginTop: '5px',
                  fontWeight: 400,
                }}
              >
                Your health context
              </p>
            </div>
            <Link href="/log">
              <button
                className="nav-btn"
                style={{
                  backgroundColor: 'transparent',
                  color: '#1e4d35',
                  fontSize: '0.8125rem',
                  letterSpacing: '0.04em',
                  padding: '10px 22px',
                  borderRadius: '100px',
                  border: '1px solid #c8bfb0',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  flexShrink: 0,
                  marginLeft: '12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1e4d35'
                  e.currentTarget.style.color = '#f5f0e8'
                  e.currentTarget.style.borderColor = '#1e4d35'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#1e4d35'
                  e.currentTarget.style.borderColor = '#c8bfb0'
                }}
              >
                ← Log
              </button>
            </Link>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: '#d6cfc4', marginTop: '24px' }} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: '9px', marginTop: '72px' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: '#1e4d35', opacity: 0.4,
                  animation: 'fadeInUp 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.22}s`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-md fade-in-up">
            {/* Form card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '26px',
                padding: '32px',
                border: '1px solid #e4ddd2',
                boxShadow: '0 6px 30px rgba(30,77,53,0.07)',
                marginBottom: '16px',
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.375rem',
                  fontWeight: 600,
                  margin: '0 0 28px',
                  lineHeight: 1.2,
                }}
              >
                About You
              </h2>

              {/* Error */}
              {error && (
                <div
                  style={{
                    backgroundColor: '#fff8f6', borderRadius: '12px',
                    padding: '12px 16px', border: '1px solid #fdd5cc', marginBottom: '20px',
                  }}
                >
                  <p style={{ color: '#c0392b', fontSize: '0.8375rem', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* First name */}
              <label style={labelStyle}>First name</label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{ ...inputStyle, marginBottom: '20px' }}
              />

              {/* Age */}
              <label style={labelStyle}>Age</label>
              <input
                type="number"
                placeholder="e.g. 32"
                value={age}
                min={1}
                max={120}
                onChange={(e) => setAge(e.target.value)}
                style={{ ...inputStyle, marginBottom: '20px' }}
              />

              {/* Gender */}
              <label style={labelStyle}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{ ...inputStyle, marginBottom: '20px', appearance: 'auto' }}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>

              {/* Diet type */}
              <label style={labelStyle}>Diet type</label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                style={{ ...inputStyle, marginBottom: '28px', appearance: 'auto' }}
              >
                <option value="">Select diet type</option>
                <option value="Omnivore">Omnivore</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Gluten-free">Gluten-free</option>
                <option value="Dairy-free">Dairy-free</option>
                <option value="Other">Other</option>
              </select>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: '#f0ebe3', marginBottom: '28px' }} />

              {/* Wellness goals */}
              <label style={{ ...labelStyle, marginBottom: '6px' }}>
                Wellness goals
              </label>
              <p style={{ color: '#b8b0a4', fontSize: '0.75rem', margin: '0 0 14px' }}>
                Pick up to 3 &nbsp;·&nbsp; {wellnessGoals.length}/3 selected
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                {WELLNESS_GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`chip${wellnessGoals.includes(goal) ? ' active' : ''}`}
                    disabled={!wellnessGoals.includes(goal) && wellnessGoals.length >= 3}
                    style={{
                      opacity: !wellnessGoals.includes(goal) && wellnessGoals.length >= 3 ? 0.4 : 1,
                    }}
                  >
                    {goal}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: '#f0ebe3', marginBottom: '28px' }} />

              {/* Current symptoms */}
              <label style={{ ...labelStyle, marginBottom: '6px' }}>
                Current symptoms
              </label>
              <p style={{ color: '#b8b0a4', fontSize: '0.75rem', margin: '0 0 14px' }}>
                Select all that apply
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                {CURRENT_SYMPTOMS.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`chip${currentSymptoms.includes(symptom) ? ' active' : ''}`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="submit-btn"
              style={{
                width: '100%',
                backgroundColor: saved ? '#2d6e4e' : saving ? '#8eb8a3' : '#1e4d35',
                color: '#f5f0e8',
                borderRadius: '14px',
                padding: '15px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
              }}
            >
              {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save My Info'}
            </button>
          </div>
        )}
      </main>
    </>
  )
}
