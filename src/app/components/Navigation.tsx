import { Link, useLocation } from 'react-router-dom';
import { LogOut, User, BookOpen, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';

export const Navigation = () => {
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-charcoal border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div
              className="text-3xl md:text-4xl text-cream tracking-tight whitespace-nowrap"
              style={{ fontFamily: 'Classique Script, cursive' }}
            >
              Mariels Brow Academy
            </div>
          </Link>

          <div className="flex items-center gap-6 md:gap-8">

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`hidden md:flex items-center gap-2 text-xs tracking-widest uppercase transition-colors ${
                    isActive('/dashboard')
                      ? 'text-white font-medium border-b border-white pb-1'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Dashboard
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`hidden md:flex items-center gap-2 text-xs tracking-widest uppercase transition-colors ${
                      isActive('/admin')
                        ? 'text-white font-medium border-b border-white pb-1'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs tracking-widest uppercase text-white/60 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/payment"
                  className="px-6 py-2.5 bg-cream text-charcoal text-xs tracking-widest uppercase hover:bg-linen transition-colors"
                >
                  Enroll
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
