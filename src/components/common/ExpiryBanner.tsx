import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataStore } from '../../lib/dataStore';
import { AlertCircle, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExpiryBanner: React.FC = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || dismissed) return null;

  // Find expiring certificates within 30 days
  const expiring = dataStore.getExpiringCertificates(user.role === 'applicant' ? user.id : undefined);

  if (expiring.length === 0) return null;

  const firstExp = expiring[0];

  return (
    <div
      id="expiry-warning-banner"
      className="bg-amber-500 text-slate-950 px-4 py-2.5 shadow-sm border-b border-amber-600 no-print"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-full bg-amber-600/20 text-slate-950 flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <span className="font-semibold text-slate-950">Statutory Expiry Alert: </span>
            <span>
              Certificate <span className="font-mono font-medium">{firstExp.certificate.certificate_number}</span> for{' '}
              <strong>{firstExp.instrument?.make || 'Instrument'}</strong> ({firstExp.instrument?.serial_number}) expires in{' '}
              <span className="underline font-bold text-red-950">{firstExp.daysRemaining} days</span> (
              {firstExp.certificate.expiry_date}).
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {user.role === 'applicant' ? (
            <Link
              to="/applicant/instruments"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              Apply Re-verification
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/certificates"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              Inspect Certificate
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-amber-600/20 rounded transition-colors text-slate-900"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
