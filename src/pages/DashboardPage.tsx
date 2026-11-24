import {
  AlertCircle,
  CalendarClock,
  Clock,
  Edit3,
  Eye,
  FilePlus2,
  MapPin,
  Trash2,
  Video,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, getApiError } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CompanyAvatar, StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import type { DashboardStatsResponse, Internship } from '../types';

const STATUS_BAR_COLORS: Record<string, string> = {
  Applied: '#2563eb',
  'Under Review': '#4f46e5',
  Shortlisted: '#0891b2',
  'Interview Scheduled': '#d97706',
  Selected: '#16a34a',
  Rejected: '#dc2626',
  Withdrawn: '#64748b',
};

export function DashboardPage() {
  const { student } = useAuth();
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [recentApps, setRecentApps] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Internship | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const [statsRes, recentRes] = await Promise.all([
        api.get<DashboardStatsResponse>('/dashboard/stats'),
        api.get<{ applications: Internship[] }>('/dashboard/recent-applications'),
      ]);
      setData(statsRes.data);
      setRecentApps(recentRes.data.applications || []);
    } catch (err) {
      setError(getApiError(err, 'Unable to load dashboard data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/internships/${deleteTarget.id}`);
      setDeleteTarget(null);
      await loadDashboard();
    } catch (err) {
      setError(getApiError(err, 'Failed to delete internship application.'));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const statCards = data
    ? [
        { label: 'Total Applications', value: data.stats.total, filter: 'All', accent: 'text-slate-900' },
        { label: 'Applied', value: data.stats.applied, filter: 'Applied', accent: 'text-blue-700' },
        { label: 'Under Review', value: data.stats.underReview, filter: 'Under Review', accent: 'text-indigo-700' },
        { label: 'Shortlisted', value: data.stats.shortlisted, filter: 'Shortlisted', accent: 'text-cyan-700' },
        {
          label: 'Interview Scheduled',
          value: data.stats.interviewScheduled,
          filter: 'Interview Scheduled',
          accent: 'text-amber-700',
        },
        { label: 'Selected', value: data.stats.selected, filter: 'Selected', accent: 'text-emerald-700' },
        { label: 'Rejected', value: data.stats.rejected, filter: 'Rejected', accent: 'text-rose-700' },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-white border border-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back, {student?.fullName?.split(' ')[0] || 'Student'}
          </h2>
          <p className="text-base font-medium text-slate-600 mt-1">
            {student?.college} · {student?.degree} in {student?.department} · Class of {student?.graduationYear}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/profile"
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Profile ({student?.profileCompletion ?? 0}%)
          </Link>
          <Link
            to="/applications/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <FilePlus2 className="w-4 h-4 shrink-0" />
            <span>Add Internship</span>
          </Link>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 7 Dynamic Statistics Cards */}
      <section aria-label="Application Statistics">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {statCards.map((card) => (
            <Link
              key={card.label}
              to={card.filter === 'All' ? '/applications' : `/applications?status=${encodeURIComponent(card.filter)}`}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-slate-600 leading-snug">{card.label}</span>
              <span className={`mt-3 font-display text-2xl sm:text-3xl font-bold tabular-nums ${card.accent}`}>
                {card.value}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Chart + Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Chart */}
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                Application Status Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live distribution across every stage of your internship search
              </p>
            </div>
            <Link to="/applications" className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap">
              View All Applications
            </Link>
          </div>

          {!data || data.stats.total === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-lg p-6">
              <p className="text-sm font-medium text-slate-700">No internship data to chart yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Add your first internship application to visualize your progress across statuses.
              </p>
              <Link
                to="/applications/new"
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>Add First Application</span>
              </Link>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.statusBreakdown}
                  margin={{ top: 8, right: 12, left: -16, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={52}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Applications" radius={[6, 6, 0, 0]} maxBarSize={44}>
                    {data.statusBreakdown.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_BAR_COLORS[entry.status] || '#2563eb'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Upcoming Interviews */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">Upcoming Interviews</h3>
              <p className="text-xs text-slate-500 mt-0.5">Scheduled sessions on your calendar</p>
            </div>
            <Link to="/interviews" className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap">
              Manage
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {!data || data.upcomingInterviews.length === 0 ? (
              <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-lg p-5">
                <CalendarClock className="w-6 h-6 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700">No upcoming interviews</p>
                <p className="text-xs text-slate-500 mt-1">
                  Schedule an interview round from the Interviews page.
                </p>
                <Link
                  to="/interviews"
                  className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Schedule Interview
                </Link>
              </div>
            ) : (
              data.upcomingInterviews.map((iv) => (
                <div
                  key={iv.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{iv.companyName}</p>
                      <p className="text-xs text-slate-600 truncate">
                        {iv.position} · {iv.interviewRound}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded shrink-0">
                      {iv.interviewDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      {iv.interviewTime} ({iv.interviewMode})
                    </span>
                    {iv.interviewMode === 'Online' && iv.meetingLink ? (
                      <a
                        href={iv.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Link</span>
                      </a>
                    ) : iv.location ? (
                      <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{iv.location}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Recent Applications Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              Recent Internship Applications
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Your most recently logged submissions</p>
          </div>
          <Link to="/applications" className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap">
            View All ({data?.stats.total ?? 0})
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-base font-semibold text-slate-800">No internship applications yet</p>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Start building your internship tracker by logging your first application with company details, deadline, and status.
            </p>
            <Link
              to="/applications/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Add Internship Application</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-5">Company Name</th>
                  <th className="py-3 px-4">Internship Role</th>
                  <th className="py-3 px-4">Application Date</th>
                  <th className="py-3 px-4">Application Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <CompanyAvatar name={app.companyName} size="sm" />
                        <div className="min-w-0">
                          <Link
                            to={`/applications/${app.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 truncate block"
                          >
                            {app.companyName}
                          </Link>
                          <span className="text-xs text-slate-500">{app.companyLocation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{app.position}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs tabular-nums whitespace-nowrap">
                      {app.applicationDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/applications/${app.id}`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                          aria-label={`View details for ${app.companyName}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/applications/${app.id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit"
                          aria-label={`Edit ${app.companyName}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(app)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete"
                          aria-label={`Delete ${app.companyName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Deadlines & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">Deadline Watch</h3>
              <p className="text-xs text-slate-500 mt-0.5">Approaching and expired application deadlines</p>
            </div>
            <Link to="/interviews" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              All Deadlines
            </Link>
          </div>

          {!data || (data.approachingDeadlines.length === 0 && data.expiredDeadlines.length === 0) ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-slate-700">No urgent deadlines</p>
              <p className="text-xs text-slate-500 mt-1">
                Applications with upcoming or missed deadlines will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.approachingDeadlines.map((d) => (
                <Link
                  key={`app-${d.id}`}
                  to={`/applications/${d.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{d.companyName}</p>
                    <p className="text-xs text-slate-600 truncate">{d.position}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono tabular-nums font-semibold text-amber-800 block">
                      Due {d.deadline}
                    </span>
                    <span className="text-[11px] text-amber-700">Approaching</span>
                  </div>
                </Link>
              ))}

              {data.expiredDeadlines.map((d) => (
                <Link
                  key={`exp-${d.id}`}
                  to={`/applications/${d.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-rose-200 bg-rose-50/60 hover:bg-rose-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{d.companyName}</p>
                    <p className="text-xs text-slate-600 truncate">{d.position}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono tabular-nums font-semibold text-rose-700 block">
                      {d.deadline}
                    </span>
                    <span className="text-[11px] text-rose-600">Expired</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold text-slate-900">Recent Activities</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verified status updates recorded in your timeline</p>
          </div>

          {!data || data.recentActivities.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
              <p className="text-sm font-medium text-slate-700">No recent activity yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Status changes and newly created applications are recorded here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentActivities.map((act) => (
                <Link
                  key={act.id}
                  to={`/applications/${act.internshipId}`}
                  className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 hover:bg-slate-50/60 rounded-lg px-1 -mx-1 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {act.companyName} · {act.position}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 truncate">{act.notes}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={act.newStatus} />
                    <p className="text-[11px] text-slate-400 font-mono tabular-nums mt-1">
                      {act.changedAt.slice(0, 10)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Internship Application"
        description={
          deleteTarget
            ? `Are you sure you want to delete your application for ${deleteTarget.position} at ${deleteTarget.companyName}? This will also remove its history and linked interviews.`
            : ''
        }
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
