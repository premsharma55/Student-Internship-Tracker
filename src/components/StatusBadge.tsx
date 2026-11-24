import {
  CheckCircle2,
  Clock,
  Eye,
  CalendarClock,
  Sparkles,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import type { ApplicationStatus } from '../types';

const STATUS_STYLES: Record<
  ApplicationStatus,
  { bg: string; text: string; border: string; Icon: typeof Clock }
> = {
  Applied: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    Icon: Clock,
  },
  'Under Review': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    Icon: Eye,
  },
  Shortlisted: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    Icon: Sparkles,
  },
  'Interview Scheduled': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    Icon: CalendarClock,
  },
  Selected: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    Icon: CheckCircle2,
  },
  Rejected: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    Icon: XCircle,
  },
  Withdrawn: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    Icon: MinusCircle,
  },
};

export function StatusBadge({ status }: { status: ApplicationStatus | string }) {
  const style =
    STATUS_STYLES[status as ApplicationStatus] ?? {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      Icon: Clock,
    };
  const { Icon } = style;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border whitespace-nowrap ${style.bg} ${style.text} ${style.border}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

const AVATAR_PALETTE = [
  'bg-blue-600 text-white',
  'bg-indigo-600 text-white',
  'bg-slate-800 text-white',
  'bg-cyan-700 text-white',
  'bg-emerald-700 text-white',
  'bg-violet-700 text-white',
];

export function CompanyAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const trimmed = (name || 'C').trim();
  const words = trimmed.split(/\s+/);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : trimmed.slice(0, 2).toUpperCase();

  let hash = 0;
  for (let i = 0; i < trimmed.length; i += 1) {
    hash = trimmed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorClass = AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];

  const sizeClass =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
        ? 'w-12 h-12 text-base'
        : 'w-9 h-9 text-xs';

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-lg font-display font-semibold flex items-center justify-center shrink-0 select-none`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
