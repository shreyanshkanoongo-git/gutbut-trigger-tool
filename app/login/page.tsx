'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setError('')
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return }

    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) { setError(signInError.message); setLoading(false); return }

    document.cookie = 'sb-gutbut-session=1; path=/; max-age=604800; SameSite=Lax'
    router.push('/log')
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        input[type="email"], input[type="password"] {
          outline: none;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        input[type="email"]:focus, input[type="password"]:focus {
          border-color: #1e4d35 !important;
          background-color: #ffffff !important;
        }
        .submit-btn { transition: background-color 0.2s ease, transform 0.15s ease; }
        .submit-btn:not(:disabled):hover  { background-color: #163b28 !important; }
        .submit-btn:not(:disabled):active { transform: scale(0.98); }

        @media (max-width: 640px) {
          .auth-card { padding: 24px 20px !important; }
        }
      `}</style>

      <main
        className="min-h-screen flex flex-col items-center justify-center px-5 py-16"
        style={{ backgroundColor: '#f5f0e8', fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}
      >
        <div className="w-full max-w-sm fade-in-up">
          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
              GutBut
            </h1>
            <p
              style={{
                color: '#7a9185',
                fontSize: '0.75rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginTop: '5px',
                marginBottom: 0,
                fontWeight: 400,
              }}
            >
              Gut Health Tracker
            </p>
          </div>

          {/* Card */}
          <div
            className="auth-card"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '26px',
              padding: '32px',
              border: '1px solid #e4ddd2',
              boxShadow: '0 6px 30px rgba(30,77,53,0.07)',
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '1.375rem',
                fontWeight: 600,
                margin: '0 0 24px',
                lineHeight: 1.2,
              }}
            >
              Welcome back
            </h2>

            {/* Error */}
            {error && (
              <div
                style={{
                  backgroundColor: '#fff8f6',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  border: '1px solid #fdd5cc',
                  marginBottom: '20px',
                }}
              >
                <p style={{ color: '#c0392b', fontSize: '0.8375rem', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Email */}
            <label style={{ color: '#7a9185', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #e4ddd2',
                borderRadius: '14px',
                padding: '13px 16px',
                fontSize: '0.9rem',
                marginBottom: '18px',
                fontFamily: 'inherit',
                color: '#1e4d35',
                backgroundColor: '#faf8f4',
                boxSizing: 'border-box',
                display: 'block',
              }}
            />

            {/* Password */}
            <label style={{ color: '#7a9185', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%',
                border: '1px solid #e4ddd2',
                borderRadius: '14px',
                padding: '13px 16px',
                fontSize: '0.9rem',
                marginBottom: '26px',
                fontFamily: 'inherit',
                color: '#1e4d35',
                backgroundColor: '#faf8f4',
                boxSizing: 'border-box',
                display: 'block',
              }}
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="submit-btn"
              style={{
                width: '100%',
                backgroundColor: loading ? '#8eb8a3' : '#1e4d35',
                color: '#f5f0e8',
                borderRadius: '14px',
                padding: '15px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.02em',
              }}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>

          {/* Link to signup */}
          <p style={{ textAlign: 'center', marginTop: '22px', color: '#9aada5', fontSize: '0.875rem' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              style={{ color: '#1e4d35', fontWeight: 600, textDecoration: 'none' }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
