import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatsCard from '../../components/StatsCard';
import { Users, Building2, Briefcase, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalCandidates: 0, totalRecruiters: 0, totalJobVacancies: 0, totalApplications: 0, selectedCandidates: 0 });
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/reports/dashboard-stats'),
        api.get('/reports/analytics')
      ]);

      setStats(statsRes.data);
      setReports(analyticsRes.data);
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
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              System Administrator Console
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Master Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">Centralized platform oversight, user management, and recruitment analytics.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard title="Total Candidates" value={stats.totalCandidates} icon={Users} color="blue" description="Registered job seekers" />
            <StatsCard title="Total Recruiters" value={stats.totalRecruiters} icon={Building2} color="purple" description="HR talent managers" />
            <StatsCard title="Job Vacancies" value={stats.totalJobVacancies} icon={Briefcase} color="amber" description="Active job postings" />
            <StatsCard title="Total Applications" value={stats.totalApplications} icon={FileText} color="indigo" description="Submitted applications" />
            <StatsCard title="Selected Candidates" value={stats.selectedCandidates} icon={CheckCircle2} color="emerald" description="Successful hires" />
          </div>

          {/* Department Distribution Chart */}
          {reports && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Department Activity Distribution</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reports.departmentDistribution}>
                    <XAxis dataKey="department" textAnchor="end" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_applications" fill="#0c8ee9" name="Applications" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total_jobs" fill="#9333ea" name="Vacancies" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Quick Management Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link to="/admin/users" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-primary-400 transition-all">
              <Users className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Manage User Accounts</h3>
              <p className="text-xs text-slate-500 mt-1">Activate, deactivate, or delete candidate & recruiter accounts.</p>
            </Link>

            <Link to="/admin/jobs" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-primary-400 transition-all">
              <Briefcase className="w-8 h-8 text-amber-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">Manage Job Vacancies</h3>
              <p className="text-xs text-slate-500 mt-1">Review all active and closed job vacancies across departments.</p>
            </Link>

            <Link to="/admin/reports" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-primary-400 transition-all">
              <FileText className="w-8 h-8 text-emerald-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">System Reports & Analytics</h3>
              <p className="text-xs text-slate-500 mt-1">View exportable recruitment funnel metrics and audit data.</p>
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
