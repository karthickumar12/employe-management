import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, User, Briefcase, PlusCircle, FileText, 
  Calendar, BarChart3, Users, Building2, UserCheck, CheckSquare, 
  LogOut, ShieldAlert
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;

  const candidateLinks = [
    { name: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/candidate/profile', icon: User },
    { name: 'Browse Jobs', path: '/jobs', icon: Briefcase },
    { name: 'My Applications', path: '/candidate/applications', icon: FileText },
    { name: 'Interview Schedule', path: '/candidate/interviews', icon: Calendar },
  ];

  const recruiterLinks = [
    { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Manage Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { name: 'Create Job Posting', path: '/recruiter/jobs/create', icon: PlusCircle },
    { name: 'Applicants & Reviews', path: '/recruiter/applicants', icon: Users },
    { name: 'Interview Management', path: '/recruiter/interviews', icon: Calendar },
    { name: 'Recruitment Reports', path: '/recruiter/reports', icon: BarChart3 },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage Recruiters', path: '/admin/recruiters', icon: Building2 },
    { name: 'Manage Candidates', path: '/admin/candidates', icon: UserCheck },
    { name: 'Manage Job Vacancies', path: '/admin/jobs', icon: Briefcase },
    { name: 'Manage Applications', path: '/admin/applications', icon: CheckSquare },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
  ];

  const links = role === 'admin' ? adminLinks : role === 'recruiter' ? recruiterLinks : candidateLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-navy-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 border-r border-navy-800 shrink-0">
      <div className="space-y-6">
        {/* User Card */}
        <div className="bg-navy-800/80 rounded-xl p-3.5 border border-slate-700/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-white text-sm truncate">{user.name}</p>
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-primary-400 bg-primary-950/60 px-2 py-0.5 rounded border border-primary-800/50 mt-0.5">
              {role}
            </span>
          </div>
        </div>

        {/* Navigation Heading */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Console Menu
          </p>
          <nav className="space-y-1">
            {links.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path.endsWith('/dashboard')}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                        : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                    }`
                  }
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Sign Out */}
      <div className="pt-4 border-t border-navy-800 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>

        <div className="px-3 text-[10px] text-slate-500 font-medium">
          <p>OOASE Academic Project</p>
          <p className="text-slate-400 font-semibold">KARTHICKUMAR S S</p>
          <p>Reg: 6113241041061</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
