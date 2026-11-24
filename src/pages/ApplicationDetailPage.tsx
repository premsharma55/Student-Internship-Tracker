import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Video,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getApiError } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CompanyAvatar, StatusBadge } from '../components/StatusBadge';
import {
  APPLICATION_STATUSES,
  INTERVIEW_MODES,
  type ApplicationHistoryItem,
  type ApplicationStatus,
  type Internship,
  type Interview,
  type InterviewMode,
} from '../types';

function getTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [history, setHistory] = useState<ApplicationHistoryItem[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update form
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('Applied');
  const [statusDate, setStatusDate] = useState(getTodayDate());
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Quick schedule interview modal
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [ivForm, setIvForm] = useState({
    interviewDate: getTodayDate(),
    interviewTime: '10:00',
    interviewMode: 'Online' as InterviewMode,
    meetingLink: '',
    location: '',
    interviewRound: 'Technical Round 1',
    notes: '',
  });
  const [savingInterview, setSavingInterview] = useState(false);
  const [ivError, setIvError] = useState<string | null>(null);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<{
        internship: Internship;
        history: ApplicationHistoryItem[];
        interviews: Interview[];
      }>(`/internships/${id}`);
      setInternship(res.data.internship);
      setSelectedStatus(res.data.internship.status);
      setHistory(res.data.history || []);
      setInterviews(res.data.interviews || []);
    } catch (err) {
      setError(getApiError(err, 'Failed to load internship details.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleStatusUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!internship || updatingStatus) return;
    setUpdatingStatus(true);
    setStatusFeedback(null);
    setError(null);
    try {
      const res = await api.patch<{
        internship: Internship;
        history: ApplicationHistoryItem[];
      }>(`/internships/${internship.id}/status`, {
        status: selectedStatus,
        changedAt: statusDate,
        notes: statusNote.trim(),
      });
      setInternship(res.data.internship);
      setHistory(res.data.history || []);
      setStatusNote('');
      setStatusFeedback('Application status and timeline updated.');
    } catch (err) {
      setError(getApiError(err, 'Unable to update application status.'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleScheduleInterview = async (e: FormEvent) => {
    e.preventDefault();
    if (!internship || savingInterview) return;
    setIvError(null);
    setSavingInterview(true);
    try {
      await api.post('/interviews', {
        internshipId: internship.id,
        ...ivForm,
      });
      setShowInterviewModal(false);
      setIvForm({
        interviewDate: getTodayDate(),
        interviewTime: '10:00',
        interviewMode: 'Online',
        meetingLink: '',
        location: '',
        interviewRound: 'Technical Round 1',
        notes: '',
      });
      await loadDetails();
    } catch (err) {
      setIvError(getApiError(err, 'Failed to schedule interview.'));
    } finally {
      setSavingInterview(false);
    }
  };

  const handleDelete = async () => {
    if (!internship || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/internships/${internship.id}`);
      navigate('/applications', { replace: true });
    } catch (err) {
      setError(getApiError(err, 'Failed to delete internship application.'));
      setShowDeleteConfirm(false);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-3" />
        <h2 className="font-display text-lg font-bold text-slate-900">Application Not Found</h2>
        <p className="text-sm text-slate-600 mt-1">{error || 'This application does not exist.'}</p>
        <Link
          to="/applications"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Back to My Applications
        </Link>
      </div>
    );
  }

  const today = getTodayDate();
  const isExpired =
    Boolean(internship.deadline) &&
    internship.deadline < today &&
    !['Selected', 'Rejected', 'Withdrawn'].includes(internship.status);

  const skillList = internship.requiredSkills
    ? internship.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Applications</span>
        </Link>

        {/* Top Summary Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <CompanyAvatar name={internship.companyName} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 truncate">
                  {internship.position}
                </h2>
                <StatusBadge status={internship.status} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-600">
                <span className="font-medium text-slate-800">{internship.companyName}</span>
                <span aria-hidden="true">·</span>
                <span>{internship.companyLocation}</span>
                <span aria-hidden="true">·</span>
                <span>{internship.internshipType}</span>
                {internship.companyWebsite && (
                  <>
                    <span aria-hidden="true">·</span>
                    <a
                      href={internship.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to={`/applications/${internship.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Details + Interviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Structured Metadata Grid */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <h3 className="font-display text-base font-semibold text-slate-900 mb-4">
              Application Overview
            </h3>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
              <div>
                <dt className="text-xs font-medium text-slate-500">Application Date</dt>
                <dd className="mt-1 font-mono tabular-nums font-medium text-slate-900">
                  {internship.applicationDate}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Application Deadline</dt>
                <dd
                  className={`mt-1 font-mono tabular-nums font-medium ${
                    isExpired ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {internship.deadline ? `${internship.deadline}${isExpired ? ' (Expired)' : ''}` : 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Application Source</dt>
                <dd className="mt-1 font-medium text-slate-900">{internship.applicationSource}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Employment Type</dt>
                <dd className="mt-1 font-medium text-slate-900">{internship.employmentType}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Duration</dt>
                <dd className="mt-1 font-medium text-slate-900">{internship.duration || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Monthly Stipend</dt>
                <dd className="mt-1 font-mono tabular-nums font-medium text-slate-900">
                  {internship.stipend > 0 ? `${internship.stipend.toLocaleString()} / month` : 'Unpaid / Not listed'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Industry / Sector</dt>
                <dd className="mt-1 font-medium text-slate-900">{internship.industry || 'Not specified'}</dd>
              </div>
            </dl>

            {skillList.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-2">Required Skills</p>
                <p className="text-sm text-slate-800">{skillList.join(' · ')}</p>
              </div>
            )}

            {internship.jobDescription && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1.5">Job Description</p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {internship.jobDescription}
                </p>
              </div>
            )}

            {internship.notes && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1.5">Additional Notes</p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {internship.notes}
                </p>
              </div>
            )}
          </section>

          {/* Linked Interviews */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Interviews for this Application
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rounds scheduled specifically with {internship.companyName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInterviewModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Interview</span>
              </button>
            </div>

            {interviews.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
                <CalendarClock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No interviews scheduled yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Add interview rounds as you progress with {internship.companyName}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.map((iv) => (
                  <div
                    key={iv.id}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{iv.interviewRound}</span>
                        <span className="text-xs text-slate-500">· {iv.status}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                          <Clock className="w-3.5 h-3.5" />
                          {iv.interviewDate} at {iv.interviewTime}
                        </span>
                        <span>({iv.interviewMode})</span>
                        {iv.interviewMode === 'Offline' && iv.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {iv.location}
                          </span>
                        )}
                      </div>
                      {iv.notes && <p className="text-xs text-slate-600 mt-1.5">{iv.notes}</p>}
                    </div>

                    {iv.interviewMode === 'Online' && iv.meetingLink && (
                      <a
                        href={iv.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shrink-0"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Meeting</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Status Update & Chronological Timeline */}
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <h3 className="font-display text-base font-semibold text-slate-900">Update Application Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Changes are immediately recorded in your timeline and dashboard stats.
            </p>

            {statusFeedback && (
              <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusFeedback}</span>
              </div>
            )}

            <form onSubmit={handleStatusUpdate} className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="detail-status" className="block text-xs font-medium text-slate-700 mb-1">
                  New Status
                </label>
                <select
                  id="detail-status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="detail-status-date" className="block text-xs font-medium text-slate-700 mb-1">
                  Event Date
                </label>
                <input
                  id="detail-status-date"
                  type="date"
                  value={statusDate}
                  onChange={(e) => setStatusDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label htmlFor="detail-status-note" className="block text-xs font-medium text-slate-700 mb-1">
                  Timeline Note (optional)
                </label>
                <textarea
                  id="detail-status-note"
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g., Completed online coding assessment"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={updatingStatus}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {updatingStatus && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{updatingStatus ? 'Updating...' : 'Record Status Update'}</span>
              </button>
            </form>
          </section>

          {/* Chronological Timeline */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <h3 className="font-display text-base font-semibold text-slate-900">Application Timeline</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Chronological record of verified status transitions
            </p>

            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No history events recorded yet.</p>
            ) : (
              <ol className="relative border-l border-slate-200 ml-2.5 space-y-5">
                {history.map((item) => (
                  <li key={item.id} className="ml-5">
                    <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={item.newStatus} />
                      <time className="text-xs font-mono tabular-nums text-slate-400">
                        {item.changedAt.slice(0, 10)}
                      </time>
                    </div>
                    {item.notes && <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{item.notes}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      {/* Quick Schedule Interview Modal */}
      {showInterviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-lg p-6">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Schedule Interview — {internship.companyName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{internship.position}</p>

            {ivError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {ivError}
              </div>
            )}

            <form onSubmit={handleScheduleInterview} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Interview Date *</label>
                  <input
                    type="date"
                    required
                    value={ivForm.interviewDate}
                    onChange={(e) => setIvForm((p) => ({ ...p, interviewDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Interview Time *</label>
                  <input
                    type="time"
                    required
                    value={ivForm.interviewTime}
                    onChange={(e) => setIvForm((p) => ({ ...p, interviewTime: e.target.value }))}
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
                    value={ivForm.interviewRound}
                    onChange={(e) => setIvForm((p) => ({ ...p, interviewRound: e.target.value }))}
                    placeholder="e.g., Technical Round 1"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mode *</label>
                  <select
                    value={ivForm.interviewMode}
                    onChange={(e) =>
                      setIvForm((p) => ({ ...p, interviewMode: e.target.value as InterviewMode }))
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

              {ivForm.interviewMode === 'Online' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Meeting Link *</label>
                  <input
                    type="url"
                    required
                    value={ivForm.meetingLink}
                    onChange={(e) => setIvForm((p) => ({ ...p, meetingLink: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Interview Location *</label>
                  <input
                    type="text"
                    required
                    value={ivForm.location}
                    onChange={(e) => setIvForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Campus Placement Cell / Office Address"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Interview Notes</label>
                <textarea
                  rows={2}
                  value={ivForm.notes}
                  onChange={(e) => setIvForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Topics to revise, panel details..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInterview}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingInterview ? 'Saving...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Internship Application"
        description={`Are you sure you want to delete your application for ${internship.position} at ${internship.companyName}? This action cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
