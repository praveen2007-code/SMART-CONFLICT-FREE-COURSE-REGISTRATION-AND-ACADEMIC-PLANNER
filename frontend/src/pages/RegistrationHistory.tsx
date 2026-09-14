import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { RegistrationLog } from '../types';
import { History, CheckCircle2, Trash2, Calendar, Clock } from 'lucide-react';

export const RegistrationHistory: React.FC = () => {
  const { user } = useAuth();
  const { error } = useToast();
  const [history, setHistory] = useState<RegistrationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.student?.id) return;
      try {
        setIsLoading(true);
        const res = await api.registrations.getHistory(user.student.id);
        if (res.success) {
          setHistory(res.history);
        }
      } catch (err: any) {
        error(err.message || 'Failed to fetch registration history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Registration Audit History
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable chronological log of all enrollments and course drops
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading registration audit logs...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-900 text-sm">No History Records Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Activity will appear here as you register or drop courses.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Section / Details</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      {item.action === 'REGISTER' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>REGISTERED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>DROPPED</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.course_code || item.details?.courseCode || 'Course'}
                      {item.course_name && (
                        <span className="block text-slate-500 font-normal text-[11px]">
                          {item.course_name}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      Section {item.details?.sectionCode || 'A'}
                      {item.details?.credits && ` • ${item.details.credits} Credits`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
