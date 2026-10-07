import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import { Briefcase, FileText, Clock, Calendar, ArrowRight, Eye, ChevronRight } from 'lucide-react';

export const CandidateDashboard = () => {
  const [stats, setStats] = useState({ availableJobs: 0, appliedJobs: 0, applicationsUnderReview: 0, upcomingInterviews: 0 });
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appsRes, invRes] = await Promise.all([
        api.get('/reports/dashboard-stats'),
        api.get('/applications/my-applications'),
        api.get('/interviews')
      ]);

      setStats(statsRes.data);
      setApplications(appsRes.data || []);
      setInterviews(invRes.data || []);
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

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-x-hidden">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidate Overview Console</h1>
            <p className="text-xs text-slate-500 mt-1">Track your active applications, status updates, and scheduled interviews.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard title="Available Jobs" value={stats.availableJobs} icon={Briefcase} color="blue" description="Open vacancies in database" />
            <StatsCard title="Applied Jobs" value={stats.appliedJobs} icon={FileText} color="purple" description="Applications submitted" />
            <StatsCard title="Under Review" value={stats.applicationsUnderReview} icon={Clock} color="amber" description="Under recruiter evaluation" />
            <StatsCard title="Upcoming Interviews" value={stats.upcomingInterviews} icon={Calendar} color="emerald" description="Scheduled interview dates" />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Submitted Applications */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
                <Link to="/candidate/applications" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  View All ({applications.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  <p>You haven't submitted any job applications yet.</p>
                  <Link to="/jobs" className="inline-block mt-3 px-4 py-2 bg-primary-600 text-white font-bold rounded-lg">
                    Browse Job Directory
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Job Title & Company</th>
                        <th className="pb-3">Applied Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {applications.slice(0, 5).map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 pr-2">
                            <p className="font-bold text-slate-900">{app.job_title}</p>
                            <p className="text-[11px] text-slate-500">{app.company_name} • {app.department_name}</p>
                          </td>
                          <td className="py-3 text-slate-600">{new Date(app.applied_at).toLocaleDateString()}</td>
                          <td className="py-3"><StatusBadge status={app.status} /></td>
                          <td className="py-3 text-right">
                            <Link
                              to={`/candidate/tracking/${app.id}`}
                              className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-bold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Track
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Upcoming Interviews Sidebar Widget */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Upcoming Interviews</h2>
                <Link to="/candidate/interviews" className="text-xs font-bold text-primary-600 hover:text-primary-700">
                  View All
                </Link>
              </div>

              {interviews.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No upcoming interviews scheduled yet.</p>
              ) : (
                <div className="space-y-3">
                  {interviews.slice(0, 3).map((inv) => (
                    <div key={inv.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <p className="font-bold text-slate-900">{inv.job_title}</p>
                      <p className="text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary-600" />
                        {new Date(inv.scheduled_date).toLocaleString()}
                      </p>
                      <a 
                        href={inv.location_or_link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] font-semibold text-primary-600 hover:underline block truncate pt-1"
                      >
                        {inv.location_or_link}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CandidateDashboard;
