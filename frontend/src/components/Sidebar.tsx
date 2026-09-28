import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  CalendarDays,
  BookmarkCheck,
  Compass,
  History,
  User,
  ShieldAlert
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = isAdmin
    ? [
        {
          to: '/admin',
          label: 'Admin Control Center',
          icon: ShieldAlert,
          badge: 'Admin',
          highlight: true
        },
        { to: '/catalog', label: 'Course Catalog', icon: BookOpen },
        { to: '/profile', label: 'My Profile', icon: User },
      ]
    : [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/catalog', label: 'Course Catalog', icon: BookOpen },
        {
          to: '/planner',
          label: 'Smart Course Planner',
          icon: Sparkles,
          badge: 'AI Planner',
          highlight: true
        },
        { to: '/timetable', label: 'Weekly Timetable', icon: CalendarDays },
        { to: '/my-courses', label: 'My Courses', icon: BookmarkCheck },
        { to: '/recommendations', label: 'Recommendations', icon: Compass },
        { to: '/history', label: 'Registration History', icon: History },
        { to: '/profile', label: 'My Profile', icon: User },
      ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {isAdmin ? 'Staff / Admin Portal' : 'Student Portal'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25'
                      : 'bg-indigo-50 text-indigo-700'
                    : item.highlight
                    ? 'text-indigo-900 bg-indigo-50/50 hover:bg-indigo-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? item.highlight
                            ? 'text-white'
                            : 'text-indigo-600'
                          : item.highlight
                          ? 'text-indigo-600'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive && item.highlight
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
