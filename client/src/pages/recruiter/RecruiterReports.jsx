import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Award } from 'lucide-react';

export const RecruiterReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      const res = await api.get('/reports/analytics');
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0270c7', '#9333ea', '#d97706', '#0891b2', '#059669', '#e11d48'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-x-hidden">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruitment Analytics & Reports</h1>
            <p className="text-xs text-slate-500 mt-1">Real-time candidate application funnels, department distribution, and hiring metrics.</p>
          </div>

          {loading ? (
            <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
          ) : !reports ? (
            <p className="text-xs text-slate-500">Failed to load analytics data.</p>
          ) : (
            <div className="space-y-8">
              
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Department Distribution Bar Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary-600" />
                    Applications & Jobs per Department
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reports.departmentDistribution}>
                        <XAxis dataKey="department" textAnchor="end" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total_applications" fill="#0270c7" name="Applications" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="total_jobs" fill="#9333ea" name="Vacancies" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Application Status Breakdown Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-primary-600" />
                    Application Pipeline Status Distribution
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reports.statusBreakdown}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {reports.statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Top Jobs Table */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Most Popular Job Vacancies by Candidate Applications
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Job Title</th>
                        <th className="pb-3">Department</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3 text-right">Total Applicant Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {reports.topJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/80">
                          <td className="py-3 font-bold text-slate-900">{job.title}</td>
                          <td className="py-3 text-slate-700">{job.department_name}</td>
                          <td className="py-3 text-slate-600">{job.location}</td>
                          <td className="py-3 text-right font-extrabold text-primary-600">{job.applicant_count} Applicants</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecruiterReports;
