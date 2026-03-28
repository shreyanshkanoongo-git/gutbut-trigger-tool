'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AppHeader from '../components/AppHeader'

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
  const [userInitial, setUserInitial] = useState('?')
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
      setUserInitial((user.email?.[0] ?? '?').toUpperCase())
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
    border: '1px solid rgba(30,77,53,0.15)',
    borderRadius: '10px',
    padding: '13px 16px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    color: '#1e4d35',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const,
    display: 'block',
  }

  const sectionLabelStyle = {
    color: '#8a8a7e',
    fontSize: '11px',
    fontWeight: 600 as const,
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    display: 'block' as const,
    marginBottom: '8px',
    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .save-toast { animation: slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        input, select, textarea {
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        input:focus, select:focus {
          border-color: #1e4d35 !important;
          box-shadow: 0 0 0 3px rgba(30,77,53,0.08);
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
          border: 1px solid rgba(30,77,53,0.15);
          background-color: transparent;
          color: #8a8a7e;
          transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
          user-select: none;
        }
        .chip.active {
          background-color: #1e4d35;
          color: #f5f0e8;
          border-color: #1e4d35;
        }
        .chip:hover:not(.active) {
          border-color: rgba(30,77,53,0.3);
          color: #1e4d35;
        }
      `}</style>

      <AppHeader pageName="My Info" userInitial={userInitial} />

      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f0e8',
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          paddingTop: '116px',
          paddingBottom: '80px',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        <div style={{ maxWidth: '448px', margin: '0 auto' }}>

          {/* ── Page title ── */}
          <div className="fade-in-up" style={{ marginBottom: '28px' }}>
            <h1
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                margin: '0 0 6px',
              }}
            >
              Your Health Profile
            </h1>
            <p style={{ color: '#8a8a7e', fontSize: '0.875rem', margin: 0 }}>
              Help us personalise your insights
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', gap: '9px', marginTop: '72px', justifyContent: 'center' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: '#1e4d35',
                    animation: 'fadeInUp 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.22}s`,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="fade-in-up">
              {/* Error */}
              {error && (
                <div
                  style={{
                    backgroundColor: '#fff8f6', borderRadius: '12px',
                    padding: '12px 16px', border: '1px solid #fdd5cc', marginBottom: '16px',
                  }}
                >
                  <p style={{ color: '#c0392b', fontSize: '0.8375rem', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* ── About You card ── */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid rgba(30,77,53,0.1)',
                  boxShadow: '0 2px 12px rgba(30,77,53,0.06)',
                  padding: '24px',
                  marginBottom: '12px',
                }}
              >
                <p style={{ ...sectionLabelStyle, marginBottom: '20px' }}>About You</p>

                <label style={sectionLabelStyle}>First name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ ...inputStyle, marginBottom: '20px' }}
                />

                <label style={sectionLabelStyle}>Age</label>
                <input
                  type="number"
                  placeholder="e.g. 32"
                  value={age}
                  min={1}
                  max={120}
                  onChange={(e) => setAge(e.target.value)}
                  style={{ ...inputStyle, marginBottom: '20px' }}
                />

                <label style={sectionLabelStyle}>Gender</label>
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

                <label style={sectionLabelStyle}>Diet type</label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  style={{ ...inputStyle, appearance: 'auto' }}
                >
                  <option value="">Select diet type</option>
                  <option value="Omnivore">Omnivore</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten-free">Gluten-free</option>
                  <option value="Dairy-free">Dairy-free</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* ── Wellness goals card ── */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid rgba(30,77,53,0.1)',
                  boxShadow: '0 2px 12px rgba(30,77,53,0.06)',
                  padding: '24px',
                  marginBottom: '12px',
                }}
              >
                <p style={{ ...sectionLabelStyle, marginBottom: '4px' }}>Wellness Goals</p>
                <p style={{ color: '#b8b0a4', fontSize: '0.75rem', margin: '0 0 16px' }}>
                  Pick up to 3 &nbsp;·&nbsp; {wellnessGoals.length}/3 selected
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
              </div>

              {/* ── Current symptoms card ── */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid rgba(30,77,53,0.1)',
                  boxShadow: '0 2px 12px rgba(30,77,53,0.06)',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <p style={{ ...sectionLabelStyle, marginBottom: '4px' }}>Current Symptoms</p>
                <p style={{ color: '#b8b0a4', fontSize: '0.75rem', margin: '0 0 16px' }}>
                  Select all that apply
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                  borderRadius: '100px',
                  padding: '15px',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: '0.02em',
                }}
              >
                {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Profile'}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Success toast ── */}
      {saved && (
        <div
          className="save-toast"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1e4d35',
            color: '#f5f0e8',
            borderRadius: '100px',
            padding: '10px 24px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            boxShadow: '0 4px 20px rgba(30,77,53,0.25)',
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          Profile saved
        </div>
      )}
    </>
  )
}
