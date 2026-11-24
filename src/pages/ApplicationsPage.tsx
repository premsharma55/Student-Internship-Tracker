import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FilePlus2,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getApiError } from '../api/client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CompanyAvatar, StatusBadge } from '../components/StatusBadge';
import {
  APPLICATION_STATUSES,
  INTERNSHIP_TYPES,
  type ApplicationStatus,
  type Internship,
} from '../types';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [internshipType, setInternshipType] = useState(searchParams.get('internshipType') || 'All');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));

  const [internships, setInternships] = useState<Internship[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Internship | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sync search parameter if navigated from top bar global search
  useEffect(() => {
    const paramSearch = searchParams.get('search') || '';
    const paramStatus = searchParams.get('status') || 'All';
    setSearch(paramSearch);
    setStatus(paramStatus);
  }, [searchParams]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{
        internships: Internship[];
        pagination: PaginationMeta;
        locations: string[];
      }>('/internships', {
        params: {
          search: search.trim() || undefined,
          status: status !== 'All' ? status : undefined,
          internshipType: internshipType !== 'All' ? internshipType : undefined,
          location: locationFilter.trim() || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sortBy,
          page,
          limit: 10,
        },
      });
      setInternships(res.data.internships || []);
      setPagination(res.data.pagination);
      setLocations(res.data.locations || []);
    } catch (err) {
      setError(getApiError(err, 'Failed to load internship applications.'));
    } finally {
      setLoading(false);
    }
  }, [search, status, internshipType, locationFilter, dateFrom, dateTo, sortBy, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('All');
    setInternshipType('All');
    setLocationFilter('');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const handleQuickStatusChange = async (id: number, newStatus: ApplicationStatus) => {
    setUpdatingStatusId(id);
    try {
      const res = await api.patch<{ internship: Internship }>(`/internships/${id}/status`, {
        status: newStatus,
      });
      setInternships((prev) => prev.map((item) => (item.id === id ? res.data.internship : item)));
    } catch (err) {
      setError(getApiError(err, 'Failed to update application status.'));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/internships/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchApplications();
    } catch (err) {
      setError(getApiError(err, 'Failed to delete internship application.'));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters =
    Boolean(search) ||
    status !== 'All' ||
    internshipType !== 'All' ||
    Boolean(locationFilter) ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    sortBy !== 'newest';

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Internship Applications</h2>
          <p className="text-sm text-slate-500 mt-0.5 tabular-nums">
            Showing {internships.length} of {pagination.total} recorded applications
          </p>
        </div>
        <Link
          to="/applications/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>Add Internship</span>
        </Link>
      </div>

      {/* Search & Filters Panel */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by company name, role, or skill..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <select
              aria-label="Filter by application status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Statuses</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              aria-label="Filter by internship type"
              value={internshipType}
              onChange={(e) => {
                setInternshipType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Work Modes</option>
              {INTERNSHIP_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label htmlFor="filter-location" className="block text-xs font-medium text-slate-600 mb-1">
              Location
            </label>
            <input
              id="filter-location"
              list="known-locations"
              type="text"
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(1);
              }}
              placeholder="City or region"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <datalist id="known-locations">
              {locations.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="filter-from" className="block text-xs font-medium text-slate-600 mb-1">
              Applied From
            </label>
            <input
              id="filter-from"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label htmlFor="filter-to" className="block text-xs font-medium text-slate-600 mb-1">
              Applied To
            </label>
            <input
              id="filter-to"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label htmlFor="sort-by" className="block text-xs font-medium text-slate-600 mb-1">
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="newest">Newest Application</option>
              <option value="oldest">Oldest Application</option>
              <option value="company_asc">Company (A–Z)</option>
              <option value="company_desc">Company (Z–A)</option>
              <option value="deadline_asc">Closest Deadline</option>
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200/70 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Applications Data Table / Mobile Cards */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : internships.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-semibold text-slate-800">
              {hasActiveFilters ? 'No applications match your filters' : 'No internship applications recorded'}
            </p>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {hasActiveFilters
                ? 'Try clearing or adjusting your search query, status, or date filters.'
                : 'Log your first internship application to keep track of roles, deadlines, and interview progress.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Reset Filters
                </button>
              ) : (
                <Link
                  to="/applications/new"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <FilePlus2 className="w-4 h-4" />
                  <span>Add Internship</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                    <th className="py-3.5 px-5">Company</th>
                    <th className="py-3.5 px-4">Internship Role</th>
                    <th className="py-3.5 px-4">Location &amp; Mode</th>
                    <th className="py-3.5 px-4">Applied Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {internships.map((app) => (
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
                            {app.industry && (
                              <span className="text-xs text-slate-500 truncate block">{app.industry}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{app.position}</p>
                        {app.stipend > 0 && (
                          <p className="text-xs text-slate-500 font-mono tabular-nums">
                            {app.stipend.toLocaleString()} / mo
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <p>{app.companyLocation}</p>
                        <p className="text-xs text-slate-500">
                          {app.internshipType} · {app.employmentType}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs tabular-nums whitespace-nowrap">
                        <p>{app.applicationDate}</p>
                        {app.deadline && (
                          <p className="text-[11px] text-slate-400">Due {app.deadline}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          aria-label={`Change status for ${app.companyName}`}
                          value={app.status}
                          disabled={updatingStatusId === app.id}
                          onChange={(e) =>
                            handleQuickStatusChange(app.id, e.target.value as ApplicationStatus)
                          }
                          className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          {APPLICATION_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/applications/${app.id}`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View Details"
                            aria-label={`View ${app.companyName}`}
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {internships.map((app) => (
                <div key={app.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CompanyAvatar name={app.companyName} size="md" />
                      <div className="min-w-0">
                        <Link
                          to={`/applications/${app.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 truncate block"
                        >
                          {app.companyName}
                        </Link>
                        <p className="text-sm text-slate-700 truncate">{app.position}</p>
                      </div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                    <span>{app.companyLocation}</span>
                    <span>·</span>
                    <span>{app.internshipType}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">Applied {app.applicationDate}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <select
                      aria-label={`Change status for ${app.companyName}`}
                      value={app.status}
                      disabled={updatingStatusId === app.id}
                      onChange={(e) =>
                        handleQuickStatusChange(app.id, e.target.value as ApplicationStatus)
                      }
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                    >
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/applications/${app.id}`}
                        className="px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md"
                      >
                        Details
                      </Link>
                      <Link
                        to={`/applications/${app.id}/edit`}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(app)}
                        className="p-1.5 text-rose-600 bg-rose-50 rounded-md"
                        aria-label={`Delete ${app.companyName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            {pagination.totalPages > 1 && (
              <div className="px-5 py-3.5 border-t border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
                <span className="text-xs text-slate-600 tabular-nums">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Internship Application"
        description={
          deleteTarget
            ? `Are you sure you want to delete your application for ${deleteTarget.position} at ${deleteTarget.companyName}?`
            : ''
        }
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
