import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, PieChart as PieIcon, Award, Printer } from 'lucide-react';

export const AdminReports = () => {
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

  const COLORS = ['#0c8ee9', '#9333ea', '#d97706', '#0891b2', '#059669', '#e11d48'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-x-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Master Reports & Analytics</h1>
              <p className="text-xs text-slate-500 mt-1">Audit statistics, candidate conversion funnels, and department distribution.</p>
            </div>
            
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white border border-slate-300 font-bold text-xs rounded-xl shadow-sm text-slate-700 flex items-center gap-2 hover:bg-slate-50"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Print Report
            </button>
          </div>

          {loading ? (
            <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
          ) : !reports ? (
            <p className="text-xs text-slate-500">Analytics unavailable.</p>
          ) : (
            <div className="space-y-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary-600" />
                    Department Distribution & Application Volume
                  </h3>
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

                {/* Pipeline Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-primary-600" />
                    Global Application Status Funnel
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

              {/* Popular Jobs Table */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Top Performing Job Postings
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Job Title</th>
                        <th className="pb-3">Department</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3 text-right">Applicant Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {reports.topJobs.map((j) => (
                        <tr key={j.id} className="hover:bg-slate-50/80">
                          <td className="py-3 font-bold text-slate-900">{j.title}</td>
                          <td className="py-3 text-slate-700">{j.department_name}</td>
                          <td className="py-3 text-slate-600">{j.location}</td>
                          <td className="py-3 text-right font-extrabold text-primary-600">{j.applicant_count} Applicants</td>
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

export default AdminReports;
