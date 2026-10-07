import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 text-sm border-t border-navy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">RecruitX ERP</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Web-based Employee Recruitment Management System developed for Object-Oriented Analysis & Software Engineering (OOASE).
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition-colors">Home Page</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Project</Link></li>
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Vacancies</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Role Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-white transition-colors">Candidate Login & Register</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Recruiter HR Console</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">System Admin Access</Link></li>
              <li><Link to="/jobs" className="hover:text-white transition-colors">Job Application Tracking</Link></li>
            </ul>
          </div>

          {/* Academic Info */}
          <div className="bg-navy-900/80 p-4 rounded-xl border border-navy-800 space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-primary-400">Academic Project Details</h4>
            <div className="text-xs space-y-1">
              <p><span className="text-slate-400">Student:</span> <span className="text-white font-medium">KARTHICKUMAR S S</span></p>
              <p><span className="text-slate-400">Register No:</span> <span className="text-white font-medium">6113241041061</span></p>
              <p><span className="text-slate-400">Subject:</span> <span className="text-white font-medium">OOASE Engineering</span></p>
              <p><span className="text-slate-400">Stack:</span> <span className="text-white font-medium">React, Node, Express, MySQL</span></p>
            </div>
          </div>
        </div>

        <div className="border-t border-navy-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} Employee Recruitment Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Academic Evaluation
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
