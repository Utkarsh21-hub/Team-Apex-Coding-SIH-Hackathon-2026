import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataStore } from '../lib/dataStore';
import { Application, Instrument, Certificate, InstrumentType, ApplicationStatus, INSTRUMENT_TYPE_LABELS } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RecordVerificationModal } from '../components/officer/RecordVerificationModal';
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Award,
  Scale,
  FileText,
  Image as ImageIcon,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const OfficerQueueView: React.FC = () => {
  const { user, role } = useAuth();
  const { onOpenCert } = useOutletContext<{ onOpenCert: (c: Certificate) => void }>();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedAppForVerification, setSelectedAppForVerification] = useState<Application | null>(null);
  const [schedulingApp, setSchedulingApp] = useState<Application | null>(null);
  const [scheduleDate, setScheduleDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [viewingDocsApp, setViewingDocsApp] = useState<Application | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  if (!user) return null;

  // Fetch applications for this officer/GATC or all if admin
  const allApplications = dataStore.getApplications();
  const applications =
    role === 'lmo'
      ? dataStore.getApplications({ officerId: user.id })
      : role === 'gatc'
      ? dataStore.getApplications({ gatcId: user.id })
      : allApplications;

  // Filter queue
  const filteredQueue = applications.filter((app) => {
    const inst = dataStore.getInstrumentById(app.instrument_id);
    const applicant = dataStore.getProfileById(app.applicant_id);

    // Status filter
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;

    // Instrument Type filter
    if (filterType !== 'all' && inst?.instrument_type !== filterType) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = app.id.toLowerCase().includes(q);
      const matchMake = inst?.make.toLowerCase().includes(q);
      const matchSn = inst?.serial_number.toLowerCase().includes(q);
      const matchOrg = applicant?.organization.toLowerCase().includes(q);
      if (!matchId && !matchMake && !matchSn && !matchOrg) return false;
    }

    return true;
  });

  // Chart data: Verifications completed over time (mocked dynamic buckets)
  const chartData = [
    { month: 'Apr', count: 12 },
    { month: 'May', count: 19 },
    { month: 'Jun', count: 15 },
    { month: 'Jul', count: 24 },
    { month: 'Aug', count: 28 },
    { month: 'Sep', count: applications.filter((a) => a.status === 'verified').length + 8 },
  ];

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApp) return;

    dataStore.scheduleApplication(schedulingApp.id, user.id, scheduleDate);
    setSchedulingApp(null);
    setSuccessBanner(`Inspection for ${schedulingApp.id} scheduled for ${scheduleDate}.`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {role === 'gatc' ? 'GATC Lab Verification Queue' : 'Legal Metrology Inspection Queue'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
              Field Officer Workspace
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Officer: <strong className="text-slate-800">{user.name}</strong> • Jurisdiction:{' '}
            {user.organization}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
            Queue Depth:{' '}
            <strong className="text-blue-700 font-bold">
              {applications.filter((a) => a.status === 'submitted' || a.status === 'scheduled').length}
            </strong>{' '}
            pending
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Mini-cards */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Acceptance</span>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {applications.filter((a) => a.status === 'submitted').length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">New applications in inbox</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Inspections</span>
              <p className="text-2xl font-black text-blue-700 mt-1">
                {applications.filter((a) => a.status === 'scheduled' || a.status === 'in-progress').length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Assigned inspection dates</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verifications Completed</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {applications.filter((a) => a.status === 'verified').length}
              </p>
              <p className="text-[11px] text-emerald-600/90 mt-0.5">Digital certificates generated</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Verification Performance Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Monthly Verification Inspections Completed
              </h3>
              <p className="text-xs text-slate-400">Jurisdiction compliance throughput</p>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#1e40af" radius={[4, 4, 0, 0]} name="Verifications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Inspection Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search application ID, establishment, serial no..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Status & Type Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted (New)</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In-Progress</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Instrument Types</option>
              {Object.entries(INSTRUMENT_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label.split(' ')[0]} {label.split(' ')[1]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Queue Rows */}
        {filteredQueue.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No applications in this queue</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the status or type filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">App ID & Type</th>
                  <th className="py-3.5 px-4">Instrument Specifications</th>
                  <th className="py-3.5 px-4">Applicant Establishment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Schedule / Date</th>
                  <th className="py-3.5 px-4">Documents & Photos</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((app) => {
                  const inst = dataStore.getInstrumentById(app.instrument_id);
                  const applicant = dataStore.getProfileById(app.applicant_id);
                  const cert = dataStore.getCertificates().find((c) => c.application_id === app.id);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{app.id}</div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          {app.type === 'new' ? 'New Verification' : 'Re-verification'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {inst?.make} {inst?.model}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          S/N: <span className="font-mono font-bold text-blue-900">{inst?.serial_number}</span> • {inst?.capacity}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">
                          {inst?.location}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{applicant?.organization}</div>
                        <div className="text-[11px] text-slate-500">{applicant?.name} ({applicant?.phone})</div>
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
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unscheduled
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setViewingDocsApp(app)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {app.photo_urls.length} Photo{app.photo_urls.length === 1 ? '' : 's'}
                          </span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {app.status === 'submitted' ? (
                          <button
                            onClick={() => setSchedulingApp(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Accept & Schedule</span>
                          </button>
                        ) : app.status === 'scheduled' || app.status === 'in-progress' ? (
                          <button
                            onClick={() => setSelectedAppForVerification(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Record Inspection</span>
                          </button>
                        ) : cert ? (
                          <button
                            onClick={() => onOpenCert(cert)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Certificate</span>
                          </button>
                        ) : (
                          <span className="text-xs text-rose-600 font-medium">Rejected</span>
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

      {/* Schedule Inspection Date Modal */}
      {schedulingApp && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSchedulingApp(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Accept Application & Schedule Inspection Date
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Set statutory on-site verification appointment for application{' '}
              <span className="font-mono font-bold text-slate-900">{schedulingApp.id}</span>.
            </p>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scheduled Inspection Date *
                </label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                The applicant will automatically receive an in-app notice and SMS alert regarding the scheduled verification time.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSchedulingApp(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Confirm Inspection Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Uploaded Docs & Photos Modal */}
      {viewingDocsApp && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setViewingDocsApp(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl p-6 border border-slate-200 shadow-xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Supporting Evidence & Photos ({viewingDocsApp.id})
              </h3>
              <button onClick={() => setViewingDocsApp(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Instrument Photographs</h4>
                <div className="grid grid-cols-2 gap-3">
                  {viewingDocsApp.photo_urls.map((url, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                      <img src={url} alt={`Evidence ${idx}`} className="w-full h-48 object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              {viewingDocsApp.supporting_document_urls.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Attached Documents</h4>
                  <div className="space-y-2">
                    {viewingDocsApp.supporting_document_urls.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                      >
                        <span className="font-mono text-slate-700">Document #{idx + 1} (Uploaded)</span>
                        <a
                          href={doc}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 font-bold hover:underline"
                        >
                          View Document →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingDocsApp.applicant_notes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Applicant Declaration:</span>
                  <p className="text-slate-600 italic">"{viewingDocsApp.applicant_notes}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Record Statutory Verification Modal */}
      <RecordVerificationModal
        application={selectedAppForVerification}
        onClose={() => setSelectedAppForVerification(null)}
        onSuccess={(cert) => {
          if (cert) {
            setSuccessBanner(`Digital Certificate ${cert.certificate_number} issued successfully.`);
            onOpenCert(cert);
          } else {
            setSuccessBanner('Rejection notice recorded.');
          }
        }}
      />
    </div>
  );
};
