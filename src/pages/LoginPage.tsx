import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LogIn,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    registeredMessage?: string;
    prefillEmail?: string;
    from?: { pathname: string };
  } | null;

  const [email, setEmail] = useState(state?.prefillEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgError, setBgError] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login(cleanEmail, password);
      const target =
        state?.from?.pathname && state.from.pathname !== '/login'
          ? state.from.pathname
          : '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setError(getApiError(err, 'Invalid email or password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950">
      <header className="relative z-20 bg-neutral-950 border-b border-neutral-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">InternTrack</span>
          </Link>
          <div className="flex items-center gap-5 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-base font-semibold text-neutral-200 hover:text-white transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden bg-neutral-950 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        {!bgError && (
          <img
            src="/assets/aistudio/image_dd9417b3.png"
            alt="Dark monochrome modern workspace office interior"
            referrerPolicy="no-referrer"
            onError={() => setBgError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
        <div
          className="absolute inset-0 bg-neutral-950/35"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-md w-full mx-auto bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl p-7 sm:p-9 shadow-xl">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Student Sign In</h1>
            <p className="mt-2 text-base font-medium text-slate-600">
              Sign in with your registered college email and password to open your dashboard.
            </p>
          </div>

          {state?.registeredMessage && (
            <div className="mt-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{state.registeredMessage}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full px-3.5 py-2.5 text-base font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-base font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-base font-medium text-slate-700">
            New to InternTrack?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Create a student account
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-20 bg-neutral-950 border-t border-neutral-800 text-neutral-300 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-white">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            <span>InternTrack</span>
          </Link>
          <p className="text-sm font-semibold text-neutral-300 text-center">
            Private student internship workspace · Protected session
          </p>
        </div>
      </footer>
    </div>
  );
}
