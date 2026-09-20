import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataStore } from '../lib/dataStore';
import { Instrument, Certificate, INSTRUMENT_TYPE_LABELS } from '../types';
import { RegisterAndApplyModal } from '../components/applicant/RegisterAndApplyModal';
import {
  Scale,
  Plus,
  Search,
  Award,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Crosshair,
} from 'lucide-react';

export const ApplicantInstrumentsView: React.FC = () => {
  const { user } = useAuth();
  const { onOpenCert } = useOutletContext<{ onOpenCert: (c: Certificate) => void }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) return null;

  const instruments = dataStore.getInstruments(user.id);
  const certificates = dataStore.getCertificatesForUser(user.id);
  const applications = dataStore.getApplications({ applicantId: user.id });

  const filteredInstruments = instruments.filter((inst) => {
    const q = searchQuery.toLowerCase();
    return (
      inst.make.toLowerCase().includes(q) ||
      inst.model.toLowerCase().includes(q) ||
      inst.serial_number.toLowerCase().includes(q) ||
      inst.capacity.toLowerCase().includes(q) ||
      inst.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Registered Weighing & Measuring Instruments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Commercial Asset Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official records registered under Rule 14, Legal Metrology (General) Rules, 2011
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Instrument</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search make, model, serial number, capacity, or location..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing {filteredInstruments.length} of {instruments.length} registered
        </div>
      </div>

      {/* Grid of Registered Instruments */}
      {filteredInstruments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Instruments Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'No instruments matched your search term.' : 'Click "Register New Instrument" to add your first commercial instrument.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInstruments.map((inst) => {
            const instApps = applications.filter((a) => a.instrument_id === inst.id);
            const activeCert = certificates.find((c) =>
              instApps.some((a) => a.id === c.application_id && c.status === 'active')
            );
            const pendingApp = instApps.find((a) =>
              a.status === 'submitted' || a.status === 'scheduled' || a.status === 'in-progress'
            );

            return (
              <div
                key={inst.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {INSTRUMENT_TYPE_LABELS[inst.instrument_type]?.split(' ')[0] || 'Instrument'}
                    </span>

                    {activeCert ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Valid Stamped</span>
                      </span>
                    ) : pendingApp ? (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        <span>In Inspection</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        <span>Verification Due</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mt-2.5">
                    {inst.make} — {inst.model}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Serial No: <strong className="text-slate-800">{inst.serial_number}</strong>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="text-slate-700">
                      Capacity: <strong className="font-semibold">{inst.capacity}</strong>
                    </div>
                    <div className="text-slate-600">
                      Accuracy: <span>{inst.accuracy_class}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-1 pt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{inst.location}</span>
                    </div>
                    {inst.latitude != null && inst.longitude != null && (
                      <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 font-mono font-medium mt-1">
                        <Crosshair className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>GPS: {inst.latitude.toFixed(4)}° N, {inst.longitude.toFixed(4)}° E {inst.pincode ? `(PIN: ${inst.pincode})` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {activeCert ? (
                    <button
                      onClick={() => onOpenCert(activeCert)}
                      className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
                    >
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      <span>Cert #{activeCert.certificate_number}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : pendingApp ? (
                    <span className="text-slate-500 text-xs italic">Application {pendingApp.id}</span>
                  ) : (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition-colors"
                    >
                      Apply Re-Verification
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Register / Apply */}
      <RegisterAndApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {}}
        existingInstruments={instruments}
      />
    </div>
  );
};
