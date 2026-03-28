'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-visible') }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.5; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }

        .hero-in   { animation: fadeInUp 0.65s cubic-bezier(0.22,1,0.36,1) both; }
        .hero-in-2 { animation: fadeInUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.1s  both; }
        .hero-in-3 { animation: fadeInUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.2s  both; }
        .hero-in-4 { animation: fadeInUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.32s both; }
        .hero-in-5 { animation: fadeInUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.48s both; }

        .pulse-dot { animation: pulseDot 1.5s ease-in-out infinite; }

        .reveal {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1);
        }
        .reveal.is-visible   { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: 0.1s; }
        .reveal-d2 { transition-delay: 0.2s; }
        .reveal-d3 { transition-delay: 0.3s; }

        .hover-lift {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          cursor: default;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 44px rgba(30,77,53,0.11);
        }
        .hover-lift-sm {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: default;
        }
        .hover-lift-sm:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.1);
        }

        .nav-outline-btn {
          background: transparent;
          color: #1e4d35;
          border: 1.5px solid #c8bfb0;
          border-radius: 100px;
          padding: 9px 22px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.02em;
          text-decoration: none;
          display: inline-block;
          transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
        }
        .nav-outline-btn:hover { background-color: #1e4d35; color: #f5f0e8; border-color: #1e4d35; }

        .nav-solid-btn {
          background: #1e4d35;
          color: #f5f0e8;
          border: 1.5px solid #1e4d35;
          border-radius: 100px;
          padding: 9px 22px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.02em;
          text-decoration: none;
          display: inline-block;
          transition: background-color 0.18s ease, transform 0.15s ease;
        }
        .nav-solid-btn:hover { background-color: #163b28; transform: translateY(-1px); }

        .cta-primary {
          display: inline-block;
          background: #1e4d35;
          color: #f5f0e8;
          border-radius: 100px;
          padding: 16px 36px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: background-color 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
        }
        .cta-primary:hover {
          background-color: #163b28;
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(30,77,53,0.28);
        }
        .cta-primary:active { transform: translateY(0); }

        .cta-ghost {
          display: inline-block;
          background: transparent;
          color: #1e4d35;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.02em;
          text-decoration: none;
          padding: 10px 4px;
          border-bottom: 1.5px solid transparent;
          transition: border-color 0.18s ease;
        }
        .cta-ghost:hover { border-bottom-color: #1e4d35; }

        @media (max-width: 640px) {
          .hero-section   { min-height: auto !important; padding: 108px 20px 64px !important; }
          .hero-h1        { font-size: 2.5rem !important; }
          .cta-row        { flex-direction: column !important; align-items: center !important; gap: 14px !important; }
          .browser-outer  { display: none !important; }
          .stats-row      { flex-wrap: wrap; }
          .stat-divider   { display: none !important; }
          .stats-stat     { min-width: 42%; padding: 12px !important; }
          .section-pad    { padding: 64px 20px !important; }
          .grid-3         { flex-direction: column !important; }
          .grid-2         { flex-direction: column !important; }
          .how-cards      { flex-direction: column !important; }
          .exp-2col       { flex-direction: column !important; gap: 40px !important; }
          .footer-pad     { padding: 48px 20px !important; }
          .cta-h2         { font-size: 2rem !important; }
        }
      `}</style>

      {/* ────────────────────────────────── Fixed Nav ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          backgroundColor: 'rgba(245,240,232,0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(214,207,196,0.55)',
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            color: '#1e4d35',
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
          }}
        >
          GutBut
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/login" className="nav-outline-btn">Log In</Link>
          <Link href="/signup" className="nav-solid-btn">Sign Up Free</Link>
        </div>
      </nav>

      <main style={{ backgroundColor: '#f5f0e8', fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}>

        {/* ────────────────────────────────── 1. Hero ── */}
        <section
          className="hero-section"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '96px 24px 80px',
          }}
        >
          {/* Badge */}
          <div
            className="hero-in"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#e8f5ee',
              border: '1px solid #b8ddc8',
              borderRadius: '100px',
              padding: '7px 16px',
              marginBottom: '32px',
            }}
          >
            <span
              className="pulse-dot"
              style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#1e4d35', flexShrink: 0, display: 'inline-block' }}
            />
            <span style={{ color: '#1e4d35', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.04em' }}>
              AI-powered gut trigger discovery
            </span>
          </div>

          {/* Headline */}
          <h1
            className="hero-h1 hero-in-2"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              color: '#1e4d35',
              fontSize: '4.25rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              maxWidth: '640px',
              margin: '0 0 24px',
            }}
          >
            Your gut knows.<br />
            <em>Now you will too.</em>
          </h1>

          {/* Subheading */}
          <p
            className="hero-in-3"
            style={{
              color: '#5a7a6a',
              fontSize: '1.0625rem',
              fontWeight: 300,
              lineHeight: 1.75,
              maxWidth: '520px',
              margin: '0 0 44px',
            }}
          >
            Log your meals, symptoms, sleep and stress in seconds. Get AI-powered insights that tell you exactly what&apos;s triggering your gut issues — in plain language.
          </p>

          {/* CTAs */}
          <div
            className="cta-row hero-in-4"
            style={{ display: 'flex', alignItems: 'center', gap: '22px', marginBottom: '68px' }}
          >
            <Link href="/signup" className="cta-primary">Start tracking free →</Link>
            <a href="#how-it-works" className="cta-ghost">See how it works →</a>
          </div>

          {/* Browser Frame Mockup */}
          <div
            className="browser-outer hero-in-5"
            style={{ width: '100%', maxWidth: '740px', padding: '0 8px' }}
          >
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 36px 80px rgba(30,77,53,0.14), 0 8px 24px rgba(30,77,53,0.08)',
                border: '1px solid #d6cfc4',
              }}
            >
              {/* Browser chrome bar */}
              <div
                style={{
                  backgroundColor: '#ede7d9',
                  padding: '11px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {['#ff5f57','#febc2e','#28c840'].map((c) => (
                    <div key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: c }} />
                  ))}
                </div>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#f5f0e8',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '0.7rem',
                    color: '#9aada5',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                  }}
                >
                  gutbut-trigger-tool.vercel.app/insights
                </div>
              </div>

              {/* Mock insights content */}
              <div style={{ backgroundColor: '#f5f0e8', padding: '20px 20px 20px' }}>
                {/* Mini nav */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      color: '#1e4d35',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}
                  >
                    GutBut
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['Log','History','Insights','Experiments'].map((item) => (
                      <span
                        key={item}
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: item === 'Insights' ? 600 : 400,
                          color: item === 'Insights' ? '#f5f0e8' : '#7a9185',
                          backgroundColor: item === 'Insights' ? '#1e4d35' : 'transparent',
                          padding: '4px 10px',
                          borderRadius: '100px',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Weekly summary card */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e4ddd2',
                    borderLeft: '4px solid #1e4d35',
                    padding: '12px 14px',
                    marginBottom: '12px',
                  }}
                >
                  <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a9185', margin: '0 0 4px' }}>
                    Weekly Summary
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#4a5568', lineHeight: 1.55, margin: 0 }}>
                    🌿 This week, dairy appeared before 5 out of 6 bloating episodes. Strong signal emerging — consider a 7-day elimination trial.
                  </p>
                </div>

                {/* 2×2 insight cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { badge: 'HIGH',     badgeColor: '#c0392b', badgeBg: '#fff0ee', text: 'Dairy followed by bloating in 5 out of 6 instances' },
                    { badge: 'MEDIUM',   badgeColor: '#b07d00', badgeBg: '#fffbec', text: 'Late meals correlate with disrupted sleep patterns' },
                    { badge: 'POSITIVE', badgeColor: '#1e4d35', badgeBg: '#edf5f0', text: 'Probiotic days showed 40% fewer gut symptoms' },
                    { badge: 'MEDIUM',   badgeColor: '#b07d00', badgeBg: '#fffbec', text: 'High stress days followed by cramping 73% of the time' },
                  ].map(({ badge, badgeColor, badgeBg, text }, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        border: '1px solid #e4ddd2',
                        padding: '10px 11px',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          fontSize: '0.5rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          padding: '2px 7px',
                          borderRadius: '100px',
                          marginBottom: '5px',
                        }}
                      >
                        {badge}
                      </span>
                      <p style={{ fontSize: '0.65rem', color: '#2c3e30', lineHeight: 1.5, margin: 0 }}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────── 2. Stats Row ── */}
        <section style={{ backgroundColor: '#ffffff' }}>
          <div
            className="stats-row"
            style={{
              maxWidth: '880px',
              margin: '0 auto',
              padding: '52px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            <div className="stats-stat reveal" style={{ textAlign: 'center', padding: '0 20px' }}>
              <div style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", color: '#1e4d35', fontSize: '2.375rem', fontWeight: 700, lineHeight: 1, marginBottom: '7px' }}>5</div>
              <div style={{ color: '#9aada5', fontSize: '0.8125rem' }}>Trigger types tracked</div>
            </div>
            <div className="stat-divider" style={{ width: '1px', height: '52px', backgroundColor: '#e4ddd2', flexShrink: 0 }} />
            <div className="stats-stat reveal reveal-d1" style={{ textAlign: 'center', padding: '0 20px' }}>
              <div style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", color: '#1e4d35', fontSize: '2.375rem', fontWeight: 700, lineHeight: 1, marginBottom: '7px' }}>10s</div>
              <div style={{ color: '#9aada5', fontSize: '0.8125rem' }}>To log an entry</div>
            </div>
            <div className="stat-divider" style={{ width: '1px', height: '52px', backgroundColor: '#e4ddd2', flexShrink: 0 }} />
            <div className="stats-stat reveal reveal-d2" style={{ textAlign: 'center', padding: '0 20px' }}>
              <div style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", color: '#1e4d35', fontSize: '2.375rem', fontWeight: 700, lineHeight: 1, marginBottom: '7px' }}>7d</div>
              <div style={{ color: '#9aada5', fontSize: '0.8125rem' }}>To first insights</div>
            </div>
            <div className="stat-divider" style={{ width: '1px', height: '52px', backgroundColor: '#e4ddd2', flexShrink: 0 }} />
            <div className="stats-stat reveal reveal-d3" style={{ textAlign: 'center', padding: '0 20px' }}>
              <div style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", color: '#1e4d35', fontSize: '2.375rem', fontWeight: 700, lineHeight: 1, marginBottom: '7px' }}>AI</div>
              <div style={{ color: '#9aada5', fontSize: '0.8125rem' }}>Powered analysis</div>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────── 3. How It Works ── */}
        <section
          id="how-it-works"
          className="section-pad"
          style={{ backgroundColor: '#f5f0e8', padding: '96px 24px' }}
        >
          <div style={{ maxWidth: '880px', margin: '0 auto' }}>
            <p className="reveal" style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, color: '#7a9185', textAlign: 'center', marginBottom: '14px' }}>
              HOW IT WORKS
            </p>
            <h2
              className="reveal"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '2.25rem',
                fontWeight: 600,
                letterSpacing: '-0.015em',
                textAlign: 'center',
                margin: '0 0 56px',
                lineHeight: 1.2,
              }}
            >
              Three steps to understanding your gut
            </h2>

            <div className="how-cards" style={{ display: 'flex', gap: '20px' }}>
              {[
                { num: '01', icon: '🍽️', title: 'Log daily',       desc: 'Track meals, symptoms, sleep, stress and supplements in under 10 seconds each. No forms, no friction.' },
                { num: '02', icon: '🔍', title: 'Find patterns',    desc: 'AI analyses your data and connects the dots automatically — spotting correlations you\'d never notice yourself.' },
                { num: '03', icon: '✓',  title: 'Confirm triggers', desc: 'Run structured elimination experiments and get an AI verdict: confirmed trigger, inconclusive, or not a trigger.' },
              ].map(({ num, icon, title, desc }, i) => (
                <div
                  key={num}
                  className={`hover-lift reveal${i === 1 ? ' reveal-d1' : i === 2 ? ' reveal-d2' : ''}`}
                  style={{
                    flex: 1,
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #e4ddd2',
                    padding: '32px 28px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 2px 14px rgba(30,77,53,0.05)',
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '16px',
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      fontSize: '5.5rem',
                      fontWeight: 700,
                      color: 'rgba(30,77,53,0.055)',
                      lineHeight: 1,
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {num}
                  </div>
                  <div style={{ fontSize: '1.75rem', marginBottom: '16px' }}>{icon}</div>
                  <h3
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      color: '#1e4d35',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      margin: '0 0 12px',
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ color: '#7a9185', fontSize: '0.875rem', lineHeight: 1.72, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────────────────────── 4. Quote Strip ── */}
        <section style={{ backgroundColor: '#ede7d9', padding: '80px 24px' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
            <p
              className="reveal"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                fontSize: '1.5625rem',
                fontStyle: 'italic',
                color: '#1e4d35',
                lineHeight: 1.65,
                margin: '0 0 22px',
                fontWeight: 400,
              }}
            >
              &ldquo;I logged dairy for 5 days and finally saw it — every single time, bloating followed within hours. No doctor had ever shown me that.&rdquo;
            </p>
            <p className="reveal" style={{ color: '#9aada5', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.04em', margin: 0 }}>
              — Early tester, GutBut Trigger Tool
            </p>
          </div>
        </section>

        {/* ────────────────────────────────── 5. What You'll Discover ── */}
        <section className="section-pad" style={{ backgroundColor: '#1e4d35', padding: '96px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p className="reveal" style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(245,240,232,0.5)', textAlign: 'center', marginBottom: '14px' }}>
              WHAT YOU&apos;LL DISCOVER
            </p>
            <h2
              className="reveal"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#f5f0e8',
                fontSize: '2.25rem',
                fontWeight: 600,
                letterSpacing: '-0.015em',
                textAlign: 'center',
                margin: '0 0 56px',
                lineHeight: 1.2,
              }}
            >
              Your health, finally decoded
            </h2>

            <div className="grid-3" style={{ display: 'flex', gap: '20px' }}>
              {[
                {
                  icon: '🍽️',
                  title: 'Food Triggers',
                  desc: 'Find out which specific foods are causing bloating, cramps or fatigue with exact counts and timings.',
                  example: '"Every time you ate dairy, you felt bloated within 2–3 hours."',
                },
                {
                  icon: '🌙',
                  title: 'Sleep Impact',
                  desc: 'See exactly how sleep duration affects your symptoms the next day — down to the hour.',
                  example: '"Your energy was consistently low on days you slept under 6 hours."',
                },
                {
                  icon: '⚡',
                  title: 'Stress Patterns',
                  desc: 'Understand the link between your stress levels and gut symptoms with real percentage data.',
                  example: '"High stress days were followed by digestive discomfort 73% of the time."',
                },
              ].map(({ icon, title, desc, example }, i) => (
                <div
                  key={title}
                  className={`hover-lift-sm reveal${i === 1 ? ' reveal-d1' : i === 2 ? ' reveal-d2' : ''}`}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.09)',
                    border: '1px solid rgba(255,255,255,0.13)',
                    borderRadius: '20px',
                    padding: '30px 26px',
                  }}
                >
                  <div style={{ fontSize: '1.75rem', marginBottom: '16px' }}>{icon}</div>
                  <h3
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      color: '#f5f0e8',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      margin: '0 0 10px',
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ color: 'rgba(245,240,232,0.68)', fontSize: '0.875rem', lineHeight: 1.72, margin: '0 0 18px' }}>{desc}</p>
                  <div
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.13)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                    }}
                  >
                    <p style={{ color: 'rgba(245,240,232,0.88)', fontSize: '0.8125rem', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                      {example}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────────────────────────────── 6. Experiment Mode ── */}
        <section className="section-pad" style={{ backgroundColor: '#f5f0e8', padding: '96px 24px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="exp-2col" style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>

              {/* Left: copy */}
              <div style={{ flex: 1 }} className="reveal">
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, color: '#7a9185', marginBottom: '14px' }}>
                  EXPERIMENT MODE
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                    color: '#1e4d35',
                    fontSize: '2.125rem',
                    fontWeight: 600,
                    letterSpacing: '-0.015em',
                    margin: '0 0 18px',
                    lineHeight: 1.2,
                  }}
                >
                  Don&apos;t just suspect.<br /><em>Confirm.</em>
                </h2>
                <p style={{ color: '#5a7a6a', fontSize: '0.9375rem', lineHeight: 1.78, margin: '0 0 30px', fontWeight: 300 }}>
                  Once you have a suspected trigger, GutBut guides you through a structured elimination experiment — and lets the data give you the verdict.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    'Structured experiments — 7, 14, or 21 days with daily check-ins',
                    'Before vs. during comparison — real data, not guesswork',
                    'AI verdict: confirmed trigger, inconclusive, or not a trigger',
                    'Shareable results — show your doctor what the data says',
                  ].map((point) => (
                    <div key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div
                        style={{
                          width: '22px', height: '22px',
                          borderRadius: '50%',
                          backgroundColor: '#1e4d35',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <polyline points="2 6 5 9 10 3" stroke="#f5f0e8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span style={{ color: '#4a5568', fontSize: '0.9rem', lineHeight: 1.65 }}>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: mock experiment card */}
              <div className="reveal reveal-d1" style={{ flex: 1 }}>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '22px',
                    border: '1px solid #e4ddd2',
                    padding: '28px 26px',
                    boxShadow: '0 8px 40px rgba(30,77,53,0.09)',
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
                    <div>
                      <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9aada5', margin: '0 0 4px' }}>
                        Experiment
                      </p>
                      <h3
                        style={{
                          fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                          color: '#1e4d35',
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          margin: '0 0 3px',
                        }}
                      >
                        Dairy Elimination
                      </h3>
                      <span style={{ color: '#9aada5', fontSize: '0.8rem' }}>7 Days</span>
                    </div>
                    <span
                      style={{
                        backgroundColor: '#edf5f0',
                        color: '#1e4d35',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        padding: '5px 13px',
                        borderRadius: '100px',
                        flexShrink: 0,
                      }}
                    >
                      ✓ Confirmed
                    </span>
                  </div>

                  {/* Before / During scores */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: '#fff5f4',
                        border: '1px solid #fdd5cc',
                        borderRadius: '12px',
                        padding: '13px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.1em', color: '#c0392b', textTransform: 'uppercase', marginBottom: '4px' }}>Before</div>
                      <div style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.75rem', fontWeight: 700, color: '#c0392b', lineHeight: 1 }}>4.1</div>
                      <div style={{ fontSize: '0.65rem', color: '#9aada5', marginTop: '3px' }}>avg severity</div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: '#edf5f0',
                        border: '1px solid #b8ddc8',
                        borderRadius: '12px',
                        padding: '13px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.1em', color: '#1e4d35', textTransform: 'uppercase', marginBottom: '4px' }}>During</div>
                      <div style={{ fontFamily: "var(--font-playfair, 'Playfair Display', serif)", fontSize: '1.75rem', fontWeight: 700, color: '#1e4d35', lineHeight: 1 }}>1.4</div>
                      <div style={{ fontSize: '0.65rem', color: '#9aada5', marginTop: '3px' }}>avg severity</div>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {[
                      { label: 'Before', pct: 82, color: '#c0392b' },
                      { label: 'During', pct: 28, color: '#1e4d35' },
                    ].map(({ label, pct, color }) => (
                      <div key={label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#7a9185', fontWeight: 500 }}>{label}</span>
                          <span style={{ fontSize: '0.75rem', color, fontWeight: 600 }}>{pct}%</span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '100px', backgroundColor: '#f0ebe3', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '100px' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI verdict */}
                  <div
                    style={{
                      backgroundColor: '#f7faf8',
                      border: '1px solid #cfe6d7',
                      borderRadius: '12px',
                      padding: '13px 14px',
                    }}
                  >
                    <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1e4d35', margin: '0 0 6px' }}>
                      AI Verdict
                    </p>
                    <p style={{ fontSize: '0.8125rem', fontStyle: 'italic', color: '#4a5568', lineHeight: 1.65, margin: 0 }}>
                      Symptoms reduced by 66% during dairy elimination. This is a strong signal. Dairy is likely a primary gut trigger for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────── 7. Final CTA ── */}
        <section
          className="section-pad"
          style={{ backgroundColor: '#ffffff', padding: '96px 24px', textAlign: 'center' }}
        >
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <p className="reveal" style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, color: '#7a9185', marginBottom: '20px' }}>
              GET STARTED TODAY
            </p>
            <h2
              className="cta-h2 reveal"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '2.625rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                margin: '0 0 20px',
                lineHeight: 1.15,
              }}
            >
              Your gut has been<br /><em>trying to tell you something.</em>
            </h2>
            <p
              className="reveal"
              style={{ color: '#7a9185', fontSize: '1rem', lineHeight: 1.78, margin: '0 0 44px', fontWeight: 300 }}
            >
              Start logging today. Within a week, you&apos;ll have insights no doctor&apos;s appointment has ever given you.
            </p>
            <div className="reveal" style={{ marginBottom: '36px' }}>
              <Link
                href="/signup"
                className="cta-primary"
                style={{ fontSize: '1.0625rem', padding: '18px 44px' }}
              >
                Start tracking free →
              </Link>
            </div>
            <div
              className="reveal"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', flexWrap: 'wrap' }}
            >
              {['Free to start', 'No credit card required', 'Your data stays private'].map((trust) => (
                <span
                  key={trust}
                  style={{ color: '#9aada5', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#9aada5" strokeWidth="1.25" />
                    <polyline points="4.5 7 6.2 8.7 9.5 5.5" stroke="#9aada5" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {trust}
                </span>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ────────────────────────────────── Footer ── */}
      <footer
        className="footer-pad"
        style={{ backgroundColor: '#ede7d9', padding: '52px 24px', textAlign: 'center' }}
      >
        <div
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            color: '#1e4d35',
            fontSize: '1.125rem',
            fontWeight: 700,
            marginBottom: '10px',
          }}
        >
          GutBut
        </div>
        <p style={{ color: '#9aada5', fontSize: '0.8125rem', margin: 0, fontWeight: 400 }}>
          Built by Shreyansh Kanoongo · 2026
        </p>
      </footer>
    </>
  )
}
