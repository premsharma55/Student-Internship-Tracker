import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, GraduationCap, Loader2, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    degree: '',
    department: '',
    rollNumber: '',
    graduationYear: String(new Date().getFullYear() + 1),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgError, setBgError] = useState(false);

  const passwordRules = [
    { label: 'At least 8 characters', met: form.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(form.password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(form.password) },
    { label: 'One number', met: /[0-9]/.test(form.password) },
  ];

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      setError('Full name is required (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!passwordRules.every((r) => r.met)) {
      setError('Please choose a stronger password meeting all listed requirements.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }
    if (!form.college.trim() || !form.degree.trim() || !form.department.trim() || !form.rollNumber.trim()) {
      setError('College name, course/degree, branch/department, and roll number are required.');
      return;
    }
    const gradYear = Number(form.graduationYear);
    if (!Number.isInteger(gradYear) || gradYear < 2000 || gradYear > 2040) {
      setError('Please enter a valid graduation year between 2000 and 2040.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        college: form.college.trim(),
        degree: form.degree.trim(),
        department: form.department.trim(),
        rollNumber: form.rollNumber.trim(),
        graduationYear: gradYear,
      });
      navigate('/login', {
        replace: true,
        state: {
          registeredMessage: 'Account created successfully. Please log in with your email and password.',
          prefillEmail: form.email.trim(),
        },
      });
    } catch (err) {
      setError(getApiError(err, 'Unable to complete registration.'));
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
              to="/login"
              className="px-4 py-2 text-base font-bold text-white border border-neutral-700 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden bg-neutral-950 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
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

        <div className="relative z-10 max-w-2xl w-full mx-auto">
          <div className="bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Student Registration</h1>
              <p className="mt-1.5 text-base font-medium text-slate-600">
                Create your account to start organizing internship applications and interviews.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-name" className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Aarav Mehta"
                    className="w-full px-3.5 py-2.5 text-base font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                    Email Address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="aarav@university.edu"
                    className="w-full px-3.5 py-2.5 text-base font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="reg-college" className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                    College Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="reg-college"
                    type="text"
                    required
                    value={form.college}
                    onChange={(e) => handleChange('college', e.target.value)}
                    placeholder="National Institute of Technology"
                    className="w-full px-3.5 py-2.5 text-base font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="reg-degree" className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                    Course / Degree <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="reg-degree"
                    type="text"
                    required
                    value={form.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    placeholder="B.Tech / B.E. / MCA"
                    className="w-full px-3.5 py-2.5 text-base font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="reg-dept" className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                    Branch / Department <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="reg-dept"
                    type="text"
                    required
                    value={form.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="Computer Science & Engineering"
                    className="w-full px-3.5 py-2.5 text-base font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-roll" className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                      Roll Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="reg-roll"
                      type="text"
                      required
                      value={form.rollNumber}
                      onChange={(e) => handleChange('rollNumber', e.target.value)}
                      placeholder="22CS041"
                      className="w-full px-3.5 py-2.5 text-base font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-grad" className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                      Graduation Year <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="reg-grad"
                      type="number"
                      min={2000}
                      max={2040}
                      required
                      value={form.graduationYear}
                      onChange={(e) => handleChange('graduationYear', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-base font-medium bg-white border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                    Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Create a strong password"
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

                <div>
                  <label htmlFor="reg-confirm" className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                    Confirm Password <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full px-3.5 py-2.5 text-base font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {passwordRules.map((rule) => (
                  <div
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs ${
                      rule.met ? 'text-emerald-700 font-semibold' : 'text-slate-600 font-medium'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 shrink-0 ${rule.met ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>{submitting ? 'Creating Account...' : 'Create Student Account'}</span>
              </button>
            </form>

            <p className="mt-6 text-center text-base font-medium text-slate-700">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-20 bg-neutral-950 border-t border-neutral-800 text-neutral-300 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-white">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            <span>InternTrack</span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold text-neutral-300">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
