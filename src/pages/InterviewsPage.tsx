import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, getApiError } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CompanyAvatar, StatusBadge } from '../components/StatusBadge';
import {
  INTERVIEW_MODES,
  INTERVIEW_STATUSES,
  type Internship,
  type Interview,
  type InterviewMode,
  type InterviewStatus,
} from '../types';

function getTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function InterviewsPage() {
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'deadlines'>('upcoming');
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state for Create/Edit interview
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [form, setForm] = useState({
    internshipId: '',
    interviewDate: getTodayDate(),
    interviewTime: '10:00',
    interviewMode: 'Online' as InterviewMode,
    meetingLink: '',
    location: '',
    interviewRound: 'Technical Round 1',
    status: 'Scheduled' as InterviewStatus,
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Interview | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [ivRes, appRes] = await Promise.all([
        api.get<{ interviews: Interview[] }>('/interviews'),
        api.get<{ internships: Internship[] }>('/internships', { params: { limit: 100 } }),
      ]);
      setInterviews(ivRes.data.interviews || []);
      setInternships(appRes.data.internships || []);
    } catch (err) {
      setError(getApiError(err, 'Failed to load interviews and deadlines.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingInterview(null);
    setForm({
      internshipId: internships[0] ? String(internships[0].id) : '',
      interviewDate: getTodayDate(),
      interviewTime: '10:00',
      interviewMode: 'Online',
      meetingLink: '',
      location: '',
      interviewRound: 'Technical Round 1',
      status: 'Scheduled',
      notes: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (iv: Interview) => {
    setEditingInterview(iv);
    setForm({
      internshipId: String(iv.internshipId),
      interviewDate: iv.interviewDate,
      interviewTime: iv.interviewTime,
      interviewMode: iv.interviewMode,
      meetingLink: iv.meetingLink,
      location: iv.location,
      interviewRound: iv.interviewRound,
      status: iv.status,
      notes: iv.notes,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveInterview = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!form.internshipId) {
      setFormError('Please select an internship application.');
      return;
    }
    if (!form.interviewRound.trim()) {
      setFormError('Interview round is required.');
      return;
    }
    if (form.interviewMode === 'Online' && !form.meetingLink.trim()) {
      setFormError('Meeting link is required for an online interview.');
      return;
    }
    if (form.interviewMode === 'Offline' && !form.location.trim()) {
      setFormError('Location is required for an offline interview.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        ...form,
        internshipId: Number(form.internshipId),
      };
      if (editingInterview) {
        await api.put(`/interviews/${editingInterview.id}`, payload);
      } else {
        await api.post('/interviews', payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(getApiError(err, 'Failed to save interview schedule.'));
    } finally {
      setSaving(false);
    }
  };

  const handleMarkCompleted = async (iv: Interview) => {
    try {
      await api.put(`/interviews/${iv.id}`, {
        internshipId: iv.internshipId,
        interviewDate: iv.interviewDate,
        interviewTime: iv.interviewTime,
        interviewMode: iv.interviewMode,
        meetingLink: iv.meetingLink,
        location: iv.location,
        interviewRound: iv.interviewRound,
        status: 'Completed',
        notes: iv.notes,
      });
      await loadData();
    } catch (err) {
      setError(getApiError(err, 'Failed to update interview status.'));
    }
  };

  const handleDeleteInterview = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/interviews/${deleteTarget.id}`);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(getApiError(err, 'Failed to delete interview.'));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const today = getTodayDate();
  const upcomingInterviews = interviews.filter(
    (iv) => iv.status === 'Scheduled' && iv.interviewDate >= today
  );
  const completedInterviews = interviews.filter(
    (iv) => iv.status !== 'Scheduled' || iv.interviewDate < today
  );

  const internshipsWithDeadlines = internships
    .filter((app) => Boolean(app.deadline))
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Interviews &amp; Deadlines</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage scheduled interview rounds and monitor approaching application deadlines.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          disabled={internships.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Interview</span>
        </button>
      </div>

      {internships.length === 0 && !loading && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center justify-between gap-4">
          <span>Add at least one internship application before scheduling an interview.</span>
          <Link
            to="/applications/new"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 rounded-lg hover:bg-amber-800 whitespace-nowrap"
          >
            Add Internship
          </Link>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Segmented Tabs */}
      <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
        <button
          type="button"
          onClick={() => setTab('upcoming')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            tab === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming Interviews ({upcomingInterviews.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('completed')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            tab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Past &amp; Completed ({completedInterviews.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('deadlines')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            tab === 'deadlines' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Deadlines ({internshipsWithDeadlines.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tab === 'deadlines' ? (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {internshipsWithDeadlines.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-base font-semibold text-slate-800">No application deadlines tracked</p>
              <p className="text-sm text-slate-500 mt-1">
                When adding or editing an internship application, enter an application deadline to monitor it here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {internshipsWithDeadlines.map((app) => {
                const isClosed = ['Selected', 'Rejected', 'Withdrawn'].includes(app.status);
                const diffDays = Math.ceil(
                  (new Date(`${app.deadline}T00:00:00`).getTime() -
                    new Date(`${today}T00:00:00`).getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                const isExpired = !isClosed && diffDays < 0;
                const isUrgent = !isClosed && diffDays >= 0 && diffDays <= 5;

                return (
                  <div
                    key={app.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/70"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CompanyAvatar name={app.companyName} size="md" />
                      <div className="min-w-0">
                        <Link
                          to={`/applications/${app.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 truncate block"
                        >
                          {app.companyName} — {app.position}
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span>{app.companyLocation}</span>
                          <span>·</span>
                          <StatusBadge status={app.status} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-left sm:text-right">
                        <p
                          className={`text-sm font-mono tabular-nums font-semibold ${
                            isExpired
                              ? 'text-rose-600'
                              : isUrgent
                                ? 'text-amber-700'
                                : 'text-slate-900'
                          }`}
                        >
                          {app.deadline}
                        </p>
                        <p className="text-xs text-slate-500">
                          {isClosed
                            ? 'Application closed'
                            : isExpired
                              ? `Expired ${Math.abs(diffDays)} day(s) ago`
                              : diffDays === 0
                                ? 'Due today'
                                : `Due in ${diffDays} day(s)`}
                        </p>
                      </div>
                      <Link
                        to={`/applications/${app.id}`}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-3">
          {(tab === 'upcoming' ? upcomingInterviews : completedInterviews).length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <CalendarClock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-base font-semibold text-slate-800">
                {tab === 'upcoming' ? 'No upcoming interviews scheduled' : 'No completed or past interviews'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {tab === 'upcoming'
                  ? 'Click "Schedule Interview" to add a new interview round.'
                  : 'Completed or past interview sessions will appear here.'}
              </p>
            </div>
          ) : (
            (tab === 'upcoming' ? upcomingInterviews : completedInterviews).map((iv) => (
              <div
                key={iv.id}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <CompanyAvatar name={iv.companyName || 'Company'} size="md" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/applications/${iv.internshipId}`}
                        className="font-display font-semibold text-base text-slate-900 hover:text-blue-600"
                      >
                        {iv.companyName}
                      </Link>
                      <span className="text-slate-400">·</span>
                      <span className="text-sm font-medium text-slate-700">{iv.position}</span>
                    </div>
                    <p className="text-sm font-medium text-blue-700 mt-0.5">{iv.interviewRound}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {iv.interviewDate} at {iv.interviewTime}
                      </span>
                      <span>Mode: {iv.interviewMode}</span>
                      <span>Status: {iv.status}</span>
                      {iv.interviewMode === 'Offline' && iv.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {iv.location}
                        </span>
                      )}
                    </div>
                    {iv.notes && <p className="mt-2 text-xs text-slate-600 leading-relaxed">{iv.notes}</p>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {iv.interviewMode === 'Online' && iv.meetingLink && (
                    <a
                      href={iv.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Link</span>
                    </a>
                  )}
                  {iv.status === 'Scheduled' && (
                    <button
                      type="button"
                      onClick={() => handleMarkCompleted(iv)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEditModal(iv)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition-colors"
                    title="Edit Interview"
                    aria-label="Edit Interview"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(iv)}
                    className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                    title="Delete Interview"
                    aria-label="Delete Interview"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Create / Edit Interview Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {editingInterview ? 'Edit Interview Schedule' : 'Schedule Interview'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveInterview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Internship Application *
                </label>
                <select
                  required
                  value={form.internshipId}
                  onChange={(e) => setForm((p) => ({ ...p, internshipId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  {internships.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.companyName} — {app.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Interview Date *</label>
                  <input
                    type="date"
                    required
                    value={form.interviewDate}
                    onChange={(e) => setForm((p) => ({ ...p, interviewDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Interview Time *</label>
                  <input
                    type="time"
                    required
                    value={form.interviewTime}
                    onChange={(e) => setForm((p) => ({ ...p, interviewTime: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Interview Round *</label>
                  <input
                    type="text"
                    required
                    value={form.interviewRound}
                    onChange={(e) => setForm((p) => ({ ...p, interviewRound: e.target.value }))}
                    placeholder="e.g., Technical Round 1, HR Round"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Interview Mode *</label>
                  <select
                    value={form.interviewMode}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, interviewMode: e.target.value as InterviewMode }))
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {INTERVIEW_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.interviewMode === 'Online' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Meeting Link *</label>
                  <input
                    type="url"
                    required
                    value={form.meetingLink}
                    onChange={(e) => setForm((p) => ({ ...p, meetingLink: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Interview Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Building, room, or office address"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              {editingInterview && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status: e.target.value as InterviewStatus }))
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {INTERVIEW_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Interview Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Interviewer name, focus topics, documents to carry..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingInterview ? 'Update Interview' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Interview Schedule"
        description={
          deleteTarget
            ? `Remove the ${deleteTarget.interviewRound} interview with ${deleteTarget.companyName} on ${deleteTarget.interviewDate}?`
            : ''
        }
        loading={deleting}
        onConfirm={handleDeleteInterview}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
