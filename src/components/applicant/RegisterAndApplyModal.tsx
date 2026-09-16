import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataStore } from '../../lib/dataStore';
import { Instrument, InstrumentType, ApplicationType, INSTRUMENT_TYPE_LABELS } from '../../types';
import {
  X,
  Upload,
  Plus,
  Scale,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface RegisterAndApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingInstruments: Instrument[];
}

export const RegisterAndApplyModal: React.FC<RegisterAndApplyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingInstruments,
}) => {
  const { user } = useAuth();

  const [mode, setMode] = useState<'new_instrument' | 'existing_instrument'>('new_instrument');
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(
    existingInstruments.length > 0 ? existingInstruments[0].id : ''
  );

  // New Instrument Fields
  const [instrumentType, setInstrumentType] = useState<InstrumentType>('weighing_scale_non_auto');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [accuracyClass, setAccuracyClass] = useState('Class III (Medium)');
  const [location, setLocation] = useState(user?.address || '');

  // Application Fields
  const [appType, setAppType] = useState<ApplicationType>('new');
  const [applicantNotes, setApplicantNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  // Handle Photo Upload (Convert to Data URL for instant preview and offline persistence)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Document Upload
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setDocuments((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let instrumentId = selectedInstrumentId;

    if (mode === 'new_instrument') {
      if (!make || !model || !serialNumber || !capacity) {
        setError('Please complete all instrument specifications.');
        return;
      }

      // Register new instrument
      const newInst = dataStore.addInstrument({
        owner_id: user.id,
        instrument_type: instrumentType,
        make,
        model,
        serial_number: serialNumber,
        capacity,
        accuracy_class: accuracyClass,
        location: location || user.address || 'Commercial Site',
      });
      instrumentId = newInst.id;
    } else {
      if (!instrumentId) {
        setError('Please select an existing instrument.');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Default placeholder photo if none uploaded
      const finalPhotos =
        photos.length > 0
          ? photos
          : [
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
            ];

      // Create application
      dataStore.createApplication({
        instrument_id: instrumentId,
        applicant_id: user.id,
        type: appType,
        supporting_document_urls: documents,
        photo_urls: finalPhotos,
        applicant_notes: applicantNotes,
      });

      setSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message || 'Failed to submit application');
    }
  };

  return (
    <div
      id="register-application-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-bold text-base">Register Instrument & Apply for Verification</h2>
              <p className="text-xs text-slate-400">Under Rule 14 of Legal Metrology (General) Rules, 2011</p>
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
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Instrument Selection Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Instrument Target
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('new_instrument')}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                  mode === 'new_instrument'
                    ? 'bg-blue-50 border-blue-600 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Register New Instrument</span>
              </button>

              <button
                type="button"
                disabled={existingInstruments.length === 0}
                onClick={() => {
                  setMode('existing_instrument');
                  setAppType('re-verification');
                }}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                  mode === 'existing_instrument'
                    ? 'bg-blue-50 border-blue-600 text-blue-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Select Registered ({existingInstruments.length})</span>
              </button>
            </div>
          </div>

          {mode === 'existing_instrument' ? (
            /* Choose from existing instruments */
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Choose from your registered instruments
              </label>
              <select
                value={selectedInstrumentId}
                onChange={(e) => setSelectedInstrumentId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {existingInstruments.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.make} {inst.model} (S/N: {inst.serial_number}) — {inst.capacity}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Register New Instrument Details */
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Instrument Specifications
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instrument Category *
                </label>
                <select
                  value={instrumentType}
                  onChange={(e) => setInstrumentType(e.target.value as InstrumentType)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {Object.entries(INSTRUMENT_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manufacturer / Make *
                  </label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Avery Weigh-Tronix / Essae"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Model Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. BridgeMont Pitless WB"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unique Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. AVT-2026-9941"
                    className="w-full px-3 py-1.5 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Capacity & Verification Interval (e) *
                  </label>
                  <input
                    type="text"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 50 MT, e=10kg or 30 kg, e=5g"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Accuracy Classification
                  </label>
                  <select
                    value={accuracyClass}
                    onChange={(e) => setAccuracyClass(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Class I (Special Accuracy)">Class I (Special Accuracy - Lab)</option>
                    <option value="Class II (High Accuracy)">Class II (High Accuracy - Gold/Jewellery)</option>
                    <option value="Class III (Medium Accuracy)">Class III (Medium Accuracy - Commercial/Weighbridge)</option>
                    <option value="Class IV (Ordinary Accuracy)">Class IV (Ordinary Accuracy)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physical Installation Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Installation site or vehicle reg no."
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Verification Application Parameters */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Application Type & Statutory Details
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                appType === 'new' ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' : 'border-slate-200 bg-white text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="appType"
                  value="new"
                  checked={appType === 'new'}
                  onChange={() => setAppType('new')}
                  className="mr-2"
                />
                Initial Verification (New)
              </label>

              <label className={`p-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                appType === 're-verification' ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' : 'border-slate-200 bg-white text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="appType"
                  value="re-verification"
                  checked={appType === 're-verification'}
                  onChange={() => setAppType('re-verification')}
                  className="mr-2"
                />
                Periodic Re-Verification
              </label>
            </div>

            {/* Photo Upload (Supabase Storage / Mock Storage) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Instrument Photograph(s)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="instrument-photo-upload"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="instrument-photo-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <ImageIcon className="w-8 h-8 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-800">
                    Click to upload instrument photos or drag and drop
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Include photo of model plate, serial number, and full assembly
                  </span>
                </label>
              </div>

              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {photos.map((src, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 shadow-2xs group">
                      <img src={src} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                        className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Supporting Document Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Supporting Documents (Invoice, Calibration Test Report, Previous Stamping Slip)
              </label>
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <span className="text-xs text-slate-600 font-medium">
                    {documents.length > 0 ? `${documents.length} document(s) attached` : 'Attach PDF, scans, or receipts'}
                  </span>
                </div>
                <div>
                  <input
                    type="file"
                    id="doc-upload"
                    multiple
                    onChange={handleDocUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="doc-upload"
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                  >
                    Browse Files
                  </label>
                </div>
              </div>
            </div>

            {/* Applicant Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applicant Remarks / Declaration
              </label>
              <textarea
                rows={2}
                value={applicantNotes}
                onChange={(e) => setApplicantNotes(e.target.value)}
                placeholder="e.g. Ready for on-site inspection. Standard weights available at site."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
              disabled={submitting}
              id="submit-application-btn"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
            >
              <FileCheck className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Verification Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
