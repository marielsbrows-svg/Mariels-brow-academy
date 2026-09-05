import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500&display=swap');
.mba-auth{min-height:100vh;background:#fff;color:#000;font-family:'Inter',Helvetica,Arial,sans-serif;font-weight:300;}
.mba-auth *{box-sizing:border-box;}
.mba-auth .display{font-family:'Anton',Impact,'Arial Narrow',sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0.01em;line-height:0.92;}
.mba-auth .auth-grid{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;}
.mba-auth .auth-panel{background:#000;color:#fff;display:flex;align-items:flex-end;padding:56px;}
.mba-auth .panel-h{font-size:60px;color:#fff;}
.mba-auth .panel-sub{color:rgba(255,255,255,0.5);font-size:14px;max-width:34ch;margin-top:18px;line-height:1.6;}
.mba-auth .auth-form-wrap{display:flex;align-items:center;justify-content:center;padding:64px 40px;}
.mba-auth .auth-form{width:100%;max-width:380px;}
.mba-auth .auth-logo{text-decoration:none;display:block;margin-bottom:46px;}
.mba-auth .al-name{font-size:26px;letter-spacing:2px;color:#000;}
.mba-auth .al-sub{font-size:9px;letter-spacing:6px;text-transform:uppercase;color:#9A9A9A;margin-top:5px;}
.mba-auth .auth-kicker{font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#9A9A9A;margin-bottom:18px;}
.mba-auth .auth-h1{font-size:42px;color:#000;margin:0 0 30px;}
.mba-auth .auth-msg{padding:12px 14px;font-size:12px;letter-spacing:0.02em;margin-bottom:20px;}
.mba-auth .auth-error{border:1px solid #E3B7B7;background:#FBEDED;color:#9E3A3A;}
.mba-auth .auth-success{border:1px solid #C9C9C9;background:#F4F4F4;color:#4F4F4F;}
.mba-auth .auth-fields{display:flex;flex-direction:column;gap:20px;}
.mba-auth .fl{display:block;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#9A9A9A;margin-bottom:8px;}
.mba-auth .auth-input{width:100%;border:1px solid #000;background:#fff;padding:14px 16px;font-family:inherit;font-size:16px;color:#000;outline:none;}
.mba-auth .auth-input::placeholder{color:#BDB8AE;}
.mba-auth .pw-wrap{position:relative;}
.mba-auth .pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:0;cursor:pointer;color:#9A9A9A;display:flex;padding:0;}
.mba-auth .pw-toggle:hover{color:#000;}
.mba-auth .auth-submit{width:100%;margin-top:8px;background:#000;color:#fff;border:0;padding:16px;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-family:inherit;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity 0.2s;}
.mba-auth .auth-submit:hover{opacity:.85;}
.mba-auth .auth-submit:disabled{opacity:.5;cursor:default;}
.mba-auth .auth-alt{text-align:center;font-size:13px;color:#9A9A9A;margin-top:32px;}
.mba-auth .auth-alt a{color:#000;text-decoration:underline;text-underline-offset:2px;}
.mba-auth .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:mbaspin 0.7s linear infinite;}
@keyframes mbaspin{to{transform:rotate(360deg)}}
@media (max-width:820px){
  .mba-auth .auth-grid{grid-template-columns:1fr;}
  .mba-auth .auth-panel{display:none;}
  .mba-auth .auth-form-wrap{padding:56px 24px;}
  .mba-auth .auth-h1{font-size:34px;}
}
`;

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
    <div className="mba-auth">
      <style>{AUTH_CSS}</style>
      <div className="auth-grid">
        <div className="auth-panel">
          <div>
            <div className="display panel-h">Welcome<br />back</div>
            <p className="panel-sub">Continue your path to becoming an elite brow artist and beauty entrepreneur.</p>
          </div>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-form">
            <Link to="/" className="auth-logo">
              <div className="al-name display">MARIELS</div>
              <div className="al-sub">Brow · Academy</div>
            </Link>

            <div className="auth-kicker">Sign In</div>
            <h1 className="display auth-h1">Good to see<br />you again</h1>

            {error && <div className="auth-msg auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-fields">
              <div>
                <span className="fl">Email address</span>
                <input type="email" className="auth-input" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <span className="fl">Password</span>
                <div className="pw-wrap">
                  <input type={showPassword ? 'text' : 'password'} className="auth-input" style={{ paddingRight: 44 }}
                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <span className="spin" /> : 'Sign In'}
              </button>
            </form>

            <p className="auth-alt">
              Don't have an account? <Link to="/signup">Create one</Link>
            </p>
          </div>
        </div>
      </div>
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
    <div className="mba-auth">
      <style>{AUTH_CSS}</style>
      <div className="auth-grid">
        <div className="auth-panel">
          <div>
            <div className="display panel-h">Begin your<br />journey</div>
            <p className="panel-sub">Learn the craft behind beautiful, intentional brows — and turn your passion into a profession.</p>
          </div>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-form">
            <Link to="/" className="auth-logo">
              <div className="al-name display">MARIELS</div>
              <div className="al-sub">Brow · Academy</div>
            </Link>

            <div className="auth-kicker">Create Account</div>
            <h1 className="display auth-h1">Start your<br />brow journey</h1>

            {error && <div className="auth-msg auth-error">{error}</div>}
            {success && <div className="auth-msg auth-success">Account created — taking you to your dashboard…</div>}

            <form onSubmit={handleSubmit} className="auth-fields">
              <div>
                <span className="fl">Full name</span>
                <input type="text" className="auth-input" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required />
              </div>
              <div>
                <span className="fl">Email address</span>
                <input type="email" className="auth-input" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <span className="fl">Password</span>
                <div className="pw-wrap">
                  <input type={showPassword ? 'text' : 'password'} className="auth-input" style={{ paddingRight: 44 }}
                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
                  <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-submit" disabled={loading || success}>
                {loading ? <span className="spin" /> : 'Create Account'}
              </button>
            </form>

            <p className="auth-alt">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
