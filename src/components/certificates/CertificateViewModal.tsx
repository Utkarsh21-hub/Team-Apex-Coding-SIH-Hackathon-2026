import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Certificate, Instrument, UserProfile, Application, VerificationRecord } from '../../types';
import { dataStore } from '../../lib/dataStore';
import { ShieldCheck, Printer, Download, ExternalLink, X, CheckCircle2, QrCode, Copy, Check } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { useState } from 'react';

interface CertificateViewModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateViewModal: React.FC<CertificateViewModalProps> = ({ certificate, onClose }) => {
  const [copied, setCopied] = useState(false);
  const certContainerRef = useRef<HTMLDivElement>(null);

  if (!certificate) return null;

  const app: Application | undefined = dataStore.getApplicationById(certificate.application_id);
  const instrument: Instrument | undefined = app ? dataStore.getInstrumentById(app.instrument_id) : undefined;
  const applicant: UserProfile | undefined = app ? dataStore.getProfileById(app.applicant_id) : undefined;
  const records = dataStore.getVerificationRecords().filter((r) => r.certificate_id === certificate.id || (app && r.application_id === app.id));
  const record: VerificationRecord | undefined = records[0];

  const verifyUrl = `${window.location.origin}/verify/${certificate.certificate_number}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="certificate-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Digital Verification Certificate</span>
            <span className="text-xs text-slate-400 font-mono">({certificate.certificate_number})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
              title="Copy verification link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Copy Verify URL'}</span>
            </button>

            <a
              href={`/verify/${certificate.certificate_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Page</span>
            </a>

            <button
              onClick={handlePrint}
              id="print-certificate-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Canvas */}
        <div className="p-4 sm:p-8 max-h-[85vh] overflow-y-auto bg-slate-100 print:p-0 print:bg-white">
          <div
            ref={certContainerRef}
            id="printable-certificate-document"
            className="printable-certificate bg-white p-8 sm:p-12 border-4 border-double border-slate-700 rounded-sm shadow-md mx-auto max-w-3xl relative text-slate-900"
          >
            {/* Watermark background seal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <ShieldCheck className="w-96 h-96 text-slate-900" />
            </div>

            {/* Certificate Header */}
            <div className="text-center pb-6 border-b-2 border-slate-800">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 text-white mb-2 shadow-xs">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                Directorate of Legal Metrology • Statutory Verification
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-950 mt-1 uppercase">
                Certificate of Verification
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Issued under Section 24 of the Legal Metrology Act, 2009 & Rule 14 of Legal Metrology (General) Rules, 2011
              </p>
            </div>

            {/* Certificate Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200 bg-slate-50/60 rounded my-4 px-4 text-xs">
              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-semibold">Certificate Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{certificate.certificate_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-semibold">Date of Verification</span>
                <span className="font-semibold text-slate-900">{certificate.issue_date}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-semibold">Valid Until</span>
                <span className="font-semibold text-emerald-700">{certificate.expiry_date}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase tracking-wider text-[10px] font-semibold">Status</span>
                <StatusBadge status={certificate.status} size="sm" />
              </div>
            </div>

            {/* Instrument Owner Details */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-100 pb-1">
                1. Instrument Owner & Location Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Business / Establishment:</span>
                  <p className="font-bold text-slate-900">{applicant?.organization || 'Commercial User'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Proprietor / Representative:</span>
                  <p className="font-semibold text-slate-900">{applicant?.name || 'Authorized Signatory'}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Physical Address / Installation Site:</span>
                  <p className="font-medium text-slate-800">{instrument?.location || applicant?.address || 'Site'}</p>
                </div>
              </div>
            </div>

            {/* Instrument Specification */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-100 pb-1">
                2. Instrument Technical Specification
              </h3>
              <table className="w-full text-xs text-left border border-slate-200">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-slate-50/50">
                    <td className="py-1.5 px-3 font-medium text-slate-600 w-1/3">Instrument Category</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900">{instrument?.instrument_type?.replace(/_/g, ' ').toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-medium text-slate-600">Make & Model</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900">{instrument?.make} — {instrument?.model}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-1.5 px-3 font-medium text-slate-600">Serial Number</td>
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-900">{instrument?.serial_number}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-medium text-slate-600">Capacity & Scale Interval (e)</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">{instrument?.capacity}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="py-1.5 px-3 font-medium text-slate-600">Accuracy Class</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">{instrument?.accuracy_class || 'Class III (Medium)'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Verification Findings & Seal */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-100 pb-1">
                3. Verification Findings & Stamping Record
              </h3>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Maximum Permissible Error (MPE) verification: PASSED</span>
                </div>
                <div className="text-slate-700">
                  <span className="font-medium">Observed Error Margin: </span>
                  {record?.observations.measuredErrorMargin || 'Within permissible statutory limits'}
                </div>
                <div className="text-slate-700">
                  <span className="font-medium">Official Seal Tag Number: </span>
                  <span className="font-mono font-bold text-slate-900">{certificate.seal_identification_tag || 'SEAL-LM-2026-91'}</span>
                </div>
                {certificate.verification_fee_receipt && (
                  <div className="text-slate-600 text-[11px]">
                    <span className="font-medium">Statutory Fee Receipt: </span>
                    {certificate.verification_fee_receipt}
                  </div>
                )}
              </div>
            </div>

            {/* QR Code and Signatures Footer */}
            <div className="pt-4 border-t-2 border-slate-800 grid grid-cols-3 gap-4 items-end">
              {/* QR Code Section */}
              <div className="flex flex-col items-start">
                <div className="p-2 bg-white border border-slate-300 rounded shadow-xs">
                  <QRCodeSVG
                    value={verifyUrl}
                    size={90}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 font-mono">
                  Scan to verify online
                </span>
              </div>

              {/* Security Seal text */}
              <div className="text-center text-[10px] text-slate-500 pb-2">
                <div className="inline-block p-1 rounded-full border border-slate-300 mb-1">
                  <ShieldCheck className="w-6 h-6 text-slate-700 mx-auto" />
                </div>
                <p className="font-semibold text-slate-700">Secured Digital Verification</p>
                <p>VerifyMetro E-Governance System</p>
              </div>

              {/* Authorized Signatory */}
              <div className="text-right">
                <div className="inline-block border-b border-slate-400 pb-1 mb-1 w-40 text-center">
                  <span className="font-serif italic text-blue-900 font-bold block text-sm">
                    {certificate.issuing_officer_name.split(' ')[0]}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">{certificate.issuing_officer_name}</p>
                <p className="text-[10px] text-slate-600">{certificate.issuing_authority}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Digitally Signed & Validated</p>
              </div>
            </div>

            {/* Statutory Disclaimer */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-[9px] text-slate-400 text-center">
              Notice: This certificate is issued electronically under the provisions of the Legal Metrology Act, 2009.
              Alteration, defacing, or non-display of certificate at establishment constitutes a punishable offense under Section 30.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
