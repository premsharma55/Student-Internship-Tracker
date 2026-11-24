import {
  Bell,
  Briefcase,
  CalendarClock,
  ChevronDown,
  FilePlus2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { NotificationItem } from '../types';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/applications', label: 'My Applications', icon: Briefcase, end: true },
  { to: '/applications/new', label: 'Add Internship', icon: FilePlus2, end: true },
  { to: '/interviews', label: 'Interviews', icon: CalendarClock, end: true },
  { to: '/profile', label: 'My Profile', icon: User, end: true },
  { to: '/settings', label: 'Settings', icon: Settings, end: true },
];

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/applications') return 'My Applications';
  if (pathname === '/applications/new') return 'Add Internship';
  if (pathname.endsWith('/edit')) return 'Edit Internship';
  if (pathname.startsWith('/applications/')) return 'Application Details';
  if (pathname === '/interviews') return 'Interviews & Deadlines';
  if (pathname === '/profile') return 'Student Profile';
  if (pathname === '/settings') return 'Settings';
  return 'InternTrack';
}

export function Layout() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSidebarOpen(false);
    setNotifOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    let active = true;
    const fetchNotifications = async () => {
      try {
        const res = await api.get<{ notifications: NotificationItem[] }>('/dashboard/notifications');
        if (active) setNotifications(res.data.notifications || []);
      } catch {
        // Keep existing notifications silently
      }
    };
    fetchNotifications();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGlobalSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/applications?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/applications');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = (student?.fullName || 'S')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const photoUrl = student?.profilePhoto ? `/api/students/photo/${student.profilePhoto}` : null;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-neutral-950 border-r border-neutral-800 text-neutral-200 select-none">
      <div className="h-[68px] px-5 flex items-center justify-between border-b border-neutral-800 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2.5 text-white whitespace-nowrap">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">InternTrack</span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto" aria-label="Primary Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[15px] font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/90'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-neutral-800 shrink-0">
        <div className="px-3 py-2.5 mb-2 rounded-lg bg-neutral-900 border border-neutral-800">
          <p className="text-sm font-bold text-white truncate">{student?.fullName}</p>
          <p className="text-xs font-medium text-neutral-400 truncate mt-0.5">{student?.college}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[15px] font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0 lg:z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[1px]"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 max-w-[80vw] h-full z-10">{sidebarContent}</aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-[68px] bg-neutral-950 border-b border-neutral-800 text-white px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-lg sm:text-xl text-white truncate">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          <form onSubmit={handleGlobalSearch} className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, role, or skill..."
                aria-label="Search internship applications"
                className="w-full pl-9 pr-3 py-2 text-sm font-medium bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-lg text-neutral-200 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="View reminders and notifications"
                aria-expanded={notifOpen}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-40">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Reminders & Deadlines</span>
                    <span className="text-xs text-slate-500 tabular-nums">{notifications.length} active</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm font-medium text-slate-700">All caught up</p>
                        <p className="text-xs text-slate-500 mt-1">
                          No interviews or deadlines due within your reminder window.
                        </p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <Link
                          key={item.id}
                          to={item.link}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <div
                            className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                              item.type === 'interview'
                                ? 'bg-blue-50 text-blue-600'
                                : item.type === 'expired'
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {item.type === 'interview' ? (
                              <CalendarClock className="w-4 h-4" />
                            ) : item.type === 'expired' ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.subtitle}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-right">
                    <Link
                      to="/interviews"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Open Interviews & Deadlines
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg hover:bg-neutral-800 transition-colors"
                aria-expanded={profileMenuOpen}
                aria-label="Open student profile menu"
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={student?.fullName || 'Student'}
                    className="w-8 h-8 rounded-lg object-cover border border-neutral-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {initials}
                  </div>
                )}
                <div className="hidden sm:block text-left max-w-[150px]">
                  <p className="text-sm font-bold text-white truncate">{student?.fullName}</p>
                  <p className="text-xs font-medium text-neutral-400 truncate">{student?.degree}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-neutral-400 hidden sm:block" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{student?.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{student?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>

        <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-300 px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold text-base text-white">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span>InternTrack</span>
            </Link>
            <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-neutral-300">
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/applications" className="hover:text-white transition-colors">
                Applications
              </Link>
              <Link to="/interviews" className="hover:text-white transition-colors">
                Interviews
              </Link>
              <Link to="/profile" className="hover:text-white transition-colors">
                Profile
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
