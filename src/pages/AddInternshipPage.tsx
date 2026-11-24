import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getApiError } from '../api/client';
import { InternshipForm, type InternshipFormValues } from '../components/InternshipForm';
import type { Internship } from '../types';

export function AddInternshipPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (values: InternshipFormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await api.post<{ internship: Internship }>('/internships', {
        ...values,
        stipend: values.stipend === '' ? 0 : Number(values.stipend),
      });
      navigate(`/applications/${res.data.internship.id}`);
    } catch (err) {
      setServerError(getApiError(err, 'Failed to save internship application.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            to="/applications"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Applications</span>
          </Link>
          <h2 className="font-display text-xl font-bold text-slate-900">Add Internship Application</h2>
        </div>
      </div>

      <InternshipForm
        submitLabel="Save Internship Application"
        submitting={submitting}
        serverError={serverError}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/applications')}
      />
    </div>
  );
}
