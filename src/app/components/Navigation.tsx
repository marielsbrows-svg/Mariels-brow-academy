import { Link, useLocation } from 'react-router-dom';
import { LogOut, BookOpen, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navigation = () => {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@200;300;400&display=swap');

        .nav-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          background: ${isHome ? 'transparent' : '#000'};
          border-bottom: ${isHome ? 'none' : '1px solid rgba(255,255,255,0.08)'};
          transition: background 0.3s;
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 24px;
          min-width: 120px;
        }

        .nav-login {
          font-family: 'Inter', sans-serif;
          font-size: 0.55rem;
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-login:hover { color: #fff; }

        .nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 0.55rem;
          font-weight: 300;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-link:hover { color: #fff; }
        .nav-link.active { color: #fff; border-bottom: 1px solid rgba(255,255,255,0.4); padding-bottom: 2px; }

        .nav-logo {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          text-decoration: none;
        }

        .nav-logo img {
          height: 36px;
          width: auto;
          filter: invert(1);
        }

        .nav-logo-text {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .nav-logo-main {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 0.15em;
          color: #fff;
          line-height: 1;
        }

        .nav-logo-sub {
          font-family: 'Inter', sans-serif;
          font-size: 0.38rem;
          font-weight: 200;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-top: 3px;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
          min-width: 120px;
          justify-content: flex-end;
        }

        .nav-signout {
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          transition: color 0.2s;
          display: flex;
          align-items: center;
          padding: 0;
        }
        .nav-signout:hover { color: #fff; }

        @media (max-width: 640px) {
          .nav-inner { padding: 20px 20px; }
          .nav-logo-main { font-size: 1.1rem; }
          .nav-left, .nav-right { min-width: 60px; }
          .nav-hide-mobile { display: none; }
        }
      `}</style>

      <nav className="nav-root">
        <div className="nav-inner">

          {/* LEFT - LOGO */}
          <Link to="/" className="nav-logo" style={{ position: 'static', transform: 'none', textAlign: 'left' }}>
            <div className="nav-logo-text" style={{ alignItems: 'flex-start' }}>
              <span className="nav-logo-main">MARIEL</span>
              <span className="nav-logo-sub">Brows · Academy</span>
            </div>
          </Link>

          {/* RIGHT */}
          <div className="nav-right">
            {user ? (
              <>
                <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>Courses</Link>
                <Link to="/dashboard" className={`nav-link nav-hide-mobile ${isActive('/dashboard') ? 'active' : ''}`}>
                  <BookOpen className="w-3 h-3" />Dashboard
                </Link>
                <Link to="/community" className={`nav-link nav-hide-mobile ${isActive('/community') ? 'active' : ''}`}>Community</Link>
                {isAdmin && (
                  <Link to="/admin" className={`nav-link nav-hide-mobile ${isActive('/admin') ? 'active' : ''}`}>
                    <LayoutDashboard className="w-3 h-3" />Admin
                  </Link>
                )}
                <button onClick={() => signOut()} className="nav-signout" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-login">Login</Link>
            )}
          </div>

        </div>
      </nav>
    </>
  );
};
