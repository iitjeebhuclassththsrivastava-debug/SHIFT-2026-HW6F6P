/**
 * Charging Station Service for E-Move
 *
 * Tailored for the SHIFT Hackathon at IIT (BHU) Varanasi.
 * Features realistic charging points across the 1,300-acre IIT BHU campus
 * and the surrounding Varanasi micromobility corridors.
 *
 * Honest Accuracy & Status Disclaimer:
 * Stations are clearly labeled with "Unverified / Demo (Live telemetry unlinked)".
 * Never falsely claims live telemetry is active without an authorized OCPI/BMS server.
 */

import { ChargingStation, Coordinates, BatteryParams, WeatherData } from '../types/emove';
import { haversineDistanceKm } from './elevationService';
import {
  calculateUsableEnergyWh,
  calculateRouteBudgetWh,
  calculateRouteBearing,
  calculateConditionsFactor,
} from './energyCalculator';

export const KNOWN_CHARGING_STATIONS: ChargingStation[] = [
  {
    id: 'station-iitbhu-technex',
    name: 'IIT (BHU) Core Engineering EV Hub',
    lat: 25.2612,
    lng: 82.9885,
    address: 'Near Mechanical Dept & Limbdi Hostel, IIT (BHU) Campus',
    plugTypes: ['15A Smart E-Cycle Socket', 'Solar Micro-DC Port (2 kW)'],
    powerKw: 3.3,
    status: 'unverified_demo',
    statusLabel: 'IIT (BHU) Campus Station • Demo Status',
  },
  {
    id: 'station-bhu-vt',
    name: 'BHU New Vishwanath Temple (VT) Solar Bay',
    lat: 25.2677,
    lng: 82.9912,
    address: 'Central Axis Road, Near New VT, BHU Campus',
    plugTypes: ['Standard 3-Pin 5A/15A AC', 'Type-2 (3.3 kW)'],
    powerKw: 3.3,
    status: 'unverified_demo',
    statusLabel: 'BHU Central Axis • Demo Status',
  },
  {
    id: 'station-lanka',
    name: 'BHU Main Gate Lanka EV Hub',
    lat: 25.2801,
    lng: 82.9992,
    address: 'Near BHU Main Gate (Lion Gate), Lanka Crossing',
    plugTypes: ['Standard 3-Pin 15A AC', 'Bharat AC-001 (10 kW)'],
    powerKw: 7.4,
    status: 'unverified_demo',
    statusLabel: 'Lanka Transit Point • Demo Status',
  },
  {
    id: 'station-assi',
    name: 'Assi Ghat Eco-Mobility Point',
    lat: 25.2885,
    lng: 83.0064,
    address: 'Southern Ghat Promenade, Assi, Varanasi',
    plugTypes: ['Standard 15A Socket', 'Type-2 AC'],
    powerKw: 3.3,
    status: 'unverified_demo',
    statusLabel: 'Riverfront Point • Demo Status',
  },
  {
    id: 'station-sigra',
    name: 'Sigra Stadium Smart EV Hub',
    lat: 25.3175,
    lng: 82.9863,
    address: 'Dr. Sampurnanand Stadium Road, Sigra, Varanasi',
    plugTypes: ['Standard 3-Pin 5A/15A AC', 'Bharat AC-001 (10 kW)'],
    powerKw: 7.4,
    status: 'unverified_demo',
    statusLabel: 'Varanasi Smart City Point • Demo Status',
  },
  {
    id: 'station-cantt',
    name: 'Kashi Cantt Junction Charging Bay',
    lat: 25.3284,
    lng: 82.9871,
    address: 'Station Road, Varanasi Cantt Railway Complex',
    plugTypes: ['Universal 15A Socket', 'Dual Type-2 Fast AC'],
    powerKw: 7.4,
    status: 'unverified_demo',
    statusLabel: 'Railway Transit Bay • Demo Status',
  },
  {
    id: 'station-godowlia',
    name: 'Godowlia Multi-Level Transit Hub',
    lat: 25.3092,
    lng: 83.0061,
    address: 'Godowlia Crossing, Dashashwamedh Corridor',
    plugTypes: ['5A Slow Micro-EV Charger', '15A AC Socket'],
    powerKw: 3.3,
    status: 'unverified_demo',
    statusLabel: 'Heritage Corridor Point • Demo Status',
  },
  {
    id: 'station-sarnath',
    name: 'Sarnath Green Mobility Hub',
    lat: 25.3721,
    lng: 83.0232,
    address: 'Near Sarnath Archaeological Museum & Eco Park',
    plugTypes: ['Standard 15A AC Socket', 'DC Micro-Fast (3 kW)'],
    powerKw: 3.0,
    status: 'unverified_demo',
    statusLabel: 'Tourism Corridor Point • Demo Status',
  },
];

/**
 * Evaluates reachability of charging stations from a starting coordinate
 * considering current battery state and safety reserve.
 */
export function evaluateStationReachability(
  origin: Coordinates,
  destination: Coordinates,
  battery: BatteryParams,
  weather: WeatherData
): ChargingStation[] {
  const usableWh = calculateUsableEnergyWh(battery);
  const routeBudgetWh = calculateRouteBudgetWh(usableWh, battery.safetyReservePct);

  return KNOWN_CHARGING_STATIONS.map((station) => {
    // Road distance estimated with 1.25 urban tortuosity factor over straight-line haversine
    const haversineDist = haversineDistanceKm(origin.lat, origin.lng, station.lat, station.lng);
    const estRoadDistKm = Math.round(haversineDist * 1.25 * 10) / 10;

    const destHaversine = haversineDistanceKm(station.lat, station.lng, destination.lat, destination.lng);
    const estDestDistKm = Math.round(destHaversine * 1.25 * 10) / 10;

    const bearing = calculateRouteBearing(origin.lat, origin.lng, station.lat, station.lng);
    const weatherFactor = calculateConditionsFactor(bearing, weather);

    // Approximate energy needed to reach station (assuming modest 10m climb variation)
    const energyNeededWh = Math.round((estRoadDistKm * battery.baselineWhPerKm * weatherFactor + 2.5) * 10) / 10;

    const isReachableWithReserve = energyNeededWh <= routeBudgetWh;

    return {
      ...station,
      distanceFromStartKm: estRoadDistKm,
      distanceFromDestKm: estDestDistKm,
      energyNeededWh,
      isReachableWithReserve,
    };
  }).sort((a, b) => (a.distanceFromStartKm || 0) - (b.distanceFromStartKm || 0));
}
