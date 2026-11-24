export const APPLICATION_STATUSES = [
  'Applied',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Selected',
  'Rejected',
  'Withdrawn',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const INTERNSHIP_TYPES = ['Remote', 'On-site', 'Hybrid'] as const;
export type InternshipType = (typeof INTERNSHIP_TYPES)[number];

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time'] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const APPLICATION_SOURCES = [
  'LinkedIn',
  'Company Website',
  'Referral',
  'College Placement',
  'Other',
] as const;

export const INTERVIEW_MODES = ['Online', 'Offline'] as const;
export type InterviewMode = (typeof INTERVIEW_MODES)[number];

export const INTERVIEW_STATUSES = ['Scheduled', 'Completed', 'Cancelled'] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export interface Student {
  id: number;
  fullName: string;
  email: string;
  role: string;
  phone: string;
  dob: string;
  address: string;
  profilePhoto: string;
  college: string;
  degree: string;
  department: string;
  rollNumber: string;
  currentSemester: string;
  graduationYear: number;
  cgpa: string;
  skills: string;
  programmingLanguages: string;
  projects: string;
  certifications: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  resumeFileName: string;
  resumeStoredName: string;
  resumeSize: number;
  resumeUploadedAt: string;
  deadlineAlertDays: number;
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
}

export interface Internship {
  id: number;
  studentId: number;
  companyName: string;
  companyWebsite: string;
  companyLocation: string;
  industry: string;
  position: string;
  internshipType: InternshipType;
  employmentType: EmploymentType;
  duration: string;
  stipend: number;
  requiredSkills: string;
  applicationDate: string;
  deadline: string;
  applicationSource: string;
  status: ApplicationStatus;
  jobDescription: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationHistoryItem {
  id: number;
  internshipId: number;
  studentId: number;
  previousStatus: string | null;
  newStatus: string;
  changedAt: string;
  notes: string;
}

export interface Interview {
  id: number;
  studentId: number;
  internshipId: number;
  interviewDate: string;
  interviewTime: string;
  interviewMode: InterviewMode;
  meetingLink: string;
  location: string;
  interviewRound: string;
  status: InterviewStatus;
  notes: string;
  companyName?: string;
  position?: string;
  companyLocation?: string;
  applicationStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStatsResponse {
  stats: {
    total: number;
    applied: number;
    underReview: number;
    shortlisted: number;
    interviewScheduled: number;
    selected: number;
    rejected: number;
    withdrawn: number;
  };
  statusBreakdown: { status: ApplicationStatus; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  upcomingInterviews: Interview[];
  approachingDeadlines: Array<{
    id: number;
    companyName: string;
    position: string;
    deadline: string;
    status: ApplicationStatus;
  }>;
  expiredDeadlines: Array<{
    id: number;
    companyName: string;
    position: string;
    deadline: string;
    status: ApplicationStatus;
  }>;
  recentActivities: Array<{
    id: number;
    internshipId: number;
    previousStatus: string | null;
    newStatus: string;
    changedAt: string;
    notes: string;
    companyName: string;
    position: string;
  }>;
}

export interface NotificationItem {
  id: string;
  type: 'interview' | 'deadline' | 'expired';
  title: string;
  subtitle: string;
  date: string;
  link: string;
}
