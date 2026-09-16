import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataStore } from '../../lib/dataStore';
import { Application, Instrument, Certificate, VerificationRecord } from '../../types';
import {
  X,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Award,
  AlertTriangle,
  Scale,
  FileCheck,
} from 'lucide-react';

interface RecordVerificationModalProps {
  application: Application | null;
  onClose: () => void;
  onSuccess: (certificate?: Certificate) => void;
}

export const RecordVerificationModal: React.FC<RecordVerificationModalProps> = ({
  application,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [visualPassed, setVisualPassed] = useState(true);
  const [sealPassed, setSealPassed] = useState(true);
  const [mpePassed, setMpePassed] = useState(true);
  const [stampingDone, setStampingDone] = useState(true);
  const [testLoads, setTestLoads] = useState('Standard weights applied across 0%, 25%, 50%, and 100% capacity.');
  const [errorMargin, setErrorMargin] = useState('Within permissible statutory limits (±0.02%)');
  const [result, setResult] = useState<'pass' | 'fail'>('pass');
  const [remarks, setRemarks] = useState(
    'Instrument verified in compliance with Legal Metrology (General) Rules, 2011. Official lead/wire security tag affixed.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!application || !user) return null;

  const instrument: Instrument | undefined = dataStore.getInstrumentById(application.instrument_id);
  const applicant = dataStore.getProfileById(application.applicant_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (result === 'fail' && !remarks.trim()) {
      setError('Please provide specific remarks for the failure / rejection notice.');
      return;
    }

    setIsSubmitting(true);

    try {
      const outcome = dataStore.recordVerification({
        application_id: application.id,
        officer_id: user.id,
        observations: {
          visualInspectionPassed: visualPassed,
          sealIntegrityPassed: sealPassed,
          errorWithinMPE: mpePassed,
          stampingCompleted: stampingDone,
          testedLoadPoints: testLoads,
          measuredErrorMargin: errorMargin,
        },
        result,
        remarks,
      });

      setIsSubmitting(false);
      onSuccess(outcome.certificate);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to record verification');
    }
  };

  return (
    <div
      id="record-verification-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-bold text-base">Record Statutory Verification Observations</h2>
              <p className="text-xs text-slate-400">Application ID: {application.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Instrument & Owner Summary Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Instrument Under Test:</span>
              <span className="font-bold text-slate-900 text-sm">
                {instrument?.make} {instrument?.model}
              </span>
              <span className="text-[11px] text-slate-500 block font-mono">
                S/N: {instrument?.serial_number}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Applicant / Establishment:</span>
              <span className="font-bold text-slate-900 text-sm">{applicant?.organization}</span>
              <span className="text-[11px] text-slate-500 block">{applicant?.name}</span>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Statutory Inspection Checklist (Schedule VI & VII)
            </h3>

            {/* Check 1: Visual Inspection */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={visualPassed}
                onChange={(e) => setVisualPassed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800">Visual & Physical Inspection</span>
                <p className="text-slate-500 text-[11px]">
                  Instrument body, leveling mechanism, zero-indicator, and rating plate intact with no mechanical damage.
                </p>
              </div>
            </label>

            {/* Check 2: Seal Integrity */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={sealPassed}
                onChange={(e) => setSealPassed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800">Tamper & Seal Integrity Verified</span>
                <p className="text-slate-500 text-[11px]">
                  Calibration adjustment switch/jumper is sealed and inaccessible without breaking official seal.
                </p>
              </div>
            </label>

            {/* Check 3: MPE Tolerance */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={mpePassed}
                onChange={(e) => setMpePassed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800">Maximum Permissible Error (MPE) Compliant</span>
                <p className="text-slate-500 text-[11px]">
                  Error observed across working range does not exceed statutory MPE for {instrument?.accuracy_class || 'Class III'}.
                </p>
              </div>
            </label>

            {/* Check 4: Stamping Done */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={stampingDone}
                onChange={(e) => setStampingDone(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800">Official Seal Tag / Physical Stamping Affixed</span>
                <p className="text-slate-500 text-[11px]">
                  Government stamping stamp or security tag applied to prevent unauthorized calibration changes.
                </p>
              </div>
            </label>
          </div>

          {/* Test Load & Error Measurements */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Metrological Test Values & Observations
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Calibration Weights & Load Points Tested
              </label>
              <input
                type="text"
                value={testLoads}
                onChange={(e) => setTestLoads(e.target.value)}
                placeholder="e.g. Tested at 5kg, 10kg, 20kg standard test weights."
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observed Error Margin / Deviation
              </label>
              <input
                type="text"
                value={errorMargin}
                onChange={(e) => setErrorMargin(e.target.value)}
                placeholder="e.g. ±0.002 kg (Allowed MPE: ±0.005 kg)"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Verification Decision */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Verification Result & Remarks
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="btn-mark-pass"
                onClick={() => {
                  setResult('pass');
                  setRemarks('Instrument verified in compliance with Legal Metrology (General) Rules, 2011. Official security tag affixed.');
                }}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-colors ${
                  result === 'pass'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>PASS (Issue Digital Certificate)</span>
              </button>

              <button
                type="button"
                id="btn-mark-fail"
                onClick={() => {
                  setResult('fail');
                  setRemarks('Instrument rejected due to excessive error margin exceeding permissible statutory MPE.');
                }}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-colors ${
                  result === 'fail'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>FAIL (Issue Rejection Notice)</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Remarks / Inspector Notes
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="confirm-verification-btn"
              className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-2 shadow-xs ${
                result === 'pass'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Processing...'
                  : result === 'pass'
                  ? 'Generate & Sign Digital Certificate'
                  : 'Submit Rejection Record'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
