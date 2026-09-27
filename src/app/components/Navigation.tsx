import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, BookOpen, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navigation = () => {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@200;300;400&display=swap');

        .nav-root {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          background: #000;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          transition: background 0.3s;
        }
        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
        }
        .nav-login {
          font-family: 'Inter', sans-serif;
          font-size: 0.55rem; font-weight: 300; letter-spacing: 0.3em;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
          text-decoration: none; transition: color 0.2s;
        }
        .nav-login:hover { color: #fff; }
        .nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 0.55rem; font-weight: 300; letter-spacing: 0.3em;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
          text-decoration: none; transition: color 0.2s;
          display: flex; align-items: center; gap: 6px;
        }
        .nav-link:hover { color: #fff; }
        .nav-link.active { color: #fff; border-bottom: 1px solid rgba(255,255,255,0.4); padding-bottom: 2px; }
        .nav-logo { text-decoration: none; }
        .nav-logo-text { display: flex; flex-direction: column; align-items: flex-start; }
        .nav-logo-main {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem; letter-spacing: 0.15em; color: #fff; line-height: 1;
        }
        .nav-logo-sub {
          font-family: 'Inter', sans-serif;
          font-size: 0.38rem; font-weight: 200; letter-spacing: 0.45em;
          text-transform: uppercase; color: rgba(255,255,255,0.35); margin-top: 3px;
        }
        .nav-desktop {
          display: flex; align-items: center; gap: 20px;
          min-width: 120px; justify-content: flex-end;
        }
        .nav-signout {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); transition: color 0.2s;
          display: flex; align-items: center; padding: 0;
        }
        .nav-signout:hover { color: #fff; }
        .nav-hamburger {
          display: none; background: none; border: none; color: #fff;
          cursor: pointer; padding: 4px; align-items: center;
        }
        .nav-mobile-menu { display: none; }
        .nav-mobile-panel {
          flex-direction: column; background: #0a0a0a;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .nav-mobile-link {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem; font-weight: 300; letter-spacing: 0.22em;
          text-transform: uppercase; color: rgba(255,255,255,0.75);
          text-decoration: none; padding: 17px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 12px;
          background: none; width: 100%; text-align: left; cursor: pointer;
        }
        .nav-mobile-link:active { background: rgba(255,255,255,0.06); }

        @media (max-width: 640px) {
          .nav-inner { padding: 18px 20px; }
          .nav-logo-main { font-size: 1.1rem; }
          .nav-desktop { display: none; }
          .nav-hamburger { display: flex; }
          .nav-mobile-menu { display: flex; }
        }
      `}</style>

      <nav className="nav-root">
        <div className="nav-inner">

          <Link to="/" className="nav-logo" onClick={close}>
            <div className="nav-logo-text">
              <span className="nav-logo-main">MARIELS</span>
              <span className="nav-logo-sub">Brow · Academy</span>
            </div>
          </Link>

          <div className="nav-desktop">
            <a href="/tools.html" className="nav-link">Shop</a>
            {user ? (
              <>
                <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>Courses</Link>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  <BookOpen className="w-3 h-3" />Dashboard
                </Link>
                <Link to="/community" className={`nav-link ${isActive('/community') ? 'active' : ''}`}>Community</Link>
                {isAdmin && (
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    <LayoutDashboard className="w-3 h-3" />Admin
                  </Link>
                )}
                <button onClick={() => signOut()} className="nav-signout" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-login">Sign Up / Login</Link>
            )}
          </div>

          <button className="nav-hamburger" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

        {menuOpen && (
          <div className="nav-mobile-menu nav-mobile-panel">
            <a href="/tools.html" className="nav-mobile-link" onClick={close}>Shop</a>
            {user ? (
              <>
                <Link to="/courses" className="nav-mobile-link" onClick={close}>Courses</Link>
                <Link to="/dashboard" className="nav-mobile-link" onClick={close}>
                  <BookOpen className="w-4 h-4" />Dashboard
                </Link>
                <Link to="/community" className="nav-mobile-link" onClick={close}>Community</Link>
                {isAdmin && (
                  <Link to="/admin" className="nav-mobile-link" onClick={close}>
                    <LayoutDashboard className="w-4 h-4" />Admin
                  </Link>
                )}
                <button onClick={() => { signOut(); close(); }} className="nav-mobile-link">
                  <LogOut className="w-4 h-4" />Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-mobile-link" onClick={close}>Sign Up / Login</Link>
            )}
          </div>
        )}
      </nav>
    </>
  );
};
