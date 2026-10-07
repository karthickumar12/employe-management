import React from 'react';

export const StatusBadge = ({ status }) => {
  let badgeStyles = 'bg-gray-100 text-gray-800 border-gray-200';

  switch (status) {
    case 'Applied':
      badgeStyles = 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/10';
      break;
    case 'Under Review':
      badgeStyles = 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/10';
      break;
    case 'Shortlisted':
      badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10';
      break;
    case 'Interview Scheduled':
      badgeStyles = 'bg-cyan-50 text-cyan-700 border-cyan-200 ring-1 ring-cyan-500/10';
      break;
    case 'Selected':
    case 'Open':
    case 'Passed':
    case 'active':
      badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10';
      break;
    case 'Rejected':
    case 'Closed':
    case 'Failed':
    case 'inactive':
      badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/10';
      break;
    case 'Scheduled':
      badgeStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/10';
      break;
    default:
      badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
