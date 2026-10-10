import { PresetScenario, Coordinates } from '../types/emove';

export const VARANASI_LOCATIONS: Record<string, Coordinates> = {
  iit_bhu_hostel: {
    lat: 25.2605,
    lng: 82.9868,
    label: 'IIT (BHU) Rajputana & Limbdi Hostels',
  },
  bhu_vt: {
    lat: 25.2677,
    lng: 82.9912,
    label: 'BHU New Vishwanath Temple (VT)',
  },
  bhu_hyderabad: {
    lat: 25.2582,
    lng: 82.9945,
    label: 'IIT (BHU) Hyderabad Gate',
  },
  lanka: {
    lat: 25.2801,
    lng: 82.9992,
    label: 'BHU Main Gate (Lion Gate), Lanka',
  },
  assi: {
    lat: 25.2885,
    lng: 83.0064,
    label: 'Assi Ghat Riverfront',
  },
  godowlia: {
    lat: 25.3092,
    lng: 83.0061,
    label: 'Godowlia / Dashashwamedh Ghat',
  },
  cantt: {
    lat: 25.3284,
    lng: 82.9871,
    label: 'Varanasi Cantt Railway Station',
  },
  sigra: {
    lat: 25.3175,
    lng: 82.9863,
    label: 'Sigra Smart Stadium Hub',
  },
  sarnath: {
    lat: 25.3721,
    lng: 83.0232,
    label: 'Sarnath Deer Park & Museum',
  },
};

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'scenario-feasible',
    title: '1. Campus to Ghat Commute',
    subtitle: 'IIT (BHU) Limbdi to Assi Ghat (3.8 km) • SOH 95%, SOC 70%',
    description:
      'Standard student commute from IIT BHU hostel quad to Assi Ghat via Lanka. High battery health and ample charge; route energy is safely within budget.',
    origin: VARANASI_LOCATIONS.iit_bhu_hostel,
    destination: VARANASI_LOCATIONS.assi,
    battery: {
      ratedCapacityWh: 417,
      soh: 95,
      soc: 70,
      riderBikeMassKg: 102,
      safetyReservePct: 15,
      drivetrainEfficiency: 0.80,
      baselineWhPerKm: 9.0,
    },
    expectedOutcome: 'feasible',
  },
  {
    id: 'scenario-infeasible',
    title: '2. Degraded Battery to Sarnath',
    subtitle: 'IIT (BHU) Campus to Sarnath (14.2 km) • SOH 66%, SOC 20%',
    description:
      'Student attempting long trip to Sarnath with an aged 2-year-old e-cycle battery (66% SOH, 20% SOC) facing northern headwind. Severe energy deficit triggers safety alarm and diverts to campus or city charging hub.',
    origin: VARANASI_LOCATIONS.iit_bhu_hostel,
    destination: VARANASI_LOCATIONS.sarnath,
    battery: {
      ratedCapacityWh: 417,
      soh: 66,
      soc: 20,
      riderBikeMassKg: 106,
      safetyReservePct: 15,
      drivetrainEfficiency: 0.78,
      baselineWhPerKm: 9.6,
    },
    expectedOutcome: 'infeasible_divert',
  },
  {
    id: 'scenario-marginal',
    title: '3. Hyderabad Gate to Cantt Station',
    subtitle: 'IIT (BHU) Gate to Cantt Junction (8.4 km) • SOH 80%, SOC 25%',
    description:
      'Borderline scenario navigating Cantt flyover elevation with 25% battery charge. Arterial route violates the 15% safety buffer due to climb work, while the flatter bypass route safely preserves the emergency reserve.',
    origin: VARANASI_LOCATIONS.bhu_hyderabad,
    destination: VARANASI_LOCATIONS.cantt,
    battery: {
      ratedCapacityWh: 417,
      soh: 80,
      soc: 25,
      riderBikeMassKg: 105,
      safetyReservePct: 15,
      drivetrainEfficiency: 0.80,
      baselineWhPerKm: 9.0,
    },
    expectedOutcome: 'marginal',
  },
];
