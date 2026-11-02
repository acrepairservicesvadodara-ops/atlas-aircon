---
title: "Daikin AC Error Code E4: Low-Pressure Switch Actuation"
description: "Daikin AC Error Code E4: Low-Pressure Switch Actuation — root causes, multimeter test values (Continuity across S1PH/LPS switch above 45 PSI),..."
brand: "Daikin"
date: 2026-01-12
---

## Overview: What Does `E4` Mean on Daikin Systems?

When your **Daikin** unit stops cooling and flashes **`E4`** on the indoor display (or blinks the diagnostic LED), the onboard microcontroller has triggered an active protection lockout due to: **Suction line pressure dropped below safety cutout threshold on commercial/VRV/sky-air or split unit**.

In Gujarat's extreme 43°C–46°C summer ambient temperatures and monsoon grid voltage swings (180V–265V), ignoring a `E4` alarm or repeatedly flipping the MCB breaker can escalate a minor sensor or signal fault into permanent compressor or Intelligent Power Module (IPM) damage.

| Diagnostic Parameter | Engineering Specification |
| :--- | :--- |
| **Equipment Make** | Daikin Residential / Commercial HVAC |
| **Fault / Alarm Code** | `E4` |
| **Primary Trigger** | Suction line pressure dropped below safety cutout threshold on commercial/VRV/sky-air or split unit |
| **Bench / Field Test Spec** | Continuity across S1PH/LPS switch above 45 PSI; EEV coil ~46 Ω per winding |
| **Typical Vadodara Repair Cost** | **₹1,800 – ₹3,800** *(90-Day Written Warranty)* |
| **On-Site Turnaround** | 60 – 90 Minutes (Single Visit in 90%+ Cases) |

---

## Primary Root Causes Behind `E4`

1. **Component Drift or Circuit Fault:** Suction line pressure dropped below safety cutout threshold on commercial/VRV/sky-air or split unit. Thermal cycling, moisture condensation inside the indoor wiring trough, or high-voltage spikes on MGVCL/GIDC feeders degrade sensitive SMD electronics and NTC thermistors.
2. **Airflow & Heat Rejection Stress:** Blocked indoor return filters, matted blower wheels, or dust-impacted outdoor condenser fins push operating pressures and electronics temperatures past factory safety thresholds.
3. **Wiring, Flare & Connector Oxidation:** Loose spade lugs, unshielded wire splices between indoor and outdoor units, carbonized terminal blocks, or micro-leaks at brass flare nuts frequently trigger intermittent `E4` lockouts during peak afternoon load.
4. **Power Supply Instability:** Weak run capacitors, failing stabilizer relays, or degraded SMPS filter capacitors cause DC bus ripple and microcontroller communication drops.

---

## Safe Homeowner / Facility Checks Before Calling an Engineer

1. **Perform One Clean Hard Reset:** Switch off the dedicated AC MCB breaker for **5 full minutes** to discharge the high-voltage DC bus capacitors on the inverter board, then restore power once. *Do not power-cycle repeatedly if `E4` returns.*
2. **Inspect Air Filters & Outdoor Clearance:** Wash clogged indoor nylon mesh filters and confirm nothing (pigeons, plastic sheets, exhaust heat) is obstructing the outdoor condensing unit fan.
3. **Check Stabilizer Voltage Readout:** Ensure input/output voltage remains between **205V and 245V AC**. Severe low voltage under afternoon load forces protection trips.

---

## Atlas Aircon Engineering Rectification Protocol

Unlike unauthorized roadside mechanics who guess parts by trial-and-error or demand ₹8,000–₹14,000 full PCB replacements, Atlas Aircon field engineers carry calibrated digital multimeters, capacitance/ESR meters, nitrogen pressure rigs, and two-stage vacuum pumps:

* **Precision Instrument Diagnosis:** We verify exact electrical and refrigeration benchmarks on-site — *Continuity across S1PH/LPS switch above 45 PSI; EEV coil ~46 Ω per winding*.
* **Targeted Technical Fix:** Check service stop valves are fully open, inspect filter-drier for frost restriction, test EEV 6-pin stepper motor windings, locate refrigerant leak with nitrogen, and restore weighed gas charge.
* **Component-Level PCB Micro-Soldering:** When an indoor or outdoor inverter board suffers surge damage, our Vadodara electronics lab repairs the exact optocouplers, switching ICs, shunt resistors, or IPM stage at **60%–70% lower cost** than full board replacement.
* **Load Verification & Warranty:** Every completed `E4` repair is load-tested for 20 minutes checking compressor amperage, grill supply Delta-T (14°C–18°C drop), and error-free continuous operation, backed by our **90-day service warranty**.

---

## Frequently Asked Questions

### Is it safe to keep running the AC when `E4` appears intermittently?
No. Safety lockouts exist to protect the rotary/scroll compressor and inverter power module. Running a unit with low refrigerant, sensor drift, or unstable voltage risks burning compressor windings.

### How much does `Daikin` `E4` repair cost in Vadodara?
Depending on whether the fault lies in a thermistor/wiring repair, gas leak rectification, or inverter PCB micro-repair, total cost typically ranges from **₹1,800 – ₹3,800**. Our engineer provides an upfront quote after on-site inspection before starting work.
