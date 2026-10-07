import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import { Briefcase, Users, UserCheck, Calendar, PlusCircle, ArrowRight, Eye } from 'lucide-react';

export const RecruiterDashboard = () => {
  const [stats, setStats] = useState({ activeJobVacancies: 0, totalApplicants: 0, shortlistedCandidates: 0, upcomingInterviews: 0 });
  const [myJobs, setMyJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, jobsRes, appsRes] = await Promise.all([
        api.get('/reports/dashboard-stats'),
        api.get('/jobs/recruiter/my-jobs'),
        api.get('/applications/recruiter/applicants')
      ]);

      setStats(statsRes.data);
      setMyJobs(jobsRes.data || []);
      setApplicants(appsRes.data || []);
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
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruiter HR Console</h1>
              <p className="text-xs text-slate-500 mt-1">Manage job postings, review applicants, and schedule interview rounds.</p>
            </div>
            <Link
              to="/recruiter/jobs/create"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Post New Vacancy
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatsCard title="Active Jobs" value={stats.activeJobVacancies} icon={Briefcase} color="blue" description="Open job postings" />
            <StatsCard title="Total Applicants" value={stats.totalApplicants} icon={Users} color="purple" description="Applications received" />
            <StatsCard title="Shortlisted" value={stats.shortlistedCandidates} icon={UserCheck} color="amber" description="Shortlisted for interview" />
            <StatsCard title="Upcoming Interviews" value={stats.upcomingInterviews} icon={Calendar} color="emerald" description="Scheduled interview rounds" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Active Job Postings */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Your Posted Vacancies</h2>
                <Link to="/recruiter/jobs" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  Manage All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {myJobs.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No active job postings created yet.</p>
              ) : (
                <div className="space-y-3">
                  {myJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{job.title}</p>
                        <p className="text-[11px] text-slate-500">{job.department_name} • {job.location}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary-700 bg-primary-100 px-2 py-0.5 rounded text-[11px]">
                          {job.total_applicants} Applicants
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{job.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Applicants */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Recent Job Applicants</h2>
                <Link to="/recruiter/applicants" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  Review All ({applicants.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {applicants.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No candidate applications received yet.</p>
              ) : (
                <div className="space-y-3">
                  {applicants.slice(0, 5).map((app) => (
                    <div key={app.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{app.candidate_name}</p>
                        <p className="text-[11px] text-slate-500">Applied for: {app.job_title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={app.status} />
                        <Link
                          to={`/recruiter/candidate/${app.candidate_id}`}
                          className="p-1.5 bg-white text-slate-600 hover:text-primary-600 border border-slate-200 rounded-lg shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
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

export default RecruiterDashboard;
