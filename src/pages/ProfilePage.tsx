import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { api, getApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Student } from '../types';

export function ProfilePage() {
  const { student, setStudent } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    dob: '',
    address: '',
    college: '',
    degree: '',
    department: '',
    rollNumber: '',
    currentSemester: '',
    graduationYear: '',
    cgpa: '',
    skills: '',
    programmingLanguages: '',
    projects: '',
    certifications: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (student) {
      setForm({
        fullName: student.fullName || '',
        phone: student.phone || '',
        dob: student.dob || '',
        address: student.address || '',
        college: student.college || '',
        degree: student.degree || '',
        department: student.department || '',
        rollNumber: student.rollNumber || '',
        currentSemester: student.currentSemester || '',
        graduationYear: String(student.graduationYear || ''),
        cgpa: student.cgpa || '',
        skills: student.skills || '',
        programmingLanguages: student.programmingLanguages || '',
        projects: student.projects || '',
        certifications: student.certifications || '',
        linkedinUrl: student.linkedinUrl || '',
        githubUrl: student.githubUrl || '',
        portfolioUrl: student.portfolioUrl || '',
      });
    }
  }, [student]);

  useEffect(() => {
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!form.fullName.trim() || !form.college.trim() || !form.degree.trim() || !form.department.trim() || !form.rollNumber.trim()) {
      setError('Full name, college, degree, department, and roll number are required.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.put<{ student: Student; message: string }>('/students/profile', {
        ...form,
        graduationYear: Number(form.graduationYear),
      });
      setStudent(res.data.student);
      setSuccess('Your profile has been saved.');
    } catch (err) {
      setError(getApiError(err, 'Failed to save profile changes.'));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Profile photo must be a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile photo must be smaller than 2 MB.');
      return;
    }

    setUploadingPhoto(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await api.post<{ student: Student }>('/students/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStudent(res.data.student);
      setSuccess('Profile photo updated.');
    } catch (err) {
      setError(getApiError(err, 'Failed to upload profile photo.'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleResumeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files (.pdf) are supported for resume upload.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Resume file size must not exceed 5 MB.');
      return;
    }

    setUploadingResume(true);
    setError(null);
    setSuccess(null);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await api.post<{ student: Student }>('/students/resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStudent(res.data.student);
      setSuccess('Resume PDF uploaded successfully.');
    } catch (err) {
      setError(getApiError(err, 'Failed to upload resume PDF.'));
    } finally {
      setUploadingResume(false);
    }
  };

  const handlePreviewResume = async () => {
    setLoadingPreview(true);
    setError(null);
    try {
      const res = await api.get('/students/resume/download', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResumePreviewUrl(url);
    } catch (err) {
      setError(getApiError(err, 'Unable to load resume preview.'));
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownloadResume = async () => {
    setError(null);
    try {
      const res = await api.get('/students/resume/download?download=1', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = student?.resumeFileName || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getApiError(err, 'Unable to download resume.'));
    }
  };

  const handleDeleteResume = async () => {
    setError(null);
    try {
      const res = await api.delete<{ student: Student }>('/students/resume');
      setStudent(res.data.student);
      setSuccess('Resume removed.');
    } catch (err) {
      setError(getApiError(err, 'Unable to delete resume.'));
    }
  };

  const initials = (student?.fullName || 'S')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const photoUrl = student?.profilePhoto ? `/api/students/photo/${student.profilePhoto}` : null;
  const completion = student?.profileCompletion ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header + Completion Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={student?.fullName || 'Student'}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-900 text-white font-display font-bold text-xl flex items-center justify-center">
                {initials}
              </div>
            )}
            <button
              type="button"
              disabled={uploadingPhoto}
              onClick={() => photoInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 border-2 border-white shadow-sm"
              title="Upload profile photo"
              aria-label="Upload profile photo"
            >
              {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">{student?.fullName}</h2>
            <p className="text-sm text-slate-600">{student?.email}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {student?.college} · {student?.rollNumber}
            </p>
          </div>
        </div>

        <div className="w-full md:w-72">
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-slate-600">Profile Completion</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">{completion}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Complete academic, skills, links, and resume details for full readiness.
          </p>
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

      {success && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Resume Management Card */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">Resume Management (PDF)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload your latest resume in PDF format (maximum 5 MB).
            </p>
          </div>
          <div>
            <input
              ref={resumeInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleResumeUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploadingResume}
              onClick={() => resumeInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {uploadingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{student?.resumeStoredName ? 'Replace Resume' : 'Upload Resume PDF'}</span>
            </button>
          </div>
        </div>

        {student?.resumeStoredName ? (
          <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{student.resumeFileName}</p>
                <p className="text-xs text-slate-500 font-mono tabular-nums">
                  {(student.resumeSize / 1024).toFixed(1)} KB · Uploaded{' '}
                  {student.resumeUploadedAt.slice(0, 10)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePreviewResume}
                disabled={loadingPreview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{loadingPreview ? 'Opening...' : 'Preview'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadResume}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteResume}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-6 rounded-xl border border-dashed border-slate-300 text-center">
            <p className="text-sm font-medium text-slate-700">No resume uploaded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Upload your PDF resume to keep it handy for applications and quick previews.
            </p>
          </div>
        )}
      </section>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <h3 className="font-display text-base font-semibold text-slate-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={student?.email || ''}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date of Birth (optional)
              </label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg tabular-nums"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="City, State, Country"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Academic Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <h3 className="font-display text-base font-semibold text-slate-900 mb-4">Academic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                College / University *
              </label>
              <input
                type="text"
                required
                value={form.college}
                onChange={(e) => handleChange('college', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Degree *</label>
              <input
                type="text"
                required
                value={form.degree}
                onChange={(e) => handleChange('degree', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Department *</label>
              <input
                type="text"
                required
                value={form.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Roll Number *</label>
              <input
                type="text"
                required
                value={form.rollNumber}
                onChange={(e) => handleChange('rollNumber', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Semester</label>
              <input
                type="text"
                value={form.currentSemester}
                onChange={(e) => handleChange('currentSemester', e.target.value)}
                placeholder="e.g., 6th Semester"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Grad Year *</label>
                <input
                  type="number"
                  min={2000}
                  max={2040}
                  required
                  value={form.graduationYear}
                  onChange={(e) => handleChange('graduationYear', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">CGPA / %</label>
                <input
                  type="text"
                  value={form.cgpa}
                  onChange={(e) => handleChange('cgpa', e.target.value)}
                  placeholder="8.9 / 89%"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg tabular-nums"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Professional Information */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <h3 className="font-display text-base font-semibold text-slate-900 mb-4">
            Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Technical Skills</label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="React, Express, Docker, Git, System Design"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Programming Languages
              </label>
              <input
                type="text"
                value={form.programmingLanguages}
                onChange={(e) => handleChange('programmingLanguages', e.target.value)}
                placeholder="TypeScript, Python, Java, C++"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Projects</label>
              <textarea
                rows={3}
                value={form.projects}
                onChange={(e) => handleChange('projects', e.target.value)}
                placeholder="Briefly list key academic or personal projects..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Certifications</label>
              <textarea
                rows={3}
                value={form.certifications}
                onChange={(e) => handleChange('certifications', e.target.value)}
                placeholder="AWS Cloud Practitioner, Meta Front-End Certificate..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn Profile</label>
                <input
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">GitHub Profile</label>
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) => handleChange('githubUrl', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Portfolio Website</label>
                <input
                  type="url"
                  value={form.portfolioUrl}
                  onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                  placeholder="https://portfolio.dev"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* PDF Resume Preview Modal */}
      {resumePreviewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-4xl h-[85vh] bg-white rounded-xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-900 truncate">
                {student?.resumeFileName || 'Resume Preview'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(resumePreviewUrl);
                    setResumePreviewUrl(null);
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
                  aria-label="Close resume preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <iframe
              src={resumePreviewUrl}
              title="Resume PDF Preview"
              className="flex-1 w-full bg-slate-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}
