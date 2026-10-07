import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Building2, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const JobCard = ({ job, onApply }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200/60 mb-2">
              {job.department_name || 'General Department'}
            </span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
              {job.title}
            </h3>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {job.company_name || 'Apex Tech Solutions'}
            </p>
          </div>
          <StatusBadge status={job.status || 'Open'} />
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {job.description}
        </p>

        {/* Job Tags Metadata */}
        <div className="flex flex-wrap gap-2 text-xs text-slate-600 font-medium mb-4">
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/70">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/70">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.employment_type}</span>
          </div>
          {job.salary_range && (
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200/60 font-semibold">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{job.salary_range}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-400 font-medium">
          Posted {new Date(job.created_at).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2">
          <Link
            to={`/jobs/${job.id}`}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-primary-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
          >
            Details
            <ArrowRight className="w-3 h-3" />
          </Link>
          {onApply && (
            <button
              onClick={() => onApply(job)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-all"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
