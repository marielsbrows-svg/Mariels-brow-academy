import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const inputClass =
  'w-full px-4 py-3.5 bg-cream border border-mocha/20 text-charcoal text-sm outline-none focus:border-charcoal transition-colors placeholder:text-mocha/30';

const labelClass = 'block text-[0.6rem] tracking-[0.2em] uppercase text-mocha/60 mb-2';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream">

      {/* Left — Image Panel */}
      <div className="hidden lg:flex relative bg-charcoal items-end p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent z-10" />
        <div className="relative z-20">
          <div
            className="text-5xl text-cream italic font-light mb-3"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Welcome Back
          </div>
          <p className="text-cream/50 text-sm leading-relaxed max-w-xs">
            Continue your journey to becoming an elite brow artist and beauty entrepreneur.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center px-8 py-24"
      >
        <div className="w-full max-w-sm">

          {/* Logo */}
          <Link to="/">
            <div
              className="text-3xl text-charcoal italic font-light mb-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Mariels
            </div>
            <div className="text-[0.55rem] tracking-[0.3em] uppercase text-mocha/40 mb-10">
              Brow Academy
            </div>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-px bg-mocha/30" />
            <span className="text-[0.58rem] tracking-[0.2em] uppercase text-mocha/50">Sign In</span>
          </div>

          <h1
            className="text-3xl text-charcoal font-light mb-8 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Good to see<br />
            <span className="italic">you again</span>
          </h1>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-xs tracking-wide mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass + ' pr-12'}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-mocha/40 hover:text-mocha transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-charcoal text-cream text-[0.62rem] tracking-[0.2em] uppercase hover:bg-mocha transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-mocha/50 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-charcoal hover:text-mocha transition-colors underline underline-offset-2">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream">

      {/* Left — Image Panel */}
      <div className="hidden lg:flex relative bg-charcoal items-end p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent z-10" />
        <div className="relative z-20">
          <div
            className="text-5xl text-cream italic font-light mb-3"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Begin Your<br />Journey
          </div>
          <p className="text-cream/50 text-sm leading-relaxed max-w-xs">
            Join thousands of successful brow artists who have transformed their passion into a profitable career.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center px-8 py-24"
      >
        <div className="w-full max-w-sm">

          {/* Logo */}
          <Link to="/">
            <div
              className="text-3xl text-charcoal italic font-light mb-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Mariels
            </div>
            <div className="text-[0.55rem] tracking-[0.3em] uppercase text-mocha/40 mb-10">
              Brow Academy
            </div>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-px bg-mocha/30" />
            <span className="text-[0.58rem] tracking-[0.2em] uppercase text-mocha/50">Create Account</span>
          </div>

          <h1
            className="text-3xl text-charcoal font-light mb-8 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Start your<br />
            <span className="italic">brow empire</span>
          </h1>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-xs tracking-wide mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="border border-mocha/20 bg-mocha/5 text-mocha px-4 py-3 text-xs tracking-wide mb-6">
              Account created! Redirecting to your dashboard...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass + ' pr-12'}
                  placeholder="At least 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-mocha/40 hover:text-mocha transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-4 bg-charcoal text-cream text-[0.62rem] tracking-[0.2em] uppercase hover:bg-mocha transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-mocha/50 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-charcoal hover:text-mocha transition-colors underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
