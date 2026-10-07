import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import { Briefcase, Search, Building2, MapPin } from 'lucide-react';

export const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [search]);

  const fetchJobs = async () => {
    try {
      const res = await api.get(`/jobs?search=${encodeURIComponent(search)}&status=Open`);
      setJobs(res.data.jobs || []);
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System-Wide Job Vacancies</h1>
            <p className="text-xs text-slate-500 mt-1">Master oversight of all posted jobs across organizations.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-w-xs text-xs">
            <div className="flex items-center px-3 bg-slate-50 border border-slate-200 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search job title, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {loading ? (
              <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Vacancy Title & Company</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Location & Type</th>
                      <th className="pb-3">Applicants</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {jobs.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50/80">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-slate-900 text-sm">{j.title}</p>
                          <p className="text-[11px] text-slate-500">{j.company_name} • Posted by {j.recruiter_name}</p>
                        </td>

                        <td className="py-4 text-slate-700 font-semibold">{j.department_name}</td>

                        <td className="py-4 text-slate-600">{j.location} ({j.employment_type})</td>

                        <td className="py-4 font-bold text-primary-600">{j.total_applicants} Applicants</td>

                        <td className="py-4"><StatusBadge status={j.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminJobs;
