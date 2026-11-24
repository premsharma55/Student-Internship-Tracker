import { AlertCircle, CheckCircle2, KeyRound, Loader2, LogOut, Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Student } from '../types';

export function SettingsPage() {
  const { student, setStudent, logout } = useAuth();
  const navigate = useNavigate();

  const [deadlineAlertDays, setDeadlineAlertDays] = useState(String(student?.deadlineAlertDays ?? 3));
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefFeedback, setPrefFeedback] = useState<string | null>(null);
  const [prefError, setPrefError] = useState<string | null>(null);

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [savingPw, setSavingPw] = useState(false);
  const [pwFeedback, setPwFeedback] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  const handleSavePreferences = async (e: FormEvent) => {
    e.preventDefault();
    if (savingPrefs) return;

    const days = Number(deadlineAlertDays);
    if (!Number.isInteger(days) || days < 1 || days > 30) {
      setPrefError('Deadline reminder window must be between 1 and 30 days.');
      return;
    }

    setSavingPrefs(true);
    setPrefError(null);
    setPrefFeedback(null);
    try {
      const res = await api.put<{ student: Student }>('/students/profile', {
        deadlineAlertDays: days,
      });
      setStudent(res.data.student);
      setPrefFeedback('Reminder preferences saved.');
    } catch (err) {
      setPrefError(getApiError(err, 'Unable to save reminder preferences.'));
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (savingPw) return;

    if (!pwForm.currentPassword) {
      setPwError('Please enter your current password.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    setSavingPw(true);
    setPwError(null);
    setPwFeedback(null);
    try {
      await api.put('/auth/password', pwForm);
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setPwFeedback('Your password has been updated.');
    } catch (err) {
      setPwError(getApiError(err, 'Unable to update password.'));
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">Account Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage in-app deadline reminder timing and account security.
        </p>
      </div>

      {/* Reminder Preferences */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold text-slate-900">In-App Deadline Reminders</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Choose how many days in advance approaching internship deadlines appear in your dashboard and top-bar reminder bell.
        </p>

        {prefError && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{prefError}</span>
          </div>
        )}
        {prefFeedback && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{prefFeedback}</span>
          </div>
        )}

        <form onSubmit={handleSavePreferences} className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 max-w-xs">
            <label htmlFor="alert-days" className="block text-sm font-medium text-slate-700 mb-1.5">
              Alert Window (days before deadline)
            </label>
            <input
              id="alert-days"
              type="number"
              min={1}
              max={30}
              value={deadlineAlertDays}
              onChange={(e) => setDeadlineAlertDays(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg tabular-nums"
            />
          </div>
          <button
            type="submit"
            disabled={savingPrefs}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {savingPrefs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Preference</span>
          </button>
        </form>
      </section>

      {/* Change Password */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold text-slate-900">Change Password</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Use at least 8 characters with uppercase, lowercase, and a number.
        </p>

        {pwError && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pwError}</span>
          </div>
        )}
        {pwFeedback && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pwFeedback}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="mt-4 space-y-4 max-w-md">
          <div>
            <label htmlFor="cur-pw" className="block text-sm font-medium text-slate-700 mb-1.5">
              Current Password
            </label>
            <input
              id="cur-pw"
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="new-pw" className="block text-sm font-medium text-slate-700 mb-1.5">
              New Password
            </label>
            <input
              id="new-pw"
              type="password"
              required
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="conf-pw" className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              id="conf-pw"
              type="password"
              required
              value={pwForm.confirmNewPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, confirmNewPassword: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={savingPw}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60"
          >
            {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            <span>Update Password</span>
          </button>
        </form>
      </section>

      {/* Session */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900">Active Session</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Signed in as <span className="font-medium text-slate-700">{student?.email}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </section>
    </div>
  );
}
