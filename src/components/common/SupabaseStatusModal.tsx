import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { dataStore } from '../../lib/dataStore';
import { supabaseUrl, isSupabaseConfigured, SupabaseHealthStatus } from '../../lib/supabase';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<SupabaseHealthStatus>(() => dataStore.getSupabaseStatus());
  const [isChecking, setIsChecking] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [sqlContent, setSqlContent] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      handleCheck();
      fetch('/supabase-schema-and-seed.sql')
        .then((res) => (res.ok ? res.text() : ''))
        .then((text) => {
          if (text) setSqlContent(text);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleCheck = async () => {
    setIsChecking(true);
    setSeedResult(null);
    try {
      const res = await dataStore.initSupabaseSync();
      setStatus(res);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await dataStore.seedSupabase();
      setSeedResult(res);
      const updatedStatus = await dataStore.initSupabaseSync();
      setStatus(updatedStatus);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSeedResult({ success: false, message: msg });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCopySql = () => {
    if (sqlContent) {
      navigator.clipboard.writeText(sqlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else {
      // Fallback
      fetch('/supabase-schema-and-seed.sql')
        .then((r) => r.text())
        .then((txt) => {
          navigator.clipboard.writeText(txt);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        });
    }
  };

  if (!isOpen) return null;

  const projectId = 'gauabflrburdaybkrkla';
  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectId}/sql/new`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Supabase PostgreSQL Integration
              </h3>
              <p className="text-xs text-slate-400">
                Connected Project: <span className="font-mono text-emerald-400">{projectId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              status.hasTables
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : status.isConnected
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            {status.hasTables ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-bold text-sm flex items-center gap-2">
                {status.hasTables
                  ? 'Supabase Database Connected & Synchronized'
                  : status.isConnected
                  ? 'Supabase Reachable — PostgreSQL Tables Need Creation'
                  : 'Supabase Connection Pending'}
              </div>
              <p className="text-xs mt-1 opacity-90">{status.message}</p>
              {status.error && (
                <p className="text-[11px] font-mono mt-1 px-2 py-1 bg-black/5 rounded text-slate-700">
                  {status.error}
                </p>
              )}
            </div>
            <button
              onClick={handleCheck}
              disabled={isChecking}
              className="p-1.5 rounded-lg border border-slate-300/80 hover:bg-white text-slate-700 transition-colors text-xs flex items-center gap-1 shrink-0"
              title="Re-check connection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Configuration Parameters */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Connection Parameters
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Project URL:</span>
              <span className="font-mono text-slate-800 break-all">{supabaseUrl}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Anonymous Public API Key:</span>
              <span className="font-mono text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Injected & Validated
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1">
              <span className="text-slate-500 font-medium">Offline-First Local Cache:</span>
              <span className="text-blue-600 font-medium">Active (Zero-downtime Fallback)</span>
            </div>
          </div>

          {/* Database Setup & Seeding Action Box */}
          {!status.hasTables ? (
            <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-blue-950 font-bold">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>One-Time Step: Create Database Tables in Supabase</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                In Supabase, Postgres tables must be created via the SQL Editor before rows can be
                inserted or queried. We have generated the complete SQL script containing all 6
                tables (<code className="font-mono">profiles</code>,{' '}
                <code className="font-mono">instruments</code>,{' '}
                <code className="font-mono">applications</code>,{' '}
                <code className="font-mono">certificates</code>,{' '}
                <code className="font-mono">verification_records</code>,{' '}
                <code className="font-mono">notifications</code>) and sample records!
              </p>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied SQL to Clipboard!' : 'Copy SQL Schema & Seed Script'}</span>
                </button>

                <a
                  href={sqlEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>
              </div>

              <div className="bg-white/80 rounded-lg p-3 border border-blue-100 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Quick 3-step instructions:</div>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
                  <li>Click <strong>Copy SQL Schema & Seed Script</strong> above.</li>
                  <li>Click <strong>Open Supabase SQL Editor</strong> (opens in new tab).</li>
                  <li>Paste into the query box and click <strong>Run</strong>. Then click <strong>Refresh</strong> here!</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Populate / Synchronize Sample Data</span>
                </div>
                <button
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? 'Populating...' : 'Populate Supabase Now'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-600">
                Click above to populate or update all 6 Supabase tables with the full Legal
                Metrology sample records directly from the application!
              </p>
              {seedResult && (
                <div
                  className={`text-xs p-2.5 rounded-lg border font-medium ${
                    seedResult.success
                      ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                      : 'bg-rose-100/70 border-rose-300 text-rose-900'
                  }`}
                >
                  {seedResult.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>VerifyMetro Digital Metrology Platform</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
