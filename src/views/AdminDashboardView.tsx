import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataStore } from '../lib/dataStore';
import { Application, Certificate, UserProfile, INSTRUMENT_TYPE_LABELS } from '../types';
import { StatusBadge, RoleBadge } from '../components/common/StatusBadge';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Scale,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { user, allProfiles, refreshData } = useAuth();
  const { onOpenCert } = useOutletContext<{ onOpenCert: (c: Certificate) => void }>();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'applications'>('analytics');
  const [userSearch, setUserSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Admin Access Required</h2>
        <p className="text-xs text-slate-500 mt-1">
          You must be logged in as an Administrator to view the state-wide metrology oversight console.
        </p>
      </div>
    );
  }

  const applications = dataStore.getApplications();
  const certificates = dataStore.getCertificates();
  const instruments = dataStore.getInstruments();

  // Metrics
  const totalApps = applications.length;
  const verifiedCount = applications.filter((a) => a.status === 'verified').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;
  const completedInspections = verifiedCount + rejectedCount;
  const verificationRate = completedInspections > 0 ? Math.round((verifiedCount / completedInspections) * 100) : 100;
  const pendingBacklog = applications.filter((a) => a.status === 'submitted' || a.status === 'scheduled' || a.status === 'in-progress').length;

  // Chart 1: Applications by Status
  const statusCounts = {
    submitted: applications.filter((a) => a.status === 'submitted').length,
    scheduled: applications.filter((a) => a.status === 'scheduled').length,
    inProgress: applications.filter((a) => a.status === 'in-progress').length,
    verified: verifiedCount,
    rejected: rejectedCount,
  };

  const statusPieData = [
    { name: 'Submitted', value: statusCounts.submitted, color: '#0284c7' },
    { name: 'Scheduled', value: statusCounts.scheduled, color: '#d97706' },
    { name: 'In Progress', value: statusCounts.inProgress, color: '#4f46e5' },
    { name: 'Verified', value: statusCounts.verified, color: '#059669' },
    { name: 'Rejected', value: statusCounts.rejected, color: '#e11d48' },
  ].filter((item) => item.value > 0);

  // Chart 2: Instruments by Category
  const categoryCounts: Record<string, number> = {};
  instruments.forEach((inst) => {
    const label = INSTRUMENT_TYPE_LABELS[inst.instrument_type]?.split(' ')[0] || 'Other';
    categoryCounts[label] = (categoryCounts[label] || 0) + 1;
  });

  const categoryBarData = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat,
    instruments: count,
  }));

  const handleToggleUser = (targetUserId: string) => {
    dataStore.toggleUserStatus(targetUserId);
    refreshData();
  };

  const filteredUsers = allProfiles.filter((p) => {
    const q = userSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.organization.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q)
    );
  });

  const filteredApps = applications.filter((a) => {
    const q = appSearch.toLowerCase();
    const inst = dataStore.getInstrumentById(a.instrument_id);
    const applicant = dataStore.getProfileById(a.applicant_id);
    return (
      a.id.toLowerCase().includes(q) ||
      inst?.make.toLowerCase().includes(q) ||
      inst?.serial_number.toLowerCase().includes(q) ||
      applicant?.organization.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              State Metrology Directorate Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-white">
              System Administration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            State-wide oversight under Legal Metrology Act, 2009 • Directorate of Legal Metrology
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview & Charts</span>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'applications' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Master Applications ({applications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Management ({allProfiles.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Applications</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalApps}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all districts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Rate</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{verificationRate}%</p>
            <p className="text-[11px] text-emerald-600/90 mt-0.5">{verifiedCount} passed / {rejectedCount} rejected</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Digital Certificates</span>
            <p className="text-2xl font-black text-blue-800 mt-1">{certificates.length}</p>
            <p className="text-[11px] text-blue-700 mt-0.5">Active in public ledger</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Backlog</span>
            <p className="text-2xl font-black text-amber-600 mt-1">{pendingBacklog}</p>
            <p className="text-[11px] text-amber-700 mt-0.5">Awaiting inspection/stamping</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {activeTab === 'analytics' && (
        /* Analytics View with Recharts */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Applications by Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Applications by Current Workflow Status</h3>
                <p className="text-xs text-slate-400">Distribution of pending and verified instruments</p>
              </div>

              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Instruments by Category */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Registered Instruments by Category</h3>
                <p className="text-xs text-slate-400">Total physical units in digital registry</p>
              </div>

              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBarData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="instruments" fill="#1e3a8a" radius={[6, 6, 0, 0]} name="Instruments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        /* Master Applications Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-sm text-slate-900">Master Verification Applications Register</h3>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                placeholder="Search by ID, establishment, serial..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">App ID</th>
                  <th className="py-3 px-4">Applicant Organization</th>
                  <th className="py-3 px-4">Instrument Target</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => {
                  const inst = dataStore.getInstrumentById(app.instrument_id);
                  const applicant = dataStore.getProfileById(app.applicant_id);
                  const cert = certificates.find((c) => c.application_id === app.id);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">{app.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{applicant?.organization}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{inst?.make}</span> (S/N: {inst?.serial_number})
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={app.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(app.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {cert ? (
                          <button
                            onClick={() => onOpenCert(cert)}
                            className="font-mono text-emerald-700 hover:underline font-bold"
                          >
                            {cert.certificate_number}
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        /* User Management Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">User & Officer Directory</h3>
              <p className="text-xs text-slate-500">
                Manage accounts, roles, and administrative access for field officers, GATC labs, and applicants.
              </p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name, role, email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">User Name & Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Organization / Station</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{u.organization}</div>
                      <div className="text-[11px] text-slate-400">{u.designation || 'Staff'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.phone}</td>
                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.id !== user.id ? (
                        <button
                          onClick={() => handleToggleUser(u.id)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            u.isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Self</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
