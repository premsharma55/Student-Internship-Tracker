import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileText,
  GraduationCap,
  Layers,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { student } = useAuth();
  const [heroImageError, setHeroImageError] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-neutral-950 border-b border-neutral-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-white font-display font-bold text-xl tracking-tight whitespace-nowrap shrink-0"
          >
            <span className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span>InternTrack</span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-7 text-base font-semibold text-neutral-200"
            aria-label="Landing Navigation"
          >
            <a
              href="#features"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#workflow"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Workflow
            </a>
            <a
              href="#stages"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Tracking Stages
            </a>
            {!student && (
              <Link
                to="/login"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Login
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {student ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="md:hidden px-3 py-2 text-base font-semibold text-neutral-200 hover:text-white whitespace-nowrap shrink-0"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 text-white">
          {!heroImageError && (
            <img
              src="/assets/aistudio/image_bb3f8274.png"
              alt="College students holding notebooks in a university hallway"
              referrerPolicy="no-referrer"
              onError={() => setHeroImageError(true)}
              className="absolute inset-0 w-full h-full object-cover object-[50%_20%]"
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-900/70 to-slate-950/85"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-base font-bold text-blue-300 tracking-wide">
                Built for college internship seasons
              </p>
              <h1 className="mt-3 font-display font-bold tracking-tight text-white leading-[1.08] text-[clamp(2.5rem,4.5vw,4rem)] [text-wrap:balance]">
                Track every internship application from submission to offer.
              </h1>
              <p className="mt-5 text-lg sm:text-xl font-medium text-slate-100 leading-relaxed max-w-2xl mx-auto">
                Replace scattered spreadsheets with one structured workspace. Log company roles, monitor deadlines, record interview rounds, and keep your PDF resume ready to share.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                {student ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold text-slate-950 bg-white border border-white/80 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
                    >
                      <span>Login</span>
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-10 pt-6 border-t border-white/20 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-100">
                <span>7 pipeline stages</span>
                <span aria-hidden="true">·</span>
                <span>Interview &amp; deadline reminders</span>
                <span aria-hidden="true">·</span>
                <span>PDF resume vault</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="features" className="bg-white border-y border-slate-200 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight [text-wrap:balance]">
                Everything needed to manage your internship search cleanly
              </h2>
              <p className="mt-3 text-base sm:text-lg font-medium text-slate-600">
                Built around the workflow college students follow from campus placements to off-campus applications.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-mono font-bold text-blue-700">01</span>
                    <Layers className="w-5 h-5 text-slate-500" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-slate-900">
                    Centralized Application Ledger &amp; Filtering
                  </h3>
                  <p className="mt-2 text-base font-medium text-slate-600 leading-relaxed max-w-xl">
                    Store company details, work mode (Remote, Hybrid, On-site), monthly stipend, required skills, source, and job notes. Search instantly by company or role and filter by status, location, or application date range.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-slate-600">
                  <span>Search by company or skill</span>
                  <span>·</span>
                  <span>Sort by date or deadline</span>
                  <span>·</span>
                  <span>Paginated records</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-mono font-bold text-blue-700">02</span>
                    <Search className="w-5 h-5 text-slate-500" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-slate-900">
                    Dynamic Analytics &amp; Status History
                  </h3>
                  <p className="mt-2 text-base font-medium text-slate-600 leading-relaxed">
                    Every status update automatically refreshes your dashboard totals and appends a dated entry to the application’s chronological timeline.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-sm font-semibold text-slate-600">
                  Real-time breakdown across 7 stages
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-mono font-bold text-blue-700">03</span>
                    <CalendarClock className="w-5 h-5 text-slate-500" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-slate-900">
                    Interview &amp; Deadline Tracker
                  </h3>
                  <p className="mt-2 text-base font-medium text-slate-600 leading-relaxed">
                    Keep online meeting links, campus venues, round notes, and approaching or expired application deadlines visible in one dedicated schedule.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-sm font-semibold text-slate-600">
                  Configurable in-app deadline reminders
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-mono font-bold text-blue-700">04</span>
                    <FileText className="w-5 h-5 text-slate-500" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-slate-900">
                    Student Academic Profile &amp; PDF Resume Vault
                  </h3>
                  <p className="mt-2 text-base font-medium text-slate-600 leading-relaxed max-w-xl">
                    Maintain your university details, CGPA, technical skills, projects, certifications, and LinkedIn/GitHub links alongside a securely stored PDF resume with instant in-browser preview and download.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-slate-600">
                  <span>Profile completion indicator</span>
                  <span>·</span>
                  <span>PDF validation &amp; preview</span>
                  <span>·</span>
                  <span>Private per-student workspace</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow & Stages */}
        <section id="workflow" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight [text-wrap:balance]">
                How students use InternTrack
              </h2>
              <p className="mt-3 text-base sm:text-lg font-medium text-slate-600 leading-relaxed">
                Set up your academic profile in under two minutes and keep every application organized throughout placement season.
              </p>

              <div id="stages" className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-sm font-bold text-slate-700 mb-3">Supported Pipeline Stages</p>
                <div className="grid grid-cols-2 gap-3 text-base font-semibold text-slate-800">
                  {[
                    'Applied',
                    'Under Review',
                    'Shortlisted',
                    'Interview Scheduled',
                    'Selected',
                    'Rejected',
                    'Withdrawn',
                  ].map((stage) => (
                    <div key={stage} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7">
                <span className="text-sm font-mono font-bold text-blue-700">Step 01</span>
                <h3 className="mt-1.5 font-display text-lg font-bold text-slate-900">
                  Register your student account &amp; upload your resume
                </h3>
                <p className="mt-2 text-base font-medium text-slate-600 leading-relaxed">
                  Sign up with your college, degree, department, and roll number. Upload your PDF resume and link your GitHub, LinkedIn, and portfolio.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7">
                <span className="text-sm font-mono font-bold text-blue-700">Step 02</span>
                <h3 className="mt-1.5 font-display text-lg font-bold text-slate-900">
                  Log applications and monitor deadlines
                </h3>
                <p className="mt-2 text-base font-medium text-slate-600 leading-relaxed">
                  Record each company, role, stipend, application source, and submission deadline. Approaching deadlines automatically surface in your reminder bell.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7">
                <span className="text-sm font-mono font-bold text-blue-700">Step 03</span>
                <h3 className="mt-1.5 font-display text-lg font-bold text-slate-900">
                  Schedule interviews &amp; update status timelines
                </h3>
                <p className="mt-2 text-base font-medium text-slate-600 leading-relaxed">
                  Link interview rounds directly to each application with meeting URLs or room locations, and record every status milestone through final offer selection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="bg-neutral-900 text-white rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight [text-wrap:balance]">
                Ready to organize your internship applications?
              </h2>
              <p className="mt-2 text-base sm:text-lg font-medium text-neutral-300">
                Create your private student workspace or sign in to continue tracking your active pipeline.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {student ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold text-white border border-neutral-700 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap"
                  >
                    <span>Login</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Dark Black Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-200 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-lg text-white">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            <span>InternTrack</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-7 text-base font-semibold text-neutral-300">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="hover:text-white transition-colors">
              Register
            </Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
