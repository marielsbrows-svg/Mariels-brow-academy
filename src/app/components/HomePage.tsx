import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const HomePage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await supabase.from('waitlist').insert({ email });
      setSubmitted(true);
    } catch {
      // still show success to avoid email harvesting detection
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@200;300;400&display=swap');

        .home-root {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: #000;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        /* NAV */
        .home-nav {
          position: absolute;
          top: 0; left: 0; right: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 48px;
        }

        .home-nav-login {
          font-size: 0.58rem;
          font-weight: 300;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color 0.2s;
        }
        .home-nav-login:hover { color: #fff; }

        .home-nav-logo {
          text-align: center;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .home-logo-main {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.6rem;
          letter-spacing: 0.12em;
          color: #fff;
          line-height: 1;
          display: block;
        }

        .home-logo-sub {
          font-size: 0.42rem;
          font-weight: 200;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          display: block;
          margin-top: 4px;
        }

        .home-nav-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        /* VIDEO SECTION */
        .home-videos {
          position: relative;
          width: 100%;
          height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 3px;
        }

        .home-video-cell {
          position: relative;
          overflow: hidden;
          background: #111;
        }

        .home-video-cell video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .home-video-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 100%);
        }

        /* HEADLINE OVERLAY */
        .home-headline-wrap {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: none;
          padding: 0 24px;
        }

        .home-eyebrow {
          font-size: 0.52rem;
          font-weight: 200;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .home-eyebrow::before,
        .home-eyebrow::after {
          content: '';
          width: 32px;
          height: 1px;
          background: rgba(255,255,255,0.2);
        }

        .home-headline {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 10vw, 9rem);
          letter-spacing: 0.06em;
          line-height: 0.9;
          color: #fff;
          text-transform: uppercase;
        }

        .home-headline-thin {
          font-family: 'Inter', sans-serif;
          font-size: clamp(0.9rem, 2vw, 1.4rem);
          font-weight: 200;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-top: 16px;
          display: block;
        }

        /* BOTTOM WAITLIST */
        .home-bottom {
          position: relative;
          z-index: 10;
          background: #fff;
          padding: 48px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 48px;
        }

        .home-bottom-left {}

        .home-bottom-tag {
          font-size: 0.48rem;
          font-weight: 300;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #9A9A9A;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .home-bottom-tag::before {
          content: '';
          width: 16px;
          height: 1px;
          background: #D4D4D4;
        }

        .home-bottom-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          letter-spacing: 0.08em;
          color: #000;
          line-height: 1;
        }

        .home-bottom-desc {
          font-size: 0.62rem;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #9A9A9A;
          margin-top: 8px;
          max-width: 280px;
          line-height: 1.7;
        }

        .home-form {
          display: flex;
          gap: 0;
          flex: 1;
          max-width: 480px;
        }

        .home-input {
          flex: 1;
          padding: 16px 20px;
          border: 1px solid #D4D4D4;
          border-right: none;
          background: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: #000;
          outline: none;
          transition: border-color 0.2s;
        }

        .home-input:focus { border-color: #1C1C1C; }
        .home-input::placeholder { color: #D4D4D4; }

        .home-submit {
          padding: 16px 28px;
          background: #000;
          color: #fff;
          border: 1px solid #000;
          font-family: 'Inter', sans-serif;
          font-size: 0.58rem;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .home-submit:hover { background: #1C1C1C; }
        .home-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .home-success {
          font-size: 0.65rem;
          font-weight: 300;
          letter-spacing: 0.1em;
          color: #1C1C1C;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .home-success::before {
          content: '✓';
          width: 24px;
          height: 24px;
          background: #000;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          flex-shrink: 0;
        }

        /* Ticker */
        .home-ticker {
          position: absolute;
          bottom: 32px;
          left: 0; right: 0;
          z-index: 10;
          overflow: hidden;
          pointer-events: none;
        }

        .home-ticker-inner {
          display: flex;
          gap: 0;
          animation: ticker 18s linear infinite;
          white-space: nowrap;
        }

        .home-ticker-item {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.15);
          padding: 0 32px;
          text-transform: uppercase;
        }

        .home-ticker-dot {
          color: rgba(255,255,255,0.08);
          padding: 0 8px;
        }

        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (max-width: 768px) {
          .home-nav { padding: 24px 20px; }
          .home-videos { grid-template-columns: 1fr; }
          .home-video-cell:not(:first-child) { display: none; }
          .home-bottom { flex-direction: column; padding: 32px 20px; gap: 24px; }
          .home-form { max-width: 100%; width: 100%; }
          .home-headline { font-size: 4.5rem; }
        }
      `}</style>

      <div className="home-root">
        {/* NAV */}
        <nav className="home-nav">
          <Link to="/login" className="home-nav-login">Login</Link>
          <div className="home-nav-logo">
            <span className="home-logo-main">Mariel</span>
            <span className="home-logo-sub">Brows · Education</span>
          </div>
          <div className="home-nav-right" style={{ width: '60px' }} />
        </nav>

        {/* VIDEO GRID */}
        <div className="home-videos">
          {/* Video 1 */}
          <div className="home-video-cell">
            <video autoPlay muted loop playsInline>
              {/* Replace src with your actual Instagram video URLs */}
              <source src="https://assets.mixkit.co/videos/preview/mixkit-woman-doing-makeup-in-front-of-a-mirror-4615-large.mp4" type="video/mp4" />
            </video>
            <div className="home-video-overlay" />
          </div>

          {/* Video 2 */}
          <div className="home-video-cell">
            <video autoPlay muted loop playsInline>
              <source src="https://assets.mixkit.co/videos/preview/mixkit-woman-applying-makeup-on-another-woman-4617-large.mp4" type="video/mp4" />
            </video>
            <div className="home-video-overlay" />
          </div>

          {/* Video 3 */}
          <div className="home-video-cell">
            <video autoPlay muted loop playsInline>
              <source src="https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-woman-s-eyes-4608-large.mp4" type="video/mp4" />
            </video>
            <div className="home-video-overlay" />
          </div>

          {/* Headline overlay */}
          <div className="home-headline-wrap">
            <div className="home-eyebrow">Mariel Brows · Education</div>
            <div className="home-headline">Something<br />Is Coming</div>
            <span className="home-headline-thin">The brow certification you've been waiting for</span>
          </div>

          {/* Ticker */}
          <div className="home-ticker">
            <div className="home-ticker-inner">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i}>
                  <span className="home-ticker-item">Brow Mapping Mastery</span>
                  <span className="home-ticker-dot">·</span>
                  <span className="home-ticker-item">Get Certified</span>
                  <span className="home-ticker-dot">·</span>
                  <span className="home-ticker-item">En Español</span>
                  <span className="home-ticker-dot">·</span>
                  <span className="home-ticker-item">Online</span>
                  <span className="home-ticker-dot">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* WAITLIST STRIP */}
        <div className="home-bottom">
          <div className="home-bottom-left">
            <div className="home-bottom-tag">Early Access</div>
            <div className="home-bottom-title">Be First In Line</div>
            <div className="home-bottom-desc">
              Join the waitlist and get notified the moment enrollment opens — plus exclusive founding member pricing.
            </div>
          </div>

          {submitted ? (
            <div className="home-success">
              You're on the list. We'll be in touch.
            </div>
          ) : (
            <form className="home-form" onSubmit={handleWaitlist}>
              <input
                className="home-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button className="home-submit" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Get Early Access'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};
