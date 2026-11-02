---
title: "Industrial Panel AC Error Code Dictionary: Rittal, Advance Cooling & CNC Cabinet Coolers"
description: "Industrial Panel AC Error Code Dictionary: Rittal, Advance Cooling & CNC Cabinet Coolers — root causes, multimeter test values (Cabinet setpoint..."
brand: "Industrial Panel AC"
date: 2026-02-27
---

## Overview: What Does `A01–A18 / HP / LP` Mean on Industrial Panel AC Systems?

When your **Industrial Panel AC** unit stops cooling and flashes **`A01–A18 / HP / LP`** on the indoor display (or blinks the diagnostic LED), the onboard microcontroller has triggered an active protection lockout due to: **Complete alarm reference for Rittal Blue e / TopTherm (A01–A18), Advance Cooling, and Pfannenberg enclosure air conditioners**.

In Gujarat's extreme 43°C–46°C summer ambient temperatures and monsoon grid voltage swings (180V–265V), ignoring a `A01–A18 / HP / LP` alarm or repeatedly flipping the MCB breaker can escalate a minor sensor or signal fault into permanent compressor or Intelligent Power Module (IPM) damage.

| Diagnostic Parameter | Engineering Specification |
| :--- | :--- |
| **Equipment Make** | Industrial Panel AC Residential / Commercial HVAC |
| **Fault / Alarm Code** | `A01–A18 / HP / LP` |
| **Primary Trigger** | Complete alarm reference for Rittal Blue e / TopTherm (A01–A18), Advance Cooling, and Pfannenberg enclosure air conditioners |
| **Bench / Field Test Spec** | Cabinet setpoint 32°C–35°C; condenser airflow unimpeded by CNC oil mist; R134a high-side <210 PSI |
| **Typical Vadodara Repair Cost** | **₹1,500 – ₹5,500** *(90-Day Written Warranty)* |
| **On-Site Turnaround** | 60 – 90 Minutes (Single Visit in 90%+ Cases) |

---

## Primary Root Causes Behind `A01–A18 / HP / LP`

1. **Component Drift or Circuit Fault:** Complete alarm reference for Rittal Blue e / TopTherm (A01–A18), Advance Cooling, and Pfannenberg enclosure air conditioners. Thermal cycling, moisture condensation inside the indoor wiring trough, or high-voltage spikes on MGVCL/GIDC feeders degrade sensitive SMD electronics and NTC thermistors.
2. **Airflow & Heat Rejection Stress:** Blocked indoor return filters, matted blower wheels, or dust-impacted outdoor condenser fins push operating pressures and electronics temperatures past factory safety thresholds.
3. **Wiring, Flare & Connector Oxidation:** Loose spade lugs, unshielded wire splices between indoor and outdoor units, carbonized terminal blocks, or micro-leaks at brass flare nuts frequently trigger intermittent `A01–A18 / HP / LP` lockouts during peak afternoon load.
4. **Power Supply Instability:** Weak run capacitors, failing stabilizer relays, or degraded SMPS filter capacitors cause DC bus ripple and microcontroller communication drops.

---

## Safe Homeowner / Facility Checks Before Calling an Engineer

1. **Perform One Clean Hard Reset:** Switch off the dedicated AC MCB breaker for **5 full minutes** to discharge the high-voltage DC bus capacitors on the inverter board, then restore power once. *Do not power-cycle repeatedly if `A01–A18 / HP / LP` returns.*
2. **Inspect Air Filters & Outdoor Clearance:** Wash clogged indoor nylon mesh filters and confirm nothing (pigeons, plastic sheets, exhaust heat) is obstructing the outdoor condensing unit fan.
3. **Check Stabilizer Voltage Readout:** Ensure input/output voltage remains between **205V and 245V AC**. Severe low voltage under afternoon load forces protection trips.

---

## Atlas Aircon Engineering Rectification Protocol

Unlike unauthorized roadside mechanics who guess parts by trial-and-error or demand ₹8,000–₹14,000 full PCB replacements, Atlas Aircon field engineers carry calibrated digital multimeters, capacitance/ESR meters, nitrogen pressure rigs, and two-stage vacuum pumps:

* **Precision Instrument Diagnosis:** We verify exact electrical and refrigeration benchmarks on-site — *Cabinet setpoint 32°C–35°C; condenser airflow unimpeded by CNC oil mist; R134a high-side <210 PSI*.
* **Targeted Technical Fix:** Decode exact controller alarm (A01 High Pressure, A02 Frost/Evap, A05 Condenser Fan, A07 Leakage/Cooling Loss), degrease oil-fouled fins, test HP/LP switches, and restore VFD cabinet cooling.
* **Component-Level PCB Micro-Soldering:** When an indoor or outdoor inverter board suffers surge damage, our Vadodara electronics lab repairs the exact optocouplers, switching ICs, shunt resistors, or IPM stage at **60%–70% lower cost** than full board replacement.
* **Load Verification & Warranty:** Every completed `A01–A18 / HP / LP` repair is load-tested for 20 minutes checking compressor amperage, grill supply Delta-T (14°C–18°C drop), and error-free continuous operation, backed by our **90-day service warranty**.

---

## Frequently Asked Questions

### Is it safe to keep running the AC when `A01–A18 / HP / LP` appears intermittently?
No. Safety lockouts exist to protect the rotary/scroll compressor and inverter power module. Running a unit with low refrigerant, sensor drift, or unstable voltage risks burning compressor windings.

### How much does `Industrial Panel AC` `A01–A18 / HP / LP` repair cost in Vadodara?
Depending on whether the fault lies in a thermistor/wiring repair, gas leak rectification, or inverter PCB micro-repair, total cost typically ranges from **₹1,500 – ₹5,500**. Our engineer provides an upfront quote after on-site inspection before starting work.
