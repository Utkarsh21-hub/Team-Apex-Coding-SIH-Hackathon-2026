import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataStore } from '../lib/dataStore';
import { Application, Instrument, Certificate, ApplicationStatus, INSTRUMENT_TYPE_LABELS } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RegisterAndApplyModal } from '../components/applicant/RegisterAndApplyModal';
import {
  Scale,
  FileText,
  Award,
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const ApplicantDashboardView: React.FC = () => {
  const { user } = useAuth();
  const { onOpenCert } = useOutletContext<{ onOpenCert: (c: Certificate) => void }>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!user) return null;

  const instruments = dataStore.getInstruments(user.id);
  const applications = dataStore.getApplications({ applicantId: user.id });
  const certificates = dataStore.getCertificatesForUser(user.id);
  const expiring = dataStore.getExpiringCertificates(user.id);

  // Compute Pendency (days waiting since submitted_at)
  const calculatePendency = (submittedAt: string, status: ApplicationStatus) => {
    if (status === 'verified' || status === 'rejected' || status === 'expired') {
      return 'Completed';
    }
    const today = new Date();
    const sub = new Date(submittedAt);
    const diffDays = Math.max(1, Math.ceil((today.getTime() - sub.getTime()) / (1000 * 60 * 60 * 24)));
    return `${diffDays} day${diffDays === 1 ? '' : 's'} waiting`;
  };

  const filteredApps = filterStatus === 'all'
    ? applications
    : applications.filter((a) => a.status === filterStatus);

  return (
    <div className="space-y-8">
      {/* Top Banner & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Applicant Metrology Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Commercial Dashboard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Establishment: <strong className="text-slate-800">{user.organization}</strong> • GST/Legal Address: {user.address}
          </p>
        </div>

        <button
          id="open-register-apply-modal"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Instrument & Apply</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Instruments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Instruments</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{instruments.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Under Legal Metrology custody</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Applications</span>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {applications.filter((a) => a.status === 'submitted' || a.status === 'scheduled' || a.status === 'in-progress').length}
            </p>
            <p className="text-[11px] text-amber-600/90 mt-0.5">In inspection workflow</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Active Certificates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Certificates</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {certificates.filter((c) => c.status === 'active').length}
            </p>
            <p className="text-[11px] text-emerald-600/90 mt-0.5">Stamped & Valid for trade</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Expiring Within 30 Days */}
        <div className={`p-5 rounded-2xl border shadow-2xs flex items-center justify-between ${
          expiring.length > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Upcoming Expiries</span>
            <p className="text-2xl font-black text-amber-900 mt-1">{expiring.length}</p>
            <p className="text-[11px] text-amber-800 mt-0.5">Within 30 statutory days</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Applications & Status Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Verification Applications & Pendency</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track government inspection schedules, assigned officers, and turnaround times.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
            {['all', 'submitted', 'scheduled', 'verified', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  filterStatus === st
                    ? 'bg-blue-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No applications match this filter</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Register Instrument & Apply" to submit a verification request.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Application ID & Type</th>
                  <th className="py-3.5 px-4">Instrument Target</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Pendency (Turnaround)</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4">Officer / Schedule</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => {
                  const inst = dataStore.getInstrumentById(app.instrument_id);
                  const pendency = calculatePendency(app.submitted_at, app.status);
                  const cert = certificates.find((c) => c.application_id === app.id);
                  const officer = app.assigned_officer_id
                    ? dataStore.getProfileById(app.assigned_officer_id)
                    : undefined;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{app.id}</div>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {app.type === 'new' ? 'Initial Verification' : 'Periodic Re-verification'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {inst?.make} {inst?.model}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          S/N: <span className="font-mono">{inst?.serial_number}</span> • {inst?.capacity}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">
                          {new Date(app.submitted_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            app.status === 'submitted'
                              ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200'
                              : 'text-slate-600'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {pendency}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} />
                      </td>

                      <td className="py-3.5 px-4">
                        {app.scheduled_date ? (
                          <div className="text-xs text-blue-900 font-semibold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>
                              {new Date(app.scheduled_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        ) : officer ? (
                          <div className="text-xs text-slate-800 font-medium">{officer.name}</div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Awaiting Assignment</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {cert ? (
                          <button
                            onClick={() => onOpenCert(cert)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-semibold transition-colors"
                          >
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Certificate</span>
                          </button>
                        ) : app.status === 'rejected' ? (
                          <span className="text-[11px] text-rose-600 font-medium" title={app.rejection_reason}>
                            Inspection Failed
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Processing</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registered Instruments Cards List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">My Registered Instruments</h2>
            <p className="text-xs text-slate-500">
              Weighing & measuring units registered under Legal Metrology Act, 2009
            </p>
          </div>
          <Link
            to="/applicant/instruments"
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Manage All Instruments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instruments.map((inst) => {
            // Find if active cert exists
            const instApps = applications.filter((a) => a.instrument_id === inst.id).map((a) => a.id);
            const activeCert = certificates.find((c) => instApps.includes(c.application_id) && c.status === 'active');

            return (
              <div
                key={inst.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {INSTRUMENT_TYPE_LABELS[inst.instrument_type]?.split(' ')[0] || 'Instrument'}
                    </span>
                    {activeCert ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Stamped & Valid
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Verification Due
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2">
                    {inst.make} — {inst.model}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">
                    S/N: {inst.serial_number}
                  </p>
                  <p className="text-xs text-slate-700 mt-1 font-medium">
                    Capacity: {inst.capacity}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    Loc: {inst.location}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  {activeCert ? (
                    <button
                      onClick={() => onOpenCert(activeCert)}
                      className="text-blue-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Cert {activeCert.certificate_number}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      Apply Re-verification →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Registering Instrument & Submitting Application */}
      <RegisterAndApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
        existingInstruments={instruments}
      />
    </div>
  );
};
