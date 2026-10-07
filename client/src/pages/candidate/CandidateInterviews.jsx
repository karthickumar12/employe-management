import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import { Calendar, Video, Clock, Building2, User } from 'lucide-react';

export const CandidateInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interview Schedule</h1>
            <p className="text-xs text-slate-500 mt-1">View scheduled interview sessions, meeting links, and interviewer details.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {loading ? (
              <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 space-y-2">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                <p>No interview sessions have been scheduled yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {interviews.map((inv) => (
                  <div key={inv.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 bg-primary-100 px-2 py-0.5 rounded">
                          {inv.department_name}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{inv.job_title}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {inv.company_name}
                        </p>
                      </div>
                      <StatusBadge status={inv.status} />
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 space-y-2 text-xs text-slate-700">
                      <div className="flex items-center gap-2 text-primary-700 font-semibold">
                        <Clock className="w-4 h-4" />
                        <span>Date & Time: {new Date(inv.scheduled_date).toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                        <a 
                          href={inv.location_or_link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-bold text-primary-600 hover:underline truncate"
                        >
                          {inv.location_or_link}
                        </a>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Interviewer: {inv.recruiter_name}</span>
                      </div>

                      {inv.notes && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 mt-2 text-[11px] text-slate-600 italic">
                          "{inv.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CandidateInterviews;
