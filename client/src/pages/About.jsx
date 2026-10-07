import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Database, Server, Code, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';

export const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12">
        {/* Header Title */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm text-center max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200 mb-3">
            Academic College Project Submission
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Employee Recruitment Management System
          </h1>
          <p className="text-slate-600 text-sm mt-2">
            Subject: Object-Oriented Analysis and Software Engineering (OOASE)
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs bg-slate-50 p-4 rounded-xl">
            <div>
              <p className="text-slate-400 font-medium">Student Name:</p>
              <p className="font-bold text-slate-900 text-sm">KARTHICKUMAR S S</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Register Number:</p>
              <p className="font-bold text-slate-900 text-sm">6113241041061</p>
            </div>
          </div>
        </div>

        {/* Technology Stack Grid */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Technology Stack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <Code className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-sm mb-1">Frontend</h3>
              <p className="text-xs text-slate-600">React.js with Vite, Tailwind CSS, Lucide React icons, and Recharts graphs.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <Server className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-sm mb-1">Backend REST API</h3>
              <p className="text-xs text-slate-600">Node.js and Express.js MVC framework with JWT authentication and Multer PDF uploads.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <Database className="w-8 h-8 text-indigo-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-sm mb-1">MySQL Database</h3>
              <p className="text-xs text-slate-600">Normalized 9-table schema with Foreign Key constraints and parameterized SQL queries.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-sm mb-1">Role-Based Access</h3>
              <p className="text-xs text-slate-600">Secure passwords using bcryptjs hashing and role-based permissions (Candidate, Recruiter, Admin).</p>
            </div>
          </div>
        </div>

        {/* System Architecture Specifications */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Database & System Architecture</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The database structure follows standard 3rd Normal Form (3NF) relational practices with nine core tables:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-1">1. users</p>
              <p className="text-slate-500">Stores credentials, bcrypt password hash, and role (admin, recruiter, candidate).</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-1">2. candidates</p>
              <p className="text-slate-500">Links user to education, headline, skills, location, phone, and experience.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-1">3. recruiters</p>
              <p className="text-slate-500">Links user to company name, designation, and department_id.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-1">4. departments</p>
              <p className="text-slate-500">Engineering, HR, Product, Marketing, and Operations.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-1">5. jobs</p>
              <p className="text-slate-500">Vacancies with department, recruiter, salary range, and Open/Closed status.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-1">6. applications</p>
              <p className="text-slate-500">Candidate job applications with unique constraint on (job_id, candidate_id).</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-1">7. resumes</p>
              <p className="text-slate-500">PDF file uploads associated with candidate profile records.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-1">8. interviews</p>
              <p className="text-slate-500">Meeting dates, Google Meet links, notes, and outcome status.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-1">9. notifications</p>
              <p className="text-slate-500">Real-time alerts sent to candidates and recruiters upon status changes.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
