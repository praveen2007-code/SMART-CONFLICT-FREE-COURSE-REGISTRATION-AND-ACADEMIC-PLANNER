import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight block">
              SmartPlanner
            </span>
            <span className="text-[11px] text-slate-500 font-medium block -mt-1">
              Course Registration & Academic System
            </span>
          </div>
        </Link>

        {/* User Info & Actions */}
        {user ? (
          <div className="flex items-center gap-4">
            {/* Student metadata badge */}
            {user.role === 'STUDENT' && user.student && (
              <div className="hidden sm:flex items-center gap-3 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700">
                  Sem {user.student.semester}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-mono">
                  Max: <strong className="text-slate-900">{user.student.maxCredits} cr</strong>
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700 font-semibold">
                  Status: Active
                </span>
              </div>
            )}

            {/* User chip */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                {user.role === 'ADMIN' ? <Shield className="w-4 h-4" /> : user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                <span className="inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
