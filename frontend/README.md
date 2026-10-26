# GeneaTrace — DPP & Industrial Traceability Platform

GeneaTrace is an enterprise-grade unified **ERP + MES + SCADA** manufacturing traceability and Digital Product Passport (DPP) platform built for hackathon demonstration.

## Features & Modules

### 1. Dashboard (Manufacturing Command Center)
- Real-time KPI strip (ERP Orders, MES Work Orders, SCADA Readings, Merkle DAG Nodes, Recall Alerts).
- Independent quick-access cards for ERP, MES, and SCADA systems.
- 3-Tier Entity Resolver confidence breakdown (Exact, Fuzzy, Semantic).
- Live audit log and system activity feed.

### 2. ERP System (Enterprise Resource Planning — Amber)
- **Purchase Orders:** Filterable table with PO number, vendor, material, quantity, status, and entity resolution confidence chip.
- **Raw Material Batches:** Batch tracking with lot numbers, received dates, QC status, and Merkle hash seals.
- **Approved Suppliers:** Vendor rating cards, active batches, and total order volume (Tata Steel, Hindalco, JSW, etc.).
- **Goods Receipt Notes (GRN):** Dock receipt verification and warehouse inspection logs.

### 3. MES System (Manufacturing Execution System — Emerald)
- **Work Orders:** Active machining jobs, associated raw material batches, assigned machines, operator, and status.
- **Operations Log:** Granular operation logs (rough turning, gear hobbing, drilling) with cycle durations and pass/fail states.
- **Rework & Defects:** Detailed non-conformance tracking with root cause analysis and corrective action recommendations.
- **OEE Metrics:** Real-time Overall Equipment Effectiveness donut gauges with Availability, Performance, and Quality breakdowns.

### 4. SCADA Telemetry (Supervisory Control & Data Acquisition — Violet)
- **Live Monitor:** 8+ telemetry parameter cards (Furnace Temp, Hydraulic Pressure, Spindle Vibration, Coolant Flow, etc.) updating live every 2 seconds.
- **Alarm Management:** Active alarm stack with severity indicators (Warning, Alarm, Nominal).
- **Sensor History:** Canvas-rendered real-time sparklines for process drift detection.
- **Machine Fleet:** Machine status tiles (CNC Turning, Lathe, Vertical Mill, Gear Hobber, Grinder).

### 5. Merkle-DAG Lineage Graph (Sky Blue)
- Interactive HTML5 Canvas graph visualising cryptographically-linked product provenance from Raw Material -> MES Ops -> Sub-Assembly -> Finished Good.
- Node inspection panel displaying node metadata, parent hashes, timestamps, and witness signatures.
- One-click Merkle hash verification for tamper detection.

### 6. Recall Blast-Radius Engine (Red)
- Defect injection simulator with configurable unit scrap values.
- Sub-100ms BFS graph traversal identifying exact affected finished products.
- Side-by-side **Blanket vs. Precision Recall** cost comparison bar charts showing millions saved in INR.
- Actionable quarantined inventory list with one-click quarantine dispatch.

### 7. Digital Product Passport (DPP)
- Searchable product passport viewer (`FG-SN-2024-00841`).
- Multi-tier provenance sections covering ERP, MES, SCADA, and Lineage integrity.
- Cryptographic verification badge and PDF export support.

## How to Run

Simply open `frontend/index.html` in any modern web browser:
```
file:///path/to/SRM-TRP/frontend/index.html
```
Or serve via any static file server (e.g. `npx serve frontend` or VS Code Live Server).
