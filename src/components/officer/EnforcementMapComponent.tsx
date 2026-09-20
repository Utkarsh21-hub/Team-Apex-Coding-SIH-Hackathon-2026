import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GisInstrumentMarker, EnforcementStatus, INSTRUMENT_TYPE_LABELS } from '../../types';
import { Crosshair, ZoomIn, ZoomOut, Layers, AlertCircle } from 'lucide-react';

interface EnforcementMapComponentProps {
  markers: GisInstrumentMarker[];
  centerLat: number;
  centerLng: number;
  zoom?: number;
  radiusKm?: number;
  selectedMarkerId?: string | null;
  onSelectMarker: (marker: GisInstrumentMarker) => void;
  onPlanRaid: (marker: GisInstrumentMarker) => void;
  onRecenterToUser?: () => void;
}

export const EnforcementMapComponent: React.FC<EnforcementMapComponentProps> = ({
  markers,
  centerLat,
  centerLng,
  zoom = 13,
  radiusKm,
  selectedMarkerId,
  onSelectMarker,
  onPlanRaid,
  onRecenterToUser,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: false, // Custom controls
      });

      // Standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | VerifyMetro Legal Metrology GIS',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLng], zoom, {
        animate: true,
      });
    }
  }, [centerLat, centerLng, zoom]);

  // Update radius circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (radiusKm && radiusKm > 0) {
      radiusCircleRef.current = L.circle([centerLat, centerLng], {
        radius: radiusKm * 1000, // in meters
        color: '#dc2626',
        fillColor: '#fee2e2',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(mapInstanceRef.current);
    }
  }, [centerLat, centerLng, radiusKm]);

  // Render markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Custom helper for Pin SVG based on status
    const createMarkerIcon = (marker: GisInstrumentMarker, isSelected: boolean) => {
      const { status } = marker;

      let colorBg = '#ef4444'; // Red for expired
      let colorBorder = '#b91c1c';
      let iconSymbol = '!';
      let pulseHtml = '';

      if (status === 'EXPIRED') {
        colorBg = '#dc2626';
        colorBorder = '#991b1b';
        iconSymbol = '⚠️';
        pulseHtml = `<span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
        </span>`;
      } else if (status === 'EXPIRING_SOON') {
        colorBg = '#f59e0b';
        colorBorder = '#d97706';
        iconSymbol = '⏱️';
      } else if (status === 'UNDER_VERIFICATION') {
        colorBg = '#2563eb';
        colorBorder = '#1d4ed8';
        iconSymbol = '📋';
      } else {
        colorBg = '#10b981';
        colorBorder = '#059669';
        iconSymbol = '✓';
      }

      const selectedClass = isSelected
        ? 'ring-4 ring-blue-600 ring-offset-2 scale-125 z-50'
        : 'hover:scale-110';

      const html = `
        <div class="relative flex items-center justify-center transition-transform duration-200 ${selectedClass}" style="width: 36px; height: 36px;">
          ${pulseHtml}
          <div style="background-color: ${colorBg}; border: 2.5px solid ${colorBorder};" class="w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white text-xs font-bold">
            <span>${iconSymbol}</span>
          </div>
          <div style="border-top-color: ${colorBorder};" class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6"></div>
        </div>
      `;

      return L.divIcon({
        html,
        className: 'custom-gis-pin',
        iconSize: [36, 42],
        iconAnchor: [18, 40],
        popupAnchor: [0, -40],
      });
    };

    markers.forEach((m) => {
      const isSelected = selectedMarkerId === m.instrument.id;
      const icon = createMarkerIcon(m, isSelected);
      const leafletMarker = L.marker([m.coordinates.lat, m.coordinates.lng], {
        icon,
      });

      // Build popup content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 text-slate-900 font-sans max-w-xs';

      const statusBadge =
        m.status === 'EXPIRED'
          ? '<span style="background-color:#fee2e2;color:#991b1b;border:1px solid #f87171;" class="px-2 py-0.5 rounded text-[11px] font-bold">🔴 EXPIRED CERTIFICATE</span>'
          : m.status === 'EXPIRING_SOON'
          ? '<span style="background-color:#fef3c7;color:#92400e;border:1px solid #fcd34d;" class="px-2 py-0.5 rounded text-[11px] font-bold">🟡 EXPIRING SOON</span>'
          : m.status === 'UNDER_VERIFICATION'
          ? '<span style="background-color:#dbeafe;color:#1e40af;border:1px solid #93c5fd;" class="px-2 py-0.5 rounded text-[11px] font-bold">🔵 UNDER VERIFICATION</span>'
          : '<span style="background-color:#d1fae5;color:#065f46;border:1px solid #6ee7b7;" class="px-2 py-0.5 rounded text-[11px] font-bold">🟢 ACTIVE VERIFIED</span>';

      popupDiv.innerHTML = `
        <div style="font-family: inherit;">
          <div style="margin-bottom: 6px;">${statusBadge}</div>
          <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0;">${m.business.organization}</h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">Proprietor: <strong>${m.business.name}</strong></p>
          <div style="font-size: 11px; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 8px;">
            <div><strong>Instrument:</strong> ${m.instrument.make} (${m.instrument.model})</div>
            <div><strong>Serial No:</strong> <code style="font-family: monospace;">${m.instrument.serial_number}</code></div>
            ${
              m.certificate
                ? `<div><strong>Cert No:</strong> ${m.certificate.certificate_number}</div>`
                : ''
            }
            ${
              m.daysUntilExpiry != null
                ? `<div style="color: ${m.daysUntilExpiry < 0 ? '#b91c1c' : '#b45309'}; font-weight: 600;">
                    ${m.daysUntilExpiry < 0 ? `Overdue by ${Math.abs(m.daysUntilExpiry)} days` : `Expires in ${m.daysUntilExpiry} days`}
                  </div>`
                : ''
            }
            ${m.distanceKm != null ? `<div><strong>Distance:</strong> ${m.distanceKm} km away</div>` : ''}
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="btn-plan-${m.instrument.id}" style="background-color: ${m.status === 'EXPIRED' ? '#dc2626' : '#1d4ed8'}; color: white; border: none; padding: 5px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; flex: 1;">
              ${m.status === 'EXPIRED' ? 'Plan Raid / Notice' : 'Schedule Inspection'}
            </button>
            <button id="btn-view-${m.instrument.id}" style="background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; cursor: pointer;">
              View
            </button>
          </div>
        </div>
      `;

      leafletMarker.bindPopup(popupDiv, { maxWidth: 300 });

      leafletMarker.on('popupopen', () => {
        const planBtn = document.getElementById(`btn-plan-${m.instrument.id}`);
        const viewBtn = document.getElementById(`btn-view-${m.instrument.id}`);

        if (planBtn) {
          planBtn.onclick = () => {
            onPlanRaid(m);
          };
        }
        if (viewBtn) {
          viewBtn.onclick = () => {
            onSelectMarker(m);
          };
        }
      });

      leafletMarker.on('click', () => {
        onSelectMarker(m);
      });

      markersLayerRef.current?.addLayer(leafletMarker);

      if (isSelected) {
        leafletMarker.openPopup();
      }
    });
  }, [markers, selectedMarkerId, onSelectMarker, onPlanRaid]);

  // Fit bounds to all markers helper
  const handleFitAll = () => {
    if (!mapInstanceRef.current || markers.length === 0) return;
    const latLngs = markers.map((m) => [m.coordinates.lat, m.coordinates.lng] as [number, number]);
    const bounds = L.latLngBounds(latLngs);
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 p-1 flex flex-col">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom In"
            className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 my-0.5" />
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom Out"
            className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Fit Bounds */}
        <button
          onClick={handleFitAll}
          title="Fit All Instruments"
          className="bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Recenter / Geolocation */}
        {onRecenterToUser && (
          <button
            onClick={onRecenterToUser}
            title="Center on My Location"
            className="bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 px-3 py-2 text-xs">
        <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
          <span>Certificate Status Legend</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block shadow-sm"></span>
            <span className="font-medium text-red-900">Expired (Raid Priority)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
            <span>Expiring Soon (&lt;30d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
            <span>Active Verified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shadow-sm"></span>
            <span>Under Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
