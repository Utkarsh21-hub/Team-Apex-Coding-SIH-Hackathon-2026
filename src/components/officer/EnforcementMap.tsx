import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataStore } from '../../lib/dataStore';
import {
  GisInstrumentMarker,
  EnforcementStatus,
  INSTRUMENT_TYPE_LABELS,
  InstrumentType,
} from '../../types';
import { EnforcementMapComponent } from './EnforcementMapComponent';
import { PlanRaidModal } from './PlanRaidModal';
import { geocodePincode, calculateDistanceKm, INDIAN_PINCODES } from '../../lib/gisService';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  Shield,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Compass,
  Navigation,
  FileText,
  Building2,
  Phone,
  ArrowUpRight,
  Filter,
  RotateCcw,
  Download,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EnforcementMap: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchPincode, setSearchPincode] = useState('380009');
  const [appliedPincode, setAppliedPincode] = useState('380009');
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number }>({
    lat: 23.0338,
    lng: 72.5645,
  });
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [instrumentTypeFilter, setInstrumentTypeFilter] = useState<string>('all');

  // Interactive selection state
  const [selectedMarker, setSelectedMarker] = useState<GisInstrumentMarker | null>(null);
  const [raidTargetMarker, setRaidTargetMarker] = useState<GisInstrumentMarker | null>(null);
  const [activeTab, setActiveTab] = useState<'targets' | 'details'>('targets');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Auto-refresh subscription to dataStore
  const [, setTick] = useState(0);
  useEffect(() => {
    return dataStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  // Sync center coordinates on pincode change
  const handlePincodeSearch = async (codeToSearch: string) => {
    const clean = codeToSearch.trim();
    if (!clean) return;

    setPincodeLoading(true);
    setPincodeError(null);

    const geo = await geocodePincode(clean);
    setPincodeLoading(false);

    if (geo) {
      setCenterCoords({ lat: geo.lat, lng: geo.lng });
      setAppliedPincode(clean);
    } else {
      setPincodeError(`Pincode ${clean} not found. Showing all zone instruments.`);
    }
  };

  // Get raw markers from dataStore with spatial distance relative to center
  const allMarkers = useMemo(() => {
    return dataStore.getGisEnforcementInstruments({
      centerLat: centerCoords.lat,
      centerLng: centerCoords.lng,
      radiusKm: radiusKm > 0 ? radiusKm : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      instrumentType: instrumentTypeFilter !== 'all' ? instrumentTypeFilter : undefined,
    });
  }, [centerCoords, radiusKm, statusFilter, instrumentTypeFilter]);

  // Overall counts for KPIs
  const kpis = useMemo(() => {
    const all = dataStore.getGisEnforcementInstruments();
    const expired = all.filter((m) => m.status === 'EXPIRED').length;
    const expiring = all.filter((m) => m.status === 'EXPIRING_SOON').length;
    const active = all.filter((m) => m.status === 'ACTIVE').length;
    const underVerif = all.filter((m) => m.status === 'UNDER_VERIFICATION').length;

    return {
      total: all.length,
      expired,
      expiring,
      active,
      underVerif,
      inRadius: allMarkers.length,
    };
  }, [allMarkers]);

  // User Geolocation locator
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenterCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setAppliedPincode('Current Location');
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        // Fallback to Ahmedabad Headquarters
        setCenterCoords({ lat: 23.0225, lng: 72.5714 });
      }
    );
  };

  // Quick export roster for field squad
  const handleExportRoster = () => {
    const expiredList = allMarkers.filter((m) => m.status === 'EXPIRED' || m.status === 'EXPIRING_SOON');
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Establishment,Owner,Phone,Instrument,Serial Number,Status,Days Overdue,Location,Coordinates'].join(',') +
      '\n' +
      expiredList
        .map((m) =>
          [
            `"${m.business.organization}"`,
            `"${m.business.name}"`,
            `"${m.business.phone || 'N/A'}"`,
            `"${m.instrument.make} ${m.instrument.model}"`,
            `"${m.instrument.serial_number}"`,
            `"${m.status}"`,
            m.daysUntilExpiry ? Math.abs(m.daysUntilExpiry) : 'N/A',
            `"${m.instrument.location}"`,
            `"${m.coordinates.lat},${m.coordinates.lng}"`,
          ].join(',')
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `legal-metrology-raid-roster-${appliedPincode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Access Control: Officer / Inspector check
  const isAuthorized = user && (user.role === 'lmo' || user.role === 'gatc' || user.role === 'admin');

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Enforcement Terminal</h2>
        <p className="text-sm text-slate-600">
          The GIS-Based Expired Certificate Enforcement Map is restricted to authorized Legal Metrology
          Officers (LMO) and Government Approved Test Centres (GATC).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              Statutory Enforcement GIS
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Legal Metrology Act, 2009 (Sections 24 & 30)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            GIS Expired Certificate & Raid Map
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Geospatial surveillance to locate commercial establishments operating unverified instruments and dispatch targeted surprise inspections.
          </p>
        </div>

        {/* Action button: Export Field Roster */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportRoster}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Field Squad Roster</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-red-600">{kpis.expired}</div>
            <div className="text-xs font-semibold text-slate-600">Expired (Raid Priority)</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-600">{kpis.expiring}</div>
            <div className="text-xs font-semibold text-slate-600">Expiring (&lt;30 Days)</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-blue-600">{kpis.underVerif}</div>
            <div className="text-xs font-semibold text-slate-600">Under Verification</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600">{kpis.active}</div>
            <div className="text-xs font-semibold text-slate-600">Active & Compliant</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{kpis.inRadius}</div>
            <div className="text-xs font-semibold text-slate-600">Filtered in Radius</div>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Pincode Search */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Surveillance Jurisdiction / Pincode
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePincodeSearch(searchPincode);
              }}
              className="flex gap-1.5"
            >
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Enter 6-digit Pincode (e.g. 382330)"
                  value={searchPincode}
                  onChange={(e) => setSearchPincode(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={pincodeLoading}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{pincodeLoading ? 'Searching...' : 'Locate'}</span>
              </button>
            </form>
          </div>

          {/* Radius Selector */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Inspection Radius: <span className="text-blue-700 font-bold">{radiusKm} km</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{radiusKm} km</span>
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Certificate Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Legal Metrology Statuses</option>
              <option value="EXPIRED">🔴 Expired Only (Enforcement Target)</option>
              <option value="EXPIRING_SOON">🟡 Expiring Soon (&lt;30 Days)</option>
              <option value="UNDER_VERIFICATION">🔵 Under Verification / Pending</option>
              <option value="ACTIVE">🟢 Active Verified (Compliant)</option>
            </select>
          </div>

          {/* Instrument Type Filter */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Instrument Type
            </label>
            <select
              value={instrumentTypeFilter}
              onChange={(e) => setInstrumentTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {Object.entries(INSTRUMENT_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preset quick pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Commercial Hotspots:</span>
          {[
            { label: 'Naroda GIDC (382330)', code: '382330' },
            { label: 'Navrangpura (380009)', code: '380009' },
            { label: 'Satellite Commercial (380015)', code: '380015' },
            { label: 'Connaught Place (110001)', code: '110001' },
            { label: 'Fort Mumbai (400001)', code: '400001' },
          ].map((preset) => (
            <button
              key={preset.code}
              onClick={() => {
                setSearchPincode(preset.code);
                handlePincodeSearch(preset.code);
              }}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                appliedPincode === preset.code
                  ? 'bg-blue-100 text-blue-800 font-bold border border-blue-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}

          <button
            onClick={handleLocateMe}
            className="ml-auto px-2 py-0.5 rounded text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 hover:bg-blue-50"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Use My GPS</span>
          </button>
        </div>

        {pincodeError && (
          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>{pincodeError}</span>
          </div>
        )}
      </div>

      {/* Main Split Interface: Map + Inspection Targets Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Leaflet GIS Map Container */}
        <div className="lg:col-span-7 xl:col-span-8 h-[600px] rounded-xl overflow-hidden shadow-sm border border-slate-200">
          <EnforcementMapComponent
            markers={allMarkers}
            centerLat={centerCoords.lat}
            centerLng={centerCoords.lng}
            zoom={13}
            radiusKm={radiusKm}
            selectedMarkerId={selectedMarker?.instrument.id}
            onSelectMarker={(marker) => {
              setSelectedMarker(marker);
              setActiveTab('details');
            }}
            onPlanRaid={(marker) => {
              setRaidTargetMarker(marker);
            }}
            onRecenterToUser={handleLocateMe}
          />
        </div>

        {/* Right: Inspection Planning & Establishment Drawer */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
          {/* Drawer Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setActiveTab('targets')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'targets'
                  ? 'border-red-600 text-red-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Target Roster ({allMarkers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Info className="w-4 h-4 text-blue-600" />
              <span>Target Dossier</span>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === 'targets' ? (
              allMarkers.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No Non-Compliant Units In Radius</h4>
                  <p className="text-xs text-slate-500">
                    No matching instruments found within {radiusKm} km of pincode {appliedPincode}. Try widening your inspection radius.
                  </p>
                </div>
              ) : (
                allMarkers.map((m) => {
                  const isSelected = selectedMarker?.instrument.id === m.instrument.id;
                  const isExpired = m.status === 'EXPIRED';

                  return (
                    <div
                      key={m.instrument.id}
                      onClick={() => {
                        setSelectedMarker(m);
                        setActiveTab('details');
                      }}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                          : isExpired
                          ? 'border-red-200 bg-red-50/30 hover:bg-red-50/60'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            {isExpired ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white">
                                Expired
                              </span>
                            ) : m.status === 'EXPIRING_SOON' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-white">
                                Expiring
                              </span>
                            ) : m.status === 'UNDER_VERIFICATION' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-600 text-white">
                                In Queue
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600 text-white">
                                Active
                              </span>
                            )}
                            <span className="text-[11px] font-bold text-slate-800 truncate max-w-[160px]">
                              {m.business.organization}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900">
                            {m.instrument.make} - {m.instrument.model}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Serial: <span className="font-mono">{m.instrument.serial_number}</span>
                          </p>
                        </div>

                        {m.distanceKm != null && (
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-blue-700">{m.distanceKm} km</span>
                            <span className="block text-[10px] text-slate-400">away</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-[11px]">
                          {m.daysUntilExpiry != null && m.daysUntilExpiry < 0 ? (
                            <span className="text-red-600 font-bold">
                              Overdue: {Math.abs(m.daysUntilExpiry)} days
                            </span>
                          ) : m.daysUntilExpiry != null ? (
                            <span className="text-amber-600 font-medium">
                              Expires in {m.daysUntilExpiry} days
                            </span>
                          ) : (
                            <span className="text-slate-500">Uncertified</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRaidTargetMarker(m);
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold shadow-sm flex items-center gap-1 ${
                              isExpired
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-blue-700 hover:bg-blue-800 text-white'
                            }`}
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>{isExpired ? 'Plan Raid' : 'Schedule'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : selectedMarker ? (
              /* Deep Dossier View */
              <div className="space-y-4">
                {/* Status Alert Banner */}
                <div
                  className={`p-3.5 rounded-lg border flex items-start gap-2.5 ${
                    selectedMarker.status === 'EXPIRED'
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : selectedMarker.status === 'EXPIRING_SOON'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <ShieldAlert
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      selectedMarker.status === 'EXPIRED' ? 'text-red-600' : 'text-amber-600'
                    }`}
                  />
                  <div className="space-y-0.5">
                    <div className="text-xs font-black uppercase tracking-wider">
                      {selectedMarker.status === 'EXPIRED'
                        ? 'Statutory Infraction: Expired Certificate'
                        : selectedMarker.status === 'EXPIRING_SOON'
                        ? 'Statutory Notice Required: Expiring Soon'
                        : 'Compliant Verification Stamping'}
                    </div>
                    <p className="text-xs">
                      {selectedMarker.status === 'EXPIRED'
                        ? 'Operating an unverified weighing instrument in trade or commerce violates Section 24 of Legal Metrology Act, 2009. Authorized LMO may execute entry, inspection, and seizure under Section 30.'
                        : 'Standard re-verification is mandated every 12 to 24 months based on instrument accuracy classification.'}
                    </p>
                  </div>
                </div>

                {/* Establishment Profile */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Commercial Establishment
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {selectedMarker.business.organization}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Owner: {selectedMarker.business.name}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{selectedMarker.instrument.location}</span>
                    </div>
                    {selectedMarker.business.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">{selectedMarker.business.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instrument Specifications */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Instrument Technical Specifications
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Type</span>
                      <span className="font-semibold text-slate-800">
                        {INSTRUMENT_TYPE_LABELS[selectedMarker.instrument.instrument_type as InstrumentType] ||
                          selectedMarker.instrument.instrument_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Make & Model</span>
                      <span className="font-semibold text-slate-800">
                        {selectedMarker.instrument.make} ({selectedMarker.instrument.model})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Serial Number</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {selectedMarker.instrument.serial_number}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Capacity</span>
                      <span className="font-semibold text-slate-800">{selectedMarker.instrument.capacity}</span>
                    </div>
                  </div>
                </div>

                {/* Previous Certificate Information */}
                {selectedMarker.certificate ? (
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Last Authoritative Certificate</span>
                      <span className="font-mono font-bold text-slate-700">
                        {selectedMarker.certificate.certificate_number}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Issued By</span>
                        <span className="font-medium text-slate-800">
                          {selectedMarker.certificate.issuing_officer_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Expiry Date</span>
                        <span className="font-bold text-red-600">
                          {selectedMarker.certificate.expiry_date}
                        </span>
                      </div>
                      {selectedMarker.certificate.seal_identification_tag && (
                        <div className="col-span-2">
                          <span className="text-slate-500 block text-[10px]">Lead Seal Identification Tag</span>
                          <span className="font-mono text-slate-800 font-semibold">
                            {selectedMarker.certificate.seal_identification_tag}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                    No prior digital verification certificate found on record. Deemed unregistered or non-compliant under Legal Metrology Rules.
                  </div>
                )}

                {/* Dispatch Action */}
                <div className="pt-2">
                  <button
                    onClick={() => setRaidTargetMarker(selectedMarker)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Plan Surprise Raid / Enforcement Action</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 space-y-2 text-slate-500 text-xs">
                <Compass className="w-8 h-8 mx-auto text-slate-400" />
                <p>Click on any establishment marker on the GIS map or select from the target roster to inspect details.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Raid Modal */}
      {raidTargetMarker && (
        <PlanRaidModal
          marker={raidTargetMarker}
          onClose={() => setRaidTargetMarker(null)}
          onSuccess={() => {
            // refresh
          }}
        />
      )}
    </div>
  );
};
