# E-Move: Battery-Aware Route Recommendation System
### SHIFT Hackathon • Indian Institute of Technology (BHU) Varanasi
**Track: Smart E-Micromobility, Sustainable Transit & Clean Energy**

An integrated battery-aware route recommendation system for e-cycle riders. E-Move unifies battery health degradation (SOH), route planning, elevation topography, ambient weather conditions, and charging stations into one holistic system to prevent range anxiety and stranded rides across the 1,300-acre IIT BHU campus and Varanasi city corridors.

Developed as a prototype for the **SHIFT Hackathon at IIT (BHU) Varanasi**.

---

## 1. Problem Statement & Campus Context

On the IIT (BHU) campus, over 25,000 students and staff commute between hostels (Rajputana, Limbdi, Morvi), academic departments, New Vishwanath Temple (VT), Lanka gate, and Varanasi destinations like Assi Ghat, Godowlia, and Cantt railway station. 

Standard navigation platforms treat e-cycles identically to automobiles with unlimited fuel or constant electrical consumption:
1. **Battery Health (SOH) Degrades**: A 2-year-old battery might hold only 70% of its factory capacity, while the rider only notices the dashboard 80% State of Charge (SOC). True usable energy is drastically reduced:
   $$\text{usableWh} = \text{ratedCapacityWh} \times \left(\frac{\text{SOH}}{100}\right) \times \left(\frac{\text{SOC}}{100}\right)$$
2. **Topography (Elevation Climb)**: Climbing flyovers and ghat gradients requires direct gravitational potential work:
   $$\text{climbEnergyWh} = \frac{m \times 9.81 \times \Delta h}{3600 \times \eta_{\text{drivetrain}}}$$
3. **Weather Drag**: High ambient heat and seasonal headwinds increase aerodynamic and thermal power draw.
4. **Range Anxiety & Stranded Cyclists**: Without a reserved safety margin ($\ge 15\%$), a rider risks complete depletion mid-trip.

E-Move calculates the required energy for candidate bicycle routes, tests feasibility against a safe route budget, recommends the **shortest feasible among returned candidate routes**, and provides an automatic divert to reachable charging stations (including campus solar points) if no direct route is safe.

---

## 2. Setup Guide for First-Year Students (VS Code on Windows)

Follow these steps to run E-Move locally on Windows:

### Step 1: Install Node.js
- Download and run the Node.js LTS installer from [nodejs.org](https://nodejs.org/).
- Ensure the checkbox **"Add to PATH"** is selected during installation.

### Step 2: Open Project in VS Code
- Extract this project folder (or clone via Git).
- Launch Visual Studio Code.
- Click **File > Open Folder...** and select the `e-move` directory.

### Step 3: Open Integrated Terminal
- Press <kbd>Ctrl</kbd> + <kbd>`</kbd> (backtick) or select **Terminal > New Terminal** from the top menu bar.

### Step 4: Install Dependencies
Run the following command in the terminal:
```bash
npm install
```

### Step 5: Start the Local Development Server
Run:
```bash
npm run dev
```
You will see output indicating the server is running on:
```
  ➜  Local:   http://localhost:3000/
```
Hold <kbd>Ctrl</kbd> and click the link, or open your web browser to `http://localhost:3000`.

### Step 6: Zero Secret Keys Needed in Browser Code
- All integrated APIs (Open-Meteo Weather, Copernicus GLO-90 DEM Elevation, OSRM Bicycle Profile, OpenStreetMap Tiles) operate directly client-side without requiring secret API keys or credit cards, ensuring no accidental leaks to public repositories.

---

## 3. Data Sources & Licensing

| Service / Source | Role | API Endpoint / Reference | License & Usage Policy |
| :--- | :--- | :--- | :--- |
| **OpenStreetMap** | Base map tiles | Tile server via Leaflet | © OpenStreetMap contributors (ODbL) |
| **OSRM Bicycle Profile** | Route geometry & alternative paths | `https://router.project-osrm.org/route/v1/bike/` | Open Source Routing Machine / OSM data |
| **Open-Meteo Forecast API** | Live ambient temperature, wind vector, rain | `https://api.open-meteo.com/v1/forecast` | Open-Meteo (Non-commercial open access / CC BY 4.0) |
| **Copernicus GLO-90 DEM** | Terrain elevation sampling & cumulative uphill gain | `https://api.open-meteo.com/v1/elevation` (via Open-Meteo) | European Space Agency (90m horizontal grid) |
| **DualEMobility Benchmark** | Public held-out whole-ride empirical validation | `https://github.com/SFIEssential/DualEMobilityData-datasets` | Creative Commons Attribution 4.0 (CC BY 4.0) |
| **WeatherTracker.com Note** | Weather source audit | *No public documented REST API without enterprise keys; Open-Meteo utilized as instructed.* | N/A |

---

## 4. Mathematical Model & Engineering Assumptions

### Battery Usable Energy & Safe Route Budget
$$\text{usableWh} = \text{ratedCapacityWh} \times \left(\frac{\text{SOH}}{100}\right) \times \left(\frac{\text{SOC}}{100}\right)$$
$$\text{routeBudgetWh} = \text{usableWh} \times (1 - \text{reserveFraction})$$
- Default reserve fraction: **15%** (Configurable from 5% to 35% in UI).
- Default battery pack: **417 Wh** (standard 36V 11.6Ah Li-ion e-bike battery).

### Route Energy Expenditure
$$\text{routeEnergyWh} = (\text{distanceKm} \times \text{baselineWhPerKm} \times \text{conditionsFactor}) + \text{climbEnergyWh}$$
$$\text{climbEnergyWh} = \frac{m_{\text{rider+bike}} \times 9.81 \times \Delta h_{\text{uphill}}}{3600 \times \eta_{\text{drivetrain}}}$$

### Visible Assumptions & Limitations:
1. **No Regenerative Braking Credit**: Standard commuter e-cycles use freewheels and mechanical disc/rim brakes without bidirectional regenerative motor braking. Downhill potential energy is safely **not** credited as recharge.
2. **Conditions Factor**: Calculated from vector headwind component relative to route azimuth and ambient temperature (<20°C). This is a transparent physics drag model, not an experimentally certified curve for every specific motor model.
3. **Drivetrain Efficiency ($\eta = 0.80$)**: Lumped motor, inverter, gear reduction, and chain transmission efficiency.

---

## 5. How to Run the 3-Minute Hackathon Demo

Use the built-in preset scenario buttons in the header to demonstrate the prototype:

### Minute 0:00–1:00: Problem & Battery Health (SOH)
- Click **"1. Campus Commute"** (Scenario 1: IIT BHU Limbdi Hostel to Assi Ghat, 3.8 km).
- Point to the **Battery Panel**: Rated 417 Wh, healthy SOH (95%), SOC (70%).
- Usable energy is 277.3 Wh, and Safe Route Budget is 235.7 Wh.
- The route consumes ~36 Wh, leaving >240 Wh. The shortest feasible candidate along the Lanka corridor is marked with **"★ Recommended: Shortest Feasible Among Candidates"**.

### Minute 1:00–2:00: Integrated Physics Engine (Elevation & Weather)
- Show how the map overlays Copernicus GLO-90 DEM elevation profile with cumulative climb (+$14$m).
- Show the **Weather Widget**: Open-Meteo live wind vector calculates relative headwind drag factor ($\times 1.08$).
- Open the **"Inspect Transparent Physics Equation"** modal to show the judges the step-by-step breakdown.

### Minute 2:00–3:00: Infeasible Trigger & Reachable Charger Divert
- Click **"2. Sarnath Fallback"** (Scenario 2: IIT BHU Campus to Sarnath, 14.2 km).
- Battery is degraded: SOH = 66%, SOC = 20%. Usable energy = 55.0 Wh, Budget = 46.8 Wh.
- Route requires 152.4 Wh, triggering a **critical red deficit alert** (exceeds budget by >105 Wh!).
- Show the automatic safety recommendation: "Reachable fallback: Sigra Smart EV Hub or Lanka EV Point".
- Click **"Divert Trip to Station"** or open the **Campus EV Hubs Modal**: the route immediately reroutes to the reachable charging point.
- Finish by clicking **"Validation"** to display Dublin DualEMobility benchmark error metrics and load simulated IIT BHU ride logs!

---

## 6. Honest Accuracy Statement & Transparency Matrix

In accordance with hackathon integrity guidelines:

### 1. Live Data Sources
- **OpenStreetMap Tiles**: Live worldwide cycleway map rendering.
- **OSRM Bicycle Engine**: Live bicycle routing network calculations.
- **Open-Meteo Forecast API**: Live ambient temperature, wind speed, direction, and precipitation.
- **Copernicus GLO-90 DEM**: Live 90m resolution terrain elevation grid via Open-Meteo.

### 2. Demo / Simulated Data Sources
- **Charging Stations Availability**: Physical locations represent real hubs in the corridor, but live occupancy/status is unlinked to an OCPI server. Labeled as **"Unverified / Demo Status"**.
- **Downhill Regeneration**: Safely uncredited (assumed zero for conservative safety).

### 3. What Still Needs Actual Bike BMS Measurements
- Direct Bluetooth / CAN-bus hardware connection to the bike's battery management system (BMS).
- Empirical Wh/km calibration on Indian road surfaces and local traffic speed profiles.
- Validated DualEMobility dataset was measured in **Dublin, Ireland**; it is used as an empirical benchmark but does **not** validate local Varanasi road conditions.
