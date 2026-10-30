'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Complaint, HotspotCluster} from '@/types/civic';
import { PriorityLevel } from '@/types/civic';
import { identifyHotspots } from '@/lib/utils/geo';
import { getPriorityStyles } from '@/lib/utils/formatters';

interface Props {
  complaints: Complaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: Complaint) => void;
  height?: string;
  isPickerMode?: boolean;
  onPickLocation?: (lat: number, lng: number, placeName?: string) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export function CivicMap({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  height = '500px',
  isPickerMode = false,
  onPickLocation,
  initialCenter = [12.9716, 77.5946],
  initialZoom = 13,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersLayerRef = useRef<unknown>(null);
  const hotspotsLayerRef = useRef<unknown>(null);
  const pickerMarkerRef = useRef<unknown>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) {return false;}
    if (selectedPriority !== 'ALL' && c.priority_level !== selectedPriority) {return false;}
    return typeof c.latitude === 'number' && typeof c.longitude === 'number';
  });

  const hotspots: HotspotCluster[] = identifyHotspots(complaints);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) {return;}

    let isMounted = true;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) {return;}

      // Import Leaflet CSS dynamically if not yet in head
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // If map already initialized, just clean up container
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView(initialCenter, initialZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        hotspotsLayerRef.current = L.layerGroup().addTo(map);

        if (isPickerMode) {
          map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
            const { lat, lng } = e.latlng;
            const roundedLat = Number(lat.toFixed(5));
            const roundedLng = Number(lng.toFixed(5));

            if (pickerMarkerRef.current) {
              (pickerMarkerRef.current as { setLatLng: (coords: [number, number]) => void }).setLatLng([roundedLat, roundedLng]);
            } else {
              const pickerIcon = L.divIcon({
                className: 'custom-picker-pin',
                html: `<div style="background-color: #2563eb; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                iconSize: [22, 22],
                iconAnchor: [11, 11],
              });
              pickerMarkerRef.current = L.marker([roundedLat, roundedLng], { icon: pickerIcon }).addTo(map);
            }

            if (onPickLocation) {
              onPickLocation(roundedLat, roundedLng);
            }
          });
        }

        mapInstanceRef.current = map;
        setMapLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialCenter, initialZoom, isPickerMode, onPickLocation]);

  // Update Markers & Hotspots whenever complaints, filters, or selection change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) {return;}

    import('leaflet').then((L) => {
      const markersLayer = markersLayerRef.current as { clearLayers: () => void; addLayer: (layer: unknown) => void };
      const hotspotsLayer = hotspotsLayerRef.current as { clearLayers: () => void; addLayer: (layer: unknown) => void };

      if (!markersLayer || !hotspotsLayer) {return;}

      markersLayer.clearLayers();
      hotspotsLayer.clearLayers();

      // 1. Draw Hotspot Density Circles
      if (showHotspots && !isPickerMode) {
        hotspots.forEach((spot) => {
          const circleColor = spot.risk_level === 'High' ? '#dc2626' : spot.risk_level === 'Medium' ? '#f59e0b' : '#3b82f6';
          const circle = L.circle([spot.center_lat, spot.center_lng], {
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '4, 6',
            radius: spot.radius_meters,
          });

          circle.bindTooltip(
            `<b>Hotspot Alert:</b> ${spot.location_name}<br/>${spot.complaint_count} reports (${spot.unresolved_count} active)<br/>Severity: ${spot.risk_level}`,
            { direction: 'top', className: 'hotspot-tooltip' }
          );

          hotspotsLayer.addLayer(circle);
        });
      }

      // 2. Draw Complaint Markers
      filteredComplaints.forEach((comp) => {
        const isSelected = selectedComplaintId === comp.id;
        const prioStyle = getPriorityStyles(comp.priority_level);
        
        let markerBg = '#64748b'; // Low
        if (comp.priority_level === 'Critical') {markerBg = '#dc2626';}
        else if (comp.priority_level === 'High') {markerBg = '#f97316';}
        else if (comp.priority_level === 'Medium') {markerBg = '#2563eb';}

        const size = isSelected ? 32 : 24;
        const borderWidth = isSelected ? 3 : 2;

        const customIcon = L.divIcon({
          className: 'custom-civic-marker',
          html: `
            <div style="
              background-color: ${markerBg};
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              border: ${borderWidth}px solid #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
              font-weight: bold;
              cursor: pointer;
              transition: transform 0.15s ease;
            ">
              ${comp.priority_score}
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([comp.latitude, comp.longitude], { icon: customIcon });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 12px; min-width: 220px; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-family: monospace; font-size: 10px; font-weight: bold; color: #475569;">${comp.reference_number}</span>
              <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 9999px; background: ${prioStyle.badgeBg}; color: ${markerBg};">
                ${comp.priority_level} (${comp.priority_score})
              </span>
            </div>
            <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
              ${comp.title}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
              📍 ${comp.location_name}
            </div>
            <div style="font-size: 11px; margin-bottom: 8px;">
              <strong>Category:</strong> ${comp.category}<br/>
              <strong>Status:</strong> <span style="font-weight: bold; color: #1e40af;">${comp.status}</span>
            </div>
            <div style="font-size: 11px; color: #334155; font-style: italic; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 8px;">
              "${comp.ai_summary.slice(0, 110)}..."
            </div>
            <button id="view-comp-${comp.id}" style="
              width: 100%;
              padding: 6px;
              background-color: #0f172a;
              color: white;
              border: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 11px;
              cursor: pointer;
            ">
              View Detailed Action
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectComplaint) {
            onSelectComplaint(comp);
          }
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`view-comp-${comp.id}`);
          if (btn && onSelectComplaint) {
            btn.onclick = () => onSelectComplaint(comp);
          }
        });

        markersLayer.addLayer(marker);
      });
    });
  }, [filteredComplaints, hotspots, showHotspots, selectedComplaintId, mapLoaded, isPickerMode, onSelectComplaint]);

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
      {/* Map Control Bar */}
      {!isPickerMode && (
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">Filter Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="Roads">Roads</option>
              <option value="Water and drainage">Water & Drainage</option>
              <option value="Waste management">Waste Management</option>
              <option value="Electricity and streetlights">Electricity & Lights</option>
              <option value="Public infrastructure">Public Infrastructure</option>
              <option value="Public safety">Public Safety</option>
              <option value="Other">Other</option>
            </select>

            <span className="font-semibold text-slate-700 ml-2">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical (80-100)</option>
              <option value="High">High (60-79)</option>
              <option value="Medium">Medium (35-59)</option>
              <option value="Low">Low (0-34)</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={showHotspots}
                onChange={(e) => setShowHotspots(e.target.checked)}
                className="rounded-sm text-blue-600 focus:ring-blue-500"
              />
              Show Hotspots ({hotspots.length})
            </label>

            <span className="text-slate-500 font-mono">
              Showing <strong>{filteredComplaints.length}</strong> markers
            </span>
          </div>
        </div>
      )}

      {/* Map Element */}
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%', minHeight: '350px' }}
        className="z-10 bg-slate-100"
      />

      {/* Map Legend Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700">Priority Legend:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Critical (80-100)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> High (60-79)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Medium (35-59)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> Low (0-34)
          </span>
        </div>
        <div>
          <span className="text-slate-500 italic">
            {isPickerMode ? 'Click on map to drop precise incident GPS pin' : 'Dashed circles indicate verified geographic incident clusters'}
          </span>
        </div>
      </div>
    </div>
  );
}
