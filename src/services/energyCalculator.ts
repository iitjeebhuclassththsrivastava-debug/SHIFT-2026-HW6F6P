/**
 * Pure physics & battery calculations for E-Move
 * Follows strict project formulas with zero hidden black-box adjustments.
 */

import { BatteryParams, RouteCandidate, WeatherData } from '../types/emove';

/**
 * Calculates currently usable energy in Wh considering battery degradation (SOH) and current charge (SOC).
 * Formula: usableWh = ratedCapacityWh × (SOH / 100) × (SOC / 100)
 */
export function calculateUsableEnergyWh(params: BatteryParams): number {
  const sohRatio = Math.max(0, Math.min(100, params.soh)) / 100;
  const socRatio = Math.max(0, Math.min(100, params.soc)) / 100;
  return params.ratedCapacityWh * sohRatio * socRatio;
}

/**
 * Calculates allowable energy budget for a trip after reserving emergency/buffer margin.
 * Formula: routeBudgetWh = usableWh × (1 − reserveFraction)
 */
export function calculateRouteBudgetWh(usableWh: number, safetyReservePct: number): number {
  const reserveFraction = Math.max(0, Math.min(50, safetyReservePct)) / 100;
  return usableWh * (1 - reserveFraction);
}

/**
 * Calculates energy expended climbing elevation against gravity.
 * Formula: climbEnergyWh = massKg × 9.81 × totalUphillMeters ÷ (3600 × drivetrainEfficiency)
 *
 * Notice: Downhill potential energy is NOT credited as regenerative braking recovery in this version,
 * as standard micromobility e-cycles use freewheels or uncalibrated mechanical brakes without guaranteed regeneration.
 */
export function calculateClimbEnergyWh(
  massKg: number,
  totalUphillMeters: number,
  drivetrainEfficiency: number = 0.80
): number {
  if (totalUphillMeters <= 0) return 0;
  const efficiency = Math.max(0.5, Math.min(1.0, drivetrainEfficiency));
  const workJoules = massKg * 9.81 * totalUphillMeters;
  // 1 Watt-hour = 3600 Joules
  return workJoules / (3600 * efficiency);
}

/**
 * Calculates the conditions factor based on real ambient weather parameters.
 * Note: Clearly labeled as a theoretical aerodynamic and thermal adjustment factor.
 * - Wind drag: Calculates headwind / tailwind relative to route heading.
 * - Temperature: Sub-20°C temperatures increase battery internal impedance and air density.
 */
export function calculateConditionsFactor(
  routeBearingDeg: number,
  weather: WeatherData
): number {
  // If no weather or 0 wind, factor is 1.0 (neutral baseline)
  let factor = 1.0;

  // 1. Wind component:
  // Angle difference between wind direction and route forward bearing
  const radDiff = ((weather.windDirectionDeg - routeBearingDeg) * Math.PI) / 180;
  // Headwind is positive when wind blows directly opposite the travel direction
  // Wind direction is "from where wind blows", so opposite vector gives headwind component:
  const headwindSpeedKmh = weather.windSpeedKmh * Math.cos(radDiff);

  // Aerodynamic resistance scales quadratically with relative air speed.
  // For typical 20 km/h cycle speed, headwind of +15 km/h increases drag significantly.
  // Bound impact between -10% (pure tailwind) to +30% (strong headwind) for model stability
  const windEffect = (headwindSpeedKmh / 20) * 0.15;
  const clampedWindEffect = Math.max(-0.10, Math.min(0.35, windEffect));
  factor += clampedWindEffect;

  // 2. Temperature effect:
  // Nominal battery test temperature is 25°C. At lower temperatures (e.g. 5°C-15°C),
  // Li-ion electrolyte mobility decreases, raising internal resistance.
  if (weather.temperatureC < 20) {
    const tempDrop = 20 - weather.temperatureC;
    // ~0.6% energy penalty per °C drop below 20°C
    const coldPenalty = Math.min(0.18, tempDrop * 0.006);
    factor += coldPenalty;
  }

  return Math.round(factor * 100) / 100;
}

/**
 * Calculates route heading/bearing in degrees between start and end coordinates
 */
export function calculateRouteBearing(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): number {
  const y = Math.sin(((endLng - startLng) * Math.PI) / 180) * Math.cos((endLat * Math.PI) / 180);
  const x =
    Math.cos((startLat * Math.PI) / 180) * Math.sin((endLat * Math.PI) / 180) -
    Math.sin((startLat * Math.PI) / 180) *
      Math.cos((endLat * Math.PI) / 180) *
      Math.cos(((endLng - startLng) * Math.PI) / 180);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Evaluates all candidate routes against the battery state.
 * Returns evaluated candidates marked feasible/infeasible and identifies
 * the "shortest feasible among returned candidates".
 */
export function evaluateCandidateRoutes(
  candidates: Omit<RouteCandidate, 'estimatedEnergyWh' | 'rollingFlatEnergyWh' | 'climbEnergyWh' | 'weatherFactor' | 'remainingWh' | 'isFeasible' | 'isRecommended'>[],
  battery: BatteryParams,
  weather: WeatherData
): RouteCandidate[] {
  const usableWh = calculateUsableEnergyWh(battery);
  const routeBudgetWh = calculateRouteBudgetWh(usableWh, battery.safetyReservePct);

  // Evaluate energy for each candidate
  const evaluated: RouteCandidate[] = candidates.map((cand) => {
    // Determine overall bearing from first to last point
    const firstPt = cand.coordinates[0] || [0, 0];
    const lastPt = cand.coordinates[cand.coordinates.length - 1] || [0, 0];
    const bearing = calculateRouteBearing(firstPt[0], firstPt[1], lastPt[0], lastPt[1]);

    const weatherFactor = calculateConditionsFactor(bearing, weather);

    // Flat aerodynamic & rolling resistance energy:
    const rollingFlatEnergyWh = cand.distanceKm * battery.baselineWhPerKm * weatherFactor;

    // Elevation climb energy:
    const climbEnergyWh = calculateClimbEnergyWh(
      battery.riderBikeMassKg,
      cand.totalUphillMeters,
      battery.drivetrainEfficiency
    );

    const estimatedEnergyWh = Math.round((rollingFlatEnergyWh + climbEnergyWh) * 10) / 10;
    const remainingWh = Math.round((usableWh - estimatedEnergyWh) * 10) / 10;

    // Feasibility rule: must be within route budget (leaving safety reserve intact)
    const isFeasible = estimatedEnergyWh <= routeBudgetWh;

    let feasibilityReason = '';
    if (!isFeasible) {
      if (estimatedEnergyWh > usableWh) {
        feasibilityReason = `Total battery depletion: exceeds absolute usable energy by ${(estimatedEnergyWh - usableWh).toFixed(1)} Wh.`;
      } else {
        feasibilityReason = `Breaches ${battery.safetyReservePct}% safety reserve by ${(estimatedEnergyWh - routeBudgetWh).toFixed(1)} Wh.`;
      }
    } else {
      feasibilityReason = `Within safe budget. ${remainingWh.toFixed(1)} Wh remaining at destination.`;
    }

    return {
      ...cand,
      estimatedEnergyWh,
      rollingFlatEnergyWh: Math.round(rollingFlatEnergyWh * 10) / 10,
      climbEnergyWh: Math.round(climbEnergyWh * 10) / 10,
      weatherFactor,
      remainingWh,
      isFeasible,
      feasibilityReason,
      isRecommended: false,
    };
  });

  // Recommendation logic:
  // Shortest feasible route among the routes actually returned by the routing service.
  const feasibleRoutes = evaluated.filter((r) => r.isFeasible);
  if (feasibleRoutes.length > 0) {
    // Sort by shortest distance
    feasibleRoutes.sort((a, b) => a.distanceKm - b.distanceKm);
    const recommendedId = feasibleRoutes[0].id;
    for (const r of evaluated) {
      if (r.id === recommendedId) {
        r.isRecommended = true;
      }
    }
  }

  return evaluated;
}
