import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dataStore } from '../lib/dataStore';
import { Certificate, Instrument, UserProfile, Application, VerificationRecord } from '../types';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle, Printer, Search, ArrowLeft, Building2, MapPin, Scale, Calendar, FileCheck, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const PublicVerifyView: React.FC = () => {
  const { certificateNumber } = useParams<{ certificateNumber: string }>();
  const [certData, setCertData] = useState<{
    certificate: Certificate;
    application: Application;
    instrument: Instrument;
    applicant: UserProfile;
    record?: VerificationRecord;
  } | null>(null);
  const [searchedNumber, setSearchedNumber] = useState(certificateNumber || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (certificateNumber) {
      setSearchedNumber(certificateNumber);
      const data = dataStore.getCertificateByNumber(certificateNumber);
      setCertData(data);
    } else {
      setCertData(null);
    }
    setLoading(false);
  }, [certificateNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedNumber.trim()) return;
    const data = dataStore.getCertificateByNumber(searchedNumber);
    setCertData(data);
  };

  const getDaysRemaining = (expiryDateStr: string) => {
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diff = expiry.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = certData ? getDaysRemaining(certData.certificate.expiry_date) : 0;
  const isExpired = certData ? daysRemaining <= 0 || certData.certificate.status === 'expired' : false;
  const isRevoked = certData ? certData.certificate.status === 'revoked' : false;
  const isValid = certData && !isExpired && !isRevoked;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-blue-100">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight">VerifyMetro</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-700">
                  Public Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                National Legal Metrology Digital Verification & Stamping Registry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-md border border-slate-700 hover:border-slate-500 transition-colors"
            >
              Officer & Business Login →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1">
        {/* Search Bar for scanning or typing */}
        <div className="mb-8 no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchedNumber}
                onChange={(e) => setSearchedNumber(e.target.value)}
                placeholder="Enter Certificate Number (e.g. IND-LM-2025-0482)"
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase font-mono tracking-wider"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <FileCheck className="w-4 h-4" />
              <span>Verify Certificate</span>
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-600">Validating digital signature and statutory ledger...</p>
          </div>
        ) : !certData ? (
          /* Not Found State */
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <XCircle className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Matching Certificate Found</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              The certificate identifier <span className="font-mono font-bold text-slate-900">"{searchedNumber || certificateNumber}"</span> was not found in the official Legal Metrology registry.
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto text-left text-xs text-amber-900 space-y-2 mb-6">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Consumer Consumer Advisory:</span>
              </div>
              <p>
                Using unverified weighing or measuring instruments in commercial transactions is illegal under Section 24 & 30 of the Legal Metrology Act, 2009.
              </p>
            </div>
            <Link
              to="/verify/IND-LM-2025-0482"
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              View Sample Verified Certificate (IND-LM-2025-0482) →
            </Link>
          </div>
        ) : (
          /* Verified Certificate Presentation */
          <div className="space-y-6">
            {/* Authenticity Status Banner */}
            {isValid ? (
              <div
                id="authentication-status-banner"
                className="bg-emerald-600 text-white rounded-2xl p-6 sm:p-7 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-9 h-9" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide">
                        Verified & Authentic
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-800 text-emerald-100 uppercase">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100 mt-1">
                      This instrument is officially verified and stamped under the Legal Metrology Act, 2009.
                    </p>
                    <p className="text-xs font-medium text-white mt-1">
                      Valid until <span className="underline font-bold">{certData.certificate.expiry_date}</span> ({daysRemaining} days remaining).
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 no-print w-full sm:w-auto justify-end">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-white text-emerald-900 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Confirmation</span>
                  </button>
                </div>
              </div>
            ) : isExpired ? (
              <div
                id="authentication-status-banner"
                className="bg-amber-600 text-white rounded-2xl p-6 sm:p-7 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-9 h-9" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide">
                        Verification Expired
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-900 text-amber-100 uppercase">
                        Lapsed
                      </span>
                    </div>
                    <p className="text-xs text-amber-100 mt-1">
                      Statutory validity ended on {certData.certificate.expiry_date}. Commercial use without re-verification is prohibited.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                id="authentication-status-banner"
                className="bg-rose-700 text-white rounded-2xl p-6 sm:p-7 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
                    <XCircle className="w-9 h-9" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide">
                      Certificate Revoked / Suspended
                    </h2>
                    <p className="text-xs text-rose-100 mt-1">
                      This certificate has been cancelled by Legal Metrology enforcement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Authenticity Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden printable-certificate">
              <div className="p-6 sm:p-8">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Certificate Identifier
                    </span>
                    <h3 className="text-2xl font-mono font-bold text-slate-950 mt-0.5">
                      {certData.certificate.certificate_number}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Issued by {certData.certificate.issuing_authority}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-2xs shrink-0">
                      <QRCodeSVG
                        value={window.location.href}
                        size={80}
                        level="M"
                      />
                    </div>
                  </div>
                </div>

                {/* Grid of Verified Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-200">
                  {/* Instrument Info */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-600" />
                      Instrument Specifications
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-xl space-y-2.5 text-xs">
                      <div>
                        <span className="text-slate-500 block">Instrument Type:</span>
                        <span className="font-semibold text-slate-900 text-sm">
                          {certData.instrument.make} — {certData.instrument.model}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Serial Number:</span>
                        <span className="font-mono font-bold text-blue-900">{certData.instrument.serial_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Verified Capacity:</span>
                        <span className="font-medium text-slate-800">{certData.instrument.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Accuracy Classification:</span>
                        <span className="font-medium text-slate-800">{certData.instrument.accuracy_class || 'Class III (Medium)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Physical Seal Tag:</span>
                        <span className="font-mono font-semibold text-slate-900">{certData.certificate.seal_identification_tag || 'Official Tag Affixed'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Owner & Location Info */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Owner & Deployment Site
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-xl space-y-2.5 text-xs">
                      <div>
                        <span className="text-slate-500 block">Establishment Name:</span>
                        <span className="font-semibold text-slate-900 text-sm">
                          {certData.applicant.organization}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Proprietor / Signatory:</span>
                        <span className="font-medium text-slate-800">{certData.applicant.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Installation Address:</span>
                        <span className="font-medium text-slate-800">{certData.instrument.location}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Verification Date:</span>
                        <span className="font-semibold text-slate-900">{certData.certificate.issue_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mandatory Expiry:</span>
                        <span className={`font-bold ${isExpired ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {certData.certificate.expiry_date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Officer Stamping Signature */}
                <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Verified by Officer: <strong className="text-slate-800">{certData.certificate.issuing_officer_name}</strong></span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Record ID: {certData.application.id} • Digitally Synchronized
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs text-center no-print">
        <div className="max-w-5xl mx-auto px-4">
          <p className="font-medium text-slate-300">
            VerifyMetro — Digital Verification & Certification System
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Built in compliance with the Legal Metrology Act, 2009 and Legal Metrology (General) Rules, 2011.
          </p>
        </div>
      </footer>
    </div>
  );
};
