import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getApiError } from '../api/client';
import { InternshipForm, type InternshipFormValues } from '../components/InternshipForm';
import type { Internship } from '../types';

export function EditInternshipPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get<{ internship: Internship }>(`/internships/${id}`);
        if (active) setInternship(res.data.internship);
      } catch (err) {
        if (active) setLoadError(getApiError(err, 'Internship application not found.'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (values: InternshipFormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await api.put(`/internships/${id}`, {
        ...values,
        stipend: values.stipend === '' ? 0 : Number(values.stipend),
      });
      navigate(`/applications/${id}`);
    } catch (err) {
      setServerError(getApiError(err, 'Failed to update internship application.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (loadError || !internship) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-3" />
        <h2 className="font-display text-lg font-bold text-slate-900">Unable to load application</h2>
        <p className="text-sm text-slate-600 mt-1">{loadError || 'Record not found.'}</p>
        <Link
          to="/applications"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <Link
          to={`/applications/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Application Details</span>
        </Link>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Edit Application — {internship.companyName}
        </h2>
      </div>

      <InternshipForm
        initialData={internship}
        submitLabel="Save Changes"
        submitting={submitting}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/applications/${id}`)}
      />
    </div>
  );
}
