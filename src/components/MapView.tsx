import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteCandidate, ChargingStation, Coordinates } from '../types/emove';

interface MapViewProps {
  origin: Coordinates;
  destination: Coordinates;
  routes: RouteCandidate[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  stations: ChargingStation[];
  selectedStationId: string | null;
  onSelectStation: (station: ChargingStation) => void;
  onDivertToStation?: (station: ChargingStation) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  origin,
  destination,
  routes,
  selectedRouteId,
  onSelectRoute,
  stations,
  selectedStationId,
  onSelectStation,
  onDivertToStation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    routesGroup: L.FeatureGroup;
    markersGroup: L.FeatureGroup;
    stationsGroup: L.FeatureGroup;
  } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [origin.lat, origin.lng],
      zoom: 13,
      zoomControl: false,
    });

    // Add zoom control at bottom right to stay clear of top overlays
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap standard tile layer with mandatory copyright attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const routesGroup = L.featureGroup().addTo(map);
    const markersGroup = L.featureGroup().addTo(map);
    const stationsGroup = L.featureGroup().addTo(map);

    layersRef.current = { routesGroup, markersGroup, stationsGroup };
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Polylines when routes or points change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    layers.markersGroup.clearLayers();
    layers.routesGroup.clearLayers();
    layers.stationsGroup.clearLayers();

    // 1. Origin Marker
    const originIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background-color: #0284c7; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(2,132,199,0.5); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3m0 14v3M2 12h3m14 0h3"></path></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon })
      .bindPopup(
        `<div style="color: #0f172a; font-family: sans-serif; font-size: 13px;">
          <strong style="color: #0284c7;">Trip Start</strong><br/>
          <span>${origin.label}</span>
        </div>`
      )
      .addTo(layers.markersGroup);

    // 2. Destination Marker
    const destIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background-color: #059669; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(5,150,105,0.5); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon })
      .bindPopup(
        `<div style="color: #0f172a; font-family: sans-serif; font-size: 13px;">
          <strong style="color: #059669;">Destination</strong><br/>
          <span>${destination.label}</span>
        </div>`
      )
      .addTo(layers.markersGroup);

    // 3. Charging Station Markers
    stations.forEach((station) => {
      const isSelected = selectedStationId === station.id;
      const isReachable = station.isReachableWithReserve ?? true;

      const stationIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background-color: ${isReachable ? '#d97706' : '#64748b'}; width: ${isSelected ? '32px' : '26px'}; height: ${isSelected ? '32px' : '26px'}; border-radius: 6px; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; cursor: pointer;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
        `,
        iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
        iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13],
      });

      const popupHtml = `
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 190px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <strong style="font-size: 13px; color: #b45309;">${station.name}</strong>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${station.address}</div>
          <div style="background: #f1f5f9; padding: 4px 6px; border-radius: 4px; font-size: 11px; margin-bottom: 6px;">
            <span>${station.statusLabel}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 8px; font-size: 11px;">
            <div>Dist: <strong>${station.distanceFromStartKm ?? '--'} km</strong></div>
            <div>Energy: <strong>${station.energyNeededWh ?? '--'} Wh</strong></div>
          </div>
          <button id="divert-btn-${station.id}" style="width: 100%; padding: 6px 8px; background: #0f172a; color: #38bdf8; border: none; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
            Divert Route to This Station
          </button>
        </div>
      `;

      const marker = L.marker([station.lat, station.lng], { icon: stationIcon })
        .bindPopup(popupHtml)
        .on('click', () => {
          onSelectStation(station);
        })
        .on('popupopen', () => {
          const btn = document.getElementById(`divert-btn-${station.id}`);
          if (btn && onDivertToStation) {
            btn.onclick = () => {
              onDivertToStation(station);
            };
          }
        })
        .addTo(layers.stationsGroup);
    });

    // 4. Candidate Route Polylines
    routes.forEach((route) => {
      const isSelected = selectedRouteId === route.id;
      const isRecommended = route.isRecommended;
      const isFeasible = route.isFeasible;

      let color = '#64748b'; // neutral fallback
      let dashArray: string | undefined = undefined;
      let weight = isSelected ? 6 : 4;
      let opacity = isSelected ? 1.0 : 0.7;

      if (isRecommended) {
        color = '#06b6d4'; // Cyan for recommended shortest feasible
        weight = isSelected ? 7 : 5;
        opacity = 0.95;
      } else if (isFeasible) {
        color = '#10b981'; // Emerald for safe alternative
        weight = isSelected ? 6 : 4;
        opacity = 0.8;
      } else {
        color = '#f43f5e'; // Rose red for infeasible (breaches safety reserve)
        dashArray = '6, 8';
        weight = isSelected ? 5 : 3.5;
        opacity = 0.7;
      }

      const polyline = L.polyline(route.coordinates, {
        color,
        weight,
        opacity,
        dashArray,
      }).addTo(layers.routesGroup);

      polyline.on('click', () => {
        onSelectRoute(route.id);
      });

      polyline.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 11px; font-weight: 600;">
          ${route.name} • ${route.distanceKm} km • ${route.estimatedEnergyWh} Wh
          ${route.isRecommended ? ' (★ Recommended)' : ''}
        </div>`,
        { sticky: true }
      );
    });

    // Auto-fit map bounds
    const allLayers = [
      ...layers.markersGroup.getLayers(),
      ...layers.routesGroup.getLayers(),
    ];
    if (allLayers.length > 0) {
      const group = L.featureGroup(allLayers);
      map.fitBounds(group.getBounds().pad(0.12), { animate: true });
    }
  }, [origin, destination, routes, selectedRouteId, stations, selectedStationId]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 0 }} />

      {/* Map Legend Overlay */}
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-auto">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center justify-between gap-3">
          <span>Route Legend</span>
          <span className="text-[9px] text-cyan-400 font-mono">OSRM Bike Profile</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded-full bg-cyan-400 inline-block shadow-sm shadow-cyan-500/50"></span>
            <span className="text-slate-200">Recommended (Shortest Feasible)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">Feasible Alternative</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded-full border-t border-dashed border-rose-500 inline-block"></span>
            <span className="text-rose-300">Infeasible (Reserve Deficit)</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5 border-t border-slate-800">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
            <span className="text-amber-300">Charging Station (Demo/Unverified)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
