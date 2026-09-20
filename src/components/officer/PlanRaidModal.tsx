import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Shield,
  ShieldAlert,
  Users,
  FileText,
  X,
  CheckCircle2,
  ArrowRight,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { GisInstrumentMarker, INSTRUMENT_TYPE_LABELS } from '../../types';
import { dataStore } from '../../lib/dataStore';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PlanRaidModalProps {
  marker: GisInstrumentMarker;
  onClose: () => void;
  onSuccess: (applicationId: string) => void;
}

export const PlanRaidModal: React.FC<PlanRaidModalProps> = ({
  marker,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm

  const [inspectionType, setInspectionType] = useState<'raid' | 'statutory_reverification'>('raid');
  const [scheduledDate, setScheduledDate] = useState(defaultDate);
  const [priority, setPriority] = useState<'urgent' | 'high' | 'routine'>('urgent');
  const [teamMembers, setTeamMembers] = useState('Zone-II Enforcement Flying Squad (2 Inspectors + Technical Assistant)');
  const [notes, setNotes] = useState(
    'Targeted enforcement raid for continuous commercial operation with expired verification certificate under Section 24 of Legal Metrology Act, 2009.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduledAppId, setScheduledAppId] = useState<string | null>(null);

  const { instrument, business, certificate, daysUntilExpiry } = marker;
  const isExpired = marker.status === 'EXPIRED';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const scheduledApp = dataStore.planEnforcementInspection({
        instrumentId: instrument.id,
        officerId: user.id,
        scheduledDate: new Date(scheduledDate).toISOString(),
        inspectionType,
        priority,
        notes,
        teamMembers,
      });

      setScheduledAppId(scheduledApp.id);
      onSuccess(scheduledApp.id);
    } catch (err) {
      console.error('Failed to schedule enforcement raid:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Plan Legal Metrology Enforcement Action</h3>
              <p className="text-xs text-slate-300">
                Statutory field raid & re-verification inspection order
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {scheduledAppId ? (
          /* Confirmation State */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-slate-900">Enforcement Action Scheduled</h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Official task has been logged under{' '}
                <span className="font-semibold text-slate-900">APP-{scheduledAppId.slice(-6).toUpperCase()}</span>{' '}
                and dispatched to your verification queue. A statutory notice has also been transmitted to the business establishment.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4" /> Next Steps for LMO Officer:
              </div>
              <p>1. Team will execute surprise physical verification at the specified coordinates.</p>
              <p>2. Record observed errors, standard weight test margins, and digital lead wire seals.</p>
              <p>3. Submit the verification result in the Officer Queue to issue a fresh digital certificate.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/officer');
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <span>Open in Officer Verification Queue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
              >
                Back to Enforcement Map
              </button>
            </div>
          </div>
        ) : (
          /* Scheduling Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Target Establishment Card */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200 mb-1">
                    {isExpired ? '🔴 EXPIRED CERTIFICATE' : '⚠️ EXPIRING SOON'}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{business.organization}</h4>
                  <p className="text-xs text-slate-600 font-medium">Owner / Operator: {business.name}</p>
                </div>
                {certificate && (
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 uppercase font-mono">Cert No.</span>
                    <p className="text-xs font-mono font-bold text-slate-800">{certificate.certificate_number}</p>
                    <p className="text-[11px] text-red-600 font-semibold">
                      {daysUntilExpiry != null && daysUntilExpiry < 0
                        ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                        : `Expires in ${daysUntilExpiry} days`}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                <div>
                  <span className="text-slate-500">Instrument:</span>{' '}
                  <span className="font-semibold">{instrument.make} - {instrument.model}</span>
                </div>
                <div>
                  <span className="text-slate-500">Serial No:</span>{' '}
                  <span className="font-mono font-medium">{instrument.serial_number}</span>
                </div>
                <div className="sm:col-span-2 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-600 truncate">{instrument.location}</span>
                </div>
              </div>
            </div>

            {/* Action Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Enforcement Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    inspectionType === 'raid'
                      ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="inspectionType"
                    checked={inspectionType === 'raid'}
                    onChange={() => setInspectionType('raid')}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      Surprise Enforcement Raid
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Under Section 30 of LM Act. Seizure & compounding inspection for uncertified commercial use.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    inspectionType === 'statutory_reverification'
                      ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="inspectionType"
                    checked={inspectionType === 'statutory_reverification'}
                    onChange={() => setInspectionType('statutory_reverification')}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Statutory Re-Verification
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Scheduled field inspection for calibration, standard weight testing, and lead seal stamping.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Date and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Raid / Inspection Date & Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Enforcement Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="urgent">🔴 Urgent (High volume / Mandi / Petroleum / Weighbridge)</option>
                  <option value="high">🟠 High (Expired &gt; 30 Days)</option>
                  <option value="routine">🟡 Routine (First Inspection Notice)</option>
                </select>
              </div>
            </div>

            {/* Squad / Team */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Assigned Enforcement Squad / Team
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={teamMembers}
                  onChange={(e) => setTeamMembers(e.target.value)}
                  placeholder="e.g. Zone-II Flying Squad (Inspector Sharma + 2 Staff)"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Officer Directives */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Officer Directives & Infraction Details
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter specific field instructions or statutory reference..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm flex items-center gap-2 ${
                  inspectionType === 'raid'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Scheduling...'
                    : inspectionType === 'raid'
                    ? 'Schedule Raid & Issue Statutory Notice'
                    : 'Schedule Re-Verification Inspection'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
