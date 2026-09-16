import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataStore } from '../lib/dataStore';
import { Certificate, Instrument, UserProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { QRCodeSVG } from 'qrcode.react';
import {
  Award,
  Search,
  Printer,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building2,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';

export const CertificatesView: React.FC = () => {
  const { user, role } = useAuth();
  const { onOpenCert } = useOutletContext<{ onOpenCert: (c: Certificate) => void }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!user) return null;

  // Retrieve certificates based on role scoping
  const certificates =
    role === 'applicant'
      ? dataStore.getCertificatesForUser(user.id)
      : dataStore.getCertificates();

  const getDaysRemaining = (expiryDateStr: string) => {
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredCerts = certificates.filter((c) => {
    const app = dataStore.getApplicationById(c.application_id);
    const inst = app ? dataStore.getInstrumentById(app.instrument_id) : undefined;
    const applicant = app ? dataStore.getProfileById(app.applicant_id) : undefined;

    // Filter status
    if (filterStatus === 'active' && c.status !== 'active') return false;
    if (filterStatus === 'expired' && c.status !== 'expired' && getDaysRemaining(c.expiry_date) > 0) return false;
    if (filterStatus === 'expiring') {
      const days = getDaysRemaining(c.expiry_date);
      if (days <= 0 || days > 30) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = c.certificate_number.toLowerCase().includes(q);
      const matchMake = inst?.make.toLowerCase().includes(q);
      const matchSn = inst?.serial_number.toLowerCase().includes(q);
      const matchOrg = applicant?.organization.toLowerCase().includes(q);
      const matchOfficer = c.issuing_officer_name.toLowerCase().includes(q);
      if (!matchNum && !matchMake && !matchSn && !matchOrg && !matchOfficer) return false;
    }

    return true;
  });

  const handleCopyLink = (certNum: string) => {
    const url = `${window.location.origin}/verify/${certNum}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certNum);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Legal Metrology Certificates Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900">
              Statutory Repository
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Section 24 verification certificates with tamper-proof QR code validation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
            Total Issued: <strong className="text-emerald-700 font-bold">{certificates.length}</strong>
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certificate #, serial number, make, or owner..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium">
          {['all', 'active', 'expiring', 'expired'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-blue-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'expiring' ? 'Expiring in 30 Days' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Certificates Grid / List */}
      {filteredCerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Certificates Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No verification certificates match your current query or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCerts.map((cert) => {
            const app = dataStore.getApplicationById(cert.application_id);
            const inst = app ? dataStore.getInstrumentById(app.instrument_id) : undefined;
            const applicant = app ? dataStore.getProfileById(app.applicant_id) : undefined;
            const daysRemaining = getDaysRemaining(cert.expiry_date);
            const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;
            const isLapsed = daysRemaining <= 0;

            const publicUrl = `${window.location.origin}/verify/${cert.certificate_number}`;

            return (
              <div
                key={cert.id}
                id={`cert-card-${cert.id}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Verification Certificate
                      </span>
                      <h3 className="font-mono font-bold text-base text-slate-950 mt-0.5">
                        {cert.certificate_number}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={cert.status} size="sm" />
                      {isExpiringSoon && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          Expiring in {daysRemaining}d
                        </span>
                      )}
                      {isLapsed && (
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Instrument & Owner Info */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <div className="font-bold text-slate-900">
                        {inst?.make} {inst?.model}
                      </div>
                      <div className="text-slate-600 font-mono text-[11px]">
                        S/N: {inst?.serial_number} • Cap: {inst?.capacity}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Est: <span className="font-semibold text-slate-700">{applicant?.organization}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Issued On</span>
                        <span className="font-medium text-slate-800">{cert.issue_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Valid Till</span>
                        <span className={`font-bold ${isExpiringSoon ? 'text-amber-700' : isLapsed ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {cert.expiry_date}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      Verified by: <strong className="text-slate-800">{cert.issuing_officer_name}</strong>
                    </div>
                  </div>
                </div>

                {/* QR Code & Action Footer */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white border border-slate-200 rounded shadow-2xs">
                      <QRCodeSVG value={publicUrl} size={36} level="L" />
                    </div>
                    <button
                      onClick={() => handleCopyLink(cert.certificate_number)}
                      className="text-[11px] text-blue-700 font-semibold hover:underline flex items-center gap-1"
                      title="Copy Public Verification URL"
                    >
                      {copiedId === cert.certificate_number ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenCert(cert)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View & Print</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
