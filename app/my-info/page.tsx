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
    setTimeout(() => setSaved(false), 2000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid transparent',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '14px',
    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
    color: '#1a1a18',
    backgroundColor: '#f5f0e8',
    boxSizing: 'border-box',
    display: 'block',
    outline: 'none',
    marginBottom: '10px',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  }

  const fieldLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#8a8a7e',
    display: 'block',
    marginBottom: '6px',
  }

  const sectionLabelStyle: React.CSSProperties = {
    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
    fontSize: '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#8a8a7e',
    marginBottom: '18px',
    display: 'block',
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(30,77,53,0.07)',
    boxShadow: '0 2px 8px rgba(30,77,53,0.05)',
    marginBottom: '14px',
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .save-toast { animation: slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        input:focus, select:focus {
          background-color: #ffffff !important;
          border-color: rgba(30,77,53,0.25) !important;
        }
        .pill-btn { transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
        .save-outline-btn { transition: background-color 0.2s ease; }
        .save-outline-btn:not(:disabled):hover { background-color: rgba(30,77,53,0.04) !important; }
      `}</style>

      <AppHeader pageName="My Info" userInitial={userInitial} />

      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f0e8',
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          paddingTop: '104px',
          paddingBottom: '80px',
        }}
      >
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 16px' }}>

          {/* Page title */}
          <div className="fade-in-up" style={{ marginBottom: '24px' }}>
            <h1
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '32px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                margin: '0 0 6px',
                lineHeight: 1.15,
              }}
            >
              My Info
            </h1>
            <p style={{ color: '#8a8a7e', fontSize: '13px', fontWeight: 300, margin: 0 }}>
              Help us personalise your insights
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', gap: '9px', marginTop: '60px', justifyContent: 'center' }}>
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
            <div className="fade-in-up">
              {error && (
                <div
                  style={{
                    backgroundColor: '#fff8f6', borderRadius: '12px',
                    padding: '12px 16px', border: '1px solid rgba(192,57,43,0.2)',
                    marginBottom: '14px',
                  }}
                >
                  <p style={{ color: '#c0392b', fontSize: '13px', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* About You */}
              <div style={cardStyle}>
                <span style={sectionLabelStyle}>About You</span>

                <label style={fieldLabelStyle}>First name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={inputStyle}
                />

                <label style={fieldLabelStyle}>Age</label>
                <input
                  type="number"
                  placeholder="e.g. 32"
                  value={age}
                  min={1}
                  max={120}
                  onChange={(e) => setAge(e.target.value)}
                  style={inputStyle}
                />

                <label style={fieldLabelStyle}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ ...inputStyle, appearance: 'auto' }}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>

                <label style={fieldLabelStyle}>Diet type</label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  style={{ ...inputStyle, appearance: 'auto', marginBottom: 0 }}
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

              {/* Wellness Goals */}
              <div style={cardStyle}>
                <span style={sectionLabelStyle}>Wellness Goals</span>
                <p style={{ color: '#8a8a7e', fontSize: '12px', margin: '0 0 14px' }}>
                  Pick up to 3 · {wellnessGoals.length}/3 selected
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {WELLNESS_GOALS.map((goal) => {
                    const active = wellnessGoals.includes(goal)
                    const disabled = !active && wellnessGoals.length >= 3
                    return (
                      <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className="pill-btn"
                        disabled={disabled}
                        style={{
                          backgroundColor: active ? '#1e4d35' : '#ffffff',
                          color: active ? '#ffffff' : '#5a5a52',
                          border: active ? '1px solid #1e4d35' : '1px solid rgba(30,77,53,0.15)',
                          borderRadius: '100px',
                          padding: '7px 16px',
                          fontSize: '12px',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit',
                          opacity: disabled ? 0.4 : 1,
                        }}
                      >
                        {goal}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Current Symptoms */}
              <div style={cardStyle}>
                <span style={sectionLabelStyle}>Current Symptoms</span>
                <p style={{ color: '#8a8a7e', fontSize: '12px', margin: '0 0 14px' }}>
                  Select all that apply
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CURRENT_SYMPTOMS.map((symptom) => {
                    const active = currentSymptoms.includes(symptom)
                    return (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className="pill-btn"
                        style={{
                          backgroundColor: active ? '#1e4d35' : '#ffffff',
                          color: active ? '#ffffff' : '#5a5a52',
                          border: active ? '1px solid #1e4d35' : '1px solid rgba(30,77,53,0.15)',
                          borderRadius: '100px',
                          padding: '7px 16px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {symptom}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="save-outline-btn"
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#1e4d35',
                  border: '1.5px solid #1e4d35',
                  borderRadius: '100px',
                  padding: '13px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>

              {/* Success feedback */}
              {saved && (
                <p
                  className="save-toast"
                  style={{
                    color: '#1e4d35',
                    fontSize: '12px',
                    textAlign: 'center',
                    marginTop: '10px',
                    fontFamily: 'inherit',
                  }}
                >
                  Profile saved ✓
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
