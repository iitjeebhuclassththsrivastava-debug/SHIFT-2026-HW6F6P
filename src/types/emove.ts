export interface BatteryParams {
  ratedCapacityWh: number; // e.g. 417 Wh (typical 36V 11.6Ah)
  soh: number; // State of Health (0-100%)
  soc: number; // State of Charge (0-100%)
  riderBikeMassKg: number; // Rider + bike mass in kg (e.g. 105 kg)
  safetyReservePct: number; // Safety reserve fraction (e.g. 15%)
  drivetrainEfficiency: number; // Default 0.80 (80%)
  baselineWhPerKm: number; // Default 9.0 Wh/km on flat, calm terrain
}

export interface Coordinates {
  lat: number;
  lng: number;
  label: string;
}

export interface WeatherData {
  temperatureC: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  apparentTempC: number;
  precipitationMm: number;
  source: string;
  timestamp: string;
  isLive: boolean;
}

export interface ElevationPoint {
  distanceKm: number;
  elevationM: number;
  lat: number;
  lng: number;
}

export interface RouteCandidate {
  id: string;
  name: string;
  description: string;
  distanceKm: number;
  durationMin: number;
  totalUphillMeters: number;
  totalDownhillMeters: number;
  elevationProfile: ElevationPoint[];
  coordinates: [number, number][]; // [lat, lng]
  estimatedEnergyWh: number;
  rollingFlatEnergyWh: number;
  climbEnergyWh: number;
  weatherFactor: number;
  remainingWh: number;
  isFeasible: boolean;
  feasibilityReason?: string;
  isRecommended: boolean;
}

export interface ChargingStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  plugTypes: string[];
  powerKw: number;
  status: 'unverified_demo' | 'live_ocpi' | 'offline';
  statusLabel: string;
  distanceFromStartKm?: number;
  distanceFromDestKm?: number;
  energyNeededWh?: number;
  isReachableWithReserve?: boolean;
}

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  origin: Coordinates;
  destination: Coordinates;
  battery: BatteryParams;
  expectedOutcome: 'feasible' | 'infeasible_divert' | 'marginal';
}

export interface CalibrationRide {
  rideId: string;
  date: string;
  location: string;
  distanceKm: number;
  elevationGainM: number;
  avgSpeedKmh: number;
  measuredWh: number;
  physicsBaselineWh: number;
  errorWh: number;
  errorPct: number;
  underestimated: boolean;
}

export interface ValidationSummary {
  sampleCount: number;
  datasetName: string;
  license: string;
  meanAbsoluteErrorWh: number;
  meanAbsoluteErrorPct: number;
  underestimationRatePct: number;
  maxUnderestimationWh: number;
  notes: string;
}
