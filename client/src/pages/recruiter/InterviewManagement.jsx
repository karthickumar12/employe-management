import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import { Calendar, Video, CheckCircle, XCircle, Clock, User, Building2 } from 'lucide-react';

export const InterviewManagement = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews');
      setInterviews(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOutcomeChange = async (interviewId, newStatus) => {
    try {
      await api.put(`/interviews/${interviewId}/status`, { status: newStatus });
      setToast({ message: `Interview outcome updated to ${newStatus}.`, type: 'success' });
      setInterviews(interviews.map(i => i.id === interviewId ? { ...i, status: newStatus } : i));
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update interview outcome.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interview Management Console</h1>
            <p className="text-xs text-slate-500 mt-1">Review scheduled candidate interviews, meeting links, and record interview results.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {loading ? (
              <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 space-y-2">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                <p>No interviews scheduled yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Candidate & Contact</th>
                      <th className="pb-3">Job Vacancy</th>
                      <th className="pb-3">Date & Time</th>
                      <th className="pb-3">Meeting Link</th>
                      <th className="pb-3">Outcome Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {interviews.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-slate-900 text-sm">{inv.candidate_name}</p>
                          <p className="text-[11px] text-slate-500">{inv.candidate_email} • {inv.candidate_phone}</p>
                        </td>

                        <td className="py-4">
                          <p className="font-bold text-slate-800">{inv.job_title}</p>
                          <p className="text-[11px] text-slate-500">{inv.department_name}</p>
                        </td>

                        <td className="py-4 text-primary-700 font-semibold">
                          {new Date(inv.scheduled_date).toLocaleString()}
                        </td>

                        <td className="py-4 max-w-xs">
                          <a href={inv.location_or_link} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline font-bold truncate block">
                            {inv.location_or_link}
                          </a>
                        </td>

                        <td className="py-4"><StatusBadge status={inv.status} /></td>

                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOutcomeChange(inv.id, 'Passed')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg hover:bg-emerald-100"
                          >
                            Pass (Select)
                          </button>
                          <button
                            onClick={() => handleOutcomeChange(inv.id, 'Failed')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-bold rounded-lg hover:bg-rose-100"
                          >
                            Fail (Reject)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default InterviewManagement;
