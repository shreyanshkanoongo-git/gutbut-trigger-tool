import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-in-up-2 { animation: fadeInUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
        .fade-in-up-3 { animation: fadeInUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.24s both; }
        .fade-in-up-4 { animation: fadeInUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.36s both; }

        .cta-btn {
          display: inline-block;
          background-color: #1e4d35;
          color: #f5f0e8;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 16px 40px;
          border-radius: 100px;
          border: 2px solid #1e4d35;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.2s ease, transform 0.15s ease;
        }
        .cta-btn:hover {
          background-color: #163b28;
          border-color: #163b28;
          transform: translateY(-2px);
        }
        .cta-btn:active { transform: translateY(0); }

        .cta-btn-secondary {
          display: inline-block;
          background-color: transparent;
          color: #1e4d35;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 16px 40px;
          border-radius: 100px;
          border: 2px solid #1e4d35;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
        }
        .cta-btn-secondary:hover {
          background-color: #1e4d35;
          color: #f5f0e8;
          transform: translateY(-2px);
        }
        .cta-btn-secondary:active { transform: translateY(0); }

        .cta-group {
          display: flex;
          gap: 14px;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .cta-group { flex-direction: column; gap: 10px; width: 100%; max-width: 280px; }
          .cta-btn, .cta-btn-secondary { width: 100%; text-align: center; padding: 15px 32px; }
        }

        .step-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background-color: #edf5f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1e4d35;
          flex-shrink: 0;
        }

        .discover-card {
          background-color: #ffffff;
          border: 1px solid #e4ddd2;
          border-radius: 24px;
          padding: 28px 26px;
          flex: 1;
          min-width: 0;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .discover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(30,77,53,0.09);
        }

        .section-label {
          font-size: 0.7rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 600;
          color: #7a9185;
          margin-bottom: 14px;
        }

        @media (max-width: 640px) {
          .steps-row { flex-direction: column !important; gap: 28px !important; }
          .discover-row { flex-direction: column !important; }
          .hero-heading { font-size: 2.2rem !important; }
          .connector-arrow { display: none !important; }
          .hero-section { padding: 64px 20px 56px !important; }
          .cta-section { padding: 64px 20px 80px !important; }
          .cta-h2 { font-size: 1.75rem !important; }
          .discover-card { min-width: 0 !important; width: 100% !important; }
        }
      `}</style>

      <main
        style={{
          backgroundColor: '#f5f0e8',
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          minHeight: '100vh',
        }}
      >
        {/* ── Hero ── */}
        <section
          className="hero-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '100px 24px 90px',
          }}
        >
          {/* Wordmark */}
          <div className="fade-in-up" style={{ marginBottom: '52px' }}>
            <span
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: '#1e4d35',
                fontSize: '1.125rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              GutBut
            </span>
          </div>

          <h1
            className="hero-heading fade-in-up-2"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              color: '#1e4d35',
              fontSize: '3.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              maxWidth: '680px',
              margin: '0 0 24px',
            }}
          >
            Discover What&apos;s Hurting Your Gut
          </h1>

          <p
            className="fade-in-up-3"
            style={{
              color: '#5a7a6a',
              fontSize: '1.0625rem',
              lineHeight: 1.7,
              maxWidth: '500px',
              margin: '0 0 44px',
              fontWeight: 400,
            }}
          >
            Log your meals, symptoms, sleep and stress. Get AI-powered insights that tell you exactly what&apos;s triggering your gut issues — in plain language.
          </p>

          <div className="cta-group fade-in-up-4">
            <Link href="/signup" className="cta-btn">
              Sign Up Free
            </Link>
            <Link href="/login" className="cta-btn-secondary">
              Log In
            </Link>
          </div>
        </section>

        {/* ── Divider ── */}
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ height: '1px', backgroundColor: '#d6cfc4' }} />
        </div>

        {/* ── How It Works ── */}
        <section style={{ padding: '80px 24px', maxWidth: '720px', margin: '0 auto' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>How It Works</p>
          <h2
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              color: '#1e4d35',
              fontSize: '2rem',
              fontWeight: 600,
              letterSpacing: '-0.015em',
              textAlign: 'center',
              margin: '0 0 52px',
            }}
          >
            Three simple steps
          </h2>

          <div
            className="steps-row"
            style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}
          >
            {/* Step 1 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div className="step-icon" style={{ marginBottom: '20px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#9aada5',
                  marginBottom: '10px',
                }}
              >
                Step 1
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.1875rem',
                  fontWeight: 600,
                  margin: '0 0 10px',
                }}
              >
                Log Daily
              </h3>
              <p style={{ color: '#7a9185', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                Track meals, symptoms, sleep and stress in seconds
              </p>
            </div>

            {/* Connector */}
            <div
              className="connector-arrow"
              style={{
                marginTop: '26px',
                color: '#c8bfb0',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}
              aria-hidden
            >
              →
            </div>

            {/* Step 2 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div className="step-icon" style={{ marginBottom: '20px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" />
                  <path d="M12 6v6l4 2" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#9aada5',
                  marginBottom: '10px',
                }}
              >
                Step 2
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.1875rem',
                  fontWeight: 600,
                  margin: '0 0 10px',
                }}
              >
                Find Patterns
              </h3>
              <p style={{ color: '#7a9185', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                AI analyses your data and connects the dots
              </p>
            </div>

            {/* Connector */}
            <div
              className="connector-arrow"
              style={{
                marginTop: '26px',
                color: '#c8bfb0',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}
              aria-hidden
            >
              →
            </div>

            {/* Step 3 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div className="step-icon" style={{ marginBottom: '20px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#9aada5',
                  marginBottom: '10px',
                }}
              >
                Step 3
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.1875rem',
                  fontWeight: 600,
                  margin: '0 0 10px',
                }}
              >
                Discover Triggers
              </h3>
              <p style={{ color: '#7a9185', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                Know exactly what&apos;s causing your gut issues
              </p>
            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ height: '1px', backgroundColor: '#d6cfc4' }} />
        </div>

        {/* ── What You'll Discover ── */}
        <section style={{ padding: '80px 24px', maxWidth: '720px', margin: '0 auto' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>What You&apos;ll Discover</p>
          <h2
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              color: '#1e4d35',
              fontSize: '2rem',
              fontWeight: 600,
              letterSpacing: '-0.015em',
              textAlign: 'center',
              margin: '0 0 48px',
            }}
          >
            Your health, finally decoded
          </h2>

          <div
            className="discover-row"
            style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}
          >
            {/* Card 1 */}
            <div className="discover-card">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#e8f5ee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1e6641',
                  marginBottom: '18px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  margin: '0 0 10px',
                }}
              >
                Food Triggers
              </h3>
              <p style={{ color: '#7a9185', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                Find out which specific foods are causing bloating, cramps or fatigue
              </p>
            </div>

            {/* Card 2 */}
            <div className="discover-card">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#e8f0fb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2c5ea8',
                  marginBottom: '18px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  margin: '0 0 10px',
                }}
              >
                Sleep Impact
              </h3>
              <p style={{ color: '#7a9185', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                See how sleep duration affects your symptoms the next day
              </p>
            </div>

            {/* Card 3 */}
            <div className="discover-card">
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#fef9e7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b07d00',
                  marginBottom: '18px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: '#1e4d35',
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  margin: '0 0 10px',
                }}
              >
                Stress Patterns
              </h3>
              <p style={{ color: '#7a9185', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                Understand the link between your stress levels and gut health
              </p>
            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ height: '1px', backgroundColor: '#d6cfc4' }} />
        </div>

        {/* ── Final CTA ── */}
        <section
          className="cta-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '90px 24px 110px',
          }}
        >
          <h2
            className="cta-h2"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              color: '#1e4d35',
              fontSize: '2.25rem',
              fontWeight: 600,
              letterSpacing: '-0.015em',
              margin: '0 0 16px',
              maxWidth: '480px',
            }}
          >
            Ready to find your triggers?
          </h2>
          <p
            style={{
              color: '#7a9185',
              fontSize: '0.9375rem',
              lineHeight: 1.65,
              maxWidth: '360px',
              margin: '0 0 40px',
            }}
          >
            Start logging today and let AI do the hard work of connecting the dots.
          </p>
          <div className="cta-group">
            <Link href="/signup" className="cta-btn">
              Sign Up Free
            </Link>
            <Link href="/login" className="cta-btn-secondary">
              Log In
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
