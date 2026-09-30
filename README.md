# ⚖️ VerifyMetro — Digital Legal Metrology & GIS Enforcement System

> **A Next-Generation Cloud Platform for Legal Metrology Governance, Automated Rule 14 Verification, Tamper-Evident QR Stamping & GIS-Powered Market Enforcement.**

[![Standard](https://img.shields.io/badge/Statutory%20Standard-Legal%20Metrology%20Act%202009-blue.svg)](https://consumeraffairs.nic.in)
[![Rules](https://img.shields.io/badge/Compliance-Rule%2014%20(General%20Rules%202011)-0284c7.svg)](#)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Tailwind%20CSS-61dafb.svg)](#)
[![GIS](https://img.shields.io/badge/Maps%20%26%20GIS-Leaflet%20%7C%20OpenStreetMap-16a34a.svg)](#)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL%20(Cloud%20%2B%20Offline)-3ecf8e.svg)](#)

---

## 📺 Project Video Demonstration

A full **7-minute end-to-end narrated video demonstration** walks through every screen, role, and workflow in the platform:


▶️ Click the link below to watch the Project Demonstration Video:

   <https://drive.google.com/file/d/1tP5ZLhBb9d6xxoCV2Tb-uPLVv_6YodtQ/view?usp=sharing>
   
   Follow along with the timestamp guide below to explore each role!


### ⏱️ Video Timestamp Navigation

| Timestamp | Phase / Role | Feature Demonstrated |
| :--- | :--- | :--- |
| `00:00 - 00:54` | 🏛️ **The Problem & Vision** | Real-world scale fraud, paper register vulnerabilities, and VerifyMetro solution introduction |
| `00:55 - 01:26` | 👥 **Multi-Role Architecture** | 1-Click instant demo persona switcher (Applicant, LMO, GATC Lab, Administrator, Public) |
| `01:27 - 03:10` | 🏢 **Instrument Owner Workflow** | Compliance dashboard, 30-day alerts, onboarding scale with 1-click GPS capture, asset list, and printable Rule 14 certificates |
| `03:11 - 04:23` | 👮 **LMO Verification & Stamping** | Queue triage, scheduling, on-site Rule 14 checklist, load testing (0–100%), MPE error calculation, and digital seal stamping |
| `04:24 - 05:14` | 🗺️ **GIS Map & Raid Dispatch** | PIN 110001 surveillance, 5 km radius slider, non-compliant bullion balance discovery, and unannounced raid dispatch |
| `05:15 - 06:00` | 🔬 **GATC Test Lab Workflow** | Moisture analyzer lab-grade calibration, environmental testing, NPL traceability, and test report generation |
| `06:01 - 06:36` | 📊 **State Directorate Admin** | Statewide analytics, pass rates, workflow distribution, master register, and user/officer directory management |
| `06:37 - 07:15` | 🔍 **Public Verification Portal** | Mobile QR code scanning, instant authentic certificate check, merchant metadata, and consumer fraud protection |

---

## 🌟 Why VerifyMetro?

Every day, millions of citizens rely on commercial weighing scales, fuel dispensers, weighbridges, and taxi meters. Under the **Legal Metrology Act, 2009**, every commercial measuring instrument must be verified and stamped.

Traditionally, this process suffered from:
- ❌ **Forged Paper Certificates:** Paper stamping records are easily duplicated or altered.
- ❌ **Consumer Short-Weighing:** Expired or tampered machines go unnoticed for months.
- ❌ **Enforcement Blind Spots:** Field inspectors have no spatial awareness of non-compliant shops in their territory.

**VerifyMetro solves this end-to-end** by uniting all stakeholders on a single, synchronized platform backed by geospatial intelligence and cryptographic QR verification.

---

## 👥 Five Primary Stakeholder Roles

```
┌──────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│   Public Users   │    │  Commercial Owner  │    │  Field Inspector   │
│   (Consumers)    │    │    (Applicant)     │    │    (Gazetted LMO)  │
└────────┬─────────┘    └─────────┬──────────┘    └─────────┬──────────┘
         │                        │                         │
         ▼                        ▼                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   VERIFYMETRO CORE PLATFORM ENGINE                   │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
       ┌────────────────────┐          ┌────────────────────┐
       │   GATC Test Lab    │          │  State Controller  │
       │  (Precision NABL)  │          │  (System Admin)    │
       └────────────────────┘          └────────────────────┘
```

### 1. 🔍 Public & Consumers *(Zero Login Required)*
* **QR Certificate Scanner (`/verify/:id`):** Point any smartphone camera at a scale's QR code to verify its legal validity in seconds.
* **Tamper-Evident Seal Authenticator:** Cross-checks the physical lead/wire seal tag (`SEAL-LM-XXXX`) with the state database.
* **Consumer Protection:** View merchant name, installation address, machine accuracy class, and expiration countdown.

### 2. 🏢 Business & Instrument Owners *(Traders, Jewelers, Logistics)*
* **Compliance Dashboard (`/applicant`):** Color-coded alerts for active units, 30-day renewal warnings, and Section 24 penalty notices.
* **1-Click GPS Onboarding:** Automatically captures decimal Latitude and Longitude via device hardware sensors with accuracy feedback.
* **Asset Registry (`/instruments`):** Searchable machine directory with GPS tags and a 1-click **"Apply for Re-Verification"** shortcut.
* **Digital Certificates (`/certificates`):** Download and print official Rule 14 certificates with state watermarks and fee receipts.

### 3. 👮 Legal Metrology Officers *(LMO / Field Inspectors)*
* **Command Center (`/officer`):** Real-time monitoring of daily inspection quotas and statutory 48-hour SLAs under Rule 14.
* **Verification Queue (`/queue`):** Triage incoming verification requests and schedule on-site visits.
* **Rule 14 Verification Modal:** Guided 4-point inspection checklist (visual checks, seal integrity, load point testing at 0%, 25%, 50%, and 100%).
* **Automated MPE Tolerance Engine:** Validates recorded errors against legal tolerance limits (e.g., $\pm 0.002\text{ kg}$ vs allowed $\pm 0.005\text{ kg}$) for immediate Pass/Fail determination.
* **GIS Raid Enforcement Map (`/gis-map`):** Filter by PIN code (e.g. `110001` Connaught Place) and radius slider ($1 - 50\text{ km}$) to spot overdue machines in red and dispatch unannounced raids.

### 4. 🔬 GATC Test Center Staff *(NABL Precision Labs)*
* **Specialized Calibration Queue:** Handles Class I analytical balances, grain moisture analyzers, and bulk standards.
* **Environmental Chamber Logging:** Records ambient temperature ($20^\circ\text{C} \pm 0.5^\circ\text{C}$) and relative humidity ($50\% \pm 5\%$).
* **NPL Standards Traceability:** References primary national standards from the National Physical Laboratory (NPL India).
* **Calibration Test Reports:** Evaluates expanded measurement uncertainty ($U, k=2$) before certifying.

### 5. 🏛️ System Administrator *(State Directorate / Controllers)*
* **Statewide Analytics Dashboard (`/admin`):** Tracks total registered assets, statewide pass rates, fee revenues, and district backlogs.
* **Inspector Performance Radar:** Analyzes officer turnaround times (TAT) and raid resolution rates.
* **User & Jurisdiction Management (`/users`):** Allocates regional boundaries and manages accounts across all roles.
* **Immutable Audit Trail (`/audit-logs`):** Tamper-evident ledger logging every certificate, seal update, timestamp, and IP trace.
* **Cloud Database Control:** Live Supabase PostgreSQL synchronization monitor with offline local fallback.

---

## 🚀 Complete Step-by-Step Demonstration Walkthrough

Follow these steps in the running application to experience every feature firsthand:

### Phase 1: Instrument Owner Workflow
1. **Switch Role:** Use the top bar switcher to select **"Applicant — Ramesh Patel"**.
2. **Review Dashboard:** Notice the compliance counters and the statutory Section 24 warning banner.
3. **Register an Instrument:**
   - Click **"+ Register Instrument & Apply"**.
   - Select **"New Instrument Onboarding"**.
   - Input: Make: `Essae-Teraoka`, Model: `DS-215`, Serial: `ESS-2026-9941`, Capacity: `30 kg, e = 5 g`, Accuracy: `Class III`.
   - In Physical Address, enter PIN `110001` and click **"📍 Use My Current Location"** to capture exact GPS coordinates.
   - Attach serial plate photo and click **"Submit Application"** (generates application `APP-2026-013`).
4. **Inspect Asset List:** Open **"Instruments"** in the sidebar. See the new scale with its green GPS coordinate badge.
5. **Print Certificate:** Open **"Certificates"**, click on an active certificate, view the QR code and fee receipt, and click **"Print / Save PDF"**.

### Phase 2: Legal Metrology Officer (LMO) Workflow
6. **Switch Role:** Select **"Govt Officer (LMO) — S. K. Sharma"**.
7. **Schedule Inspection:** Open **"Verification Queue"**, find the newly submitted application, click **"Accept & Schedule"**, and pick a date.
8. **Conduct On-Site Testing:**
   - Click **"Record Inspection"**.
   - Complete the Rule 14 verification checklist (Visual check, Seal integrity, Load points 0–100%).
   - Observe recorded error (`+0.002 kg` inside legal `±0.005 kg` limit).
   - Enter lead seal tag `SEAL-DL-2026-8812` and fee receipt `REC-2026-9921`.
   - Click **"PASS (Issue Digital Certificate)"** — instantly generates a live QR-coded certificate.
9. **GIS Radius Enforcement & Raid Planning:**
   - Navigate to **"GIS Enforcement & Raids"** (`/gis-map`).
   - Enter PIN Code: **`110001`** and adjust the slider to **`5 km`**. Filter by **"Expired Only"**.
   - Click the red marker for *Chawla Bullion & Gems Jewellers* (Mettler balance expired by 560+ days).
   - Click **"Plan Raid / Notice"** in the drawer to schedule an unannounced enforcement raid under Section 24.

### Phase 3: GATC Laboratory Calibration Workflow
10. **Switch Role:** Select **"GATC Test Lab — Dr. Ananya Sen"**.
11. **Perform Lab Verification:**
    - Open the lab queue and select the *Dickey-John Grain Moisture Analyzer*.
    - Fill in environmental chamber conditions, test load tolerances, and click **"PASS (Issue Digital Certificate)"**.

### Phase 4: State Directorate Administration & Public Verification
12. **Switch Role:** Select **"Administrator — V. Joshi"**.
13. **Directorate Oversight:** View statewide metrics, pass rates (100%), workflow status distribution, and user directories.
14. **Public QR Verification:** Open the **"Public Verification Portal"** (`/verify/IND-LM-2025-0482`) to see the instant consumer verification banner.

---

## 🗺️ Tech Stack & Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Core** | React 19, TypeScript, Vite, React Router v7 |
| **Styling & Motion** | Tailwind CSS v4, Motion, Lucide React Icons |
| **Mapping & GIS** | Leaflet.js (`v1.9.4`), OpenStreetMap Tiles, Haversine Spherical Distance Formula, HTML5 Geolocation API |
| **Database & Cloud** | Supabase Cloud PostgreSQL, Real-time Channels, Offline-First Local Storage Fallback |
| **Verification & Crypto** | `qrcode.react` (Cryptographic QR verification), SHA-256 seal tag hashes |
| **Charts & Analytics** | Recharts (Statewide metrological performance analytics) |

---

## 💻 Local Setup & Execution

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **bun**

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/verifymetro.git
cd verifymetro

# 2. Install dependencies
npm install

# 3. Configure environment variables (Optional - connects to Supabase)
cp .env.example .env

# 4. Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📜 Statutory Legal Framework

VerifyMetro is built in strict adherence to:
- **The Legal Metrology Act, 2009 (Act No. 1 of 2010)** — Sections 15, 24, 25, and 30.
- **The Legal Metrology (General) Rules, 2011** — Rule 14 (Verification & Stamping Procedure), Eighth Schedule (Maximum Permissible Errors), and Tenth Schedule (Certificate of Verification Format).
- **OIML International Standards** — OIML R-76 (Non-automatic weighing instruments) and OIML R-117 (Fuel dispensers).

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use and adapt it for digital governance and public trust initiatives.
