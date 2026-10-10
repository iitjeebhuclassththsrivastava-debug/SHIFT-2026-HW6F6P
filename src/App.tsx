/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BatteryParams,
  Coordinates,
  RouteCandidate,
  ChargingStation,
  WeatherData,
} from './types/emove';
import { PRESET_SCENARIOS, VARANASI_LOCATIONS } from './data/presetScenarios';
import { fetchLiveWeather } from './services/weatherService';
import { fetchCandidateBikeRoutes } from './services/routingService';
import {
  evaluateCandidateRoutes,
  calculateUsableEnergyWh,
  calculateRouteBudgetWh,
} from './services/energyCalculator';
import { evaluateStationReachability } from './services/stationService';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { BatteryPanel } from './components/BatteryPanel';
import { RouteComparison } from './components/RouteComparison';
import { ElevationProfile } from './components/ElevationProfile';
import { WeatherWidget } from './components/WeatherWidget';
import { TripSelector } from './components/TripSelector';
import { ChargingStationDrawer } from './components/ChargingStationDrawer';
import { DataCalibrationModal } from './components/DataCalibrationModal';
import { StudentGuideModal } from './components/StudentGuideModal';
import { EnergyBreakdownModal } from './components/EnergyBreakdownModal';
import { Loader2, AlertCircle, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  // Preset scenario state
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-feasible');

  // Waypoints
  const [origin, setOrigin] = useState<Coordinates>(PRESET_SCENARIOS[0].origin);
  const [destination, setDestination] = useState<Coordinates>(PRESET_SCENARIOS[0].destination);

  // Battery Parameters
  const [battery, setBattery] = useState<BatteryParams>(PRESET_SCENARIOS[0].battery);

  // Weather state
  const [weather, setWeather] = useState<WeatherData>({
    temperatureC: 25.0,
    windSpeedKmh: 14.0,
    windDirectionDeg: 60,
    apparentTempC: 25.5,
    precipitationMm: 0.0,
    source: 'Open-Meteo v1 Forecast API (Loading...)',
    timestamp: new Date().toLocaleTimeString(),
    isLive: false,
  });
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  // Routes state
  const [routes, setRoutes] = useState<RouteCandidate[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(false);

  // Charging Stations state
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Modal open states
  const [isStationsOpen, setIsStationsOpen] = useState<boolean>(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isEnergyBreakdownOpen, setIsEnergyBreakdownOpen] = useState<boolean>(false);

  // Load weather
  const loadWeather = useCallback(async (lat: number, lng: number) => {
    setIsLoadingWeather(true);
    try {
      const data = await fetchLiveWeather(lat, lng);
      setWeather(data);
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // Calculate & Refresh Routes
  const calculateRoutes = useCallback(
    async (
      currentOrigin: Coordinates,
      currentDest: Coordinates,
      currentBattery: BatteryParams,
      currentWeather: WeatherData
    ) => {
      setIsLoadingRoutes(true);
      try {
        // 1. Fetch raw candidate bike paths with Copernicus GLO-90 DEM elevations
        const rawCandidates = await fetchCandidateBikeRoutes(
          currentOrigin.lat,
          currentOrigin.lng,
          currentDest.lat,
          currentDest.lng
        );

        // 2. Evaluate battery feasibility with pure physics engine
        const evaluated = evaluateCandidateRoutes(rawCandidates, currentBattery, currentWeather);
        setRoutes(evaluated);

        // Select recommended or first route
        const rec = evaluated.find((r) => r.isRecommended) || evaluated[0];
        if (rec) {
          setSelectedRouteId(rec.id);
        }

        // 3. Update charging stations reachability
        const stationList = evaluateStationReachability(
          currentOrigin,
          currentDest,
          currentBattery,
          currentWeather
        );
        setStations(stationList);
      } catch (err) {
        console.error('Failed to compute bike routes:', err);
      } finally {
        setIsLoadingRoutes(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    (async () => {
      await loadWeather(origin.lat, origin.lng);
      await calculateRoutes(origin, destination, battery, weather);
    })();
  }, []);

  // When battery parameters change, re-evaluate existing candidate routes instantaneously
  useEffect(() => {
    if (routes.length === 0) return;

    // Fast client-side re-evaluation without re-fetching geometry
    const evaluated = evaluateCandidateRoutes(routes, battery, weather);
    setRoutes(evaluated);

    // Keep active selection or fallback to recommended
    if (!evaluated.some((r) => r.id === selectedRouteId)) {
      const rec = evaluated.find((r) => r.isRecommended) || evaluated[0];
      if (rec) setSelectedRouteId(rec.id);
    }

    const stationList = evaluateStationReachability(origin, destination, battery, weather);
    setStations(stationList);
  }, [battery]);

  // Handle Preset Scenario Switch
  const handleSelectScenario = async (scenarioId: string) => {
    const scenario = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setActiveScenarioId(scenarioId);
    setOrigin(scenario.origin);
    setDestination(scenario.destination);
    setBattery(scenario.battery);

    // Fetch weather and recalculate routes
    await loadWeather(scenario.origin.lat, scenario.origin.lng);
    await calculateRoutes(scenario.origin, scenario.destination, scenario.battery, weather);
  };

  // Handle Divert Route to Charging Station
  const handleDivertToStation = async (station: ChargingStation) => {
    const stationDest: Coordinates = {
      lat: station.lat,
      lng: station.lng,
      label: station.name,
    };
    setDestination(stationDest);
    setSelectedStationId(station.id);
    await calculateRoutes(origin, stationDest, battery, weather);
  };

  // Handle Origin / Destination swap
  const handleSwapWaypoints = async () => {
    const oldOrigin = origin;
    const oldDest = destination;
    setOrigin(oldDest);
    setDestination(oldOrigin);
    await calculateRoutes(oldDest, oldOrigin, battery, weather);
  };

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0] || null;
  const usableWh = calculateUsableEnergyWh(battery);
  const routeBudgetWh = calculateRouteBudgetWh(usableWh, battery.safetyReservePct);
  const nearestReachableStation = stations.find((s) => s.isReachableWithReserve);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        onOpenStations={() => setIsStationsOpen(true)}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenEnergyBreakdown={() => setIsEnergyBreakdownOpen(true)}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (Desktop 7 cols): Interactive Map & Elevation Profile */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* Leaflet Map with Legend and Station Popups */}
          <div className="h-[420px] sm:h-[480px] w-full rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
            {isLoadingRoutes && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-[500] flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  Calculating OSRM bike routes & Copernicus DEM elevation...
                </span>
              </div>
            )}
            <MapView
              origin={origin}
              destination={destination}
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={setSelectedRouteId}
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={(st) => setSelectedStationId(st.id)}
              onDivertToStation={handleDivertToStation}
            />
          </div>

          {/* Elevation Profile along active candidate route */}
          <ElevationProfile route={activeRoute} />

          {/* Data Sources and Honest Attribution Strip */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500">Live Sources:</span>
              <span className="font-mono text-cyan-300">OpenStreetMap Tiles</span>
              <span>·</span>
              <span className="font-mono text-cyan-300">OSRM Bicycle Engine</span>
              <span>·</span>
              <span className="font-mono text-cyan-300">Open-Meteo GLO-90 DEM</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Demo stations unverified • Downhill regen safely uncredited
            </div>
          </div>
        </section>

        {/* Right Column (Desktop 5 cols): Battery, Weather, Routes, and Trip Selector */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          {/* Trip Waypoint Selector */}
          <TripSelector
            origin={origin}
            destination={destination}
            onChangeOrigin={(newOrigin) => {
              setOrigin(newOrigin);
              calculateRoutes(newOrigin, destination, battery, weather);
            }}
            onChangeDestination={(newDest) => {
              setDestination(newDest);
              calculateRoutes(origin, newDest, battery, weather);
            }}
            onSwap={handleSwapWaypoints}
            isLoadingRoutes={isLoadingRoutes}
            onRecalculate={() => calculateRoutes(origin, destination, battery, weather)}
          />

          {/* Battery State & Health (SOH + SOC + Mass + Reserve) */}
          <BatteryPanel
            battery={battery}
            onChange={setBattery}
            onOpenEnergyBreakdown={() => setIsEnergyBreakdownOpen(true)}
          />

          {/* Candidate Routes Comparison List */}
          <RouteComparison
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
            usableWh={usableWh}
            routeBudgetWh={routeBudgetWh}
            safetyReservePct={battery.safetyReservePct}
            onOpenChargingStations={() => setIsStationsOpen(true)}
            nearestReachableStation={nearestReachableStation}
          />

          {/* Weather & Drag Widget */}
          <WeatherWidget
            weather={weather}
            activeRoute={activeRoute}
            isLoading={isLoadingWeather}
            onRefreshWeather={() => loadWeather(origin.lat, origin.lng)}
          />
        </section>
      </main>

      {/* IIT BHU SHIFT Hackathon Institutional Footer */}
      <footer className="mt-8 border-t border-slate-900 bg-slate-950/90 py-4 px-4 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-amber-400">SHIFT Hackathon</span>
            <span>·</span>
            <span className="text-slate-300">Indian Institute of Technology (BHU) Varanasi</span>
            <span>·</span>
            <span className="text-cyan-400 font-mono">Clean Energy & Micromobility</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Independent student prototype. OpenStreetMap, Open-Meteo & OSRM bicycle engines.
          </div>
        </div>
      </footer>

      {/* Reachable Charging Stations Drawer */}
      <ChargingStationDrawer
        isOpen={isStationsOpen}
        onClose={() => setIsStationsOpen(false)}
        stations={stations}
        selectedStationId={selectedStationId}
        onSelectStation={(st) => setSelectedStationId(st.id)}
        onDivertToStation={handleDivertToStation}
        usableWh={usableWh}
        routeBudgetWh={routeBudgetWh}
      />

      {/* Dublin Benchmark & CSV Telemetry Calibration Modal */}
      <DataCalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        riderMassKg={battery.riderBikeMassKg}
        baselineWhPerKm={battery.baselineWhPerKm}
      />

      {/* 3-Minute Hackathon Demo Script & Student Guide Modal */}
      <StudentGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* Physics Energy Formula Breakdown Modal */}
      <EnergyBreakdownModal
        isOpen={isEnergyBreakdownOpen}
        onClose={() => setIsEnergyBreakdownOpen(false)}
        battery={battery}
        route={activeRoute}
        weather={weather}
      />
    </div>
  );
}
