import React from 'react';
import { ApplicationStatus, CertificateStatus, UserRole } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Calendar, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus | CertificateStatus | 'pass' | 'fail';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  switch (status) {
    case 'submitted':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Submitted</span>
        </span>
      );

    case 'scheduled':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Scheduled</span>
        </span>
      );

    case 'in-progress':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 animate-pulse" />
          <span>In Progress</span>
        </span>
      );

    case 'verified':
    case 'active':
    case 'pass':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="capitalize">{status === 'pass' ? 'Passed' : status === 'active' ? 'Active' : 'Verified'}</span>
        </span>
      );

    case 'rejected':
    case 'fail':
    case 'revoked':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span className="capitalize">{status === 'fail' ? 'Failed' : status === 'revoked' ? 'Revoked' : 'Rejected'}</span>
        </span>
      );

    case 'expired':
      return (
        <span
          id={`status-badge-${status}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Expired</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  switch (role) {
    case 'applicant':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
          Instrument Owner
        </span>
      );
    case 'lmo':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <ShieldCheck className="w-3 h-3" />
          Legal Metrology Officer
        </span>
      );
    case 'gatc':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200">
          GATC Test Lab
        </span>
      );
    case 'admin':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-white">
          System Admin
        </span>
      );
  }
};
