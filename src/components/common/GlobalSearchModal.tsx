import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dataStore } from '../../lib/dataStore';
import { Application, Certificate, Instrument } from '../../types';
import { Search, X, FileText, Award, Scale, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCertificate?: (cert: Certificate) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCertificate,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    applications: Application[];
    certificates: Certificate[];
    instruments: Instrument[];
  }>({
    applications: [],
    certificates: [],
    instruments: [],
  });

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ applications: [], certificates: [], instruments: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || !user) {
      setResults({ applications: [], certificates: [], instruments: [] });
      return;
    }
    const res = dataStore.searchGlobal(query, user.role, user.id);
    setResults(res);
  }, [query, user]);

  if (!isOpen) return null;

  const totalHits =
    results.certificates.length + results.applications.length + results.instruments.length;

  return (
    <div
      id="global-search-dialog"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 md:p-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            id="global-search-input"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Certificate #, Serial No, Make, Model, or Owner..."
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-slate-200 text-slate-600 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <p className="font-medium text-slate-700">Quick Metrology Search</p>
              <p className="mt-1 text-xs text-slate-400">
                Type a certificate number (e.g. <span className="font-mono text-blue-600">IND-LM-2025</span>), serial number (e.g. <span className="font-mono text-blue-600">AVT-WB</span>), or instrument make.
              </p>
            </div>
          ) : totalHits === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <p>No matching records found for "{query}".</p>
              <p className="mt-1 text-xs text-slate-400">
                Check serial number spelling or certificate prefix.
              </p>
            </div>
          ) : (
            <>
              {/* Certificates Group */}
              {results.certificates.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      Certificates ({results.certificates.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        id={`search-result-cert-${cert.id}`}
                        onClick={() => {
                          onClose();
                          if (onSelectCertificate) {
                            onSelectCertificate(cert);
                          } else {
                            navigate('/certificates');
                          }
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-md">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-blue-900 flex items-center gap-2">
                              {cert.certificate_number}
                              <StatusBadge status={cert.status} size="sm" />
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Issued: {cert.issue_date} • Valid Till: {cert.expiry_date}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications Group */}
              {results.applications.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Applications ({results.applications.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.applications.map((app) => {
                      const inst = dataStore.getInstrumentById(app.instrument_id);
                      return (
                        <div
                          key={app.id}
                          id={`search-result-app-${app.id}`}
                          onClick={() => {
                            onClose();
                            if (user?.role === 'applicant') {
                              navigate('/applicant/applications');
                            } else {
                              navigate('/queue');
                            }
                          }}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-700 rounded-md">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                <span>{app.id}</span>
                                <span className="text-xs font-normal text-slate-500">
                                  ({app.type === 'new' ? 'New Verification' : 'Re-verification'})
                                </span>
                                <StatusBadge status={app.status} size="sm" />
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {inst?.make} ({inst?.model}) • S/N: {inst?.serial_number}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Instruments Group */}
              {results.instruments.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-slate-600" />
                      Instruments ({results.instruments.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {results.instruments.map((inst) => (
                      <div
                        key={inst.id}
                        id={`search-result-inst-${inst.id}`}
                        onClick={() => {
                          onClose();
                          if (user?.role === 'applicant') {
                            navigate('/applicant/instruments');
                          } else {
                            navigate('/queue');
                          }
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 text-slate-700 rounded-md">
                            <Scale className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {inst.make} - {inst.model}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              S/N: <span className="font-mono">{inst.serial_number}</span> • Cap: {inst.capacity}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>India Legal Metrology Act, 2009 Digital Registry</span>
          <button onClick={onClose} className="hover:text-slate-800 font-medium">
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
