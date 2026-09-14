import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { GraduationCap, LogIn, Lock, Mail, Sparkles, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.success) {
        login(res.token, res.user);
        success(`Welcome back, ${res.user.name}!`);
        if (res.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      error(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoStudent = () => {
    setEmail('student@university.edu');
    setPassword('password123');
  };

  const setDemoAdmin = () => {
    setEmail('admin@university.edu');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/25">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to SmartPlanner
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Course Registration & Smart Academic Management System
          </p>
        </div>

        {/* Demo Quick Logins */}
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Instant Demo Accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={setDemoStudent}
              className="px-3 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-900 text-xs font-semibold hover:bg-indigo-100/50 transition-colors text-left flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-600" />
              <div>
                <span className="block font-bold">Demo Student</span>
                <span className="block text-[10px] text-slate-500 font-normal">Alex Rivera</span>
              </div>
            </button>
            <button
              type="button"
              onClick={setDemoAdmin}
              className="px-3 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-900 text-xs font-semibold hover:bg-indigo-100/50 transition-colors text-left flex items-center gap-2"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <div>
                <span className="block font-bold">Demo Admin</span>
                <span className="block text-[10px] text-slate-500 font-normal">Dr. Marcus Vance</span>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Register as a Student
          </Link>
        </p>
      </div>
    </div>
  );
};
